import React, { useState, useEffect } from 'react';
import { Gift, Car, Percent, Clock, Check, X, Filter, Search, Calendar, Tag } from 'lucide-react';

const VoucherPage = () => {
  const [vouchers, setVouchers] = useState([]);
  const [filteredVouchers, setFilteredVouchers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedVouchers, setAppliedVouchers] = useState([]);

  // Mock data - vouchers cho shop bán xe ô tô
  const mockVouchers = [
    {
      id: 1,
      code: 'NEWCAR2024',
      title: 'Giảm giá xe mới',
      description: 'Giảm 50 triệu đồng cho khách hàng mua xe mới trong tháng',
      discount: 50000000,
      discountType: 'amount',
      category: 'new-car',
      validFrom: '2024-01-01',
      validTo: '2024-12-31',
      minPurchase: 500000000,
      maxDiscount: 50000000,
      usageLimit: 100,
      used: 23,
      isActive: true,
      carBrands: ['Toyota', 'Honda', 'Mazda'],
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 2,
      code: 'SERVICE20',
      title: 'Giảm giá bảo dưỡng',
      description: 'Giảm 20% chi phí bảo dưỡng định kỳ cho tất cả dòng xe',
      discount: 20,
      discountType: 'percentage',
      category: 'service',
      validFrom: '2024-01-01',
      validTo: '2024-06-30',
      minPurchase: 1000000,
      maxDiscount: 5000000,
      usageLimit: 200,
      used: 89,
      isActive: true,
      carBrands: ['All'],
      image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 3,
      code: 'TRADEIN30',
      title: 'Trade-in siêu ưu đãi',
      description: 'Tặng thêm 30 triệu khi trade-in xe cũ mua xe mới',
      discount: 30000000,
      discountType: 'amount',
      category: 'trade-in',
      validFrom: '2024-03-01',
      validTo: '2024-05-31',
      minPurchase: 400000000,
      maxDiscount: 30000000,
      usageLimit: 50,
      used: 12,
      isActive: true,
      carBrands: ['Toyota', 'Honda'],
      image: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 4,
      code: 'INSURANCE15',
      title: 'Bảo hiểm ưu đãi',
      description: 'Giảm 15% phí bảo hiểm xe năm đầu',
      discount: 15,
      discountType: 'percentage',
      category: 'insurance',
      validFrom: '2024-01-01',
      validTo: '2024-12-31',
      minPurchase: 0,
      maxDiscount: 10000000,
      usageLimit: 300,
      used: 156,
      isActive: true,
      carBrands: ['All'],
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 5,
      code: 'LUXURY100',
      title: 'Xe sang giảm sốc',
      description: 'Giảm 100 triệu cho dòng xe luxury, limited time only',
      discount: 100000000,
      discountType: 'amount',
      category: 'luxury',
      validFrom: '2024-02-01',
      validTo: '2024-02-29',
      minPurchase: 1000000000,
      maxDiscount: 100000000,
      usageLimit: 20,
      used: 5,
      isActive: false,
      carBrands: ['Mercedes', 'BMW', 'Audi'],
      image: 'https://images.unsplash.com/photo-1544829099-b9a0c5303bea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 6,
      code: 'ACCESSORIES25',
      title: 'Phụ kiện xe hơi',
      description: 'Giảm 25% tất cả phụ kiện chính hãng',
      discount: 25,
      discountType: 'percentage',
      category: 'accessories',
      validFrom: '2024-01-15',
      validTo: '2024-07-15',
      minPurchase: 500000,
      maxDiscount: 20000000,
      usageLimit: 150,
      used: 67,
      isActive: true,
      carBrands: ['All'],
      image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    }
  ];

  const categories = [
    { id: 'all', name: 'Tất cả', icon: Gift },
    { id: 'new-car', name: 'Xe mới', icon: Car },
    { id: 'service', name: 'Bảo dưỡng', icon: Check },
    { id: 'trade-in', name: 'Trade-in', icon: Percent },
    { id: 'insurance', name: 'Bảo hiểm', icon: Clock },
    { id: 'luxury', name: 'Xe sang', icon: Tag },
    { id: 'accessories', name: 'Phụ kiện', icon: Gift }
  ];

  useEffect(() => {
    setVouchers(mockVouchers);
    setFilteredVouchers(mockVouchers);
  }, []);

  useEffect(() => {
    let filtered = vouchers;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(voucher => voucher.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(voucher =>
        voucher.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredVouchers(filtered);
  }, [vouchers, selectedCategory, searchTerm]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const isExpired = (validTo) => {
    return new Date(validTo) < new Date();
  };

  const getDaysLeft = (validTo) => {
    const today = new Date();
    const endDate = new Date(validTo);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleApplyVoucher = (voucher) => {
    if (!appliedVouchers.includes(voucher.id)) {
      setAppliedVouchers([...appliedVouchers, voucher.id]);
    }
  };

  const handleRemoveVoucher = (voucherId) => {
    setAppliedVouchers(appliedVouchers.filter(id => id !== voucherId));
  };

  const getDiscountText = (voucher) => {
    if (voucher.discountType === 'percentage') {
      return `${voucher.discount}%`;
    } else {
      return formatCurrency(voucher.discount);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50" style={{ paddingTop: '70px' }}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Voucher Ưu Đãi
              </h1>
              <p className="text-gray-500 text-sm">Tiết kiệm chi phí mua xe và dịch vụ</p>
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
                placeholder="Tìm kiếm voucher..."
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

        {/* Applied Vouchers */}
        {appliedVouchers.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
              <Check className="w-5 h-5" />
              Voucher đã áp dụng ({appliedVouchers.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appliedVouchers.map(voucherId => {
                const voucher = vouchers.find(v => v.id === voucherId);
                return voucher && (
                  <div key={voucher.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-green-200">
                    <div>
                      <span className="font-bold text-green-600">{voucher.code}</span>
                      <p className="text-sm text-gray-600">{voucher.title}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveVoucher(voucher.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Vouchers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVouchers.map((voucher) => {
            const expired = isExpired(voucher.validTo);
            const daysLeft = getDaysLeft(voucher.validTo);
            const isApplied = appliedVouchers.includes(voucher.id);

            return (
              <div key={voucher.id} className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${expired ? 'opacity-60' : ''}`}>
                {/* Voucher Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={voucher.image}
                    alt={voucher.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      expired ? 'bg-red-500 text-white' : 
                      daysLeft <= 7 ? 'bg-orange-500 text-white' : 
                      'bg-green-500 text-white'
                    }`}>
                      {expired ? 'Hết hạn' : `${daysLeft} ngày`}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {getDiscountText(voucher)}
                    </div>
                  </div>
                </div>

                {/* Voucher Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{voucher.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{voucher.description}</p>
                    
                    <div className="bg-gray-50 p-3 rounded-xl mb-4">
                      <div className="flex items-center justify-center">
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-mono font-bold text-lg tracking-wider">
                          {voucher.code}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Voucher Details */}
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>HSD: {formatDate(voucher.validTo)}</span>
                    </div>
                    {voucher.minPurchase > 0 && (
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        <span>Tối thiểu: {formatCurrency(voucher.minPurchase)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4" />
                      <span>Áp dụng: {voucher.carBrands.join(', ')}</span>
                    </div>
                  </div>

                  {/* Usage Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Đã sử dụng</span>
                      <span>{voucher.used}/{voucher.usageLimit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(voucher.used / voucher.usageLimit) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => isApplied ? handleRemoveVoucher(voucher.id) : handleApplyVoucher(voucher)}
                    disabled={expired || !voucher.isActive}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                      expired || !voucher.isActive
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : isApplied
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                  >
                    {expired ? 'Hết hạn' : 
                     !voucher.isActive ? 'Không khả dụng' :
                     isApplied ? 'Đã áp dụng ✓' : 'Áp dụng voucher'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredVouchers.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy voucher</h3>
            <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoucherPage;