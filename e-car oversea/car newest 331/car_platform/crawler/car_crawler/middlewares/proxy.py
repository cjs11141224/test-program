"""
代理IP中间件
实现IP池管理、代理轮换、代理健康检查等功能
"""
import random
import time
import json
import logging
import requests
from typing import Optional, Dict, List
from urllib.parse import urlparse
from scrapy import signals
from scrapy.http import Request
from scrapy.exceptions import IgnoreRequest

logger = logging.getLogger(__name__)


class Proxy:
    """代理IP类"""
    def __init__(self, ip: str, port: int, protocol: str = 'http', 
                 username: str = None, password: str = None,
                 country: str = None, region: str = None):
        self.ip = ip
        self.port = port
        self.protocol = protocol.lower()
        self.username = username
        self.password = password
        self.country = country
        self.region = region
        self.fail_count = 0
        self.success_count = 0
        self.last_used = 0
        self.response_time = 0
        self.is_active = True
    
    @property
    def url(self) -> str:
        """获取代理URL"""
        if self.username and self.password:
            return f"{self.protocol}://{self.username}:{self.password}@{self.ip}:{self.port}"
        return f"{self.protocol}://{self.ip}:{self.port}"
    
    @property
    def host(self) -> str:
        """获取代理主机"""
        return f"{self.ip}:{self.port}"
    
    def record_success(self, response_time: float):
        """记录成功请求"""
        self.success_count += 1
        self.fail_count = 0
        self.last_used = time.time()
        self.response_time = response_time
        self.is_active = True
    
    def record_failure(self):
        """记录失败请求"""
        self.fail_count += 1
        self.last_used = time.time()
        # 连续失败3次则标记为不可用
        if self.fail_count >= 3:
            self.is_active = False
            logger.warning(f"Proxy {self.host} marked as inactive after {self.fail_count} failures")
    
    def __repr__(self):
        return f"Proxy({self.host}, active={self.is_active}, success={self.success_count}, fail={self.fail_count})"


