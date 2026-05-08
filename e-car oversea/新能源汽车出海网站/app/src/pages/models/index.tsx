import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowRight, Zap, Battery, Users, Gauge } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import LazyImage from '@/components/common/LazyImage';
import ModelCardSkeleton from '@/components/common/ModelCardSkeleton';
import { BRANDS_DATA, MODELS_DATA, CAR_CATEGORIES, POWER_TYPES } from '@/constants';

const ModelsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPowerType, setSelectedPowerType] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [isLoading, setIsLoading] = useState(true);

  // 模拟数据加载
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // 过滤车型
  const filteredModels = useMemo(() => {
    let models = [...MODELS_DATA];

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      models = models.filter(
        model =>
          model.name.toLowerCase().includes(query)
      );
    }

    // 品牌过滤
    if (selectedBrand !== 'all') {
      models = models.filter(m => m.brandId === selectedBrand);
    }

    // 类别过滤
    if (selectedCategory !== 'all') {
      models = models.filter(m => m.category === selectedCategory);
    }

    // 动力类型过滤
    if (selectedPowerType !== 'all') {
      models = models.filter(m => m.powerType === selectedPowerType);
    }

    // 价格过滤
    models = models.filter(
      m => m.priceUsdMin >= priceRange[0] && m.priceUsdMax <= priceRange[1]
    );

    return models;
  }, [searchQuery, selectedBrand, selectedCategory, selectedPowerType, priceRange]);

  // 获取动力类型标签
  const getPowerTypeLabel = (type: string) => {
    const pt = POWER_TYPES.find(p => p.value === type);
    return pt?.label || type;
  };

  // 获取类别标签
  const getCategoryLabel = (cat: string) => {
    const c = CAR_CATEGORIES.find(c => c.value === cat);
    return c?.label || cat;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            车型库
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            精选中国新能源汽车热门车型，覆盖轿车、SUV、MPV等多种类型，
            满足不同海外市场需求
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-gray-500" />
                <h3 className="font-semibold text-gray-900">筛选条件</h3>
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  品牌
                </label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger>
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

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  车型类别
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择类别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类别</SelectItem>
                    {CAR_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Power Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  动力类型
                </label>
                <Select value={selectedPowerType} onValueChange={setSelectedPowerType}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择动力类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    {POWER_TYPES.map(pt => (
                      <SelectItem key={pt.value} value={pt.value}>
                        {pt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  价格区间: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={100000}
                  step={5000}
                  className="mt-2"
                />
              </div>

              {/* Reset Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBrand('all');
                  setSelectedCategory('all');
                  setSelectedPowerType('all');
                  setPriceRange([0, 100000]);
                }}
              >
                重置筛选
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="搜索车型名称..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-6 text-gray-500">
              共 {filteredModels.length} 款车型
            </div>

            {/* Model Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, idx) => (
                  <ModelCardSkeleton key={idx} />
                ))}
              </div>
            ) : filteredModels.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl">
                <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  未找到匹配的车型
                </h3>
                <p className="text-gray-500">
                  请尝试调整搜索条件或筛选条件
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredModels.map((model) => {
                  const brand = BRANDS_DATA.find(b => b.id === model.brandId);
                  return (
                    <Link
                      key={model.id}
                      to={`/models/${model.id}`}
                      className="group"
                    >
                      <Card className="h-full hover:shadow-xl transition-all overflow-hidden">
                        {/* Image */}
                        <div className="aspect-video bg-gray-100 relative">
                          {model.images[0] ? (
                            <LazyImage
                              src={model.images[0]}
                              alt={model.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              placeholderClassName="group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Zap className="w-16 h-16 text-gray-300" />
                            </div>
                          )}
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-blue-600">{brand?.name}</Badge>
                          </div>
                          <div className="absolute top-4 right-4">
                            <Badge variant="secondary">
                              {getPowerTypeLabel(model.powerType)}
                            </Badge>
                          </div>
                        </div>

                        <CardContent className="p-5">
                          {/* Title */}
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {model.name}
                            </h3>
                            <Badge variant="outline">
                              {getCategoryLabel(model.category)}
                            </Badge>
                          </div>

                          {/* Specs */}
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                              <Battery className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                              <span className="text-xs text-gray-500">续航</span>
                              <p className="font-semibold text-sm">{model.rangeKm}km</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                              <Gauge className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                              <span className="text-xs text-gray-500">加速</span>
                              <p className="font-semibold text-sm">{model.accel0100}s</p>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded-lg">
                              <Users className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                              <span className="text-xs text-gray-500">座位</span>
                              <p className="font-semibold text-sm">{model.seats}座</p>
                            </div>
                          </div>

                          {/* Highlights */}
                          <div className="flex flex-wrap gap-1 mb-4">
                            {model.highlights.slice(0, 3).map((highlight, idx) => (
                              <span 
                                key={idx}
                                className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                              >
                                {highlight}
                              </span>
                            ))}
                          </div>

                          {/* Price & CTA */}
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div>
                              <span className="text-2xl font-bold text-blue-600">
                                ${model.priceUsdMin.toLocaleString()}
                              </span>
                              <span className="text-gray-400 text-sm"> 起</span>
                            </div>
                            <Button variant="ghost" size="sm" className="group-hover:text-blue-600">
                              了解详情
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelsPage;
