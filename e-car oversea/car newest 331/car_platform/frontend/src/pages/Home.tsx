import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Car, 
  TrendingUp, 
  Newspaper, 
  ChevronRight,
  Zap,
  Fuel,
  Battery
} from 'lucide-react'
import { statsApi, vehicleApi, newsApi, salesApi } from '../services/api'
import { Stats, Vehicle, News, SalesRank } from '../types'

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [hotVehicles, setHotVehicles] = useState<Vehicle[]>([])
  const [latestNews, setLatestNews] = useState<News[]>([])
  const [salesRank, setSalesRank] = useState<SalesRank[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // 并行获取数据
      const [statsRes, vehiclesRes, newsRes, salesRes] = await Promise.all([
        statsApi.getStats(),
        vehicleApi.getVehicles({ is_on_sale: true, page_size: 8 }),
        newsApi.getNews({ page_size: 6 }),
        salesApi.getSalesRank({ limit: 10 }),
      ])
      
      setStats(statsRes as Stats)
      setHotVehicles((vehiclesRes as any).data || [])
      setLatestNews((newsRes as any).data || [])
      setSalesRank(salesRes as SalesRank[])
    } catch (error) {
      console.error('Failed to fetch home data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (min?: number, max?: number) => {
    if (!min && !max) return '暂无报价'
    if (min === max) return `${min}万`
    return `${min || '-'} - ${max || '-'}万`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              发现您的理想座驾
            </h1>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              汇聚全网汽车信息，提供最新车型、价格、资讯，助您做出明智的购车决策
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/vehicles"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Car className="h-5 w-5 mr-2" />
                浏览车型
              </Link>
              <Link
                to="/news"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-700 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors border border-primary-500"
              >
                <Newspaper className="h-5 w-5 mr-2" />
                最新资讯
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">{stats.brand_count}+</div>
                <div className="text-gray-600 mt-1">汽车品牌</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">{stats.vehicle_count}+</div>
                <div className="text-gray-600 mt-1">车型数据</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">{stats.on_sale_count}+</div>
                <div className="text-gray-600 mt-1">在售车型</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">{stats.new_energy_count}+</div>
                <div className="text-gray-600 mt-1">新能源车</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">{stats.news_count}+</div>
                <div className="text-gray-600 mt-1">最新资讯</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Hot Vehicles Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">热门车型</h2>
            <Link
              to="/vehicles"
              className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              查看全部
              <ChevronRight className="h-5 w-5 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {hotVehicles.map((vehicle) => (
              <Link
                key={vehicle.id}
                to={`/vehicles/${vehicle.id}`}
                className="bg-white rounded-xl shadow-sm overflow-hidden card-hover"
              >
                <div className="aspect-video bg-gray-200 relative">
                  {vehicle.main_image ? (
                    <img
                      src={vehicle.main_image}
                      alt={vehicle.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Car className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{vehicle.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{vehicle.brand_name}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-600 font-bold">
                      {formatPrice(vehicle.min_price, vehicle.max_price)}
                    </span>
                    {vehicle.score && (
                      <span className="text-sm text-gray-500">
                        {vehicle.score}分
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {vehicle.energy_type && (
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                        {vehicle.energy_type}
                      </span>
                    )}
                    {vehicle.level && (
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                        {vehicle.level}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sales Rank Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">销量排行</h2>
            </div>
            <Link
              to="/sales-rank"
              className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              查看全部
              <ChevronRight className="h-5 w-5 ml-1" />
            </Link>
          </div>
          
          <div className="bg-gray-50 rounded-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              {salesRank.slice(0, 6).map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center bg-white rounded-lg p-4 shadow-sm"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index < 3 ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.rank}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="font-medium text-gray-900">{item.vehicle_name}</div>
                    <div className="text-sm text-gray-500">
                      销量: {item.sales_volume.toLocaleString()} 辆
                    </div>
                  </div>
                  {item.market_share && (
                    <div className="text-sm text-primary-600">
                      {item.market_share}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Newspaper className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">最新资讯</h2>
            </div>
            <Link
              to="/news"
              className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              查看全部
              <ChevronRight className="h-5 w-5 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestNews.map((news) => (
              <Link
                key={news.id}
                to={`/news/${news.id}`}
                className="bg-white rounded-xl shadow-sm overflow-hidden card-hover"
              >
                <div className="aspect-video bg-gray-200 relative">
                  {news.cover_image ? (
                    <img
                      src={news.cover_image}
                      alt={news.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Newspaper className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {news.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {news.summary}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{news.source_name || news.author || '未知来源'}</span>
                    <span>{news.view_count} 阅读</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            为什么选择我们
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">实时更新</h3>
              <p className="text-gray-600">
                数据自动抓取，30分钟内更新最新价格、资讯，确保信息时效性
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Fuel className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">全面覆盖</h3>
              <p className="text-gray-600">
                覆盖主流汽车品牌和车型，包含燃油车、新能源车等多种类型
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Battery className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">专业分析</h3>
              <p className="text-gray-600">
                提供销量排行、价格走势等专业数据分析，辅助购车决策
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
