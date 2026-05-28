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
  if (order.paymentStatus === "DEPOSITED")
    return { text: "Chờ duyệt cọc", dotColor: "#3b82f6", textColor: "#2563eb", bg: "#eff6ff" };
  if (order.paymentStatus === "PARTIALLY_PAID")
    return { text: "Chờ thanh toán nốt", dotColor: "#f59e0b", textColor: "#d97706", bg: "#fffbeb" };
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



/* ─── Detail Modal ───────────────────────────────────────── */
function InvoiceModal({ order, onConfirm, onApprove, onCancel, onExport, onClose, loading, statusFilter }) {
  const [method, setMethod] = useState("CASH");
  const [detailedOrder, setDetailedOrder] = useState(order);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoadingDetails(true);
      try {
        const res = await authApis().get(endpoints["get-payment-details"](order.transactionId));
        const data = res.data?.result || {};
        const cust = data.customerDetails || {};
        const od = data.orderDetails || {};

        setDetailedOrder(prev => ({
          ...prev,
          fullName: cust.fullName || prev.fullName,
          phone: cust.phoneNumber || prev.phone,
          address: cust.address || prev.address,
          carName: od.carName || prev.carName,
          price: od.baseAmount || od.unitPrice || prev.price,
          totalAmount: data.totalAmount || prev.totalAmount,
          depositAmount: data.paidAmount || prev.depositAmount,
        }));
      } catch (e) {
        console.error("Failed to fetch payment details", e);
      } finally {
        setIsLoadingDetails(false);
      }
    };
    if (order?.transactionId) fetchDetails();
  }, [order?.transactionId]);

  const isPending = detailedOrder.paymentStatus === "PENDING";
  
  // Xác định % thuế trước bạ dựa theo địa chỉ (Hà Nội thường 12%, TPHCM và các tỉnh khác 10%)
  const isHanoi = (detailedOrder.address || "").toLowerCase().includes("hà nội");
  const taxRate = isHanoi ? 0.12 : 0.10;
  const taxRatePercent = isHanoi ? 12 : 10;
  
  const tax = detailedOrder.taxAmount || ((detailedOrder.price || 0) * taxRate);
  const totalFees = (detailedOrder.plateFeeAmount || 0) + (detailedOrder.insuranceAmount || 0);
  const actualTotal = (detailedOrder.totalAmount > (detailedOrder.price || 0)) 
    ? detailedOrder.totalAmount 
    : ((detailedOrder.price || 0) + tax + totalFees);
  const expectedPayment = isPending ? (actualTotal * 0.01) : (actualTotal - (detailedOrder.depositAmount || 0));
  const status = getStatus(detailedOrder);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 leading-tight">Chi Tiết Đơn Hàng</h3>
              <p className="text-xs font-medium text-gray-500">Mã đơn: <span className="font-mono text-blue-600">{detailedOrder.orderId ? `#ORD-${String(detailedOrder.orderId).slice(-6).toUpperCase()}` : "N/A"}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Left Column: Customer & Car Info */}
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                <span>👤</span> Thông Tin Khách Hàng
              </h4>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100 relative">
                {isLoadingDetails && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl"><span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span></div>}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Họ và tên</span>
                  <span className="text-sm font-bold text-gray-900">{detailedOrder.fullName || "—"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Số điện thoại</span>
                  <span className="text-sm font-bold text-gray-900">{detailedOrder.phone || "—"}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-xs text-gray-500 mt-0.5">Địa chỉ</span>
                  <span className="text-sm font-bold text-gray-900 text-right max-w-[200px]">{detailedOrder.address || "—"}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                <span>🚘</span> Thông Tin Xe
              </h4>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100 relative">
                {isLoadingDetails && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl"><span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span></div>}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Tên xe</span>
                  <span className="text-sm font-bold text-gray-900">{detailedOrder.carName || "—"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Số lượng</span>
                  <span className="text-sm font-bold text-gray-900">01</span>
                </div>
                {detailedOrder.transactionId && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Mã giao dịch</span>
                    <span className="text-xs font-mono font-bold text-gray-600 bg-gray-200 px-2 py-0.5 rounded">{detailedOrder.transactionId.slice(-8).toUpperCase()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                <span>📊</span> Trạng Thái
              </h4>
              <div className="flex justify-between items-center bg-gray-50 rounded-xl p-4 border border-gray-100">
                <span className="text-xs text-gray-500">Tình trạng đơn</span>
                <span className="text-xs font-black px-2.5 py-1 rounded-md" style={{ color: status.textColor, backgroundColor: status.bg }}>{status.text}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Payment Details */}
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                <span>💰</span> Chi Tiết Thanh Toán
              </h4>
              <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm relative">
                {isLoadingDetails && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl"><span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span></div>}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Đơn giá xe</span>
                  <span className="text-sm font-bold text-gray-900 font-mono">{fmt(detailedOrder.price)} ₫</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Thuế trước bạ ({taxRatePercent}%)</span>
                  <span className="text-sm font-bold text-gray-900 font-mono">{fmt(tax)} ₫</span>
                </div>
                {totalFees > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Phí biển số & Bảo hiểm</span>
                    <span className="text-sm font-bold text-gray-900 font-mono">{fmt(totalFees)} ₫</span>
                  </div>
                )}
                <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">Tổng cộng</span>
                  <span className="text-base font-black text-gray-900 font-mono">{fmt(actualTotal)} ₫</span>
                </div>
                {!isPending && (
                  <div className="flex justify-between items-center text-emerald-600">
                    <span className="text-sm font-bold">Đã thanh toán (Cọc)</span>
                    <span className="text-sm font-black font-mono">- {fmt(detailedOrder.depositAmount)} ₫</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4 mt-2">
                  <div className="bg-blue-50 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">
                      {isPending ? "SỐ TIỀN CẦN THU (CỌC 1%)" : "SỐ TIỀN CÒN LẠI CẦN THU"}
                    </span>
                    <span className="text-3xl font-black text-blue-600 font-mono my-1">{fmt(expectedPayment)} <span className="text-lg text-blue-500">₫</span></span>
                  </div>
                </div>


              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
          <button onClick={() => onExport(detailedOrder.orderId)}
            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs font-black uppercase tracking-wider rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center gap-2 shadow-sm">
            <span>📄</span> Xuất Hóa Đơn PDF
          </button>

          <div className="flex gap-3">
            {detailedOrder.paymentStatus !== "COMPLETED" && detailedOrder.paymentStatus !== "CANCELLED" && (
              <>
                <button onClick={() => onCancel(detailedOrder.orderId)} disabled={loading}
                  className="px-6 py-2.5 bg-white border border-red-200 text-red-500 text-xs font-black uppercase tracking-wider rounded-xl hover:bg-red-50 transition-colors disabled:opacity-60 shadow-sm">
                  Hủy Đơn
                </button>
                {statusFilter === "DEPOSITED" ? (
                  <button onClick={() => onApprove(detailedOrder.orderId)} disabled={loading}
                    className="px-8 py-2.5 bg-blue-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all disabled:opacity-60 flex items-center gap-2">
                    {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : null}
                    Duyệt Cọc
                  </button>
                ) : (
                  <button onClick={() => onConfirm(detailedOrder.transactionId, method)} disabled={loading}
                    className="px-8 py-2.5 bg-blue-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all disabled:opacity-60 flex items-center gap-2">
                    {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : null}
                    {isPending ? "Xác Nhận Thu Cọc" : "Xác Nhận Thanh Toán"}
                  </button>
                )}
              </>
            )}
            {(detailedOrder.paymentStatus === "COMPLETED" || detailedOrder.paymentStatus === "CANCELLED") && (
              <button onClick={onClose}
                className="px-8 py-2.5 bg-gray-800 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-gray-900 shadow-md transition-all">
                Đóng
              </button>
            )}
          </div>
        </div>
      </div>
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
  const [statusFilter, setStatusFilter] = useState("DEPOSITED");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const statusTabs = [
    { key: "DEPOSITED", label: "Cần Duyệt Cọc", apiStatus: "DEPOSITED" },
    { key: "PARTIALLY_PAID", label: "Chờ Thanh Toán Nốt", apiStatus: "PARTIALLY_PAID" },
    { key: "COMPLETED", label: "Đã Hoàn Tất", apiStatus: "COMPLETED" },
    { key: "CANCELLED", label: "Đã Hủy", apiStatus: "CANCELLED" }
  ];

  /* ── Fetch payments from payment-service & enrich ── */
  const fetchOrder = async () => {
    setLoading(true);
    setOrders([]);
    try {
      const currentTab = statusTabs.find(t => t.key === statusFilter) || statusTabs[0];
      console.log(`[API CALL] GET get-all-payments-management: page=${page}, status=${currentTab.apiStatus}`);
      const res = await authApis().get(endpoints["get-all-payments-management"](page, 10, currentTab.apiStatus));
      console.log(`[API RESPONSE] get-all-payments-management:`, res.data);
      const resultData = res.data?.result || {};
      const paymentList = Array.isArray(resultData.data) ? resultData.data : [];
      setTotalPages(resultData.totalPages || 1);
      setTotalElements(resultData.totalElements || 0);

      // Enrich payments in parallel with order details (car name, etc.)
      const orderPromises = paymentList.map(async (payment) => {
        try {
          console.log(`[API CALL] GET get-order-by-id: orderId=${payment.orderId}`);
          const orderRes = await authApis().get(endpoints["get-order-by-id"](payment.orderId));
          console.log(`[API RESPONSE] get-order-by-id (${payment.orderId}):`, orderRes.data);
          const orderData = orderRes.data?.result || orderRes.data || {};
          const carDetails = orderData.orderItem || {};
          return {
            ...payment,
            carName: carDetails.carName || payment.carName || "—",
            fullName: carDetails.fullName || payment.customerName || "—",
            phone: carDetails.phoneNumber || payment.phone || "—",
            address: carDetails.address || payment.address || "—",
            price: carDetails.unitPrice || payment.totalAmount,
            taxAmount: orderData.taxAmount || 0,
            plateFeeAmount: orderData.plateFeeAmount || 0,
            insuranceAmount: orderData.insuranceAmount || 0,
            baseAmount: orderData.baseAmount || 0,
            depositAmount: payment.paidAmount,
            remainingAmount: payment.totalAmount - payment.paidAmount,
            orderType: orderData.type || "NEW",
            isTransfer: orderData.type === "TRANSFER",
            transactionId: payment.id,
            paymentStatus: orderData.status === "CANCELLED" ? "CANCELLED" : payment.status,
            orderStatus: orderData.status
          };
        } catch (err) {
          console.error("Lỗi lấy thông tin chi tiết đơn hàng:", payment.orderId, err);
          return {
            ...payment,
            carName: payment.carName || "—",
            fullName: payment.customerName || "—",
            phone: payment.phone || "—",
            address: payment.address || "—",
            price: payment.totalAmount,
            taxAmount: 0,
            plateFeeAmount: 0,
            insuranceAmount: 0,
            baseAmount: 0,
            depositAmount: payment.paidAmount,
            remainingAmount: payment.totalAmount - payment.paidAmount,
            orderType: "NEW",
            isTransfer: false,
            transactionId: payment.id,
            paymentStatus: payment.status,
            orderStatus: null
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
      console.log(`[API CALL] POST confirm-offline: paymentId=${paymentId}, method=${method}`);
      const res = await authApis().post(endpoints["confirm-offline"], { paymentId, method });
      console.log(`[API RESPONSE] confirm-offline:`, res.data);
      showToast("Xác nhận thanh toán offline thành công!");
      navigate("/staff/payment-success", { state: { order: { ...targetOrder, paymentMethod: method } } });
      setSelectedOrder(null);
    } catch (err) {
      showToast("Xác nhận thất bại: " + (err.response?.data?.message || "Vui lòng thử lại"));
    } finally { setActLoad(false); }
  };

  /* ── Approve Deposit ── */
  const handleApproveDeposit = async (orderId) => {
    setActLoad(true);
    try {
      console.log(`[API CALL] PATCH staff-update-order-status: orderId=${orderId}, status=WAITING_FOR_PAID`);
      const res1 = await authApis().patch(endpoints["staff-update-order-status"](orderId, "WAITING_FOR_PAID", "Nhân viên đã duyệt cọc"));
      console.log(`[API RESPONSE] staff-update-order-status:`, res1.data);

      console.log(`[API CALL] PATCH staff-approve-deposit: orderId=${orderId}`);
      const res2 = await authApis().patch(endpoints["staff-approve-deposit"](orderId));
      console.log(`[API RESPONSE] staff-approve-deposit:`, res2.data);

      showToast("Đã duyệt cọc thành công!");
      await fetchOrder();
      setSelectedOrder(null);
    } catch (err) {
      showToast("Duyệt thất bại: " + (err.response?.data?.message || "Vui lòng thử lại"));
    } finally { setActLoad(false); }
  };

  /* ── Cancel Order ── */
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;
    setActLoad(true);
    try {
      console.log(`[API CALL] PATCH admin-update-order-status: orderId=${orderId}, status=CANCELLED`);
      const res1 = await authApis().patch(endpoints["admin-update-order-status"](orderId, "CANCELLED", "Hủy bởi nhân viên"));
      console.log(`[API RESPONSE] admin-update-order-status:`, res1.data);
      try {
        console.log(`[API CALL] POST cancel-payment: orderId=${orderId}`);
        const res2 = await authApis().post(endpoints["cancel-payment"](orderId));
        console.log(`[API RESPONSE] cancel-payment:`, res2.data);
      } catch (e) {
        console.error("Lỗi huỷ payment:", e);
      }
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
      console.log(`[API CALL] GET download-order-pdf: orderId=${orderId}`);
      const response = await authApis().get(endpoints["download-order-pdf"](orderId), {
        responseType: 'blob'
      });
      console.log(`[API RESPONSE] download-order-pdf: received blob size=${response.data.size}`);
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
  const totalRevenue = orders.filter(o => ["COMPLETED", "PAID"].includes(o.paymentStatus || o.status)).reduce((s, o) => s + (o.price || 0), 0);
  const pending = totalElements; // for this status
  const urgent = orders.filter(o => o.remainingAmount > 500000000).length;

  const filtered = orders.filter(o => {
    const name = o.fullName || "";
    const oid = String(o.orderId || "");
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) || oid.includes(search);

    if (statusFilter === "CANCELLED" && o.paymentStatus !== "CANCELLED") return false;
    if (statusFilter !== "CANCELLED" && o.paymentStatus === "CANCELLED") return false;

    // For non-cancelled orders, ensure the paymentStatus matches statusFilter
    // This provides a clean interface and naturally resolves any database sync discrepancies
    if (statusFilter !== "CANCELLED" && o.paymentStatus !== statusFilter) return false;

    return matchSearch;
  });

  console.log(`[DEBUG RENDER] statusFilter = ${statusFilter}, orders.length = ${orders.length}, filtered.length = ${filtered.length}`, { orders, filtered });

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
          </div>
          {/* 2 */}
          <div className="bg-white border-l-4 border-emerald-500 rounded-xl px-6 py-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Tiền Thu Trang Này</p>
            {loading ? <div className="h-8 bg-gray-100 rounded animate-pulse w-48 mb-2" />
              : <p className="text-2xl font-black text-gray-900">{fmt(totalRevenue)} <span className="text-sm font-bold text-gray-400">VND</span></p>}
          </div>
          {/* 3 */}
          <div className="bg-white border-l-4 border-amber-400 rounded-xl px-6 py-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Số Tiền Lớn (>500tr)</p>
            {loading ? <div className="h-8 bg-gray-100 rounded animate-pulse w-12 mb-2" />
              : <p className="text-3xl font-black text-gray-900">{String(urgent).padStart(2, "0")}</p>}
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
            <div className="grid grid-cols-[1fr_1.5fr_1.5fr_0.9fr_1.1fr_0.8fr] px-6 py-3 border-b border-gray-50">
              {["MÃ ĐƠN", "KHÁCH HÀNG", "XE", "LOẠI ĐƠN", "TRẠNG THÁI", "HÀNH ĐỘNG"].map(h => (
                <p key={h} className="text-[9px] font-black uppercase tracking-widest text-gray-400">{h}</p>
              ))}
            </div>

            {/* Rows */}
            {loading
              ? Array(4).fill(0).map((_, i) => (
                <div key={i} className="grid grid-cols-[1fr_1.5fr_1.5fr_0.9fr_1.1fr_0.8fr] px-6 py-4 border-b border-gray-50 items-center gap-2 animate-pulse">
                  {Array(6).fill(0).map((__, j) => <div key={j} className="h-3 bg-gray-100 rounded" />)}
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
                      className={`grid grid-cols-[1fr_1.5fr_1.5fr_0.9fr_1.1fr_0.8fr] px-6 py-4 border-b border-gray-50 items-start gap-2 cursor-pointer transition-colors ${isSelected ? "bg-blue-50" : "hover:bg-gray-50/50"}`}
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

          {/* Modal (Invoice Detail) */}
          {selectedOrder && (
            <InvoiceModal
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
              onConfirm={handleConfirmPayment}
              onApprove={handleApproveDeposit}
              onCancel={handleCancelOrder}
              onExport={handleExportInvoice}
              loading={actionLoading}
              statusFilter={statusFilter}
            />
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