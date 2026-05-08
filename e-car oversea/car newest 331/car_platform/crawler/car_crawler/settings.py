"""
Scrapy settings for car_crawler project
"""
import os
import random

# 项目设置
BOT_NAME = 'car_crawler'
SPIDER_MODULES = ['car_crawler.spiders']
NEWSPIDER_MODULE = 'car_crawler.spiders'

# 爬虫设置
ROBOTSTXT_OBEY = False  # 不遵守robots.txt（汽车网站通常限制较多）

# 并发设置
CONCURRENT_REQUESTS = 16  # 并发请求数
CONCURRENT_REQUESTS_PER_DOMAIN = 8  # 每个域名的并发请求数
DOWNLOAD_DELAY = 1  # 基础下载延迟（秒）
RANDOMIZE_DOWNLOAD_DELAY = 0.5  # 随机延迟范围

# 自动限速扩展
AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 1
AUTOTHROTTLE_MAX_DELAY = 10
AUTOTHROTTLE_TARGET_CONCURRENCY = 2.0
AUTOTHROTTLE_DEBUG = False

# 请求头设置
DEFAULT_REQUEST_HEADERS = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
}

# User-Agent列表（轮换使用）
USER_AGENT_LIST = [
    # Chrome on Windows
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    # Chrome on Mac
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    # Edge
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    # Firefox
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
    # Safari
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    # Mobile
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
]

# 随机选择User-Agent
USER_AGENT = random.choice(USER_AGENT_LIST)

# Cookie设置
COOKIES_ENABLED = True
COOKIES_DEBUG = False

# Telnet控制台
TELNETCONSOLE_ENABLED = False

# 管道设置
ITEM_PIPELINES = {
    'car_crawler.pipelines.ValidationPipeline': 100,
    'car_crawler.pipelines.DuplicatePipeline': 200,
    'car_crawler.pipelines.DatabasePipeline': 300,
    'car_crawler.pipelines.ImageDownloadPipeline': 400,
}

# 中间件设置
DOWNLOADER_MIDDLEWARES = {
    'car_crawler.middlewares.retry.RetryMiddleware': 90,
    'car_crawler.middlewares.proxy.ProxyMiddleware': 100,
    'car_crawler.middlewares.useragent.RotateUserAgentMiddleware': 110,
    'car_crawler.middlewares.header.CustomHeaderMiddleware': 120,
    'scrapy.downloadermiddlewares.httpproxy.HttpProxyMiddleware': None,
    'scrapy.downloadermiddlewares.useragent.UserAgentMiddleware': None,
    'scrapy.downloadermiddlewares.retry.RetryMiddleware': None,
}

SPIDER_MIDDLEWARES = {
    'car_crawler.middlewares.error.SpiderErrorMiddleware': 80,
}

# 扩展设置
EXTENSIONS = {
    'car_crawler.extensions.stats.CrawlStatsExtension': 100,
    'car_crawler.extensions.monitor.SpiderMonitor': 200,
}

# 重试设置
RETRY_ENABLED = True
RETRY_TIMES = 3
RETRY_HTTP_CODES = [500, 502, 503, 504, 522, 524, 408, 429, 403]
RETRY_BACKOFF = True
RETRY_BACKOFF_MAX = 60

# 超时设置
DOWNLOAD_TIMEOUT = 30
DOWNLOAD_FAIL_ON_DATALOSS = False

# 重定向设置
REDIRECT_ENABLED = True
REDIRECT_MAX_TIMES = 5

# 日志设置
LOG_LEVEL = 'INFO'
LOG_FORMAT = '%(levelname)s: %(message)s'
LOG_DATEFORMAT = '%Y-%m-%d %H:%M:%S'
LOG_STDOUT = False

# 数据输出设置
FEED_EXPORT_ENCODING = 'utf-8'

# 内存设置
MEMUSAGE_LIMIT_MB = 2048
MEMUSAGE_WARNING_MB = 1024
MEMUSAGE_ENABLED = True

# 深度设置
DEPTH_LIMIT = 10
DEPTH_STATS_VERBOSE = True

# 请求/响应设置
REQUEST_FINGERPRINTER_IMPLEMENTATION = '2.7'
TWISTED_REACTOR = 'twisted.internet.asyncioreactor.AsyncioSelectorReactor'

# 图片下载设置
IMAGES_STORE = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'images')
IMAGES_EXPIRES = 30  # 图片过期天数
IMAGES_THUMBS = {
    'small': (150, 100),
    'medium': (400, 300),
    'large': (800, 600),
}

# 数据库设置
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://car_user:car_password@localhost:5432/car_platform')

# Redis设置（用于分布式爬虫和去重）
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
REDIS_DB = int(os.getenv('REDIS_DB', 0))

# 代理设置
PROXY_ENABLED = True
PROXY_API_URL = os.getenv('PROXY_API_URL', '')  # 代理API接口
PROXY_POOL_SIZE = 50  # 代理池大小
PROXY_REFRESH_INTERVAL = 300  # 代理刷新间隔（秒）

# 爬虫监控设置
STATS_DUMP = True
STATSMAILER_RCPTS = []

# 邮件通知设置（可选）
MAIL_HOST = os.getenv('MAIL_HOST', '')
MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
MAIL_USER = os.getenv('MAIL_USER', '')
MAIL_PASS = os.getenv('MAIL_PASS', '')
MAIL_FROM = os.getenv('MAIL_FROM', '')
MAIL_TLS = True
MAIL_SSL = False

# 调度器设置
SCHEDULER_DEBUG = False

# 去重设置
DUPEFILTER_CLASS = 'scrapy.dupefilters.RFPDupeFilter'
DUPEFILTER_DEBUG = False

# 性能设置
DNS_TIMEOUT = 60
DNS_RESOLVER = 'scrapy.resolver.CachingThreadedResolver'
REACTOR_THREADPOOL_MAXSIZE = 20

# 爬虫特定设置
SPIDER_SETTINGS = {
    'autohome': {
        'download_delay': 1.5,
        'concurrent_requests': 8,
    },
    'dongchedi': {
        'download_delay': 1.2,
        'concurrent_requests': 10,
    },
    'yiche': {
        'download_delay': 1.0,
        'concurrent_requests': 12,
    },
}

# 抓取频率设置（分钟）
CRAWL_INTERVALS = {
    'news': 30,  # 资讯每30分钟
    'price': 60,  # 价格每小时
    'vehicle': 1440,  # 车型每天
    'sales': 1440,  # 销量每天
}

# 数据保留设置
DATA_RETENTION_DAYS = {
    'news': 90,  # 资讯保留90天
    'price_history': 365,  # 价格历史保留1年
    'crawl_logs': 30,  # 爬虫日志保留30天
}
