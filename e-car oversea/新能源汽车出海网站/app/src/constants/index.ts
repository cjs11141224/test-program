// 扩展类型声明
declare module '@/constants' {
  interface Brand {
    createdAt?: string;
    updatedAt?: string;
  }
  interface Model {
    createdAt?: string;
    updatedAt?: string;
    nameEn?: string;
  }
}

// 品牌数据（初始数据）
export const BRANDS_DATA = [
  {
    id: 'byd',
    name: '比亚迪',
    nameEn: 'BYD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/BYD_Auto_logo.svg/1200px-BYD_Auto_logo.svg.png',
    description: '全球新能源汽车领导者，掌握电池、电机、电控等核心技术',
    foundedYear: 2003,
    headquarters: '中国深圳',
    annualSales: 4272145,
    markets: ['中国', '欧洲', '东南亚', '中东', '拉美', '澳洲'],
    website: 'https://www.byd.com',
    story: '比亚迪成立于2003年，从电池制造商转型为新能源汽车领导者。2024年销量突破427万辆，是全球最大的新能源汽车制造商。',
    technology: '刀片电池、DM-i超级混动、e平台3.0、CTB电池车身一体化技术',
    layout: {
      countries: ['挪威', '德国', '荷兰', '泰国', '巴西', '匈牙利'],
      factories: [
        { country: '泰国', status: '投产' },
        { country: '巴西', status: '建设中' },
        { country: '匈牙利', status: '建设中' }
      ]
    },
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'nio',
    name: '蔚来',
    nameEn: 'NIO',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/NIO_logo.svg/1200px-NIO_logo.svg.png',
    description: '高端智能电动汽车品牌，以换电模式和用户服务著称',
    foundedYear: 2014,
    headquarters: '中国上海',
    annualSales: 221970,
    markets: ['中国', '挪威', '德国', '荷兰', '丹麦', '瑞典'],
    website: 'https://www.nio.com',
    story: '蔚来成立于2014年，定位高端智能电动汽车市场。创新推出换电模式，在全球建设超过2300座换电站。',
    technology: '换电技术、NAD自动驾驶、NOMI人工智能助手、固态电池',
    layout: {
      countries: ['挪威', '德国', '荷兰', '丹麦', '瑞典'],
      factories: []
    },
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'xpeng',
    name: '小鹏',
    nameEn: 'XPENG',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Xpeng_Motors_logo.svg/1200px-Xpeng_Motors_logo.svg.png',
    description: '智能电动汽车公司，以智能驾驶技术为核心竞争力',
    foundedYear: 2014,
    headquarters: '中国广州',
    annualSales: 190068,
    markets: ['中国', '挪威', '荷兰', '瑞典', '丹麦', '德国'],
    website: 'https://www.xpeng.com',
    story: '小鹏汽车成立于2014年，专注于智能驾驶技术研发。2024年海外销量达4.5万辆，同比增长96%。',
    technology: 'XNGP智能驾驶、800V高压快充、扶摇架构、飞行汽车',
    layout: {
      countries: ['挪威', '荷兰', '瑞典', '丹麦', '德国'],
      factories: []
    },
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'li-auto',
    name: '理想',
    nameEn: 'Li Auto',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Li_Auto_logo.svg/1200px-Li_Auto_logo.svg.png',
    description: '增程式电动汽车领导者，专注家庭用户市场',
    foundedYear: 2015,
    headquarters: '中国北京',
    annualSales: 500508,
    markets: ['中国', '乌兹别克斯坦'],
    website: 'https://www.lixiang.com',
    story: '理想汽车成立于2015年，专注增程式电动汽车。2024年销量突破50万辆，成为首家年交付超50万辆的新势力品牌。',
    technology: '增程电动技术、智能驾驶、智能座舱、高压纯电平台',
    layout: {
      countries: ['乌兹别克斯坦'],
      factories: []
    },
    sortOrder: 4,
    isActive: true
  },
  {
    id: 'zeekr',
    name: '极氪',
    nameEn: 'ZEEKR',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Zeekr_logo.svg/1200px-Zeekr_logo.svg.png',
    description: '吉利旗下高端智能电动品牌，专注纯电豪华市场',
    foundedYear: 2021,
    headquarters: '中国杭州',
    annualSales: 222000,
    markets: ['中国', '欧洲', '中东'],
    website: 'https://www.zeekr.com',
    story: '极氪成立于2021年，是吉利控股集团旗下高端智能电动品牌。2024年交付22.2万辆，同比增长87%。',
    technology: 'SEA浩瀚架构、800V高压平台、麒麟电池、智能驾驶',
    layout: {
      countries: ['荷兰', '瑞典', '德国', '阿联酋', '沙特'],
      factories: []
    },
    sortOrder: 5,
    isActive: true
  },
  {
    id: 'leapmotor',
    name: '零跑',
    nameEn: 'Leapmotor',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Leapmotor_logo.svg/1200px-Leapmotor_logo.svg.png',
    description: '科技型智能电动汽车企业，全域自研技术路线',
    foundedYear: 2015,
    headquarters: '中国杭州',
    annualSales: 293724,
    markets: ['中国', '欧洲'],
    website: 'https://www.leapmotor.com',
    story: '零跑汽车成立于2015年，坚持全域自研。2024年与Stellantis集团合作，进入35个海外市场。',
    technology: 'CTC电池底盘一体化、智能驾驶、智能座舱',
    layout: {
      countries: ['法国', '德国', '意大利', '荷兰', '西班牙'],
      factories: [
        { country: '波兰', status: '投产' }
      ]
    },
    sortOrder: 6,
    isActive: true
  },
  {
    id: 'mg',
    name: '名爵',
    nameEn: 'MG',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/MG_Motor_logo.svg/1200px-MG_Motor_logo.svg.png',
    description: '上汽集团旗下国际品牌，欧洲市场销量领先的中国品牌',
    foundedYear: 1924,
    headquarters: '中国上海',
    annualSales: 840000,
    markets: ['中国', '英国', '欧洲', '澳洲', '东南亚', '中东'],
    website: 'https://www.mg-motor.com',
    story: 'MG品牌源自英国，2005年被上汽集团收购。是中国品牌在欧洲市场的销量冠军。',
    technology: '星云纯电平台、DMH超级混动、智能驾驶',
    layout: {
      countries: ['英国', '德国', '法国', '西班牙', '意大利', '泰国', '印度'],
      factories: [
        { country: '泰国', status: '投产' },
        { country: '印度', status: '投产' }
      ]
    },
    sortOrder: 7,
    isActive: true
  },
  {
    id: 'chery',
    name: '奇瑞',
    nameEn: 'Chery',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Chery_Logo.svg/1200px-Chery_Logo.svg.png',
    description: '中国汽车出口领军企业，连续22年乘用车出口第一',
    foundedYear: 1997,
    headquarters: '中国芜湖',
    annualSales: 2603916,
    markets: ['中国', '俄罗斯', '中东', '南美', '欧洲', '东南亚'],
    website: 'https://www.chery.cn',
    story: '奇瑞汽车成立于1997年，是中国最早出口汽车的企业之一。2024年出口超114万辆，连续22年位居中国乘用车出口第一。',
    technology: '鲲鹏动力、火星架构、智能驾驶、新能源平台',
    layout: {
      countries: ['俄罗斯', '巴西', '埃及', '伊朗', '印尼', '马来西亚'],
      factories: [
        { country: '俄罗斯', status: '投产' },
        { country: '巴西', status: '投产' },
        { country: '埃及', status: '投产' }
      ]
    },
    sortOrder: 8,
    isActive: true
  }
];

