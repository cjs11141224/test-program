"""
懂车帝爬虫
抓取懂车帝的车型、价格、资讯等数据
"""
import re
import json
import logging
from datetime import datetime
from urllib.parse import urljoin, urlparse

import scrapy
from scrapy.http import Request

from car_crawler.items import BrandItem, VehicleItem, NewsItem, PriceItem, SalesRankItem

logger = logging.getLogger(__name__)


class DongchediSpider(scrapy.Spider):
    """
    懂车帝爬虫
    抓取车型信息、价格、资讯、销量排行等内容
    """
    
    name = 'dongchedi'
    allowed_domains = ['dongchedi.com', 'www.dongchedi.com']
    
    custom_settings = {
        'DOWNLOAD_DELAY': 1.2,
        'CONCURRENT_REQUESTS': 10,
        'RETRY_TIMES': 3,
    }
    
    # API端点
    API_ENDPOINTS = {
        'brands': 'https://www.dongchedi.com/motor/pc/car/brand/select_series_v2',
        'series_list': 'https://www.dongchedi.com/motor/pc/car/series/get_series_by_brand',
        'series_detail': 'https://www.dongchedi.com/motor/pc/car/series/detail',
        'news_list': 'https://www.dongchedi.com/motor/pc/article/get_article_list',
        'price': 'https://www.dongchedi.com/motor/pc/car/series/dealer_price',
        'sales_rank': 'https://www.dongchedi.com/motor/pc/car/rank/sale_rank',
    }
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.crawl_type = kwargs.get('crawl_type', 'all')
        
    def start_requests(self):
        """开始请求"""
        # 抓取品牌列表
        yield Request(
            url=self.API_ENDPOINTS['brands'],
            callback=self.parse_brands,
            meta={'is_api': True},
            dont_filter=True
        )
        
        # 抓取销量排行
        if self.crawl_type in ['all', 'sales']:
            yield Request(
                url=f"{self.API_ENDPOINTS['sales_rank']}?period=month&date={datetime.now().strftime('%Y-%m')}",
                callback=self.parse_sales_rank,
                meta={'is_api': True},
                dont_filter=True
            )
        
        # 抓取资讯
        if self.crawl_type in ['all', 'news']:
            yield Request(
                url=f"{self.API_ENDPOINTS['news_list']}?page=1&size=20",
                callback=self.parse_news_list,
                meta={'is_api': True},
                dont_filter=True
            )
    
    def parse_brands(self, response):
        """解析品牌列表"""
        try:
            data = json.loads(response.text)
            
            if data.get('status') != 0:
                logger.error(f"API error: {data.get('message')}")
                return
            
            brands = data.get('data', {}).get('brands', [])
            
            for brand_data in brands:
                try:
                    brand = BrandItem()
                    brand['source'] = 'dongchedi'
                    brand['name'] = brand_data.get('name', '')
                    brand['name_en'] = brand_data.get('name_en', '')
                    brand['logo_url'] = brand_data.get('image_url', '')
                    brand['source_id'] = str(brand_data.get('id', ''))
                    brand['is_domestic'] = brand_data.get('is_chinese', False)
                    
                    yield brand
                    
                    # 抓取该品牌下的车系
                    if self.crawl_type in ['all', 'vehicle']:
                        yield Request(
                            url=f"{self.API_ENDPOINTS['series_list']}?brand_id={brand_data['id']}",
                            callback=self.parse_series_list,
                            meta={'brand': brand, 'is_api': True},
                            dont_filter=True
                        )
                
                except Exception as e:
                    logger.error(f"Error parsing brand: {e}")
                    
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON: {e}")
    
    def parse_series_list(self, response):
        """解析车系列表"""
        brand = response.meta.get('brand', {})
        
        try:
            data = json.loads(response.text)
            
            if data.get('status') != 0:
                logger.error(f"API error: {data.get('message')}")
                return
            
            series_list = data.get('data', {}).get('series', [])
            
            for series_data in series_list:
                try:
                    vehicle = VehicleItem()
                    vehicle['source'] = 'dongchedi'
                    vehicle['brand_name'] = brand.get('name', '')
                    vehicle['name'] = series_data.get('name', '')
                    vehicle['full_name'] = series_data.get('full_name', '')
                    vehicle['source_id'] = str(series_data.get('id', ''))
                    
                    # 价格
                    min_price = series_data.get('min_price')
                    max_price = series_data.get('max_price')
                    vehicle['min_price'] = min_price / 10000 if min_price else None
                    vehicle['max_price'] = max_price / 10000 if max_price else None
                    vehicle['min_guide_price'] = vehicle['min_price']
                    vehicle['max_guide_price'] = vehicle['max_price']
                    
                    # 图片
                    vehicle['main_image'] = series_data.get('cover_url', '')
                    
                    # 基本信息
                    vehicle['level'] = series_data.get('level', '')
                    vehicle['energy_type'] = series_data.get('energy_type', '')
                    vehicle['body_type'] = series_data.get('body_type', '')
                    
                    # 评分
                    vehicle['score'] = series_data.get('score', None)
                    vehicle['review_count'] = series_data.get('review_count', 0)
                    
                    yield vehicle
                    
                    # 抓取车系详情
                    yield Request(
                        url=f"{self.API_ENDPOINTS['series_detail']}?series_id={series_data['id']}",
                        callback=self.parse_series_detail,
                        meta={'vehicle': vehicle, 'is_api': True},
                        dont_filter=True
                    )
                    
                    # 抓取价格信息
                    if self.crawl_type in ['all', 'price']:
                        yield Request(
                            url=f"{self.API_ENDPOINTS['price']}?series_id={series_data['id']}",
                            callback=self.parse_price,
                            meta={'vehicle': vehicle, 'is_api': True},
                            dont_filter=True
                        )
                
                except Exception as e:
                    logger.error(f"Error parsing series: {e}")
                    
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON: {e}")
    
    def parse_series_detail(self, response):
        """解析车系详情"""
        vehicle = response.meta.get('vehicle', {})
        
        try:
            data = json.loads(response.text)
            
            if data.get('status') != 0:
                logger.error(f"API error: {data.get('message')}")
                return
            
            detail = data.get('data', {})
            
            # 更新车型信息
            specs = detail.get('specs', {})
            
            # 尺寸
            vehicle['length'] = specs.get('length')
            vehicle['width'] = specs.get('width')
            vehicle['height'] = specs.get('height')
            vehicle['wheelbase'] = specs.get('wheelbase')
            vehicle['curb_weight'] = specs.get('curb_weight')
            
            # 动力
            vehicle['motor_power'] = specs.get('motor_power')
            vehicle['motor_torque'] = specs.get('motor_torque')
            vehicle['engine_displacement'] = specs.get('engine_displacement')
            vehicle['engine_power'] = specs.get('engine_power')
            
            # 续航
            vehicle['nedc_range'] = specs.get('nedc_range')
            vehicle['wltp_range'] = specs.get('wltp_range')
            vehicle['cltc_range'] = specs.get('cltc_range')
            
            # 电池
            vehicle['battery_capacity'] = specs.get('battery_capacity')
            vehicle['battery_type'] = specs.get('battery_type')
            
            # 性能
            vehicle['acceleration'] = specs.get('acceleration')
            vehicle['max_speed'] = specs.get('max_speed')
            
            # 详细参数
            vehicle['specs'] = specs
            vehicle['last_crawl_at'] = datetime.now().isoformat()
            
            yield vehicle
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON: {e}")
    
    def parse_news_list(self, response):
        """解析资讯列表"""
        try:
            data = json.loads(response.text)
            
            if data.get('status') != 0:
                logger.error(f"API error: {data.get('message')}")
                return
            
            articles = data.get('data', [])
            
            for article_data in articles:
                try:
                    news = NewsItem()
                    news['source'] = 'dongchedi'
                    news['title'] = article_data.get('title', '')
                    news['summary'] = article_data.get('abstract', '')
                    news['cover_image'] = article_data.get('cover_url', '')
                    news['source_url'] = f"https://www.dongchedi.com/article/{article_data.get('article_id', '')}"
                    news['source_id'] = str(article_data.get('article_id', ''))
                    
                    # 作者信息
                    author_info = article_data.get('user_info', {})
                    news['author'] = author_info.get('name', '')
                    
                    # 统计
                    news['view_count'] = article_data.get('read_count', 0)
                    news['like_count'] = article_data.get('digg_count', 0)
                    news['comment_count'] = article_data.get('comment_count', 0)
                    
                    # 发布时间
                    pub_time = article_data.get('publish_time', '')
                    news['publish_time'] = self._parse_timestamp(pub_time)
                    
                    # 分类
                    news['category'] = self._map_news_category(article_data.get('category', ''))
                    
                    yield news
                    
                except Exception as e:
                    logger.error(f"Error parsing news: {e}")
            
            # 翻页
            page = response.meta.get('page', 1)
            if page < 5 and len(articles) > 0:  # 限制抓取5页
                next_page = page + 1
                yield Request(
                    url=f"{self.API_ENDPOINTS['news_list']}?page={next_page}&size=20",
                    callback=self.parse_news_list,
                    meta={'page': next_page, 'is_api': True},
                    dont_filter=True
                )
                
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON: {e}")
    
    def parse_price(self, response):
        """解析价格信息"""
        vehicle = response.meta.get('vehicle', {})
        
        try:
            data = json.loads(response.text)
            
            if data.get('status') != 0:
                logger.error(f"API error: {data.get('message')}")
                return
            
            price_data = data.get('data', {})
            
            # 处理价格信息
            dealer_prices = price_data.get('dealer_prices', [])
            
            for dealer_price in dealer_prices:
                try:
                    price = PriceItem()
                    price['source'] = 'dongchedi'
                    price['vehicle_id'] = vehicle.get('source_id')
                    price['vehicle_name'] = vehicle.get('name')
                    
                    # 配置信息
                    price['config_id'] = str(dealer_price.get('spec_id', ''))
                    
                    # 价格
                    guide_price = dealer_price.get('guide_price')
                    dealer_price_val = dealer_price.get('dealer_price')
                    
                    price['price'] = guide_price / 10000 if guide_price else None
                    price['price_type'] = 'guide'
                    
                    # 地区
                    price['province'] = dealer_price.get('province', '')
                    price['city'] = dealer_price.get('city', '')
                    
                    price['record_date'] = datetime.now().isoformat()
                    
                    yield price
                    
                except Exception as e:
                    logger.error(f"Error parsing price: {e}")
                    
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON: {e}")
    
    def parse_sales_rank(self, response):
        """解析销量排行"""
        try:
            data = json.loads(response.text)
            
            if data.get('status') != 0:
                logger.error(f"API error: {data.get('message')}")
                return
            
            rank_data = data.get('data', {})
            rank_list = rank_data.get('list', [])
            
            for rank_item in rank_list:
                try:
                    sales_rank = SalesRankItem()
                    sales_rank['source'] = 'dongchedi'
                    sales_rank['vehicle_id'] = str(rank_item.get('series_id', ''))
                    sales_rank['vehicle_name'] = rank_item.get('series_name', '')
                    sales_rank['sales_volume'] = rank_item.get('count', 0)
                    sales_rank['rank'] = rank_item.get('rank', 0)
                    sales_rank['rank_change'] = rank_item.get('rank_change', 0)
                    sales_rank['market_share'] = rank_item.get('market_share', None)
                    sales_rank['period_type'] = 'month'
                    sales_rank['period'] = rank_data.get('date', '')
                    
                    yield sales_rank
                    
                except Exception as e:
                    logger.error(f"Error parsing sales rank: {e}")
                    
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON: {e}")
    
    def _parse_timestamp(self, timestamp) -> str:
        """解析时间戳"""
        if not timestamp:
            return None
        
        try:
            # 处理毫秒时间戳
            if isinstance(timestamp, (int, float)):
                if timestamp > 1000000000000:  # 毫秒
                    timestamp = timestamp / 1000
                dt = datetime.fromtimestamp(timestamp)
                return dt.isoformat()
            
            # 处理字符串
            if isinstance(timestamp, str):
                # 尝试解析ISO格式
                try:
                    dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                    return dt.isoformat()
                except ValueError:
                    pass
                
                # 尝试其他格式
                formats = [
                    '%Y-%m-%d %H:%M:%S',
                    '%Y-%m-%d',
                ]
                for fmt in formats:
                    try:
                        dt = datetime.strptime(timestamp, fmt)
                        return dt.isoformat()
                    except ValueError:
                        continue
        
        except Exception as e:
            logger.error(f"Failed to parse timestamp {timestamp}: {e}")
        
        return None
    
    def _map_news_category(self, category: str) -> str:
        """映射资讯分类"""
        category_map = {
            '新车': 'NEW_CAR',
            '评测': 'REVIEW',
            '导购': 'REVIEW',
            '行业': 'INDUSTRY',
            '价格': 'PRICE',
            '技术': 'TECH',
            '政策': 'POLICY',
            '市场': 'MARKET',
        }
        
        for key, value in category_map.items():
            if key in category:
                return value
        
        return 'INDUSTRY'
