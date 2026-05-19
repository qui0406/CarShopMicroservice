import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import cookie from "react-cookies";
import { authApis, endpoints } from "../../configs/APIs";
import adminAvatar from "../../static/avatar.png";

/* ─── Nav config ─────────────────────────────────────────── */
const NAV = [
  { icon: "⊞", label: "BẢNG ĐIỀU KHIỂN", key: "dashboard", to: "/admin" },
  { icon: "👥", label: "NGƯỜI DÙNG", key: "users", to: "/admin/users" },
];

/* ─── Mock revenue data (JAN–AUG) ───────────────────────── */
const REVENUE_POINTS = [
  { m: "JAN", v: 210 }, { m: "FEB", v: 290 }, { m: "MAR", v: 340 },
  { m: "APR", v: 420 }, { m: "MAY", v: 390 }, { m: "JUN", v: 510 },
  { m: "JUL", v: 480 }, { m: "AUG", v: 440 },
];
const PROJ_POINTS = [
  { m: "JAN", v: 240 }, { m: "FEB", v: 310 }, { m: "MAR", v: 370 },
  { m: "APR", v: 450 }, { m: "MAY", v: 430 }, { m: "JUN", v: 540 },
  { m: "JUL", v: 520 }, { m: "AUG", v: 490 },
];

const BRANDS = [
  { name: "Mercedes-Benz", units: 842, max: 842 },
  { name: "BMW", units: 761, max: 842 },
  { name: "Audi", units: 540, max: 842 },
  { name: "Porsche", units: 210, max: 842 },
];

const FEED = [
  { dot: "#2563eb", user: "Qui", action: "vừa thêm BMW M4 Competition", time: "2 phút trước", tag: "Kho xe" },
  { dot: "#9ca3af", user: "Nhân viên #123", action: "cập nhật giá cho Tesla Model S", time: "14 phút trước", tag: "Giá cả" },
  { dot: "#9ca3af", user: "Hệ thống", action: "xác minh ID người bán: #9822", time: "1 giờ trước", tag: "Bảo mật" },
  { dot: "#2563eb", user: "Qui", action: "thay đổi tin đăng Audi RS6", time: "2 giờ trước", tag: "Kiểm duyệt" },
];

/* ─── SVG Line Chart ─────────────────────────────────────── */
function LineChart({ points, projPoints }) {
  const W = 460, H = 180, PAD = 20;
  if (!points || points.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-gray-400 font-bold text-xs uppercase tracking-wider">
        Không có dữ liệu thống kê
      </div>
    );
  }
  const vals = points.map(p => p.v);
  const pvals = projPoints ? projPoints.map(p => p.v) : [];
  const allV = [...vals, ...pvals];
  const minV = Math.min(...allV, 0);
  let maxV = Math.max(...allV, 1000000);
  if (maxV === minV) maxV = minV + 1;

  const xs = points.map((_, i) => PAD + (i / Math.max(points.length - 1, 1)) * (W - PAD * 2));
  const ys = vals.map(v => H - PAD - ((v - minV) / (maxV - minV)) * (H - PAD * 2));
  const pys = pvals.map(v => H - PAD - ((v - minV) / (maxV - minV)) * (H - PAD * 2));

  // Smooth using cubic bezier approximation
  const smooth = (pts) => pts.reduce((acc, [x, y], i, arr) => {
    if (i === 0) return `M${x},${y}`;
    const [px, py] = arr[i - 1];
    const cpx = (px + x) / 2;
    return acc + ` C${cpx},${py} ${cpx},${y} ${x},${y}`;
  }, "");

  const revPath = xs.length > 0 ? smooth(xs.map((x, i) => [x, ys[i]])) : "";
  const projPath = xs.length > 0 && pvals.length > 0 ? smooth(xs.map((x, i) => [x, pys[i]])) : "";
  const areaPath = xs.length > 0 && revPath ? (revPath + ` L${xs[xs.length - 1]},${H - PAD} L${xs[0]},${H - PAD} Z`) : "";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full animate-in fade-in" style={{ height: 180 }}>
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(t => {
        const y = PAD + t * (H - PAD * 2);
        return <line key={t} x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#f3f4f6" strokeWidth="1" />;
      })}
      {/* Area fill */}
      {areaPath && <path d={areaPath} fill="url(#revGrad)" />}
      {/* Projection line */}
      {projPath && <path d={projPath} fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="4 3" />}
      {/* Revenue line */}
      {revPath && <path d={revPath} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
      {/* Dots */}
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r="3" fill="#2563eb" stroke="#fff" strokeWidth="1.5" />
      ))}
      {/* X labels */}
      {points.map((p, i) => {
        const showLabel = points.length <= 12 || i % Math.ceil(points.length / 6) === 0 || i === points.length - 1;
        if (!showLabel) return null;
        return (
          <text key={i} x={xs[i]} y={H - 2} textAnchor="middle" fontSize="8" fill="#9ca3af" fontWeight="600">
            {p.m}
          </text>
        );
      })}
    </svg>
  );
}

