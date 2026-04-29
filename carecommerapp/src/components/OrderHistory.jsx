import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authApis, endpoints } from "../configs/APIs";
import { MyUserContext } from "../configs/MyContexts";

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
  const paymentStatus = (raw?.paymentStatus || "").toUpperCase();
  const depositAmount =
    raw?.depositAmount ??
    raw?.amount ??
    raw?.totalDeposit ??
    raw?.price * 0.1 ??
    0;

  return {
    id: raw?.id || orderCode,
    orderCode: `ORD-${String(orderCode).slice(0, 8).toUpperCase()}`,
    createdAt: raw?.createdAt || raw?.orderDate || raw?.createdDate,
    carName,
    carImage,
    depositAmount,
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
  const [activeTab, setActiveTab] = useState(
    location.pathname.includes("/all-my-reserve") ? "PENDING" : "ALL"
  );

  useEffect(() => {
    if (user !== undefined && user === null) {
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
        setOrders(normalized);
      } catch (err) {
        setError(err?.response?.data?.message || "Không thể tải lịch sử đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchOrders();
  }, [user]);

  const filteredOrders = useMemo(() => {
    if (activeTab === "ALL") return orders;
    if (activeTab === "PAID") return orders.filter((o) => o.paymentStatus === "PAID");
    return orders.filter((o) => o.paymentStatus !== "PAID");
  }, [orders, activeTab]);

  return (
    <div style={s.page}>
      <header style={s.topbar}>
        <button style={s.brand} onClick={() => navigate("/home")}>
          PRECISION MOTORS
        </button>
        <div style={s.navLinks}>
          <Link style={s.navLink} to="/car-new">Kho Xe</Link>
          <Link style={s.navLink} to="/quotation/1">Cấu Hình</Link>
          <span style={{ ...s.navLink, ...s.navLinkActive }}>Lịch Sử Đơn Hàng</span>
          <Link style={s.navLink} to="/about">Hỗ Trợ</Link>
        </div>
      </header>

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
              const paid = order.paymentStatus === "PAID";
              return (
                <article key={order.id} style={s.card}>
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
                    <p style={s.label}>SỐ TIỀN ĐẶT CỌC</p>
                    <p style={s.amount}>{money(order.depositAmount)}</p>
                    <span style={{ ...s.badge, ...(paid ? s.badgePaid : s.badgePending) }}>
                      {paid ? "ĐÃ THANH TOÁN" : "CHỜ THANH TOÁN"}
                    </span>
                  </div>
                </article>
              );
            })}
        </section>
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
  },
  topbar: {
    height: 74,
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    padding: "0 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    border: "none",
    background: "none",
    fontSize: "1.6rem",
    fontWeight: 900,
    letterSpacing: "-0.5px",
    color: "#111827",
    cursor: "pointer",
  },
  navLinks: { display: "flex", alignItems: "center", gap: 30 },
  navLink: {
    fontSize: "1rem",
    color: "#4b5563",
    textDecoration: "none",
    paddingBottom: 6,
    borderBottom: "2px solid transparent",
    fontWeight: 500,
  },
  navLinkActive: { color: "#1f4ed8", borderBottomColor: "#1f4ed8", fontWeight: 700 },
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
  carName: { margin: 0, fontSize: "1.9rem", fontWeight: 900, textTransform: "uppercase" },
  meta: { margin: 0, color: "#6b7280", fontWeight: 500, letterSpacing: "0.4px" },
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
};
