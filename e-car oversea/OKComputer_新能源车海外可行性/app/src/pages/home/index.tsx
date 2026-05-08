import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  TrendingUp, 
  Globe, 
  Zap, 
  Shield,
  ChevronLeft,
  ChevronRight,
  Car
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BRANDS_DATA, MODELS_DATA } from '@/constants';

// Hero轮播数据
const heroSlides = [
  {
    id: 1,
    title: '中国新能源汽车',
    subtitle: '走向世界的领先力量',
    description: '2024年中国新能源汽车出口突破200万辆，成为全球汽车出口第一大国',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1920&q=80',
    cta: { label: '探索品牌', path: '/brands' }
  },
  {
    id: 2,
    title: '比亚迪',
    subtitle: '全球新能源销量冠军',
    description: '2024年销量突破427万辆，业务覆盖全球70多个国家和地区',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1920&q=80',
    cta: { label: '了解详情', path: '/brands/byd' }
  },
  {
    id: 3,
    title: '智能电动',
    subtitle: '引领未来出行',
    description: '智能驾驶、智能座舱、超快充电，中国新能源车技术全球领先',
    image: 'https://images.unsplash.com/photo-1566008885218-90abf9200ddb?w=1920&q=80',
    cta: { label: '查看车型', path: '/models' }
  }
];

// 统计数据
const stats = [
  { 
    icon: TrendingUp, 
    value: '200万+', 
    label: '2024年出口量',
    suffix: '辆',
    change: '+23%'
  },
  { 
    icon: Globe, 
    value: '70+', 
    label: '覆盖国家/地区',
    suffix: '个',
    change: '持续增长'
  },
  { 
    icon: Zap, 
    value: '60%', 
    label: '全球市场份额',
    suffix: '',
    change: '领先'
  },
  { 
    icon: Shield, 
    value: '427万', 
    label: '比亚迪年销量',
    suffix: '辆',
    change: 'No.1'
  }
];

// 优势数据
const advantages = [
  {
    title: '技术领先',
    description: '电池、电机、电控核心技术全球领先，智能驾驶技术不断创新',
    icon: Zap
  },
  {
    title: '成本优势',
    description: '完整产业链带来成本优势，性价比远超欧美品牌',
    icon: TrendingUp
  },
  {
    title: '产品丰富',
    description: '从微型车到豪华SUV，覆盖全细分市场，满足不同需求',
    icon: Car
  },
  {
    title: '全球布局',
    description: '海外工厂、研发中心、销售网络遍布全球',
    icon: Globe
  }
];

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 自动轮播
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            </div>
            
            {/* Content */}
            <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
              <div className="max-w-2xl text-white pt-20">
                <h2 className="text-xl md:text-2xl font-medium text-blue-400 mb-4">
                  {slide.subtitle}
                </h2>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-xl">
                  {slide.description}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to={slide.cta.path}>
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8"
                    >
                      {slide.cta.label}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button 
                      size="lg"
                      variant="outline"
                      className="border-white text-white hover:bg-white hover:text-gray-900 px-8"
                    >
                      获取报价
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slide Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-4">
          <button
            onClick={prevSlide}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex space-x-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'bg-white w-8' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
          <button
            onClick={nextSlide}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-xl flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 mb-2">{stat.label}</div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    {stat.change}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              合作品牌
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              汇聚中国新能源汽车领军品牌，为全球客户提供优质产品和服务
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {BRANDS_DATA.slice(0, 8).map((brand) => (
              <Link
                key={brand.id}
                to={`/brands/${brand.id}`}
                className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="aspect-square mb-4 flex items-center justify-center">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
                <h3 className="text-lg font-semibold text-center text-gray-900 group-hover:text-blue-600 transition-colors">
                  {brand.name}
                </h3>
                <p className="text-sm text-center text-gray-500 mt-1">
                  {brand.nameEn}
                </p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/brands">
              <Button variant="outline" size="lg">
                查看全部品牌
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Hot Models Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              热门车型
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              精选畅销海外的新能源车型，满足不同市场需求
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MODELS_DATA.slice(0, 6).map((model) => {
              const brand = BRANDS_DATA.find(b => b.id === model.brandId);
              return (
                <Card 
                  key={model.id} 
                  className="overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-video bg-gray-100 relative">
                    {model.images[0] ? (
                      <img
                        src={model.images[0]}
                        alt={model.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-blue-600">{brand?.name}</Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {model.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span>{model.rangeKm}km续航</span>
                      <span>{model.accel0100}s加速</span>
                      <span>{model.seats}座</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-blue-600">
                          ${model.priceUsdMin.toLocaleString()}
                        </span>
                        <span className="text-gray-400 text-sm"> 起</span>
                      </div>
                      <Link to={`/models/${model.id}`}>
                        <Button variant="ghost" size="sm">
                          了解详情
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link to="/models">
              <Button variant="outline" size="lg">
                查看全部车型
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              为什么选择中国新能源汽车
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              技术领先、成本优势、产品丰富，中国新能源汽车正在重塑全球汽车市场格局
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advantages.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            准备好开启新能源汽车出海之旅了吗？
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            无论您是海外经销商、企业采购方还是个人消费者，我们都能为您提供专业的服务
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact">
              <Button 
                size="lg"
                className="bg-white text-blue-900 hover:bg-gray-100 px-8"
              >
                立即咨询
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/brands">
              <Button 
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 px-8"
              >
                浏览品牌
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
