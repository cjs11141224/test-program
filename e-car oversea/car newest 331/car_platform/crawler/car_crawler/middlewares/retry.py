"""
重试中间件
实现智能重试机制，支持指数退避、状态码过滤等功能
"""
import logging
import time
from typing import Optional
from scrapy import signals
from scrapy.downloadermiddlewares.retry import RetryMiddleware as BaseRetryMiddleware
from scrapy.exceptions import IgnoreRequest
from scrapy.http import Request, Response
from scrapy.utils.response import response_status_message

logger = logging.getLogger(__name__)


class RetryMiddleware(BaseRetryMiddleware):
    """
    增强版重试中间件
    支持指数退避、智能重试策略、状态码过滤
    """
    
    # 默认重试状态码
    DEFAULT_RETRY_CODES = [500, 502, 503, 504, 522, 524, 408, 429]
    
    # 客户端错误状态码（通常不需要重试）
    CLIENT_ERROR_CODES = [400, 401, 403, 404, 405, 406, 407, 409, 410]
    
    def __init__(self, settings):
        super().__init__(settings)
        self.max_retry_times = settings.getint('RETRY_TIMES', 3)
        self.retry_http_codes = set(settings.getlist('RETRY_HTTP_CODES', self.DEFAULT_RETRY_CODES))
        self.retry_backoff = settings.getbool('RETRY_BACKOFF', True)
        self.retry_backoff_max = settings.getint('RETRY_BACKOFF_MAX', 60)
        self.priority_adjust = settings.getint('RETRY_PRIORITY_ADJUST', -1)
        
        # 统计信息
        self.stats = {
            'total_retries': 0,
            'success_after_retry': 0,
            'failed_after_retry': 0,
        }
        
    @classmethod
    def from_crawler(cls, crawler):
        middleware = cls(crawler.settings)
        crawler.signals.connect(middleware.spider_opened, signal=signals.spider_opened)
        crawler.signals.connect(middleware.spider_closed, signal=signals.spider_closed)
        return middleware
    
    def spider_opened(self, spider):
        """爬虫启动时的处理"""
        logger.info(f"RetryMiddleware enabled for spider: {spider.name}")
        logger.info(f"Max retry times: {self.max_retry_times}")
        logger.info(f"Retry HTTP codes: {self.retry_http_codes}")
        logger.info(f"Retry backoff: {self.retry_backoff}")
    
    def spider_closed(self, spider, reason):
        """爬虫关闭时的处理"""
        logger.info(f"Retry stats: {self.stats}")
    
    def process_response(self, request: Request, response: Response, spider):
        """处理响应，判断是否需要重试"""
        # 检查请求是否被标记为不重试
        if request.meta.get('dont_retry', False):
            return response
        
        # 检查响应状态码
        if response.status in self.retry_http_codes:
            reason = response_status_message(response.status)
            return self._retry(request, reason, spider) or response
        
        # 检查特定的反爬标记
        if self._is_anti_scraping_response(response):
            reason = 'anti-scraping detected'
            return self._retry(request, reason, spider) or response
        
        return response
    
    def process_exception(self, request: Request, exception, spider):
        """处理异常"""
        # 检查请求是否被标记为不重试
        if request.meta.get('dont_retry', False):
            return None
        
        # 检查异常类型
        exception_type = type(exception).__name__
        
        # 网络相关异常可以重试
        if self._is_retryable_exception(exception):
            reason = f"{exception_type}: {str(exception)}"
            return self._retry(request, reason, spider)
        
        return None
    
    def _retry(self, request: Request, reason: str, spider):
        """执行重试"""
        retry_times = request.meta.get('retry_times', 0) + 1
        
        # 检查是否超过最大重试次数
        if retry_times > self.max_retry_times:
            logger.error(f"Max retries exceeded for {request.url}: {reason}")
            self.stats['failed_after_retry'] += 1
            return None
        
        # 计算重试延迟
        retry_delay = self._calculate_retry_delay(retry_times)
        
        logger.warning(
            f"Retrying {request.url} (attempt {retry_times}/{self.max_retry_times}) "
            f"after {retry_delay}s due to: {reason}"
        )
        
        # 更新请求元数据
        retry_req = request.copy()
        retry_req.meta['retry_times'] = retry_times
        retry_req.meta['retry_reason'] = reason
        retry_req.meta['retry_delay'] = retry_delay
        retry_req.dont_filter = True
        
        # 调整优先级
        retry_req.priority = request.priority + self.priority_adjust
        
        # 统计
        self.stats['total_retries'] += 1
        
        # 实际延迟（在调度器中处理）
        if retry_delay > 0:
            retry_req.meta['download_slot'] = f"retry_{retry_times}"
        
        return retry_req
    
    def _calculate_retry_delay(self, retry_times: int) -> float:
        """计算重试延迟时间（指数退避）"""
        if not self.retry_backoff:
            return 0
        
        # 指数退避: 2^retry_times - 1
        delay = (2 ** retry_times) - 1
        
        # 添加随机抖动（0-1秒）
        delay += random.uniform(0, 1)
        
        # 限制最大延迟
        return min(delay, self.retry_backoff_max)
    
    def _is_anti_scraping_response(self, response: Response) -> bool:
        """检测是否为反爬响应"""
        # 检查页面内容是否包含反爬标记
        anti_scraping_markers = [
            b'验证码',
            b'访问过于频繁',
            b'您的访问被拒绝',
            b'IP被封',
            b'请稍后重试',
            b'captcha',
            b'access denied',
            b'blocked',
        ]
        
        # 只检查前100KB内容
        content = response.body[:102400]
        
        for marker in anti_scraping_markers:
            if marker in content:
                logger.warning(f"Anti-scraping marker found: {marker}")
                return True
        
        return False
    
    def _is_retryable_exception(self, exception) -> bool:
        """判断异常是否可以重试"""
        retryable_exceptions = [
            'TimeoutError',
            'TCPTimedOutError',
            'ConnectTimeout',
            'ReadTimeout',
            'ConnectionRefusedError',
            'ConnectionResetError',
            'ConnectionError',
            'DNSLookupError',
            'ResponseNeverReceived',
            'TunnelError',
        ]
        
        exception_type = type(exception).__name__
        return exception_type in retryable_exceptions


