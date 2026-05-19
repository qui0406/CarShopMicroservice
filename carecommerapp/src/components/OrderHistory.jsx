import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authApis, endpoints } from "../configs/APIs";
import { MyUserContext } from "../configs/MyContexts";
import cookie from "react-cookies";

const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")} đ`;
const formatDate = (value) => {
  if (!value) return "--/--/----";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "--/--/----" : d.toLocaleDateString("vi-VN");
};

const normalizeOrder = (raw) => {
  const carName =
    raw?.carName ||
    raw?.car?.name ||
    raw?.inventory?.car?.name ||
    raw?.carModel?.name ||
    "Mẫu xe đang cập nhật";

  const carImage =
    raw?.carImage ||
    raw?.car?.imageUrls?.[0] ||
    raw?.car?.carModel?.thumbnailImage ||
    raw?.inventory?.car?.imageUrls?.[0] ||
    raw?.inventory?.car?.carModel?.thumbnailImage ||
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1000";

  const orderCode = raw?.orderCode || raw?.code || raw?.id || "N/A";
  const paymentStatus = (raw?.status || raw?.paymentStatus || "").toUpperCase();
  const depositAmount =
    raw?.depositAmount ??
    raw?.amount ??
    raw?.totalDeposit ??
    raw?.price * 0.1 ??
    0;

  const totalAmount = raw?.totalAmount ?? 0;

  return {
    id: raw?.id || orderCode,
    orderCode: `ORD-${String(orderCode).slice(0, 8).toUpperCase()}`,
    createdAt: raw?.createdAt || raw?.orderDate || raw?.createdDate,
    carName,
    carImage,
    depositAmount,
    totalAmount,
    paymentStatus,
  };
};

