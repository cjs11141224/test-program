"""
爬虫错误处理中间件
实现错误捕获、日志记录、告警通知等功能
"""
import logging
import traceback
from datetime import datetime
from scrapy import signals
from scrapy.exceptions import NotConfigured
from scrapy.http import Request, Response

logger = logging.getLogger(__name__)


class SpiderErrorMiddleware:
    """
    爬虫错误处理中间件
    捕获和处理爬虫运行过程中的各种错误
    """
    
    def __init__(self, settings):
        self.settings = settings
        self.enabled = settings.getbool('ERROR_MIDDLEWARE_ENABLED', True)
        self.log_errors = settings.getbool('LOG_SPIDER_ERRORS', True)
        self.notify_errors = settings.getbool('NOTIFY_ERRORS', False)
        self.max_errors = settings.getint('MAX_ERRORS_PER_SPIDER', 100)
        
        # 错误统计
        self.error_count = 0
        self.error_types = {}
        
    @classmethod
    def from_crawler(cls, crawler):
        if not crawler.settings.getbool('ERROR_MIDDLEWARE_ENABLED', True):
            raise NotConfigured('SpiderErrorMiddleware is disabled')
        
        middleware = cls(crawler.settings)
        crawler.signals.connect(middleware.spider_opened, signal=signals.spider_opened)
        crawler.signals.connect(middleware.spider_closed, signal=signals.spider_closed)
        crawler.signals.connect(middleware.spider_error, signal=signals.spider_error)
        return middleware
    
    def spider_opened(self, spider):
        """爬虫启动时的处理"""
        logger.info(f"SpiderErrorMiddleware enabled for spider: {spider.name}")
        self.error_count = 0
        self.error_types = {}
    
    def spider_closed(self, spider, reason):
        """爬虫关闭时的处理"""
        logger.info(f"Spider {spider.name} closed with reason: {reason}")
        logger.info(f"Total errors: {self.error_count}")
        logger.info(f"Error types: {self.error_types}")
    
    def spider_error(self, failure, response, spider):
        """处理爬虫错误"""
        self.error_count += 1
        
        # 获取错误信息
        error_type = failure.type.__name__
        error_message = str(failure.value)
        error_traceback = failure.getTraceback()
        
        # 统计错误类型
        self.error_types[error_type] = self.error_types.get(error_type, 0) + 1
        
        # 记录错误日志
        if self.log_errors:
            self._log_error(spider, error_type, error_message, error_traceback, response)
        
        # 发送告警通知
        if self.notify_errors and self.error_count <= self.max_errors:
            self._send_notification(spider, error_type, error_message, response)
        
        # 检查是否需要停止爬虫
        if self.error_count >= self.max_errors:
            logger.error(f"Max errors ({self.max_errors}) reached, stopping spider")
            spider.crawler.engine.close_spider(spider, 'max_errors_reached')
    
    def _log_error(self, spider, error_type, error_message, error_traceback, response):
        """记录错误日志"""
        error_info = {
            'timestamp': datetime.now().isoformat(),
            'spider': spider.name,
            'error_type': error_type,
            'error_message': error_message,
            'url': response.url if response else None,
            'traceback': error_traceback,
        }
        
        logger.error(f"Spider error in {spider.name}: {error_type} - {error_message}")
        logger.debug(f"Error traceback: {error_traceback}")
        
        # 可以保存到文件或数据库
        # self._save_error_to_db(error_info)
    
    def _send_notification(self, spider, error_type, error_message, response):
        """发送错误告警通知"""
        # 可以实现邮件、短信、Webhook等通知方式
        # 这里仅作为示例
        notification = {
            'spider': spider.name,
            'error_type': error_type,
            'error_message': error_message,
            'url': response.url if response else None,
            'timestamp': datetime.now().isoformat(),
        }
        
        logger.info(f"Notification sent: {notification}")
    
    def process_spider_exception(self, response, exception, spider):
        """处理爬虫异常"""
        error_type = type(exception).__name__
        error_message = str(exception)
        
        logger.error(f"Spider exception in {spider.name}: {error_type} - {error_message}")
        logger.debug(traceback.format_exc())
        
        return None


