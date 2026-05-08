# 汽车信息平台运维手册

## 日常运维任务

### 每日检查清单

- [ ] 检查系统日志，确认无异常错误
- [ ] 检查爬虫运行状态，确认任务正常执行
- [ ] 检查数据库连接和性能
- [ ] 检查磁盘空间使用情况
- [ ] 检查API响应时间和可用性
- [ ] 检查数据更新状态

### 每周检查清单

- [ ] 分析爬虫成功率统计
- [ ] 检查数据库备份完整性
- [ ] 清理过期日志文件
- [ ] 检查系统资源使用趋势
- [ ] 更新安全补丁
- [ ] 检查SSL证书有效期

### 每月检查清单

- [ ] 数据库性能优化
- [ ] 数据归档和清理
- [ ] 安全审计
- [ ] 容量规划评估
- [ ] 备份恢复测试

## 常用运维命令

### 服务管理

```bash
# 启动后端服务
systemctl start car-platform-backend

# 停止后端服务
systemctl stop car-platform-backend

# 重启后端服务
systemctl restart car-platform-backend

# 查看服务状态
systemctl status car-platform-backend

# 查看服务日志
journalctl -u car-platform-backend -f
```

### 爬虫管理

```bash
# 启动爬虫调度器
cd /mnt/okcomputer/output/car_platform/crawler
python scheduler.py

# 手动运行爬虫
python run.py run autohome --type vehicle

# 查看爬虫日志
tail -f logs/crawler_$(date +%Y%m%d).log

# 停止爬虫调度器
pkill -f scheduler.py
```

### 数据库管理

```bash
# 连接数据库
psql -h localhost -U car_user -d car_platform

# 查看数据库大小
SELECT pg_size_pretty(pg_database_size('car_platform'));

# 查看表大小
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname='public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# 查看活跃连接
SELECT * FROM pg_stat_activity WHERE datname = 'car_platform';

# 杀死空闲连接
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE datname = 'car_platform' AND state = 'idle';
```

### 日志管理

```bash
# 查看后端日志
tail -f backend/logs/app.log

# 查看爬虫日志
tail -f crawler/logs/crawler_$(date +%Y%m%d).log

# 查看错误日志
grep ERROR backend/logs/app.log

# 清理7天前的日志
find backend/logs -name "*.log" -mtime +7 -delete
find crawler/logs -name "*.log" -mtime +7 -delete
```

## 监控指标

### 系统监控

```bash
# CPU使用率
top

# 内存使用
free -h

# 磁盘使用
df -h

# 网络连接
netstat -an | grep :8000

# IO性能
iostat -x 1
```

### 应用监控

```bash
# API响应时间测试
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8000/api/stats

# 数据库查询性能
psql -c "SELECT query, calls, mean_time, total_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# 爬虫统计
curl http://localhost:8000/api/crawl-stats
```

## 故障处理

### 服务不可用

1. 检查服务状态
```bash
systemctl status car-platform-backend
curl http://localhost:8000/health
```

2. 检查端口占用
```bash
netstat -tlnp | grep 8000
lsof -i :8000
```

3. 重启服务
```bash
systemctl restart car-platform-backend
```

### 数据库连接问题

1. 检查数据库服务
```bash
systemctl status postgresql
```

2. 检查连接配置
```bash
psql -h localhost -U car_user -d car_platform -c "SELECT 1;"
```

3. 检查连接池
```bash
psql -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'car_platform';"
```

### 爬虫异常

1. 检查爬虫进程
```bash
ps aux | grep scrapy
ps aux | grep scheduler
```

2. 查看错误日志
```bash
tail -n 100 crawler/logs/crawler_$(date +%Y%m%d).log | grep ERROR
```

3. 手动触发爬虫
```bash
cd /mnt/okcomputer/output/car_platform/crawler
python run.py run dongchedi --type news
```

### 内存不足

1. 查看内存使用
```bash
free -h
ps aux --sort=-%mem | head -20
```

