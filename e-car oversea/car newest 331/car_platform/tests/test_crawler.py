"""
爬虫测试
测试爬虫功能的正确性和稳定性
"""
import pytest
import json
from datetime import datetime
from pathlib import Path

# 添加爬虫路径
import sys
sys.path.insert(0, str(Path(__file__).parent.parent / 'crawler'))

from car_crawler.items import BrandItem, VehicleItem, NewsItem, PriceItem
from car_crawler.pipelines.validation import ValidationPipeline
from car_crawler.pipelines.duplicate import DuplicatePipeline


class TestItems:
    """测试Item类"""
    
    def test_brand_item_creation(self):
        """测试品牌Item创建"""
        brand = BrandItem()
        brand['name'] = '测试品牌'
        brand['source'] = 'test'
        brand['source_id'] = '123'
        
        assert brand['name'] == '测试品牌'
        assert brand['source'] == 'test'
        assert 'crawl_time' in brand
    
    def test_vehicle_item_creation(self):
        """测试车型Item创建"""
        vehicle = VehicleItem()
        vehicle['name'] = '测试车型'
        vehicle['brand_name'] = '测试品牌'
        vehicle['min_price'] = 10.0
        vehicle['max_price'] = 20.0
        
        assert vehicle['name'] == '测试车型'
        assert vehicle['min_price'] == 10.0
    
    def test_news_item_creation(self):
        """测试资讯Item创建"""
        news = NewsItem()
        news['title'] = '测试标题'
        news['content'] = '测试内容'
        news['category'] = 'NEW_CAR'
        
        assert news['title'] == '测试标题'
        assert news['category'] == 'NEW_CAR'


class TestValidationPipeline:
    """测试验证管道"""
    
    @pytest.fixture
    def pipeline(self):
        return ValidationPipeline()
    
    def test_validate_brand(self, pipeline):
        """测试品牌验证"""
        brand = BrandItem()
        brand['name'] = '测试品牌'
        brand['source'] = 'test'
        
        result = pipeline._validate_brand(brand)
        assert result['valid'] is True
    
    def test_validate_brand_empty_name(self, pipeline):
        """测试品牌名为空的验证"""
        brand = BrandItem()
        brand['name'] = ''
        brand['source'] = 'test'
        
        result = pipeline._validate_brand(brand)
        assert result['valid'] is False
        assert 'Brand name is required' in result['errors']
    
    def test_validate_vehicle(self, pipeline):
        """测试车型验证"""
        vehicle = VehicleItem()
        vehicle['name'] = '测试车型'
        vehicle['brand_name'] = '测试品牌'
        vehicle['min_price'] = 10.0
        vehicle['max_price'] = 20.0
        
        result = pipeline._validate_vehicle(vehicle)
        assert result['valid'] is True
    
    def test_validate_vehicle_invalid_price(self, pipeline):
        """测试车型价格验证"""
        vehicle = VehicleItem()
        vehicle['name'] = '测试车型'
        vehicle['min_price'] = -1
        
        result = pipeline._validate_vehicle(vehicle)
        assert result['valid'] is False
    
    def test_clean_text(self, pipeline):
        """测试文本清洗"""
        text = "  测试  文本  "
        result = pipeline._clean_text(text)
        assert result == "测试 文本"
    
    def test_parse_datetime(self, pipeline):
        """测试日期时间解析"""
        # 测试标准格式
        result = pipeline._parse_datetime('2025-01-15 10:30:00')
        assert result is not None
        
        # 测试日期格式
        result = pipeline._parse_datetime('2025-01-15')
        assert result is not None
        
        # 测试空值
        result = pipeline._parse_datetime(None)
        assert result is None


class TestDuplicatePipeline:
    """测试去重管道"""
    
    @pytest.fixture
    def pipeline(self):
        return DuplicatePipeline()
    
    def test_get_duplicate_id_brand(self, pipeline):
        """测试品牌去重标识"""
        brand = BrandItem()
        brand['name'] = '测试品牌'
        
        dup_id = pipeline._get_duplicate_id(brand)
        assert 'brand:测试品牌' == dup_id
    
    def test_get_duplicate_id_vehicle(self, pipeline):
        """测试车型去重标识"""
        vehicle = VehicleItem()
        vehicle['brand_name'] = '测试品牌'
        vehicle['name'] = '测试车型'
        
        dup_id = pipeline._get_duplicate_id(vehicle)
        assert 'vehicle:测试品牌:测试车型' == dup_id
    
    def test_generate_signature(self, pipeline):
        """测试内容签名生成"""
        vehicle = VehicleItem()
        vehicle['name'] = '测试车型'
        vehicle['brand_name'] = '测试品牌'
        vehicle['min_price'] = 10.0
        
        signature = pipeline._generate_signature(vehicle)
        assert len(signature) == 32  # MD5签名长度


class TestDataTransform:
    """测试数据转换"""
    
    def test_price_unit_conversion(self):
        """测试价格单位转换"""
        from car_crawler.pipelines.validation import DataTransformPipeline
        
        pipeline = DataTransformPipeline()
        
        vehicle = VehicleItem()
        vehicle['min_price'] = 150000  # 元
        vehicle['max_price'] = 250000  # 元
        
        result = pipeline._transform_vehicle(vehicle)
        
        # 应该转换为万元
        assert result['min_price'] == 15.0
        assert result['max_price'] == 25.0


class TestSpiderConfiguration:
    """测试爬虫配置"""
    
    def test_settings_import(self):
        """测试配置导入"""
        try:
            from car_crawler import settings
            assert hasattr(settings, 'BOT_NAME')
            assert hasattr(settings, 'DOWNLOAD_DELAY')
            assert hasattr(settings, 'CONCURRENT_REQUESTS')
        except ImportError:
            pytest.skip("Settings not available")
    
    def test_user_agent_list(self):
        """测试User-Agent列表"""
        try:
            from car_crawler import settings
            assert len(settings.USER_AGENT_LIST) > 0
            assert all('Mozilla' in ua for ua in settings.USER_AGENT_LIST)
        except ImportError:
            pytest.skip("Settings not available")


class TestMiddleware:
    """测试中间件"""
    
    def test_proxy_class(self):
        """测试代理类"""
        try:
            from car_crawler.middlewares.proxy import Proxy
            
            proxy = Proxy('192.168.1.1', 8080, 'http')
            assert proxy.ip == '192.168.1.1'
            assert proxy.port == 8080
            assert proxy.url == 'http://192.168.1.1:8080'
            
            # 测试成功记录
            proxy.record_success(100)
            assert proxy.success_count == 1
            assert proxy.is_active is True
            
            # 测试失败记录
            proxy.record_failure()
            assert proxy.fail_count == 1
        except ImportError:
            pytest.skip("Proxy middleware not available")


class TestCrawlStats:
    """测试爬虫统计"""
    
    def test_crawl_task_item(self):
        """测试爬虫任务Item"""
        from car_crawler.items import CrawlTaskItem
        
        task = CrawlTaskItem()
        task['task_name'] = '测试任务'
        task['task_type'] = 'vehicle'
        task['status'] = 'success'
        task['total_count'] = 100
        task['success_count'] = 95
        task['fail_count'] = 5
        
        assert task['task_name'] == '测试任务'
        assert task['success_rate'] == 95.0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
