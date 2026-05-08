import { useState, useRef } from 'react';
import { 
  Upload, 
  Image, 
  FileText, 
  Video, 
  Trash2, 
  Copy, 
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatFileSize, copyToClipboard } from '@/utils';

// 素材类型定义
interface Asset {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  type: 'image' | 'video' | 'document';
  tags: string[];
  createdAt: string;
}

// 模拟素材数据
const MOCK_ASSETS: Asset[] = [
  {
    id: '1',
    filename: 'byd-logo.png',
    originalName: '比亚迪Logo.png',
    mimeType: 'image/png',
    size: 24576,
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/BYD_Auto_logo.svg/1200px-BYD_Auto_logo.svg.png',
    type: 'image',
    tags: ['logo', '比亚迪'],
    createdAt: '2025-01-15'
  },
  {
    id: '2',
    filename: 'nio-logo.png',
    originalName: '蔚来Logo.png',
    mimeType: 'image/png',
    size: 18432,
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/NIO_logo.svg/1200px-NIO_logo.svg.png',
    type: 'image',
    tags: ['logo', '蔚来'],
    createdAt: '2025-01-15'
  },
  {
    id: '3',
    filename: 'product-brochure.pdf',
    originalName: '产品手册.pdf',
    mimeType: 'application/pdf',
    size: 2048576,
    url: '/uploads/product-brochure.pdf',
    type: 'document',
    tags: ['文档', '产品资料'],
    createdAt: '2025-01-10'
  }
];

const AssetsManagement = () => {
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 过滤素材
  const filteredAssets = assets.filter(asset =>
    asset.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getAssetsByType = (type: string) => {
    return filteredAssets.filter(asset => asset.type === type);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      const type: 'image' | 'video' | 'document' = file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('video/') ? 'video' : 'document';
      const newAsset = {
        id: Date.now().toString() + Math.random(),
        filename: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        type,
        tags: [] as string[],
        createdAt: new Date().toISOString()
      };
      setAssets(prev => [newAsset, ...prev]);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个素材吗？')) {
      setAssets(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleCopyUrl = async (url: string) => {
    const success = await copyToClipboard(url);
    if (success) {
      alert('链接已复制到剪贴板');
    }
  };

  const AssetCard = ({ asset }: { asset: Asset }) => {
    return (
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="p-0">
          {/* Preview */}
          <div 
            className="aspect-square bg-gray-100 relative cursor-pointer"
            onClick={() => {
              setSelectedAsset(asset);
              setIsPreviewOpen(true);
            }}
          >
            {asset.type === 'image' ? (
              <img
                src={asset.url}
                alt={asset.originalName}
                className="w-full h-full object-cover"
              />
            ) : asset.type === 'video' ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <Video className="w-16 h-16 text-gray-400" />
                <span className="text-sm text-gray-500 mt-2">视频文件</span>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <FileText className="w-16 h-16 text-gray-400" />
                <span className="text-sm text-gray-500 mt-2">文档</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4">
            <p className="font-medium text-gray-900 truncate" title={asset.originalName}>
              {asset.originalName}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {formatFileSize(asset.size)}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {asset.tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => handleCopyUrl(asset.url)}
              >
                <Copy className="w-4 h-4 mr-1" />
                复制链接
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleDelete(asset.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">素材管理</h1>
          <p className="text-gray-500 mt-1">管理网站使用的图片、视频、文档等素材</p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-4 h-4 mr-2" />
          上传素材
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,application/pdf"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          拖拽文件到此处上传
        </p>
        <p className="text-sm text-gray-500 mb-4">
          支持图片、视频、PDF等格式，单个文件不超过50MB
        </p>
        <Button 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()}
        >
          选择文件
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="搜索素材名称或标签..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Assets Grid */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            全部 ({filteredAssets.length})
          </TabsTrigger>
          <TabsTrigger value="image">
            图片 ({getAssetsByType('image').length})
          </TabsTrigger>
          <TabsTrigger value="video">
            视频 ({getAssetsByType('video').length})
          </TabsTrigger>
          <TabsTrigger value="document">
            文档 ({getAssetsByType('document').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-20">
              <Image className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">暂无素材</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredAssets.map(asset => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          )}
        </TabsContent>

        {['image', 'video', 'document'].map(type => (
          <TabsContent key={type} value={type} className="mt-6">
            {getAssetsByType(type).length === 0 ? (
              <div className="text-center py-20">
                <Image className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">暂无{type === 'image' ? '图片' : type === 'video' ? '视频' : '文档'}素材</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {getAssetsByType(type).map(asset => (
                  <AssetCard key={asset.id} asset={asset} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedAsset?.originalName}</DialogTitle>
          </DialogHeader>
          {selectedAsset && (
            <div className="space-y-4">
              {selectedAsset.type === 'image' ? (
                <img
                  src={selectedAsset.url}
                  alt={selectedAsset.originalName}
                  className="w-full max-h-[60vh] object-contain"
                />
              ) : selectedAsset.type === 'video' ? (
                <video
                  src={selectedAsset.url}
                  controls
                  className="w-full max-h-[60vh]"
                />
              ) : (
                <div className="p-8 bg-gray-50 rounded-lg text-center">
                  <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">此文件类型不支持预览</p>
                  <a
                    href={selectedAsset.url}
                    download
                    className="text-blue-600 hover:underline mt-2 inline-block"
                  >
                    下载文件
                  </a>
                </div>
              )}
              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">
                    大小: {formatFileSize(selectedAsset.size)}
                  </p>
                  <p className="text-sm text-gray-500">
                    类型: {selectedAsset.mimeType}
                  </p>
                </div>
                <Button onClick={() => handleCopyUrl(selectedAsset.url)}>
                  <Copy className="w-4 h-4 mr-2" />
                  复制链接
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssetsManagement;
