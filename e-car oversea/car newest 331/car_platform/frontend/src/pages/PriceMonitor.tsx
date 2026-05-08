import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Car, Calendar } from 'lucide-react'
import { priceApi } from '../services/api'
import { Price } from '../types'

export default function PriceMonitor() {
  const [prices, setPrices] = useState<Price[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrices()
  }, [])

  const fetchPrices = async () => {
    try {
      setLoading(true)
      const res = await priceApi.getLatestPrices({ limit: 100 })
      setPrices((res as any).data || [])
    } catch (error) {
      console.error('Failed to fetch prices:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPriceChangeIcon = (change?: number) => {
    if (!change || change === 0) return <Minus className="h-4 w-4 text-gray-400" />
    if (change > 0) return <TrendingUp className="h-4 w-4 text-red-500" />
    return <TrendingDown className="h-4 w-4 text-green-500" />
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">价格监控</h1>
          <p className="text-gray-600 mt-1">实时追踪汽车价格变动，把握最佳购车时机</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : prices.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无价格数据</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">车型</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">当前价格</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">变动</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">地区</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">更新时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {prices.map((price) => (
                    <tr key={price.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{price.vehicle_name}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-primary-600">
                        {price.price}万
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end">
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
                      <td className="px-6 py-4 text-gray-600">
                        {price.city || price.province || '-'}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-500">
                        {new Date(price.record_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
