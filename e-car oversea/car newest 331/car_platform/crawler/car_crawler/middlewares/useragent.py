"""
User-Agent轮换中间件
实现请求头的动态轮换，模拟不同浏览器和设备
"""
import random
import logging
from scrapy import signals
from scrapy.downloadermiddlewares.useragent import UserAgentMiddleware

logger = logging.getLogger(__name__)


class RotateUserAgentMiddleware(UserAgentMiddleware):
    """
    轮换User-Agent中间件
    支持按权重选择、按设备类型选择、智能轮换策略
    """
    
    # 桌面浏览器User-Agent
    DESKTOP_AGENTS = [
        # Chrome on Windows
        {
            'ua': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'browser': 'Chrome',
            'os': 'Windows',
            'weight': 30
        },
        {
            'ua': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'browser': 'Chrome',
            'os': 'Windows',
            'weight': 25
        },
        {
            'ua': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
            'browser': 'Chrome',
            'os': 'Windows',
            'weight': 20
        },
        # Chrome on Mac
        {
            'ua': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'browser': 'Chrome',
            'os': 'MacOS',
            'weight': 15
        },
        {
            'ua': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'browser': 'Chrome',
            'os': 'MacOS',
            'weight': 12
        },
        # Edge
        {
            'ua': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
            'browser': 'Edge',
            'os': 'Windows',
            'weight': 10
        },
        {
            'ua': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
            'browser': 'Edge',
            'os': 'Windows',
            'weight': 8
        },
        # Firefox
        {
            'ua': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
            'browser': 'Firefox',
            'os': 'Windows',
            'weight': 8
        },
        {
            'ua': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
            'browser': 'Firefox',
            'os': 'Windows',
            'weight': 6
        },
        {
            'ua': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
            'browser': 'Firefox',
            'os': 'MacOS',
            'weight': 5
        },
        # Safari
        {
            'ua': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
            'browser': 'Safari',
            'os': 'MacOS',
            'weight': 8
        },
        {
            'ua': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
            'browser': 'Safari',
            'os': 'MacOS',
            'weight': 6
        },
    ]
    
    # 移动端User-Agent
    MOBILE_AGENTS = [
        # iOS Safari
        {
            'ua': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
            'browser': 'Safari',
            'os': 'iOS',
            'device': 'iPhone',
            'weight': 20
        },
        {
            'ua': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
            'browser': 'Safari',
            'os': 'iOS',
            'device': 'iPhone',
            'weight': 15
        },
        {
            'ua': 'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
            'browser': 'Safari',
            'os': 'iOS',
            'device': 'iPad',
            'weight': 10
        },
        # Android Chrome
        {
            'ua': 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            'browser': 'Chrome',
            'os': 'Android',
            'device': 'Samsung',
            'weight': 18
        },
        {
            'ua': 'Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            'browser': 'Chrome',
            'os': 'Android',
            'device': 'Samsung',
            'weight': 15
        },
        {
            'ua': 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            'browser': 'Chrome',
            'os': 'Android',
            'device': 'Pixel',
            'weight': 12
        },
        {
            'ua': 'Mozilla/5.0 (Linux; Android 13; Mi 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            'browser': 'Chrome',
            'os': 'Android',
            'device': 'Xiaomi',
            'weight': 10
        },
        # WeChat内置浏览器
        {
            'ua': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.43(0x18002b28) NetType/WIFI Language/zh_CN',
            'browser': 'WeChat',
            'os': 'iOS',
            'device': 'iPhone',
            'weight': 8
        },
        {
            'ua': 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36 MicroMessenger/8.0.43(0x18002b28) NetType/WIFI Language/zh_CN',
            'browser': 'WeChat',
            'os': 'Android',
            'device': 'Samsung',
            'weight': 6
        },
    ]
    
    def __init__(self, settings, user_agent='Scrapy'):
        super().__init__(user_agent)
        self.settings = settings
        self.use_mobile = settings.getbool('UA_USE_MOBILE', False)
        self.mobile_ratio = settings.getfloat('UA_MOBILE_RATIO', 0.3)
        self.rotation_policy = settings.get('UA_ROTATION_POLICY', 'random')  # random, sequential, weight_based
        self._counter = 0
        
    @classmethod
    def from_crawler(cls, crawler):
        middleware = cls(crawler.settings)
        crawler.signals.connect(middleware.spider_opened, signal=signals.spider_opened)
        return middleware
    
    def spider_opened(self, spider):
        """爬虫启动时的处理"""
        logger.info(f"RotateUserAgentMiddleware enabled for spider: {spider.name}")
        logger.info(f"Mobile UA ratio: {self.mobile_ratio}")
        logger.info(f"Rotation policy: {self.rotation_policy}")
    
    def _get_weighted_random_agent(self, agents):
        """根据权重随机选择User-Agent"""
        total_weight = sum(agent['weight'] for agent in agents)
        r = random.uniform(0, total_weight)
        cumulative_weight = 0
        for agent in agents:
            cumulative_weight += agent['weight']
            if r <= cumulative_weight:
                return agent
        return agents[-1]
    
    def _get_sequential_agent(self, agents):
        """顺序选择User-Agent"""
        agent = agents[self._counter % len(agents)]
        self._counter += 1
        return agent
    
    def _get_random_agent(self, agents):
        """完全随机选择User-Agent"""
        return random.choice(agents)
    
    def get_user_agent(self, is_mobile=False):
        """获取User-Agent"""
        agents = self.MOBILE_AGENTS if is_mobile else self.DESKTOP_AGENTS
        
        if self.rotation_policy == 'weight_based':
            return self._get_weighted_random_agent(agents)
        elif self.rotation_policy == 'sequential':
            return self._get_sequential_agent(agents)
        else:  # random
            return self._get_random_agent(agents)
    
    def process_request(self, request, spider):
        """处理请求，设置User-Agent"""
        # 检查请求是否已指定User-Agent
        if 'User-Agent' in request.headers:
            return
        
        # 决定是否使用移动端User-Agent
        is_mobile = False
        if self.use_mobile:
            is_mobile = random.random() < self.mobile_ratio
        
        # 获取User-Agent
        agent = self.get_user_agent(is_mobile)
        user_agent = agent['ua']
        
        # 设置请求头
        request.headers['User-Agent'] = user_agent
        
        # 根据浏览器类型设置额外的请求头
        self._set_browser_headers(request, agent)
        
        # 记录日志
        logger.debug(f"Using UA: {agent['browser']} on {agent.get('os', 'Unknown')} for {request.url}")
    
    def _set_browser_headers(self, request, agent):
        """根据浏览器类型设置额外的请求头"""
        browser = agent['browser']
        os_name = agent.get('os', '')
        
        # 通用Accept头
        request.headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
        request.headers['Accept-Language'] = 'zh-CN,zh;q=0.9,en;q=0.8'
        request.headers['Accept-Encoding'] = 'gzip, deflate, br'
        
        # 浏览器特定的请求头
        if browser == 'Chrome':
            request.headers['Sec-Ch-Ua'] = '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"'
            request.headers['Sec-Ch-Ua-Mobile'] = '?1' if agent.get('device') else '?0'
            request.headers['Sec-Ch-Ua-Platform'] = f'"{os_name}"'
        elif browser == 'Edge':
            request.headers['Sec-Ch-Ua'] = '"Not_A Brand";v="8", "Chromium";v="120", "Microsoft Edge";v="120"'
            request.headers['Sec-Ch-Ua-Mobile'] = '?0'
            request.headers['Sec-Ch-Ua-Platform'] = f'"{os_name}"'
        elif browser == 'Firefox':
            request.headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
            request.headers['Accept-Language'] = 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2'
            request.headers['Upgrade-Insecure-Requests'] = '1'
        elif browser == 'Safari':
            request.headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        
        # 通用安全请求头
        if browser in ['Chrome', 'Edge']:
            request.headers['Sec-Fetch-Dest'] = 'document'
            request.headers['Sec-Fetch-Mode'] = 'navigate'
            request.headers['Sec-Fetch-Site'] = 'none'
            request.headers['Sec-Fetch-User'] = '?1'


class MobileUserAgentMiddleware(RotateUserAgentMiddleware):
    """
    专门使用移动端User-Agent的中间件
    适用于需要模拟移动设备访问的场景
    """
    
    def __init__(self, settings, user_agent='Scrapy'):
        super().__init__(settings, user_agent)
        self.use_mobile = True
        self.mobile_ratio = 1.0
