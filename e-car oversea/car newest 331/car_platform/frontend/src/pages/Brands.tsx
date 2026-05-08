import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Tag, Car } from 'lucide-react'
import { brandApi } from '../services/api'
import { Brand } from '../types'

export default function Brands() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'domestic' | 'new_energy'>('all')

  useEffect(() => {
    fetchBrands()
  }, [filter])

  const fetchBrands = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (filter === 'domestic') params.is_domestic = true
      if (filter === 'new_energy') params.is_new_energy = true
      
      const res = await brandApi.getBrands(params)
      setBrands(res as Brand[])
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">汽车品牌</h1>
          <p className="text-gray-600 mt-1">浏览所有汽车品牌，找到您心仪的车型</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            全部品牌
          </button>
          <button
            onClick={() => setFilter('domestic')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'domestic'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            国产品牌
          </button>
          <button
            onClick={() => setFilter('new_energy')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'new_energy'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            新能源品牌
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : brands.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无品牌数据</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                to={`/vehicles?brand_id=${brand.id}`}
                className="bg-white rounded-xl shadow-sm p-6 text-center card-hover"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  {brand.logo_url ? (
                    <img
                      src={brand.logo_url}
                      alt={brand.name}
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <Car className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <h3 className="font-medium text-gray-900">{brand.name}</h3>
                {brand.vehicle_count > 0 && (
                  <p className="text-sm text-gray-500 mt-1">{brand.vehicle_count} 款车型</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
