import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ─── Sidebar nav ────────────────────────────────────────── */
const NAV = [
  { icon: "⊞",  label: "DASHBOARD",   key: "dashboard",  to: "/admin" },
  { icon: "🚗", label: "INVENTORY",    key: "inventory",  to: "/staff/inventory" },
  { icon: "👥", label: "USERS",        key: "users",      to: "/admin/users" },
  { icon: "🗃️", label: "MASTER DATA",  key: "master",     to: "/admin/master-data" },
  { icon: "🛡️", label: "MODERATION",   key: "moderation", to: "/admin/moderation" },
  { icon: "📊", label: "ANALYTICS",    key: "analytics",  to: null },
  { icon: "⚙️", label: "SETTINGS",     key: "settings",   to: "/admin/moderation" },
];

/* ─── Mock queue items ───────────────────────────────────── */
const INIT_QUEUE = [
  {
    id: 1,
    name: "Porsche 911 GT3",
    vin: "WP0AA2A9XLS20••••",
    image: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=120&q=80&fit=crop",
    scan: "passed", scanLabel: "Passed (98%)", scanColor: "#22c55e",
    date: "Oct 24, 2023",
    sellerType: "PREMIUM DEALER",
    sellerStyle: "border-gray-300 text-gray-700 bg-white",
  },
  {
    id: 2,
    name: "BMW M5 CS",
    vin: "WBS53CH01LB7••••",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=120&q=80&fit=crop",
    scan: "pending", scanLabel: "Pending Scan", scanColor: "#f59e0b",
    date: "Oct 23, 2023",
    sellerType: "VERIFIED PRIVATE",
    sellerStyle: "border-gray-300 text-gray-700 bg-white",
  },
];

/* ─── Mock banner ads ────────────────────────────────────── */
const INIT_ADS = [
  {
    id: 1, active: true,
    title: "Summer Performance",
    subtitle: "ACTIVE: JUNE 1 – AUG 31",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=120&q=60&fit=crop",
  },
  {
    id: 2, active: false,
    title: "Electric Drive Initiative",
    subtitle: "INACTIVE: GLOBAL SITE",
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=120&q=60&fit=crop",
  },
];

