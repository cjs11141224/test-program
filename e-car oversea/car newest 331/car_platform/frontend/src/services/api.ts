import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token等
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// 品牌API
export const brandApi = {
  getBrands: (params?: { is_domestic?: boolean; is_new_energy?: boolean }) =>
    api.get('/brands', { params }),
  getBrand: (id: number) => api.get(`/brands/${id}`),
}

// 车型API
export const vehicleApi = {
  getVehicles: (params?: {
    brand_id?: number
    level?: string
    energy_type?: string
    min_price?: number
    max_price?: number
    is_on_sale?: boolean
    keyword?: string
    sort_by?: string
    sort_order?: string
    page?: number
    page_size?: number
  }) => api.get('/vehicles', { params }),
  getVehicle: (id: number) => api.get(`/vehicles/${id}`),
  getVehiclePrices: (id: number, params?: { price_type?: string; limit?: number }) =>
    api.get(`/vehicles/${id}/prices`, { params }),
}

// 资讯API
export const newsApi = {
  getNews: (params?: {
    category?: string
    keyword?: string
    is_top?: boolean
    page?: number
    page_size?: number
  }) => api.get('/news', { params }),
  getNewsDetail: (id: number) => api.get(`/news/${id}`),
}

// 价格API
export const priceApi = {
  getLatestPrices: (params?: { vehicle_id?: number; limit?: number }) =>
    api.get('/prices/latest', { params }),
}

// 销量排行API
export const salesApi = {
  getSalesRank: (params?: { period?: string; period_type?: string; limit?: number }) =>
    api.get('/sales-rank', { params }),
}

// 筛选条件API
export const filterApi = {
  getFilters: () => api.get('/filters'),
}

// 统计API
export const statsApi = {
  getStats: () => api.get('/stats'),
}

export default api
