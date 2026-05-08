"""
API测试
测试后端API接口的正确性
"""
import pytest
import requests
from typing import Dict, Any

# API基础URL
BASE_URL = "http://localhost:8000/api"


class TestAPI:
    """API测试类"""
    
    @pytest.fixture
    def base_url(self):
        return BASE_URL
    
    def test_health_check(self, base_url):
        """测试健康检查接口"""
        response = requests.get(f"{base_url}/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
    
    def test_get_brands(self, base_url):
        """测试获取品牌列表接口"""
        response = requests.get(f"{base_url}/brands")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            brand = data[0]
            assert "id" in brand
            assert "name" in brand
            assert "logo_url" in brand
    
    def test_get_brands_with_filter(self, base_url):
        """测试带筛选条件的品牌列表接口"""
        # 测试国产品牌筛选
        response = requests.get(f"{base_url}/brands", params={"is_domestic": True})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # 测试新能源品牌筛选
        response = requests.get(f"{base_url}/brands", params={"is_new_energy": True})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_brand_detail(self, base_url):
        """测试获取品牌详情接口"""
        # 先获取品牌列表
        response = requests.get(f"{base_url}/brands")
        brands = response.json()
        
        if len(brands) > 0:
            brand_id = brands[0]["id"]
            response = requests.get(f"{base_url}/brands/{brand_id}")
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == brand_id
    
    def test_get_brand_detail_not_found(self, base_url):
        """测试获取不存在的品牌详情"""
        response = requests.get(f"{base_url}/brands/99999")
        assert response.status_code == 404
    
    def test_get_vehicles(self, base_url):
        """测试获取车型列表接口"""
        response = requests.get(f"{base_url}/vehicles")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_vehicles_with_filter(self, base_url):
        """测试带筛选条件的车型列表接口"""
        params = {
            "is_on_sale": True,
            "page": 1,
            "page_size": 10
        }
        response = requests.get(f"{base_url}/vehicles", params=params)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_vehicles_with_keyword(self, base_url):
        """测试关键词搜索车型"""
        response = requests.get(f"{base_url}/vehicles", params={"keyword": "比亚迪"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_vehicle_detail(self, base_url):
        """测试获取车型详情接口"""
        # 先获取车型列表
        response = requests.get(f"{base_url}/vehicles", params={"page_size": 1})
        vehicles = response.json()
        
        if len(vehicles) > 0:
            vehicle_id = vehicles[0]["id"]
            response = requests.get(f"{base_url}/vehicles/{vehicle_id}")
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == vehicle_id
            assert "name" in data
            assert "brand_name" in data
    
    def test_get_vehicle_prices(self, base_url):
        """测试获取车型价格历史接口"""
        response = requests.get(f"{base_url}/vehicles", params={"page_size": 1})
        vehicles = response.json()
        
        if len(vehicles) > 0:
            vehicle_id = vehicles[0]["id"]
            response = requests.get(f"{base_url}/vehicles/{vehicle_id}/prices")
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
    
    def test_get_news(self, base_url):
        """测试获取资讯列表接口"""
        response = requests.get(f"{base_url}/news")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_news_with_filter(self, base_url):
        """测试带筛选条件的资讯列表接口"""
        params = {
            "page": 1,
            "page_size": 10
        }
        response = requests.get(f"{base_url}/news", params=params)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_news_detail(self, base_url):
        """测试获取资讯详情接口"""
        response = requests.get(f"{base_url}/news", params={"page_size": 1})
        news_list = response.json()
        
        if len(news_list) > 0:
            news_id = news_list[0]["id"]
            response = requests.get(f"{base_url}/news/{news_id}")
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == news_id
            assert "title" in data
    
    def test_get_latest_prices(self, base_url):
        """测试获取最新价格接口"""
        response = requests.get(f"{base_url}/prices/latest")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_sales_rank(self, base_url):
        """测试获取销量排行接口"""
        response = requests.get(f"{base_url}/sales-rank")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            rank = data[0]
            assert "vehicle_id" in rank
            assert "sales_volume" in rank
            assert "rank" in rank
    
    def test_get_filters(self, base_url):
        """测试获取筛选条件接口"""
        response = requests.get(f"{base_url}/filters")
        assert response.status_code == 200
        data = response.json()
        assert "brands" in data
        assert "levels" in data
        assert "energy_types" in data
        assert "price_ranges" in data
    
    def test_get_stats(self, base_url):
        """测试获取统计数据接口"""
        response = requests.get(f"{base_url}/stats")
        assert response.status_code == 200
        data = response.json()
        assert "brand_count" in data
        assert "vehicle_count" in data
        assert "news_count" in data
        assert "update_time" in data


class TestAPIPerformance:
    """API性能测试"""
    
    def test_response_time(self):
        """测试API响应时间"""
        import time
        
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/vehicles", params={"page_size": 20})
        end_time = time.time()
        
        assert response.status_code == 200
        assert end_time - start_time < 2  # 响应时间应小于2秒
    
    def test_concurrent_requests(self):
        """测试并发请求"""
        import concurrent.futures
        
        def make_request():
            response = requests.get(f"{BASE_URL}/vehicles", params={"page_size": 10})
            return response.status_code
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_request) for _ in range(10)]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]
        
        assert all(status == 200 for status in results)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
