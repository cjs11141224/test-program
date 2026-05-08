"""
爬虫调度器
实现定时抓取任务的调度管理
"""
import os
import sys
import json
import logging
from datetime import datetime
from pathlib import Path

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.events import EVENT_JOB_EXECUTED, EVENT_JOB_ERROR

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f'logs/scheduler_{datetime.now().strftime("%Y%m%d")}.log', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)


class CrawlScheduler:
    """
    爬虫调度器
    管理定时抓取任务的调度
    """
    
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.jobs = {}
        
        # 添加事件监听
        self.scheduler.add_listener(
            self._on_job_executed,
            EVENT_JOB_EXECUTED | EVENT_JOB_ERROR
        )
    
    def _on_job_executed(self, event):
        """任务执行完成回调"""
        if event.exception:
            logger.error(f"Job {event.job_id} failed: {event.exception}")
        else:
            logger.info(f"Job {event.job_id} executed successfully")
    
    def add_news_crawl_job(self):
        """添加资讯抓取任务"""
        # 每30分钟抓取一次资讯
        self.scheduler.add_job(
            self._run_news_crawl,
            IntervalTrigger(minutes=30),
            id='news_crawl',
            name='News Crawl',
            replace_existing=True,
            max_instances=1
        )
        logger.info("Added news crawl job (every 30 minutes)")
    
    def add_price_crawl_job(self):
        """添加价格抓取任务"""
        # 每小时抓取一次价格
        self.scheduler.add_job(
            self._run_price_crawl,
            IntervalTrigger(hours=1),
            id='price_crawl',
            name='Price Crawl',
            replace_existing=True,
            max_instances=1
        )
        logger.info("Added price crawl job (every hour)")
    
    def add_vehicle_crawl_job(self):
        """添加车型抓取任务"""
        # 每天凌晨2点抓取车型信息
        self.scheduler.add_job(
            self._run_vehicle_crawl,
            CronTrigger(hour=2, minute=0),
            id='vehicle_crawl',
            name='Vehicle Crawl',
            replace_existing=True,
            max_instances=1
        )
        logger.info("Added vehicle crawl job (daily at 02:00)")
    
    def add_sales_crawl_job(self):
        """添加销量抓取任务"""
        # 每天凌晨3点抓取销量排行
        self.scheduler.add_job(
            self._run_sales_crawl,
            CronTrigger(hour=3, minute=0),
            id='sales_crawl',
            name='Sales Rank Crawl',
            replace_existing=True,
            max_instances=1
        )
        logger.info("Added sales crawl job (daily at 03:00)")
    
    def add_full_crawl_job(self):
        """添加全量抓取任务"""
        # 每周日凌晨4点执行全量抓取
        self.scheduler.add_job(
            self._run_full_crawl,
            CronTrigger(day_of_week='sun', hour=4, minute=0),
            id='full_crawl',
            name='Full Crawl',
            replace_existing=True,
            max_instances=1
        )
        logger.info("Added full crawl job (weekly on Sunday at 04:00)")
    
    def _run_news_crawl(self):
        """运行资讯抓取"""
        logger.info("Running news crawl job")
        try:
            from run import run_spider
            run_spider('dongchedi', crawl_type='news')
        except Exception as e:
            logger.error(f"News crawl failed: {e}")
    
    def _run_price_crawl(self):
        """运行价格抓取"""
        logger.info("Running price crawl job")
        try:
            from run import run_spider
            run_spider('autohome', crawl_type='price')
        except Exception as e:
            logger.error(f"Price crawl failed: {e}")
    
    def _run_vehicle_crawl(self):
        """运行车型抓取"""
        logger.info("Running vehicle crawl job")
        try:
            from run import run_spider
            run_spider('yiche', crawl_type='vehicle')
        except Exception as e:
            logger.error(f"Vehicle crawl failed: {e}")
    
    def _run_sales_crawl(self):
        """运行销量抓取"""
        logger.info("Running sales crawl job")
        try:
            from run import run_spider
            run_spider('dongchedi', crawl_type='sales')
        except Exception as e:
            logger.error(f"Sales crawl failed: {e}")
    
    def _run_full_crawl(self):
        """运行全量抓取"""
        logger.info("Running full crawl job")
        try:
            from run import run_all_spiders
            run_all_spiders(crawl_type='all')
        except Exception as e:
            logger.error(f"Full crawl failed: {e}")
    
    def start(self):
        """启动调度器"""
        logger.info("Starting scheduler...")
        
        # 添加所有任务
        self.add_news_crawl_job()
        self.add_price_crawl_job()
        self.add_vehicle_crawl_job()
        self.add_sales_crawl_job()
        self.add_full_crawl_job()
        
        # 启动调度器
        self.scheduler.start()
        logger.info("Scheduler started successfully")
        
        # 打印任务列表
        self.print_jobs()
    
    def shutdown(self):
        """关闭调度器"""
        logger.info("Shutting down scheduler...")
        self.scheduler.shutdown()
        logger.info("Scheduler shutdown complete")
    
    def pause_job(self, job_id: str):
        """暂停任务"""
        self.scheduler.pause_job(job_id)
        logger.info(f"Paused job: {job_id}")
    
    def resume_job(self, job_id: str):
        """恢复任务"""
        self.scheduler.resume_job(job_id)
        logger.info(f"Resumed job: {job_id}")
    
    def remove_job(self, job_id: str):
        """删除任务"""
        self.scheduler.remove_job(job_id)
        logger.info(f"Removed job: {job_id}")
    
    def get_job_status(self, job_id: str = None):
        """获取任务状态"""
        if job_id:
            job = self.scheduler.get_job(job_id)
            if job:
                return {
                    'id': job.id,
                    'name': job.name,
                    'next_run_time': job.next_run_time.isoformat() if job.next_run_time else None,
                    'trigger': str(job.trigger),
                }
            return None
        
        # 返回所有任务状态
        jobs = []
        for job in self.scheduler.get_jobs():
            jobs.append({
                'id': job.id,
                'name': job.name,
                'next_run_time': job.next_run_time.isoformat() if job.next_run_time else None,
                'trigger': str(job.trigger),
            })
        return jobs
    
    def print_jobs(self):
        """打印任务列表"""
        jobs = self.get_job_status()
        logger.info("=" * 60)
        logger.info("Scheduled Jobs:")
        logger.info("-" * 60)
        for job in jobs:
            logger.info(f"  {job['id']}: {job['name']}")
            logger.info(f"    Next run: {job['next_run_time']}")
            logger.info(f"    Trigger: {job['trigger']}")
        logger.info("=" * 60)


def run_scheduler():
    """运行调度器"""
    import time
    
    # 创建日志目录
    os.makedirs('logs', exist_ok=True)
    
    scheduler = CrawlScheduler()
    scheduler.start()
    
    try:
        # 保持程序运行
        while True:
            time.sleep(60)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()


if __name__ == '__main__':
    run_scheduler()
