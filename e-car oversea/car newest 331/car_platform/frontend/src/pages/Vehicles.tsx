import { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Car, Filter, ChevronDown, Search, X } from 'lucide-react'
import { vehicleApi, filterApi } from '../services/api'
import { Vehicle, FilterOptions } from '../types'

export default function Vehicles() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filters, setFilters] = useState<FilterOptions | null>(null)
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  
  // 筛选状态
  const [selectedBrand, setSelectedBrand] = useState<number | null>(
    searchParams.get('brand_id') ? parseInt(searchParams.get('brand_id')!) : null
  )
  const [selectedLevel, setSelectedLevel] = useState<string | null>(
    searchParams.get('level')
  )
  const [selectedEnergy, setSelectedEnergy] = useState<string | null>(
    searchParams.get('energy_type')
  )
  const [selectedPriceRange, setSelectedPriceRange] = useState<{min?: number; max?: number} | null>(
    searchParams.get('min_price') ? {
      min: parseFloat(searchParams.get('min_price')!),
      max: searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined
    } : null
  )
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')

  const pageSize = 20

  useEffect(() => {
    fetchFilters()
  }, [])

  useEffect(() => {
    fetchVehicles()
  }, [selectedBrand, selectedLevel, selectedEnergy, selectedPriceRange, keyword, page])

  const fetchFilters = async () => {
    try {
      const res = await filterApi.getFilters()
      setFilters(res as FilterOptions)
    } catch (error) {
      console.error('Failed to fetch filters:', error)
    }
  }

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const params: any = {
        page,
        page_size: pageSize,
        is_on_sale: true,
      }
      
      if (selectedBrand) params.brand_id = selectedBrand
      if (selectedLevel) params.level = selectedLevel
      if (selectedEnergy) params.energy_type = selectedEnergy
      if (selectedPriceRange) {
        params.min_price = selectedPriceRange.min
        params.max_price = selectedPriceRange.max
      }
      if (keyword) params.keyword = keyword
      
      const res = await vehicleApi.getVehicles(params)
      setVehicles((res as any).data || [])
      setTotal((res as any).total || 0)
    } catch (error) {
      console.error('Failed to fetch vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSearchParams = useCallback(() => {
    const params: any = {}
    if (selectedBrand) params.brand_id = selectedBrand
    if (selectedLevel) params.level = selectedLevel
    if (selectedEnergy) params.energy_type = selectedEnergy
    if (selectedPriceRange) {
      params.min_price = selectedPriceRange.min
      if (selectedPriceRange.max) params.max_price = selectedPriceRange.max
    }
    if (keyword) params.keyword = keyword
    setSearchParams(params)
  }, [selectedBrand, selectedLevel, selectedEnergy, selectedPriceRange, keyword, setSearchParams])

  useEffect(() => {
    updateSearchParams()
  }, [updateSearchParams])

  const clearFilters = () => {
    setSelectedBrand(null)
    setSelectedLevel(null)
    setSelectedEnergy(null)
    setSelectedPriceRange(null)
    setKeyword('')
    setPage(1)
  }

  const formatPrice = (min?: number, max?: number) => {
    if (!min && !max) return '暂无报价'
    if (min === max) return `${min}万`
    return `${min || '-'} - ${max || '-'}万`
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">车型库</h1>
          <p className="text-gray-600 mt-1">
            共 {total} 款车型在售
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">筛选条件</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  清空
                </button>
              </div>

              {/* Brand Filter */}
              {filters && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">品牌</h4>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {filters.brands.map((brand) => (
                      <label
                        key={brand.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                      >
                        <input
                          type="radio"
                          name="brand"
                          checked={selectedBrand === brand.id}
                          onChange={() => setSelectedBrand(brand.id)}
                          className="text-primary-600"
                        />
                        <span className="text-sm text-gray-600">{brand.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Level Filter */}
              {filters && filters.levels.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">级别</h4>
                  <div className="space-y-1">
                    {filters.levels.map((level) => (
                      <label
                        key={level}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                      >
                        <input
                          type="radio"
                          name="level"
                          checked={selectedLevel === level}
                          onChange={() => setSelectedLevel(level)}
                          className="text-primary-600"
                        />
                        <span className="text-sm text-gray-600">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Energy Type Filter */}
              {filters && filters.energy_types.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">能源类型</h4>
                  <div className="space-y-1">
                    {filters.energy_types.map((type) => (
                      <label
                        key={type}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                      >
                        <input
                          type="radio"
                          name="energy"
                          checked={selectedEnergy === type}
                          onChange={() => setSelectedEnergy(type)}
                          className="text-primary-600"
                        />
                        <span className="text-sm text-gray-600">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range Filter */}
              {filters && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">价格区间</h4>
                  <div className="space-y-1">
                    {filters.price_ranges.map((range) => (
                      <label
                        key={range.label}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                      >
                        <input
                          type="radio"
                          name="price"
                          checked={selectedPriceRange?.min === range.min && selectedPriceRange?.max === range.max}
                          onChange={() => setSelectedPriceRange({ min: range.min, max: range.max })}
                          className="text-primary-600"
                        />
                        <span className="text-sm text-gray-600">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Mobile Filter Toggle */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索车型..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {keyword && (
                  <button
                    onClick={() => setKeyword('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="h-5 w-5 mr-2" />
                筛选
              </button>
            </div>

            {/* Active Filters */}
            {(selectedBrand || selectedLevel || selectedEnergy || selectedPriceRange) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedBrand && filters && (
                  <span className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    {filters.brands.find(b => b.id === selectedBrand)?.name}
                    <button onClick={() => setSelectedBrand(null)} className="ml-2">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedLevel && (
                  <span className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    {selectedLevel}
                    <button onClick={() => setSelectedLevel(null)} className="ml-2">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedEnergy && (
                  <span className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    {selectedEnergy}
                    <button onClick={() => setSelectedEnergy(null)} className="ml-2">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedPriceRange && (
                  <span className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    {selectedPriceRange.min}-{selectedPriceRange.max || '以上'}万
                    <button onClick={() => setSelectedPriceRange(null)} className="ml-2">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Vehicle Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-12">
                <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">没有找到符合条件的车型</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-primary-600 hover:text-primary-700"
                >
                  清空筛选条件
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vehicles.map((vehicle) => (
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center mt-8 gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      上一页
                    </button>
                    <span className="text-gray-600">
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      下一页
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
