import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';

// Layouts
import MainLayout from '@/components/layout/MainLayout';

// Public Pages
import HomePage from '@/pages/home';
import BrandsPage from '@/pages/brands';
import BrandDetailPage from '@/pages/brands/BrandDetail';
import ModelsPage from '@/pages/models';
import ModelDetailPage from '@/pages/models/ModelDetail';
import NewsPage from '@/pages/news';
import ContactPage from '@/pages/contact';

// Admin Pages
import AdminLoginPage from '@/pages/admin/Login';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/Dashboard';
import LeadsManagement from '@/pages/admin/Leads';
import BrandsManagement from '@/pages/admin/Brands';
import ModelsManagement from '@/pages/admin/Models';
import AssetsManagement from '@/pages/admin/Assets';
import NewsManagement from '@/pages/admin/News';
import Settings from '@/pages/admin/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="brands/:id" element={<BrandDetailPage />} />
          <Route path="models" element={<ModelsPage />} />
          <Route path="models/:id" element={<ModelDetailPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="contact" element={<ContactPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="leads" element={<LeadsManagement />} />
          <Route path="brands" element={<BrandsManagement />} />
          <Route path="models" element={<ModelsManagement />} />
          <Route path="assets" element={<AssetsManagement />} />
          <Route path="news" element={<NewsManagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
