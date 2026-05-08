// 品牌类型
export interface Brand {
  id: string;
  name: string;
  nameEn: string;
  logo: string;
  description: string;
  foundedYear: number;
  headquarters: string;
  annualSales: number;
  markets: string[];
  website: string;
  story: string;
  technology: string;
  layout: {
    countries: string[];
    factories: { country: string; status: string }[];
  };
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 车型类型
export interface Model {
  id: string;
  brandId: string;
  brand?: Brand;
  name: string;
  category: 'sedan' | 'suv' | 'mpv' | 'sports';
  powerType: 'bev' | 'phev' | 'reev';
  priceMin: number;
  priceMax: number;
  priceUsdMin: number;
  priceUsdMax: number;
  rangeKm: number;
  powerKw: number;
  accel0100: number;
  seats: number;
  images: string[];
  specs: Record<string, string>;
  highlights: string[];
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 线索类型
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country: string;
  identity: 'dealer' | 'enterprise' | 'consumer' | 'other';
  brands: string[];
  message: string;
  quantity?: number;
  status: 'pending' | 'following' | 'converted' | 'invalid';
  notes?: string;
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;
}

// 素材类型
export interface Asset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  type: 'image' | 'video' | 'document';
  tags: string[];
  createdBy?: string;
  createdAt: string;
}

// 新闻类型
export interface News {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  tags: string[];
  source: string;
  publishedAt: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// 用户类型
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'operator' | 'editor';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

// 统计数据类型
export interface DashboardStats {
  todayLeads: number;
  weekLeads: number;
  monthLeads: number;
  conversionRate: number;
  topBrands: { name: string; count: number }[];
  topModels: { name: string; count: number }[];
  leadsTrend: { date: string; count: number }[];
  leadsBySource: { source: string; count: number }[];
  leadsByCountry: { country: string; count: number }[];
}

// 表单数据类型
export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  country: string;
  identity: 'dealer' | 'enterprise' | 'consumer' | 'other';
  brands: string[];
  message: string;
  quantity: string;
}
