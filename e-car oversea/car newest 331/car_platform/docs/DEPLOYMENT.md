# 汽车信息平台部署文档

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端 (React)                          │
│                    http://localhost:3000                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      后端 (FastAPI)                          │
│                    http://localhost:8000                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   数据库 (PostgreSQL)                         │
│                    localhost:5432                            │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                     爬虫 (Scrapy)                            │
│              定时任务 (APScheduler)                          │
└─────────────────────────────────────────────────────────────┘
```

## 环境要求

### 系统要求
- Linux/Unix 或 Windows Server
- Python 3.9+
- Node.js 18+
- PostgreSQL 13+
- Redis 6+ (可选，用于分布式爬虫)

### 硬件要求
- CPU: 4核+
- 内存: 8GB+
- 磁盘: 50GB+
- 网络: 稳定的外网连接

## 部署步骤

### 1. 安装依赖

#### 后端依赖
```bash
cd /mnt/okcomputer/output/car_platform/backend
pip install -r requirements.txt
```

requirements.txt:
```
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic==2.5.0
python-multipart==0.0.6
```

#### 爬虫依赖
```bash
cd /mnt/okcomputer/output/car_platform/crawler
pip install -r requirements.txt
```

requirements.txt:
```
scrapy==2.11.0
requests==2.31.0
apscheduler==3.10.4
redis==5.0.1
pillow==10.1.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
```

#### 前端依赖
```bash
cd /mnt/okcomputer/output/car_platform/frontend
npm install
```

### 2. 数据库配置

#### 创建数据库
```sql
CREATE DATABASE car_platform;
CREATE USER car_user WITH PASSWORD 'car_password';
GRANT ALL PRIVILEGES ON DATABASE car_platform TO car_user;
```

#### 配置环境变量
```bash
export DATABASE_URL="postgresql://car_user:car_password@localhost:5432/car_platform"
export REDIS_URL="redis://localhost:6379/0"
```

### 3. 初始化数据库
```bash
cd /mnt/okcomputer/output/car_platform/backend
python -c "from database import init_db; init_db()"
```

### 4. 启动服务

#### 启动后端服务
```bash
cd /mnt/okcomputer/output/car_platform/backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### 启动前端服务
```bash
cd /mnt/okcomputer/output/car_platform/frontend
npm run dev
```

#### 启动爬虫调度器
```bash
cd /mnt/okcomputer/output/car_platform/crawler
python scheduler.py
```

## 生产环境部署

### 使用 Docker Compose

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: car_platform
      POSTGRES_USER: car_user
      POSTGRES_PASSWORD: car_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://car_user:car_password@db:5432/car_platform
      REDIS_URL: redis://redis:6379/0
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

  crawler:
    build: ./crawler
    environment:
      DATABASE_URL: postgresql://car_user:car_password@db:5432/car_platform
      REDIS_URL: redis://redis:6379/0
    depends_on:
      - db
      - redis

volumes:
  postgres_data:
```

启动服务:
```bash
docker-compose up -d
```

### 使用 Nginx 反向代理

创建 `nginx.conf`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 定时任务配置

### 爬虫调度任务

| 任务名称 | 执行频率 | 说明 |
|---------|---------|------|
| news_crawl | 每30分钟 | 抓取最新资讯 |
| price_crawl | 每小时 | 抓取价格变动 |
| vehicle_crawl | 每天凌晨2点 | 抓取车型信息 |
| sales_crawl | 每天凌晨3点 | 抓取销量排行 |
| full_crawl | 每周日凌晨4点 | 全量数据抓取 |

### Cron 配置 (可选)

```bash
# 编辑 crontab
crontab -e

# 添加以下任务
*/30 * * * * cd /mnt/okcomputer/output/car_platform/crawler && python run.py run dongchedi --type news
0 * * * * cd /mnt/okcomputer/output/car_platform/crawler && python run.py run autohome --type price
0 2 * * * cd /mnt/okcomputer/output/car_platform/crawler && python run.py run yiche --type vehicle
0 3 * * * cd /mnt/okcomputer/output/car_platform/crawler && python run.py run dongchedi --type sales
0 4 * * 0 cd /mnt/okcomputer/output/car_platform/crawler && python run.py runall
```

## 监控与日志

### 日志位置
- 后端日志: `backend/logs/`
- 爬虫日志: `crawler/logs/`
- 系统日志: `/var/log/car_platform/`

### 监控指标
- API响应时间
- 爬虫成功率
- 数据库连接数
- 系统资源使用

### 告警配置
```python
# 在 settings.py 中配置
MAIL_HOST = 'smtp.example.com'
MAIL_PORT = 587
MAIL_USER = 'alert@example.com'
MAIL_PASS = 'password'
MAIL_FROM = 'alert@example.com'
```

## 备份策略

### 数据库备份
```bash
# 每日备份
0 1 * * * pg_dump car_platform > /backup/car_platform_$(date +\%Y\%m\%d).sql

# 保留7天
find /backup -name "car_platform_*.sql" -mtime +7 -delete
```

### 图片备份
```bash
# 备份图片
rsync -av /mnt/okcomputer/output/car_platform/crawler/images/ /backup/images/
```

## 安全加固

### 1. 防火墙配置
```bash
# 开放必要端口
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 8000
ufw enable
```

### 2. HTTPS 配置
```bash
# 使用 Let's Encrypt
certbot --nginx -d your-domain.com
```

### 3. 数据库安全
- 使用强密码
- 限制远程访问
- 定期更新补丁

### 4. API 安全
- 启用 CORS 限制
- 添加请求频率限制
- 使用 API Key 认证

## 故障排查

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查数据库状态
systemctl status postgresql

# 检查连接
psql -h localhost -U car_user -d car_platform
```

#### 2. 爬虫无法启动
```bash
# 检查依赖
pip list | grep scrapy

# 检查日志
tail -f crawler/logs/crawler_$(date +%Y%m%d).log
```

#### 3. 前端构建失败
```bash
# 清理缓存
rm -rf node_modules
npm install

# 重新构建
npm run build
```

## 性能优化

### 数据库优化
```sql
-- 添加索引
CREATE INDEX idx_vehicle_brand ON vehicles(brand_id);
CREATE INDEX idx_vehicle_price ON vehicles(min_price, max_price);
CREATE INDEX idx_news_publish ON news(publish_time);
CREATE INDEX idx_price_date ON price_history(record_date);
```

### 缓存配置
```python
# 使用 Redis 缓存
CACHE_TYPE = 'redis'
CACHE_REDIS_URL = 'redis://localhost:6379/1'
CACHE_DEFAULT_TIMEOUT = 300
```

### 前端优化
- 启用 Gzip 压缩
- 使用 CDN 加速
- 图片懒加载

## 更新维护

### 代码更新
```bash
# 拉取最新代码
git pull origin main

# 更新依赖
pip install -r requirements.txt --upgrade
npm install

# 重启服务
systemctl restart car_platform
```

### 数据库迁移
```bash
# 使用 Alembic
alembic revision --autogenerate -m "update"
alembic upgrade head
```

## 联系支持

如有问题，请联系:
- 邮箱: support@carplatform.com
- 电话: 400-888-8888
