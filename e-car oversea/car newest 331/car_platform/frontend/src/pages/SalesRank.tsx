import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, Minus, Car, Calendar } from 'lucide-react'
import { salesApi } from '../services/api'
import { SalesRank } from '../types'

export default function SalesRank() {
  const [ranks, setRanks] = useState<SalesRank[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<string>('')

  useEffect(() => {
    fetchSalesRank()
  }, [])

  const fetchSalesRank = async () => {
    try {
      setLoading(true)
      const res = await salesApi.getSalesRank({ limit: 50 })
      setRanks(res as SalesRank[])
      if ((res as SalesRank[]).length > 0) {
        setPeriod((res as SalesRank[])[0].period)
      }
    } catch (error) {
      console.error('Failed to fetch sales rank:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankChangeIcon = (change?: number) => {
    if (!change || change === 0) return <Minus className="h-4 w-4 text-gray-400" />
    if (change > 0) return <TrendingUp className="h-4 w-4 text-red-500" />
    return <TrendingDown className="h-4 w-4 text-green-500" />
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">销量排行</h1>
              <p className="text-gray-600 mt-1 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {period ? `${period} 销量数据` : '最新销量数据'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : ranks.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无销量数据</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">排名</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">车型</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">销量</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">环比</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">市场份额</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ranks.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index < 3 
                            ? 'bg-primary-100 text-primary-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {item.rank}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link 
                          to={`/vehicles/${item.vehicle_id}`}
                          className="font-medium text-gray-900 hover:text-primary-600"
                        >
                          {item.vehicle_name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">
                        {item.sales_volume.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end">
                          {getRankChangeIcon(item.rank_change)}
                          <span className={`ml-1 ${
                            item.rank_change && item.rank_change > 0 
                              ? 'text-red-500' 
                              : item.rank_change && item.rank_change < 0 
                                ? 'text-green-500' 
                                : 'text-gray-500'
                          }`}>
                            {item.rank_change ? Math.abs(item.rank_change) : '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">
                        {item.market_share ? `${item.market_share}%` : '-'}
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
