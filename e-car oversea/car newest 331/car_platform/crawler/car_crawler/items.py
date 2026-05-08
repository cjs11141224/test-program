"""
爬虫Item定义
定义抓取的数据结构
"""
import scrapy
from datetime import datetime
from typing import Optional, List, Dict


class BaseItem(scrapy.Item):
    """基础Item类"""
    
    # 元数据
    source = scrapy.Field()  # 数据来源
    source_id = scrapy.Field()  # 源站ID
    source_url = scrapy.Field()  # 源站链接
    crawl_time = scrapy.Field()  # 抓取时间
    spider_name = scrapy.Field()  # 爬虫名称
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self['crawl_time'] = datetime.now().isoformat()


class BrandItem(BaseItem):
    """品牌Item"""
    
    name = scrapy.Field()  # 品牌名称
    name_en = scrapy.Field()  # 英文名称
    logo_url = scrapy.Field()  # Logo URL
    country = scrapy.Field()  # 所属国家
    founded_year = scrapy.Field()  # 创立年份
    description = scrapy.Field()  # 品牌介绍
    official_website = scrapy.Field()  # 官网链接
    is_domestic = scrapy.Field()  # 是否国产
    is_new_energy = scrapy.Field()  # 是否新能源品牌


class VehicleItem(BaseItem):
    """车型Item"""
    
    # 基本信息
    brand_id = scrapy.Field()  # 品牌ID
    brand_name = scrapy.Field()  # 品牌名称
    name = scrapy.Field()  # 车型名称
    full_name = scrapy.Field()  # 完整名称
    
    # 分类信息
    level = scrapy.Field()  # 车型级别
    energy_type = scrapy.Field()  # 能源类型
    body_type = scrapy.Field()  # 车身类型
    
    # 价格信息
    min_price = scrapy.Field()  # 最低价格
    max_price = scrapy.Field()  # 最高价格
    min_guide_price = scrapy.Field()  # 最低指导价
    max_guide_price = scrapy.Field()  # 最高指导价
    
    # 图片
    main_image = scrapy.Field()  # 主图
    images = scrapy.Field()  # 图片列表
    
    # 基本参数
    length = scrapy.Field()  # 车长(mm)
    width = scrapy.Field()  # 车宽(mm)
    height = scrapy.Field()  # 车高(mm)
    wheelbase = scrapy.Field()  # 轴距(mm)
    curb_weight = scrapy.Field()  # 整备质量(kg)
    
    # 动力系统
    motor_power = scrapy.Field()  # 电机功率(kW)
    motor_torque = scrapy.Field()  # 电机扭矩(N·m)
    engine_displacement = scrapy.Field()  # 发动机排量(L)
    engine_power = scrapy.Field()  # 发动机功率(kW)
    
    # 续航/能耗
    nedc_range = scrapy.Field()  # NEDC续航(km)
    wltp_range = scrapy.Field()  # WLTP续航(km)
    cltc_range = scrapy.Field()  # CLTC续航(km)
    fuel_consumption = scrapy.Field()  # 百公里油耗(L)
    
    # 电池信息
    battery_capacity = scrapy.Field()  # 电池容量(kWh)
    battery_type = scrapy.Field()  # 电池类型
    charging_time = scrapy.Field()  # 充电时间
    
    # 性能参数
    acceleration = scrapy.Field()  # 百公里加速(s)
    max_speed = scrapy.Field()  # 最高车速(km/h)
    
    # 销售信息
    is_on_sale = scrapy.Field()  # 是否在售
    launch_date = scrapy.Field()  # 上市日期
    
    # 评分
    score = scrapy.Field()  # 综合评分
    review_count = scrapy.Field()  # 评价数量
    
    # 详细参数
    specs = scrapy.Field()  # 详细参数JSON
    
    # 配置版本
    configurations = scrapy.Field()  # 配置版本列表


class VehicleConfigItem(BaseItem):
    """车型配置版本Item"""
    
    vehicle_id = scrapy.Field()  # 车型ID
    vehicle_name = scrapy.Field()  # 车型名称
    name = scrapy.Field()  # 配置名称
    guide_price = scrapy.Field()  # 指导价
    promotion_price = scrapy.Field()  # 促销价
    specs = scrapy.Field()  # 配置详情
    is_on_sale = scrapy.Field()  # 是否在售


