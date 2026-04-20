import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "./StaffLayout";

/* ─── Mock data ────────────────────────────────────────── */
const revenueData = [
  { month: "JAN", value: 55 },
  { month: "FEB", value: 72 },
  { month: "MAR", value: 60 },
  { month: "APR", value: 80 },
  { month: "MAY", value: 92 },
  { month: "JUN", value: 100 },
];

const brandData = [
  { name: "Porsche", pct: 45, color: "#1d4ed8" },
  { name: "BMW", pct: 25, color: "#bfdbfe" },
  { name: "Mercedes-Benz", pct: 30, color: "#6b7280" },
];

const activities = [
  {
    id: 1,
    icon: "💳",
    iconBg: "#dcfce7",
    type: "Deposit Received",
    detail: "Porsche 911 GT3 (Ref: #8921)",
    staff: "Alex Reed",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&q=80&fit=crop&crop=face",
    time: "14:22 PM",
    status: "COMPLETED",
    statusColor: "#16a34a",
    statusBg: "#dcfce7",
  },
  {
    id: 2,
    icon: "🚗",
    iconBg: "#dbeafe",
    type: "Car Addition",
    detail: "BMW M4 Competition (2024 Model)",
    staff: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&q=80&fit=crop&crop=face",
    time: "12:05 PM",
    status: "PUBLISHED",
    statusColor: "#1d4ed8",
    statusBg: "#dbeafe",
  },
  {
    id: 3,
    icon: "🔑",
    iconBg: "#f3f4f6",
    type: "Staff Login",
    detail: "Terminal Access granted via Auth0",
    staff: "Jordan Smith",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&q=80&fit=crop&crop=face",
    time: "09:12 AM",
    status: "AUTHONLY",
    statusColor: "#374151",
    statusBg: "#f3f4f6",
  },
];

/* ─── Donut SVG helper ──────────────────────────────────── */
function DonutChart({ data, total }) {
  const R = 70;
  const CX = 90;
  const CY = 90;
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
      {/* Background ring */}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f3f4f6" strokeWidth="22" />
      {slices.map((s, i) => (
        <circle
          key={i}
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke={s.color}
          strokeWidth="22"
          strokeDasharray={`${s.dash} ${circumference - s.dash}`}
          strokeDashoffset={s.offset}
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      ))}
      <text x={CX} y={CY - 6} textAnchor="middle" fontSize="22" fontWeight="800" fill="#111827">{total}</text>
      <text x={CX} y={CY + 14} textAnchor="middle" fontSize="11" fill="#6b7280" fontWeight="600">TOTAL</text>
    </svg>
  );
}


