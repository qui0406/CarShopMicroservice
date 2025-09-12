import React, { useState, useEffect, useContext } from "react";

import { useParams } from "react-router-dom";
import Hero from "./Layouts/Hero";
import axios, { authApis, endpoints } from "./../configs/APIs";
import "./../styles/Home.css";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import {MyUserContext } from "./../configs/MyContexts"

export default function About() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [carImages, setCarImages] = useState([]);
  const [products, setProducts]= useState(true)
  const user = useContext(MyUserContext);

  const Link = ({ to, children, className }) => (
    <a href={to} className={className} onClick={(e) => {e.preventDefault(); console.log('Navigate to:', to);}}>
      {children}
    </a>
  );

  const fetchCarDetails = async () => {
    try {
      const res = await axios.get(endpoints["get-car-by-id"](id));
      console.log("Response from API:", res);
      console.log("Car details fetched:", res.data);
      setCar(res.data.result);
      setCarImages(res.data.result.images || []);
      console.log("Car images:", res.data.result.images);
    } catch (error) {
      console.error("Error fetching car details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarDetails();
  }, [id]);


  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + " VNĐ";
  };

  const formatYear = (dateString) => {
    return new Date(dateString).getFullYear();
  };

    const handleBookNow = () => {
    sessionStorage.setItem("car", JSON.stringify(car));

    if (!user) {
      navigate(`/login?next=/reserve`, { state: { car } });
    } else {
      navigate("/reserve", { state: { car } });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-medium">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 mx-auto">
            <span className="text-3xl">🚗</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Car not found</h2>
          <p className="text-gray-600 mb-6">Sorry, the car you're looking for doesn't exist.</p>
          <Link 
            to="/" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50" style={{paddingTop: "70px"}}>
      

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="aspect-video bg-gray-100">
                {carImages.length > 0 ? (
                  <img 
                    src={carImages[selectedImage]} 
                    alt={`${car.carModel} - Image ${selectedImage + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/800x600?text=Image+Not+Found";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl text-gray-400">🚗</span>
                  </div>
                )}
              </div>
              
              {/* Thumbnails */}
              {carImages.length > 1 && (
                <div className="p-4 bg-gray-50">
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {carImages.map((img, index) => (
                      <button
                        key={index}
                        className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden transition-all duration-200 ${
                          selectedImage === index 
                            ? 'ring-3 ring-blue-500 ring-offset-2' 
                            : 'hover:ring-2 hover:ring-gray-300'
                        }`}
                        onClick={() => setSelectedImage(index)}
                      >
                        <img 
                          src={img} 
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/80x60?text=Error";
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <span className="text-3xl">🔍</span>
                Tổng quan
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-gray-600 text-sm">Năm sản xuất</p>
                      <p className="font-semibold text-lg">{formatYear(car.year)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-gray-600 text-sm">Hộp số</p>
                      <p className="font-semibold text-lg">{car.carService?.hopSo || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-gray-600 text-sm">Loại nhiên liệu</p>
                      <p className="font-semibold text-lg">{car.carService?.loaiNhienLieu || "N/A"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-gray-600 text-sm">Động cơ</p>
                      <p className="font-semibold text-lg">{car.carService?.dongCo || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-gray-600 text-sm">Loại ghế</p>
                      <p className="font-semibold text-lg">{car.carFeature?.carComfortResponse?.ghe || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-gray-600 text-sm">Thương hiệu</p>
                      <p className="font-semibold text-lg">{car.carBranch}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <span className="text-3xl">⚡</span>
                Công nghệ chi tiết
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {[
                    { label: "Dung tích xi lanh", value: car.carService?.dungTichXiLanh ? `${car.carService.dungTichXiLanh}L` : "N/A" },
                    { label: "Công suất", value: car.carService?.congSuat ? `${car.carService.congSuat} HP` : "N/A" },
                    { label: "Momen xoắn", value: car.carService?.momenXoan ? `${car.carService.momenXoan} Nm` : "N/A" }
                  ].map((spec, index) => (
                    <div key={index} className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-600">{spec.label}</span>
                      <span className="font-semibold">{spec.value}</span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3">
                  {[
                    { label: "Dung tích bình xăng", value: car.carService?.dungTichXang ? `${car.carService.dungTichXang}L` : "N/A" },
                    { label: "Tốc độ tối đa", value: car.carService?.tocDoToiDa ? `${car.carService.tocDoToiDa} km/h` : "N/A" },
                    { label: "Tải trọng", value: car.carService?.taiTrong ? `${car.carService.taiTrong} kg` : "N/A" }
                  ].map((spec, index) => (
                    <div key={index} className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-600">{spec.label}</span>
                      <span className="font-semibold">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <span className="text-3xl">✨</span>
                Đặc tính
              </h2>
              
              {/* Comfort Features */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  Nội thất
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { check: car.carFeature?.carComfortResponse?.mayDieuHoa, label: "Máy điều hòa", icon: "❄️" },
                    { check: car.carFeature?.carComfortResponse?.manHinh, label: `${car.carFeature?.carComfortResponse?.manHinh || "Display"} Screen`, icon: "📺" },
                    { check: car.carFeature?.carComfortResponse?.sacKhongDay, label: "Sạc điện thoại", icon: "🔋" },
                    { check: car.carFeature?.carComfortResponse?.copDien, label: "Cốp xe", icon: "🔌" },
                    { check: car.carFeature?.carComfortResponse?.bluetooth, label: "Bluetooth", icon: "📱" },
                    { check: car.carFeature?.carComfortResponse?.gps, label: "Định vị GPS", icon: "🗺️" }
                  ].filter(feature => feature.check).map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                      <span className="text-xl">{feature.icon}</span>
                      <span className="text-green-800 font-medium">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exterior Features */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  Ngoại thất
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { check: car.carFeature?.carExteriorResponse?.den, label: `${car.carFeature?.carExteriorResponse?.den || "Headlights"}`, icon: "💡" },
                    { check: car.carFeature?.carExteriorResponse?.smartKey, label: "Smart Key", icon: "🔑" },
                    { check: car.carFeature?.carExteriorResponse?.guongDien, label: "Gương", icon: "🪞" }
                  ].filter(feature => feature.check).map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                      <span className="text-xl">{feature.icon}</span>
                      <span className="text-blue-800 font-medium">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Features */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  Các tính năng an toàn
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { check: car.carFeature?.featureSafetyResponse?.tuiKhi, label: "Túi khí", icon: "🎈" },
                    { check: car.carFeature?.featureSafetyResponse?.camera, label: "Camera sau", icon: "📷" },
                    { check: car.carFeature?.featureSafetyResponse?.camBienDoXe, label: "Cảm biến đổ xe", icon: "📡" },
                    { check: car.carFeature?.featureSafetyResponse?.canBangDienTu, label: "Cân bằng điện tử", icon: "⚖️" },
                    { check: car.carFeature?.featureSafetyResponse?.hoTroGiuLan, label: "Hỗ trợ giữ làng", icon: "🛣️" }
                  ].filter(feature => feature.check).map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                      <span className="text-xl">{feature.icon}</span>
                      <span className="text-red-800 font-medium">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {formatPrice(car.price)}
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <button 
                  onClick={handleBookNow}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  Đặt hàng
                </button>
                <button className="w-full border-2 border-blue-600 text-blue-600 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                  Liên hệ
                </button>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Thông tin</h3>
                
                <div className="space-y-3">
                  {[
                    { label: "Dòng xe", value: car.carModel },
                    { label: "Năm sản xuất", value: formatYear(car.year) },
                    { label: "Hộp số", value: car.carService?.hopSo || "N/A" },
                    { label: "Loại nhiên liệu", value: car.carService?.loaiNhienLieu || "N/A" },
                    { label: "Động cơ", value: car.carService?.dongCo || "N/A" },
                    { label: "Thương hiệu", value: car.carBranch }
                  ].map((spec, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-xl">{spec.icon}</span>
                      <div className="flex-1">
                        <span className="text-gray-600 text-sm">{spec.label}: </span>
                        <span className="font-medium">{spec.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                  {products ? "Còn hàng" : "Hết hàng"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

