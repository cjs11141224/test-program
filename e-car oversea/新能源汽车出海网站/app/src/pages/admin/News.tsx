import { useState } from 'react';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
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
import { formatDate } from '@/utils';

// 模拟新闻数据
const MOCK_NEWS = [
  {
    id: '1',
    title: '中国新能源汽车出口突破200万辆',
    summary: '2024年中国新能源汽车出口首次跨越200万辆...',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80',
    tags: ['出口数据', '行业动态'],
    source: '中国电动汽车百人会',
    publishedAt: '2025-01-15',
    isPublished: true
  },
  {
    id: '2',
    title: '比亚迪泰国工厂正式投产',
    summary: '比亚迪位于泰国罗勇府的工厂正式投产...',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80',
    tags: ['比亚迪', '海外建厂'],
    source: '比亚迪官方',
    publishedAt: '2025-01-10',
    isPublished: true
  }
];

const NewsManagement = () => {
  const [news, setNews] = useState(MOCK_NEWS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<typeof MOCK_NEWS[0] | null>(null);

  // 过滤新闻
  const filteredNews = news.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    setEditingNews(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: typeof MOCK_NEWS[0]) => {
    setEditingNews(item);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条新闻吗？')) {
      setNews(prev => prev.filter(n => n.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newsData = {
      id: editingNews?.id || Date.now().toString(),
      title: formData.get('title') as string,
      summary: formData.get('summary') as string,
      content: formData.get('content') as string,
      coverImage: formData.get('coverImage') as string,
      tags: (formData.get('tags') as string).split(',').map(t => t.trim()),
      source: formData.get('source') as string,
      publishedAt: formData.get('publishedAt') as string,
      isPublished: true
    };

    if (editingNews) {
      setNews(prev => prev.map(n => n.id === editingNews.id ? newsData as any : n));
    } else {
      setNews(prev => [newsData as any, ...prev]);
    }

    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">新闻管理</h1>
          <p className="text-gray-500 mt-1">管理网站的新闻资讯内容</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          添加新闻
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="搜索新闻标题..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Cover */}
              <div className="aspect-video relative">
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex flex-wrap gap-2 mb-3">
                  {item.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {item.summary}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>来源: {item.source}</span>
                  <span>{formatDate(item.publishedAt)}</span>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    预览
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                    <Edit className="w-4 h-4 mr-1" />
                    编辑
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    删除
                  </Button>
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
              {editingNews ? '编辑新闻' : '添加新闻'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                name="title"
                defaultValue={editingNews?.title}
                required
              />
            </div>

            <div>
              <Label htmlFor="summary">摘要</Label>
              <textarea
                id="summary"
                name="summary"
                defaultValue={editingNews?.summary}
                rows={2}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <Label htmlFor="content">正文内容</Label>
              <textarea
                id="content"
                name="content"
                defaultValue={editingNews?.content}
                rows={6}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <Label htmlFor="coverImage">封面图片URL</Label>
              <Input
                id="coverImage"
                name="coverImage"
                defaultValue={editingNews?.coverImage}
                required
              />
            </div>

            <div>
              <Label htmlFor="tags">标签（用逗号分隔）</Label>
              <Input
                id="tags"
                name="tags"
                defaultValue={editingNews?.tags.join(', ')}
                placeholder="例如: 行业动态, 出口数据"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source">来源</Label>
                <Input
                  id="source"
                  name="source"
                  defaultValue={editingNews?.source}
                  required
                />
              </div>
              <div>
                <Label htmlFor="publishedAt">发布时间</Label>
                <Input
                  id="publishedAt"
                  name="publishedAt"
                  type="date"
                  defaultValue={editingNews?.publishedAt}
                  required
                />
              </div>
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

export default NewsManagement;
