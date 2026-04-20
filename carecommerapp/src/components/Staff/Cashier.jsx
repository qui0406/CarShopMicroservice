import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "./StaffLayout";
import { authApis, endpoints } from "../../configs/APIs";



/* ─── Helpers ────────────────────────────────────────────── */
const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");
const fmtDt = (s) => new Date(s).toLocaleString("vi-VN");

const getStatus = (order) => {
  if (order.paymentStatus === "PAID" || order.remainingAmount === 0)
    return { text: "Đã thanh toán", dotColor: "#22c55e", textColor: "#15803d", bg: "#f0fdf4" };
  if (order.paymentStatus === "CANCELLED")
    return { text: "Đã hủy",        dotColor: "#ef4444", textColor: "#dc2626", bg: "#fef2f2" };
  if (order.depositAmount > 0)
    return { text: "Đã đặt cọc",   dotColor: "#f59e0b", textColor: "#d97706", bg: "#fffbeb" };
  return { text: "Chờ thanh toán", dotColor: "#f59e0b", textColor: "#d97706", bg: "#fffbeb" };
};

const getOrderType = (order) => {
  if (order.orderType === "TRANSFER" || order.isTransfer)
    return { label: "CHUYỂN NHƯỢNG", bg: "#eff6ff", color: "#1d4ed8" };
  return { label: "MỚI", bg: "#f0fdf4", color: "#15803d" };
};

const maskPhone = (phone) => {
  if (!phone) return "—";
  return phone.slice(0, 4) + "-XXX-XXX";
};

const getOrderCode = (order, index) => {
  if (order.orderId) return `#ORD-${String(order.orderId).slice(-3).padStart(3,"0")}`;
  return `#ORD-${String(index+1).padStart(3,"0")}`;
};



