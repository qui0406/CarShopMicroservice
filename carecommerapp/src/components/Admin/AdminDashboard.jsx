import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ─── Nav config ─────────────────────────────────────────── */
const NAV = [
  { icon: "⊞",  label: "BẢNG ĐIỀU KHIỂN",   key: "dashboard" },
  { icon: "🚗", label: "KHO XE",    key: "inventory" },
  { icon: "👥", label: "NGƯỜI DÙNG",        key: "users" },
  { icon: "🗃️", label: "DỮ LIỆU GỐC",  key: "master",   to: "/admin/master-data" },
  { icon: "🛡️", label: "KIỂM DUYỆT",   key: "moderation" },
  { icon: "📊", label: "PHÂN TÍCH",    key: "analytics" },
  { icon: "⚙️", label: "CÀI ĐẶT",     key: "settings" },
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
  { name: "BMW",           units: 761, max: 842 },
  { name: "Audi",          units: 540, max: 842 },
  { name: "Porsche",       units: 210, max: 842 },
];

const FEED = [
  { dot: "#2563eb", user: "Qui",         action: "vừa thêm BMW M4 Competition",           time: "2 phút trước", tag: "Kho xe" },
  { dot: "#9ca3af", user: "Nhân viên #123",  action: "cập nhật giá cho Tesla Model S",    time: "14 phút trước", tag: "Giá cả" },
  { dot: "#9ca3af", user: "Hệ thống", action: "xác minh ID người bán: #9822",          time: "1 giờ trước",     tag: "Bảo mật" },
  { dot: "#2563eb", user: "Qui",         action: "thay đổi tin đăng Audi RS6",          time: "2 giờ trước",    tag: "Kiểm duyệt" },
];

