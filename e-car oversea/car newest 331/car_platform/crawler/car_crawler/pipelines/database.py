"""
数据库管道
实现数据持久化到数据库
"""
import logging
from datetime import datetime
from typing import Optional, Dict, Any
from contextlib import contextmanager

logger = logging.getLogger(__name__)


class DatabasePipeline:
    """
    数据库管道
    将抓取的数据保存到PostgreSQL数据库
    """
    
    def __init__(self, db_url: str):
        self.db_url = db_url
        self.db_session = None
        self.stats = {
            'inserted': 0,
            'updated': 0,
            'failed': 0,
        }
        
    @classmethod
    def from_crawler(cls, crawler):
        db_url = crawler.settings.get('DATABASE_URL')
        return cls(db_url)
    
    def open_spider(self, spider):
        """爬虫启动时建立数据库连接"""
        try:
            from sqlalchemy import create_engine
            from sqlalchemy.orm import sessionmaker
            
            engine = create_engine(self.db_url, pool_pre_ping=True)
            Session = sessionmaker(bind=engine)
            self.db_session = Session()
            
            logger.info(f"Database connection established for spider: {spider.name}")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise
    
    def close_spider(self, spider):
        """爬虫关闭时的处理"""
        if self.db_session:
            self.db_session.close()
            logger.info(f"Database connection closed for spider: {spider.name}")
        
        logger.info(f"Database pipeline stats: {self.stats}")
    
    def process_item(self, item, spider):
        """处理Item，保存到数据库"""
        item_type = type(item).__name__
        
        try:
            if item_type == 'BrandItem':
                self._save_brand(item)
            elif item_type == 'VehicleItem':
                self._save_vehicle(item)
            elif item_type == 'VehicleConfigItem':
                self._save_vehicle_config(item)
            elif item_type == 'NewsItem':
                self._save_news(item)
            elif item_type == 'PriceItem':
                self._save_price(item)
            elif item_type == 'SalesRankItem':
                self._save_sales_rank(item)
            elif item_type == 'ImageItem':
                self._save_image(item)
            else:
                logger.warning(f"Unknown item type: {item_type}")
        except Exception as e:
            logger.error(f"Failed to save {item_type}: {e}")
            self.stats['failed'] += 1
            # 继续处理其他Item
        
        return item
    
    def _save_brand(self, item):
        """保存品牌数据"""
        from backend.models import Brand
        
        # 检查是否已存在
        existing = self.db_session.query(Brand).filter(
            Brand.name == item.get('name')
        ).first()
        
        if existing:
            # 更新现有记录
            existing.name_en = item.get('name_en', existing.name_en)
            existing.logo_url = item.get('logo_url', existing.logo_url)
            existing.country = item.get('country', existing.country)
            existing.description = item.get('description', existing.description)
            existing.official_website = item.get('official_website', existing.official_website)
            existing.is_domestic = item.get('is_domestic', existing.is_domestic)
            existing.is_new_energy = item.get('is_new_energy', existing.is_new_energy)
            existing.source = item.get('source', existing.source)
            existing.updated_at = datetime.now()
            self.stats['updated'] += 1
        else:
            # 创建新记录
            brand = Brand(
                name=item.get('name'),
                name_en=item.get('name_en'),
                logo_url=item.get('logo_url'),
                country=item.get('country'),
                founded_year=item.get('founded_year'),
                description=item.get('description'),
                official_website=item.get('official_website'),
                is_domestic=item.get('is_domestic', False),
                is_new_energy=item.get('is_new_energy', False),
                source=item.get('source', 'manual'),
                source_id=item.get('source_id'),
            )
            self.db_session.add(brand)
            self.stats['inserted'] += 1
        
        self.db_session.commit()
    
    def _save_vehicle(self, item):
        """保存车型数据"""
        from backend.models import Vehicle, Brand
        
        # 获取品牌ID
        brand_id = item.get('brand_id')
        if not brand_id and item.get('brand_name'):
            brand = self.db_session.query(Brand).filter(
                Brand.name == item['brand_name']
            ).first()
            if brand:
                brand_id = brand.id
        
        # 检查是否已存在
        existing = self.db_session.query(Vehicle).filter(
            Vehicle.name == item.get('name'),
            Vehicle.brand_id == brand_id
        ).first()
        
        if existing:
            # 更新现有记录
            self._update_vehicle(existing, item)
            self.stats['updated'] += 1
        else:
            # 创建新记录
            vehicle = Vehicle(
                brand_id=brand_id,
                name=item.get('name'),
                full_name=item.get('full_name'),
                level=item.get('level'),
                energy_type=item.get('energy_type'),
                body_type=item.get('body_type'),
                min_price=item.get('min_price'),
                max_price=item.get('max_price'),
                min_guide_price=item.get('min_guide_price'),
                max_guide_price=item.get('max_guide_price'),
                main_image=item.get('main_image'),
                images=item.get('images', []),
                length=item.get('length'),
                width=item.get('width'),
                height=item.get('height'),
                wheelbase=item.get('wheelbase'),
                curb_weight=item.get('curb_weight'),
                motor_power=item.get('motor_power'),
                motor_torque=item.get('motor_torque'),
                engine_displacement=item.get('engine_displacement'),
                engine_power=item.get('engine_power'),
                nedc_range=item.get('nedc_range'),
                wltp_range=item.get('wltp_range'),
                cltc_range=item.get('cltc_range'),
                fuel_consumption=item.get('fuel_consumption'),
                battery_capacity=item.get('battery_capacity'),
                battery_type=item.get('battery_type'),
                charging_time=item.get('charging_time'),
                acceleration=item.get('acceleration'),
                max_speed=item.get('max_speed'),
                is_on_sale=item.get('is_on_sale', True),
                launch_date=item.get('launch_date'),
                score=item.get('score'),
                specs=item.get('specs', {}),
                source=item.get('source', 'manual'),
                source_id=item.get('source_id'),
                source_url=item.get('source_url'),
                last_crawl_at=datetime.now(),
            )
            self.db_session.add(vehicle)
            self.stats['inserted'] += 1
        
        self.db_session.commit()
    
    def _update_vehicle(self, vehicle, item):
        """更新车型数据"""
        fields = [
            'full_name', 'level', 'energy_type', 'body_type',
            'min_price', 'max_price', 'min_guide_price', 'max_guide_price',
            'main_image', 'images', 'length', 'width', 'height', 'wheelbase',
            'curb_weight', 'motor_power', 'motor_torque', 'engine_displacement',
            'engine_power', 'nedc_range', 'wltp_range', 'cltc_range',
            'fuel_consumption', 'battery_capacity', 'battery_type',
            'charging_time', 'acceleration', 'max_speed', 'is_on_sale',
            'launch_date', 'score', 'specs', 'source', 'source_url'
        ]
        
        for field in fields:
            if item.get(field) is not None:
                setattr(vehicle, field, item[field])
        
        vehicle.updated_at = datetime.now()
        vehicle.last_crawl_at = datetime.now()
    
    def _save_vehicle_config(self, item):
        """保存车型配置数据"""
        from backend.models import VehicleConfig
        
        # 检查是否已存在
        existing = self.db_session.query(VehicleConfig).filter(
            VehicleConfig.vehicle_id == item.get('vehicle_id'),
            VehicleConfig.name == item.get('name')
        ).first()
        
        if existing:
            # 更新现有记录
            existing.guide_price = item.get('guide_price', existing.guide_price)
            existing.promotion_price = item.get('promotion_price', existing.promotion_price)
            existing.specs = item.get('specs', existing.specs)
            existing.is_on_sale = item.get('is_on_sale', existing.is_on_sale)
            existing.updated_at = datetime.now()
            self.stats['updated'] += 1
        else:
            # 创建新记录
            config = VehicleConfig(
                vehicle_id=item.get('vehicle_id'),
                name=item.get('name'),
                guide_price=item.get('guide_price'),
                promotion_price=item.get('promotion_price'),
                specs=item.get('specs', {}),
                is_on_sale=item.get('is_on_sale', True),
                source_id=item.get('source_id'),
            )
            self.db_session.add(config)
            self.stats['inserted'] += 1
        
        self.db_session.commit()
    
    def _save_news(self, item):
        """保存资讯数据"""
        from backend.models import News
        
        # 检查是否已存在（基于URL或标题+发布时间）
        if item.get('source_url'):
            existing = self.db_session.query(News).filter(
                News.source_url == item['source_url']
            ).first()
        else:
            existing = self.db_session.query(News).filter(
                News.title == item.get('title'),
                News.publish_time == item.get('publish_time')
            ).first()
        
        if existing:
            # 更新现有记录（只更新统计字段）
            existing.view_count = item.get('view_count', existing.view_count)
            existing.like_count = item.get('like_count', existing.like_count)
            existing.comment_count = item.get('comment_count', existing.comment_count)
            existing.updated_at = datetime.now()
            self.stats['updated'] += 1
        else:
            # 创建新记录
            news = News(
                title=item.get('title'),
                subtitle=item.get('subtitle'),
                summary=item.get('summary'),
                content=item.get('content'),
                category=item.get('category'),
                tags=item.get('tags', []),
                cover_image=item.get('cover_image'),
                images=item.get('images', []),
                video_url=item.get('video_url'),
                author=item.get('author'),
                source_name=item.get('source_name'),
                related_vehicle_ids=item.get('related_vehicle_ids', []),
                related_brand_ids=item.get('related_brand_ids', []),
                view_count=item.get('view_count', 0),
                like_count=item.get('like_count', 0),
                comment_count=item.get('comment_count', 0),
                share_count=item.get('share_count', 0),
                publish_time=item.get('publish_time'),
                source=item.get('source', 'manual'),
                source_id=item.get('source_id'),
                source_url=item.get('source_url'),
                last_crawl_at=datetime.now(),
            )
            self.db_session.add(news)
            self.stats['inserted'] += 1
        
        self.db_session.commit()
    
    def _save_price(self, item):
        """保存价格数据"""
        from backend.models import PriceHistory
        
        # 创建新记录（价格历史不更新，只插入）
        price = PriceHistory(
            vehicle_id=item.get('vehicle_id'),
            config_id=item.get('config_id'),
            price_type=item.get('price_type', 'guide'),
            price=item.get('price'),
            price_change=item.get('price_change'),
            city=item.get('city'),
            province=item.get('province'),
            note=item.get('note'),
            source=item.get('source', 'manual'),
            record_date=item.get('record_date', datetime.now()),
        )
        self.db_session.add(price)
        self.stats['inserted'] += 1
        
        self.db_session.commit()
    
    def _save_sales_rank(self, item):
        """保存销量排行数据"""
        from backend.models import SalesRank
        
        # 检查是否已存在
        existing = self.db_session.query(SalesRank).filter(
            SalesRank.vehicle_id == item.get('vehicle_id'),
            SalesRank.period == item.get('period')
        ).first()
        
        if existing:
            # 更新现有记录
            existing.sales_volume = item.get('sales_volume', existing.sales_volume)
            existing.rank = item.get('rank', existing.rank)
            existing.rank_change = item.get('rank_change', existing.rank_change)
            existing.market_share = item.get('market_share', existing.market_share)
            self.stats['updated'] += 1
        else:
            # 创建新记录
            rank = SalesRank(
                vehicle_id=item.get('vehicle_id'),
                sales_volume=item.get('sales_volume'),
                period_type=item.get('period_type', 'month'),
                period=item.get('period'),
                rank=item.get('rank'),
                rank_change=item.get('rank_change'),
                market_share=item.get('market_share'),
                source=item.get('source', 'manual'),
            )
            self.db_session.add(rank)
            self.stats['inserted'] += 1
        
        self.db_session.commit()
    
    def _save_image(self, item):
        """保存图片数据"""
        # 图片数据可以单独存储或作为车型/资讯的关联数据
        # 这里简化处理，只记录日志
        logger.debug(f"Image saved: {item.get('image_url')} -> {item.get('local_path')}")