// 车型数据（初始数据）
export const MODELS_DATA = [
  {
    id: 'byd-seal',
    brandId: 'byd',
    name: '海豹',
    category: 'sedan',
    powerType: 'bev',
    priceMin: 18.98,
    priceMax: 28.98,
    priceUsdMin: 26000,
    priceUsdMax: 40000,
    rangeKm: 700,
    powerKw: 390,
    accel0100: 3.8,
    seats: 5,
    images: [
      'https://www.byd.com/content/dam/byd-site/cn/cars/seal/seal-hero.jpg'
    ],
    specs: {
      '车身尺寸': '4800×1875×1460mm',
      '轴距': '2920mm',
      '电池容量': '82.5kWh',
      '充电时间': '30分钟(10%-80%)'
    },
    highlights: ['CTB电池车身一体化', 'iTAC智能扭矩控制', 'DiPilot智能驾驶', '700km超长续航'],
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'byd-atto3',
    brandId: 'byd',
    name: '元PLUS',
    nameEn: 'ATTO 3',
    category: 'suv',
    powerType: 'bev',
    priceMin: 13.58,
    priceMax: 16.78,
    priceUsdMin: 19000,
    priceUsdMax: 23000,
    rangeKm: 510,
    powerKw: 150,
    accel0100: 7.3,
    seats: 5,
    images: [],
    specs: {
      '车身尺寸': '4455×1875×1615mm',
      '轴距': '2720mm',
      '电池容量': '60.5kWh',
      '充电时间': '30分钟(10%-80%)'
    },
    highlights: ['刀片电池', 'e平台3.0', 'DiLink智能网联', '510km续航'],
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'nio-et5',
    brandId: 'nio',
    name: 'ET5',
    category: 'sedan',
    powerType: 'bev',
    priceMin: 29.8,
    priceMax: 35.6,
    priceUsdMin: 41000,
    priceUsdMax: 49000,
    rangeKm: 560,
    powerKw: 360,
    accel0100: 4.0,
    seats: 5,
    images: [],
    specs: {
      '车身尺寸': '4790×1960×1499mm',
      '轴距': '2888mm',
      '电池容量': '75kWh',
      '换电时间': '3分钟'
    },
    highlights: ['可换电设计', 'NAD自动驾驶', 'NOMI语音助手', '双电机四驱'],
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'xpeng-p7',
    brandId: 'xpeng',
    name: 'P7',
    category: 'sedan',
    powerType: 'bev',
    priceMin: 22.39,
    priceMax: 33.99,
    priceUsdMin: 31000,
    priceUsdMax: 47000,
    rangeKm: 706,
    powerKw: 316,
    accel0100: 4.3,
    seats: 5,
    images: [],
    specs: {
      '车身尺寸': '4888×1896×1450mm',
      '轴距': '2998mm',
      '电池容量': '80.9kWh',
      '充电时间': '28分钟(10%-80%)'
    },
    highlights: ['XNGP智能驾驶', '智能音乐座舱', '706km续航', 'OTA升级'],
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'li-l9',
    brandId: 'li-auto',
    name: 'L9',
    category: 'suv',
    powerType: 'reev',
    priceMin: 42.98,
    priceMax: 45.98,
    priceUsdMin: 59000,
    priceUsdMax: 63000,
    rangeKm: 1315,
    powerKw: 330,
    accel0100: 5.3,
    seats: 6,
    images: [],
    specs: {
      '车身尺寸': '5218×1998×1800mm',
      '轴距': '3105mm',
      '纯电续航': '215km',
      '综合续航': '1315km'
    },
    highlights: ['增程电动', '六座大空间', '智能座舱', '1315km超长续航'],
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'zeekr-001',
    brandId: 'zeekr',
    name: '001',
    category: 'sedan',
    powerType: 'bev',
    priceMin: 26.9,
    priceMax: 40.3,
    priceUsdMin: 37000,
    priceUsdMax: 55000,
    rangeKm: 750,
    powerKw: 400,
    accel0100: 3.8,
    seats: 5,
    images: [],
    specs: {
      '车身尺寸': '4970×1999×1560mm',
      '轴距': '3005mm',
      '电池容量': '100kWh',
      '充电时间': '30分钟(10%-80%)'
    },
    highlights: ['猎装轿跑', '麒麟电池', '750km续航', '空气悬架'],
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'leapmotor-c10',
    brandId: 'leapmotor',
    name: 'C10',
    category: 'suv',
    powerType: 'bev',
    priceMin: 12.88,
    priceMax: 16.88,
    priceUsdMin: 18000,
    priceUsdMax: 23000,
    rangeKm: 530,
    powerKw: 170,
    accel0100: 7.9,
    seats: 5,
    images: [],
    specs: {
      '车身尺寸': '4739×1900×1680mm',
      '轴距': '2825mm',
      '电池容量': '69.2kWh',
      '充电时间': '35分钟(10%-80%)'
    },
    highlights: ['CTC技术', '高通8295芯片', '530km续航', '高阶智驾'],
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'mg4',
    brandId: 'mg',
    name: 'MG4',
    nameEn: 'MG4 EV',
    category: 'sedan',
    powerType: 'bev',
    priceMin: 13.98,
    priceMax: 18.68,
    priceUsdMin: 19500,
    priceUsdMax: 26000,
    rangeKm: 520,
    powerKw: 150,
    accel0100: 7.7,
    seats: 5,
    images: [],
    specs: {
      '车身尺寸': '4287×1836×1516mm',
      '轴距': '2705mm',
      '电池容量': '64kWh',
      '充电时间': '35分钟(10%-80%)'
    },
    highlights: ['欧洲销冠', '后驱纯电', '520km续航', '五星安全'],
    sortOrder: 1,
    isActive: true
  }
];

