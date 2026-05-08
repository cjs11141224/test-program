"""
数据库模型定义
包含车型、品牌、资讯、价格、用户等核心实体
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey, JSON, Index, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum
from datetime import datetime


class EnergyType(str, enum.Enum):
    """能源类型枚举"""
    PURE_ELECTRIC = "纯电动"
    PLUG_IN_HYBRID = "插电混动"
    EXTENDED_RANGE = "增程式"
    HYBRID = "油电混动"
    GASOLINE = "汽油"
    DIESEL = "柴油"


class VehicleLevel(str, enum.Enum):
    """车型级别枚举"""
    MINI = "微型车"
    SMALL = "小型车"
    COMPACT = "紧凑型车"
    MIDSIZE = "中型车"
    LARGE = "中大型车"
    LUXURY = "大型车"
    SMALL_SUV = "小型SUV"
    COMPACT_SUV = "紧凑型SUV"
    MIDSIZE_SUV = "中型SUV"
    LARGE_SUV = "中大型SUV"
    FULLSIZE_SUV = "大型SUV"
    MPV = "MPV"
    PICKUP = "皮卡"


class NewsCategory(str, enum.Enum):
    """资讯分类枚举"""
    INDUSTRY = "行业新闻"
    NEW_CAR = "新车发布"
    REVIEW = "评测导购"
    PRICE = "价格动态"
    TECH = "技术解析"
    POLICY = "政策法规"
    MARKET = "市场分析"


class DataSource(str, enum.Enum):
    """数据来源枚举"""
    AUTOHOME = "汽车之家"
    DONGCHEDI = "懂车帝"
    YICHE = "易车"
    PCAUTO = "太平洋汽车"
    NETEASE = "网易汽车"
    SOHU = "搜狐汽车"
    MANUAL = "人工录入"


class Brand(Base):
    """汽车品牌表"""
    __tablename__ = "brands"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True, comment="品牌名称")
    name_en = Column(String(100), nullable=True, comment="英文名称")
    logo_url = Column(String(500), nullable=True, comment="品牌Logo")
    country = Column(String(50), nullable=True, comment="所属国家")
    founded_year = Column(Integer, nullable=True, comment="创立年份")
    description = Column(Text, nullable=True, comment="品牌介绍")
    official_website = Column(String(200), nullable=True, comment="官网链接")
    is_domestic = Column(Boolean, default=False, comment="是否国产品牌")
    is_new_energy = Column(Boolean, default=False, comment="是否新能源品牌")
    display_order = Column(Integer, default=0, comment="显示顺序")
    
    # 统计字段
    vehicle_count = Column(Integer, default=0, comment="车型数量")
    
    # 元数据
    source = Column(SQLEnum(DataSource), default=DataSource.MANUAL, comment="数据来源")
    source_id = Column(String(100), nullable=True, comment="源站ID")
    is_active = Column(Boolean, default=True, comment="是否启用")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    vehicles = relationship("Vehicle", back_populates="brand")
    
    __table_args__ = (
        Index('idx_brand_name', 'name'),
        Index('idx_brand_country', 'country'),
    )


class Vehicle(Base):
    """车型信息表"""
    __tablename__ = "vehicles"
    
    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False, index=True, comment="车型名称")
    full_name = Column(String(300), nullable=True, comment="完整名称")
    
    # 基本信息
    level = Column(SQLEnum(VehicleLevel), nullable=True, comment="车型级别")
    energy_type = Column(SQLEnum(EnergyType), nullable=True, comment="能源类型")
    body_type = Column(String(50), nullable=True, comment="车身类型")
    
    # 价格信息
    min_price = Column(Float, nullable=True, comment="最低指导价(万元)")
    max_price = Column(Float, nullable=True, comment="最高指导价(万元)")
    min_guide_price = Column(Float, nullable=True, comment="最低指导价")
    max_guide_price = Column(Float, nullable=True, comment="最高指导价")
    
    # 外观图片
    main_image = Column(String(500), nullable=True, comment="主图")
    images = Column(JSON, default=list, comment="图片列表")
    
    # 基本参数
    length = Column(Integer, nullable=True, comment="车长(mm)")
    width = Column(Integer, nullable=True, comment="车宽(mm)")
    height = Column(Integer, nullable=True, comment="车高(mm)")
    wheelbase = Column(Integer, nullable=True, comment="轴距(mm)")
    curb_weight = Column(Integer, nullable=True, comment="整备质量(kg)")
    
    # 动力系统
    motor_power = Column(Integer, nullable=True, comment="电机功率(kW)")
    motor_torque = Column(Integer, nullable=True, comment="电机扭矩(N·m)")
    engine_displacement = Column(Float, nullable=True, comment="发动机排量(L)")
    engine_power = Column(Integer, nullable=True, comment="发动机功率(kW)")
    
    # 续航/能耗
    nedc_range = Column(Integer, nullable=True, comment="NEDC续航(km)")
    wltp_range = Column(Integer, nullable=True, comment="WLTP续航(km)")
    cltc_range = Column(Integer, nullable=True, comment="CLTC续航(km)")
    fuel_consumption = Column(Float, nullable=True, comment="百公里油耗(L)")
    
    # 电池信息
    battery_capacity = Column(Float, nullable=True, comment="电池容量(kWh)")
    battery_type = Column(String(100), nullable=True, comment="电池类型")
    charging_time = Column(Float, nullable=True, comment="快充时间(小时)")
    
    # 性能参数
    acceleration = Column(Float, nullable=True, comment="百公里加速(s)")
    max_speed = Column(Integer, nullable=True, comment="最高车速(km/h)")
    
    # 销售信息
    is_on_sale = Column(Boolean, default=True, comment="是否在售")
    launch_date = Column(DateTime, nullable=True, comment="上市日期")
    
    # 评分
    score = Column(Float, nullable=True, comment="综合评分")
    review_count = Column(Integer, default=0, comment="评价数量")
    
    # 详细参数JSON
    specs = Column(JSON, default=dict, comment="详细参数")
    
    # 元数据
    source = Column(SQLEnum(DataSource), default=DataSource.MANUAL, comment="数据来源")
    source_id = Column(String(100), nullable=True, comment="源站ID")
    source_url = Column(String(500), nullable=True, comment="源站链接")
    is_active = Column(Boolean, default=True, comment="是否启用")
    view_count = Column(Integer, default=0, comment="浏览次数")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_crawl_at = Column(DateTime, nullable=True, comment="最后抓取时间")
    
    # 关系
    brand = relationship("Brand", back_populates="vehicles")
    price_history = relationship("PriceHistory", back_populates="vehicle")
    configurations = relationship("VehicleConfig", back_populates="vehicle")
    
    __table_args__ = (
        Index('idx_vehicle_brand', 'brand_id'),
        Index('idx_vehicle_level', 'level'),
        Index('idx_vehicle_energy', 'energy_type'),
        Index('idx_vehicle_price', 'min_price', 'max_price'),
        Index('idx_vehicle_sale', 'is_on_sale'),
        Index('idx_vehicle_score', 'score'),
    )


class VehicleConfig(Base):
    """车型配置版本表"""
    __tablename__ = "vehicle_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False, comment="配置名称")
    
    # 价格
    guide_price = Column(Float, nullable=True, comment="指导价(万元)")
    promotion_price = Column(Float, nullable=True, comment="促销价(万元)")
    
    # 配置信息
    specs = Column(JSON, default=dict, comment="配置详情")
    
    # 状态
    is_on_sale = Column(Boolean, default=True, comment="是否在售")
    source_id = Column(String(100), nullable=True, comment="源站ID")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    vehicle = relationship("Vehicle", back_populates="configurations")


class PriceHistory(Base):
    """价格历史记录表"""
    __tablename__ = "price_history"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False, index=True)
    config_id = Column(Integer, ForeignKey("vehicle_configs.id"), nullable=True)
    
    # 价格信息
    price_type = Column(String(50), nullable=False, comment="价格类型: guide/transaction/promotion")
    price = Column(Float, nullable=False, comment="价格(万元)")
    price_change = Column(Float, nullable=True, comment="价格变动")
    
    # 地区信息
    city = Column(String(100), nullable=True, comment="城市")
    province = Column(String(100), nullable=True, comment="省份")
    
    # 备注
    note = Column(String(500), nullable=True, comment="备注说明")
    
    # 元数据
    source = Column(SQLEnum(DataSource), default=DataSource.MANUAL, comment="数据来源")
    record_date = Column(DateTime, nullable=False, comment="记录日期")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关系
    vehicle = relationship("Vehicle", back_populates="price_history")
    
    __table_args__ = (
        Index('idx_price_vehicle', 'vehicle_id'),
        Index('idx_price_date', 'record_date'),
        Index('idx_price_type', 'price_type'),
    )


class News(Base):
    """汽车资讯表"""
    __tablename__ = "news"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False, index=True, comment="标题")
    subtitle = Column(String(500), nullable=True, comment="副标题")
    summary = Column(Text, nullable=True, comment="摘要")
    content = Column(Text, nullable=True, comment="正文内容")
    
    # 分类
    category = Column(SQLEnum(NewsCategory), nullable=False, comment="资讯分类")
    tags = Column(JSON, default=list, comment="标签")
    
    # 媒体
    cover_image = Column(String(500), nullable=True, comment="封面图")
    images = Column(JSON, default=list, comment="图片列表")
    video_url = Column(String(500), nullable=True, comment="视频链接")
    
    # 作者信息
    author = Column(String(100), nullable=True, comment="作者")
    source_name = Column(String(100), nullable=True, comment="来源名称")
    
    # 关联车型
    related_vehicle_ids = Column(JSON, default=list, comment="关联车型ID列表")
    related_brand_ids = Column(JSON, default=list, comment="关联品牌ID列表")
    
    # 统计
    view_count = Column(Integer, default=0, comment="阅读数")
    like_count = Column(Integer, default=0, comment="点赞数")
    comment_count = Column(Integer, default=0, comment="评论数")
    share_count = Column(Integer, default=0, comment="分享数")
    
    # 发布时间
    publish_time = Column(DateTime, nullable=True, comment="发布时间")
    
    # 元数据
    source = Column(SQLEnum(DataSource), default=DataSource.MANUAL, comment="数据来源")
    source_id = Column(String(100), nullable=True, comment="源站ID")
    source_url = Column(String(500), nullable=True, comment="源站链接")
    is_active = Column(Boolean, default=True, comment="是否启用")
    is_top = Column(Boolean, default=False, comment="是否置顶")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_crawl_at = Column(DateTime, nullable=True, comment="最后抓取时间")
    
    __table_args__ = (
        Index('idx_news_category', 'category'),
        Index('idx_news_publish', 'publish_time'),
        Index('idx_news_hot', 'view_count'),
        Index('idx_news_active', 'is_active'),
    )


class SalesRank(Base):
    """销量排行榜表"""
    __tablename__ = "sales_rank"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False, index=True)
    
    # 销量数据
    sales_volume = Column(Integer, nullable=False, comment="销量")
    period_type = Column(String(20), nullable=False, comment="周期类型: month/year")
    period = Column(String(20), nullable=False, comment="周期: 2025-01/2025")
    
    # 排名
    rank = Column(Integer, nullable=False, comment="排名")
    rank_change = Column(Integer, nullable=True, comment="排名变化")
    
    # 市场份额
    market_share = Column(Float, nullable=True, comment="市场份额(%)")
    
    # 元数据
    source = Column(SQLEnum(DataSource), default=DataSource.MANUAL, comment="数据来源")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        Index('idx_sales_period', 'period_type', 'period'),
        Index('idx_sales_rank', 'rank'),
    )


class CrawlTask(Base):
    """爬虫任务记录表"""
    __tablename__ = "crawl_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    task_name = Column(String(100), nullable=False, comment="任务名称")
    task_type = Column(String(50), nullable=False, comment="任务类型")
    
    # 执行状态
    status = Column(String(50), nullable=False, comment="状态: pending/running/success/failed")
    start_time = Column(DateTime, nullable=True, comment="开始时间")
    end_time = Column(DateTime, nullable=True, comment="结束时间")
    
    # 统计
    total_count = Column(Integer, default=0, comment="总数")
    success_count = Column(Integer, default=0, comment="成功数")
    fail_count = Column(Integer, default=0, comment="失败数")
    
    # 错误信息
    error_message = Column(Text, nullable=True, comment="错误信息")
    
    # 详细日志
    logs = Column(JSON, default=list, comment="执行日志")
    
    # 元数据
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        Index('idx_task_status', 'status'),
        Index('idx_task_time', 'start_time'),
    )


class ProxyIP(Base):
    """代理IP池表"""
    __tablename__ = "proxy_ips"
    
    id = Column(Integer, primary_key=True, index=True)
    ip = Column(String(50), nullable=False, comment="IP地址")
    port = Column(Integer, nullable=False, comment="端口")
    protocol = Column(String(10), nullable=False, comment="协议: http/https")
    
    # 位置信息
    country = Column(String(50), nullable=True, comment="国家")
    region = Column(String(100), nullable=True, comment="地区")
    city = Column(String(100), nullable=True, comment="城市")
    
    # 性能指标
    response_time = Column(Float, nullable=True, comment="响应时间(ms)")
    success_count = Column(Integer, default=0, comment="成功次数")
    fail_count = Column(Integer, default=0, comment="失败次数")
    
    # 状态
    is_active = Column(Boolean, default=True, comment="是否可用")
    last_check_at = Column(DateTime, nullable=True, comment="最后检测时间")
    
    # 元数据
    source = Column(String(100), nullable=True, comment="来源")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    __table_args__ = (
        Index('idx_proxy_active', 'is_active'),
        Index('idx_proxy_ip', 'ip', 'port'),
    )


class User(Base):
    """用户表"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), nullable=False, unique=True, comment="用户名")
    email = Column(String(200), nullable=True, comment="邮箱")
    phone = Column(String(20), nullable=True, comment="手机号")
    
    # 状态
    is_active = Column(Boolean, default=True, comment="是否启用")
    is_admin = Column(Boolean, default=False, comment="是否管理员")
    
    # 元数据
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login_at = Column(DateTime, nullable=True, comment="最后登录时间")


class Favorite(Base):
    """用户收藏表"""
    __tablename__ = "favorites"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        Index('idx_fav_user', 'user_id'),
        Index('idx_fav_vehicle', 'vehicle_id'),
    )