class RequestErrorMiddleware:
    """
    请求错误处理中间件
    处理请求过程中的各种错误
    """
    
    def __init__(self, settings):
        self.settings = settings
        self.enabled = settings.getbool('REQUEST_ERROR_MIDDLEWARE_ENABLED', True)
        
    @classmethod
    def from_crawler(cls, crawler):
        return cls(crawler.settings)
    
    def process_request(self, request, spider):
        """处理请求"""
        # 可以在这里添加请求前的检查
        return None
    
    def process_response(self, request, response, spider):
        """处理响应"""
        # 检查响应状态
        if response.status >= 400:
            logger.warning(f"HTTP error {response.status} for {request.url}")
            
            # 记录错误详情
            self._log_http_error(request, response, spider)
        
        return response
    
    def process_exception(self, request, exception, spider):
        """处理请求异常"""
        error_type = type(exception).__name__
        error_message = str(exception)
        
        logger.error(f"Request exception for {request.url}: {error_type} - {error_message}")
        
        # 记录请求异常
        self._log_request_error(request, exception, spider)
        
        return None
    
    def _log_http_error(self, request: Request, response: Response, spider):
        """记录HTTP错误"""
        error_info = {
            'timestamp': datetime.now().isoformat(),
            'spider': spider.name,
            'url': request.url,
            'status_code': response.status,
            'request_headers': dict(request.headers),
            'response_headers': dict(response.headers),
        }
        
        # 可以保存到数据库
        logger.debug(f"HTTP error logged: {error_info}")
    
    def _log_request_error(self, request: Request, exception, spider):
        """记录请求异常"""
        error_info = {
            'timestamp': datetime.now().isoformat(),
            'spider': spider.name,
            'url': request.url,
            'error_type': type(exception).__name__,
            'error_message': str(exception),
        }
        
        logger.debug(f"Request error logged: {error_info}")


class DataValidationErrorMiddleware:
    """
    数据验证错误处理中间件
    处理数据验证过程中的错误
    """
    
    def __init__(self, settings):
        self.settings = settings
        self.enabled = settings.getbool('DATA_VALIDATION_ERROR_ENABLED', True)
        self.validation_errors = []
        
    @classmethod
    def from_crawler(cls, crawler):
        return cls(crawler.settings)
    
    def process_spider_output(self, response, result, spider):
        """处理爬虫输出"""
        for item in result:
            if isinstance(item, dict):
                # 验证数据
                validation_result = self._validate_item(item)
                if not validation_result['valid']:
                    self._log_validation_error(item, validation_result['errors'], spider)
                    # 可以选择丢弃无效数据或继续处理
                    if self.settings.getbool('DROP_INVALID_ITEMS', False):
                        continue
            yield item
    
    def _validate_item(self, item: dict) -> dict:
        """验证数据项"""
        errors = []
        
        # 检查必需字段
        required_fields = ['title', 'url']  # 根据实际需求调整
        for field in required_fields:
            if field not in item or not item[field]:
                errors.append(f"Missing required field: {field}")
        
        # 检查数据类型
        if 'price' in item and item['price'] is not None:
            try:
                float(item['price'])
            except (ValueError, TypeError):
                errors.append(f"Invalid price format: {item['price']}")
        
        return {
            'valid': len(errors) == 0,
            'errors': errors
        }
    
    def _log_validation_error(self, item, errors, spider):
        """记录验证错误"""
        error_info = {
            'timestamp': datetime.now().isoformat(),
            'spider': spider.name,
            'item': item,
            'errors': errors,
        }
        
        self.validation_errors.append(error_info)
        logger.warning(f"Data validation error in {spider.name}: {errors}")
