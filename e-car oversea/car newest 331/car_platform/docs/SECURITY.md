# 安全加固指南

## 概述

本文档提供汽车信息平台的安全加固措施，包括网络安全、应用安全、数据安全等方面的防护策略。

## 网络安全

### 1. 防火墙配置

```bash
# 安装UFW
sudo apt install ufw

# 默认拒绝所有入站连接
sudo ufw default deny incoming

# 允许SSH
sudo ufw allow 22/tcp

# 允许HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 允许后端API（仅限内网访问）
sudo ufw allow from 10.0.0.0/8 to any port 8000

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status verbose
```

### 2. DDoS防护

```bash
# 安装fail2ban
sudo apt install fail2ban

# 配置fail2ban
sudo cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/error.log
EOF

# 启动fail2ban
sudo systemctl restart fail2ban
```

### 3. 速率限制

```python
# backend/main.py
from fastapi import Request, HTTPException
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import time

# 请求速率限制
class RateLimitMiddleware:
    def __init__(self, app, max_requests=100, window=60):
        self.app = app
        self.max_requests = max_requests
        self.window = window
        self.requests = {}
    
    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            client_ip = scope.get("client", ("", 0))[0]
            current_time = time.time()
            
            # 清理过期记录
            self.requests = {
                ip: times for ip, times in self.requests.items()
                if any(t > current_time - self.window for t in times)
            }
            
            # 检查请求次数
            if client_ip in self.requests:
                recent_requests = [
                    t for t in self.requests[client_ip]
                    if t > current_time - self.window
                ]
                if len(recent_requests) >= self.max_requests:
                    raise HTTPException(status_code=429, detail="Too many requests")
                self.requests[client_ip].append(current_time)
            else:
                self.requests[client_ip] = [current_time]
        
        await self.app(scope, receive, send)

# 添加中间件
app.add_middleware(RateLimitMiddleware, max_requests=100, window=60)
```

## 应用安全

### 1. HTTPS配置

```nginx
# /etc/nginx/sites-available/car-platform
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL证书
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 安全响应头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.your-domain.com;" always;
    
    # 前端代理
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # API代理
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. CORS配置

```python
# backend/main.py
from fastapi.middleware.cors import CORSMiddleware

# 生产环境CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.com"],  # 只允许特定域名
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    expose_headers=["X-Total-Count"],
    max_age=600,
)
```

### 3. 输入验证

```python
# backend/main.py
from pydantic import BaseModel, Field, validator
import re

class VehicleFilter(BaseModel):
    keyword: str = Field(None, max_length=100)
    min_price: float = Field(None, ge=0, le=10000)
    max_price: float = Field(None, ge=0, le=10000)
    
    @validator('keyword')
    def validate_keyword(cls, v):
        if v and not re.match(r'^[\w\s\-\u4e00-\u9fff]+$', v):
            raise ValueError('Invalid keyword format')
        return v
    
    @validator('max_price')
    def validate_price_range(cls, v, values):
        if v and values.get('min_price') and v < values['min_price']:
            raise ValueError('max_price must be greater than min_price')
        return v
```

### 4. SQL注入防护

```python
# backend/database.py
from sqlalchemy import text
from sqlalchemy.orm import Session

# 使用参数化查询
def safe_query(db: Session, keyword: str):
    # 错误示例：直接拼接SQL
    # query = f"SELECT * FROM vehicles WHERE name LIKE '%{keyword}%'"
    
    # 正确示例：使用参数化查询
    query = text("SELECT * FROM vehicles WHERE name LIKE :keyword")
    result = db.execute(query, {"keyword": f"%{keyword}%"})
    return result.fetchall()
```

## 数据安全

### 1. 数据库安全

```sql
-- 创建只读用户
CREATE USER car_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE car_platform TO car_readonly;
GRANT USAGE ON SCHEMA public TO car_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO car_readonly;

-- 撤销危险权限
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;

-- 启用行级安全
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- 创建行级安全策略
CREATE POLICY vehicles_active_only ON vehicles
    FOR SELECT
    USING (is_active = true);
```

### 2. 敏感数据加密

```python
# backend/utils/encryption.py
from cryptography.fernet import Fernet
import os

# 加密密钥应从环境变量获取
ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY')
cipher_suite = Fernet(ENCRYPTION_KEY)

def encrypt_data(data: str) -> str:
    """加密敏感数据"""
    return cipher_suite.encrypt(data.encode()).decode()

def decrypt_data(encrypted_data: str) -> str:
    """解密敏感数据"""
    return cipher_suite.decrypt(encrypted_data.encode()).decode()

# 使用示例
encrypted_phone = encrypt_data(user_phone)
decrypted_phone = decrypt_data(encrypted_phone)
```

### 3. 数据备份加密

```bash
#!/bin/bash
# encrypted_backup.sh

BACKUP_DIR="/backup/car_platform"
DATE=$(date +%Y%m%d)
GPG_KEY="backup@carplatform.com"

# 创建备份
pg_dump car_platform > $BACKUP_DIR/car_platform_$DATE.sql

# 加密备份
gpg --encrypt --recipient $GPG_KEY --trust-model always \
    --output $BACKUP_DIR/car_platform_$DATE.sql.gpg \
    $BACKUP_DIR/car_platform_$DATE.sql

