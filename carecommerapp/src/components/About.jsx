import React, { useEffect, useRef, useState } from "react";
import { MapPin, Phone, Mail, Clock, Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";

export default function About() {
  const mapRef = useRef(null);
  const shopMarkerRef = useRef(null);
  const leafletMapRef = useRef(null);

  const [L, setL] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  const shop = {
    name: "CarShop",
    slogan: "Đẳng cấp kiến tạo từ sự khác biệt. Nơi đam mê tốc độ và sự hoàn mỹ gặp gỡ.",
    phone: "033 751 8997",
    email: "anhqui04062004@gmail.com",
    zalo: "033 751 8997",
    facebook: "https://facebook.com/showabc",
    images: [
      "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=2000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503376710356-6cb021d7bfa0?q=80&w=2000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=2000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2000&auto=format&fit=crop"
    ]
  };

  const branches = [
    {
      id: 1,
      name: "Porsche Centre Saigon",
      address: "123 Nguyễn Văn Linh, P. Tân Thuận Tây, Quận 7, TP.HCM",
      latitude: 10.7769,
      longitude: 106.7009,
      phone: "033 751 8997",
    },
    {
      id: 2,
      name: "Porsche Centre Q2",
      address: "456 Mai Chí Thọ, P. An Phú, Quận 2, TP.HCM",
      latitude: 10.7981,
      longitude: 106.7424,
      phone: "033 751 8998",
    },
    {
      id: 3,
      name: "Porsche Centre Hà Nội",
      address: "789 Phạm Hùng, Nam Từ Liêm, Hà Nội",
      latitude: 21.0205,
      longitude: 105.7820,
      phone: "033 751 8999",
    }
  ];

  const [activeBranch, setActiveBranch] = useState(branches[0]);

  // Image Slider Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      setSelectedImage((prev) => (prev + 1) % shop.images.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [shop.images.length]);

  // Load Leaflet dynamically
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const initMap = async () => {
      const leaflet = (await import('leaflet')).default;
      setL(leaflet);
    };
    initMap();
  }, []);

  // Update Map Location
  useEffect(() => {
    if (!L || !mapRef.current) return;

    if (!leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current, { zoomControl: false }).setView(
        [activeBranch.latitude, activeBranch.longitude], 15
      );

      // Clean, minimal CartoDB map style for luxury vibe
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(leafletMapRef.current);

      L.control.zoom({ position: 'bottomright' }).addTo(leafletMapRef.current);
    }

    if (shopMarkerRef.current) {
      leafletMapRef.current.removeLayer(shopMarkerRef.current);
    }

    const customIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background: linear-gradient(135deg, #0056b3 0%, #004494 100%); width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 4px 12px rgba(0,86,179,0.4);"></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    shopMarkerRef.current = L.marker([activeBranch.latitude, activeBranch.longitude], { icon: customIcon })
      .addTo(leafletMapRef.current)
      .bindPopup(`
        <div style="font-family: 'Inter', sans-serif; text-align: center; padding: 4px;">
          <h4 style="margin: 0 0 6px 0; color: #111; font-weight: 800; font-size: 14px;">${activeBranch.name}</h4>
          <p style="margin: 0; color: #555; font-size: 12px; line-height: 1.4;">${activeBranch.address}</p>
        </div>
      `)
      .openPopup();

    leafletMapRef.current.flyTo([activeBranch.latitude, activeBranch.longitude], 15, {
      animate: true,
      duration: 1.5
    });

  }, [L, activeBranch]);

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-['Inter',_sans-serif]">

      {/* 1. HERO SECTION */}
      <div className="relative w-full h-[600px] bg-black overflow-hidden mt-[70px]">
        {shop.images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt="Showroom display"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === selectedImage ? 'opacity-90' : 'opacity-0'}`}
          />
        ))}
        {/* Luxury gradient overlay to make text pop */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/80"></div>

        <div className="absolute inset-0 max-w-7xl mx-auto px-4 lg:px-6 h-full flex flex-col justify-center items-end">
          <div className="max-w-md w-full backdrop-blur-xl bg-white/10 p-8 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] border border-white/20 transform translate-y-8 animate-fade-in-up">
            <h1 className="text-4xl font-black text-white mb-3 uppercase tracking-tight antialiased drop-shadow-md">{shop.name}</h1>
            <p className="text-gray-200 font-medium mb-8 leading-relaxed antialiased">{shop.slogan}</p>
            <div className="flex gap-4">
              <a href={`tel:${shop.phone}`} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2">
                <Phone size={18} /> Gọi Ngay
              </a>
              <a href={`https://maps.google.com/?q=${activeBranch.latitude},${activeBranch.longitude}`} target="_blank" rel="noreferrer" className="flex-1 backdrop-blur-md bg-white/20 hover:bg-white/30 text-white font-bold py-4 rounded-xl border-2 border-white/50 transition-all flex items-center justify-center gap-2">
                <Navigation size={18} /> Chỉ Đường
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CONTACT GRID (3 Flat Columns) */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12 relative z-10 -mt-10">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1: Hotline & Zalo */}
          <div className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-200/50 flex flex-col gap-5 border border-gray-100/50 hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0056b3] to-[#003875] flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Phone size={26} />
            </div>
            <div>
              <h3 className="text-gray-400 font-bold text-[0.7rem] uppercase tracking-[2px] mb-2">Đường Dây Nóng</h3>
              <div className="font-extrabold text-gray-900 text-xl">{shop.phone}</div>
              <div className="text-blue-600 font-bold text-sm mt-1 flex items-center gap-1">Zalo Hỗ Trợ: {shop.zalo}</div>
            </div>
          </div>

          {/* Card 2: Social & Mail */}
          <div className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-200/50 flex flex-col gap-5 border border-gray-100/50 hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8a2387] via-[#e94057] to-[#f27121] flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
              <Mail size={26} />
            </div>
            <div>
              <h3 className="text-gray-400 font-bold text-[0.7rem] uppercase tracking-[2px] mb-2">Kênh Thư Tín & Mạng Xã Hội</h3>
              <div className="font-extrabold text-gray-900 text-lg truncate">{shop.email}</div>
              <a href={shop.facebook} className="text-[#8a2387] font-bold text-sm mt-1 hover:underline truncate inline-block">Facebook Official Page</a>
            </div>
          </div>

          {/* Card 3: Working Hours */}
          <div className="bg-white rounded-2xl p-8 shadow-xl shadow-gray-200/50 flex flex-col gap-5 border border-gray-100/50 hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#11998e] to-[#38ef7d] flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <Clock size={26} />
            </div>
            <div>
              <h3 className="text-gray-400 font-bold text-[0.7rem] uppercase tracking-[2px] mb-2">Giờ Hoạt Động Showroom</h3>
              <div className="font-extrabold text-gray-900 text-xl">08:00 - 18:00</div>
              <div className="text-emerald-600 font-bold text-sm mt-1">Thứ 2 - Thứ 7 (Nghỉ Chủ Nhật)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2.5 SHOWROOM GALLERY */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Không Gian Trưng Bày</h2>
          <div className="w-16 h-1.5 bg-[#0056b3] rounded-full mx-auto mt-4 mb-4"></div>
          <p className="text-gray-500 max-w-2xl mx-auto font-medium">Tận hưởng trải nghiệm mua sắm đẳng cấp với khu vực trưng bày hiện đại, phòng khách VIP và không gian giao xe độc quyền mang đậm tinh thần DNA của thương hiệu.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:grid-rows-2 h-auto md:h-[500px]">
          {/* Ảnh Lớn (Span 2 cols, 2 rows) */}
          <div className="md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden group h-[300px] md:h-auto shadow-lg">
            <img src={shop.images[0]} alt="Showroom Main" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
              <div className="text-white font-black text-2xl uppercase tracking-wider mb-1">Khu trưng bày siêu xe</div>
              <div className="text-gray-300 text-sm font-medium">Hơn 50+ mẫu xe hiệu suất cao thế hệ mới.</div>
            </div>
          </div>

          {/* Ảnh nhỏ 1 */}
          <div className="md:col-span-1 md:row-span-1 relative rounded-3xl overflow-hidden group h-[200px] md:h-auto shadow-lg">
            <img src={shop.images[1]} alt="Showroom Interior" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
          </div>

          {/* Ảnh nhỏ 2 */}
          <div className="md:col-span-1 md:row-span-1 relative rounded-3xl overflow-hidden group h-[200px] md:h-auto shadow-lg">
            <img src={shop.images[2]} alt="Showroom Configurator" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
          </div>

          {/* Ảnh ngang rộng dưới cùng (Span 2 cols) */}
          <div className="md:col-span-2 md:row-span-1 relative rounded-3xl overflow-hidden group h-[250px] md:h-auto shadow-lg">
            <img src={shop.images[3]} alt="VIP Lounge" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
              <div className="text-white font-black text-xl uppercase tracking-wider mb-1">Khu vực Lounge VIP</div>
              <div className="text-gray-300 text-sm font-medium">Thưởng thức Coffee Premium trong lúc chờ bảo dưỡng.</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. LOCATION & BRANCHES (Split Layout) */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-10 pb-24">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Hệ Thống Chi Nhánh</h2>
          <div className="w-16 h-1.5 bg-[#0056b3] rounded-full mx-auto mt-4"></div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">

          {/* Left: Branches List (1/3) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {branches.map(b => (
              <div
                key={b.id}
                onClick={() => setActiveBranch(b)}
                className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${activeBranch.id === b.id
                    ? 'border-[#0056b3] bg-blue-50/40 shadow-xl shadow-blue-100/50'
                    : 'border-transparent bg-white hover:border-gray-200 shadow-sm'
                  }`}
              >
                <h4 className={`font-extrabold text-lg mb-3 ${activeBranch.id === b.id ? 'text-[#0056b3]' : 'text-gray-900'}`}>{b.name}</h4>
                <div className="flex gap-3 items-start text-[0.85rem] text-gray-600 mb-3 leading-relaxed font-medium">
                  <MapPin size={18} className="mt-0.5 flex-shrink-0 text-gray-400" />
                  <p>{b.address}</p>
                </div>
                <div className="flex gap-3 items-center text-[0.85rem] font-bold text-gray-800">
                  <Phone size={16} className="text-gray-400" />
                  <span>{b.phone}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Map (2/3) */}
          <div className="lg:col-span-8 bg-white p-2 rounded-3xl shadow-2xl shadow-gray-200/60 border border-gray-100 h-[500px] overflow-hidden relative">
            <div ref={mapRef} className="w-full h-full rounded-2xl z-0" style={{ background: '#f8fafc' }}></div>
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white font-bold text-[#0056b3] text-xs uppercase tracking-wider z-[1000] pointer-events-none">
              Đang hiển thị vệ tinh: {activeBranch.name}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}