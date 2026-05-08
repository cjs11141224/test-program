import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Eye, Heart, MessageCircle, Share2 } from 'lucide-react'
import { newsApi } from '../services/api'
import { NewsDetail as NewsDetailType } from '../types'

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>()
  const [news, setNews] = useState<NewsDetailType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchNewsDetail(parseInt(id))
    }
  }, [id])

  const fetchNewsDetail = async (newsId: number) => {
    try {
      setLoading(true)
      const res = await newsApi.getNewsDetail(newsId)
      setNews(res as NewsDetailType)
    } catch (error) {
      console.error('Failed to fetch news detail:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!news) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">资讯不存在</h2>
          <Link to="/news" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            返回资讯列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/news" className="flex items-center text-gray-600 hover:text-primary-600">
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回资讯列表
          </Link>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{news.title}</h1>
          {news.subtitle && (
            <p className="text-xl text-gray-600 mb-4">{news.subtitle}</p>
          )}
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-4">{news.author || news.source_name || '未知来源'}</span>
              <Calendar className="h-4 w-4 mr-1" />
              {news.publish_time && new Date(news.publish_time).toLocaleString()}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {news.view_count}
              </span>
              <span className="flex items-center">
                <Heart className="h-4 w-4 mr-1" />
                {news.like_count}
              </span>
              <span className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-1" />
                {news.comment_count}
              </span>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {news.cover_image && (
          <div className="mb-8">
            <img
              src={news.cover_image}
              alt={news.title}
              className="w-full rounded-xl"
            />
          </div>
        )}

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: news.content || news.summary || '' }}
        />

        {/* Tags */}
        {news.tags && news.tags.length > 0 && (
          <div className="mt-8 pt-8 border-t">
            <div className="flex flex-wrap gap-2">
              {news.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}