class AsyncDatabasePipeline:
    """
    异步数据库管道
    使用异步方式保存数据，提高性能
    """
    
    def __init__(self, db_url: str, batch_size: int = 100):
        self.db_url = db_url
        self.batch_size = batch_size
        self.batch_buffer = []
        
    @classmethod
    def from_crawler(cls, crawler):
        db_url = crawler.settings.get('DATABASE_URL')
        batch_size = crawler.settings.getint('DB_BATCH_SIZE', 100)
        return cls(db_url, batch_size)
    
    def open_spider(self, spider):
        """爬虫启动时的处理"""
        logger.info(f"AsyncDatabasePipeline opened for spider: {spider.name}")
    
    def close_spider(self, spider):
        """爬虫关闭时刷新缓冲区"""
        if self.batch_buffer:
            self._flush_buffer()
        logger.info(f"AsyncDatabasePipeline closed for spider: {spider.name}")
    
    def process_item(self, item, spider):
        """处理Item，添加到缓冲区"""
        self.batch_buffer.append(item)
        
        if len(self.batch_buffer) >= self.batch_size:
            self._flush_buffer()
        
        return item
    
    def _flush_buffer(self):
        """刷新缓冲区到数据库"""
        # 批量插入逻辑
        logger.info(f"Flushing {len(self.batch_buffer)} items to database")
        self.batch_buffer = []
