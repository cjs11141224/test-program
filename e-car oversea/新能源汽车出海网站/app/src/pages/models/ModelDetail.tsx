import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Battery, 
  Zap, 
  Users, 
  Gauge,
  Check,
  Car
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BRANDS_DATA, MODELS_DATA, POWER_TYPES, CAR_CATEGORIES } from '@/constants';

const ModelDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const model = MODELS_DATA.find(m => m.id === id);
  const brand = model ? BRANDS_DATA.find(b => b.id === model.brandId) : null;
  const relatedModels = model 
    ? MODELS_DATA.filter(m => m.brandId === model.brandId && m.id !== model.id).slice(0, 3)
    : [];

  if (!model || !brand) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">车型未找到</h1>
          <p className="text-gray-600 mb-6">抱歉，您访问的车型不存在</p>
          <Link to="/models">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回车型列表
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const powerTypeLabel = POWER_TYPES.find(p => p.value === model.powerType)?.label || model.powerType;
  const categoryLabel = CAR_CATEGORIES.find(c => c.value === model.category)?.label || model.category;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-blue-600 transition-colors">首页</Link>
            <ArrowRight className="w-4 h-4 mx-2" />
            <Link to="/models" className="hover:text-blue-600 transition-colors">车型</Link>
            <ArrowRight className="w-4 h-4 mx-2" />
            <span className="text-gray-900">{model.name}</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Image */}
            <div className="lg:w-1/2">
              <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden">
                {model.images[0] ? (
                  <img
                    src={model.images[0]}
                    alt={model.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car className="w-32 h-32 text-gray-300" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="lg:w-1/2">
              {/* Brand */}
              <Link 
                to={`/brands/${brand.id}`}
                className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
              >
                <img 
                  src={brand.logo} 
                  alt={brand.name}
                  className="w-8 h-8 object-contain"
                />
                <span className="text-gray-600">{brand.name}</span>
              </Link>

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {model.name}
              </h1>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary">{categoryLabel}</Badge>
                <Badge variant="secondary">{powerTypeLabel}</Badge>
                <Badge variant="secondary">{model.seats}座</Badge>
              </div>

              {/* Price */}
              <div className="mb-8">
                <span className="text-4xl font-bold text-blue-600">
                  ${model.priceUsdMin.toLocaleString()}
                </span>
                <span className="text-gray-400 text-lg"> - ${model.priceUsdMax.toLocaleString()}</span>
              </div>

              {/* Quick Specs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <Battery className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <span className="text-sm text-gray-500">续航里程</span>
                  <p className="text-xl font-bold">{model.rangeKm}km</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <Zap className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <span className="text-sm text-gray-500">最大功率</span>
                  <p className="text-xl font-bold">{model.powerKw}kW</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <Gauge className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <span className="text-sm text-gray-500">百公里加速</span>
                  <p className="text-xl font-bold">{model.accel0100}s</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <span className="text-sm text-gray-500">座位数</span>
                  <p className="text-xl font-bold">{model.seats}座</p>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-wrap gap-3">
                <Link to="/contact">
                  <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8">
                    咨询该车型
                  </Button>
                </Link>
                <Link to={`/brands/${brand.id}`}>
                  <Button variant="outline">
                    查看品牌
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="specs" className="space-y-8">
          <TabsList className="bg-white border">
            <TabsTrigger value="specs">详细参数</TabsTrigger>
            <TabsTrigger value="highlights">配置亮点</TabsTrigger>
          </TabsList>

          {/* Specs Tab */}
          <TabsContent value="specs">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  详细参数
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(model.specs).map(([key, value]) => (
                    <div 
                      key={key}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <span className="text-gray-600">{key}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Highlights Tab */}
          <TabsContent value="highlights">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  配置亮点
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {model.highlights.map((highlight, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg"
                    >
                      <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Models */}
      {relatedModels.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            同品牌其他车型
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedModels.map((relatedModel) => (
              <Link
                key={relatedModel.id}
                to={`/models/${relatedModel.id}`}
                className="group"
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-100 relative">
                    {relatedModel.images[0] ? (
                      <img
                        src={relatedModel.images[0]}
                        alt={relatedModel.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {relatedModel.name}
                    </h3>
                    <p className="text-blue-600 font-semibold mt-1">
                      ${relatedModel.priceUsdMin.toLocaleString()} 起
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 lg:p-12 text-center text-white">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">
            对 {model.name} 感兴趣？
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

export default ModelDetailPage;