/* ─── Main Component ────────────────────────────────────── */
export default function HomeStaff() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("DASHBOARD");
  const [searchVal, setSearchVal] = useState("");
  const [loading, setLoading] = useState(true);

  // ── All dashboard data lives in state, simulating an API response
  const [dashData, setDashData] = useState(null);

  useEffect(() => {
    // Simulate API fetch delay (replace setTimeout with real axios calls later)
    const timer = setTimeout(() => {
      setDashData({
        stats: [
          { label: "TOTAL REVENUE", value: "", badgeUp: true },
          { label: "NEW DEPOSITS", value: "42", badgeUp: true },
          { label: "ACTIVE LISTINGS", value: "186", badgeUp: null },
          { label: "TOTAL SALES", value: "1,402", badgeUp: false },
        ],
        revenueData: [
          { month: "JAN", value: 55 },
          { month: "FEB", value: 72 },
          { month: "MAR", value: 60 },
          { month: "APR", value: 80 },
          { month: "MAY", value: 92 },
          { month: "JUN", value: 100 },
        ],
        brandData: [
          { name: "Porsche", pct: 45, color: "#1d4ed8" },
          { name: "BMW", pct: 25, color: "#bfdbfe" },
          { name: "Mercedes-Benz", pct: 30, color: "#6b7280" },
        ],
        donutTotal: 842,
        activities: [

        ],
      });
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const maxBar = dashData ? Math.max(...dashData.revenueData.map((d) => d.value)) : 100;

  return (
    <StaffLayout searchPlaceholder="Search terminal..." searchVal={searchVal} onSearchChange={(e) => setSearchVal(e.target.value)}>
      <div className="px-8 py-6 pb-20">

        {/* Page Title */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-black text-gray-900 leading-tight">Terminal Overview</h2>
            <p className="text-sm text-gray-500 mt-0.5">System integrity: Optimal. Data synchronized 2m ago.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm font-bold border border-gray-200 rounded bg-white hover:bg-gray-50 transition-colors shadow-sm">Export PDF</button>
            <button onClick={() => navigate("/staff/create-car")} className="px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm">Add Listing</button>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {loading
            ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-pulse">
                <div className="h-2 bg-gray-100 rounded w-3/4 mb-4" />
                <div className="flex justify-between items-end">
                  <div className="h-7 bg-gray-100 rounded w-1/2" />
                  <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                </div>
                <div className="h-2 bg-gray-100 rounded w-1/4 mt-4" />
              </div>
            ))
            : dashData.stats.map((card) => (
              <div key={card.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{card.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-black text-gray-900">{card.value}</p>
                </div>
              </div>
            ))
          }
        </div>

        {/* ── CHARTS ROW ── */}
        <div className="grid grid-cols-3 gap-4 mb-6">

          {/* Bar Chart - Revenue Trend */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-black text-gray-900 text-lg">Revenue Trend</h3>
                <p className="text-xs text-gray-400 font-medium">Monthly fiscal performance</p>
              </div>
              <select className="text-xs border border-gray-200 rounded px-3 py-1.5 text-gray-600 bg-white focus:outline-none">
                <option>Last 6 Months</option>
                <option>Last Year</option>
              </select>
            </div>
            {/* Bar chart */}
            {loading ? (
              <div className="flex items-end gap-5 h-44 px-2 animate-pulse">
                {[40, 65, 50, 75, 85, 100].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full rounded-t bg-gray-100" style={{ height: `${h}%` }} />
                    <div className="h-2 bg-gray-100 rounded w-8" />
                  </div>
                ))}
              </div>
            ) : (() => {
              const CHART_H = 160; // px
              const sorted = [...dashData.revenueData].sort((a, b) => b.value - a.value);
              return (
                <div className="flex items-end gap-3 px-2" style={{ height: CHART_H + 24 }}>
                  {dashData.revenueData.map((d) => {
                    const barH = Math.round((d.value / maxBar) * CHART_H);
                    const isHighest = d.value === maxBar;
                    const isTop2 = d.value >= sorted[1].value;
                    return (
                      <div key={d.month} className="flex-1 flex flex-col items-center justify-end gap-2" style={{ height: CHART_H + 24 }}>
                        <div
                          className="w-full rounded-t transition-all duration-700"
                          style={{
                            height: barH,
                            backgroundColor: isHighest ? "#1d4ed8" : isTop2 ? "#3b82f6" : "#bfdbfe",
                          }}
                        />
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{d.month}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Donut Chart - Sales by Brand */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-black text-gray-900 text-lg mb-0.5">Sales by Brand</h3>
            <p className="text-xs text-gray-400 font-medium mb-4">Inventory distribution</p>
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
                  <DonutChart data={dashData.brandData} total={dashData.donutTotal} />
                </div>
                <div className="space-y-2">
                  {dashData.brandData.map((b) => (
                    <div key={b.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                        <span className="text-gray-700 font-medium">{b.name}</span>
                      </div>
                      <span className="font-black text-gray-900">{b.pct}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── RECENT ACTIVITY ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-baseline">
            <div>
              <h3 className="font-black text-gray-900 text-lg">Recent Activity</h3>
              <p className="text-xs text-gray-400 font-medium">Latest system events and ledger entries</p>
            </div>
            <button className="text-blue-600 text-xs font-black tracking-wider hover:underline uppercase">VIEW ALL LOG</button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Event Type</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Detail</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Staff</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array(3).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-gray-100 rounded-lg" /><div className="h-3 bg-gray-100 rounded w-28" /></div></td>
                    <td className="px-6 py-4"><div className="h-3 bg-gray-100 rounded w-40" /></td>
                    <td className="px-6 py-4"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-gray-100" /><div className="h-3 bg-gray-100 rounded w-20" /></div></td>
                    <td className="px-6 py-4"><div className="h-3 bg-gray-100 rounded w-16" /></td>
                    <td className="px-6 py-4"><div className="h-5 bg-gray-100 rounded w-20" /></td>
                  </tr>
                ))
                : dashData.activities.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0" style={{ backgroundColor: a.iconBg }}>
                        </div>
                        <span className="font-bold text-gray-900 text-sm">{a.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{a.detail}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200 shrink-0">
                          <img src={a.avatar} alt={a.staff} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-gray-700 font-medium">{a.staff}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{a.time}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-[10px] font-black rounded uppercase tracking-wider"
                        style={{ color: a.statusColor, backgroundColor: a.statusBg }}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

      </div>

      {/* ─── FOOTER ─────────────────────────────────────── */}
      <footer className="h-10 bg-white border-t border-gray-100 flex items-center justify-between px-8 shrink-0">
        <div className="flex gap-6 text-[9px] font-bold text-gray-400 tracking-widest uppercase">
          <span>Precision Engine V4.2.0</span>
          <span>Server: US-East-1</span>
          <span>Uptime: 99.08%</span>
        </div>
        <div className="flex gap-5 text-[9px] font-bold text-gray-500 tracking-widest uppercase">
          <button className="hover:text-blue-600 transition-colors">Terms of Service</button>
          <button className="hover:text-blue-600 transition-colors">Privacy Protocol</button>
        </div>
      </footer>
    </StaffLayout>
  );
}