/* ─── SVG Bar Chart ──────────────────────────────────────── */
function BarChart({ data }) {
  const W = 460, H = 180, PAD_TOP = 20, PAD_BOT = 30, PAD_LEFT = 40, PAD_RIGHT = 20;
  if (!data || data.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-gray-400 font-bold text-xs uppercase tracking-wider">
        Không có dữ liệu thương hiệu
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.units), 1);
  const chartW = W - PAD_LEFT - PAD_RIGHT;
  const chartH = H - PAD_TOP - PAD_BOT;
  const barWidth = Math.min(32, (chartW / data.length) * 0.6);
  const barGap = (chartW - (barWidth * data.length)) / (data.length + 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
        const y = PAD_TOP + chartH * (1 - ratio);
        const gridVal = Math.round(maxVal * ratio);
        return (
          <g key={i} className="opacity-40">
            <line x1={PAD_LEFT} y1={y} x2={W - PAD_RIGHT} y2={y} stroke="#f3f4f6" strokeWidth={1} strokeDasharray="3 3" />
            <text x={PAD_LEFT - 8} y={y + 3} textAnchor="end" fontSize="9" fontWeight="900" fill="#9ca3af" fontFamily="sans-serif">
              {gridVal}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const x = PAD_LEFT + barGap + i * (barWidth + barGap);
        const barH = (d.units / maxVal) * chartH;
        const y = PAD_TOP + chartH - barH;

        return (
          <g key={d.name} className="group">
            {/* Dynamic Hover Background */}
            <rect
              x={x - 4}
              y={PAD_TOP - 5}
              width={barWidth + 8}
              height={chartH + 10}
              fill="rgba(59, 130, 246, 0.02)"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              rx={4}
            />

            {/* Gradient Fill Bar */}
            <defs>
              <linearGradient id={`barGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>

            {/* Main Bar */}
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barH, 2)}
              fill={`url(#barGrad-${i})`}
              rx={4}
              className="transition-all duration-500 hover:brightness-110"
            />

            {/* Value Label on top of bar */}
            <text
              x={x + barWidth / 2}
              y={y - 6}
              textAnchor="middle"
              fontSize="9"
              fontWeight="900"
              fill="#2563eb"
              fontFamily="sans-serif"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {d.units}
            </text>

            {/* Brand X-Axis Label */}
            <text
              x={x + barWidth / 2}
              y={H - 10}
              textAnchor="middle"
              fontSize="9"
              fontWeight="900"
              fill="#4b5563"
              fontFamily="sans-serif"
            >
              {d.name.length > 8 ? d.name.slice(0, 7) + ".." : d.name}
            </text>
          </g>
        );
      })}

      {/* X Axis line */}
      <line x1={PAD_LEFT} y1={PAD_TOP + chartH} x2={W - PAD_RIGHT} y2={PAD_TOP + chartH} stroke="#e5e7eb" strokeWidth={1} />
    </svg>
  );
}

