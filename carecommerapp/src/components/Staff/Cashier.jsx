import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "./StaffLayout";
import { authApis, endpoints } from "../../configs/APIs";



/* ─── Helpers ────────────────────────────────────────────── */
const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");
const fmtDt = (s) => new Date(s).toLocaleString("vi-VN");

const getStatus = (order) => {
  if (order.paymentStatus === "COMPLETED" || order.paymentStatus === "PAID" || order.remainingAmount === 0)
    return { text: "Đã thanh toán", dotColor: "#22c55e", textColor: "#15803d", bg: "#f0fdf4" };
  if (order.paymentStatus === "CANCELLED")
    return { text: "Đã hủy", dotColor: "#ef4444", textColor: "#dc2626", bg: "#fef2f2" };
  if (order.paymentStatus === "PARTIALLY_PAID" || order.depositAmount > 0)
    return { text: "Đã cọc (Chờ thanh toán)", dotColor: "#f59e0b", textColor: "#d97706", bg: "#fffbeb" };
  return { text: "Chờ thanh toán cọc", dotColor: "#3b82f6", textColor: "#2563eb", bg: "#eff6ff" };
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
  if (order.orderId) return `#ORD-${String(order.orderId).slice(-6).toUpperCase()}`;
  return `#ORD-${String(index + 1).padStart(3, "0")}`;
};