class PriceItem(BaseItem):
    """价格Item"""
    
    vehicle_id = scrapy.Field()  # 车型ID
    vehicle_name = scrapy.Field()  # 车型名称
    config_id = scrapy.Field()  # 配置ID
    price_type = scrapy.Field()  # 价格类型
    price = scrapy.Field()  # 价格
    price_change = scrapy.Field()  # 价格变动
    city = scrapy.Field()  # 城市
    province = scrapy.Field()  # 省份
    note = scrapy.Field()  # 备注
    record_date = scrapy.Field()  # 记录日期


class NewsItem(BaseItem):
    """资讯Item"""
    
    # 基本信息
    title = scrapy.Field()  # 标题
    subtitle = scrapy.Field()  # 副标题
    summary = scrapy.Field()  # 摘要
    content = scrapy.Field()  # 正文内容
    
    # 分类
    category = scrapy.Field()  # 分类
    tags = scrapy.Field()  # 标签
    
    # 媒体
    cover_image = scrapy.Field()  # 封面图
    images = scrapy.Field()  # 图片列表
    video_url = scrapy.Field()  # 视频链接
    
    # 作者信息
    author = scrapy.Field()  # 作者
    source_name = scrapy.Field()  # 来源名称
    
    # 关联
    related_vehicle_ids = scrapy.Field()  # 关联车型ID
    related_brand_ids = scrapy.Field()  # 关联品牌ID
    
    # 统计
    view_count = scrapy.Field()  # 阅读数
    like_count = scrapy.Field()  # 点赞数
    comment_count = scrapy.Field()  # 评论数
    share_count = scrapy.Field()  # 分享数
    
    # 发布时间
    publish_time = scrapy.Field()  # 发布时间


class SalesRankItem(BaseItem):
    """销量排行Item"""
    
    vehicle_id = scrapy.Field()  # 车型ID
    vehicle_name = scrapy.Field()  # 车型名称
    sales_volume = scrapy.Field()  # 销量
    period_type = scrapy.Field()  # 周期类型
    period = scrapy.Field()  # 周期
    rank = scrapy.Field()  # 排名
    rank_change = scrapy.Field()  # 排名变化
    market_share = scrapy.Field()  # 市场份额


class CommentItem(BaseItem):
    """用户评论Item"""
    
    vehicle_id = scrapy.Field()  # 车型ID
    user_name = scrapy.Field()  # 用户名
    rating = scrapy.Field()  # 评分
    content = scrapy.Field()  # 评论内容
    purchase_date = scrapy.Field()  # 购买日期
    mileage = scrapy.Field()  # 行驶里程
    helpful_count = scrapy.Field()  # 有用数
    reply_count = scrapy.Field()  # 回复数
    publish_time = scrapy.Field()  # 发布时间


class ImageItem(BaseItem):
    """图片Item"""
    
    vehicle_id = scrapy.Field()  # 车型ID
    image_type = scrapy.Field()  # 图片类型
    image_url = scrapy.Field()  # 图片URL
    local_path = scrapy.Field()  # 本地路径
    title = scrapy.Field()  # 图片标题
    description = scrapy.Field()  # 图片描述


class DealerItem(BaseItem):
    """经销商Item"""
    
    name = scrapy.Field()  # 经销商名称
    brand_ids = scrapy.Field()  # 经营品牌ID
    province = scrapy.Field()  # 省份
    city = scrapy.Field()  # 城市
    district = scrapy.Field()  # 区县
    address = scrapy.Field()  # 地址
    phone = scrapy.Field()  # 电话
    longitude = scrapy.Field()  # 经度
    latitude = scrapy.Field()  # 纬度
    business_hours = scrapy.Field()  # 营业时间
    services = scrapy.Field()  # 服务项目


class CrawlTaskItem(scrapy.Item):
    """爬虫任务Item"""
    
    task_name = scrapy.Field()  # 任务名称
    task_type = scrapy.Field()  # 任务类型
    status = scrapy.Field()  # 状态
    start_time = scrapy.Field()  # 开始时间
    end_time = scrapy.Field()  # 结束时间
    total_count = scrapy.Field()  # 总数
    success_count = scrapy.Field()  # 成功数
    fail_count = scrapy.Field()  # 失败数
    error_message = scrapy.Field()  # 错误信息
    logs = scrapy.Field()  # 日志
