import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Send, 
  CheckCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Car,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BRANDS_DATA, COUNTRIES, IDENTITY_TYPES } from '@/constants';
import { useLeadStore } from '@/stores';
import { generateId } from '@/utils';
import type { LeadFormData } from '@/types';

const ContactPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addLead = useLeadStore(state => state.addLead);

  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    email: '',
    phone: '',
    country: '',
    identity: 'consumer',
    brands: [],
    message: '',
    quantity: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LeadFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名';
    }

    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    if (!formData.country) {
      newErrors.country = '请选择国家/地区';
    }

    if (!formData.identity) {
      newErrors.identity = '请选择身份类型';
    }

    if (!formData.message.trim()) {
      newErrors.message = '请输入咨询内容';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 创建线索
    const newLead = {
      id: generateId(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      country: formData.country,
      identity: formData.identity as any,
      brands: formData.brands,
      message: formData.message,
      quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addLead(newLead);
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const handleBrandToggle = (brandId: string) => {
    setFormData(prev => ({
      ...prev,
      brands: prev.brands.includes(brandId)
        ? prev.brands.filter(b => b !== brandId)
        : [...prev.brands, brandId]
    }));
  };

  const contactInfo = [
    {
      icon: Mail,
      title: '邮箱',
      content: 'contact@nevexport.com',
      description: '我们会在24小时内回复'
    },
    {
      icon: Phone,
      title: '电话',
      content: '+86 400-888-8888',
      description: '工作日 9:00-18:00'
    },
    {
      icon: MapPin,
      title: '地址',
      content: '中国上海市浦东新区',
      description: '欢迎来访'
    },
    {
      icon: Clock,
      title: '工作时间',
      content: '周一至周五',
      description: '9:00 - 18:00 (GMT+8)'
    }
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Card className="text-center p-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              提交成功！
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              感谢您的咨询，我们的专业团队将在24小时内与您联系。
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/">
                <Button variant="outline">
                  返回首页
                </Button>
              </Link>
              <Link to="/brands">
                <Button>
                  浏览品牌
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            联系我们
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            无论您是海外经销商、企业采购方还是个人消费者，
            我们都期待与您合作，共同开拓新能源汽车市场
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  在线咨询
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">
                        姓名 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="请输入您的姓名"
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">
                        邮箱 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="请输入您的邮箱"
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Phone & Country */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone">电话</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+国家码 电话号码"
                      />
                    </div>

                    <div>
                      <Label htmlFor="country">
                        国家/地区 <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={formData.country} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                      >
                        <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
                          <SelectValue placeholder="请选择国家/地区" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map(country => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.country && (
                        <p className="text-sm text-red-500 mt-1">{errors.country}</p>
                      )}
                    </div>
                  </div>

                  {/* Identity */}
                  <div>
                    <Label htmlFor="identity">
                      身份类型 <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.identity} 
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, identity: value }))}
                    >
                      <SelectTrigger className={errors.identity ? 'border-red-500' : ''}>
                        <SelectValue placeholder="请选择身份类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {IDENTITY_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.identity && (
                      <p className="text-sm text-red-500 mt-1">{errors.identity}</p>
                    )}
                  </div>

                  {/* Quantity (only for dealer/enterprise) */}
                  {(formData.identity === 'dealer' || formData.identity === 'enterprise') && (
                    <div>
                      <Label htmlFor="quantity">预计采购数量</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                        placeholder="请输入预计采购数量"
                      />
                    </div>
                  )}

                  {/* Brands */}
                  <div>
                    <Label>感兴趣的品牌（可多选）</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {BRANDS_DATA.map(brand => (
                        <button
                          key={brand.id}
                          type="button"
                          onClick={() => handleBrandToggle(brand.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            formData.brands.includes(brand.id)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {brand.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="message">
                      咨询内容 <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="请详细描述您的需求，包括感兴趣的车型、数量、目标市场等"
                      rows={5}
                      className={errors.message ? 'border-red-500' : ''}
                    />
                    {errors.message && (
                      <p className="text-sm text-red-500 mt-1">{errors.message}</p>
                    )}
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        提交中...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        提交咨询
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{info.title}</h3>
                      <p className="text-lg font-medium text-blue-600 mt-1">
                        {info.content}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {info.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Quick Links */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">快速链接</h3>
                <div className="space-y-3">
                  <Link 
                    to="/brands"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Car className="w-5 h-5 text-blue-600" />
                    <span>浏览品牌</span>
                  </Link>
                  <Link 
                    to="/models"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <span>查看车型</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
