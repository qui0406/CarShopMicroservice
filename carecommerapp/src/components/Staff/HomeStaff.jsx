import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "./StaffLayout";
import { authApis, endpoints } from "../../configs/APIs";

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");

/* ─── Donut SVG ────────────────────────────────── */
function DonutChart({ data, total }) {
  const R = 70, CX = 90, CY = 90;
  const circumference = 2 * Math.PI * R;
  let cumulative = 0;
  const slices = data.map((d) => {
    const dash = (d.pct / 100) * circumference;
    const offset = -((cumulative / 100) * circumference) + circumference * 0.25;
    cumulative += d.pct;
    return { ...d, dash, offset };
  });
  return (
    <svg width="180" height="180" viewBox="0 0 180 180">
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f3f4f6" strokeWidth="22" />
      {slices.map((s, i) => (
        <circle key={i} cx={CX} cy={CY} r={R} fill="none" stroke={s.color}
          strokeWidth="22"
          strokeDasharray={`${s.dash} ${circumference - s.dash}`}
          strokeDashoffset={s.offset}
          style={{ transition: "stroke-dasharray 0.6s ease" }} />
      ))}
      <text x={CX} y={CY - 6} textAnchor="middle" fontSize="22" fontWeight="800" fill="#111827">{total}</text>
      <text x={CX} y={CY + 14} textAnchor="middle" fontSize="11" fill="#6b7280" fontWeight="600">TOTAL</text>
    </svg>
  );
}