/* ─── Detail Panel ───────────────────────────────────────── */
/* ─── Detail Panel ───────────────────────────────────────── */
function InvoicePanel({ order, onConfirm, onCancel, onExport, onClose, loading }) {
  const [method, setMethod] = useState("CASH");
  const isPending = order.paymentStatus === "PENDING";
  const tax = (order.price || 0) * 0.1;
  const expectedPayment = isPending ? (order.totalAmount * 0.01) : (order.totalAmount - order.depositAmount);
  const status = getStatus(order);

  return (
    <div className="w-72 shrink-0 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-widest text-gray-900">Tóm Tắt Hóa Đơn</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
          <span className="text-lg font-black">✕</span>
        </button>
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
          { label: "Tên Xe", val: order.carName || "—", bold: true },
          { label: "Số Lượng", val: "01", right: true },
          { label: "Đơn Giá Xe", val: `${fmt(order.price)} VND`, mono: true },
          { label: "Thuế & Phí", val: `${fmt(order.totalAmount - order.price)} VND`, mono: true },
          !isPending && { label: "Tiền Cọc (Đã Trừ)", val: `- ${fmt(order.depositAmount)} VND`, red: true, mono: true },
        ].filter(Boolean).map(r => (
          <div key={r.label} className="flex items-start justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-tight">{r.label}</span>
            <span className={`text-xs leading-tight text-right max-w-[140px] ${r.bold ? "font-black text-gray-900" :
              r.red ? "font-bold text-red-500" :
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

        {/* Phương thức thanh toán */}
        {order.paymentStatus !== "COMPLETED" && order.paymentStatus !== "CANCELLED" && (
          <div className="space-y-1 pt-1 border-t border-gray-50">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Phương Thức Thanh Toán</span>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:border-blue-500 animate-in fade-in"
            >
              <option value="CASH">💵 Tiền mặt (Cash)</option>
              <option value="BANK_TRANSFER">🏦 Chuyển khoản (Bank Transfer)</option>
            </select>
          </div>
        )}

        {/* Total box */}
        <div className="bg-blue-50 rounded-xl p-3 mt-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">
            {isPending ? "Số Tiền Đặt Cọc Cần Thu (1%)" : "Tổng Cộng Còn Lại"}
          </p>
          <p className="text-xl font-black text-blue-600 leading-tight">{fmt(expectedPayment)}</p>
          <p className="text-[10px] text-gray-400 font-bold">VND</p>
        </div>
      </div>

      {/* Export Invoice Button */}
      <div className="px-5 pb-5">
        <button onClick={() => onExport(order.orderId)}
          className="w-full py-2.5 border border-blue-200 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
          <span>📄</span> Xuất Hóa Đơn PDF
        </button>
      </div>

      {/* CTA */}
      {order.paymentStatus !== "COMPLETED" && order.paymentStatus !== "CANCELLED" && (
        <div className="px-5 pb-5 space-y-2 pt-0">
          <button onClick={() => onConfirm(order.transactionId, method)} disabled={loading}
            className="w-full py-3 bg-blue-600 text-white text-sm font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : null}
            {isPending ? "Xác Nhận Thu Cọc →" : "Xác Nhận Thanh Toán →"}
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
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActLoad] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState("PARTIALLY_PAID");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const statusTabs = [
    { key: "PENDING", label: "Chờ Cọc" },
    { key: "PARTIALLY_PAID", label: "Chờ Thanh Toán Nốt" },
    { key: "COMPLETED", label: "Đã Hoàn Tất" },
    { key: "CANCELLED", label: "Đã Hủy" }
  ];

  /* ── Fetch payments from payment-service & enrich ── */
  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await authApis().get(endpoints["get-all-payments-management"](page, 10, statusFilter));
      const resultData = res.data?.result || {};
      const paymentList = Array.isArray(resultData.data) ? resultData.data : [];
      setTotalPages(resultData.totalPages || 1);
      setTotalElements(resultData.totalElements || 0);

      // Enrich payments in parallel with order details (car name, etc.)
      const orderPromises = paymentList.map(async (payment) => {
        try {
          const orderRes = await authApis().get(endpoints["get-order-by-id"](payment.orderId));
          const orderData = orderRes.data?.result || orderRes.data || {};
          const carDetails = orderData.orderItems?.[0] || {};
          return {
            ...payment,
            carName: carDetails.carName || "—",
            fullName: payment.customerName,
            phone: payment.phone,
            address: payment.address,
            price: carDetails.unitPrice || payment.totalAmount,
            depositAmount: payment.paidAmount,
            remainingAmount: payment.totalAmount - payment.paidAmount,
            orderType: orderData.type || "NEW",
            isTransfer: orderData.type === "TRANSFER",
            transactionId: payment.id,
            paymentStatus: payment.status
          };
        } catch (err) {
          console.error("Lỗi lấy thông tin chi tiết đơn hàng:", payment.orderId, err);
          return {
            ...payment,
            carName: "—",
            fullName: payment.customerName,
            phone: payment.phone,
            address: payment.address,
            price: payment.totalAmount,
            depositAmount: payment.paidAmount,
            remainingAmount: payment.totalAmount - payment.paidAmount,
            orderType: "NEW",
            isTransfer: false,
            transactionId: payment.id,
            paymentStatus: payment.status
          };
        }
      });

      const enrichedList = await Promise.all(orderPromises);
      setOrders(enrichedList);
    } catch (error) {
      console.error("Lỗi fetch payments:", error);
      setOrders([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [page, statusFilter]);

  /* ── Confirm Offline Payment ── */
  const handleConfirmPayment = async (paymentId, method) => {
    setActLoad(true);
    const targetOrder = orders.find(o => o.transactionId === paymentId);
    try {
      await authApis().post(endpoints["confirm-offline"], { paymentId, method });
      showToast("Xác nhận thanh toán offline thành công!");
      navigate("/staff/payment-success", { state: { order: { ...targetOrder, paymentMethod: method } } });
      setSelectedOrder(null);
    } catch (err) {
      showToast("Xác nhận thất bại: " + (err.response?.data?.message || "Vui lòng thử lại"));
    } finally { setActLoad(false); }
  };

  /* ── Cancel Order ── */
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;
    setActLoad(true);
    try {
      await authApis().post(endpoints["admin-cancel-order"](orderId, "Hủy bởi nhân viên"));
      showToast("Hủy đơn hàng thành công");
      await fetchOrder();
      setSelectedOrder(null);
    } catch (err) {
      showToast("Hủy thất bại: " + (err.response?.data?.message || "Vui lòng thử lại"));
    } finally { setActLoad(false); }
  };

  /* ── Export Invoice ── */
  const handleExportInvoice = async (orderId) => {
    try {
      const response = await authApis().get(endpoints["download-order-pdf"](orderId), {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Đang tải hóa đơn...");
    } catch (err) {
      console.error("Export failed:", err);
      showToast("Xuất hóa đơn thất bại!");
    }
  };

  /* ── Stats ── */
  const totalToday = totalElements;
  const totalRevenue = orders.reduce((s, o) => s + (o.price || 0), 0);
  const pending = totalElements; // for this status
  const urgent = orders.filter(o => o.remainingAmount > 500000000).length;

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
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Số Giao Dịch Đang Lọc</p>
            {loading ? <div className="h-8 bg-gray-100 rounded animate-pulse w-16 mb-2" />
              : <p className="text-3xl font-black text-gray-900">{String(totalToday).padStart(2, "0")}</p>}
            <p className="text-xs text-emerald-500 font-bold flex items-center gap-1 mt-1">Hoạt động thời gian thực</p>
          </div>
          {/* 2 */}
          <div className="bg-white border-l-4 border-emerald-500 rounded-xl px-6 py-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Tiền Thu Trang Này</p>
            {loading ? <div className="h-8 bg-gray-100 rounded animate-pulse w-48 mb-2" />
              : <p className="text-2xl font-black text-gray-900">{fmt(totalRevenue)} <span className="text-sm font-bold text-gray-400">VND</span></p>}
            <p className="text-xs text-emerald-500 font-bold flex items-center gap-1 mt-1">Đã quyết toán 100%</p>
          </div>
          {/* 3 */}
          <div className="bg-white border-l-4 border-amber-400 rounded-xl px-6 py-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Số Tiền Lớn (>500tr)</p>
            {loading ? <div className="h-8 bg-gray-100 rounded animate-pulse w-12 mb-2" />
              : <p className="text-3xl font-black text-gray-900">{String(urgent).padStart(2, "0")}</p>}
            <p className="text-xs text-amber-500 font-bold flex items-center gap-1 mt-1">Cần giám sát thủ quỹ</p>
          </div>
        </div>

        {/* ── MAIN ROW ── */}
        <div className="flex gap-5">

          {/* Order Table */}
          <div className="flex-1 min-w-0 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col">
            {/* Table header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <p className="text-xs font-black uppercase tracking-widest text-gray-700">Danh Sách Giao Dịch Showroom</p>
            </div>

            {/* Premium Status Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50/50 px-6 gap-6">
              {statusTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setStatusFilter(tab.key); setPage(1); setSelectedOrder(null); }}
                  className={`py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all relative ${statusFilter === tab.key
                    ? "border-blue-600 text-blue-600 font-black"
                    : "border-transparent text-gray-400 hover:text-gray-600 font-bold"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Columns */}
            <div className="grid grid-cols-[1fr_1.5fr_1.5fr_0.6fr_0.9fr_1.1fr_0.8fr] px-6 py-3 border-b border-gray-50">
              {["MÃ ĐƠN", "KHÁCH HÀNG", "XE", "SỐ LƯỢNG", "LOẠI ĐƠN", "TRẠNG THÁI", "HÀNH ĐỘNG"].map(h => (
                <p key={h} className="text-[9px] font-black uppercase tracking-widest text-gray-400">{h}</p>
              ))}
            </div>

            {/* Rows */}
            {loading
              ? Array(4).fill(0).map((_, i) => (
                <div key={i} className="grid grid-cols-[1fr_1.5fr_1.5fr_0.6fr_0.9fr_1.1fr_0.8fr] px-6 py-4 border-b border-gray-50 items-center gap-2 animate-pulse">
                  {Array(7).fill(0).map((__, j) => <div key={j} className="h-3 bg-gray-100 rounded" />)}
                </div>
              ))
              : filtered.length === 0
                ? <div className="py-16 text-center text-gray-400"><p className="text-3xl mb-2"></p><p className="text-sm font-black uppercase">Không có đơn hàng</p></div>
                : filtered.map((order, index) => {
                  const status = getStatus(order);
                  const type = getOrderType(order);
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
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: status.dotColor }} />
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

            {/* Pagination Controls */}
            {totalElements > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50 bg-gray-50/20 mt-auto">
                <p className="text-xs text-gray-500 font-bold">
                  Hiển thị <span className="text-gray-900">{orders.length}</span> / <span className="text-gray-900">{totalElements}</span> giao dịch
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    ← Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-black transition-colors ${page === p
                        ? "bg-blue-600 text-white"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                      {String(p).padStart(2, "0")}
                    </button>
                  ))}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    Sau →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Side Panel (Invoice Detail) */}
          {selectedOrder && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <InvoicePanel
                order={selectedOrder}
                loading={actionLoading}
                onConfirm={handleConfirmPayment}
                onCancel={handleCancelOrder}
                onExport={handleExportInvoice}
                onClose={() => setSelectedOrder(null)}
              />
            </div>
          )}


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