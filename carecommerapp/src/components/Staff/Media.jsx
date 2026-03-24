import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ─── Mock media assets ─────────────────────────────────── */
const MOCK_ASSETS = [
  {
    id: 1, type: "3D",
    name: "chassis_v12_complete.glb",
    size: "84.2 MB", tag: "HEAVY", tagColor: "#f97316", tagBg: "#fff7ed",
    preview: null,
    thumb: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400&q=80&fit=crop",
  },
  {
    id: 2, type: "IMAGE",
    name: "exterior_hero_01.jpg",
    size: "2.4 MB", tag: "OPTIMIZED", tagColor: "#16a34a", tagBg: "#f0fdf4",
    thumb: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80&fit=crop",
  },
  {
    id: 3, type: "3D",
    name: "alloy_wheel_mesh.usdz",
    size: "12.1 MB", tag: "OPTIMIZED", tagColor: "#16a34a", tagBg: "#f0fdf4",
    thumb: null,
  },
  {
    id: 4, type: "PDF",
    name: "safety_report_q4.pdf",
    size: "840 KB", tag: "DOCUMENT", tagColor: "#6b7280", tagBg: "#f3f4f6",
    thumb: null,
  },
  {
    id: 5, type: "IMAGE",
    name: "steering_wheel_detail.png",
    size: "5.7 MB", tag: "OPTIMIZED", tagColor: "#16a34a", tagBg: "#f0fdf4",
    thumb: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&q=80&fit=crop",
  },
  {
    id: 6, type: "IMAGE",
    name: "ev_night_lifestyle.jpg",
    size: "4.2 MB", tag: "OPTIMIZED", tagColor: "#16a34a", tagBg: "#f0fdf4",
    thumb: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&q=80&fit=crop",
  },
  {
    id: 7, type: "3D",
    name: "concept_sedan_lowpoly.fbx",
    size: "18.4 MB", tag: "OPTIMIZED", tagColor: "#16a34a", tagBg: "#f0fdf4",
    thumb: null,
  },
];

const TABS = ["ALL", "IMAGES", "3D MODELS", "PDFS"];