// 国家列表
export const COUNTRIES = [
  { code: 'CN', name: '中国', nameEn: 'China' },
  { code: 'US', name: '美国', nameEn: 'United States' },
  { code: 'DE', name: '德国', nameEn: 'Germany' },
  { code: 'GB', name: '英国', nameEn: 'United Kingdom' },
  { code: 'FR', name: '法国', nameEn: 'France' },
  { code: 'IT', name: '意大利', nameEn: 'Italy' },
  { code: 'ES', name: '西班牙', nameEn: 'Spain' },
  { code: 'NL', name: '荷兰', nameEn: 'Netherlands' },
  { code: 'NO', name: '挪威', nameEn: 'Norway' },
  { code: 'SE', name: '瑞典', nameEn: 'Sweden' },
  { code: 'DK', name: '丹麦', nameEn: 'Denmark' },
  { code: 'TH', name: '泰国', nameEn: 'Thailand' },
  { code: 'MY', name: '马来西亚', nameEn: 'Malaysia' },
  { code: 'ID', name: '印尼', nameEn: 'Indonesia' },
  { code: 'SG', name: '新加坡', nameEn: 'Singapore' },
  { code: 'VN', name: '越南', nameEn: 'Vietnam' },
  { code: 'SA', name: '沙特', nameEn: 'Saudi Arabia' },
  { code: 'AE', name: '阿联酋', nameEn: 'UAE' },
  { code: 'QA', name: '卡塔尔', nameEn: 'Qatar' },
  { code: 'BR', name: '巴西', nameEn: 'Brazil' },
  { code: 'MX', name: '墨西哥', nameEn: 'Mexico' },
  { code: 'AU', name: '澳大利亚', nameEn: 'Australia' },
  { code: 'RU', name: '俄罗斯', nameEn: 'Russia' },
  { code: 'ZA', name: '南非', nameEn: 'South Africa' },
  { code: 'EG', name: '埃及', nameEn: 'Egypt' },
  { code: 'TR', name: '土耳其', nameEn: 'Turkey' },
  { code: 'IN', name: '印度', nameEn: 'India' },
  { code: 'JP', name: '日本', nameEn: 'Japan' },
  { code: 'KR', name: '韩国', nameEn: 'South Korea' },
  { code: 'OTHER', name: '其他', nameEn: 'Other' }
];

