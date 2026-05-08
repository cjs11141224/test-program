import axios from 'axios';
import type { Brand, Model, Lead, LeadFormData, User, DashboardStats } from '@/types';

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 错误处理
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// 品牌API
export const brandApi = {
  getAll: async (): Promise<Brand[]> => {
    const response = await api.get('/brands');
    return response.data;
  },
  
  getById: async (id: string): Promise<Brand> => {
    const response = await api.get(`/brands/${id}`);
    return response.data;
  },
  
  create: async (data: Partial<Brand>): Promise<Brand> => {
    const response = await api.post('/brands', data);
    return response.data;
  },
  
  update: async (id: string, data: Partial<Brand>): Promise<Brand> => {
    const response = await api.put(`/brands/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/brands/${id}`);
  }
};

// 车型API
export const modelApi = {
  getAll: async (filters?: Record<string, string>): Promise<Model[]> => {
    const response = await api.get('/models', { params: filters });
    return response.data;
  },
  
  getById: async (id: string): Promise<Model> => {
    const response = await api.get(`/models/${id}`);
    return response.data;
  },
  
  getByBrand: async (brandId: string): Promise<Model[]> => {
    const response = await api.get('/models', { params: { brandId } });
    return response.data;
  },
  
  create: async (data: Partial<Model>): Promise<Model> => {
    const response = await api.post('/models', data);
    return response.data;
  },
  
  update: async (id: string, data: Partial<Model>): Promise<Model> => {
    const response = await api.put(`/models/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/models/${id}`);
  }
};

// 线索API
export const leadApi = {
  getAll: async (): Promise<Lead[]> => {
    const response = await api.get('/leads');
    return response.data;
  },
  
  getById: async (id: string): Promise<Lead> => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },
  
  create: async (data: LeadFormData): Promise<Lead> => {
    const response = await api.post('/leads', data);
    return response.data;
  },
  
  update: async (id: string, data: Partial<Lead>): Promise<Lead> => {
    const response = await api.put(`/leads/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/leads/${id}`);
  },
  
  export: async (): Promise<Blob> => {
    const response = await api.get('/leads/export', {
      responseType: 'blob'
    });
    return response.data;
  }
};

// 认证API
export const authApi = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
  
  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  
  refreshToken: async (): Promise<{ token: string }> => {
    const response = await api.post('/auth/refresh');
    return response.data;
  }
};

// 素材API
export const assetApi = {
  getAll: async (): Promise<any[]> => {
    const response = await api.get('/assets');
    return response.data;
  },
  
  upload: async (file: File, type: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await api.post('/assets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/assets/${id}`);
  }
};

// 仪表盘API
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  }
};

// 新闻API
export const newsApi = {
  getAll: async (): Promise<any[]> => {
    const response = await api.get('/news');
    return response.data;
  },
  
  getById: async (id: string): Promise<any> => {
    const response = await api.get(`/news/${id}`);
    return response.data;
  },
  
  create: async (data: any): Promise<any> => {
    const response = await api.post('/news', data);
    return response.data;
  },
  
  update: async (id: string, data: any): Promise<any> => {
    const response = await api.put(`/news/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/news/${id}`);
  }
};

export default api;