/* ─── Sidebar NavItem ───────────────────────────────────── */
function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-black tracking-widest uppercase transition-colors rounded-none text-left ${
        active
          ? "text-blue-600 border-l-4 border-blue-600 bg-blue-50 pl-3"
          : "text-gray-500 border-l-4 border-transparent hover:bg-gray-50 hover:text-gray-800"
      }`}
    >
      <span className="text-base">{icon}</span>
      {label}
    </button>
  );
}

/* ─── Media Card ────────────────────────────────────────── */
function MediaCard({ asset, onClick }) {
  const is3D  = asset.type === "3D";
  const isPDF = asset.type === "PDF";

  return (
    <div
      onClick={() => onClick(asset)}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer group hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      {/* Thumbnail */}
      <div className="relative h-36 overflow-hidden" style={{ backgroundColor: is3D ? "#111827" : isPDF ? "#f8fafc" : "#1f2937" }}>
        {asset.thumb ? (
          <img src={asset.thumb} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
        ) : isPDF ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-20 bg-red-100 rounded-lg flex flex-col items-center justify-center border-2 border-red-200">
              <span className="text-red-500 font-black text-xs">PDF</span>
              <div className="w-8 h-1 bg-red-200 rounded mt-1"/>
              <div className="w-8 h-1 bg-red-200 rounded mt-1"/>
              <div className="w-6 h-1 bg-red-200 rounded mt-1"/>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white/40">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        )}
        {/* Type badge */}
        {(is3D) && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded uppercase tracking-wider">3D</div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity"/>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[11px] font-bold text-gray-900 truncate mb-1">{asset.name}</p>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400 font-medium">{asset.size}</span>
          <span className="text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded uppercase"
            style={{ color: asset.tagColor, backgroundColor: asset.tagBg }}>
            {asset.tag}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Quick Upload Card ─────────────────────────────────── */
function QuickUploadCard({ onUpload }) {
  return (
    <div
      onClick={onUpload}
      className="bg-white rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
      style={{ minHeight: 168 }}
    >
      <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center mb-2 transition-colors">
        <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-blue-500 transition-colors">Quick Upload</span>
    </div>
  );
}

/* ─── Preview Modal ─────────────────────────────────────── */
function PreviewModal({ asset, onClose }) {
  if (!asset) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="relative h-60 bg-gray-900">
          {asset.thumb
            ? <img src={asset.thumb} alt={asset.name} className="w-full h-full object-cover"/>
            : <div className="w-full h-full flex items-center justify-center text-white/30 text-6xl">📄</div>
          }
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 bg-black/40 rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors">✕</button>
        </div>
        <div className="p-5">
          <p className="font-black text-gray-900 text-base mb-1">{asset.name}</p>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs text-gray-400">{asset.size}</span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded uppercase" style={{ color: asset.tagColor, backgroundColor: asset.tagBg }}>{asset.tag}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase">{asset.type}</span>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 transition-colors">Download</button>
            <button onClick={onClose} className="flex-1 py-2 border border-gray-200 text-gray-700 text-sm font-bold rounded hover:bg-gray-50 transition-colors">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────── */
export default function Media() {
  const navigate   = useNavigate();
  const fileRef    = useRef(null);
  const [loading, setLoading]       = useState(true);
  const [assets, setAssets]         = useState([]);
  const [activeTab, setActiveTab]   = useState("ALL");
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [preview, setPreview]       = useState(null);
  const [uploadSnack, setUploadSnack] = useState(false);

  /* Simulate fetch */
  useEffect(() => {
    const t = setTimeout(() => { setAssets(MOCK_ASSETS); setLoading(false); }, 1000);
    return () => clearTimeout(t);
  }, []);

  /* Filtered */
  const filtered = assets.filter(a => {
    const matchTab =
      activeTab === "ALL"       ? true :
      activeTab === "IMAGES"    ? a.type === "IMAGE" :
      activeTab === "3D MODELS" ? a.type === "3D" :
      activeTab === "PDFS"      ? a.type === "PDF" : true;
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleUpload = () => fileRef.current?.click();
  const handleFileChange = (e) => {
    if (e.target.files.length) {
      setUploadSnack(true);
      setTimeout(() => setUploadSnack(false), 3000);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">

      {/* ─── SIDEBAR ─────────────────────────────────────── */}
      <aside className="w-52 bg-white border-r border-gray-100 flex flex-col shrink-0 h-full">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-black">ST</div>
            <div>
              <p className="text-sm font-black text-gray-900 leading-tight">Staff Terminal</p>
              <p className="text-[9px] text-gray-400 font-bold tracking-wider uppercase">Automotive Precision</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4">
          <NavItem icon="⊞"  label="Dashboard"  active={false} onClick={() => navigate("/staff/home")} />
          <NavItem icon="🚗" label="Inventory"   active={false} onClick={() => navigate("/staff/inventory")} />
          <NavItem icon="🖼️" label="Media"       active={true}  onClick={() => {}} />
          <NavItem icon="👤" label="Staff"      active={false} onClick={() => navigate("/staff/directory")} />
        </nav>

        <div className="pb-6 border-t border-gray-100 pt-4">
          <NavItem icon="❓" label="Support"  active={false} onClick={() => {}} />
          <NavItem icon="↪"  label="Logout"   active={false} onClick={() => navigate("/login")} />
        </div>
      </aside>

      {/* ─── MAIN ────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">

        {/* TOP BAR */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-8 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-black text-gray-900">Precision Portal</h1>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-400 font-medium">Asset Management</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <button className="text-gray-400 hover:text-gray-700 text-lg transition-colors">🔔</button>
            <button className="text-gray-400 hover:text-gray-700 text-lg transition-colors">⚙️</button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shrink-0 bg-orange-400 flex items-center justify-center">
              <span className="text-white font-black text-xs">MV</span>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">

          {/* Search + Tabs + Upload */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search media library..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>

            {/* Filter tabs */}
            <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm shrink-0">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setPage(1); }}
                  className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors ${
                    activeTab === tab
                      ? "bg-blue-600 text-white"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Upload button */}
            <button
              onClick={handleUpload}
              className="ml-auto flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm shrink-0"
            >
              ☁️ Upload Media
            </button>
            <input ref={fileRef} type="file" multiple accept="image/*,.pdf,.glb,.fbx,.usdz" className="hidden" onChange={handleFileChange}/>
          </div>

          {/* Section header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black tracking-widest uppercase text-gray-400">Recent Assets</p>
            {!loading && (
              <p className="text-[10px] text-gray-400 font-medium">
                Showing <strong className="text-gray-700">{filtered.length}</strong> of <strong className="text-gray-700">1,248</strong> assets
              </p>
            )}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {loading
              ? Array(7).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
                    <div className="h-36 bg-gray-100"/>
                    <div className="p-3">
                      <div className="h-2.5 bg-gray-100 rounded w-3/4 mb-2"/>
                      <div className="flex justify-between">
                        <div className="h-2 bg-gray-100 rounded w-12"/>
                        <div className="h-2 bg-gray-100 rounded w-16"/>
                      </div>
                    </div>
                  </div>
                ))
              : <>
                  {filtered.map(asset => (
                    <MediaCard key={asset.id} asset={asset} onClick={setPreview}/>
                  ))}
                  {filtered.length === 0 && (
                    <div className="col-span-4 py-20 text-center text-gray-400 font-medium">
                      No assets match your search.
                    </div>
                  )}
                  {/* Quick upload slot — always visible after items */}
                  {filtered.length > 0 && filtered.length % 4 !== 0 || filtered.length === MOCK_ASSETS.length ? (
                    <QuickUploadCard onUpload={handleUpload}/>
                  ) : null}
                </>
            }
          </div>

          {/* Pagination + Server status */}
          {!loading && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p-1))}
                  className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 text-sm">‹</button>
                {[1,2,3].map(n => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-colors ${
                      page === n ? "bg-blue-600 text-white border border-blue-600" : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}>{n}
                  </button>
                ))}
                <span className="px-2 text-gray-400 text-sm">...</span>
                <button onClick={() => setPage(12)}
                  className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors ${page===12?"bg-blue-600 text-white border-blue-600":""}`}>
                  12
                </button>
                <button onClick={() => setPage(p => Math.min(12, p+1))}
                  className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 text-sm">›</button>
              </div>

              {/* Server status */}
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>Server Status: Online</span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ─── PREVIEW MODAL ───────────────────────────────── */}
      <PreviewModal asset={preview} onClose={() => setPreview(null)}/>

      {/* ─── UPLOAD SNACKBAR ─────────────────────────────── */}
      {uploadSnack && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-xl text-sm font-bold flex items-center gap-3 z-50 animate-bounce">
          <span>✅</span> File uploaded successfully!
          <button onClick={() => setUploadSnack(false)} className="text-gray-400 hover:text-white ml-2">✕</button>
        </div>
      )}
    </div>
  );
}
