import { Car, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Car className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold text-white">汽车信息平台</span>
            </div>
            <p className="text-sm text-gray-400">
              专业的汽车信息平台，为您提供最新、最全的汽车资讯、车型信息和价格动态。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <a href="/vehicles" className="text-sm hover:text-primary-400 transition-colors">
                  车型库
                </a>
              </li>
              <li>
                <a href="/brands" className="text-sm hover:text-primary-400 transition-colors">
                  品牌大全
                </a>
              </li>
              <li>
                <a href="/sales-rank" className="text-sm hover:text-primary-400 transition-colors">
                  销量排行
                </a>
              </li>
              <li>
                <a href="/news" className="text-sm hover:text-primary-400 transition-colors">
                  汽车资讯
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">服务项目</h3>
            <ul className="space-y-2">
              <li>
                <a href="/price-monitor" className="text-sm hover:text-primary-400 transition-colors">
                  价格监控
                </a>
              </li>
              <li>
                <span className="text-sm text-gray-500">车型对比（即将上线）</span>
              </li>
              <li>
                <span className="text-sm text-gray-500">购车计算器（即将上线）</span>
              </li>
              <li>
                <span className="text-sm text-gray-500">经销商查询（即将上线）</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">联系我们</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary-500" />
                <span className="text-sm">contact@carplatform.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary-500" />
                <span className="text-sm">400-888-8888</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-primary-500 mt-0.5" />
                <span className="text-sm">北京市朝阳区xxx大厦</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © 2025 汽车信息平台. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-500 hover:text-primary-400 transition-colors">
                隐私政策
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-primary-400 transition-colors">
                用户协议
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-primary-400 transition-colors">
                关于我们
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
