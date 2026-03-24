import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios, { authApis, endpoints } from "./../configs/APIs";

export default function MyReserve() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const loadMyAllReserve = async () => {
    setLoading(true);
    try {
      // FETCH MOCK DATA THAY VÌ GỌI API THẬT
      const mockOrders = [
        {
          orderId: "ORD-2024-X82",
          carName: "PORSCHE 911 GT3",
          // Đổi URL ảnh đầu tiên sang URL khác ổn định hơn để tránh lỗi đen trắng tải hụt
          carImage: "https://images.unsplash.com/photo-1611016186353-9af58c69a533?q=80&w=1000&auto=format&fit=crop",
          createdAt: "2024-05-25T14:30:00Z",
          totalAmount: 500000000,
          paymentStatus: "PAID"
        },
        {
          orderId: "ORD-2024-Z91",
          carName: "TAYCAN TURBO S",
          carImage: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=1000&auto=format&fit=crop",
          createdAt: "2024-06-12T09:15:00Z",
          totalAmount: 350000000,
          paymentStatus: "PENDING"
        },
        {
          orderId: "ORD-2024-V44",
          carName: "PORSCHE MACAN",
          carImage: "https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=1000&auto=format&fit=crop",
          createdAt: "2024-04-05T10:00:00Z",
          totalAmount: 200000000,
          paymentStatus: "PAID"
        }
      ];

      setTimeout(() => {
        setOrders(mockOrders);
        setLoading(false);
      }, 700);

      // (Tắt API thật tạm thời)
      // const res = await authApis().get(endpoints["get-reserves"]);
      // if (res.status === 200 || res.status === 201) {
      //   setOrders(res.data.result || []);
      // }
    } catch (error) {
      console.error("Lỗi khi tải đơn đặt xe:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyAllReserve();
  }, []);

  // Tabs logic
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return order.paymentStatus === "PENDING";
    if (activeTab === "paid") return order.paymentStatus !== "PENDING";
    return true;
  });

  // Fallback Cars cho giao diện lộng lẫy (trong trường hợp order trả về chưa có ảnh)
  const getFallbackCar = (index) => {
    const defaultCars = [
      { name: "PORSCHE 911 GT3", img: "https://images.unsplash.com/photo-1611016186353-9af58c69a533?q=80&w=1000&auto=format&fit=crop" },
      { name: "TAYCAN TURBO S", img: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=1000&auto=format&fit=crop" },
      { name: "PORSCHE MACAN", img: "https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=1000&auto=format&fit=crop" },
    ];
    return defaultCars[index % defaultCars.length];
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0 đ";
    return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "25/05/2026"; // Mock Data fallback
    const d = new Date(dateStr);
    return isNaN(d.getTime()) 
      ? dateStr 
      : `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-24 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER & FILTER TABS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <div className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-2">
              Customer Dashboard
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Order History
            </h1>
          </div>

          <div className="bg-gray-200 p-1.5 rounded-xl flex gap-1 shadow-inner">
            <button 
              onClick={() => setActiveTab("all")}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Tất cả
            </button>
            <button 
              onClick={() => setActiveTab("pending")}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Chờ thanh toán
            </button>
            <button 
              onClick={() => setActiveTab("paid")}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'paid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Đã thanh toán
            </button>
          </div>
        </div>

        {/* LOADING & EMPTY STATE */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 font-medium animate-pulse">
            Đang tải lịch sử giao dịch...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có giao dịch nào</h3>
            <p className="text-gray-500 mb-6 font-medium">Bạn chưa có đơn đặt cọc nào trong danh mục này.</p>
            <button onClick={() => navigate("/home")} className="bg-blue-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-800 transition-colors shadow-lg">
              Khám Phá Xe Mới
            </button>
          </div>
        ) : (
          /* ORDERS LIST */
          <div className="space-y-4">
            <style>{`
              .order-card {
                display: flex;
                flex-direction: column;
                gap: 20px;
              }
              .order-car-img {
                width: 100%;
                height: 220px;
                border-radius: 12px;
                background: #111;
                position: relative;
                overflow: hidden;
                flex-shrink: 0;
              }
              .order-car-info {
                display: flex;
                width: 100%;
                flex-direction: column;
                gap: 16px;
              }
              /* MOBILE DEFAULT: Dàn dọc thẳng hàng */
              .info-center-group {
                display: flex;
                flex-direction: column;
                gap: 12px;
                width: 100%;
              }
              .text-right-pc { text-align: left; align-items: flex-start; }
              .amount-text { font-size: 1.25rem; }
              
              /* DESKTOP EXCLUSIVE */
              @media(min-width: 800px) {
                .order-card {
                  flex-direction: row;
                  align-items: center;
                }
                .order-car-img {
                  width: 280px;
                  height: 160px;
                }
                .order-car-info {
                  flex-direction: row;
                  justify-content: space-between;
                  align-items: center;
                }
                .info-center-group {
                  flex-direction: row;
                  align-items: center;
                  justify-content: space-between;
                }
                .text-right-pc { text-align: right; align-items: flex-end; }
                .amount-text { font-size: 1.5rem; }
              }
            `}</style>

            {filteredOrders.map((order, idx) => {
              const fallbackConfig = getFallbackCar(idx);
              const carName = order.carName || fallbackConfig.name;
              const carImg = order.carImage || fallbackConfig.img;
              const isPending = order.paymentStatus === "PENDING";
              
              return (
                <div key={order.orderId || idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow order-card">
                  
                  {/* IMAGE BLOCK */}
                  <div className="order-car-img group">
                     {/* Hình ảnh */}
                     <img src={carImg} alt={carName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  </div>

                  {/* INFO BLOCK */}
                  <div className="order-car-info">
                    
                    {/* Name & ID */}
                    <div style={{ flex: 1, minWidth: "220px" }}>
                       <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-1">{carName}</h3>
                       <div className="text-gray-500 text-sm font-bold tracking-wider uppercase">
                         {order.orderId ? order.orderId : "ORD-2024-X82"}
                       </div>
                    </div>
                    
                    {/* PC Center Area (Date & Amount wrap easily on mobile) */}
                    <div className="info-center-group" style={{ flex: 2 }}>
                        {/* Order Date */}
                        <div style={{ flex: 1 }}>
                           <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">
                             Order Date
                           </div>
                           <div className="text-gray-900 font-bold">
                             {formatDate(order.createdAt)}
                           </div>
                        </div>

                        {/* Amount & Status */}
                        <div style={{ flex: 1.5 }} className="flex flex-col text-right-pc">
                           <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">
                             Deposit Amount
                           </div>
                           <div className="font-black text-blue-700 tracking-tight mb-3 amount-text text-wrap break-words w-full">
                             {formatCurrency(order.totalAmount || 500000000)}
                           </div>
                           
                           <div>
                             <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm whitespace-nowrap inline-block ${
                               isPending 
                                 ? "bg-orange-100 text-orange-700" 
                                 : "bg-green-100 text-green-700"
                             }`}>
                               {isPending ? "Chờ Thanh Toán" : "Đã Thanh Toán"}
                             </span>
                           </div>
                        </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}