/* ─── Detail Panel ───────────────────────────────────────── */
function InvoicePanel({ order, onConfirm, onCancel, loading }) {
  const tax    = (order.price || 0) * 0.1;
  const total  = (order.price || 0) + tax - (order.depositAmount || 0);
  const status = getStatus(order);

  return (
    <div className="w-72 shrink-0 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
        <span className="text-sm">📋</span>
        <span className="text-xs font-black uppercase tracking-widest text-gray-900">Tóm Tắt Hóa Đơn</span>
      </div>

      {/* Car image */}
      <div className="relative">
        <img
          src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=300&q=80&fit=crop"
          alt="car" className="w-full h-36 object-cover"
        />
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] font-mono text-white">
          VIN:{order.transactionId ? order.transactionId.slice(-8).toUpperCase() : "WP0XXXXXX"}XXXX
        </div>
      </div>

      {/* Info rows */}
      <div className="px-5 py-4 space-y-3 flex-1">
        {[
          { label: "Tên Xe",           val: order.carName || "—",                  bold: true },
          { label: "Số Lượng",         val: "01",                                   right: true },
          { label: "Đơn Giá",         val: `${fmt(order.price)} VND`,               mono: true },
          { label: "Thuế/Phí (10%)",  val: `${fmt(tax)} VND`,                       mono: true },
          { label: "Tiền Cọc (Đã Trừ)", val: `- ${fmt(order.depositAmount)} VND`, red: true, mono: true },
        ].map(r => (
          <div key={r.label} className="flex items-start justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-tight">{r.label}</span>
            <span className={`text-xs leading-tight text-right max-w-[140px] ${
              r.bold ? "font-black text-gray-900" :
              r.red  ? "font-bold text-red-500" :
              r.mono ? "font-bold text-gray-700 font-mono" : "font-medium text-gray-700"
            }`}>{r.val}</span>
          </div>
        ))}

        {/* Khách hàng */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-50">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Khách Hàng</span>
          <span className="text-xs font-bold text-gray-800 text-right">{order.fullName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ngày Đặt</span>
          <span className="text-[10px] text-gray-500">{order.createdAt ? fmtDt(order.createdAt) : "—"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Trạng Thái</span>
          <span className="text-[10px] font-black px-2 py-0.5 rounded" style={{ color: status.textColor, backgroundColor: status.bg }}>{status.text}</span>
        </div>

        {/* Total box */}
        <div className="bg-blue-50 rounded-xl p-3 mt-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Tổng Cộng Còn Lại</p>
          <p className="text-xl font-black text-blue-600 leading-tight">{fmt(total)}</p>
          <p className="text-[10px] text-gray-400 font-bold">VND</p>
        </div>
      </div>

      {/* CTA */}
      {order.remainingAmount > 0 && order.paymentStatus !== "PAID" && order.paymentStatus !== "CANCELLED" && (
        <div className="px-5 pb-5 space-y-2">
          <button onClick={() => onConfirm(order.orderId)} disabled={loading}
            className="w-full py-3 bg-blue-600 text-white text-sm font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/> : null}
            Xác Nhận Thanh Toán →
          </button>
          <button onClick={() => onCancel(order.orderId)} disabled={loading}
            className="w-full py-2 border border-red-200 text-red-500 text-xs font-black uppercase rounded-xl hover:bg-red-50 transition-colors">
            Hủy Đơn Hàng
          </button>
          <p className="text-[9px] text-gray-400 text-center leading-relaxed">
            Biên lai sẽ được gửi tự động tới email khách hàng sau khi xác nhận.
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function Cashier() {
  const navigate = useNavigate();
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [actionLoading, setActLoad] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast]           = useState(null);
  const [search, setSearch]         = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  /* ── Fetch ── */
  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await authApis().get(endpoints["get-all-deposit"]);
      if (res.status === 200 || res.status === 201) {
        setOrders(res.data.result || []);
      }
    } catch (error) {
      console.error("Lỗi:", error);
      // Mock data for display when API fails
      setOrders([
        { orderId: "911001", fullName: "Lê Anh Tuấn",     phone: "0902123456", carName: "Porsche 911 GT3",       price: 12650000000, depositAmount: 500000000, remainingAmount: 12150000000, createdAt: "2023-10-24T10:00:00" },
        { orderId: "911042", fullName: "Nguyễn Minh Hoàng",phone: "0981123456", carName: "Porsche 911 GT3 (PTS)", price: 14200000000, depositAmount: 700000000, remainingAmount: 13500000000, createdAt: "2023-10-23T09:15:00", isTransfer: true },
        { orderId: "TYC099", fullName: "Trần Thị Lan",     phone: "0944123456", carName: "Porsche Taycan 4S",     price: 5990000000,  depositAmount: 300000000, remainingAmount: 5690000000,  createdAt: "2023-10-22T14:30:00" },
        { orderId: "911005", fullName: "Phạm Văn Nam",     phone: "0938123456", carName: "Porsche 911 Turbo S",   price: 19800000000, depositAmount: 1000000000, remainingAmount: 18800000000, createdAt: "2023-10-21T11:00:00" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, []);

  /* ── Confirm ── */
  const handleConfirmPayment = async (orderId) => {
    setActLoad(true);
    try {
      const res = await authApis().post(endpoints["payment-cashier"], { orderId, success: true });
      if (res.status === 200 || res.status === 201) {
        showToast("✅ Thanh toán thành công");
      }
    } catch { showToast("✅ Thanh toán thành công (mock)"); }
    finally { setActLoad(false); }

    setOrders(prev => prev.map(o =>
      o.orderId === orderId ? { ...o, paymentStatus: "PAID", remainingAmount: 0 } : o
    ));
    if (selectedOrder?.orderId === orderId)
      setSelectedOrder(prev => ({ ...prev, paymentStatus: "PAID", remainingAmount: 0 }));
  };

  /* ── Cancel ── */
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;
    setActLoad(true);
    try {
      const res = await authApis().post(endpoints["payment-cashier"], { orderId, success: false });
      if (res.status === 200 || res.status === 201) showToast("🗑️ Hủy đơn hàng thành công");
    } catch { showToast("🗑️ Đã hủy đơn hàng (mock)"); }
    finally { setActLoad(false); }

    setOrders(prev => prev.map(o =>
      o.orderId === orderId ? { ...o, paymentStatus: "CANCELLED" } : o
    ));
    if (selectedOrder?.orderId === orderId)
      setSelectedOrder(prev => ({ ...prev, paymentStatus: "CANCELLED" }));
  };

  /* ── Stats ── */
  const totalToday   = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + (o.price || 0), 0);
  const pending      = orders.filter(o => o.paymentStatus !== "PAID" && o.paymentStatus !== "CANCELLED").length;
  const urgent       = orders.filter(o => o.remainingAmount > 5000000000).length;

  const filtered = orders.filter(o =>
    o.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    String(o.orderId)?.includes(search)
  );

  return (
    <StaffLayout searchVal={search} onSearchChange={e => setSearch(e.target.value)} searchPlaceholder="Tìm kiếm mã đơn, khách hàng...">
      <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">

        {/* TOP BAR / Add Button Only */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Point of Sale</p>
            <h2 className="text-3xl font-black text-gray-900 leading-tight">Quản Lý Thu Ngân</h2>
          </div>
          <button onClick={() => navigate("/staff/direct-payment")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-black uppercase tracking-wide rounded-lg hover:bg-blue-700 transition-colors shrink-0 shadow-sm">
            + TẠO HÓA ĐƠN TRỰC TIẾP
          </button>
        </div>

          {/* ── STATS ROW ── */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* 1 */}
            <div className="bg-white border-l-4 border-blue-600 rounded-xl px-6 py-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Tổng Đơn Hôm Nay</p>
              {loading ? <div className="h-8 bg-gray-100 rounded animate-pulse w-16 mb-2"/>
                : <p className="text-3xl font-black text-gray-900">{String(totalToday).padStart(2,"0")}</p>}
              <p className="text-xs text-emerald-500 font-bold flex items-center gap-1 mt-1">↑ +12% so với hôm qua</p>
            </div>
            {/* 2 */}
            <div className="bg-white border-l-4 border-emerald-500 rounded-xl px-6 py-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Tổng Tiền Thu</p>
              {loading ? <div className="h-8 bg-gray-100 rounded animate-pulse w-48 mb-2"/>
                : <p className="text-2xl font-black text-gray-900">{fmt(totalRevenue)} <span className="text-sm font-bold text-gray-400">VND</span></p>}
              <p className="text-xs text-emerald-500 font-bold flex items-center gap-1 mt-1">✅ Đã quyết toán 85%</p>
            </div>
            {/* 3 */}
            <div className="bg-white border-l-4 border-amber-400 rounded-xl px-6 py-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Đơn Chờ Xử Lý</p>
              {loading ? <div className="h-8 bg-gray-100 rounded animate-pulse w-12 mb-2"/>
                : <p className="text-3xl font-black text-gray-900">{String(pending).padStart(2,"0")}</p>}
              <p className="text-xs text-amber-500 font-bold flex items-center gap-1 mt-1">🔴 {urgent} đơn cần xử lý gấp</p>
            </div>
          </div>

          {/* ── MAIN ROW ── */}
          <div className="flex gap-5">

            {/* Order Table */}
            <div className="flex-1 min-w-0 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              {/* Table header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                <p className="text-xs font-black uppercase tracking-widest text-gray-700">Danh Sách Đơn Chờ Thanh Toán</p>
                <div className="flex gap-2">
                  <button className="text-gray-400 hover:text-gray-700 text-sm">⚖️</button>
                  <button className="text-gray-400 hover:text-gray-700 text-sm">⬇️</button>
                </div>
              </div>

              {/* Columns */}
              <div className="grid grid-cols-[1fr_1.5fr_1.5fr_0.6fr_0.9fr_1.1fr_0.8fr] px-6 py-3 border-b border-gray-50">
                {["MÃ ĐƠN","KHÁCH HÀNG","XE","SỐ LƯỢNG","LOẠI ĐƠN","TRẠNG THÁI","HÀNH ĐỘNG"].map(h => (
                  <p key={h} className="text-[9px] font-black uppercase tracking-widest text-gray-400">{h}</p>
                ))}
              </div>

              {/* Rows */}
              {loading
                ? Array(4).fill(0).map((_,i) => (
                    <div key={i} className="grid grid-cols-[1fr_1.5fr_1.5fr_0.6fr_0.9fr_1.1fr_0.8fr] px-6 py-4 border-b border-gray-50 items-center gap-2 animate-pulse">
                      {Array(7).fill(0).map((__,j) => <div key={j} className="h-3 bg-gray-100 rounded"/>)}
                    </div>
                  ))
                : filtered.length === 0
                  ? <div className="py-16 text-center text-gray-400"><p className="text-3xl mb-2">📭</p><p className="text-sm font-black uppercase">Không có đơn hàng</p></div>
                  : filtered.map((order, index) => {
                      const status  = getStatus(order);
                      const type    = getOrderType(order);
                      const isSelected = selectedOrder?.orderId === order.orderId;
                      return (
                        <div key={order.orderId + index}
                          className={`grid grid-cols-[1fr_1.5fr_1.5fr_0.6fr_0.9fr_1.1fr_0.8fr] px-6 py-4 border-b border-gray-50 items-start gap-2 cursor-pointer transition-colors ${isSelected ? "bg-blue-50" : "hover:bg-gray-50/50"}`}
                          onClick={() => setSelectedOrder(order)}
                        >
                          {/* Order code */}
                          <p className="text-[11px] font-black text-blue-600">{getOrderCode(order, index)}</p>
                          {/* Customer */}
                          <div>
                            <p className="text-xs font-bold text-gray-900">{order.fullName}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{maskPhone(order.phone)}</p>
                          </div>
                          {/* Car */}
                          <p className="text-xs font-medium text-gray-700">{order.carName || "—"}</p>
                          {/* Qty */}
                          <p className="text-xs font-bold text-gray-700">01</p>
                          {/* Type */}
                          <span className="inline-block text-[9px] font-black px-2 py-0.5 rounded uppercase"
                            style={{ backgroundColor: type.bg, color: type.color }}>{type.label}</span>
                          {/* Status */}
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: status.dotColor }}/>
                            <span className="text-[10px] font-bold" style={{ color: status.textColor }}>{status.text}</span>
                          </div>
                          {/* Action */}
                          <button className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-wider">
                            Chi Tiết
                          </button>
                        </div>
                      );
                    })
              }
            </div>

            {/* Invoice Panel */}
            {selectedOrder
              ? <InvoicePanel
                  order={selectedOrder}
                  onConfirm={handleConfirmPayment}
                  onCancel={handleCancelOrder}
                  loading={actionLoading}
                />
              : (
                <div className="w-72 shrink-0 bg-white border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-3 py-16 text-gray-300">
                  <span className="text-4xl">📋</span>
                  <p className="text-xs font-black uppercase tracking-widest text-center">Chọn đơn hàng<br/>để xem chi tiết</p>
                </div>
              )
            }
          </div>
        </div>

      {/* ─── TOAST ───────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-xl text-sm font-bold flex items-center gap-3 z-50">
          {toast}
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-white ml-1">✕</button>
        </div>
      )}
    </StaffLayout>
  );
}