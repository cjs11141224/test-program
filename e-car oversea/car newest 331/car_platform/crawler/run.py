"""
爬虫运行入口
支持命令行运行和API调用
"""
import os
import sys
import json
import logging
import argparse
from datetime import datetime
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent))

from scrapy.crawler import CrawlerProcess, CrawlerRunner
from scrapy.utils.project import get_project_settings
from twisted.internet import reactor

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f'logs/crawler_{datetime.now().strftime("%Y%m%d")}.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)


def run_spider(spider_name: str, **kwargs):
    """
    运行单个爬虫
    
    Args:
        spider_name: 爬虫名称
        **kwargs: 传递给爬虫的参数
    """
    settings = get_project_settings()
    
    # 创建日志目录
    os.makedirs('logs', exist_ok=True)
    
    process = CrawlerProcess(settings)
    
    logger.info(f"Starting spider: {spider_name}")
    logger.info(f"Spider kwargs: {kwargs}")
    
    process.crawl(spider_name, **kwargs)
    process.start()


def run_all_spiders(crawl_type: str = 'all'):
    """
    运行所有爬虫
    
    Args:
        crawl_type: 抓取类型 (all, vehicle, news, price, sales)
    """
    spiders = ['autohome', 'dongchedi', 'yiche']
    
    settings = get_project_settings()
    
    # 创建日志目录
    os.makedirs('logs', exist_ok=True)
    
    runner = CrawlerRunner(settings)
    
    logger.info(f"Starting all spiders with crawl_type: {crawl_type}")
    
    # 顺序运行爬虫
    for spider_name in spiders:
        logger.info(f"Scheduling spider: {spider_name}")
        runner.crawl(spider_name, crawl_type=crawl_type)
    
    d = runner.join()
    d.addBoth(lambda _: reactor.stop())
    reactor.run()


def run_scheduled_crawl():
    """运行定时抓取任务"""
    from apscheduler.schedulers.twisted import TwistedScheduler
    
    settings = get_project_settings()
    runner = CrawlerRunner(settings)
    scheduler = TwistedScheduler()
    
    # 添加定时任务
    # 每30分钟抓取资讯
    scheduler.add_job(
        runner.crawl,
        'interval',
        minutes=30,
        args=['dongchedi'],
        kwargs={'crawl_type': 'news'},
        id='news_crawl',
        replace_existing=True
    )
    
    # 每小时抓取价格
    scheduler.add_job(
        runner.crawl,
        'interval',
        hours=1,
        args=['autohome'],
        kwargs={'crawl_type': 'price'},
        id='price_crawl',
        replace_existing=True
    )
    
    # 每天抓取车型信息
    scheduler.add_job(
        runner.crawl,
        'cron',
        hour=2,
        minute=0,
        args=['yiche'],
        kwargs={'crawl_type': 'vehicle'},
        id='vehicle_crawl',
        replace_existing=True
    )
    
    # 每天抓取销量排行
    scheduler.add_job(
        runner.crawl,
        'cron',
        hour=3,
        minute=0,
        args=['dongchedi'],
        kwargs={'crawl_type': 'sales'},
        id='sales_crawl',
        replace_existing=True
    )
    
    logger.info("Scheduled crawler started")
    scheduler.start()
    reactor.run()


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='Car Platform Crawler')
    parser.add_argument(
        'command',
        choices=['run', 'runall', 'schedule'],
        help='Command to execute'
    )
    parser.add_argument(
        '--spider',
        '-s',
        choices=['autohome', 'dongchedi', 'yiche'],
        help='Spider name (for run command)'
    )
    parser.add_argument(
        '--type',
        '-t',
        choices=['all', 'vehicle', 'news', 'price', 'sales'],
        default='all',
        help='Crawl type'
    )
    parser.add_argument(
        '--output',
        '-o',
        help='Output file path (JSON format)'
    )
    
    args = parser.parse_args()
    
    if args.command == 'run':
        if not args.spider:
            parser.error('--spider is required for run command')
        run_spider(args.spider, crawl_type=args.type)
    
    elif args.command == 'runall':
        run_all_spiders(crawl_type=args.type)
    
    elif args.command == 'schedule':
        run_scheduled_crawl()


if __name__ == '__main__':
    main()
