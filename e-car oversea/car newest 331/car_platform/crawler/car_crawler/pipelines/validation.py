"""
数据验证管道
实现数据清洗、验证、转换等功能
"""
import re
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
from scrapy.exceptions import DropItem

logger = logging.getLogger(__name__)


class ValidationPipeline:
    """
    数据验证管道
    对抓取的数据进行验证和清洗
    """
    
    def __init__(self):
        self.validation_errors = []
        self.dropped_count = 0
        
    def process_item(self, item, spider):
        """处理Item"""
        item_type = type(item).__name__
        
        # 根据Item类型选择验证器
        validator = self._get_validator(item_type)
        
        if validator:
            result = validator(item)
            if not result['valid']:
                self.dropped_count += 1
                logger.warning(f"Item validation failed: {result['errors']}")
                raise DropItem(f"Validation failed: {result['errors']}")
        
        # 通用清洗
        item = self._clean_item(item)
        
        return item
    
    def _get_validator(self, item_type: str):
        """获取验证器"""
        validators = {
            'BrandItem': self._validate_brand,
            'VehicleItem': self._validate_vehicle,
            'NewsItem': self._validate_news,
            'PriceItem': self._validate_price,
            'SalesRankItem': self._validate_sales_rank,
        }
        return validators.get(item_type)
    
    def _validate_brand(self, item) -> Dict:
        """验证品牌数据"""
        errors = []
        
        # 检查必需字段
        if not item.get('name'):
            errors.append("Brand name is required")
        
        # 清洗数据
        if item.get('name'):
            item['name'] = self._clean_text(item['name'])
        
        return {'valid': len(errors) == 0, 'errors': errors}
    
    def _validate_vehicle(self, item) -> Dict:
        """验证车型数据"""
        errors = []
        
        # 检查必需字段
        if not item.get('name'):
            errors.append("Vehicle name is required")
        
        # 验证价格
        if item.get('min_price') is not None:
            try:
                min_price = float(item['min_price'])
                if min_price < 0 or min_price > 10000:
                    errors.append(f"Invalid min_price: {min_price}")
                else:
                    item['min_price'] = round(min_price, 2)
            except (ValueError, TypeError):
                errors.append(f"Invalid min_price format: {item['min_price']}")
        
        if item.get('max_price') is not None:
            try:
                max_price = float(item['max_price'])
                if max_price < 0 or max_price > 10000:
                    errors.append(f"Invalid max_price: {max_price}")
                else:
                    item['max_price'] = round(max_price, 2)
            except (ValueError, TypeError):
                errors.append(f"Invalid max_price format: {item['max_price']}")
        
        # 验证尺寸参数
        for field in ['length', 'width', 'height', 'wheelbase']:
            if item.get(field) is not None:
                try:
                    value = int(float(item[field]))
                    if value < 0 or value > 10000:
                        errors.append(f"Invalid {field}: {value}")
                    else:
                        item[field] = value
                except (ValueError, TypeError):
                    errors.append(f"Invalid {field} format: {item[field]}")
        
        # 清洗文本字段
        for field in ['name', 'full_name', 'body_type']:
            if item.get(field):
                item[field] = self._clean_text(item[field])
        
        return {'valid': len(errors) == 0, 'errors': errors}
    
    def _validate_news(self, item) -> Dict:
        """验证资讯数据"""
        errors = []
        
        # 检查必需字段
        if not item.get('title'):
            errors.append("News title is required")
        
        # 验证标题长度
        if item.get('title') and len(item['title']) > 300:
            item['title'] = item['title'][:300]
        
        # 清洗内容
        if item.get('content'):
            item['content'] = self._clean_html(item['content'])
        
        if item.get('summary'):
            item['summary'] = self._clean_text(item['summary'])
        
        # 验证发布时间
        if item.get('publish_time'):
            item['publish_time'] = self._parse_datetime(item['publish_time'])
        
        return {'valid': len(errors) == 0, 'errors': errors}
    
    def _validate_price(self, item) -> Dict:
        """验证价格数据"""
        errors = []
        
        # 检查必需字段
        if item.get('price') is None:
            errors.append("Price is required")
        else:
            try:
                price = float(item['price'])
                if price < 0 or price > 10000:
                    errors.append(f"Invalid price: {price}")
                else:
                    item['price'] = round(price, 2)
            except (ValueError, TypeError):
                errors.append(f"Invalid price format: {item['price']}")
        
        # 验证记录日期
        if item.get('record_date'):
            item['record_date'] = self._parse_datetime(item['record_date'])
        
        return {'valid': len(errors) == 0, 'errors': errors}
    
    def _validate_sales_rank(self, item) -> Dict:
        """验证销量排行数据"""
        errors = []
        
        # 检查必需字段
        if item.get('sales_volume') is None:
            errors.append("Sales volume is required")
        else:
            try:
                volume = int(item['sales_volume'])
                if volume < 0:
                    errors.append(f"Invalid sales_volume: {volume}")
                else:
                    item['sales_volume'] = volume
            except (ValueError, TypeError):
                errors.append(f"Invalid sales_volume format: {item['sales_volume']}")
        
        if item.get('rank') is None:
            errors.append("Rank is required")
        else:
            try:
                rank = int(item['rank'])
                if rank < 1:
                    errors.append(f"Invalid rank: {rank}")
                else:
                    item['rank'] = rank
            except (ValueError, TypeError):
                errors.append(f"Invalid rank format: {item['rank']}")
        
        return {'valid': len(errors) == 0, 'errors': errors}
    
    def _clean_item(self, item):
        """通用Item清洗"""
        # 清洗所有字符串字段
        for key, value in item.items():
            if isinstance(value, str):
                item[key] = self._clean_text(value)
        
        # 设置默认值
        if not item.get('source'):
            item['source'] = 'unknown'
        
        if not item.get('crawl_time'):
            item['crawl_time'] = datetime.now().isoformat()
        
        return item
    
    def _clean_text(self, text: str) -> str:
        """清洗文本"""
        if not text:
            return ''
        
        # 去除空白字符
        text = text.strip()
        
        # 去除多余空格
        text = re.sub(r'\s+', ' ', text)
        
        # 去除特殊字符
        text = re.sub(r'[\x00-\x08\x0b-\x0c\x0e-\x1f]', '', text)
        
        return text
    
    def _clean_html(self, html: str) -> str:
        """清洗HTML内容"""
        if not html:
            return ''
        
        # 去除script标签
        html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL)
        
        # 去除style标签
        html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL)
        
        # 去除HTML注释
        html = re.sub(r'<!--.*?-->', '', html, flags=re.DOTALL)
        
        # 去除多余空白
        html = re.sub(r'>\s+<', '><', html)
        
        return html.strip()
    
    def _parse_datetime(self, dt: Any) -> Optional[str]:
        """解析日期时间"""
        if not dt:
            return None
        
        if isinstance(dt, datetime):
            return dt.isoformat()
        
        if isinstance(dt, str):
            # 尝试多种格式
            formats = [
                '%Y-%m-%d %H:%M:%S',
                '%Y-%m-%d %H:%M',
                '%Y-%m-%d',
                '%Y/%m/%d %H:%M:%S',
                '%Y/%m/%d',
                '%d-%m-%Y',
                '%d/%m/%Y',
            ]
            
            for fmt in formats:
                try:
                    parsed = datetime.strptime(dt.strip(), fmt)
                    return parsed.isoformat()
                except ValueError:
                    continue
        
        return dt


