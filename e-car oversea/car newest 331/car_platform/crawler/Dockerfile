FROM python:3.11-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    libxml2-dev \
    libxslt1-dev \
    zlib1g-dev \
    libffi-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 创建日志和图片目录
RUN mkdir -p logs images

# 设置环境变量
ENV PYTHONPATH=/app
ENV SCRAPY_SETTINGS_MODULE=car_crawler.settings

# 启动命令
CMD ["python", "scheduler.py"]
