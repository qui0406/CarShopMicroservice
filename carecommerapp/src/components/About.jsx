import React, { useEffect, useRef, useState } from "react";
import { MapPin, Phone, Mail, MessageCircle, Facebook, Clock, Star, Navigation } from "lucide-react";
import { authApis, endpoints } from "../configs/APIs";

export default function About() {
  const mapRef = useRef(null);
  const shopMarkerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const leafletMapRef = useRef(null);

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);


  const userPosition = { latitude: 10.7769, longitude: 106.7009 };

  useEffect(() => {
    // Simulate API call
    const fetchShop = async () => {
      try {
        const res = await authApis().get(endpoints["showroom-info"]);
        if(res.status === 200 || res.status === 201){
          setShop(res.data.result)
        }
      } catch (error) {
        console.error("Lỗi khi lấy showroom:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, []);

  useEffect(() => {
    if (!shop || typeof window === 'undefined') return;

    // Dynamic import of Leaflet for client-side rendering
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      
      if (!leafletMapRef.current) {
        leafletMapRef.current = L.map(mapRef.current).setView(
          [shop.latitude, shop.longitude],
          15
        );

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(leafletMapRef.current);

        // Custom shop marker
        const shopIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.3);"></div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 30]
        });

        shopMarkerRef.current = L.marker([shop.latitude, shop.longitude], {
          icon: shopIcon
        })
          .addTo(leafletMapRef.current)
          .bindPopup(`
            <div style="text-align: center; font-family: 'Segoe UI', sans-serif;">
              <h3 style="margin: 0 0 5px 0; color: #333;">${shop.name}</h3>
              <p style="margin: 0; color: #666; font-size: 12px;">${shop.address}</p>
            </div>
          `)
          .openPopup();

        // User marker
        const userIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
          iconSize: [25, 25],
          iconAnchor: [12, 12]
        });

        userMarkerRef.current = L.marker(
          [userPosition.latitude, userPosition.longitude],
          { icon: userIcon }
        )
          .addTo(leafletMapRef.current)
          .bindPopup("📍 Vị trí của bạn");
      }
    };

    initMap();
  }, [shop]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Đang tải thông tin showroom...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <MapPin className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-lg text-red-600 font-medium">Không có thông tin showroom</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50" style={{paddingTop :"70px"}}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {shop.name}
              </h1>
              <p className="text-gray-500 text-sm">Thông tin showroom & liên hệ</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-indigo-600" />
                  Vị trí showroom
                </h2>
                <p className="text-gray-600 text-sm mt-1">Tìm đường đến showroom của chúng tôi</p>
              </div>
              <div 
                ref={mapRef}
                className="w-full h-96 lg:h-[500px]"
                style={{ background: '#f8fafc' }}
              />
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-indigo-600" />
                Thông tin liên hệ
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Địa chỉ</p>
                    <p className="text-gray-600 text-sm">{shop.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Điện thoại</p>
                    <a href={`tel:${shop.phone}`} className="text-green-600 text-sm font-medium hover:underline">
                      {shop.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Email</p>
                    <a href={`mailto:${shop.email}`} className="text-blue-600 text-sm font-medium hover:underline">
                      {shop.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <MessageCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Zalo</p>
                    <p className="text-blue-500 text-sm font-medium">{shop.zalo}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Facebook className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Facebook</p>
                    <a 
                      href={shop.facebook} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-blue-600 text-sm font-medium hover:underline"
                    >
                      Trang Facebook
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Images Gallery */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Hình ảnh showroom
              </h3>
              
              {shop.images && shop.images.length > 0 && (
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={shop.images[selectedImage]}
                      alt={`Showroom ${selectedImage + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Thumbnails */}
                  {shop.images.length > 1 && (
                    <div className="grid grid-cols-3 gap-2">
                      {shop.images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`aspect-video rounded-lg overflow-hidden transition-all duration-200 ${
                            selectedImage === index 
                              ? 'ring-2 ring-indigo-500 ring-offset-2' 
                              : 'hover:opacity-80'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Business Hours */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl shadow-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Giờ làm việc
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Thứ 2 - Thứ 6</span>
                  <span className="font-medium">8:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Thứ 7</span>
                  <span className="font-medium">8:00 - 12:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Chủ nhật</span>
                  <span className="font-medium">Nghỉ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}