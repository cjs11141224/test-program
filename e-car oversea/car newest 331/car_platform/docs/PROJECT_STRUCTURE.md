# 项目结构说明

## 目录结构

```
car_platform/
├── backend/                    # 后端服务 (FastAPI)
│   ├── main.py                # API入口，路由定义
│   ├── database.py            # 数据库连接配置
│   ├── models.py              # SQLAlchemy数据模型
│   ├── requirements.txt       # Python依赖
│   └── Dockerfile             # Docker构建文件
│
├── crawler/                    # 爬虫模块 (Scrapy)
│   ├── car_crawler/           # 爬虫主包
│   │   ├── spiders/           # 爬虫实现
│   │   │   ├── autohome.py    # 汽车之家爬虫
│   │   │   ├── dongchedi.py   # 懂车帝爬虫
│   │   │   └── yiche.py       # 易车爬虫
│   │   ├── middlewares/       # 中间件
│   │   │   ├── proxy.py       # 代理IP中间件
│   │   │   ├── useragent.py   # User-Agent轮换
│   │   │   ├── header.py      # 请求头中间件
│   │   │   ├── retry.py       # 重试中间件
│   │   │   └── error.py       # 错误处理中间件
│   │   ├── pipelines/         # 数据管道
│   │   │   ├── validation.py  # 数据验证
│   │   │   ├── duplicate.py   # 去重处理
│   │   │   ├── database.py    # 数据库存储
│   │   │   └── images.py      # 图片下载
│   │   ├── items.py           # 数据模型定义
│   │   ├── settings.py        # Scrapy配置
│   │   └── __init__.py
│   ├── run.py                 # 爬虫运行入口
│   ├── scheduler.py           # 定时调度器
│   ├── scrapy.cfg             # Scrapy配置
│   ├── requirements.txt       # Python依赖
│   └── Dockerfile             # Docker构建文件
│
├── frontend/                   # 前端应用 (React + TypeScript)
│   ├── src/
│   │   ├── components/        # React组件
│   │   │   ├── Header.tsx     # 顶部导航
│   │   │   ├── Footer.tsx     # 底部页脚
│   │   │   └── Layout.tsx     # 布局组件
│   │   ├── pages/             # 页面组件
│   │   │   ├── Home.tsx       # 首页
│   │   │   ├── Vehicles.tsx   # 车型列表
│   │   │   ├── VehicleDetail.tsx  # 车型详情
│   │   │   ├── News.tsx       # 资讯列表
│   │   │   ├── NewsDetail.tsx # 资讯详情
│   │   │   ├── Brands.tsx     # 品牌列表
│   │   │   ├── SalesRank.tsx  # 销量排行
│   │   │   ├── PriceMonitor.tsx   # 价格监控
│   │   │   └── NotFound.tsx   # 404页面
│   │   ├── services/          # API服务
│   │   │   └── api.ts         # API接口封装
│   │   ├── types/             # TypeScript类型
│   │   │   └── index.ts       # 类型定义
│   │   ├── App.tsx            # 主应用组件
│   │   ├── main.tsx           # 入口文件
│   │   └── index.css          # 全局样式
│   ├── package.json           # Node依赖
│   ├── tsconfig.json          # TypeScript配置
│   ├── vite.config.ts         # Vite配置
│   ├── tailwind.config.js     # Tailwind配置
│   ├── nginx.conf             # Nginx配置
│   └── Dockerfile             # Docker构建文件
│
├── tests/                      # 测试代码
│   ├── test_api.py            # API接口测试
│   └── test_crawler.py        # 爬虫功能测试
│
├── docs/                       # 文档
│   ├── DEPLOYMENT.md          # 部署文档
│   ├── OPERATIONS.md          # 运维手册
│   ├── SECURITY.md            # 安全加固指南
│   └── PROJECT_STRUCTURE.md   # 项目结构说明
│
├── nginx/                      # Nginx配置
│   └── nginx.conf             # 主Nginx配置
│
├── docker-compose.yml          # Docker Compose配置
└── README.md                   # 项目说明
```

## 核心模块说明

### 1. 后端模块 (backend/)

| 文件 | 说明 |
|------|------|
| main.py | FastAPI应用入口，定义所有API路由 |
| database.py | 数据库连接池配置，会话管理 |
| models.py | SQLAlchemy ORM模型，定义数据表结构 |
| requirements.txt | Python依赖包列表 |
| Dockerfile | Docker镜像构建配置 |

