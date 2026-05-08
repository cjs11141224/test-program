import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Car, 
  ArrowLeft, 
  Zap, 
  Gauge, 
  Battery, 
  Ruler, 
  Weight,
  Calendar,
  Star,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { vehicleApi, priceApi } from '../services/api'
import { VehicleDetail as VehicleDetailType, Price } from '../types'

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>()
  const [vehicle, setVehicle] = useState<VehicleDetailType | null>(null)
  const [prices, setPrices] = useState<Price[]>([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    if (id) {
      fetchVehicleDetail(parseInt(id))
    }
  }, [id])

  const fetchVehicleDetail = async (vehicleId: number) => {
    try {
      setLoading(true)
      const [vehicleRes, pricesRes] = await Promise.all([
        vehicleApi.getVehicle(vehicleId),
        vehicleApi.getVehiclePrices(vehicleId, { limit: 30 }),
      ])
      
      setVehicle(vehicleRes as VehicleDetailType)
      setPrices((pricesRes as any).data || [])
    } catch (error) {
      console.error('Failed to fetch vehicle detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (min?: number, max?: number) => {
    if (!min && !max) return '暂无报价'
    if (min === max) return `${min}万`
    return `${min || '-'} - ${max || '-'}万`
  }

  const getPriceChangeIcon = (change?: number) => {
    if (!change) return <Minus className="h-4 w-4" />
    if (change > 0) return <TrendingUp className="h-4 w-4 text-red-500" />
    return <TrendingDown className="h-4 w-4 text-green-500" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">车型不存在</h2>
          <Link to="/vehicles" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            返回车型列表
          </Link>
        </div>
      </div>
    )
  }

  const images = vehicle.images?.length > 0 ? vehicle.images : [vehicle.main_image]

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/vehicles"
            className="flex items-center text-gray-600 hover:text-primary-600"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回车型列表
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden">
              {images[activeImage] ? (
                <img
                  src={images[activeImage]}
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Car className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                      activeImage === index ? 'border-primary-600' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${vehicle.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vehicle Info */}
          <div>
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{vehicle.name}</h1>
              <p className="text-gray-500 mt-1">{vehicle.full_name || vehicle.brand_name}</p>
            </div>

            {/* Price */}
            <div className="bg-primary-50 rounded-xl p-6 mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary-600">
                  {formatPrice(vehicle.min_price, vehicle.max_price)}
                </span>
                <span className="text-gray-500">厂商指导价</span>
              </div>
              {vehicle.min_guide_price !== vehicle.min_price && (
                <div className="text-sm text-gray-500 mt-2">
                  指导价: {formatPrice(vehicle.min_guide_price, vehicle.max_guide_price)}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {vehicle.energy_type && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {vehicle.energy_type}
                </span>
              )}
              {vehicle.level && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  {vehicle.level}
                </span>
              )}
              {vehicle.body_type && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  {vehicle.body_type}
                </span>
              )}
              {vehicle.is_on_sale ? (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  在售
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  停售
                </span>
              )}
            </div>

            {/* Score */}
            {vehicle.score && (
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="ml-1 font-semibold">{vehicle.score}</span>
                </div>
                <span className="text-gray-500">{vehicle.review_count} 人评价</span>
              </div>
            )}

            {/* Quick Specs */}
            <div className="grid grid-cols-2 gap-4">
              {vehicle.cltc_range && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Battery className="h-5 w-5" />
                  <span>续航 {vehicle.cltc_range}km</span>
                </div>
              )}
              {vehicle.acceleration && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Zap className="h-5 w-5" />
                  <span>加速 {vehicle.acceleration}s</span>
                </div>
              )}
              {vehicle.max_speed && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Gauge className="h-5 w-5" />
                  <span>最高 {vehicle.max_speed}km/h</span>
                </div>
              )}
              {vehicle.battery_capacity && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Battery className="h-5 w-5" />
                  <span>电池 {vehicle.battery_capacity}kWh</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Specs */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">详细参数</h2>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {/* 基本信息 */}
              <div className="p-6 border-b md:border-r">
                <h3 className="font-semibold text-gray-900 mb-4">基本信息</h3>
                <dl className="space-y-3">
                  {vehicle.length && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">长</dt>
                      <dd className="text-gray-900">{vehicle.length}mm</dd>
                    </div>
                  )}
                  {vehicle.width && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">宽</dt>
                      <dd className="text-gray-900">{vehicle.width}mm</dd>
                    </div>
                  )}
                  {vehicle.height && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">高</dt>
                      <dd className="text-gray-900">{vehicle.height}mm</dd>
                    </div>
                  )}
                  {vehicle.wheelbase && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">轴距</dt>
                      <dd className="text-gray-900">{vehicle.wheelbase}mm</dd>
                    </div>
                  )}
                  {vehicle.curb_weight && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">整备质量</dt>
                      <dd className="text-gray-900">{vehicle.curb_weight}kg</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* 动力系统 */}
              <div className="p-6 border-b lg:border-r">
                <h3 className="font-semibold text-gray-900 mb-4">动力系统</h3>
                <dl className="space-y-3">
                  {vehicle.motor_power && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">电机功率</dt>
                      <dd className="text-gray-900">{vehicle.motor_power}kW</dd>
                    </div>
                  )}
                  {vehicle.motor_torque && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">电机扭矩</dt>
                      <dd className="text-gray-900">{vehicle.motor_torque}N·m</dd>
                    </div>
                  )}
                  {vehicle.engine_displacement && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">发动机排量</dt>
                      <dd className="text-gray-900">{vehicle.engine_displacement}L</dd>
                    </div>
                  )}
                  {vehicle.engine_power && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">发动机功率</dt>
                      <dd className="text-gray-900">{vehicle.engine_power}kW</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* 电池/续航 */}
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">电池与续航</h3>
                <dl className="space-y-3">
                  {vehicle.battery_capacity && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">电池容量</dt>
                      <dd className="text-gray-900">{vehicle.battery_capacity}kWh</dd>
                    </div>
                  )}
                  {vehicle.battery_type && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">电池类型</dt>
                      <dd className="text-gray-900">{vehicle.battery_type}</dd>
                    </div>
                  )}
                  {vehicle.cltc_range && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">CLTC续航</dt>
                      <dd className="text-gray-900">{vehicle.cltc_range}km</dd>
                    </div>
                  )}
                  {vehicle.nedc_range && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">NEDC续航</dt>
                      <dd className="text-gray-900">{vehicle.nedc_range}km</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Price History */}
        {prices.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">价格变动</h2>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">价格</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">变动</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">地区</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {prices.slice(0, 10).map((price) => (
                      <tr key={price.id}>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(price.record_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {price.price}万
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center">
                            {getPriceChangeIcon(price.price_change)}
                            <span className={`ml-1 ${
                              price.price_change && price.price_change > 0 
                                ? 'text-red-500' 
                                : price.price_change && price.price_change < 0 
                                  ? 'text-green-500' 
                                  : 'text-gray-500'
                            }`}>
                              {price.price_change ? `${price.price_change > 0 ? '+' : ''}${price.price_change}万` : '-'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {price.city || price.province || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
