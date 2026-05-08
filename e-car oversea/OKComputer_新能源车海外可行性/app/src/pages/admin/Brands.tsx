import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Eye, Globe, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { BRANDS_DATA } from '@/constants';
import { formatNumber } from '@/utils';

const BrandsManagement = () => {
  const [brands, setBrands] = useState(BRANDS_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<typeof BRANDS_DATA[0] | null>(null);

  // 过滤品牌
  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    brand.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    setEditingBrand(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (brand: typeof BRANDS_DATA[0]) => {
    setEditingBrand(brand);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个品牌吗？')) {
      setBrands(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const brandData = {
      id: editingBrand?.id || Date.now().toString(),
      name: formData.get('name') as string,
      nameEn: formData.get('nameEn') as string,
      logo: formData.get('logo') as string,
      description: formData.get('description') as string,
      foundedYear: parseInt(formData.get('foundedYear') as string),
      headquarters: formData.get('headquarters') as string,
      annualSales: parseInt(formData.get('annualSales') as string),
      markets: (formData.get('markets') as string).split(',').map(m => m.trim()),
      website: formData.get('website') as string,
      story: formData.get('story') as string,
      technology: formData.get('technology') as string,
      layout: { countries: [], factories: [] },
      sortOrder: editingBrand?.sortOrder || brands.length + 1,
      isActive: true
    };

    if (editingBrand) {
      setBrands(prev => prev.map(b => b.id === editingBrand.id ? brandData as any : b));
    } else {
      setBrands(prev => [...prev, brandData as any]);
    }

    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">品牌管理</h1>
          <p className="text-gray-500 mt-1">管理网站展示的品牌信息</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          添加品牌
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="搜索品牌名称..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBrands.map((brand) => (
          <Card key={brand.id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Logo */}
              <div className="aspect-[4/3] bg-white p-8 flex items-center justify-center border-b">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{brand.name}</h3>
                    <p className="text-sm text-gray-500">{brand.nameEn}</p>
                  </div>
                  <div className="flex gap-1">
                    <Link to={`/brands/${brand.id}`} target="_blank">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(brand)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(brand.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {brand.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{formatNumber(brand.annualSales)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <span>{brand.markets.length}个市场</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {brand.markets.slice(0, 3).map((market, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {market}
                    </Badge>
                  ))}
                  {brand.markets.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{brand.markets.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBrand ? '编辑品牌' : '添加品牌'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">品牌名称（中文）</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingBrand?.name}
                  required
                />
              </div>
              <div>
                <Label htmlFor="nameEn">品牌名称（英文）</Label>
                <Input
                  id="nameEn"
                  name="nameEn"
                  defaultValue={editingBrand?.nameEn}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                name="logo"
                defaultValue={editingBrand?.logo}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">品牌简介</Label>
              <Input
                id="description"
                name="description"
                defaultValue={editingBrand?.description}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="foundedYear">成立年份</Label>
                <Input
                  id="foundedYear"
                  name="foundedYear"
                  type="number"
                  defaultValue={editingBrand?.foundedYear}
                  required
                />
              </div>
              <div>
                <Label htmlFor="annualSales">年销量</Label>
                <Input
                  id="annualSales"
                  name="annualSales"
                  type="number"
                  defaultValue={editingBrand?.annualSales}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="headquarters">总部位置</Label>
              <Input
                id="headquarters"
                name="headquarters"
                defaultValue={editingBrand?.headquarters}
                required
              />
            </div>

            <div>
              <Label htmlFor="markets">主要市场（用逗号分隔）</Label>
              <Input
                id="markets"
                name="markets"
                defaultValue={editingBrand?.markets.join(', ')}
                placeholder="例如: 中国, 欧洲, 东南亚"
                required
              />
            </div>

            <div>
              <Label htmlFor="website">官网链接</Label>
              <Input
                id="website"
                name="website"
                type="url"
                defaultValue={editingBrand?.website}
                required
              />
            </div>

            <div>
              <Label htmlFor="story">品牌故事</Label>
              <textarea
                id="story"
                name="story"
                defaultValue={editingBrand?.story}
                rows={3}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <Label htmlFor="technology">核心技术</Label>
              <textarea
                id="technology"
                name="technology"
                defaultValue={editingBrand?.technology}
                rows={2}
                className="w-full px-3 py-2 border rounded-md"
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

export default BrandsManagement;