// 车型类别
export const CAR_CATEGORIES = [
  { value: 'sedan', label: '轿车', labelEn: 'Sedan' },
  { value: 'suv', label: 'SUV', labelEn: 'SUV' },
  { value: 'mpv', label: 'MPV', labelEn: 'MPV' },
  { value: 'sports', label: '跑车', labelEn: 'Sports' }
];

// 动力类型
export const POWER_TYPES = [
  { value: 'bev', label: '纯电动', labelEn: 'BEV' },
  { value: 'phev', label: '插电混动', labelEn: 'PHEV' },
  { value: 'reev', label: '增程式', labelEn: 'REEV' }
];

// 身份类型
export const IDENTITY_TYPES = [
  { value: 'dealer', label: '汽车经销商', labelEn: 'Car Dealer' },
  { value: 'enterprise', label: '企业采购', labelEn: 'Enterprise' },
  { value: 'consumer', label: '个人消费者', labelEn: 'Consumer' },
  { value: 'other', label: '其他', labelEn: 'Other' }
];

// 线索状态
export const LEAD_STATUS = [
  { value: 'pending', label: '待处理', color: 'yellow' },
  { value: 'following', label: '跟进中', color: 'blue' },
  { value: 'converted', label: '已转化', color: 'green' },
  { value: 'invalid', label: '无效', color: 'gray' }
];

// 市场数据
export const MARKET_DATA = {
  totalExport2024: 2000000,
  totalExportGrowth: 23,
  globalMarketShare: 60,
  topDestinations: [
    { country: '欧洲', percentage: 35 },
    { country: '东南亚', percentage: 28 },
    { country: '中东', percentage: 18 },
    { country: '拉美', percentage: 12 },
    { country: '其他', percentage: 7 }
  ],
  growthTrend: [
    { year: '2020', value: 50 },
    { year: '2021', value: 80 },
    { year: '2022', value: 120 },
    { year: '2023', value: 160 },
    { year: '2024', value: 200 },
    { year: '2025E', value: 280 }
  ]
};
