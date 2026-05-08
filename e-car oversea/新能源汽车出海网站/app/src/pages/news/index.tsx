import { useState, useMemo } from 'react';
import { Search, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// 模拟新闻数据
const NEWS_DATA = [
  {
    id: '1',
    title: '中国新能源汽车出口突破200万辆，再次成为全球汽车出口第一大国',
    summary: '2024年中国新能源汽车出口首次跨越200万辆，推动汽车整体出口达到641万辆，同比增长23%，中国再次成为全球汽车出口第一大国。',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80',
    tags: ['出口数据', '行业动态'],
    source: '中国电动汽车百人会',
    publishedAt: '2025-01-15',
    isPublished: true
  },
  {
    id: '2',
    title: '比亚迪泰国工厂正式投产，年产能达15万辆',
    summary: '比亚迪位于泰国罗勇府的工厂正式投产，这是比亚迪在东南亚的首个乘用车生产基地，年产能达15万辆。',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80',
    tags: ['比亚迪', '海外建厂'],
    source: '比亚迪官方',
    publishedAt: '2025-01-10',
    isPublished: true
  },
  {
    id: '3',
    title: '欧盟与中国就电动汽车关税达成价格承诺协议',
    summary: '中欧双方同意以最低价格承诺机制替代高额关税，中国车企可以不低于承诺价格的定价在欧盟市场销售电动汽车。',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1566008885218-90abf9200ddb?w=800&q=80',
    tags: ['欧盟', '政策法规'],
    source: '商务部',
    publishedAt: '2025-01-05',
    isPublished: true
  },
  {
    id: '4',
    title: '蔚来在欧洲建成第50座换电站',
    summary: '蔚来汽车宣布在欧洲建成第50座换电站，覆盖挪威、德国、荷兰、丹麦、瑞典等国家。',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1596730999557-b08709503422?w=800&q=80',
    tags: ['蔚来', '换电站'],
    source: '蔚来官方',
    publishedAt: '2024-12-28',
    isPublished: true
  },
  {
    id: '5',
    title: '小鹏汽车进入波兰、瑞士等东欧市场',
    summary: '小鹏汽车宣布正式进入波兰、瑞士、捷克、斯洛伐克等东欧市场，进一步拓展欧洲业务版图。',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80',
    tags: ['小鹏', '欧洲市场'],
    source: '小鹏汽车',
    publishedAt: '2024-12-20',
    isPublished: true
  },
  {
    id: '6',
    title: '零跑国际与Stellantis合作首款车型在欧洲上市',
    summary: '零跑国际与Stellantis集团合作的首款车型T03在欧洲正式上市，售价约2万欧元。',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
    tags: ['零跑', 'Stellantis'],
    source: '零跑汽车',
    publishedAt: '2024-12-15',
    isPublished: true
  }
];

const NewsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');

  // 获取所有标签
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    NEWS_DATA.forEach(news => {
      news.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, []);

  // 过滤新闻
  const filteredNews = useMemo(() => {
    let news = [...NEWS_DATA];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      news = news.filter(
        item =>
          item.title.toLowerCase().includes(query) ||
          item.summary.toLowerCase().includes(query)
      );
    }

    if (selectedTag !== 'all') {
      news = news.filter(item => item.tags.includes(selectedTag));
    }

    return news;
  }, [searchQuery, selectedTag]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            新闻资讯
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            了解中国新能源汽车出海的最新动态、政策解读和市场分析
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
                placeholder="搜索新闻..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tag Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTag === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                全部
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTag === tag
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredNews.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              未找到匹配的新闻
            </h3>
            <p className="text-gray-500">
              请尝试调整搜索条件
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((news) => (
              <Card 
                key={news.id} 
                className="overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Cover Image */}
                <div className="aspect-video relative">
                  <img
                    src={news.coverImage}
                    alt={news.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <CardContent className="p-5">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {news.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                    {news.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {news.summary}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{news.publishedAt}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      来源: {news.source}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results Count */}
        <div className="mt-8 text-center text-gray-500">
          共 {filteredNews.length} 条新闻
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
