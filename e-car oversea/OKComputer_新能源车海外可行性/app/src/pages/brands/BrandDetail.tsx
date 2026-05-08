import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Globe, 
  Calendar, 
  MapPin, 
  TrendingUp,
  ExternalLink,
  Factory,
  Zap,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BRANDS_DATA, MODELS_DATA } from '@/constants';
import { formatNumber } from '@/utils';

const BrandDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const brand = BRANDS_DATA.find(b => b.id === id);
  const brandModels = MODELS_DATA.filter(m => m.brandId === id);

  if (!brand) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">品牌未找到</h1>
          <p className="text-gray-600 mb-6">抱歉，您访问的品牌不存在</p>
          <Link to="/brands">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回品牌列表
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-blue-200 mb-6">
            <Link to="/" className="hover:text-white transition-colors">首页</Link>
            <ArrowRight className="w-4 h-4 mx-2" />
            <Link to="/brands" className="hover:text-white transition-colors">品牌</Link>
            <ArrowRight className="w-4 h-4 mx-2" />
            <span className="text-white">{brand.name}</span>
          </div>

          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Logo */}
            <div className="w-32 h-32 lg:w-40 lg:h-40 bg-white rounded-2xl p-6 flex items-center justify-center flex-shrink-0">
              <img
                src={brand.logo}
                alt={brand.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h1 className="text-3xl lg:text-4xl font-bold">{brand.name}</h1>
                <span className="text-xl text-blue-200">{brand.nameEn}</span>
              </div>

              <p className="text-lg text-blue-100 mb-6 max-w-3xl">
                {brand.description}
              </p>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
                  <Calendar className="w-5 h-5" />
                  <span>{brand.foundedYear}年成立</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
                  <MapPin className="w-5 h-5" />
                  <span>{brand.headquarters}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>年销量 {formatNumber(brand.annualSales)}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
                  <Globe className="w-5 h-5" />
                  <span>{brand.markets.length}个市场</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/contact">
                  <Button className="bg-white text-blue-900 hover:bg-gray-100">
                    咨询该品牌
                  </Button>
                </Link>
                <a 
                  href={brand.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="border-white text-white hover:bg-white/10">
                    访问官网
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="models" className="space-y-8">
          <TabsList className="bg-white border">
            <TabsTrigger value="models">代表车型</TabsTrigger>
            <TabsTrigger value="story">品牌故事</TabsTrigger>
            <TabsTrigger value="technology">核心技术</TabsTrigger>
            <TabsTrigger value="layout">全球布局</TabsTrigger>
          </TabsList>

          {/* Models Tab */}
          <TabsContent value="models">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brandModels.length > 0 ? (
                brandModels.map((model) => (
                  <Card key={model.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gray-100 relative">
                      {model.images[0] ? (
                        <img
                          src={model.images[0]}
                          alt={model.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Zap className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {model.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span>{model.rangeKm}km续航</span>
                        <span>{model.accel0100}s加速</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold text-blue-600">
                            ${model.priceUsdMin.toLocaleString()}
                          </span>
                          <span className="text-gray-400 text-sm"> 起</span>
                        </div>
                        <Link to={`/models/${model.id}`}>
                          <Button variant="ghost" size="sm">
                            详情
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">暂无车型数据</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Story Tab */}
          <TabsContent value="story">
            <Card>
              <CardContent className="p-8">
                <div className="max-w-3xl">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    品牌故事
                  </h2>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {brand.story}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technology Tab */}
          <TabsContent value="technology">
            <Card>
              <CardContent className="p-8">
                <div className="max-w-3xl">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    核心技术
                  </h2>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      {brand.technology}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Markets */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Globe className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-900">主要市场</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {brand.markets.map((market, idx) => (
                      <Badge key={idx} variant="secondary" className="text-sm px-3 py-1">
                        {market}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Factories */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Factory className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-900">海外工厂</h3>
                  </div>
                  {brand.layout.factories.length > 0 ? (
                    <div className="space-y-3">
                      {brand.layout.factories.map((factory, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <span className="font-medium">{factory.country}</span>
                          <Badge 
                            variant={factory.status === '投产' ? 'default' : 'secondary'}
                          >
                            {factory.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">暂无海外工厂</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 lg:p-12 text-center text-white">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">
            对 {brand.name} 感兴趣？
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            无论您是海外经销商、企业采购方还是个人消费者，我们都能为您提供专业的咨询服务
          </p>
          <Link to="/contact">
            <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8">
              立即咨询
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BrandDetailPage;
