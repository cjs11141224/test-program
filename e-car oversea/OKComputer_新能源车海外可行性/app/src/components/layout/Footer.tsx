import { Link } from 'react-router-dom';
import { Car, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    products: {
      title: '产品服务',
      links: [
        { label: '品牌展示', path: '/brands' },
        { label: '车型库', path: '/models' },
        { label: '技术方案', path: '/technology' },
        { label: '售后服务', path: '/service' },
      ]
    },
    company: {
      title: '关于我们',
      links: [
        { label: '公司介绍', path: '/about' },
        { label: '新闻资讯', path: '/news' },
        { label: '合作伙伴', path: '/partners' },
        { label: '加入我们', path: '/careers' },
      ]
    },
    support: {
      title: '帮助支持',
      links: [
        { label: '联系我们', path: '/contact' },
        { label: '常见问题', path: '/faq' },
        { label: '隐私政策', path: '/privacy' },
        { label: '服务条款', path: '/terms' },
      ]
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-400 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                NEV Export
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              专注中国新能源汽车出海服务，连接全球买家与中国优质新能源品牌，
              助力中国新能源汽车走向世界。
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <span>contact@nevexport.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-500" />
                <span>+86 400-888-8888</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-blue-500" />
                <span>中国上海市浦东新区</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © {currentYear} NEV Export. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-300">
              隐私政策
            </Link>
            <Link to="/terms" className="text-sm text-gray-500 hover:text-gray-300">
              服务条款
            </Link>
            <Link to="/admin" className="text-sm text-gray-500 hover:text-gray-300">
              管理后台
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