# 删除未加密文件
rm $BACKUP_DIR/car_platform_$DATE.sql

echo "Encrypted backup completed: $DATE"
```

## 爬虫安全

### 1. 请求频率控制

```python
# crawler/car_crawler/settings.py
# 下载延迟
DOWNLOAD_DELAY = 1.5
RANDOMIZE_DOWNLOAD_DELAY = 0.5

# 自动限速
AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 1
AUTOTHROTTLE_MAX_DELAY = 10
AUTOTHROTTLE_TARGET_CONCURRENCY = 2.0

# 并发请求限制
CONCURRENT_REQUESTS = 8
CONCURRENT_REQUESTS_PER_DOMAIN = 4
```

### 2. 代理IP池

```python
# crawler/car_crawler/middlewares/proxy.py
class ProxyPool:
    def __init__(self):
        self.proxies = []
        self.failed_proxies = set()
    
    def get_proxy(self):
        """获取可用代理"""
        available = [p for p in self.proxies if p not in self.failed_proxies]
        return random.choice(available) if available else None
    
    def report_failure(self, proxy):
        """报告代理失败"""
        self.failed_proxies.add(proxy)
        # 连续失败3次则永久移除
        if self.failure_count.get(proxy, 0) >= 3:
            self.proxies.remove(proxy)
```

### 3. User-Agent轮换

```python
# crawler/car_crawler/middlewares/useragent.py
USER_AGENT_LIST = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    # ... 更多User-Agent
]

class RotateUserAgentMiddleware:
    def process_request(self, request, spider):
        request.headers['User-Agent'] = random.choice(USER_AGENT_LIST)
```

## 日志与监控

### 1. 安全日志

```python
# backend/utils/logger.py
import logging
from logging.handlers import RotatingFileHandler

# 配置安全日志
security_logger = logging.getLogger('security')
security_logger.setLevel(logging.WARNING)

handler = RotatingFileHandler(
    'logs/security.log',
    maxBytes=10*1024*1024,  # 10MB
    backupCount=10
)
handler.setFormatter(logging.Formatter(
    '%(asctime)s - %(levelname)s - %(message)s'
))
security_logger.addHandler(handler)

# 记录安全事件
def log_security_event(event_type, details):
    security_logger.warning(f"Security Event: {event_type} - {details}")
```

### 2. 异常监控

```python
# backend/main.py
from fastapi import Request
import traceback

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # 记录异常
    security_logger.error(f"Exception: {str(exc)}\n{traceback.format_exc()}")
    
    # 发送告警
    if is_critical_error(exc):
        await send_alert(f"Critical error: {str(exc)}")
    
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error"}
    )
```

## 安全测试

### 1. 漏洞扫描

```bash
# 使用OWASP ZAP进行扫描
zap-cli start
zap-cli open-url https://your-domain.com
zap-cli spider https://your-domain.com
zap-cli active-scan https://your-domain.com
zap-cli report -o security_report.html -f html
```

### 2. 依赖安全检查

```bash
# Python依赖检查
safety check -r requirements.txt

# Node依赖检查
npm audit
npm audit fix
```

### 3. 渗透测试

```bash
# 使用SQLMap测试SQL注入
sqlmap -u "https://your-domain.com/api/vehicles?id=1" --batch

# 使用Nmap扫描端口
nmap -sV -sC your-domain.com
```

## 应急响应

### 1. 安全事件响应流程

1. **发现**: 监控告警或用户报告
2. **评估**: 判断事件类型和严重程度
3. **遏制**: 采取措施阻止攻击扩散
4. **根除**: 清除威胁源
5. **恢复**: 恢复系统正常运行
6. **总结**: 记录事件和改进措施

### 2. 应急脚本

```bash
#!/bin/bash
# emergency_response.sh

ACTION=$1

case $ACTION in
    "block_ip")
        # 阻断恶意IP
        iptables -A INPUT -s $2 -j DROP
        echo "Blocked IP: $2"
        ;;
    "stop_service")
        # 停止服务
        systemctl stop car-platform-backend
        systemctl stop car-platform-crawler
        echo "Services stopped"
        ;;
    "backup_data")
        # 紧急备份
        pg_dump car_platform > /backup/emergency_$(date +%Y%m%d_%H%M%S).sql
        echo "Emergency backup completed"
        ;;
    *)
        echo "Usage: $0 {block_ip|stop_service|backup_data}"
        exit 1
        ;;
esac
```

## 合规要求

### 1. 数据保护
- 遵守《网络安全法》
- 遵守《个人信息保护法》
- 数据本地化存储
- 用户数据最小化收集

### 2. 审计要求
- 保留操作日志至少6个月
- 定期安全审计
- 漏洞修复时限要求

## 安全更新

### 1. 自动更新
```bash
# 配置自动安全更新
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
```

### 2. 更新检查
```bash
#!/bin/bash
# check_updates.sh

# 检查系统更新
apt list --upgradable 2>/dev/null | grep -c upgradable

# 检查Python包更新
pip list --outdated

# 检查Node包更新
npm outdated
```

## 联系信息

- 安全团队: security@carplatform.com
- 应急响应: emergency@carplatform.com

---

**注意**: 本文档应定期更新，以反映最新的安全威胁和防护措施。

最后更新: 2025-03-31
