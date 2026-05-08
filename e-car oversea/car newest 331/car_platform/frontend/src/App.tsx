import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Vehicles from './pages/Vehicles'
import VehicleDetail from './pages/VehicleDetail'
import News from './pages/News'
import NewsDetail from './pages/NewsDetail'
import Brands from './pages/Brands'
import SalesRank from './pages/SalesRank'
import PriceMonitor from './pages/PriceMonitor'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/vehicles/:id" element={<VehicleDetail />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/brands" element={<Brands />} />
        <Route path="/sales-rank" element={<SalesRank />} />
        <Route path="/price-monitor" element={<PriceMonitor />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}

export default App
