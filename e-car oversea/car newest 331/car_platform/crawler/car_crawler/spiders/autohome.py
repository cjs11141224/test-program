"""
汽车之家爬虫
抓取汽车之家的车型、价格、资讯等数据
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


class AutohomeSpider(scrapy.Spider):
    """
    汽车之家爬虫
    抓取车型信息、价格、资讯等内容
    """
    
    name = 'autohome'
    allowed_domains = ['autohome.com.cn', 'www.autohome.com.cn']
    
    custom_settings = {
        'DOWNLOAD_DELAY': 1.5,
        'CONCURRENT_REQUESTS': 8,
        'RETRY_TIMES': 3,
    }
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.crawl_type = kwargs.get('crawl_type', 'all')  # all, vehicle, news, price
        
    def start_requests(self):
        """开始请求"""
        # 品牌列表页
        brand_url = 'https://www.autohome.com.cn/grade/carhtml/%s.html'
        
        # 抓取所有字母开头的品牌
        for letter in 'ABCDEFGHJKLMNOPQRSTUVWXYZ':
            yield Request(
                url=brand_url % letter,
                callback=self.parse_brands,
                meta={'letter': letter},
                dont_filter=True
            )
    
    def parse_brands(self, response):
        """解析品牌列表"""
        letter = response.meta.get('letter', '')
        logger.info(f"Parsing brands for letter: {letter}")
        
        # 提取品牌信息
        brand_items = response.css('dl')
        
        for brand_item in brand_items:
            try:
                brand = BrandItem()
                brand['source'] = 'autohome'
                
                # 品牌名称
                brand['name'] = self._extract_text(brand_item.css('dt div a::text'))
                
                # Logo
                brand['logo_url'] = brand_item.css('dt div a img::attr(src)').get('')
                
                # 品牌ID
                brand_url = brand_item.css('dt div a::attr(href)').get('')
                brand['source_id'] = self._extract_id_from_url(brand_url)
                
                # 获取品牌主页
                brand_homepage = urljoin(response.url, brand_url)
                
                yield brand
                
                # 继续抓取车型
                if self.crawl_type in ['all', 'vehicle']:
                    yield Request(
                        url=brand_homepage,
                        callback=self.parse_brand_page,
                        meta={'brand': brand},
                        dont_filter=True
                    )
                
            except Exception as e:
                logger.error(f"Error parsing brand: {e}")
    
    def parse_brand_page(self, response):
        """解析品牌主页"""
        brand = response.meta.get('brand', {})
        
        # 提取车系列表
        series_items = response.css('.list-cont')
        
        for series_item in series_items:
            try:
                vehicle = VehicleItem()
                vehicle['source'] = 'autohome'
                vehicle['brand_name'] = brand.get('name', '')
                
                # 车系名称
                vehicle['name'] = self._extract_text(series_item.css('.list-cont-main .main-title a::text'))
                vehicle['full_name'] = vehicle['name']
                
                # 车系URL
                series_url = series_item.css('.list-cont-main .main-title a::attr(href)').get('')
                vehicle['source_url'] = urljoin(response.url, series_url)
                vehicle['source_id'] = self._extract_id_from_url(series_url)
                
                # 价格
                price_text = series_item.css('.list-cont-main .main-lever-right .lever-price span::text').get('')
                min_price, max_price = self._parse_price_range(price_text)
                vehicle['min_price'] = min_price
                vehicle['max_price'] = max_price
                vehicle['min_guide_price'] = min_price
                vehicle['max_guide_price'] = max_price
                
                # 评分
                score_text = series_item.css('.score-cont .score-num::text').get('')
                vehicle['score'] = self._parse_float(score_text)
                
                # 图片
                vehicle['main_image'] = series_item.css('.list-cont-img img::attr(src)').get('')
                
                # 基本信息
                info_items = series_item.css('.list-cont-main .main-lever-left li')
                for info in info_items:
                    info_text = info.css('::text').get('')
                    if '级别' in info_text:
                        vehicle['level'] = info.css('span::text').get('')
                    elif '排量' in info_text:
                        vehicle['engine_displacement'] = self._parse_displacement(info_text)
                    elif '油耗' in info_text:
                        vehicle['fuel_consumption'] = self._parse_float(info_text)
                
                yield vehicle
                
                # 继续抓取车型详情
                yield Request(
                    url=vehicle['source_url'],
                    callback=self.parse_vehicle_detail,
                    meta={'vehicle': vehicle},
                    dont_filter=True
                )
                
            except Exception as e:
                logger.error(f"Error parsing vehicle: {e}")
    
    def parse_vehicle_detail(self, response):
        """解析车型详情页"""
        vehicle = response.meta.get('vehicle', {})
        
        try:
            # 提取详细参数
            # 基本信息
            vehicle['energy_type'] = response.css('.information-tb td:contains("能源类型") + td::text').get('')
            vehicle['body_type'] = response.css('.information-tb td:contains("车身类型") + td::text').get('')
            
            # 尺寸
            length_text = response.css('.information-tb td:contains("长") + td::text').get('')
            vehicle['length'] = self._parse_int(length_text)
            
            width_text = response.css('.information-tb td:contains("宽") + td::text').get('')
            vehicle['width'] = self._parse_int(width_text)
            
            height_text = response.css('.information-tb td:contains("高") + td::text').get('')
            vehicle['height'] = self._parse_int(height_text)
            
            wheelbase_text = response.css('.information-tb td:contains("轴距") + td::text').get('')
            vehicle['wheelbase'] = self._parse_int(wheelbase_text)
            
            # 动力
            motor_power_text = response.css('.information-tb td:contains("电动机最大功率") + td::text').get('')
            vehicle['motor_power'] = self._parse_int(motor_power_text)
            
            battery_capacity_text = response.css('.information-tb td:contains("电池容量") + td::text').get('')
            vehicle['battery_capacity'] = self._parse_float(battery_capacity_text)
            
            # 续航
            range_text = response.css('.information-tb td:contains("纯电续航里程") + td::text').get('')
            vehicle['cltc_range'] = self._parse_int(range_text)
            
            # 性能
            acceleration_text = response.css('.information-tb td:contains("官方0-100km/h加速") + td::text').get('')
            vehicle['acceleration'] = self._parse_float(acceleration_text)
            
            # 详细参数JSON
            specs = {}
            spec_rows = response.css('.information-tb tr')
            for row in spec_rows:
                key = row.css('td:first-child::text').get('')
                value = row.css('td:last-child::text').get('')
                if key and value:
                    specs[key] = value
            
            vehicle['specs'] = specs
            vehicle['last_crawl_at'] = datetime.now().isoformat()
            
            yield vehicle
            
        except Exception as e:
            logger.error(f"Error parsing vehicle detail: {e}")
    
    def parse_news_list(self, response):
        """解析资讯列表"""
        news_items = response.css('.article-list .article-item')
        
        for news_item in news_items:
            try:
                news = NewsItem()
                news['source'] = 'autohome'
                
                # 标题
                news['title'] = self._extract_text(news_item.css('.article-title a::text'))
                
                # URL
                news_url = news_item.css('.article-title a::attr(href)').get('')
                news['source_url'] = urljoin(response.url, news_url)
                
                # 摘要
                news['summary'] = self._extract_text(news_item.css('.article-summary::text'))
                
                # 封面图
                news['cover_image'] = news_item.css('.article-img img::attr(src)').get('')
                
                # 发布时间
                pub_time = news_item.css('.article-time::text').get('')
                news['publish_time'] = self._parse_datetime(pub_time)
                
                # 阅读数
                view_count = news_item.css('.article-view::text').get('')
                news['view_count'] = self._parse_int(view_count)
                
                yield Request(
                    url=news['source_url'],
                    callback=self.parse_news_detail,
                    meta={'news': news},
                    dont_filter=True
                )
                
            except Exception as e:
                logger.error(f"Error parsing news: {e}")
    
    def parse_news_detail(self, response):
        """解析资讯详情"""
        news = response.meta.get('news', {})
        
        try:
            # 正文内容
            content_html = response.css('.article-content').get('')
            news['content'] = content_html
            
            # 作者
            news['author'] = response.css('.article-author::text').get('')
            
            # 分类
            category = response.css('.article-category::text').get('')
            news['category'] = self._map_news_category(category)
            
            # 标签
            tags = response.css('.article-tags .tag::text').getall()
            news['tags'] = tags
            
            # 统计
            like_count = response.css('.article-like::text').get('')
            news['like_count'] = self._parse_int(like_count)
            
            comment_count = response.css('.article-comment::text').get('')
            news['comment_count'] = self._parse_int(comment_count)
            
            news['last_crawl_at'] = datetime.now().isoformat()
            
            yield news
            
        except Exception as e:
            logger.error(f"Error parsing news detail: {e}")
    
    def parse_price(self, response):
        """解析价格信息"""
        vehicle_id = response.meta.get('vehicle_id')
        vehicle_name = response.meta.get('vehicle_name')
        
        price_items = response.css('.price-item')
        
        for price_item in price_items:
            try:
                price = PriceItem()
                price['source'] = 'autohome'
                price['vehicle_id'] = vehicle_id
                price['vehicle_name'] = vehicle_name
                
                # 配置名称
                config_name = price_item.css('.config-name::text').get('')
                
                # 指导价
                guide_price = price_item.css('.guide-price::text').get('')
                price['price'] = self._parse_float(guide_price)
                price['price_type'] = 'guide'
                
                # 促销价
                promotion_price = price_item.css('.promotion-price::text').get('')
                if promotion_price:
                    price['promotion_price'] = self._parse_float(promotion_price)
                
                price['record_date'] = datetime.now().isoformat()
                
                yield price
                
            except Exception as e:
                logger.error(f"Error parsing price: {e}")
    
    def _extract_text(self, selector):
        """提取并清洗文本"""
        text = selector.get('')
        return text.strip() if text else ''
    
    def _extract_id_from_url(self, url: str) -> str:
        """从URL中提取ID"""
        if not url:
            return ''
        
        # 尝试提取数字ID
        match = re.search(r'/([0-9]+)', url)
        if match:
            return match.group(1)
        
        return ''
    
    def _parse_price_range(self, price_text: str):
        """解析价格范围"""
        if not price_text:
            return None, None
        
        # 匹配价格范围，如 "10.00-20.00万"
        match = re.search(r'([0-9.]+)\s*-\s*([0-9.]+)', price_text)
        if match:
            return float(match.group(1)), float(match.group(2))
        
        # 匹配单个价格
        match = re.search(r'([0-9.]+)', price_text)
        if match:
            price = float(match.group(1))
            return price, price
        
        return None, None
    
    def _parse_float(self, text: str) -> float:
        """解析浮点数"""
        if not text:
            return None
        
        match = re.search(r'([0-9.]+)', str(text))
        if match:
            try:
                return float(match.group(1))
            except ValueError:
                pass
        
        return None
    
    def _parse_int(self, text: str) -> int:
        """解析整数"""
        if not text:
            return None
        
        match = re.search(r'([0-9]+)', str(text))
        if match:
            try:
                return int(match.group(1))
            except ValueError:
                pass
        
        return None
    
    def _parse_displacement(self, text: str) -> float:
        """解析排量"""
        if not text:
            return None
        
        match = re.search(r'([0-9.]+)L', str(text))
        if match:
            try:
                return float(match.group(1))
            except ValueError:
                pass
        
        return None
    
    def _parse_datetime(self, text: str) -> str:
        """解析日期时间"""
        if not text:
            return None
        
        # 尝试多种格式
        formats = [
            '%Y-%m-%d %H:%M:%S',
            '%Y-%m-%d %H:%M',
            '%Y-%m-%d',
            '%Y年%m月%d日',
            '%m月%d日',
        ]
        
        for fmt in formats:
            try:
                dt = datetime.strptime(text.strip(), fmt)
                return dt.isoformat()
            except ValueError:
                continue
        
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
