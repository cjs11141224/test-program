import { create } from 'zustand';
import type { Brand, Model, Lead, User, DashboardStats } from '@/types';

// 品牌状态
interface BrandState {
  brands: Brand[];
  currentBrand: Brand | null;
  setBrands: (brands: Brand[]) => void;
  setCurrentBrand: (brand: Brand | null) => void;
}

export const useBrandStore = create<BrandState>((set) => ({
  brands: [],
  currentBrand: null,
  setBrands: (brands) => set({ brands }),
  setCurrentBrand: (brand) => set({ currentBrand: brand })
}));

// 车型状态
interface ModelState {
  models: Model[];
  currentModel: Model | null;
  filteredModels: Model[];
  filters: {
    brandId?: string;
    category?: string;
    powerType?: string;
    priceRange?: [number, number];
  };
  setModels: (models: Model[]) => void;
  setCurrentModel: (model: Model | null) => void;
  setFilters: (filters: Partial<ModelState['filters']>) => void;
  filterModels: () => void;
}

export const useModelStore = create<ModelState>((set, get) => ({
  models: [],
  currentModel: null,
  filteredModels: [],
  filters: {},
  setModels: (models) => set({ models, filteredModels: models }),
  setCurrentModel: (model) => set({ currentModel: model }),
  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
    get().filterModels();
  },
  filterModels: () => {
    const { models, filters } = get();
    let filtered = [...models];
    
    if (filters.brandId) {
      filtered = filtered.filter(m => m.brandId === filters.brandId);
    }
    if (filters.category) {
      filtered = filtered.filter(m => m.category === filters.category);
    }
    if (filters.powerType) {
      filtered = filtered.filter(m => m.powerType === filters.powerType);
    }
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      filtered = filtered.filter(m => m.priceUsdMin >= min && m.priceUsdMax <= max);
    }
    
    set({ filteredModels: filtered });
  }
}));

// 线索状态
interface LeadState {
  leads: Lead[];
  currentLead: Lead | null;
  setLeads: (leads: Lead[]) => void;
  addLead: (lead: Lead) => void;
  updateLead: (id: string, data: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  setCurrentLead: (lead: Lead | null) => void;
}

export const useLeadStore = create<LeadState>((set, get) => ({
  leads: [],
  currentLead: null,
  setLeads: (leads) => set({ leads }),
  addLead: (lead) => set({ leads: [lead, ...get().leads] }),
  updateLead: (id, data) => {
    const leads = get().leads.map(l => l.id === id ? { ...l, ...data } : l);
    set({ leads });
  },
  deleteLead: (id) => {
    const leads = get().leads.filter(l => l.id !== id);
    set({ leads });
  },
  setCurrentLead: (lead) => set({ currentLead: lead })
}));

// 用户状态
interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false })
}));

// 仪表盘状态
interface DashboardState {
  stats: DashboardStats | null;
  setStats: (stats: DashboardStats) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  setStats: (stats) => set({ stats })
}));

// UI状态
interface UIState {
  isLoading: boolean;
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  setLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isLoading: false,
  sidebarOpen: true,
  theme: 'light',
  setLoading: (loading) => set({ isLoading: loading }),
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  setTheme: (theme) => set({ theme })
}));
