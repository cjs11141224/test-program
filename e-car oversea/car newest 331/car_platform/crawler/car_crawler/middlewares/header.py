"""
自定义请求头中间件
实现请求头的动态设置和伪装
"""
import random
import logging
from scrapy import signals

logger = logging.getLogger(__name__)


class CustomHeaderMiddleware:
    """
    自定义请求头中间件
    根据目标网站动态设置请求头，模拟真实浏览器行为
    """
    
    # 目标网站特定的请求头配置
    SITE_HEADERS = {
        'autohome.com.cn': {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Cache-Control': 'max-age=0',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
        },
        'dongchedi.com': {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
        },
        'yiche.com': {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Cache-Control': 'max-age=0',
            'Connection': 'keep-alive',
        },
        'pcauto.com.cn': {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
        },
    }
    
    # 推荐来源列表
    REFERERS = [
        'https://www.google.com/',
        'https://www.bing.com/',
        'https://www.baidu.com/',
        'https://www.sogou.com/',
        'https://www.so.com/',
        'https://www.autohome.com.cn/',
        'https://www.dongchedi.com/',
        'https://www.yiche.com/',
    ]
    
    def __init__(self, settings):
        self.settings = settings
        self.enabled = settings.getbool('CUSTOM_HEADER_ENABLED', True)
        self.add_referer = settings.getbool('ADD_REFERER', True)
        self.random_referer = settings.getbool('RANDOM_REFERER', True)
        
    @classmethod
    def from_crawler(cls, crawler):
        middleware = cls(crawler.settings)
        crawler.signals.connect(middleware.spider_opened, signal=signals.spider_opened)
        return middleware
    
    def spider_opened(self, spider):
        """爬虫启动时的处理"""
        if self.enabled:
            logger.info(f"CustomHeaderMiddleware enabled for spider: {spider.name}")
    
    def process_request(self, request, spider):
        """处理请求，设置自定义请求头"""
        if not self.enabled:
            return None
        
        url = request.url
        
        # 根据目标网站设置特定请求头
        self._set_site_specific_headers(request, url)
        
        # 设置Referer
        if self.add_referer and 'Referer' not in request.headers:
            self._set_referer(request, url)
        
        # 设置其他通用请求头
        self._set_common_headers(request)
        
        return None
    
    def _set_site_specific_headers(self, request, url):
        """根据目标网站设置特定请求头"""
        for domain, headers in self.SITE_HEADERS.items():
            if domain in url:
                for key, value in headers.items():
                    request.headers[key] = value
                logger.debug(f"Applied site-specific headers for {domain}")
                break
    
    def _set_referer(self, request, url):
        """设置Referer"""
        if self.random_referer:
            # 随机选择一个推荐来源
            referer = random.choice(self.REFERERS)
            # 如果推荐来源与目标网站相关，则使用
            for domain in self.SITE_HEADERS.keys():
                if domain in url:
                    referer = f"https://www.{domain}/"
                    break
        else:
            # 使用默认推荐来源
            referer = 'https://www.google.com/'
        
        request.headers['Referer'] = referer
    
    def _set_common_headers(self, request):
        """设置通用请求头"""
        # 确保必要的请求头存在
        if 'Accept' not in request.headers:
            request.headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        
        if 'Accept-Language' not in request.headers:
            request.headers['Accept-Language'] = 'zh-CN,zh;q=0.9,en;q=0.8'
        
        if 'Accept-Encoding' not in request.headers:
            request.headers['Accept-Encoding'] = 'gzip, deflate, br'
        
        # 添加DNT（Do Not Track）头
        if 'DNT' not in request.headers:
            request.headers['DNT'] = '1'
        
        # 添加升级不安全请求头
        if 'Upgrade-Insecure-Requests' not in request.headers:
            request.headers['Upgrade-Insecure-Requests'] = '1'


class AjaxHeaderMiddleware:
    """
    AJAX请求头中间件
    用于模拟AJAX请求的头部信息
    """
    
    AJAX_HEADERS = {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    }
    
    def __init__(self, settings):
        self.settings = settings
        
    @classmethod
    def from_crawler(cls, crawler):
        return cls(crawler.settings)
    
    def process_request(self, request, spider):
        """处理AJAX请求"""
        if request.meta.get('is_ajax'):
            for key, value in self.AJAX_HEADERS.items():
                request.headers[key] = value
            logger.debug(f"Applied AJAX headers for {request.url}")
        return None


class APIHeaderMiddleware:
    """
    API请求头中间件
    用于设置API请求的头部信息
    """
    
    API_HEADERS = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json',
    }
    
    def __init__(self, settings):
        self.settings = settings
        
    @classmethod
    def from_crawler(cls, crawler):
        return cls(crawler.settings)
    
    def process_request(self, request, spider):
        """处理API请求"""
        if request.meta.get('is_api'):
            for key, value in self.API_HEADERS.items():
                request.headers[key] = value
            
            # 添加API特定的token（如果有）
            api_token = request.meta.get('api_token')
            if api_token:
                request.headers['Authorization'] = f'Bearer {api_token}'
            
            logger.debug(f"Applied API headers for {request.url}")
        return None