/* ─── NavItem ────────────────────────────────────────────── */
function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-5 py-3 text-xs font-black tracking-widest text-left transition-colors ${
        active
          ? "text-blue-600 border-l-4 border-blue-600 bg-blue-50/60 pl-4"
          : "text-gray-400 border-l-4 border-transparent hover:bg-gray-50 hover:text-gray-700"
      }`}>
      <span className="text-sm">{icon}</span>{label}
    </button>
  );
}

/* ─── Toggle ─────────────────────────────────────────────── */
function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)}
      className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${on ? "bg-blue-600" : "bg-gray-200"}`}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`}/>
    </button>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function ModerationSettings() {
  const navigate = useNavigate();
  const [queue, setQueue]       = useState([]);
  const [ads, setAds]           = useState(INIT_ADS);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settings, setSettings] = useState({
    hotline: "+1 (888) 555-PRECISION",
    email:   "ops@precisiondrive.com",
    address: "400 Silicon Way, Suite 100\nPalo Alto, CA 94304\nUnited States",
  });

  useEffect(() => {
    setTimeout(() => { setQueue(INIT_QUEUE); setLoading(false); }, 900);
  }, []);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const approveItem = (id) => {
    setQueue(p => p.filter(q => q.id !== id));
    showToast("✅ Listing approved");
  };
  const rejectItem = (id) => {
    setQueue(p => p.filter(q => q.id !== id));
    showToast("🗑️ Listing rejected");
  };
  const approveAll = () => {
    setQueue([]);
    showToast(`✅ All ${queue.length} listings approved`);
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    await new Promise(r => setTimeout(r, 1200));
    setSavingSettings(false);
    showToast("✅ Settings saved");
  };

  return (
    <div className="flex h-screen bg-white font-sans text-gray-900 overflow-hidden">

      {/* ─── SIDEBAR ─────────────────────────────────────── */}
      <aside className="w-52 bg-white border-r border-gray-100 flex flex-col shrink-0 h-full">
        <div className="px-5 py-5 border-b border-gray-100">
          <p className="text-sm font-black text-gray-900 uppercase tracking-widest leading-tight">FleetManager</p>
          <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mt-0.5">Precision Logistics</p>
        </div>
        <nav className="flex-1 py-3">
          {NAV.map(item => (
            <NavItem key={item.key} icon={item.icon} label={item.label}
              active={item.key === "moderation" || item.key === "settings"}
              onClick={() => item.to ? navigate(item.to) : null}
            />
          ))}
        </nav>
        <div className="pb-5 border-t border-gray-100 pt-3">
          <NavItem icon="❓" label="SUPPORT" active={false} onClick={() => {}}/>
          <NavItem icon="↪" label="LOGOUT"  active={false} onClick={() => navigate("/login")}/>
        </div>
      </aside>

      {/* ─── MAIN ────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">

        {/* TOP BAR */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-8 gap-5 shrink-0">
          <div className="relative max-w-xs w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input placeholder="Search system..." className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <button className="text-gray-400 hover:text-gray-700 text-lg">🔔</button>
            <button className="text-gray-400 hover:text-gray-700 text-lg">❓</button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shrink-0">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&q=80&fit=crop&crop=face" alt="admin" className="w-full h-full object-cover"/>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6 space-y-6">

          {/* ── MODERATION QUEUE ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-gray-50">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Queue Management</p>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900">Moderation Queue</h2>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white text-sm font-bold text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-colors">
                    ⚖️ Filter
                  </button>
                  <button onClick={approveAll} disabled={queue.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-40">
                    Approve All
                  </button>
                </div>
              </div>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-[2.5fr_1.5fr_1fr_1.3fr_1fr] px-6 py-3 border-b border-gray-50">
              {["Vehicle Details","3D Scan Status","Listing Date","Seller Type","Actions"].map(h=>(
                <p key={h} className="text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</p>
              ))}
            </div>

            {/* Rows */}
            {loading
              ? Array(2).fill(0).map((_,i)=>(
                  <div key={i} className="grid grid-cols-[2.5fr_1.5fr_1fr_1.3fr_1fr] px-6 py-4 border-b border-gray-50 items-center animate-pulse gap-4">
                    <div className="flex items-center gap-3"><div className="w-20 h-14 bg-gray-100 rounded-lg"/><div><div className="h-3 bg-gray-100 rounded w-28 mb-2"/><div className="h-2 bg-gray-100 rounded w-36"/></div></div>
                    <div className="h-3 bg-gray-100 rounded w-24"/>
                    <div className="h-3 bg-gray-100 rounded w-20"/>
                    <div className="h-5 bg-gray-100 rounded w-28"/>
                    <div className="flex gap-2"><div className="w-7 h-7 bg-gray-100 rounded-full"/><div className="w-7 h-7 bg-gray-100 rounded-full"/></div>
                  </div>
                ))
              : queue.length === 0
                ? (
                  <div className="py-14 text-center text-gray-400">
                    <p className="text-3xl mb-2">✅</p>
                    <p className="text-sm font-black uppercase tracking-wider">Queue Clear</p>
                    <p className="text-xs mt-1">No listings pending moderation.</p>
                  </div>
                )
                : queue.map(item => (
                    <div key={item.id} className="grid grid-cols-[2.5fr_1.5fr_1fr_1.3fr_1fr] px-6 py-4 border-b border-gray-50 items-center gap-4 hover:bg-gray-50/50 transition-colors">
                      {/* Vehicle */}
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-20 h-14 object-cover rounded-lg border border-gray-100 shrink-0"/>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{item.name}</p>
                          <p className="text-[11px] text-gray-400 font-mono mt-0.5">VIN: {item.vin}</p>
                        </div>
                      </div>
                      {/* Scan */}
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.scanColor }}/>
                        <span className="text-xs font-bold" style={{ color: item.scanColor }}>{item.scanLabel}</span>
                      </div>
                      {/* Date */}
                      <p className="text-xs text-gray-600 font-medium">{item.date}</p>
                      {/* Seller */}
                      <span className={`inline-block px-2.5 py-1 border text-[10px] font-black rounded uppercase tracking-wider ${item.sellerStyle}`}>
                        {item.sellerType}
                      </span>
                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <button onClick={() => rejectItem(item.id)}
                          className="w-8 h-8 rounded-full border border-red-200 text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors font-black">
                          ✕
                        </button>
                        <button onClick={() => approveItem(item.id)}
                          className="w-8 h-8 rounded-full border border-blue-200 text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-colors font-black text-lg">
                          ✓
                        </button>
                      </div>
                    </div>
                  ))
            }
          </div>

          {/* ── BOTTOM ROW: Settings + Banner Ads ── */}
          <div className="grid grid-cols-2 gap-5">

            {/* System Settings */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 pt-5 pb-4 border-b border-gray-50">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Global Configuration</p>
                <h3 className="text-2xl font-black text-gray-900">System Settings</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Customer Hotline</label>
                    <input value={settings.hotline} onChange={e=>setSettings({...settings,hotline:e.target.value})}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Admin Email</label>
                    <input value={settings.email} onChange={e=>setSettings({...settings,email:e.target.value})}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Headquarters Address</label>
                  <textarea
                    rows={3} value={settings.address}
                    onChange={e=>setSettings({...settings,address:e.target.value})}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div className="pt-2 flex justify-end">
                  <button onClick={saveSettings} disabled={savingSettings}
                    className="px-6 py-2.5 bg-blue-600 text-white text-sm font-black uppercase tracking-widest rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center gap-2">
                    {savingSettings
                      ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Saving...</>
                      : "Save Changes"
                    }
                  </button>
                </div>
              </div>
            </div>

            {/* Banner Ads */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 pt-5 pb-4 border-b border-gray-50">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Visual Merchandising</p>
                <h3 className="text-2xl font-black text-gray-900">Banner Ads</h3>
              </div>
              <div className="p-5 space-y-3">
                {ads.map(ad => (
                  <div key={ad.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <img src={ad.image} alt={ad.title} className="w-20 h-14 object-cover rounded-lg shrink-0 border border-gray-100"/>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{ad.title}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{ad.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Toggle on={ad.active} onChange={v=>setAds(p=>p.map(a=>a.id===ad.id?{...a,active:v}:a))}/>
                      <button className="text-gray-400 hover:text-blue-600 text-sm transition-colors">✏️</button>
                    </div>
                  </div>
                ))}

                {/* New Ad Slider */}
                <button
                  onClick={() => showToast("🚧 Ad builder coming soon")}
                  className="w-full py-5 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-gray-400 group-hover:text-blue-500 text-lg transition-colors">+</div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-blue-500 transition-colors">New Ad Slider</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─── FAB (floating action button) ────────────────── */}
      <button
        onClick={() => showToast("🖼️ Media library opened")}
        className="fixed bottom-6 right-6 w-13 h-13 w-14 h-14 bg-blue-600 rounded-full shadow-xl flex items-center justify-center text-white text-xl hover:bg-blue-700 transition-colors z-40"
        title="Open Media Library"
      >
        🖼️
      </button>

      {/* ─── TOAST ───────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-xl text-sm font-bold flex items-center gap-3 z-50">
          {toast}
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-white ml-1">✕</button>
        </div>
      )}
    </div>
  );
}
