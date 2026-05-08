import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowRight, Globe, Calendar } from 'lucide-react';
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
import LazyImage from '@/components/common/LazyImage';
import BrandCardSkeleton from '@/components/common/BrandCardSkeleton';
import { BRANDS_DATA } from '@/constants';
import { formatNumber } from '@/utils';

const BrandsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [isLoading, setIsLoading] = useState(true);

  // 模拟数据加载
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // 获取所有市场
  const allMarkets = useMemo(() => {
    const markets = new Set<string>();
    BRANDS_DATA.forEach(brand => {
      brand.markets.forEach(market => markets.add(market));
    });
    return Array.from(markets).sort();
  }, []);

  // 过滤和排序品牌
  const filteredBrands = useMemo(() => {
    let brands = [...BRANDS_DATA];

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      brands = brands.filter(
        brand =>
          brand.name.toLowerCase().includes(query) ||
          brand.nameEn.toLowerCase().includes(query) ||
          brand.description.toLowerCase().includes(query)
      );
    }

    // 市场过滤
    if (selectedMarket !== 'all') {
      brands = brands.filter(brand =>
        brand.markets.includes(selectedMarket)
      );
    }

    // 排序
    switch (sortBy) {
      case 'sales-desc':
        brands.sort((a, b) => b.annualSales - a.annualSales);
        break;
      case 'sales-asc':
        brands.sort((a, b) => a.annualSales - b.annualSales);
        break;
      case 'name':
        brands.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        brands.sort((a, b) => a.sortOrder - b.sortOrder);
    }

    return brands;
  }, [searchQuery, selectedMarket, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            品牌展示
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            汇聚中国新能源汽车领军品牌，比亚迪、蔚来、小鹏、理想等知名品牌，
            为全球客户提供优质的新能源汽车产品和服务
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="搜索品牌名称..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Market Filter */}
            <Select value={selectedMarket} onValueChange={setSelectedMarket}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="选择市场" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部市场</SelectItem>
                {allMarkets.map(market => (
                  <SelectItem key={market} value={market}>
                    {market}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">默认排序</SelectItem>
                <SelectItem value="sales-desc">销量从高到低</SelectItem>
                <SelectItem value="sales-asc">销量从低到高</SelectItem>
                <SelectItem value="name">按名称排序</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Brand Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, idx) => (
              <BrandCardSkeleton key={idx} />
            ))}
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              未找到匹配的品牌
            </h3>
            <p className="text-gray-500">
              请尝试调整搜索条件或筛选条件
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBrands.map((brand) => (
              <Link
                key={brand.id}
                to={`/brands/${brand.id}`}
                className="group"
              >
                <Card className="h-full hover:shadow-xl transition-all border-0 shadow-sm overflow-hidden">
                  {/* Logo Area */}
                  <div className="aspect-[4/3] bg-white p-8 flex items-center justify-center border-b">
                    <LazyImage
                      src={brand.logo}
                      alt={brand.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      placeholderClassName="group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <CardContent className="p-5">
                    {/* Title */}
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {brand.name}
                      </h3>
                      <p className="text-sm text-gray-500">{brand.nameEn}</p>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {brand.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{brand.foundedYear}年成立</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        <span>{brand.markets.length}个市场</span>
                      </div>
                    </div>

                    {/* Markets */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {brand.markets.slice(0, 4).map((market, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {market}
                        </Badge>
                      ))}
                      {brand.markets.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{brand.markets.length - 4}
                        </Badge>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-sm text-gray-500">
                        年销量 {formatNumber(brand.annualSales)}
                      </span>
                      <Button variant="ghost" size="sm" className="group-hover:text-blue-600">
                        了解详情
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Results Count */}
        <div className="mt-8 text-center text-gray-500">
          共 {filteredBrands.length} 个品牌
        </div>
      </div>
    </div>
  );
};

export default BrandsPage;