export default function OrderHistory() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useContext(MyUserContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Only redirect if we definitely know user is not logged in (user is null)
    if (user === null) {
      navigate("/login?next=/all-my-deposit");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await authApis().get(endpoints["get-my-orders"]);
        const list = res.data?.result?.content || res.data?.result || res.data || [];
        const normalized = (Array.isArray(list) ? list : []).map(normalizeOrder);
        console.log("normalized:", normalized);
        setOrders(normalized);
      } catch (err) {
        setError(err?.response?.data?.message || "Không thể tải lịch sử đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchOrders();
  }, [user]);

  const handleOpenDetails = async (id) => {
    setIsModalOpen(true);
    setLoadingDetails(true);
    setSelectedOrder(null);
    try {
      const res = await authApis().get(endpoints["get-order-by-id"](id));
      setSelectedOrder(res.data?.result || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const filteredOrders = useMemo(() => {
    const isPaid = (status) => ["PAID", "DEPOSITED", "CONFIRMED", "DELIVERED", "COMPLETED"].includes(status);
    if (activeTab === "ALL") return orders;
    if (activeTab === "PAID") return orders.filter((o) => isPaid(o.paymentStatus));
    if (activeTab === "CANCELLED") return orders.filter((o) => o.paymentStatus === "CANCELLED");
    if (activeTab === "PENDING") return orders.filter((o) => !isPaid(o.paymentStatus) && o.paymentStatus !== "CANCELLED");
    return orders;
  }, [orders, activeTab]);

  return (
    <div style={s.page}>
      <main style={s.main}>
        <section style={s.headingRow}>
          <div>
            <p style={s.kicker}>BẢNG ĐIỀU KHIỂN KHÁCH HÀNG</p>
            <h1 style={s.title}>Lịch sử đặt xe</h1>
          </div>
          <div style={s.tabWrap}>
            <button
              style={{ ...s.tabBtn, ...(activeTab === "ALL" ? s.tabBtnActive : {}) }}
              onClick={() => setActiveTab("ALL")}
            >
              Tất cả
            </button>
            <button
              style={{ ...s.tabBtn, ...(activeTab === "PENDING" ? s.tabBtnActive : {}) }}
              onClick={() => setActiveTab("PENDING")}
            >
              Chờ thanh toán
            </button>
            <button
              style={{ ...s.tabBtn, ...(activeTab === "PAID" ? s.tabBtnActive : {}) }}
              onClick={() => setActiveTab("PAID")}
            >
              Đã thanh toán
            </button>
            <button
              style={{ ...s.tabBtn, ...(activeTab === "CANCELLED" ? s.tabBtnActive : {}) }}
              onClick={() => setActiveTab("CANCELLED")}
            >
              Đã hủy
            </button>
          </div>
        </section>

        <section style={s.listWrap}>
          {loading && <p style={s.infoText}>Đang tải dữ liệu...</p>}
          {!loading && error && <p style={s.errorText}>{error}</p>}
          {!loading && !error && filteredOrders.length === 0 && (
            <p style={s.infoText}>Bạn chưa có giao dịch nào trong mục này.</p>
          )}

          {!loading &&
            !error &&
            filteredOrders.map((order) => {
              const statusStr = order.paymentStatus;
              const isPaid = ["PAID", "DEPOSITED", "CONFIRMED", "DELIVERED", "COMPLETED"].includes(statusStr);
              const isCancelled = statusStr === "CANCELLED";

              let badgeStyle = s.badgePending;
              let badgeText = "CHỜ THANH TOÁN";
              let amountLabel = "SỐ TIỀN ĐẶT CỌC";
              let amountValue = order.depositAmount;

              if (isPaid) { 
                badgeStyle = s.badgePaid; 
                badgeText = "ĐÃ THANH TOÁN"; 
                amountLabel = "TỔNG THANH TOÁN";
                amountValue = order.totalAmount || order.depositAmount;
              }
              if (isCancelled) { 
                badgeStyle = { color: "#dc2626", background: "#fef2f2" }; 
                badgeText = "ĐÃ HỦY"; 
                amountLabel = "SỐ TIỀN";
                amountValue = 0;
              }

              return (
                <article
                  key={order.id}
                  style={{ ...s.card, cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}
                  onClick={() => handleOpenDetails(order.id)}
                  onMouseOver={(e) => { e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseOut={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <img
                    src={order.carImage}
                    alt={order.carName}
                    style={s.carImage}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1000";
                    }}
                  />
                  <div style={s.carInfo}>
                    <h3 style={s.carName}>{order.carName}</h3>
                    <p style={s.meta}>ORD - {order.orderCode}</p>
                  </div>
                  <div style={s.dateCol}>
                    <p style={s.label}>NGÀY ĐẶT HÀNG</p>
                    <p style={s.value}>{formatDate(order.createdAt)}</p>
                  </div>
                  <div style={s.amountCol}>
                    <p style={s.label}>{amountLabel}</p>
                    <p style={s.amount}>{money(amountValue)}</p>
                    <span style={{ ...s.badge, ...badgeStyle }}>
                      {badgeText}
                    </span>
                  </div>
                </article>
              );
            })}
        </section>

        {isModalOpen && (
          <div style={s.modalOverlay} onClick={closeModal}>
            <div style={s.modalContent} onClick={(e) => e.stopPropagation()}>
              <button style={s.modalCloseBtn} onClick={closeModal}>✕</button>
              <h2 style={s.modalTitle}>Chi tiết đơn hàng</h2>

              {loadingDetails ? (
                <p style={s.infoText}>Đang tải chi tiết...</p>
              ) : selectedOrder ? (
                <div style={s.modalBody}>
                  <div style={s.modalSection}>
                    <h4 style={s.sectionTitle}>Thông tin khách hàng</h4>
                    {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                      <div style={s.gridList}>
                        <p><strong>Họ tên:</strong> {selectedOrder.orderItems[0].fullName || "N/A"}</p>
                        <p><strong>Số điện thoại:</strong> {selectedOrder.orderItems[0].phoneNumber || "N/A"}</p>
                        <p><strong>CCCD:</strong> {selectedOrder.orderItems[0].cccd || "N/A"}</p>
                        <p style={{ gridColumn: "1 / -1" }}><strong>Địa chỉ:</strong> {selectedOrder.orderItems[0].address || "N/A"}</p>
                      </div>
                    ) : (
                      <p>Không có thông tin khách hàng chi tiết.</p>
                    )}
                  </div>

                  <div style={s.modalSection}>
                    <h4 style={s.sectionTitle}>Thông tin xe</h4>
                    <div style={s.gridList}>
                      <p><strong>Tên xe:</strong> {selectedOrder.carName || "N/A"}</p>
                      <p><strong>Trạng thái:</strong> <span style={{ color: selectedOrder.status === "CANCELLED" ? "#dc2626" : "#1d4ed8", fontWeight: "bold" }}>{selectedOrder.status === "CANCELLED" ? "ĐÃ HỦY" : selectedOrder.status}</span></p>
                      <p><strong>Ngày tạo:</strong> {formatDate(selectedOrder.createdAt)}</p>
                      <p><strong>Loại giao dịch:</strong> {selectedOrder.type || "N/A"}</p>
                    </div>
                  </div>

                  <div style={s.modalSection}>
                    <h4 style={s.sectionTitle}>Chi tiết thanh toán</h4>
                    <div style={s.flexBetween}>
                      <span>Giá trị xe:</span>
                      <strong>{money(selectedOrder.baseAmount)}</strong>
                    </div>
                    <div style={s.flexBetween}>
                      <span>Thuế trước bạ:</span>
                      <strong>{money(selectedOrder.taxAmount)}</strong>
                    </div>
                    <div style={s.flexBetween}>
                      <span>Phí biển số:</span>
                      <strong>{money(selectedOrder.plateFeeAmount)}</strong>
                    </div>
                    <div style={s.flexBetween}>
                      <span>Phí bảo hiểm:</span>
                      <strong>{money(selectedOrder.insuranceAmount)}</strong>
                    </div>
                    <hr style={s.divider} />
                    <div style={s.flexBetween}>
                      <span style={s.totalAmount}>Tổng lăn bánh:</span>
                      <strong style={s.totalAmount}>{money(selectedOrder.totalAmount)}</strong>
                    </div>
                    <div style={s.flexBetween}>
                      <span style={s.depositAmountText}>Đã đặt cọc:</span>
                      <strong style={s.depositAmountText}>{money(selectedOrder.depositAmount)}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <p style={s.errorText}>Không thể tải chi tiết đơn hàng.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#f3f5f8",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: "#111827",
    paddingTop: "80px",
  },
  main: { maxWidth: 1280, margin: "0 auto", padding: "36px 24px 48px" },
  headingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
    gap: 12,
    flexWrap: "wrap",
  },
  kicker: {
    margin: "0 0 8px",
    fontSize: "0.74rem",
    fontWeight: 800,
    letterSpacing: "1.8px",
    color: "#2563eb",
  },
  title: { margin: 0, fontSize: "2.2rem", fontWeight: 900, color: "#111827" },
  tabWrap: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 4,
    display: "flex",
    gap: 4,
  },
  tabBtn: {
    border: "none",
    background: "transparent",
    color: "#6b7280",
    fontWeight: 700,
    cursor: "pointer",
    borderRadius: 8,
    fontSize: "0.88rem",
    padding: "10px 18px",
  },
  tabBtnActive: {
    background: "#eff6ff",
    color: "#1d4ed8",
  },
  listWrap: { display: "flex", flexDirection: "column", gap: 16 },
  card: {
    borderRadius: 14,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    padding: 16,
    display: "grid",
    gridTemplateColumns: "160px 1.2fr 0.8fr 0.9fr",
    alignItems: "center",
    gap: 18,
  },
  carImage: { width: "100%", height: 98, objectFit: "cover", borderRadius: 10 },
  carInfo: { display: "flex", flexDirection: "column", gap: 6 },
  carName: { margin: 0, fontSize: "1.2rem", fontWeight: 900 },
  meta: { margin: 0, color: "#6b7280", fontWeight: 500, letterSpacing: "0.4px", fontSize: "0.8rem" },
  dateCol: { display: "flex", flexDirection: "column", gap: 4 },
  label: { margin: 0, fontSize: "0.72rem", fontWeight: 800, color: "#9ca3af", letterSpacing: "1.3px" },
  value: { margin: 0, fontWeight: 700, fontSize: "1rem" },
  amountCol: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 },
  amount: { margin: 0, fontWeight: 900, color: "#1d4ed8", fontSize: "1.9rem" },
  badge: {
    borderRadius: 999,
    padding: "6px 12px",
    fontWeight: 800,
    fontSize: "0.72rem",
    letterSpacing: "0.6px",
  },
  badgePaid: { color: "#047857", background: "#d1fae5" },
  badgePending: { color: "#b45309", background: "#ffedd5" },
  infoText: {
    background: "#ffffff",
    border: "1px dashed #d1d5db",
    borderRadius: 10,
    padding: "24px 18px",
    margin: 0,
    color: "#6b7280",
    textAlign: "center",
    fontWeight: 600,
  },
  errorText: {
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    borderRadius: 10,
    padding: "18px",
    margin: 0,
    color: "#be123c",
    textAlign: "center",
    fontWeight: 700,
  },
  modalOverlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(17, 24, 39, 0.7)", backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
    padding: 20
  },
  modalContent: {
    background: "#ffffff", width: "100%", maxWidth: 640,
    borderRadius: 16, padding: "32px",
    maxHeight: "88vh", overflowY: "auto",
    position: "relative",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
  },
  modalCloseBtn: {
    position: "absolute", top: 20, right: 20,
    background: "#f3f4f6", border: "none",
    width: 36, height: 36, borderRadius: "50%",
    cursor: "pointer", fontWeight: "bold", color: "#4b5563",
    fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center",
    transition: "background 0.2s"
  },
  modalTitle: {
    margin: "0 0 24px 0", fontSize: "1.6rem", fontWeight: 900, color: "#111827",
    borderBottom: "2px solid #f3f4f6", paddingBottom: 16
  },
  modalBody: {
    display: "flex", flexDirection: "column", gap: 20
  },
  modalSection: {
    background: "#f9fafb", padding: 20, borderRadius: 12, border: "1px solid #e5e7eb"
  },
  sectionTitle: {
    margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: 800, color: "#374151"
  },
  gridList: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px",
    fontSize: "0.95rem", color: "#4b5563"
  },
  flexBetween: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: 10, fontSize: "0.95rem", color: "#4b5563"
  },
  divider: {
    border: "none", borderTop: "1px dashed #d1d5db", margin: "16px 0"
  },
  totalAmount: {
    fontSize: "1.2rem", color: "#111827", fontWeight: 800
  },
  depositAmountText: {
    fontSize: "1.3rem", color: "#1d4ed8", fontWeight: 900, margin: 0
  }
};