class ConditionalRetryMiddleware(RetryMiddleware):
    """
    条件重试中间件
    根据特定条件决定是否重试
    """
    
    def __init__(self, settings):
        super().__init__(settings)
        self.url_patterns = settings.getdict('RETRY_URL_PATTERNS', {})
        
    def _should_retry(self, request: Request, response: Response) -> bool:
        """判断是否应该重试"""
        # 检查URL模式
        for pattern, config in self.url_patterns.items():
            if pattern in request.url:
                # 应用特定配置
                max_retries = config.get('max_retries', self.max_retry_times)
                retry_codes = set(config.get('retry_codes', self.retry_http_codes))
                
                retry_times = request.meta.get('retry_times', 0)
                if retry_times >= max_retries:
                    return False
                    
                if response.status in retry_codes:
                    return True
        
        return super()._should_retry(request, response)


class SmartRetryMiddleware(RetryMiddleware):
    """
    智能重试中间件
    根据历史成功率动态调整重试策略
    """
    
    def __init__(self, settings):
        super().__init__(settings)
        self.domain_stats = {}  # 域名统计
        self.adaptive_retry = settings.getbool('ADAPTIVE_RETRY', True)
        
    def _calculate_retry_delay(self, retry_times: int) -> float:
        """智能计算重试延迟"""
        base_delay = super()._calculate_retry_delay(retry_times)
        
        if not self.adaptive_retry:
            return base_delay
        
        # 可以根据域名历史成功率调整延迟
        # 这里简化处理，实际可以实现更复杂的逻辑
        
        return base_delay
    
    def _update_domain_stats(self, domain: str, success: bool):
        """更新域名统计"""
        if domain not in self.domain_stats:
            self.domain_stats[domain] = {'success': 0, 'fail': 0}
        
        if success:
            self.domain_stats[domain]['success'] += 1
        else:
            self.domain_stats[domain]['fail'] += 1
    
    def _get_domain_success_rate(self, domain: str) -> float:
        """获取域名成功率"""
        stats = self.domain_stats.get(domain, {'success': 0, 'fail': 0})
        total = stats['success'] + stats['fail']
        
        if total == 0:
            return 1.0
        
        return stats['success'] / total