/* ─── SVG Line Chart ─────────────────────────────────────── */
function LineChart({ points, projPoints }) {
  const W = 460, H = 180, PAD = 16;
  const vals  = points.map(p => p.v);
  const pvals = projPoints.map(p => p.v);
  const allV  = [...vals, ...pvals];
  const minV  = Math.min(...allV) - 30;
  const maxV  = Math.max(...allV) + 20;
  const xs    = points.map((_, i) => PAD + (i / (points.length - 1)) * (W - PAD * 2));
  const ys    = vals.map(v => H - PAD - ((v - minV) / (maxV - minV)) * (H - PAD * 2));
  const pys   = pvals.map(v => H - PAD - ((v - minV) / (maxV - minV)) * (H - PAD * 2));

  const polyline = xs.map((x, i) => `${x},${ys[i]}`).join(" ");
  const projline = xs.map((x, i) => `${x},${pys[i]}`).join(" ");

  // Area fill path
  const areaD = `M${xs[0]},${ys[0]} ` + xs.slice(1).map((x, i) => `L${x},${ys[i+1]}`).join(" ")
    + ` L${xs[xs.length-1]},${H-PAD} L${xs[0]},${H-PAD} Z`;

  // Smooth using cubic bezier approximation
  const smooth = (pts) => pts.reduce((acc, [x, y], i, arr) => {
    if (i === 0) return `M${x},${y}`;
    const [px, py] = arr[i - 1];
    const cpx = (px + x) / 2;
    return acc + ` C${cpx},${py} ${cpx},${y} ${x},${y}`;
  }, "");

  const revPath = smooth(xs.map((x, i) => [x, ys[i]]));
  const projPath = smooth(xs.map((x, i) => [x, pys[i]]));
  const areaPath = revPath + ` L${xs[xs.length-1]},${H-PAD} L${xs[0]},${H-PAD} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}>
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0.25,0.5,0.75,1].map(t => {
        const y = PAD + t * (H - PAD * 2);
        return <line key={t} x1={PAD} y1={y} x2={W-PAD} y2={y} stroke="#f3f4f6" strokeWidth="1"/>;
      })}
      {/* Area fill */}
      <path d={areaPath} fill="url(#revGrad)"/>
      {/* Projection line */}
      <path d={projPath} fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="4 3"/>
      {/* Revenue line */}
      <path d={revPath} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Dots */}
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r="4" fill="#2563eb" stroke="#fff" strokeWidth="2"/>
      ))}
      {/* X labels */}
      {points.map((p, i) => (
        <text key={i} x={xs[i]} y={H-2} textAnchor="middle" fontSize="9" fill="#9ca3af" fontWeight="600">
          {p.m}
        </text>
      ))}
    </svg>
  );
}

/* ─── NavItem ────────────────────────────────────────────── */
function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-5 py-3 text-xs font-black tracking-widest text-left transition-colors ${
        active
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
            {[30,50,40,70,60,80,65].map((h,i)=>(
              <div key={i} className="w-1.5 rounded-sm" style={{height:`${h}%`, backgroundColor: i===5?"#2563eb":"#bfdbfe"}}/>
            ))}
          </div>
        )}
        {avatars && (
          <div className="flex -space-x-2">
            {avatars.map((src,i)=>(
              <img key={i} src={src} alt="user" className="w-6 h-6 rounded-full border-2 border-white object-cover"/>
            ))}
            <div className="w-6 h-6 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[8px] font-black text-blue-600">+2</div>
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        {badge && (
          <span className={`text-xs font-bold flex items-center gap-0.5 ${badgeUp ? "text-emerald-600":"text-gray-400"}`}>
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
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const Skeleton = ({ w = "100%", h = 12, className = "" }) => (
    <div className={`animate-pulse bg-gray-100 rounded ${className}`} style={{ width: w, height: h }}/>
  );

  return (
    <div className="flex h-screen bg-white font-sans text-gray-900 overflow-hidden">

      {/* ─── SIDEBAR ─────────────────────────────────────── */}
      <aside className="w-52 bg-white border-r border-gray-100 flex flex-col shrink-0 h-full">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <p className="text-base font-black text-gray-900 leading-tight">FleetManager</p>
          <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mt-0.5">Precision Logistics</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3">
          {NAV.map(item => (
            <NavItem key={item.key} icon={item.icon} label={item.label}
              active={activeNav === item.key}
              onClick={() => { setActiveNav(item.key); if(item.to) navigate(item.to); }}
            />
          ))}
        </nav>

        {/* Bottom */}
        <div className="pb-5 border-t border-gray-100 pt-3">
          <NavItem icon="❓" label="HỖ TRỢ" active={false} onClick={() => {}}/>
          <NavItem icon="↪"  label="ĐĂNG XUẤT"  active={false} onClick={() => navigate("/login")}/>
        </div>
      </aside>

      {/* ─── MAIN ────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">

        {/* TOP BAR */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-8 gap-5 shrink-0">
          <h1 className="text-base font-black text-gray-900 shrink-0">PrecisionDrive Admin</h1>
          {/* Search */}
          <div className="relative max-w-xs w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm kiếm thông số..."
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <button className="text-gray-400 hover:text-gray-700 text-lg">🔔</button>
            <button className="text-gray-400 hover:text-gray-700 text-lg">❓</button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&q=80&fit=crop&crop=face" alt="admin" className="w-full h-full object-cover"/>
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
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-sm font-bold text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-colors">
                📅 30 ngày qua
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
                📥 Xuất báo cáo
              </button>
            </div>
          </div>

          {/* ── KPI CARDS ── */}
          {loading ? (
            <div className="grid grid-cols-4 gap-4 mb-6">
              {Array(4).fill(0).map((_,i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-pulse min-h-[130px]">
                  <Skeleton w="60%" h={8} className="mb-4"/>
                  <Skeleton w="80%" h={28} className="mb-3"/>
                  <Skeleton w="40%" h={8}/>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <KpiCard
                title="Tổng doanh thu" value="$4,281,090"
                badge="+12.4%" badgeUp={true}
                miniChart={true}
              />
              <KpiCard
                title="Tin đăng hoạt động" value="12,842"
                sub="Trực tiếp trên 14 thị trường"
              />
              <KpiCard
                title="Người dùng mới" value="849"
                sub="+42 hôm nay"
                avatars={[
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&q=80&fit=crop&crop=face",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&q=80&fit=crop&crop=face",
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&q=80&fit=crop&crop=face",
                ]}
              />
              <KpiCard
                title="Tổng mẫu xe" value="312"
                sub="42 nhà sản xuất đã đăng ký"
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
                  <p className="text-[11px] text-gray-400 mt-0.5">So sánh hiệu suất hàng tháng</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600"/>
                    <span className="text-[10px] font-black text-gray-600 uppercase">Doanh thu</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300"/>
                    <span className="text-[10px] font-black text-gray-400 uppercase">Dự kiến</span>
                  </div>
                </div>
              </div>
              {loading ? (
                <div className="h-44 animate-pulse bg-gray-50 rounded-lg"/>
              ) : (
                <LineChart points={REVENUE_POINTS} projPoints={PROJ_POINTS}/>
              )}
            </div>

            {/* Activity Feed */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col">
              <p className="text-xs font-black uppercase tracking-widest text-gray-900 mb-0.5">Luồng hoạt động gần đây</p>
              <p className="text-[11px] text-gray-400 mb-4">Nhật ký sự kiện hệ thống thời gian thực</p>

              <div className="flex-1 space-y-5">
                {loading
                  ? Array(4).fill(0).map((_,i) => (
                      <div key={i} className="flex gap-3 animate-pulse">
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-100 mt-1 shrink-0"/>
                        <div className="flex-1"><Skeleton h={10} className="mb-1.5"/><Skeleton w="60%" h={8}/></div>
                      </div>
                    ))
                  : FEED.map((f,i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: f.dot }}/>
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

            {/* Top Selling Brands */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <p className="text-xs font-black uppercase tracking-widest text-gray-900 mb-5">Thương hiệu bán chạy nhất</p>
              {loading
                ? Array(4).fill(0).map((_,i) => (
                    <div key={i} className="mb-4 animate-pulse">
                      <div className="flex justify-between mb-1.5"><Skeleton w="30%" h={10}/><Skeleton w="20%" h={10}/></div>
                      <Skeleton h={6} className="rounded-full"/>
                    </div>
                  ))
                : BRANDS.map(b => (
                    <div key={b.name} className="mb-4 last:mb-0">
                      <div className="flex justify-between items-baseline mb-1.5">
                        <span className="text-sm font-bold text-gray-800">{b.name}</span>
                        <span className="text-[11px] font-black text-blue-600">{b.units.toLocaleString()} Chiếc</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-700"
                          style={{ width: `${(b.units / b.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
              }
            </div>

            {/* Inventory Status */}
            <div className="bg-gray-900 rounded-xl p-6 flex flex-col justify-between relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/5"/>
              <div className="absolute -right-4 top-4 w-24 h-24 rounded-full bg-blue-600/10"/>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Tình trạng kho hàng</p>
                <h3 className="text-xl font-black text-white leading-tight mb-3">Hiệu suất hạm đội hoạt động</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">
                  Phân tích hệ thống cho thấy lượng xe sedan cao cấp tăng 14% tại khu vực Bắc Mỹ trong quý này.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-5">
                {[
                  { label: "Đang chờ QA",    value: "42" },
                  { label: "Đang vận chuyển",     value: "118" },
                  { label: "Đã bán / Lưu trữ", value: "2,411" },
                ].map(s => (
                  <div key={s.label}>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">{s.label}</p>
                    <p className="text-2xl font-black text-white">{s.value}</p>
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
