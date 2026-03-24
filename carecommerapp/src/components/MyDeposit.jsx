import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios, { authApis, endpoints } from "./../configs/APIs";
import { FaUser, FaFileAlt, FaCopy, FaDownload, FaHeadset, FaTruck, FaShieldAlt, FaCheckCircle, FaClock } from "react-icons/fa";

export default function MyDeposit() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadMyAllDeposit = async () => {
        setLoading(true);
        try {
            // MOCK DATA
            const mockDeposits = [
                {
                    orderId: "ORD-A789",
                    fullName: "Nguyễn Văn A",
                    username: "@vipro",
                    address: "123 Đường Số 1, Phường 2, Quận 3, TP.HCM",
                    quantity: 1,
                    totalAmount: 18500000000,
                    disposableAmount: 500000000,
                    remainAmount: 18000000000,
                    transactionId: "VNP12345678",
                    createdAt: "2024-05-25T14:30:00Z",
                    paymentStatus: "PAID",
                    carName: "PRECISION GT SPECTRE",
                    carImage: "https://images.unsplash.com/photo-1544885834-de52eeb25712?q=80&w=1000&auto=format&fit=crop"
                }
            ];

            setTimeout(() => {
                setOrders(mockDeposits);
                setLoading(false);
            }, 600);
        } catch (error) {
            console.error("Lỗi khi tải đơn đặt xe:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMyAllDeposit();
    }, []);

    const formatCurrency = (amount) => {
        if (!amount) return "0 đ";
        return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
    };

    const formatDateTime = (isoDate) => {
        const date = new Date(isoDate);
        if (isNaN(date.getTime())) return "25/05/2024 14:30";
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-24 px-4 font-sans">
            <style>{`
                .deposit-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                .deposit-left {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    width: 100%;
                }
                .deposit-right {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    width: 100%;
                }
                .finance-row {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 16px;
                }
                .info-row {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 24px;
                }
                .car-banner {
                    width: 100%;
                    height: 280px;
                    position: relative;
                    border-radius: 20px;
                    overflow: hidden;
                    background: #111;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .header-group {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    align-items: flex-start;
                    margin-bottom: 32px;
                }
                @media(min-width: 768px) {
                    .finance-row { grid-template-columns: 1fr 1fr 1fr; }
                    .info-row { grid-template-columns: 1fr 1fr; }
                    .header-group {
                        flex-direction: row;
                        align-items: center;
                        justify-content: space-between;
                    }
                }
                @media(min-width: 1024px) {
                    .deposit-grid { flex-direction: row; }
                    .deposit-left { flex: 1; }
                    .deposit-right { width: 340px; min-width: 340px; }
                    .car-banner { height: 360px; }
                }
            `}</style>
            
            <div className="max-w-6xl mx-auto flex flex-col gap-12">
                {loading ? (
                    <div className="text-center py-20 text-gray-500 font-medium animate-pulse">
                        Đang tải chi tiết đặt cọc...
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có giao dịch nào</h3>
                        <p className="text-gray-500 mb-6 font-medium">Bạn chưa có đơn đặt cọc nào.</p>
                        <button onClick={() => navigate("/home")} className="bg-blue-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-800 transition-colors shadow-lg">
                            Khám Phá Xe Mới
                        </button>
                    </div>
                ) : (
                    orders.map((order, idx) => {
                        const isPaid = order.paymentStatus === "PAID" || order.paymentStatus === "Thành công";
                        const carImg = order.carImage || "https://images.unsplash.com/photo-1544885834-de52eeb25712?q=80&w=1000&auto=format&fit=crop";
                        const carName = order.carName || "PORSCHE 911 GT3";

                        return (
                            <div key={order.orderId || idx} className="bg-transparent">
                                
                                {/* TOP HEADER */}
                                <div className="header-group px-2">
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900 flex items-center gap-4 tracking-tight">
                                            <span onClick={() => navigate(-1)} className="cursor-pointer hover:text-blue-600 transition-all text-2xl md:hidden">←</span>
                                            Chi tiết đặt cọc
                                        </h2>
                                        <p className="text-gray-500 mt-2 font-medium text-sm ml-10 md:ml-0">Theo dõi trạng thái và thông tin thanh toán xe của bạn</p>
                                    </div>
                                    <div>
                                        <span className={`px-4 py-2 flex items-center justify-center gap-2 rounded-full text-xs font-black uppercase tracking-widest shadow-sm border ${
                                            isPaid ? 'bg-green-50 text-green-700 border-green-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                                        }`}>
                                            {isPaid ? <FaCheckCircle className="text-green-500" /> : <FaClock className="text-orange-500" />} 
                                            {isPaid ? "ĐÃ THANH TOÁN" : "CHỜ THANH TOÁN"}
                                        </span>
                                    </div>
                                </div>

                                <div className="deposit-grid">
                                    {/* LEFT COL */}
                                    <div className="deposit-left">
                                        
                                        {/* FINANCE SUMMARY */}
                                        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Tóm tắt tài chính</h3>
                                            <div className="finance-row">
                                                <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex flex-col justify-center">
                                                    <div className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-2">Số tiền đặt cọc</div>
                                                    <div className="text-2xl font-black text-blue-700 break-words">{formatCurrency(order.disposableAmount || 500000000)}</div>
                                                </div>
                                                <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl flex flex-col justify-center">
                                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Số tiền còn lại</div>
                                                    <div className="text-xl font-black text-gray-900 break-words">{formatCurrency(order.remainAmount || 18000000000)}</div>
                                                </div>
                                                <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl flex flex-col justify-center">
                                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Tổng tiền</div>
                                                    <div className="text-xl font-black text-gray-900 break-words">{formatCurrency(order.totalAmount || 18500000000)}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* DETAILS GRID */}
                                        <div className="info-row">
                                            {/* CUSTOMER INFO */}
                                            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-3 mb-8">
                                                    <FaUser className="text-blue-600 text-lg"/> Thông tin khách hàng
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center text-sm gap-4 border-b border-gray-50 pb-3">
                                                        <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Họ tên</span>
                                                        <span className="font-bold text-gray-900 text-right">{order.fullName || "Nguyễn Văn A"}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm gap-4 border-b border-gray-50 pb-3">
                                                        <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Username</span>
                                                        <span className="font-bold text-blue-600 text-right">{order.username || "@vipro"}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm gap-4 border-b border-gray-50 pb-3">
                                                        <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Số lượng</span>
                                                        <span className="font-bold text-gray-900 text-right">{String(order.quantity || 1).padStart(2,'0')} chiếc</span>
                                                    </div>
                                                    <div className="flex flex-col gap-2 text-sm pt-2">
                                                        <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Địa chỉ</span>
                                                        <span className="font-bold text-gray-900 leading-relaxed">{order.address || "123 Đường Số 1, Phường 2, Quận 3, TP.HCM"}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* TECH INFO */}
                                            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-3 mb-8">
                                                    <FaFileAlt className="text-blue-600 text-lg"/> Thông tin kỹ thuật
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center text-sm gap-4 border-b border-gray-50 pb-3">
                                                        <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Mã đơn hàng</span>
                                                        <span className="font-black text-gray-900 tracking-wider">#{order.orderId || "ORD-A789"}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm gap-4 border-b border-gray-50 pb-3">
                                                        <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Ngày tạo đơn</span>
                                                        <span className="font-bold text-gray-900 text-right">{formatDateTime(order.createdAt)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm gap-4 pt-2">
                                                        <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Mã giao dịch</span>
                                                        <span className="font-bold text-gray-900 flex items-center gap-2 group text-right">
                                                            {order.transactionId || "VNP12345678"} 
                                                            <FaCopy className="text-gray-300 group-hover:text-blue-600 cursor-pointer transition-colors" title="Copy mã giao dịch"/>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* CAR BANNER */}
                                        <div className="car-banner group">
                                            <img src={carImg} alt="Car" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                                            <div className="absolute bottom-0 left-0 p-8 w-full z-10">
                                                <div className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2 drop-shadow-md">Cấu hình đã chọn</div>
                                                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-5 drop-shadow-lg">{carName}</h2>
                                                <div className="flex gap-3">
                                                    <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl text-xs font-black text-white uppercase tracking-widest border border-white/10 shadow-sm">V12 Hybrid</span>
                                                    <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl text-xs font-black text-white uppercase tracking-widest border border-white/10 shadow-sm">Onyx Black</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* RIGHT COL */}
                                    <div className="deposit-right">
                                        
                                        {/* ACTIONS */}
                                        <div className="space-y-4">
                                            <button className="w-full bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:bg-blue-800 transition transform hover:-translate-y-0.5">
                                                <FaDownload className="text-lg"/> Tải hóa đơn PDF
                                            </button>
                                            <button className="w-full bg-white text-blue-700 border-2 border-blue-100 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-50 transition transform hover:-translate-y-0.5">
                                                <FaHeadset className="text-lg"/> Liên hệ tư vấn
                                            </button>
                                        </div>

                                        {/* SHIPPING INFO */}
                                        <div className="bg-gray-100/60 p-7 rounded-3xl border border-gray-200 shadow-sm">
                                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Chi tiết vận chuyển</h3>
                                            
                                            <div className="flex gap-4 mb-7">
                                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0 shadow-sm">
                                                    <FaTruck className="text-blue-600 text-xl" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900 mb-1 leading-none pt-1">Giao xe tận nhà</div>
                                                    <div className="text-xs text-gray-500 leading-relaxed font-medium mt-1.5">Dự kiến hoàn tất thủ tục trong 15-20 ngày làm việc.</div>
                                                </div>
                                            </div>
                                            <div className="w-full h-px bg-gray-200 mb-6"></div>
                                            <div className="flex gap-4">
                                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0 shadow-sm">
                                                    <FaShieldAlt className="text-blue-600 text-xl" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900 mb-1 leading-none pt-1">Bảo hiểm 2 năm</div>
                                                    <div className="text-xs text-gray-500 leading-relaxed font-medium mt-1.5">Đã bao gồm gói bảo hiểm vật chất cao cấp Diamond.</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}