class DataTransformPipeline:
    """
    数据转换管道
    实现数据格式转换、单位转换等
    """
    
    def process_item(self, item, spider):
        """处理Item"""
        item_type = type(item).__name__
        
        # 根据Item类型进行转换
        if item_type == 'VehicleItem':
            item = self._transform_vehicle(item)
        elif item_type == 'PriceItem':
            item = self._transform_price(item)
        
        return item
    
    def _transform_vehicle(self, item):
        """转换车型数据"""
        # 价格单位转换（元->万元）
        for field in ['min_price', 'max_price', 'min_guide_price', 'max_guide_price']:
            if item.get(field) is not None:
                value = float(item[field])
                if value > 10000:  # 假设大于10000的是元
                    item[field] = round(value / 10000, 2)
        
        # 标准化能源类型
        if item.get('energy_type'):
            energy_map = {
                '纯电动': '纯电动',
                '纯电': '纯电动',
                'EV': '纯电动',
                '插电混动': '插电混动',
                '插电': '插电混动',
                'PHEV': '插电混动',
                '增程式': '增程式',
                '增程': '增程式',
                'EREV': '增程式',
                '油电混动': '油电混动',
                '混动': '油电混动',
                'HEV': '油电混动',
                '汽油': '汽油',
                '燃油': '汽油',
                '柴油': '柴油',
            }
            item['energy_type'] = energy_map.get(item['energy_type'], item['energy_type'])
        
        # 标准化车型级别
        if item.get('level'):
            level_map = {
                '微型车': '微型车',
                '小型车': '小型车',
                '紧凑型车': '紧凑型车',
                '紧凑型': '紧凑型车',
                '中型车': '中型车',
                '中型': '中型车',
                '中大型车': '中大型车',
                '中大型': '中大型车',
                '大型车': '大型车',
                '小型SUV': '小型SUV',
                '紧凑型SUV': '紧凑型SUV',
                '中型SUV': '中型SUV',
                '中大型SUV': '中大型SUV',
                '大型SUV': '大型SUV',
                'MPV': 'MPV',
                '皮卡': '皮卡',
            }
            item['level'] = level_map.get(item['level'], item['level'])
        
        return item
    
    def _transform_price(self, item):
        """转换价格数据"""
        # 价格单位转换
        if item.get('price') is not None:
            value = float(item['price'])
            if value > 10000:
                item['price'] = round(value / 10000, 2)
        
        return item