/* ─── Main ─────────────────────────────────────── */
export default function HomeStaff() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, paid: 0, cancelled: 0, totalOrders: 0 });
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [carStats, setCarStats] = useState({ total: 0, brands: [] });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchStatusCount(), fetchMonthlyRevenue(), fetchCars(), fetchRecentOrders()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusCount = async () => {
    try {
      const res = await authApis().get(endpoints["get-status-count"]);
      const d = res.data?.result || {};
      setStats({
        totalOrders: (d.PENDING || 0) + (d.PAID || 0) + (d.CANCELLED || 0) + (d.CONFIRMED || 0) + (d.DEPOSITED || 0) + (d.WAITING_FOR_PAID || 0),
        pending: d.PENDING || 0,
        paid: (d.PAID || 0) + (d.CONFIRMED || 0),
        cancelled: d.CANCELLED || 0,
      });
    } catch {
      setStats({ pending: 0, paid: 0, cancelled: 0, totalOrders: 0 });
    }
  };

  const fetchMonthlyRevenue = async () => {
    try {
      const year = new Date().getFullYear();
      const res = await authApis().get(endpoints["get-stats-revenue"](year));
      const d = res.data?.result || res.data || [];
      const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      // Backend may return array of {month, revenue} or object keyed by month
      let arr = [];
      if (Array.isArray(d)) {
        arr = d.map((item, i) => ({
          month: item.label || MONTHS[item.month != null ? item.month - 1 : i] || MONTHS[i],
          value: item.totalRevenue || item.revenue || item.value || item.total || 0,
        }));
      } else {
        arr = Object.entries(d).map(([k, v]) => ({
          month: MONTHS[parseInt(k) - 1] || k,
          value: typeof v === "number" ? v : v?.revenue || 0,
        }));
      }
      setMonthlyRevenue(arr.length ? arr : MONTHS.slice(0, 6).map(m => ({ month: m, value: 0 })));
    } catch { setMonthlyRevenue([]); }
  };

  const fetchCars = async () => {
    try {
      const res = await authApis().get(endpoints["get-cars"](1, 100));
      const d = res.data?.result || res.data || {};
      const list = Array.isArray(d.data) ? d.data : [];
      setCarStats({ total: d.totalElements || list.length });
    } catch { }
  };

  const fetchRecentOrders = async () => {
    try {
      const res = await authApis().get(endpoints["get-all-orders-management"](1, 5));
      const d = res.data?.result || res.data || {};
      console.log(d);
      const list = Array.isArray(d.data) ? d.data : (Array.isArray(d) ? d : []);
      setRecentOrders(list);
    } catch { setRecentOrders([]); }
  };

  const CHART_H = 160;
  const maxBar = monthlyRevenue.length ? Math.max(...monthlyRevenue.map(d => d.value), 1) : 1;
  const sorted = [...monthlyRevenue].sort((a, b) => b.value - a.value);

  const statusCards = [
    { label: "TỔNG ĐƠN HÀNG", value: stats.totalOrders, color: "#1d4ed8" },
    { label: "CHỜ XỬ LÝ", value: stats.pending, color: "#f59e0b" },
    { label: "ĐÃ HOÀN TẤT", value: stats.paid, color: "#10b981" },
    { label: "ĐÃ HỦY", value: stats.cancelled, color: "#ef4444" },
  ];

  const getOrderStatus = (s) => {
    const m = {
      PENDING: { text: "Chờ xử lý", color: "#d97706", bg: "#fffbeb" },
      PAID: { text: "Đã TT", color: "#15803d", bg: "#f0fdf4" },
      CONFIRMED: { text: "Xác nhận", color: "#1d4ed8", bg: "#eff6ff" },
      CANCELLED: { text: "Đã hủy", color: "#dc2626", bg: "#fef2f2" },
    };
    return m[s] || { text: s || "—", color: "#6b7280", bg: "#f3f4f6" };
  };

  return (
    <StaffLayout>
      <div className="px-8 py-6 pb-20">

        {/* Title */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-black text-gray-900 leading-tight">Bảng điều khiển</h2>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchAll} className="px-4 py-2 text-sm font-bold border border-gray-200 rounded bg-white hover:bg-gray-50 transition-colors shadow-sm">
              Làm mới
            </button>
            <button onClick={() => navigate("/staff/create-car")} className="px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm">
              Thêm xe mới
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {loading
            ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-pulse">
                <div className="h-2 bg-gray-100 rounded w-3/4 mb-4" />
                <div className="h-7 bg-gray-100 rounded w-1/2" />
              </div>
            ))
            : statusCards.map(card => (
              <div key={card.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
                style={{ borderLeft: `4px solid ${card.color}` }}>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{card.label}</p>
                <p className="text-2xl font-black text-gray-900">{card.value}</p>
              </div>
            ))
          }
        </div>

        {/* Charts */}
        <div className="grid grid-cols-3 gap-4 mb-6">

          {/* Bar Chart — Monthly Revenue */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-black text-gray-900 text-lg">Doanh thu theo tháng</h3>
                <p className="text-xs text-gray-400 font-medium">Năm {new Date().getFullYear()}</p>
              </div>
            </div>
            {loading ? (
              <div className="flex items-end gap-5 h-44 px-2 animate-pulse">
                {[40, 65, 50, 75, 85, 100].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full rounded-t bg-gray-100" style={{ height: `${h}%` }} />
                    <div className="h-2 bg-gray-100 rounded w-8" />
                  </div>
                ))}
              </div>
            ) : monthlyRevenue.length === 0 ? (
              <div className="flex items-center justify-center h-44 text-gray-400 text-sm">Chưa có dữ liệu</div>
            ) : (
              <div className="flex items-end gap-3 px-2" style={{ height: CHART_H + 24 }}>
                {monthlyRevenue.map((d) => {
                  const barH = Math.round((d.value / maxBar) * CHART_H);
                  const isHighest = d.value === maxBar;
                  const isTop2 = sorted[1] && d.value >= sorted[1].value;
                  return (
                    <div key={d.month} className="flex-1 flex flex-col items-center justify-end gap-2" style={{ height: CHART_H + 24 }}>
                      <div className="w-full rounded-t transition-all duration-700"
                        title={`${fmt(d.value)} VND`}
                        style={{ height: barH, backgroundColor: isHighest ? "#1d4ed8" : isTop2 ? "#3b82f6" : "#bfdbfe" }} />
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{d.month}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order Status Donut */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-black text-gray-900 text-lg mb-0.5">Trạng thái đơn hàng</h3>
            <p className="text-xs text-gray-400 font-medium mb-4">Tổng quan hiện tại</p>
            {loading ? (
              <div className="flex flex-col items-center gap-4 animate-pulse">
                <div className="w-44 h-44 rounded-full border-[22px] border-gray-100" />
                <div className="space-y-2 w-full">
                  {[1, 2, 3].map(i => <div key={i} className="h-3 bg-gray-100 rounded w-full" />)}
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  <DonutChart
                    data={[
                      { name: "Chờ xử lý", pct: stats.totalOrders ? Math.round(stats.pending / stats.totalOrders * 100) : 0, color: "#f59e0b" },
                      { name: "Hoàn tất", pct: stats.totalOrders ? Math.round(stats.paid / stats.totalOrders * 100) : 0, color: "#10b981" },
                      { name: "Đã hủy", pct: stats.totalOrders ? Math.round(stats.cancelled / stats.totalOrders * 100) : 0, color: "#ef4444" },
                    ]}
                    total={stats.totalOrders}
                  />
                </div>
                <div className="space-y-2">
                  {[
                    { name: "Chờ xử lý", count: stats.pending, color: "#f59e0b" },
                    { name: "Hoàn tất", count: stats.paid, color: "#10b981" },
                    { name: "Đã hủy", count: stats.cancelled, color: "#ef4444" },
                  ].map(b => (
                    <div key={b.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                        <span className="text-gray-700 font-medium">{b.name}</span>
                      </div>
                      <span className="font-black text-gray-900">{b.count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-baseline">
            <div>
              <h3 className="font-black text-gray-900 text-lg">Đơn hàng gần đây</h3>
              <p className="text-xs text-gray-400 font-medium">5 đơn hàng mới nhất từ hệ thống</p>
            </div>
            <button onClick={() => navigate("/staff/home/cashier")} className="text-blue-600 text-xs font-black tracking-wider hover:underline uppercase">
              Xem tất cả
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                {["Mã đơn", "Khách hàng", "Xe", "Số tiền", "Trạng thái"].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array(3).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array(5).fill(0).map((__, j) => <td key={j} className="px-6 py-4"><div className="h-3 bg-gray-100 rounded w-24" /></td>)}
                  </tr>
                ))
                : recentOrders.length === 0
                  ? <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-sm">Chưa có đơn hàng nào</td></tr>
                  : recentOrders.map((o, i) => {
                    const st = getOrderStatus(o.status || o.orderStatus);
                    return (
                      <tr key={o.id || i} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => navigate("/staff/home/cashier")}>
                        <td className="px-6 py-4 text-[11px] font-black text-blue-600">#{String(o.id || i + 1).slice(-6)}</td>
                        <td className="px-6 py-4 font-medium text-gray-800">{o.orderItem?.fullName || o.fullName || o.customerName || "—"}</td>
                        <td className="px-6 py-4 text-gray-600">{o.orderItem?.carName || o.orderItem?.car?.name || o.orderItem?.carModel?.name || o.carName || "—"}</td>
                        <td className="px-6 py-4 font-bold text-gray-800">{fmt(o.totalAmount || o.price)} đ</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 text-[10px] font-black rounded uppercase tracking-wider"
                            style={{ color: st.color, backgroundColor: st.bg }}>
                            {st.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>

      </div>

      <footer className="h-10 bg-white border-t border-gray-100 flex items-center justify-between px-8 shrink-0">

        <div className="flex gap-5 text-[9px] font-bold text-gray-500 tracking-widest uppercase">
        </div>
      </footer>
    </StaffLayout>
  );
}