**API路由列表:**
- `GET /api/brands` - 品牌列表
- `GET /api/brands/{id}` - 品牌详情
- `GET /api/vehicles` - 车型列表
- `GET /api/vehicles/{id}` - 车型详情
- `GET /api/vehicles/{id}/prices` - 车型价格历史
- `GET /api/news` - 资讯列表
- `GET /api/news/{id}` - 资讯详情
- `GET /api/prices/latest` - 最新价格
- `GET /api/sales-rank` - 销量排行
- `GET /api/filters` - 筛选条件
- `GET /api/stats` - 统计数据

### 2. 爬虫模块 (crawler/)

| 文件/目录 | 说明 |
|----------|------|
| car_crawler/spiders/ | 爬虫实现，每个网站一个爬虫 |
| car_crawler/middlewares/ | 中间件，处理请求和响应 |
| car_crawler/pipelines/ | 数据管道，处理抓取的数据 |
| car_crawler/items.py | 数据模型定义 |
| car_crawler/settings.py | Scrapy全局配置 |
| run.py | 爬虫运行入口 |
| scheduler.py | 定时任务调度器 |

**支持的网站:**
- 汽车之家 (autohome.com.cn)
- 懂车帝 (dongchedi.com)
- 易车 (yiche.com)

**抓取频率:**
- 资讯: 每30分钟
- 价格: 每小时
- 车型: 每天
- 销量: 每天

### 3. 前端模块 (frontend/)

| 文件/目录 | 说明 |
|----------|------|
| src/components/ | 可复用的React组件 |
| src/pages/ | 页面级组件 |
| src/services/ | API接口封装 |
| src/types/ | TypeScript类型定义 |
| App.tsx | 主应用组件，路由配置 |
| main.tsx | 应用入口 |

**页面列表:**
- `/` - 首页
- `/vehicles` - 车型库
- `/vehicles/{id}` - 车型详情
- `/news` - 资讯列表
- `/news/{id}` - 资讯详情
- `/brands` - 品牌列表
- `/sales-rank` - 销量排行
- `/price-monitor` - 价格监控

### 4. 数据库模型

**主要数据表:**
- `brands` - 汽车品牌
- `vehicles` - 车型信息
- `vehicle_configs` - 车型配置版本
- `price_history` - 价格历史
- `news` - 汽车资讯
- `sales_rank` - 销量排行
- `crawl_tasks` - 爬虫任务记录
- `proxy_ips` - 代理IP池

## 数据流

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   目标网站   │────▶│   爬虫      │────▶│   数据清洗   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   前端展示   │◀────│   API服务   │◀────│   数据存储   │
└─────────────┘     └─────────────┘     └─────────────┘
```

## 配置文件

### 后端配置
- `DATABASE_URL` - 数据库连接字符串
- `REDIS_URL` - Redis连接字符串
- `LOG_LEVEL` - 日志级别

### 爬虫配置
- `DOWNLOAD_DELAY` - 下载延迟
- `CONCURRENT_REQUESTS` - 并发请求数
- `PROXY_ENABLED` - 是否启用代理
- `PROXY_API_URL` - 代理API地址

### 前端配置
- `VITE_API_URL` - API基础URL

## 部署方式

### 1. Docker Compose (推荐)
```bash
docker-compose up -d
```

### 2. 手动部署
```bash
# 启动后端
cd backend && uvicorn main:app --host 0.0.0.0 --port 8000

# 启动前端
cd frontend && npm run dev

# 启动爬虫
cd crawler && python scheduler.py
```

## 开发指南

### 添加新爬虫

1. 在 `crawler/car_crawler/spiders/` 创建新文件
2. 继承 `scrapy.Spider` 类
3. 实现 `parse` 方法
4. 在 `run.py` 中添加运行入口

### 添加新API

1. 在 `backend/main.py` 添加路由
2. 实现业务逻辑
3. 添加数据模型（如需）
4. 更新API文档

### 添加新页面

1. 在 `frontend/src/pages/` 创建组件
2. 在 `App.tsx` 添加路由
3. 在 `Header.tsx` 添加导航链接
4. 实现页面逻辑

## 测试

### API测试
```bash
cd tests
pytest test_api.py -v
```

### 爬虫测试
```bash
cd tests
pytest test_crawler.py -v
```

## 监控

- 后端健康检查: `GET /health`
- API文档: `GET /docs`
- 爬虫日志: `crawler/logs/`
- 系统日志: `backend/logs/`
