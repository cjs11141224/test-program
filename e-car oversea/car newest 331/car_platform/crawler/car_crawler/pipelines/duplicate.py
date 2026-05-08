"""
去重管道
实现数据去重功能，防止重复抓取
"""
import hashlib
import json
import logging
from typing import Set, Dict
from scrapy.exceptions import DropItem

logger = logging.getLogger(__name__)


class DuplicatePipeline:
    """
    去重管道
    基于多种策略实现数据去重
    """
    
    def __init__(self):
        # 内存去重集合
        self.seen_ids: Set[str] = set()
        self.seen_urls: Set[str] = set()
        self.seen_signatures: Set[str] = set()
        
        # 统计
        self.duplicate_count = 0
        
    def process_item(self, item, spider):
        """处理Item，检查是否重复"""
        item_type = type(item).__name__
        
        # 获取去重标识
        duplicate_id = self._get_duplicate_id(item)
        
        # 检查是否重复
        if duplicate_id in self.seen_ids:
            self.duplicate_count += 1
            logger.debug(f"Duplicate item dropped: {duplicate_id}")
            raise DropItem(f"Duplicate item: {duplicate_id}")
        
        # 添加到已见集合
        self.seen_ids.add(duplicate_id)
        
        # 检查URL去重
        if item.get('source_url'):
            url = item['source_url']
            if url in self.seen_urls:
                self.duplicate_count += 1
                logger.debug(f"Duplicate URL dropped: {url}")
                raise DropItem(f"Duplicate URL: {url}")
            self.seen_urls.add(url)
        
        # 检查内容签名去重
        signature = self._generate_signature(item)
        if signature in self.seen_signatures:
            self.duplicate_count += 1
            logger.debug(f"Duplicate signature dropped: {signature}")
            raise DropItem(f"Duplicate signature: {signature}")
        self.seen_signatures.add(signature)
        
        return item
    
    def _get_duplicate_id(self, item) -> str:
        """获取去重标识"""
        item_type = type(item).__name__
        
        # 根据Item类型构建去重标识
        if item_type == 'BrandItem':
            return f"brand:{item.get('name', '')}"
        
        elif item_type == 'VehicleItem':
            return f"vehicle:{item.get('brand_name', '')}:{item.get('name', '')}"
        
        elif item_type == 'NewsItem':
            # 资讯使用URL或标题+发布时间
            if item.get('source_url'):
                return f"news:url:{item['source_url']}"
            return f"news:title:{item.get('title', '')}:{item.get('publish_time', '')}"
        
        elif item_type == 'PriceItem':
            return f"price:{item.get('vehicle_id', '')}:{item.get('config_id', '')}:{item.get('record_date', '')}"
        
        elif item_type == 'SalesRankItem':
            return f"sales:{item.get('vehicle_id', '')}:{item.get('period', '')}"
        
        else:
            # 默认使用source_id
            return f"{item_type}:{item.get('source_id', '')}:{item.get('source', '')}"
    
    def _generate_signature(self, item) -> str:
        """生成内容签名"""
        # 选择用于生成签名的字段
        signature_fields = []
        
        item_type = type(item).__name__
        
        if item_type == 'BrandItem':
            signature_fields = ['name', 'country']
        
        elif item_type == 'VehicleItem':
            signature_fields = ['name', 'brand_name', 'min_price', 'max_price']
        
        elif item_type == 'NewsItem':
            signature_fields = ['title', 'publish_time']
        
        elif item_type == 'PriceItem':
            signature_fields = ['vehicle_id', 'price', 'record_date']
        
        else:
            signature_fields = ['name', 'source_id']
        
        # 构建签名内容
        content = []
        for field in signature_fields:
            value = item.get(field)
            if value is not None:
                content.append(f"{field}={value}")
        
        # 生成MD5签名
        signature_str = '|'.join(content)
        return hashlib.md5(signature_str.encode('utf-8')).hexdigest()


