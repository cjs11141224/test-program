import { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Label } from '@/components/ui/label';
import { BRANDS_DATA, MODELS_DATA, CAR_CATEGORIES, POWER_TYPES } from '@/constants';
import { Link } from 'react-router-dom';

const ModelsManagement = () => {
  const [models, setModels] = useState(MODELS_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<typeof MODELS_DATA[0] | null>(null);

  // 过滤车型
  const filteredModels = useMemo(() => {
    let filtered = [...models];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => m.name.toLowerCase().includes(query));
    }

    if (brandFilter !== 'all') {
      filtered = filtered.filter(m => m.brandId === brandFilter);
    }

    return filtered;
  }, [models, searchQuery, brandFilter]);

  const handleAdd = () => {
    setEditingModel(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (model: typeof MODELS_DATA[0]) => {
    setEditingModel(model);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个车型吗？')) {
      setModels(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const modelData = {
      id: editingModel?.id || Date.now().toString(),
      brandId: formData.get('brandId') as string,
      name: formData.get('name') as string,
      category: formData.get('category') as any,
      powerType: formData.get('powerType') as any,
      priceMin: parseFloat(formData.get('priceMin') as string),
      priceMax: parseFloat(formData.get('priceMax') as string),
      priceUsdMin: parseFloat(formData.get('priceUsdMin') as string),
      priceUsdMax: parseFloat(formData.get('priceUsdMax') as string),
      rangeKm: parseInt(formData.get('rangeKm') as string),
      powerKw: parseInt(formData.get('powerKw') as string),
      accel0100: parseFloat(formData.get('accel0100') as string),
      seats: parseInt(formData.get('seats') as string),
      images: [],
      specs: {},
      highlights: (formData.get('highlights') as string).split(',').map(h => h.trim()),
      sortOrder: editingModel?.sortOrder || models.length + 1,
      isActive: true
    };

    if (editingModel) {
      setModels(prev => prev.map(m => m.id === editingModel.id ? modelData as any : m));
    } else {
      setModels(prev => [...prev, modelData as any]);
    }

    setIsDialogOpen(false);
  };

  const getBrandName = (brandId: string) => {
    return BRANDS_DATA.find(b => b.id === brandId)?.name || brandId;
  };

  const getCategoryLabel = (value: string) => {
    return CAR_CATEGORIES.find(c => c.value === value)?.label || value;
  };

  const getPowerTypeLabel = (value: string) => {
    return POWER_TYPES.find(p => p.value === value)?.label || value;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">车型管理</h1>
          <p className="text-gray-500 mt-1">管理网站展示的车型信息</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          添加车型
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="搜索车型名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="选择品牌" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部品牌</SelectItem>
            {BRANDS_DATA.map(brand => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Models Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">车型</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">品牌</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">类别</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">动力</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">价格</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">续航</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredModels.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      暂无车型数据
                    </td>
                  </tr>
                ) : (
                  filteredModels.map((model) => (
                    <tr key={model.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{model.name}</p>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getBrandName(model.brandId)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">
                          {getCategoryLabel(model.category)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">
                          {getPowerTypeLabel(model.powerType)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        ${model.priceUsdMin.toLocaleString()} - ${model.priceUsdMax.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {model.rangeKm}km
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Link to={`/models/${model.id}`} target="_blank">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(model)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDelete(model.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingModel ? '编辑车型' : '添加车型'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="brandId">所属品牌</Label>
              <Select name="brandId" defaultValue={editingModel?.brandId || BRANDS_DATA[0]?.id}>
                <SelectTrigger>
                  <SelectValue placeholder="选择品牌" />
                </SelectTrigger>
                <SelectContent>
                  {BRANDS_DATA.map(brand => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="name">车型名称</Label>
              <Input
                id="name"
                name="name"
                defaultValue={editingModel?.name}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">车型类别</Label>
                <Select name="category" defaultValue={editingModel?.category || 'sedan'}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择类别" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAR_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="powerType">动力类型</Label>
                <Select name="powerType" defaultValue={editingModel?.powerType || 'bev'}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择动力类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {POWER_TYPES.map(pt => (
                      <SelectItem key={pt.value} value={pt.value}>
                        {pt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priceMin">最低指导价（万元）</Label>
                <Input
                  id="priceMin"
                  name="priceMin"
                  type="number"
                  step="0.01"
                  defaultValue={editingModel?.priceMin}
                  required
                />
              </div>
              <div>
                <Label htmlFor="priceMax">最高指导价（万元）</Label>
                <Input
                  id="priceMax"
                  name="priceMax"
                  type="number"
                  step="0.01"
                  defaultValue={editingModel?.priceMax}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priceUsdMin">美元最低价</Label>
                <Input
                  id="priceUsdMin"
                  name="priceUsdMin"
                  type="number"
                  defaultValue={editingModel?.priceUsdMin}
                  required
                />
              </div>
              <div>
                <Label htmlFor="priceUsdMax">美元最高价</Label>
                <Input
                  id="priceUsdMax"
                  name="priceUsdMax"
                  type="number"
                  defaultValue={editingModel?.priceUsdMax}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="rangeKm">续航里程（km）</Label>
                <Input
                  id="rangeKm"
                  name="rangeKm"
                  type="number"
                  defaultValue={editingModel?.rangeKm}
                  required
                />
              </div>
              <div>
                <Label htmlFor="powerKw">最大功率（kW）</Label>
                <Input
                  id="powerKw"
                  name="powerKw"
                  type="number"
                  defaultValue={editingModel?.powerKw}
                  required
                />
              </div>
              <div>
                <Label htmlFor="seats">座位数</Label>
                <Input
                  id="seats"
                  name="seats"
                  type="number"
                  defaultValue={editingModel?.seats}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="accel0100">百公里加速（秒）</Label>
              <Input
                id="accel0100"
                name="accel0100"
                type="number"
                step="0.1"
                defaultValue={editingModel?.accel0100}
                required
              />
            </div>

            <div>
              <Label htmlFor="highlights">配置亮点（用逗号分隔）</Label>
              <Input
                id="highlights"
                name="highlights"
                defaultValue={editingModel?.highlights.join(', ')}
                placeholder="例如: 智能驾驶, 超长续航, 快充技术"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit">
                保存
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModelsManagement;
