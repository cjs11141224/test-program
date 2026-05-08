export interface Brand {
  id: number
  name: string
  name_en?: string
  logo_url?: string
  country?: string
  vehicle_count: number
  is_domestic: boolean
  is_new_energy: boolean
}

export interface Vehicle {
  id: number
  name: string
  full_name?: string
  brand_name: string
  level?: string
  energy_type?: string
  min_price?: number
  max_price?: number
  main_image?: string
  score?: number
  is_on_sale: boolean
}

export interface VehicleDetail {
  id: number
  name: string
  full_name?: string
  brand_id: number
  brand_name: string
  level?: string
  energy_type?: string
  body_type?: string
  min_price?: number
  max_price?: number
  min_guide_price?: number
  max_guide_price?: number
  main_image?: string
  images: string[]
  length?: number
  width?: number
  height?: number
  wheelbase?: number
  motor_power?: number
  motor_torque?: number
  engine_displacement?: number
  engine_power?: number
  cltc_range?: number
  battery_capacity?: number
  acceleration?: number
  max_speed?: number
  score?: number
  review_count: number
  is_on_sale: boolean
  launch_date?: string
  specs: Record<string, any>
}

export interface News {
  id: number
  title: string
  subtitle?: string
  summary?: string
  category?: string
  cover_image?: string
  author?: string
  source_name?: string
  view_count: number
  like_count: number
  comment_count: number
  publish_time?: string
}

export interface NewsDetail {
  id: number
  title: string
  subtitle?: string
  summary?: string
  content?: string
  category?: string
  tags: string[]
  cover_image?: string
  images: string[]
  author?: string
  source_name?: string
  view_count: number
  like_count: number
  comment_count: number
  share_count: number
  publish_time?: string
}

export interface Price {
  id: number
  vehicle_id: number
  vehicle_name: string
  price_type: string
  price: number
  price_change?: number
  city?: string
  province?: string
  record_date: string
}

export interface SalesRank {
  id: number
  vehicle_id: number
  vehicle_name: string
  sales_volume: number
  period_type: string
  period: string
  rank: number
  rank_change?: number
  market_share?: number
}

export interface FilterOptions {
  brands: { id: number; name: string; logo?: string }[]
  levels: string[]
  energy_types: string[]
  price_ranges: { label: string; min: number; max?: number }[]
}

export interface Stats {
  brand_count: number
  vehicle_count: number
  news_count: number
  on_sale_count: number
  new_energy_count: number
  update_time: string
}

export interface PaginatedResponse<T> {
  total: number
  page: number
  page_size: number
  data: T[]
}
