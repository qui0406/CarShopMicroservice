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

  const tax = (order.price || 0) * 0.1;
  const total = (order.price || 0) + tax;

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
      <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-8 flex flex-col items-center">
        
        {/* Receipt Container */}
        <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-500">
          
          {/* Header Accent */}
          <div className="h-3 bg-gradient-to-r from-emerald-400 via-teal-500 to-blue-500" />

          {/* Success Banner */}
          <div className="px-8 pt-8 pb-6 text-center border-b border-gray-50 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-3xl font-black mb-4 shadow-sm border border-emerald-100 animate-bounce">
              ✓
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Giao Dịch Thành Công</p>
            <h2 className="text-2xl font-black text-gray-900 leading-tight">HÓA ĐƠN BÁN HÀNG</h2>
            <p className="text-[10px] font-mono text-gray-400 mt-1">SỐ: #{order.orderId.slice(-8).toUpperCase()}</p>
          </div>

          {/* Customer & Order Details */}
          <div className="px-8 py-6 space-y-4 flex-1">
            
            {/* Showroom receipt design elements */}
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Khách Hàng</span>
                <span className="text-xs font-bold text-gray-900 text-right">{order.fullName || "—"}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Số Điện Thoại</span>
                <span className="text-xs font-mono font-bold text-gray-700 text-right">{order.phone || "—"}</span>
              </div>
              {order.address && (
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Địa Chỉ</span>
                  <span className="text-xs font-medium text-gray-600 text-right max-w-[180px]">{order.address}</span>
                </div>
              )}
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Thời Gian</span>
                <span className="text-xs font-medium text-gray-600 text-right">{order.createdAt ? fmtDt(order.createdAt) : fmtDt(new Date())}</span>
              </div>
            </div>

            {/* Separator line */}
            <div className="border-t border-dashed border-gray-200 py-1" />

            {/* Product Summary */}
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-black text-gray-900">{order.carName || "—"}</p>
                  <p className="text-[9px] font-bold text-gray-400 mt-0.5">SỐ LƯỢNG: 01 chiếc</p>
                </div>
                <span className="text-xs font-bold font-mono text-gray-900">{fmt(order.price)} VND</span>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Thuế (10%)</span>
                <span className="text-xs font-bold font-mono text-gray-700">{fmt(tax)} VND</span>
              </div>

              {order.depositAmount > 0 && (
                <div className="flex justify-between items-center text-amber-600">
                  <span className="text-[10px] font-black uppercase tracking-widest">Đã Trừ Tiền Cọc</span>
                  <span className="text-xs font-bold font-mono">- {fmt(order.depositAmount)} VND</span>
                </div>
              )}
            </div>

            {/* Separator line */}
            <div className="border-t border-dashed border-gray-200 py-1" />

            {/* Total Block */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Tổng Tiền Đã Thanh Toán</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Phương thức: {order.paymentMethod || "CASH"}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-blue-600 font-mono">{fmt(total)}</p>
                <p className="text-[9px] text-gray-400 font-bold">VND</p>
              </div>
            </div>
            
          </div>

          {/* Action Buttons */}
          <div className="px-8 pb-8 space-y-2">
            <button
              onClick={handleExportInvoice}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              <span>📄</span> Xuất Hóa Đơn PDF (In)
            </button>
            <button
              onClick={() => navigate("/staff/home/cashier")}
              className="w-full py-3 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-black uppercase tracking-widest rounded-2xl transition-colors"
            >
              Quay Lại Thu Ngân
            </button>
          </div>

        </div>

      </div>
    </StaffLayout>
  );
}