2. 重启服务释放内存
```bash
systemctl restart car-platform-backend
systemctl restart car-platform-crawler
```

3. 增加交换空间
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 磁盘空间不足

1. 查看磁盘使用
```bash
df -h
du -sh /mnt/okcomputer/output/car_platform/*
```

2. 清理日志
```bash
find /mnt/okcomputer/output/car_platform -name "*.log" -mtime +7 -delete
```

3. 清理图片缓存
```bash
find /mnt/okcomputer/output/car_platform/crawler/images -mtime +30 -delete
```

## 数据维护

### 数据清理

```sql
-- 清理30天前的资讯
DELETE FROM news WHERE created_at < NOW() - INTERVAL '30 days';

-- 清理90天前的价格历史
DELETE FROM price_history WHERE record_date < NOW() - INTERVAL '90 days';

-- 清理爬虫日志
DELETE FROM crawl_tasks WHERE created_at < NOW() - INTERVAL '30 days';

-- 清理无效代理
DELETE FROM proxy_ips WHERE is_active = false AND last_check_at < NOW() - INTERVAL '7 days';
```

### 数据备份

```bash
#!/bin/bash
# backup.sh - 备份脚本

BACKUP_DIR="/backup/car_platform"
DATE=$(date +%Y%m%d)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
pg_dump car_platform > $BACKUP_DIR/car_platform_$DATE.sql

# 备份图片
tar -czf $BACKUP_DIR/images_$DATE.tar.gz /mnt/okcomputer/output/car_platform/crawler/images/

# 保留最近7天备份
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

### 数据恢复

```bash
#!/bin/bash
# restore.sh - 恢复脚本

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

# 恢复数据库
psql car_platform < $BACKUP_FILE

# 恢复图片
tar -xzf ${BACKUP_FILE%.sql}.tar.gz -C /

echo "Restore completed"
```

## 安全维护

### 更新系统

```bash
# 更新系统包
sudo apt update
sudo apt upgrade -y

# 更新Python包
pip list --outdated
pip install --upgrade <package_name>

# 更新Node包
npm outdated
npm update
```

### 安全扫描

```bash
# 检查开放端口
nmap localhost

# 检查安全更新
sudo apt list --upgradable | grep security

# 查看登录日志
lastb
```

### SSL证书更新

```bash
# 检查证书有效期
openssl x509 -in /etc/letsencrypt/live/your-domain.com/cert.pem -noout -dates

# 更新证书
certbot renew

# 强制更新
certbot renew --force-renewal
```

## 性能优化

### 数据库优化

```sql
-- 更新表统计信息
ANALYZE;

-- 重建索引
REINDEX DATABASE car_platform;

-- 清理表空间
VACUUM FULL;

-- 优化配置
ALTER SYSTEM SET shared_buffers = '2GB';
ALTER SYSTEM SET effective_cache_size = '4GB';
ALTER SYSTEM SET work_mem = '256MB';
```

### 缓存优化

```bash
# 清除Redis缓存
redis-cli FLUSHDB

# 查看缓存命中率
redis-cli INFO stats
```

## 扩容方案

### 水平扩展

1. 数据库读写分离
2. 爬虫分布式部署
3. 负载均衡配置

### 垂直扩展

1. 增加服务器配置
2. 优化数据库性能
3. 增加缓存容量

## 应急响应

### 紧急联系人

- 运维负责人: ops@carplatform.com
- 技术负责人: tech@carplatform.com
- 业务负责人: business@carplatform.com

### 应急流程

1. 发现问题 -> 立即通知相关人员
2. 初步诊断 -> 判断问题类型和严重程度
3. 临时处理 -> 采取临时措施恢复服务
4. 根因分析 -> 分析问题根本原因
5. 永久修复 -> 实施永久解决方案
6. 事后总结 -> 记录问题和解决方案

## 文档更新

本文档应定期更新，记录:
- 新的运维任务
- 新的故障案例
- 优化措施
- 配置变更

最后更新: 2025-03-31
