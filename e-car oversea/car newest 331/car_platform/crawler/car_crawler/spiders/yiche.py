"""
易车爬虫
抓取易车的车型、价格、资讯等数据
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


class YicheSpider(scrapy.Spider):
    """
    易车爬虫
    抓取车型信息、价格、资讯等内容
    """
    
    name = 'yiche'
    allowed_domains = ['yiche.com', 'www.yiche.com']
    
    custom_settings = {
        'DOWNLOAD_DELAY': 1.0,
        'CONCURRENT_REQUESTS': 12,
        'RETRY_TIMES': 3,
    }
    
    # API端点
    API_ENDPOINTS = {
        'brands': 'https://www.yiche.com/ajax/car/GetMasterBrandList',
        'series': 'https://www.yiche.com/ajax/car/GetSerialList',
        'series_detail': 'https://www.yiche.com/ajax/car/GetSerialInfo',
        'news_list': 'https://www.yiche.com/ajax/news/GetNewsList',
        'price': 'https://www.yiche.com/ajax/car/GetDealerPrice',
        'sales_rank': 'https://www.yiche.com/ajax/car/GetSalesRank',
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
    
    def parse_brands(self, response):
        """解析品牌列表"""
        try:
            data = json.loads(response.text)
            
            if data.get('code') != 200:
                logger.error(f"API error: {data.get('message')}")
                return
            
            brands = data.get('data', [])
            
            for brand_data in brands:
                try:
                    brand = BrandItem()
                    brand['source'] = 'yiche'
                    brand['name'] = brand_data.get('name', '')
                    brand['name_en'] = brand_data.get('englishName', '')
                    brand['logo_url'] = brand_data.get('logoUrl', '')
                    brand['source_id'] = str(brand_data.get('id', ''))
                    brand['is_domestic'] = brand_data.get('isChinese', False)
                    
                    yield brand
                    
                    # 抓取该品牌下的车系
                    if self.crawl_type in ['all', 'vehicle']:
                        yield Request(
                            url=f"{self.API_ENDPOINTS['series']}?masterBrandId={brand_data['id']}",
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
            
            if data.get('code') != 200:
                logger.error(f"API error: {data.get('message')}")
                return
            
            series_list = data.get('data', [])
            
            for series_data in series_list:
                try:
                    vehicle = VehicleItem()
                    vehicle['source'] = 'yiche'
                    vehicle['brand_name'] = brand.get('name', '')
                    vehicle['name'] = series_data.get('name', '')
                    vehicle['full_name'] = series_data.get('fullName', '')
                    vehicle['source_id'] = str(series_data.get('id', ''))
                    
                    # 价格
                    min_price = series_data.get('minPrice')
                    max_price = series_data.get('maxPrice')
                    vehicle['min_price'] = min_price
                    vehicle['max_price'] = max_price
                    vehicle['min_guide_price'] = min_price
                    vehicle['max_guide_price'] = max_price
                    
                    # 图片
                    vehicle['main_image'] = series_data.get('picture', '')
                    
                    # 基本信息
                    vehicle['level'] = series_data.get('levelName', '')
                    vehicle['energy_type'] = series_data.get('energyTypeName', '')
                    
                    # 销售状态
                    vehicle['is_on_sale'] = series_data.get('state', 0) == 1
                    
                    yield vehicle
                    
                    # 抓取车系详情
                    yield Request(
                        url=f"{self.API_ENDPOINTS['series_detail']}?serialId={series_data['id']}",
                        callback=self.parse_series_detail,
                        meta={'vehicle': vehicle, 'is_api': True},
                        dont_filter=True
                    )
                    
                    # 抓取价格信息
                    if self.crawl_type in ['all', 'price']:
                        yield Request(
                            url=f"{self.API_ENDPOINTS['price']}?serialId={series_data['id']}",
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
            
            if data.get('code') != 200:
                logger.error(f"API error: {data.get('message')}")
                return
            
            detail = data.get('data', {})
            
            # 更新车型信息
            basic_info = detail.get('basicInfo', {})
            
            # 尺寸
            vehicle['length'] = basic_info.get('length')
            vehicle['width'] = basic_info.get('width')
            vehicle['height'] = basic_info.get('height')
            vehicle['wheelbase'] = basic_info.get('wheelBase')
            
            # 动力
            vehicle['engine_displacement'] = basic_info.get('displacement')
            vehicle['engine_power'] = basic_info.get('enginePower')
            vehicle['motor_power'] = basic_info.get('motorPower')
            
            # 续航
            vehicle['cltc_range'] = basic_info.get('pureElectricRange')
            
            # 详细参数
            vehicle['specs'] = basic_info
            vehicle['last_crawl_at'] = datetime.now().isoformat()
            
            yield vehicle
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON: {e}")
    
    def parse_news_list(self, response):
        """解析资讯列表"""
        try:
            data = json.loads(response.text)
            
            if data.get('code') != 200:
                logger.error(f"API error: {data.get('message')}")
                return
            
            articles = data.get('data', {}).get('list', [])
            
            for article_data in articles:
                try:
                    news = NewsItem()
                    news['source'] = 'yiche'
                    news['title'] = article_data.get('title', '')
                    news['summary'] = article_data.get('summary', '')
                    news['cover_image'] = article_data.get('imgUrl', '')
                    news['source_url'] = article_data.get('link', '')
                    news['source_id'] = str(article_data.get('id', ''))
                    
                    # 作者
                    news['author'] = article_data.get('author', '')
                    
                    # 统计
                    news['view_count'] = article_data.get('viewCount', 0)
                    
                    # 发布时间
                    pub_time = article_data.get('publishTime', '')
                    news['publish_time'] = self._parse_datetime(pub_time)
                    
                    # 分类
                    news['category'] = self._map_news_category(article_data.get('categoryName', ''))
                    
                    yield news
                    
                except Exception as e:
                    logger.error(f"Error parsing news: {e}")
                    
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON: {e}")
    
    def parse_price(self, response):
        """解析价格信息"""
        vehicle = response.meta.get('vehicle', {})
        
        try:
            data = json.loads(response.text)
            
            if data.get('code') != 200:
                logger.error(f"API error: {data.get('message')}")
                return
            
            price_data = data.get('data', {})
            
            # 处理价格信息
            spec_prices = price_data.get('specPrices', [])
            
            for spec_price in spec_prices:
                try:
                    price = PriceItem()
                    price['source'] = 'yiche'
                    price['vehicle_id'] = vehicle.get('source_id')
                    price['vehicle_name'] = vehicle.get('name')
                    
                    # 配置信息
                    price['config_id'] = str(spec_price.get('specId', ''))
                    
                    # 价格
                    guide_price = spec_price.get('guidePrice')
                    dealer_price = spec_price.get('dealerPrice')
                    
                    price['price'] = guide_price
                    price['price_type'] = 'guide'
                    
                    # 地区
                    price['province'] = spec_price.get('provinceName', '')
                    price['city'] = spec_price.get('cityName', '')
                    
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
            
            if data.get('code') != 200:
                logger.error(f"API error: {data.get('message')}")
                return
            
            rank_list = data.get('data', [])
            
            for rank_item in rank_list:
                try:
                    sales_rank = SalesRankItem()
                    sales_rank['source'] = 'yiche'
                    sales_rank['vehicle_id'] = str(rank_item.get('serialId', ''))
                    sales_rank['vehicle_name'] = rank_item.get('serialName', '')
                    sales_rank['sales_volume'] = rank_item.get('salesVolume', 0)
                    sales_rank['rank'] = rank_item.get('rank', 0)
                    sales_rank['rank_change'] = rank_item.get('rankChange', 0)
                    sales_rank['period_type'] = 'month'
                    sales_rank['period'] = rank_item.get('period', '')
                    
                    yield sales_rank
                    
                except Exception as e:
                    logger.error(f"Error parsing sales rank: {e}")
                    
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON: {e}")
    
    def _parse_datetime(self, datetime_str: str) -> str:
        """解析日期时间"""
        if not datetime_str:
            return None
        
        try:
            # 尝试解析ISO格式
            try:
                dt = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
                return dt.isoformat()
            except ValueError:
                pass
            
            # 尝试其他格式
            formats = [
                '%Y-%m-%d %H:%M:%S',
                '%Y-%m-%d',
                '%Y/%m/%d %H:%M:%S',
                '%Y/%m/%d',
            ]
            
            for fmt in formats:
                try:
                    dt = datetime.strptime(datetime_str, fmt)
                    return dt.isoformat()
                except ValueError:
                    continue
        
        except Exception as e:
            logger.error(f"Failed to parse datetime {datetime_str}: {e}")
        
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