class ProxyPool:
    """代理IP池管理器"""
    
    def __init__(self, size: int = 50):
        self.size = size
        self.proxies: List[Proxy] = []
        self.api_url: Optional[str] = None
        self.last_refresh = 0
        self.refresh_interval = 300  # 5分钟刷新一次
        
    def set_api_url(self, url: str):
        """设置代理API接口"""
        self.api_url = url
        
    def add_proxy(self, proxy: Proxy):
        """添加代理"""
        if len(self.proxies) < self.size:
            self.proxies.append(proxy)
            
    def add_proxies_from_list(self, proxy_list: List[Dict]):
        """从列表批量添加代理"""
        for p in proxy_list:
            try:
                proxy = Proxy(
                    ip=p.get('ip'),
                    port=p.get('port'),
                    protocol=p.get('protocol', 'http'),
                    username=p.get('username'),
                    password=p.get('password'),
                    country=p.get('country'),
                    region=p.get('region')
                )
                self.add_proxy(proxy)
            except Exception as e:
                logger.error(f"Failed to add proxy: {e}")
                
    def fetch_from_api(self) -> bool:
        """从API获取代理"""
        if not self.api_url:
            return False
            
        try:
            response = requests.get(self.api_url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get('code') == 0 or data.get('success'):
                    proxy_list = data.get('data', [])
                    self.add_proxies_from_list(proxy_list)
                    self.last_refresh = time.time()
                    logger.info(f"Fetched {len(proxy_list)} proxies from API")
                    return True
        except Exception as e:
            logger.error(f"Failed to fetch proxies from API: {e}")
        return False
    
    def get_proxy(self, protocol: str = None) -> Optional[Proxy]:
        """获取一个可用代理"""
        # 检查是否需要刷新
        if time.time() - self.last_refresh > self.refresh_interval:
            self.fetch_from_api()
            
        # 筛选可用代理
        available = [p for p in self.proxies if p.is_active]
        if protocol:
            available = [p for p in available if p.protocol == protocol]
            
        if not available:
            # 如果没有可用代理，尝试重新激活部分代理
            inactive = [p for p in self.proxies if not p.is_active]
            if inactive:
                for p in inactive[:5]:  # 重新激活前5个
                    p.is_active = True
                    p.fail_count = 0
                available = [p for p in self.proxies if p.is_active]
            else:
                return None
                
        # 优先选择响应时间短的代理
        available.sort(key=lambda p: (p.response_time if p.response_time > 0 else 9999, -p.success_count))
        return available[0] if available else None
    
    def get_random_proxy(self) -> Optional[Proxy]:
        """随机获取代理"""
        available = [p for p in self.proxies if p.is_active]
        return random.choice(available) if available else None
    
    def remove_proxy(self, proxy: Proxy):
        """移除代理"""
        if proxy in self.proxies:
            self.proxies.remove(proxy)
            
    def get_stats(self) -> Dict:
        """获取代理池统计"""
        total = len(self.proxies)
        active = len([p for p in self.proxies if p.is_active])
        return {
            'total': total,
            'active': active,
            'inactive': total - active,
            'success_rate': sum(p.success_count for p in self.proxies),
            'fail_rate': sum(p.fail_count for p in self.proxies),
        }


class ProxyMiddleware:
    """Scrapy代理中间件"""
    
    def __init__(self, settings):
        self.enabled = settings.getbool('PROXY_ENABLED', True)
        self.api_url = settings.get('PROXY_API_URL', '')
        self.pool_size = settings.getint('PROXY_POOL_SIZE', 50)
        self.refresh_interval = settings.getint('PROXY_REFRESH_INTERVAL', 300)
        
        self.proxy_pool = ProxyPool(size=self.pool_size)
        self.proxy_pool.set_api_url(self.api_url)
        self.proxy_pool.refresh_interval = self.refresh_interval
        
        # 内置免费代理（作为备用）
        self._init_backup_proxies()
        
    def _init_backup_proxies(self):
        """初始化备用代理"""
        # 这里可以添加一些免费代理作为备用
        # 实际生产环境建议使用付费代理服务
        backup_proxies = []
        self.proxy_pool.add_proxies_from_list(backup_proxies)
        
    @classmethod
    def from_crawler(cls, crawler):
        middleware = cls(crawler.settings)
        crawler.signals.connect(middleware.spider_opened, signal=signals.spider_opened)
        return middleware
    
    def spider_opened(self, spider):
        """爬虫启动时初始化代理池"""
        if self.enabled:
            logger.info(f"Initializing proxy pool for spider: {spider.name}")
            self.proxy_pool.fetch_from_api()
            stats = self.proxy_pool.get_stats()
            logger.info(f"Proxy pool stats: {stats}")
    
    def process_request(self, request: Request, spider):
        """处理请求，设置代理"""
        if not self.enabled:
            return None
            
        # 如果请求已设置代理，跳过
        if request.meta.get('proxy'):
            return None
            
        # 获取代理
        proxy = self.proxy_pool.get_proxy()
        if proxy:
            request.meta['proxy'] = proxy.url
            request.meta['_proxy_obj'] = proxy
            logger.debug(f"Using proxy {proxy.host} for {request.url}")
        else:
            logger.warning("No available proxy, using direct connection")
            
        return None
    
    def process_response(self, request: Request, response, spider):
        """处理响应"""
        proxy = request.meta.get('_proxy_obj')
        
        if proxy:
            # 检查响应状态
            if response.status == 403 or response.status == 429:
                # IP被封或请求太频繁
                proxy.record_failure()
                logger.warning(f"Proxy {proxy.host} got status {response.status}")
                # 重试请求
                return self._retry_request(request, spider, f"status {response.status}")
            else:
                # 记录成功
                proxy.record_success(0)
                
        return response
    
    def process_exception(self, request: Request, exception, spider):
        """处理异常"""
        proxy = request.meta.get('_proxy_obj')
        
        if proxy:
            proxy.record_failure()
            logger.warning(f"Proxy {proxy.host} failed: {exception}")
            
            # 移除失效代理
            if not proxy.is_active:
                self.proxy_pool.remove_proxy(proxy)
                
            # 重试请求
            return self._retry_request(request, spider, str(exception))
            
        return None
    
    def _retry_request(self, request: Request, spider, reason: str):
        """重试请求"""
        retry_times = request.meta.get('retry_times', 0)
        max_retry = 3
        
        if retry_times < max_retry:
            retry_times += 1
            request.meta['retry_times'] = retry_times
            request.meta['proxy'] = None  # 清除代理，让中间件重新选择
            request.meta['_proxy_obj'] = None
            
            logger.info(f"Retrying {request.url} (attempt {retry_times}/{max_retry}) due to {reason}")
            return request
        else:
            logger.error(f"Max retries reached for {request.url}")
            raise IgnoreRequest(f"Max retries reached: {reason}")


# 免费代理获取工具类
class FreeProxyFetcher:
    """免费代理获取器（用于测试）"""
    
    PROXY_APIS = [
        # 这里可以添加免费代理API
        # 注意：免费代理通常不稳定，生产环境建议使用付费服务
    ]
    
    @classmethod
    def fetch_proxies(cls) -> List[Dict]:
        """获取免费代理列表"""
        proxies = []
        for api in cls.PROXY_APIS:
            try:
                response = requests.get(api, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list):
                        proxies.extend(data)
                    elif isinstance(data, dict) and 'data' in data:
                        proxies.extend(data['data'])
            except Exception as e:
                logger.error(f"Failed to fetch from {api}: {e}")
        return proxies