/* ─── NavItem ────────────────────────────────────────────── */
function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-5 py-3 text-xs font-black tracking-widest text-left transition-colors ${active
        ? "text-blue-600 border-l-4 border-blue-600 bg-blue-50/60 pl-4"
        : "text-gray-400 border-l-4 border-transparent hover:bg-gray-50 hover:text-gray-700"
        }`}>
      <span className="text-sm">{icon}</span>
      {label}
    </button>
  );
}

/* ─── KPI Card ───────────────────────────────────────────── */
function KpiCard({ title, value, sub, subIcon, badge, badgeUp, miniChart, avatars }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between min-h-[130px]">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{title}</p>
      <div className="flex items-end justify-between">
        <p className="text-[26px] font-black text-gray-900 leading-none">{value}</p>
        {miniChart && (
          <div className="flex items-end gap-0.5 h-8">
            {[30, 50, 40, 70, 60, 80, 65].map((h, i) => (
              <div key={i} className="w-1.5 rounded-sm" style={{ height: `${h}%`, backgroundColor: i === 5 ? "#2563eb" : "#bfdbfe" }} />
            ))}
          </div>
        )}
        {avatars && (
          <div className="flex -space-x-2">
            {avatars.map((src, i) => (
              <img key={i} src={src} alt="user" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
            ))}
            <div className="w-6 h-6 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[8px] font-black text-blue-600">+2</div>
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        {badge && (
          <span className={`text-xs font-bold flex items-center gap-0.5 ${badgeUp ? "text-emerald-600" : "text-gray-400"}`}>
            {badgeUp && "↑"}{badge}
          </span>
        )}
        {sub && <span className="text-[11px] text-gray-400 font-medium">{sub}</span>}
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Statistics state
  const [revenueData, setRevenueData] = useState([]);
  const [brandSales, setBrandSales] = useState([]);
  const [statsYear, setStatsYear] = useState(2026);
  const [statsMonth, setStatsMonth] = useState(""); // "" means full year

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch revenue stats
      const revRes = await authApis().get(endpoints["get-stats-revenue"](statsYear, statsMonth));
      setRevenueData(revRes.data?.result || []);

      // Fetch brand sales stats
      const brandRes = await authApis().get(endpoints["get-stats-brands"](statsYear, statsMonth));
      setBrandSales(brandRes.data?.result || []);
    } catch (err) {
      console.error("Failed to fetch statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [statsYear, statsMonth]);

  const Skeleton = ({ w = "100%", h = 12, className = "" }) => (
    <div className={`animate-pulse bg-gray-100 rounded ${className}`} style={{ width: w, height: h }} />
  );

  // Transform data for line chart
  const chartPoints = revenueData.map(item => ({
    m: item.label.replace("Tháng ", "T"),
    v: Number(item.totalRevenue || 0)
  }));

  const projPoints = chartPoints.map(p => ({
    m: p.m,
    v: p.v * 1.1 // Target 10% higher for target projection line
  }));

  // KPI Calculations
  const totalRevSum = revenueData.reduce((sum, item) => sum + Number(item.totalRevenue || 0), 0);
  const formattedTotalRev = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalRevSum);
  const totalCarsSold = brandSales.reduce((sum, b) => sum + Number(b.quantitySold || 0), 0);
  const totalOrdersCount = revenueData.reduce((sum, item) => sum + Number(item.totalOrders || 0), 0);

  // Brand sales calculations
  const maxUnits = brandSales.reduce((max, b) => Math.max(max, Number(b.quantitySold || 0)), 1);
  const formattedBrands = brandSales.map(b => ({
    name: b.brandName || "Không xác định",
    units: Number(b.quantitySold || 0),
    max: maxUnits
  }));

  return (
    <div className="flex h-screen bg-white font-sans text-gray-900 overflow-hidden animate-in fade-in">

      {/* ─── SIDEBAR ─────────────────────────────────────── */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shrink-0 h-full">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">

        </div>

        {/* Nav */}
        <nav className="flex-1 py-3">
          {NAV.map(item => (
            <NavItem key={item.key} icon={item.icon} label={item.label}
              active={activeNav === item.key}
              onClick={() => { setActiveNav(item.key); if (item.to) navigate(item.to); }}
            />
          ))}
        </nav>

        {/* Bottom */}
        <div className="pb-5 border-t border-gray-100 pt-3">
          <NavItem icon="❓" label="HỖ TRỢ" active={false} onClick={() => { }} />
          <NavItem icon="↪" label="ĐĂNG XUẤT" active={false} onClick={() => {
            cookie.remove("token");
            navigate("/login");
          }} />
        </div>
      </aside>

      {/* ─── MAIN ────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">

        {/* TOP BAR */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-8 gap-5 shrink-0">
          {/* Search */}
          <div className="relative max-w-xs w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm thông số..."
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
              <img src={adminAvatar} alt="admin" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">

          {/* Page header */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Tổng quan điều hành</p>
              <h2 className="text-3xl font-black text-gray-900 leading-tight">Bảng tổng quan</h2>
            </div>
            <div className="flex gap-3">
              {/* Year Selector */}
              <select
                value={statsYear}
                onChange={e => setStatsYear(Number(e.target.value))}
                className="px-4 py-2 border border-gray-200 bg-white text-xs font-bold text-gray-700 rounded-xl hover:bg-gray-50 shadow-sm focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value={2026}>Năm 2026</option>
                <option value={2025}>Năm 2025</option>
                <option value={2024}>Năm 2024</option>
              </select>

              {/* Month Selector */}
              <select
                value={statsMonth}
                onChange={e => setStatsMonth(e.target.value)}
                className="px-4 py-2 border border-gray-200 bg-white text-xs font-bold text-gray-700 rounded-xl hover:bg-gray-50 shadow-sm focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">Cả năm</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>Tháng {String(m).padStart(2, "0")}</option>
                ))}
              </select>

            </div>
          </div>

          {/* ── KPI CARDS ── */}
          {loading ? (
            <div className="grid grid-cols-4 gap-4 mb-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-pulse min-h-[130px]">
                  <Skeleton w="60%" h={8} className="mb-4" />
                  <Skeleton w="80%" h={28} className="mb-3" />
                  <Skeleton w="40%" h={8} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 mb-6">
              <KpiCard
                title="Tổng doanh thu" value={formattedTotalRev}
                badgeUp={true}

              />
              <KpiCard
                title="Tổng xe đã bán" value={totalCarsSold}
                sub={`Đến từ ${brandSales.length} hãng xe`}
              />
              <KpiCard
                title="Tổng đơn hàng" value={totalOrdersCount}
                sub="Trong khoảng thời gian đã chọn"
              />
            </div>
          )}

          {/* ── CHARTS + FEED ROW ── */}
          <div className="grid grid-cols-3 gap-4 mb-5">

            {/* Line Chart */}
            <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-900">Phân tích doanh số & Doanh thu</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Biểu đồ thể hiện doanh thu thu ngân</p>
                </div>
              </div>
              {loading ? (
                <div className="h-44 animate-pulse bg-gray-50 rounded-lg" />
              ) : (
                <LineChart points={chartPoints} projPoints={projPoints} />
              )}
            </div>

            {/* Activity Feed */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col">
              <p className="text-xs font-black uppercase tracking-widest text-gray-900 mb-0.5">Luồng hoạt động gần đây</p>
              <p className="text-[11px] text-gray-400 mb-4">Nhật ký sự kiện hệ thống thời gian thực</p>

              <div className="flex-1 space-y-5">
                {loading
                  ? Array(4).fill(0).map((_, i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-100 mt-1 shrink-0" />
                      <div className="flex-1"><Skeleton h={10} className="mb-1.5" /><Skeleton w="60%" h={8} /></div>
                    </div>
                  ))
                  : FEED.map((f, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: f.dot }} />
                      <div>
                        <p className="text-xs text-gray-800 leading-snug">
                          <span className="font-black">{f.user}</span> {f.action}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {f.time} · <span className="text-gray-500 font-bold">{f.tag}</span>
                        </p>
                      </div>
                    </div>
                  ))
                }
              </div>
              <button className="mt-4 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 text-center">
                Xem tất cả nhật ký →
              </button>
            </div>
          </div>

          {/* ── BOTTOM ROW ── */}
          <div className="grid grid-cols-2 gap-4">

            {/* Brand Sales Bar Chart */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <p className="text-xs font-black uppercase tracking-widest text-gray-900 mb-4">Thương hiệu xe bán chạy nhất</p>
              {loading ? (
                <div className="h-44 animate-pulse bg-gray-50 rounded-lg" />
              ) : (
                <BarChart data={formattedBrands} />
              )}
            </div>

            {/* Performance Summary / Customer overview */}
            <div className="bg-gray-900 rounded-xl p-6 flex flex-col justify-between relative overflow-hidden text-white shadow-lg">
              {/* Decorative backgrounds */}
              <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/5" />
              <div className="absolute -right-4 top-4 w-24 h-24 rounded-full bg-blue-600/10" />

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Đội xe hoạt động</p>
                <h3 className="text-lg font-black text-white leading-tight mb-3">Hiệu suất và Tốc độ tăng trưởng</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Hệ thống ghi nhận sự tăng trưởng ổn định trong phân khúc xe SUV sang trọng và xe điện thông minh. Số lượng đơn đặt hàng đã thanh toán tăng trưởng ổn định so với tháng trước.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-5 mt-5">
                {[
                  { label: "Doanh số tốt", value: brandSales[0]?.brandName || "—" },
                  { label: "Số lượng bán", value: brandSales[0] ? `${brandSales[0].quantitySold} Xe` : "0 Xe" },
                  { label: "Tổng xe bán", value: `${totalCarsSold} Xe` }
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">{s.label}</p>
                    <p className="text-sm font-black text-white truncate">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
