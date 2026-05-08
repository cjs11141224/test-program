import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  Car,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeadStore } from '@/stores';
import { BRANDS_DATA, MODELS_DATA } from '@/constants';
import { formatDate } from '@/utils';

const AdminDashboard = () => {
  const leads = useLeadStore(state => state.leads);
  const [stats, setStats] = useState({
    todayLeads: 0,
    weekLeads: 0,
    monthLeads: 0,
    totalLeads: 0,
    pendingLeads: 0,
    convertedLeads: 0
  });

  useEffect(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const todayLeads = leads.filter(l => new Date(l.createdAt) >= today).length;
    const weekLeads = leads.filter(l => new Date(l.createdAt) >= weekAgo).length;
    const monthLeads = leads.filter(l => new Date(l.createdAt) >= monthAgo).length;
    const pendingLeads = leads.filter(l => l.status === 'pending').length;
    const convertedLeads = leads.filter(l => l.status === 'converted').length;

    setStats({
      todayLeads,
      weekLeads,
      monthLeads,
      totalLeads: leads.length,
      pendingLeads,
      convertedLeads
    });
  }, [leads]);

  const statCards = [
    {
      title: '今日线索',
      value: stats.todayLeads,
      icon: Users,
      change: '+12%',
      trend: 'up',
      color: 'blue'
    },
    {
      title: '本周线索',
      value: stats.weekLeads,
      icon: Calendar,
      change: '+8%',
      trend: 'up',
      color: 'green'
    },
    {
      title: '本月线索',
      value: stats.monthLeads,
      icon: TrendingUp,
      change: '+15%',
      trend: 'up',
      color: 'purple'
    },
    {
      title: '待处理线索',
      value: stats.pendingLeads,
      icon: Users,
      change: '需跟进',
      trend: 'neutral',
      color: 'orange'
    }
  ];

  const quickLinks = [
    { title: '品牌管理', count: BRANDS_DATA.length, icon: Car, path: '/admin/brands', color: 'blue' },
    { title: '车型管理', count: MODELS_DATA.length, icon: Briefcase, path: '/admin/models', color: 'green' },
    { title: '线索管理', count: stats.totalLeads, icon: Users, path: '/admin/leads', color: 'purple' },
  ];

  // 获取最新线索
  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      pending: { label: '待处理', color: 'bg-yellow-100 text-yellow-700' },
      following: { label: '跟进中', color: 'bg-blue-100 text-blue-700' },
      converted: { label: '已转化', color: 'bg-green-100 text-green-700' },
      invalid: { label: '无效', color: 'bg-gray-100 text-gray-700' }
    };
    const { label, color } = statusMap[status] || { label: status, color: 'bg-gray-100' };
    return <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>{label}</span>;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
        <p className="text-gray-500 mt-1">欢迎回来，查看今日数据概览</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {card.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${card.color}-100`}>
                  <card.icon className={`w-6 h-6 text-${card.color}-600`} />
                </div>
              </div>
              <div className="flex items-center mt-4">
                {card.trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                ) : card.trend === 'down' ? (
                  <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                ) : null}
                <span className={`text-sm ${
                  card.trend === 'up' ? 'text-green-600' : 
                  card.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {card.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">快速入口</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickLinks.map((link, index) => (
            <Link key={index} to={link.path}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">{link.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {link.count}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${link.color}-100`}>
                      <link.icon className={`w-6 h-6 text-${link.color}-600`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Leads */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">最新线索</h2>
          <Link 
            to="/admin/leads"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            查看全部
          </Link>
        </div>

        <Card>
          <CardContent className="p-0">
            {recentLeads.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                暂无线索数据
              </div>
            ) : (
              <div className="divide-y">
                {recentLeads.map((lead) => (
                  <div 
                    key={lead.id}
                    className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {lead.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{lead.name}</p>
                        <p className="text-sm text-gray-500">{lead.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {lead.country}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(lead.createdAt)}
                        </p>
                      </div>
                      {getStatusBadge(lead.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">系统信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500">品牌数量</p>
              <p className="text-xl font-semibold">{BRANDS_DATA.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">车型数量</p>
              <p className="text-xl font-semibold">{MODELS_DATA.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">线索转化率</p>
              <p className="text-xl font-semibold">
                {stats.totalLeads > 0 
                  ? Math.round((stats.convertedLeads / stats.totalLeads) * 100) 
                  : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
