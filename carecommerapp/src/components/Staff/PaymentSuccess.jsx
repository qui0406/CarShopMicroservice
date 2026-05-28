import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StaffLayout from "./StaffLayout";
import { authApis, endpoints } from "../../configs/APIs";

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");
const fmtDt = (s) => new Date(s).toLocaleString("vi-VN");

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order || {};

  // If no order data, redirect back to cashier
  if (!order.orderId) {
    return (
      <StaffLayout>
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8">
          <div className="text-center p-8 bg-white border border-gray-100 rounded-2xl shadow-sm max-w-sm">
            <span className="text-5xl">⚠️</span>
            <h3 className="text-lg font-black text-gray-900 mt-4">Không tìm thấy thông tin</h3>
            <p className="text-xs text-gray-400 mt-2">Vui lòng quay lại trang Thu ngân để thực hiện giao dịch.</p>
            <button
              onClick={() => navigate("/staff/home/cashier")}
              className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors"
            >
              Quay Lại Thu Ngân
            </button>
          </div>
        </div>
      </StaffLayout>
    );
  }

  const baseAmount = order.baseAmount || order.price || 0;
  
  const isHanoi = (order.address || "").toLowerCase().includes("hà nội");
  const taxRate = isHanoi ? 0.12 : 0.10;
  const taxRatePercent = isHanoi ? 12 : 10;
  
  const taxAmount = order.taxAmount || (baseAmount * taxRate);
  const plateFeeAmount = order.plateFeeAmount || 0;
  const insuranceAmount = order.insuranceAmount || 0;
  
  const calculatedTotal = baseAmount + taxAmount + plateFeeAmount + insuranceAmount;
  const total = (order.totalAmount > baseAmount) ? order.totalAmount : calculatedTotal;

  const handleExportInvoice = async () => {
    try {
      const response = await authApis().get(endpoints["download-order-pdf"](order.orderId), {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${order.orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Xuất hóa đơn thất bại!");
    }
  };

  return (
    <StaffLayout>
      <div className="flex-1 overflow-y-auto bg-gray-100 px-8 py-10 flex flex-col items-center justify-center">
        
        {/* Receipt Container - Web Layout */}
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row animate-in fade-in zoom-in duration-500 border border-gray-100">
          
          {/* LEFT: Success State (Gradient background) */}
          <div className="lg:w-5/12 bg-gradient-to-br from-emerald-500 to-teal-700 p-12 text-white flex flex-col justify-center items-center text-center relative overflow-hidden">
            {/* Background Texture/Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-5xl font-black mb-8 shadow-inner border border-white/30 animate-bounce">
              ✓
            </div>
            
            <h2 className="text-3xl font-black mb-2 tracking-tight">Thanh Toán<br/>Thành Công!</h2>
            <p className="text-emerald-50 text-sm mb-12 leading-relaxed">Cảm ơn quý khách đã tin tưởng và giao dịch tại showroom. Chúc quý khách vạn dặm bình an!</p>
            
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 w-full text-left border border-white/10 mt-auto">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200 mb-1">Mã Giao Dịch</p>
              <p className="text-xl font-mono font-bold tracking-wider">#{order.orderId.slice(-8).toUpperCase()}</p>
            </div>
          </div>

          {/* RIGHT: Invoice Details */}
          <div className="lg:w-7/12 p-10 lg:p-12 flex flex-col bg-white">
             <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Chi Tiết Hóa Đơn</h3>
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Đã Thanh Toán</span>
             </div>

             {/* Customer Info Grid */}
             <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Khách Hàng</p>
                 <p className="text-sm font-bold text-gray-900">{order.fullName || "—"}</p>
               </div>
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Số Điện Thoại</p>
                 <p className="text-sm font-mono font-bold text-gray-700">{order.phone || "—"}</p>
               </div>
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Thời Gian</p>
                 <p className="text-sm font-medium text-gray-700">{order.createdAt ? fmtDt(order.createdAt) : fmtDt(new Date())}</p>
               </div>
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Phương thức</p>
                 <p className="text-sm font-bold text-blue-600">{order.paymentMethod || "CASH"}</p>
               </div>
               {order.address && (
                 <div className="col-span-2">
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Địa Chỉ</p>
                   <p className="text-sm font-medium text-gray-700">{order.address}</p>
                 </div>
               )}
             </div>

             {/* Order Table */}
             <div className="border border-gray-100 rounded-2xl overflow-hidden mb-10 shadow-sm">
               <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Sản phẩm / Dịch vụ</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Thành tiền</p>
               </div>
               
               <div className="px-6 py-5 flex justify-between items-center border-b border-gray-50">
                 <div>
                   <p className="text-sm font-black text-gray-900">{order.carName || "—"}</p>
                   <p className="text-[10px] font-medium text-gray-400 mt-1">Số lượng: 01 chiếc</p>
                 </div>
                 <p className="text-sm font-mono font-bold text-gray-900">{fmt(baseAmount)} ₫</p>
               </div>
               
               <div className="px-6 py-3.5 flex justify-between items-center border-b border-gray-50 bg-gray-50/50">
                 <p className="text-xs font-medium text-gray-500">Lệ phí trước bạ ({taxRatePercent}%)</p>
                 <p className="text-xs font-mono font-bold text-gray-700">{fmt(taxAmount)} ₫</p>
               </div>

               {plateFeeAmount > 0 && (
                 <div className="px-6 py-3.5 flex justify-between items-center border-b border-gray-50 bg-gray-50/50">
                   <p className="text-xs font-medium text-gray-500">Phí cấp biển số</p>
                   <p className="text-xs font-mono font-bold text-gray-700">{fmt(plateFeeAmount)} ₫</p>
                 </div>
               )}

               {insuranceAmount > 0 && (
                 <div className="px-6 py-3.5 flex justify-between items-center border-b border-gray-50 bg-gray-50/50">
                   <p className="text-xs font-medium text-gray-500">Bảo hiểm & bảo trì ĐB</p>
                   <p className="text-xs font-mono font-bold text-gray-700">{fmt(insuranceAmount)} ₫</p>
                 </div>
               )}
               
               {order.depositAmount > 0 && (
                 <div className="px-6 py-3.5 flex justify-between items-center border-b border-amber-100/50 bg-amber-50/30">
                   <p className="text-xs font-bold text-amber-600">Đã trừ tiền cọc</p>
                   <p className="text-xs font-mono font-bold text-amber-600">- {fmt(order.depositAmount)} ₫</p>
                 </div>
               )}
               
               <div className="px-6 py-6 bg-blue-50/50 flex justify-between items-center border-t border-blue-100">
                 <p className="text-sm font-black uppercase tracking-widest text-blue-800">Tổng Thanh Toán</p>
                 <div className="text-right">
                   <p className="text-3xl font-mono font-black text-blue-700 tracking-tight">{fmt(total)}</p>
                   <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-0.5">Việt Nam Đồng</p>
                 </div>
               </div>
             </div>

             {/* Action Buttons */}
             <div className="flex gap-4 mt-auto">
               <button
                 onClick={() => navigate("/staff/home/cashier")}
                 className="flex-1 py-4 border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200"
               >
                 Quay Lại Thu Ngân
               </button>
               <button
                 onClick={handleExportInvoice}
                 className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-[0_8px_16px_-6px_rgba(37,99,235,0.4)] hover:shadow-[0_12px_20px_-8px_rgba(37,99,235,0.6)] transition-all duration-200 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
               >
                 <span>📄</span> Xuất Hóa Đơn PDF
               </button>
             </div>

          </div>
        </div>

      </div>
    </StaffLayout>
  );
}
