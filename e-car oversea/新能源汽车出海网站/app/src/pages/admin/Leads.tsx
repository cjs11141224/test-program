import { useState, useMemo } from 'react';
import { Search, Filter, Download, Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { useLeadStore } from '@/stores';
import { COUNTRIES, IDENTITY_TYPES, LEAD_STATUS } from '@/constants';
import { formatDate } from '@/utils';
import type { Lead } from '@/types';

const LeadsManagement = () => {
  const { leads, updateLead, deleteLead } = useLeadStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editNotes, setEditNotes] = useState('');

  // 过滤线索
  const filteredLeads = useMemo(() => {
    let filtered = [...leads];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        lead =>
          lead.name.toLowerCase().includes(query) ||
          lead.email.toLowerCase().includes(query) ||
          lead.country.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [leads, searchQuery, statusFilter]);

  const handleViewDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailOpen(true);
  };

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setEditNotes(lead.notes || '');
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedLead) {
      updateLead(selectedLead.id, { notes: editNotes });
      setIsEditOpen(false);
    }
  };

  const handleStatusChange = (leadId: string, status: string) => {
    updateLead(leadId, { status: status as any });
  };

  const handleDelete = (leadId: string) => {
    if (confirm('确定要删除这条线索吗？')) {
      deleteLead(leadId);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['姓名', '邮箱', '电话', '国家', '身份', '感兴趣品牌', '咨询内容', '状态', '提交时间'].join(','),
      ...filteredLeads.map(lead => [
        lead.name,
        lead.email,
        lead.phone || '',
        lead.country,
        IDENTITY_TYPES.find(t => t.value === lead.identity)?.label || lead.identity,
        lead.brands.join(';'),
        lead.message.replace(/,/g, '，').replace(/\n/g, ' '),
        LEAD_STATUS.find(s => s.value === lead.status)?.label || lead.status,
        formatDate(lead.createdAt)
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = LEAD_STATUS.find(s => s.value === status);
    if (!statusConfig) return null;
    
    const colorMap: Record<string, string> = {
      yellow: 'bg-yellow-100 text-yellow-700',
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      gray: 'bg-gray-100 text-gray-700'
    };
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colorMap[statusConfig.color]}`}>
        {statusConfig.label}
      </span>
    );
  };

  const getCountryName = (code: string) => {
    return COUNTRIES.find(c => c.code === code)?.name || code;
  };

  const getIdentityLabel = (value: string) => {
    return IDENTITY_TYPES.find(t => t.value === value)?.label || value;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">线索管理</h1>
          <p className="text-gray-500 mt-1">管理客户咨询线索</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          导出Excel
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="搜索姓名、邮箱、国家..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                {LEAD_STATUS.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-gray-500">
        共 {filteredLeads.length} 条线索
      </div>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">客户信息</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">国家</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">身份</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">感兴趣品牌</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">状态</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">提交时间</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      暂无线索数据
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{lead.name}</p>
                          <p className="text-sm text-gray-500">{lead.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getCountryName(lead.country)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getIdentityLabel(lead.identity)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {lead.brands.slice(0, 2).map((brand, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {brand}
                            </Badge>
                          ))}
                          {lead.brands.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{lead.brands.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Select 
                          value={lead.status} 
                          onValueChange={(value) => handleStatusChange(lead.id, value)}
                        >
                          <SelectTrigger className="w-28 h-8">
                            {getStatusBadge(lead.status)}
                          </SelectTrigger>
                          <SelectContent>
                            {LEAD_STATUS.map(status => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetail(lead)}>
                              <Eye className="w-4 h-4 mr-2" />
                              查看详情
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(lead)}>
                              <Edit className="w-4 h-4 mr-2" />
                              编辑备注
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(lead.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>线索详情</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">姓名</label>
                  <p className="font-medium">{selectedLead.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">邮箱</label>
                  <p className="font-medium">{selectedLead.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">电话</label>
                  <p className="font-medium">{selectedLead.phone || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">国家</label>
                  <p className="font-medium">{getCountryName(selectedLead.country)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">身份</label>
                  <p className="font-medium">{getIdentityLabel(selectedLead.identity)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">预计采购数量</label>
                  <p className="font-medium">{selectedLead.quantity || '-'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">感兴趣品牌</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedLead.brands.map((brand, idx) => (
                    <Badge key={idx} variant="secondary">{brand}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">咨询内容</label>
                <p className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                  {selectedLead.message}
                </p>
              </div>
              {selectedLead.notes && (
                <div>
                  <label className="text-sm text-gray-500">内部备注</label>
                  <p className="mt-1 p-3 bg-yellow-50 rounded-lg text-sm">
                    {selectedLead.notes}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm text-gray-500">提交时间</label>
                <p className="font-medium">{formatDate(selectedLead.createdAt, 'long')}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑备注</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">内部备注</label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="添加内部备注..."
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveEdit}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadsManagement;