class RedisDuplicatePipeline:
    """
    基于Redis的去重管道
    适用于分布式爬虫场景
    """
    
    def __init__(self, redis_url: str):
        self.redis_url = redis_url
        self.redis_client = None
        self.key_prefix = 'car_crawler:dupefilter'
        
    @classmethod
    def from_crawler(cls, crawler):
        redis_url = crawler.settings.get('REDIS_URL', 'redis://localhost:6379/0')
        return cls(redis_url)
    
    def open_spider(self, spider):
        """爬虫启动时连接Redis"""
        try:
            import redis
            self.redis_client = redis.from_url(self.redis_url)
            logger.info(f"Connected to Redis for duplicate filtering: {self.redis_url}")
        except ImportError:
            logger.error("redis package not installed, falling back to memory duplicate filter")
            self.redis_client = None
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.redis_client = None
    
    def close_spider(self, spider):
        """爬虫关闭时的处理"""
        if self.redis_client:
            self.redis_client.close()
    
    def process_item(self, item, spider):
        """处理Item"""
        if not self.redis_client:
            # 如果没有Redis连接，使用内存去重
            return item
        
        duplicate_id = self._get_duplicate_id(item)
        key = f"{self.key_prefix}:{spider.name}"
        
        # 使用Redis Set检查是否重复
        is_duplicate = self.redis_client.sismember(key, duplicate_id)
        
        if is_duplicate:
            raise DropItem(f"Duplicate item in Redis: {duplicate_id}")
        
        # 添加到Redis
        self.redis_client.sadd(key, duplicate_id)
        
        # 设置过期时间（7天）
        self.redis_client.expire(key, 7 * 24 * 3600)
        
        return item
    
    def _get_duplicate_id(self, item) -> str:
        """获取去重标识"""
        item_type = type(item).__name__
        
        if item_type == 'BrandItem':
            return f"brand:{item.get('name', '')}"
        
        elif item_type == 'VehicleItem':
            return f"vehicle:{item.get('brand_name', '')}:{item.get('name', '')}"
        
        elif item_type == 'NewsItem':
            if item.get('source_url'):
                return f"news:{item['source_url']}"
            return f"news:{item.get('title', '')}"
        
        else:
            return f"{item_type}:{item.get('source_id', '')}"


class SmartDuplicatePipeline:
    """
    智能去重管道
    根据数据特征智能判断是否为重复数据
    """
    
    def __init__(self):
        self.seen_items: Dict[str, Dict] = {}
        self.similarity_threshold = 0.9  # 相似度阈值
        
    def process_item(self, item, spider):
        """处理Item"""
        item_type = type(item).__name__
        
        # 检查相似度
        similar_item = self._find_similar_item(item)
        
        if similar_item:
            similarity = self._calculate_similarity(item, similar_item)
            
            if similarity >= self.similarity_threshold:
                logger.debug(f"Similar item found (similarity: {similarity:.2f}), dropping")
                raise DropItem(f"Similar item found: similarity={similarity:.2f}")
        
        # 保存Item
        item_id = self._get_item_id(item)
        self.seen_items[item_id] = dict(item)
        
        return item
    
    def _get_item_id(self, item) -> str:
        """获取Item标识"""
        item_type = type(item).__name__
        source_id = item.get('source_id', '')
        return f"{item_type}:{source_id}"
    
    def _find_similar_item(self, item) -> Dict:
        """查找相似Item"""
        item_type = type(item).__name__
        
        for seen_id, seen_item in self.seen_items.items():
            if seen_id.startswith(item_type):
                return seen_item
        
        return None
    
    def _calculate_similarity(self, item1, item2) -> float:
        """计算两个Item的相似度"""
        # 简单的字段匹配相似度
        common_fields = set(item1.keys()) & set(item2.keys())
        
        if not common_fields:
            return 0.0
        
        match_count = 0
        for field in common_fields:
            if item1[field] == item2[field]:
                match_count += 1
        
        return match_count / len(common_fields)
