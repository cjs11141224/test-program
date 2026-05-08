"""
图片下载管道
实现图片下载、处理、存储等功能
"""
import os
import hashlib
import logging
from urllib.parse import urlparse
from pathlib import Path

import requests
from PIL import Image
from io import BytesIO

logger = logging.getLogger(__name__)


class ImageDownloadPipeline:
    """
    图片下载管道
    下载并处理图片
    """
    
    def __init__(self, store_dir: str, thumb_sizes: dict = None):
        self.store_dir = store_dir
        self.thumb_sizes = thumb_sizes or {
            'small': (150, 100),
            'medium': (400, 300),
            'large': (800, 600),
        }
        self.downloaded_count = 0
        self.failed_count = 0
        
        # 创建存储目录
        os.makedirs(store_dir, exist_ok=True)
        for size in self.thumb_sizes.keys():
            os.makedirs(os.path.join(store_dir, size), exist_ok=True)
    
    @classmethod
    def from_crawler(cls, crawler):
        store_dir = crawler.settings.get('IMAGES_STORE', './images')
        thumb_sizes = crawler.settings.get('IMAGES_THUMBS')
        return cls(store_dir, thumb_sizes)
    
    def open_spider(self, spider):
        """爬虫启动时的处理"""
        logger.info(f"ImageDownloadPipeline opened for spider: {spider.name}")
        self.downloaded_count = 0
        self.failed_count = 0
    
    def close_spider(self, spider):
        """爬虫关闭时的处理"""
        logger.info(
            f"ImageDownloadPipeline closed for spider: {spider.name}. "
            f"Downloaded: {self.downloaded_count}, Failed: {self.failed_count}"
        )
    
    def process_item(self, item, spider):
        """处理Item，下载图片"""
        # 获取图片URL列表
        image_urls = []
        
        if hasattr(item, 'main_image') and item.get('main_image'):
            image_urls.append(item['main_image'])
        
        if hasattr(item, 'images') and item.get('images'):
            image_urls.extend(item['images'])
        
        if hasattr(item, 'cover_image') and item.get('cover_image'):
            image_urls.append(item['cover_image'])
        
        if hasattr(item, 'image_url') and item.get('image_url'):
            image_urls.append(item['image_url'])
        
        # 下载图片
        local_paths = []
        for url in image_urls:
            if url:
                local_path = self._download_image(url, spider)
                if local_path:
                    local_paths.append(local_path)
        
        # 更新Item
        if local_paths:
            item['local_images'] = local_paths
        
        return item
    
    def _download_image(self, url: str, spider) -> str:
        """下载单张图片"""
        try:
            # 生成文件名
            filename = self._generate_filename(url)
            
            # 检查是否已存在
            local_path = os.path.join(self.store_dir, filename)
            if os.path.exists(local_path):
                logger.debug(f"Image already exists: {local_path}")
                return local_path
            
            # 下载图片
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': spider.start_urls[0] if spider.start_urls else '',
            }
            
            response = requests.get(url, headers=headers, timeout=30, stream=True)
            response.raise_for_status()
            
            # 验证图片格式
            content_type = response.headers.get('content-type', '')
            if not content_type.startswith('image/'):
                logger.warning(f"Invalid content type for {url}: {content_type}")
                self.failed_count += 1
                return None
            
            # 保存原图
            with open(local_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            # 生成缩略图
            self._generate_thumbnails(local_path, filename)
            
            self.downloaded_count += 1
            logger.debug(f"Image downloaded: {url} -> {local_path}")
            
            return local_path
            
        except Exception as e:
            logger.error(f"Failed to download image {url}: {e}")
            self.failed_count += 1
            return None
    
    def _generate_filename(self, url: str) -> str:
        """生成文件名"""
        # 使用URL的MD5作为文件名
        url_hash = hashlib.md5(url.encode('utf-8')).hexdigest()
        
        # 尝试获取扩展名
        parsed = urlparse(url)
        path = parsed.path
        ext = os.path.splitext(path)[1].lower()
        
        # 如果没有扩展名或扩展名无效，使用.jpg
        if not ext or ext not in ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']:
            ext = '.jpg'
        
        return f"{url_hash}{ext}"
    
    def _generate_thumbnails(self, image_path: str, filename: str):
        """生成缩略图"""
        try:
            with Image.open(image_path) as img:
                # 转换为RGB模式（处理RGBA等）
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                for size_name, size in self.thumb_sizes.items():
                    thumb_path = os.path.join(self.store_dir, size_name, filename)
                    
                    # 如果缩略图已存在，跳过
                    if os.path.exists(thumb_path):
                        continue
                    
                    # 生成缩略图
                    thumb = img.copy()
                    thumb.thumbnail(size, Image.Resampling.LANCZOS)
                    
                    # 保存缩略图
                    thumb.save(thumb_path, 'JPEG', quality=85)
                    
        except Exception as e:
            logger.error(f"Failed to generate thumbnails for {image_path}: {e}")


class ImageValidationPipeline:
    """
    图片验证管道
    验证图片的完整性、格式等
    """
    
    def __init__(self):
        self.allowed_formats = ['JPEG', 'PNG', 'GIF', 'WEBP', 'BMP']
        self.min_size = (100, 100)  # 最小尺寸
        self.max_size = (10000, 10000)  # 最大尺寸
    
    def process_item(self, item, spider):
        """处理Item，验证图片"""
        if hasattr(item, 'local_images') and item.get('local_images'):
            valid_images = []
            
            for image_path in item['local_images']:
                if self._validate_image(image_path):
                    valid_images.append(image_path)
                else:
                    logger.warning(f"Invalid image removed: {image_path}")
            
            item['local_images'] = valid_images
        
        return item
    
    def _validate_image(self, image_path: str) -> bool:
        """验证图片"""
        try:
            with Image.open(image_path) as img:
                # 检查格式
                if img.format not in self.allowed_formats:
                    logger.warning(f"Invalid image format: {img.format}")
                    return False
                
                # 检查尺寸
                width, height = img.size
                if width < self.min_size[0] or height < self.min_size[1]:
                    logger.warning(f"Image too small: {width}x{height}")
                    return False
                
                if width > self.max_size[0] or height > self.max_size[1]:
                    logger.warning(f"Image too large: {width}x{height}")
                    return False
                
                return True
                
        except Exception as e:
            logger.error(f"Failed to validate image {image_path}: {e}")
            return False


class ImageDeduplicationPipeline:
    """
    图片去重管道
    基于图片内容哈希去重
    """
    
    def __init__(self):
        self.seen_hashes = set()
    
    def process_item(self, item, spider):
        """处理Item，去重图片"""
        if hasattr(item, 'local_images') and item.get('local_images'):
            unique_images = []
            
            for image_path in item['local_images']:
                image_hash = self._compute_image_hash(image_path)
                
                if image_hash and image_hash not in self.seen_hashes:
                    self.seen_hashes.add(image_hash)
                    unique_images.append(image_path)
                else:
                    logger.debug(f"Duplicate image removed: {image_path}")
                    # 删除重复图片
                    try:
                        os.remove(image_path)
                    except Exception:
                        pass
            
            item['local_images'] = unique_images
        
        return item
    
    def _compute_image_hash(self, image_path: str) -> str:
        """计算图片哈希"""
        try:
            with Image.open(image_path) as img:
                # 缩小图片以加快计算
                img = img.convert('L')  # 转为灰度
                img = img.resize((16, 16), Image.Resampling.LANCZOS)
                
                # 计算平均哈希
                pixels = list(img.getdata())
                avg = sum(pixels) / len(pixels)
                
                # 生成哈希
                bits = ''.join('1' if p > avg else '0' for p in pixels)
                return hex(int(bits, 2))[2:]
                
        except Exception as e:
            logger.error(f"Failed to compute hash for {image_path}: {e}")
            return None
