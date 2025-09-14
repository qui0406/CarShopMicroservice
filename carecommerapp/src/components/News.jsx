import React, { useState, useEffect } from 'react';
import { Newspaper, Car, TrendingUp, Award, Calendar, Clock, User, Eye, Heart, Share2, Search, Filter, ChevronRight, Star, MessageCircle } from 'lucide-react';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredNews, setFeaturedNews] = useState(null);
  const [likedNews, setLikedNews] = useState([]);

  // Mock data - tin tức shop bán xe ô tô
  const mockNews = [
    {
      id: 1,
      title: 'Honda City 2024 - Sedan hạng B với nhiều nâng cấp vượt trội',
      excerpt: 'Honda City thế hệ mới ra mắt với thiết kế hiện đại, công nghệ tiên tiến và giá bán cạnh tranh trong phân khúc sedan hạng B.',
      content: 'Honda City 2024 được Honda Việt Nam chính thức giới thiệu với nhiều cải tiến đáng kể...',
      category: 'new-models',
      author: 'Minh Tuấn',
      publishDate: '2024-09-10',
      readTime: 5,
      views: 2840,
      likes: 156,
      comments: 23,
      featured: true,
      tags: ['Honda', 'City', 'Sedan', 'Hạng B'],
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 2,
      title: 'Chương trình khuyến mãi lớn cuối năm - Giảm giá đến 100 triệu',
      excerpt: 'Nhân dịp cuối năm, showroom triển khai chương trình ưu đãi lớn với mức giảm giá lên đến 100 triệu đồng cho các dòng xe.',
      content: 'Từ ngày 15/11 đến 31/12/2024, showroom chúng tôi triển khai chương trình...',
      category: 'promotions',
      author: 'Thu Hà',
      publishDate: '2024-09-08',
      readTime: 3,
      views: 4250,
      likes: 298,
      comments: 67,
      featured: false,
      tags: ['Khuyến mãi', 'Giảm giá', 'Cuối năm'],
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 3,
      title: 'Toyota Camry 2024 chính thức có mặt tại showroom',
      excerpt: 'Toyota Camry thế hệ hoàn toàn mới đã chính thức có mặt tại showroom với thiết kế táo bạo và động cơ hybrid tiết kiệm.',
      content: 'Toyota Camry 2024 đánh dấu sự trở lại ấn tượng của dòng sedan hạng D...',
      category: 'new-models',
      author: 'Đức Anh',
      publishDate: '2024-09-05',
      readTime: 7,
      views: 1890,
      likes: 142,
      comments: 19,
      featured: false,
      tags: ['Toyota', 'Camry', 'Hybrid', 'Sedan hạng D'],
      image: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 4,
      title: 'Bí quyết bảo dưỡng xe ô tô mùa mưa hiệu quả',
      excerpt: 'Mùa mưa đến, việc bảo dưỡng xe ô tô cần được chú ý đặc biệt. Cùng tìm hiểu những mẹo hữu ích để bảo vệ xế cưng.',
      content: 'Mùa mưa bão luôn là thách thức lớn đối với việc bảo dưỡng xe ô tô...',
      category: 'tips',
      author: 'Văn Nam',
      publishDate: '2024-09-03',
      readTime: 6,
      views: 3120,
      likes: 203,
      comments: 45,
      featured: false,
      tags: ['Bảo dưỡng', 'Mùa mưa', 'Tips'],
      image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 5,
      title: 'Showroom vinh dự đạt giải "Đại lý xuất sắc năm 2024"',
      excerpt: 'Với những nỗ lực không ngừng trong việc phục vụ khách hàng, showroom đã được vinh danh là "Đại lý xuất sắc năm 2024".',
      content: 'Trong lễ trao giải thường niên của hãng xe, showroom chúng tôi đã vinh dự...',
      category: 'company',
      author: 'Mai Linh',
      publishDate: '2024-09-01',
      readTime: 4,
      views: 1654,
      likes: 189,
      comments: 34,
      featured: false,
      tags: ['Giải thưởng', 'Đại lý xuất sắc', 'Vinh danh'],
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 6,
      title: 'Mazda CX-5 2024 - SUV 5 chỗ đáng mua nhất phân khúc',
      excerpt: 'Mazda CX-5 phiên bản 2024 với những cải tiến đáng kể về thiết kế và trang bị, hứa hẹn tiếp tục dẫn đầu phân khúc SUV 5 chỗ.',
      content: 'Mazda CX-5 2024 đã chính thức ra mắt thị trường Việt Nam với nhiều điểm nhấn...',
      category: 'reviews',
      author: 'Hoàng Long',
      publishDate: '2024-08-28',
      readTime: 8,
      views: 2567,
      likes: 178,
      comments: 29,
      featured: false,
      tags: ['Mazda', 'CX-5', 'SUV', 'Đánh giá'],
      image: 'https://images.unsplash.com/photo-1544829099-b9a0c5303bea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 7,
      title: 'Thị trường ô tô Việt Nam quý 3/2024: Tăng trưởng ấn tượng',
      excerpt: 'Thị trường ô tô Việt Nam trong quý 3/2024 ghi nhận mức tăng trưởng tích cực với doanh số bán hàng tăng 15% so với cùng kỳ.',
      content: 'Theo báo cáo từ Hiệp hội các nhà sản xuất ô tô Việt Nam (VAMA)...',
      category: 'market',
      author: 'Thanh Hương',
      publishDate: '2024-08-25',
      readTime: 6,
      views: 1876,
      likes: 134,
      comments: 18,
      featured: false,
      tags: ['Thị trường', 'Tăng trưởng', 'VAMA'],
      image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 8,
      title: 'Hướng dẫn chọn mua xe ô tô phù hợp với túi tiền',
      excerpt: 'Việc chọn mua một chiếc xe ô tô phù hợp không chỉ dựa vào sở thích mà còn cần cân nhắc nhiều yếu tố khác.',
      content: 'Mua xe ô tô là một quyết định quan trọng và cần được cân nhắc kỹ lưỡng...',
      category: 'tips',
      author: 'Quốc Bảo',
      publishDate: '2024-08-20',
      readTime: 10,
      views: 4123,
      likes: 267,
      comments: 52,
      featured: true,
      tags: ['Hướng dẫn', 'Mua xe', 'Tips', 'Tài chính'],
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    }
  ];

  const categories = [
    { id: 'all', name: 'Tất cả', icon: Newspaper },
    { id: 'new-models', name: 'Xe mới', icon: Car },
    { id: 'promotions', name: 'Khuyến mãi', icon: TrendingUp },
    { id: 'reviews', name: 'Đánh giá', icon: Star },
    { id: 'tips', name: 'Mẹo hay', icon: Award },
    { id: 'market', name: 'Thị trường', icon: TrendingUp },
    { id: 'company', name: 'Về chúng tôi', icon: Award }
  ];

  useEffect(() => {
    setNews(mockNews);
    setFilteredNews(mockNews);
    setFeaturedNews(mockNews.find(item => item.featured));
  }, []);

  useEffect(() => {
    let filtered = news;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredNews(filtered);
  }, [news, selectedCategory, searchTerm]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const publishDate = new Date(dateString);
    const diffTime = Math.abs(now - publishDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    return `${Math.floor(diffDays / 30)} tháng trước`;
  };

  const handleLike = (newsId) => {
    if (likedNews.includes(newsId)) {
      setLikedNews(likedNews.filter(id => id !== newsId));
    } else {
      setLikedNews([...likedNews, newsId]);
    }
  };

  const NewsCard = ({ article, featured = false }) => (
    <article className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group ${featured ? 'lg:col-span-2' : ''}`}>
      <div className={`relative overflow-hidden ${featured ? 'h-80' : 'h-48'}`}>
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {categories.find(cat => cat.id === article.category)?.name}
          </span>
        </div>
        {featured && (
          <div className="absolute top-4 right-4">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Nổi bật
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      <div className={`p-6 ${featured ? 'lg:p-8' : ''}`}>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            {article.author}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {getTimeAgo(article.publishDate)}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {article.readTime} phút đọc
          </div>
        </div>

        <h2 className={`font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors ${featured ? 'text-2xl' : 'text-lg'}`}>
          {article.title}
        </h2>

        <p className={`text-gray-600 mb-4 line-clamp-3 ${featured ? 'text-base' : 'text-sm'}`}>
          {article.excerpt}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.slice(0, featured ? 4 : 3).map((tag, index) => (
            <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-gray-500">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{article.views.toLocaleString()}</span>
            </div>
            <button
              onClick={() => handleLike(article.id)}
              className={`flex items-center gap-1 transition-colors ${
                likedNews.includes(article.id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${likedNews.includes(article.id) ? 'fill-current' : ''}`} />
              <span className="text-sm">{article.likes + (likedNews.includes(article.id) ? 1 : 0)}</span>
            </button>
            <div className="flex items-center gap-1 text-gray-500">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{article.comments}</span>
            </div>
          </div>
          <button className="flex items-center gap-1 text-blue-500 hover:text-blue-700 font-medium transition-colors">
            Đọc thêm
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50" style={{ paddingTop: '70px' }}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Newspaper className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Tin Tức Ô Tô
              </h1>
              <p className="text-gray-500 text-sm">Cập nhật thông tin mới nhất về thế giới xe hơi</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search & Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm tin tức..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                      selectedCategory === category.id
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Featured News */}
        {featuredNews && selectedCategory === 'all' && !searchTerm && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-800">Tin Nổi Bật</h2>
            </div>
            <NewsCard article={featuredNews} featured />
          </div>
        )}

        {/* News Grid */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Newspaper className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedCategory === 'all' ? 'Tất Cả Tin Tức' : categories.find(cat => cat.id === selectedCategory)?.name}
            </h2>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
              {filteredNews.length} bài viết
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredNews.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy tin tức</h3>
            <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc danh mục</p>
          </div>
        )}

        {/* Load More Button */}
        {filteredNews.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              Xem thêm tin tức
            </button>
          </div>
        )}
      </div>

      {/* Newsletter Subscription */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16 mt-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h3 className="text-3xl font-bold text-white mb-4">
            Đăng Ký Nhận Tin Mới Nhất
          </h3>
          <p className="text-blue-100 mb-8 text-lg">
            Cập nhật thông tin xe hơi, khuyến mãi và tin tức mới nhất từ showroom
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="flex-1 px-6 py-4 rounded-xl border-0 focus:ring-2 focus:ring-white outline-none"
            />
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
              Đăng Ký
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsPage;