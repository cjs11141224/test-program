# 汽车信息平台

一个专业的汽车信息聚合平台，自动从多个汽车网站抓取最新车型、价格、资讯等数据，为用户提供全面的汽车信息服务。

## 功能特性

### 核心功能
- **车型库**: 收录主流汽车品牌和车型，支持多维度筛选
- **价格监控**: 实时追踪汽车价格变动，把握最佳购车时机
- **销量排行**: 查看最新汽车销量数据，了解市场趋势
- **汽车资讯**: 聚合最新汽车行业新闻、评测、导购
- **品牌大全**: 浏览所有汽车品牌，了解品牌信息

### 技术特性
- **自动抓取**: 使用Scrapy框架，支持多平台数据抓取
- **定时更新**: APScheduler实现定时任务，数据自动更新
- **反爬机制**: IP池、User-Agent轮换、请求频率控制
- **数据验证**: 多重数据验证和清洗，确保数据质量
- **实时展示**: React前端，响应式设计，用户体验优秀

## 技术架构

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│  Database   │
│   (React)   │     │  (FastAPI)  │     │(PostgreSQL) │
└─────────────┘     └─────────────┘     └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │   Crawler   │
                     │   (Scrapy)  │
                     └─────────────┘
```

## 快速开始

### 环境要求
- Python 3.9+
- Node.js 18+
- PostgreSQL 13+

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/cjs11141224/car.git
cd car
```

2. 安装后端依赖
```bash
cd backend
pip install -r requirements.txt
```

3. 安装爬虫依赖
```bash
cd ../crawler
pip install -r requirements.txt
```

4. 安装前端依赖
```bash
cd ../frontend
npm install
```

5. 配置数据库
```bash
# 创建数据库
createdb car_platform

# 设置环境变量
export DATABASE_URL="postgresql://user:password@localhost:5432/car_platform"
```

6. 初始化数据库
```bash
cd ../backend
python -c "from database import init_db; init_db()"
```

7. 启动服务
```bash
# 启动后端
cd backend
uvicorn main:app --reload

# 启动前端 (新终端)
cd frontend
npm run dev

# 启动爬虫调度器 (新终端)
cd crawler
python scheduler.py
```

8. 访问应用
- 前端: http://localhost:3000
- 后端API: http://localhost:8000
- API文档: http://localhost:8000/docs

## 项目结构

```
car_platform/
├── backend/           # 后端服务 (FastAPI)
│   ├── main.py       # API入口
│   ├── database.py   # 数据库配置
│   ├── models.py     # 数据模型
│   └── requirements.txt
├── crawler/          # 爬虫模块 (Scrapy)
│   ├── car_crawler/  # 爬虫代码
│   │   ├── spiders/  # 爬虫实现
│   │   ├── middlewares/  # 中间件
│   │   └── pipelines/    # 数据管道
│   ├── run.py        # 爬虫运行入口
│   ├── scheduler.py  # 定时调度器
│   └── requirements.txt
├── frontend/         # 前端应用 (React)
│   ├── src/          # 源代码
│   │   ├── components/  # 组件
│   │   ├── pages/       # 页面
│   │   └── services/    # API服务
│   └── package.json
├── tests/            # 测试代码
├── docs/             # 文档
│   ├── DEPLOYMENT.md # 部署文档
│   └── OPERATIONS.md # 运维手册
└── README.md
```

## 爬虫配置

### 支持的网站
- 汽车之家 (autohome.com.cn)
- 懂车帝 (dongchedi.com)
- 易车 (yiche.com)

### 抓取频率
- 资讯: 每30分钟
- 价格: 每小时
- 车型: 每天
- 销量: 每天

### 运行爬虫
```bash
# 运行单个爬虫
cd crawler
python run.py run autohome --type vehicle

# 运行所有爬虫
python run.py runall

# 启动定时调度
python scheduler.py
```

## API接口

### 品牌接口
- `GET /api/brands` - 获取品牌列表
- `GET /api/brands/{id}` - 获取品牌详情

### 车型接口
- `GET /api/vehicles` - 获取车型列表
- `GET /api/vehicles/{id}` - 获取车型详情
- `GET /api/vehicles/{id}/prices` - 获取车型价格历史

### 资讯接口
- `GET /api/news` - 获取资讯列表
- `GET /api/news/{id}` - 获取资讯详情

### 其他接口
- `GET /api/prices/latest` - 最新价格变动
- `GET /api/sales-rank` - 销量排行
- `GET /api/filters` - 筛选条件
- `GET /api/stats` - 统计数据

## 测试

### 运行测试
```bash
# 后端API测试
cd tests
pytest test_api.py -v

# 爬虫测试
pytest test_crawler.py -v
```

### 测试覆盖率
- API接口测试: 覆盖所有接口
- 爬虫功能测试: 覆盖核心功能
- 数据验证测试: 覆盖数据清洗和验证

## 部署

### Docker部署
```bash
docker-compose up -d
```

### 生产环境部署
详见 [部署文档](docs/DEPLOYMENT.md)

## 运维

### 日常运维
- 监控服务状态
- 检查日志
- 数据备份
- 性能优化

详见 [运维手册](docs/OPERATIONS.md)

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

MIT License

## 联系我们

- 邮箱: contact@carplatform.com
- 网站: https://carplatform.com

## 更新日志

### v1.0.0 (2025-03-31)
- 初始版本发布
- 实现基础功能: 车型库、价格监控、销量排行、资讯
- 支持多平台数据抓取
- 实现定时任务调度
- 完成前端界面开发

## 致谢

感谢以下开源项目:
- FastAPI
- React
- Scrapy
- PostgreSQL
- Tailwind CSS
