"""
FastAPI后端服务
提供汽车信息API接口
"""
import os
import sys
from datetime import datetime
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel

# 添加项目路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import get_db, init_db, close_db
from models import (
    Brand, Vehicle, VehicleConfig, News, PriceHistory, 
    SalesRank, EnergyType, VehicleLevel, NewsCategory
)

# 创建FastAPI应用
@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时初始化数据库
    init_db()
    yield
    # 关闭时清理资源
    close_db()

app = FastAPI(
    title="汽车信息平台API",
    description="提供汽车品牌、车型、价格、资讯等数据接口",
    version="1.0.0",
    lifespan=lifespan
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应该限制具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============== Pydantic模型 ==============

class BrandResponse(BaseModel):
    id: int
    name: str
    name_en: Optional[str]
    logo_url: Optional[str]
    country: Optional[str]
    vehicle_count: int
    is_domestic: bool
    is_new_energy: bool
    
    class Config:
        from_attributes = True


class VehicleListResponse(BaseModel):
    id: int
    name: str
    full_name: Optional[str]
    brand_name: str
    level: Optional[str]
    energy_type: Optional[str]
    min_price: Optional[float]
    max_price: Optional[float]
    main_image: Optional[str]
    score: Optional[float]
    is_on_sale: bool
    
    class Config:
        from_attributes = True


class VehicleDetailResponse(BaseModel):
    id: int
    name: str
    full_name: Optional[str]
    brand_id: int
    brand_name: str
    level: Optional[str]
    energy_type: Optional[str]
    body_type: Optional[str]
    min_price: Optional[float]
    max_price: Optional[float]
    min_guide_price: Optional[float]
    max_guide_price: Optional[float]
    main_image: Optional[str]
    images: List[str]
    length: Optional[int]
    width: Optional[int]
    height: Optional[int]
    wheelbase: Optional[int]
    motor_power: Optional[int]
    motor_torque: Optional[int]
    engine_displacement: Optional[float]
    engine_power: Optional[int]
    cltc_range: Optional[int]
    battery_capacity: Optional[float]
    acceleration: Optional[float]
    max_speed: Optional[int]
    score: Optional[float]
    review_count: int
    is_on_sale: bool
    launch_date: Optional[datetime]
    specs: dict
    
    class Config:
        from_attributes = True


class NewsResponse(BaseModel):
    id: int
    title: str
    subtitle: Optional[str]
    summary: Optional[str]
    category: Optional[str]
    cover_image: Optional[str]
    author: Optional[str]
    source_name: Optional[str]
    view_count: int
    like_count: int
    comment_count: int
    publish_time: Optional[datetime]
    
    class Config:
        from_attributes = True


class NewsDetailResponse(BaseModel):
    id: int
    title: str
    subtitle: Optional[str]
    summary: Optional[str]
    content: Optional[str]
    category: Optional[str]
    tags: List[str]
    cover_image: Optional[str]
    images: List[str]
    author: Optional[str]
    source_name: Optional[str]
    view_count: int
    like_count: int
    comment_count: int
    share_count: int
    publish_time: Optional[datetime]
    
    class Config:
        from_attributes = True


class PriceResponse(BaseModel):
    id: int
    vehicle_id: int
    vehicle_name: str
    price_type: str
    price: float
    price_change: Optional[float]
    city: Optional[str]
    province: Optional[str]
    record_date: datetime
    
    class Config:
        from_attributes = True


class SalesRankResponse(BaseModel):
    id: int
    vehicle_id: int
    vehicle_name: str
    sales_volume: int
    period_type: str
    period: str
    rank: int
    rank_change: Optional[int]
    market_share: Optional[float]
    
    class Config:
        from_attributes = True


class PaginatedResponse(BaseModel):
    total: int
    page: int
    page_size: int
    data: List[dict]


# ============== API路由 ==============

@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "汽车信息平台API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


# ============== 品牌API ==============

@app.get("/api/brands", response_model=List[BrandResponse])
async def get_brands(
    is_domestic: Optional[bool] = None,
    is_new_energy: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """
    获取品牌列表
    
    - **is_domestic**: 是否国产品牌
    - **is_new_energy**: 是否新能源品牌
    """
    query = db.query(Brand).filter(Brand.is_active == True)
    
    if is_domestic is not None:
        query = query.filter(Brand.is_domestic == is_domestic)
    
    if is_new_energy is not None:
        query = query.filter(Brand.is_new_energy == is_new_energy)
    
    brands = query.order_by(Brand.display_order, Brand.name).all()
    return brands


@app.get("/api/brands/{brand_id}", response_model=BrandResponse)
async def get_brand(brand_id: int, db: Session = Depends(get_db)):
    """获取品牌详情"""
    brand = db.query(Brand).filter(Brand.id == brand_id, Brand.is_active == True).first()
    if not brand:
        raise HTTPException(status_code=404, detail="品牌不存在")
    return brand


# ============== 车型API ==============

@app.get("/api/vehicles", response_model=List[VehicleListResponse])
async def get_vehicles(
    brand_id: Optional[int] = None,
    level: Optional[str] = None,
    energy_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    is_on_sale: Optional[bool] = True,
    keyword: Optional[str] = None,
    sort_by: Optional[str] = "id",
    sort_order: Optional[str] = "asc",
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    获取车型列表
    
    - **brand_id**: 品牌ID
    - **level**: 车型级别
    - **energy_type**: 能源类型
    - **min_price**: 最低价格
    - **max_price**: 最高价格
    - **is_on_sale**: 是否在售
    - **keyword**: 关键词搜索
    - **sort_by**: 排序字段
    - **sort_order**: 排序方向 (asc/desc)
    - **page**: 页码
    - **page_size**: 每页数量
    """
    query = db.query(Vehicle).filter(Vehicle.is_active == True)
    
    if brand_id:
        query = query.filter(Vehicle.brand_id == brand_id)
    
    if level:
        query = query.filter(Vehicle.level == level)
    
    if energy_type:
        query = query.filter(Vehicle.energy_type == energy_type)
    
    if min_price is not None:
        query = query.filter(Vehicle.min_price >= min_price)
    
    if max_price is not None:
        query = query.filter(Vehicle.max_price <= max_price)
    
    if is_on_sale is not None:
        query = query.filter(Vehicle.is_on_sale == is_on_sale)
    
    if keyword:
        query = query.filter(
            Vehicle.name.contains(keyword) | 
            Vehicle.full_name.contains(keyword)
        )
    
    # 排序
    sort_field = getattr(Vehicle, sort_by, Vehicle.id)
    if sort_order == "desc":
        query = query.order_by(sort_field.desc())
    else:
        query = query.order_by(sort_field.asc())
    
    # 分页
    total = query.count()
    vehicles = query.offset((page - 1) * page_size).limit(page_size).all()
    
    # 添加品牌名称
    result = []
    for v in vehicles:
        v.brand_name = v.brand.name if v.brand else ""
        result.append(v)
    
    return result


@app.get("/api/vehicles/{vehicle_id}", response_model=VehicleDetailResponse)
async def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    """获取车型详情"""
    vehicle = db.query(Vehicle).options(
        joinedload(Vehicle.brand)
    ).filter(Vehicle.id == vehicle_id, Vehicle.is_active == True).first()
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="车型不存在")
    
    vehicle.brand_name = vehicle.brand.name if vehicle.brand else ""
    return vehicle


@app.get("/api/vehicles/{vehicle_id}/prices", response_model=List[PriceResponse])
async def get_vehicle_prices(
    vehicle_id: int,
    price_type: Optional[str] = None,
    limit: int = Query(30, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """获取车型价格历史"""
    query = db.query(PriceHistory).filter(PriceHistory.vehicle_id == vehicle_id)
    
    if price_type:
        query = query.filter(PriceHistory.price_type == price_type)
    
    prices = query.order_by(PriceHistory.record_date.desc()).limit(limit).all()
    
    # 添加车型名称
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    for p in prices:
        p.vehicle_name = vehicle.name if vehicle else ""
    
    return prices


# ============== 资讯API ==============

@app.get("/api/news", response_model=List[NewsResponse])
async def get_news(
    category: Optional[str] = None,
    keyword: Optional[str] = None,
    is_top: Optional[bool] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    获取资讯列表
    
    - **category**: 分类
    - **keyword**: 关键词搜索
    - **is_top**: 是否置顶
    - **page**: 页码
    - **page_size**: 每页数量
    """
    query = db.query(News).filter(News.is_active == True)
    
    if category:
        query = query.filter(News.category == category)
    
    if keyword:
        query = query.filter(
            News.title.contains(keyword) | 
            News.summary.contains(keyword)
        )
    
    if is_top is not None:
        query = query.filter(News.is_top == is_top)
    
    total = query.count()
    news = query.order_by(News.is_top.desc(), News.publish_time.desc()).offset(
        (page - 1) * page_size
    ).limit(page_size).all()
    
    return news


@app.get("/api/news/{news_id}", response_model=NewsDetailResponse)
async def get_news_detail(news_id: int, db: Session = Depends(get_db)):
    """获取资讯详情"""
    news = db.query(News).filter(News.id == news_id, News.is_active == True).first()
    
    if not news:
        raise HTTPException(status_code=404, detail="资讯不存在")
    
    # 增加浏览次数
    news.view_count += 1
    db.commit()
    
    return news


# ============== 价格API ==============

@app.get("/api/prices/latest", response_model=List[PriceResponse])
async def get_latest_prices(
    vehicle_id: Optional[int] = None,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """获取最新价格变动"""
    query = db.query(PriceHistory)
    
    if vehicle_id:
        query = query.filter(PriceHistory.vehicle_id == vehicle_id)
    
    prices = query.order_by(PriceHistory.record_date.desc()).limit(limit).all()
    
    # 添加车型名称
    for p in prices:
        vehicle = db.query(Vehicle).filter(Vehicle.id == p.vehicle_id).first()
        p.vehicle_name = vehicle.name if vehicle else ""
    
    return prices


# ============== 销量排行API ==============

@app.get("/api/sales-rank", response_model=List[SalesRankResponse])
async def get_sales_rank(
    period: Optional[str] = None,
    period_type: str = "month",
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    获取销量排行
    
    - **period**: 周期 (如: 2025-01)
    - **period_type**: 周期类型 (month/year)
    - **limit**: 返回数量
    """
    query = db.query(SalesRank).filter(SalesRank.period_type == period_type)
    
    if period:
        query = query.filter(SalesRank.period == period)
    else:
        # 获取最新周期
        latest_period = db.query(SalesRank.period).filter(
            SalesRank.period_type == period_type
        ).order_by(SalesRank.period.desc()).first()
        
        if latest_period:
            query = query.filter(SalesRank.period == latest_period[0])
    
    ranks = query.order_by(SalesRank.rank.asc()).limit(limit).all()
    
    # 添加车型名称
    for r in ranks:
        vehicle = db.query(Vehicle).filter(Vehicle.id == r.vehicle_id).first()
        r.vehicle_name = vehicle.name if vehicle else ""
    
    return ranks


# ============== 筛选条件API ==============

@app.get("/api/filters")
async def get_filters(db: Session = Depends(get_db)):
    """获取筛选条件选项"""
    # 品牌
    brands = db.query(Brand).filter(Brand.is_active == True).order_by(Brand.name).all()
    
    # 车型级别
    levels = db.query(Vehicle.level).filter(
        Vehicle.level.isnot(None)
    ).distinct().all()
    
    # 能源类型
    energy_types = db.query(Vehicle.energy_type).filter(
        Vehicle.energy_type.isnot(None)
    ).distinct().all()
    
    # 价格区间
    price_ranges = [
        {"label": "10万以下", "min": 0, "max": 10},
        {"label": "10-20万", "min": 10, "max": 20},
        {"label": "20-30万", "min": 20, "max": 30},
        {"label": "30-50万", "min": 30, "max": 50},
        {"label": "50万以上", "min": 50, "max": None},
    ]
    
    return {
        "brands": [{"id": b.id, "name": b.name, "logo": b.logo_url} for b in brands],
        "levels": [l[0] for l in levels if l[0]],
        "energy_types": [e[0] for e in energy_types if e[0]],
        "price_ranges": price_ranges,
    }


# ============== 统计API ==============

@app.get("/api/stats")
async def get_stats(db: Session = Depends(get_db)):
    """获取平台统计数据"""
    brand_count = db.query(Brand).filter(Brand.is_active == True).count()
    vehicle_count = db.query(Vehicle).filter(Vehicle.is_active == True).count()
    news_count = db.query(News).filter(News.is_active == True).count()
    on_sale_count = db.query(Vehicle).filter(
        Vehicle.is_active == True,
        Vehicle.is_on_sale == True
    ).count()
    
    # 新能源车型数量
    new_energy_count = db.query(Vehicle).filter(
        Vehicle.is_active == True,
        Vehicle.energy_type.in_([
            EnergyType.PURE_ELECTRIC,
            EnergyType.PLUG_IN_HYBRID,
            EnergyType.EXTENDED_RANGE
        ])
    ).count()
    
    return {
        "brand_count": brand_count,
        "vehicle_count": vehicle_count,
        "news_count": news_count,
        "on_sale_count": on_sale_count,
        "new_energy_count": new_energy_count,
        "update_time": datetime.now().isoformat(),
    }


# ============== 错误处理 ==============

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """全局异常处理"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": str(exc),
            "timestamp": datetime.now().isoformat(),
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
