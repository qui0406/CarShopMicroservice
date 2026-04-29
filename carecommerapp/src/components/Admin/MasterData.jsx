import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ─── Sidebar nav ────────────────────────────────────────── */
const NAV = [
  { icon: "⊞",  label: "BẢNG ĐIỀU KHIỂN",   key: "dashboard",  to: "/admin" },
  { icon: "🚗", label: "KHO XE",    key: "inventory",  to: "/staff/inventory"},
  { icon: "👥", label: "NGƯỜI DÙNG",        key: "users",      to: null },
  { icon: "🗃️", label: "DỮ LIỆU GỐC",  key: "master",     to: "/admin/master-data" },
  { icon: "🛡️", label: "KIỂM DUYỆT",   key: "moderation", to: null },
  { icon: "📊", label: "PHÂN TÍCH",    key: "analytics",  to: null },
  { icon: "⚙️", label: "CÀI ĐẶT",     key: "settings",   to: null },
];

/* ─── Mock brands ────────────────────────────────────────── */
const INIT_BRANDS = [
  { id: 1, name: "BMW",            country: "GERMANY",       flag: "DEU", models: 24, logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/120px-BMW.svg.png" },
  { id: 2, name: "Tesla",          country: "UNITED STATES", flag: "USA", models: 5,  logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Tesla_T_symbol.svg/120px-Tesla_T_symbol.svg.png" },
  { id: 3, name: "Toyota",         country: "JAPAN",         flag: "JPN", models: 38, logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Toyota_carlogo.svg/120px-Toyota_carlogo.svg.png" },
  { id: 4, name: "Mercedes-Benz",  country: "GERMANY",       flag: "DEU", models: 31, logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/120px-Mercedes-Logo.svg.png" },
  { id: 5, name: "Audi",           country: "GERMANY",       flag: "DEU", models: 19, logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Audi-Logo_2016.svg/240px-Audi-Logo_2016.svg.png" },
];

const INIT_FUELS = ["Electric (EV)", "Plug-in Hybrid", "Gasoline", "Diesel", "Hydrogen"];
const INIT_TRANS = ["Automatic (8-Speed)", "Manual (6-Speed)", "Single-Speed Direct"];

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

/* ─── Brand Card ─────────────────────────────────────────── */
function BrandCard({ brand, onEdit, onDelete }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 relative hover:shadow-md transition-shadow group">
      {/* Flag */}
      <span className="absolute top-3 right-3 text-[9px] font-black text-gray-300 tracking-widest">{brand.flag}</span>
      {/* Logo */}
      <div className="w-14 h-14 rounded-xl bg-gray-900 flex items-center justify-center mb-4 overflow-hidden p-1">
        <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain filter invert"
          onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}
        />
        <div className="hidden w-full h-full items-center justify-center text-white font-black text-xl">{brand.name[0]}</div>
      </div>
      {/* Info */}
      <h3 className="text-base font-black text-gray-900 leading-tight">{brand.name}</h3>
      <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider mt-0.5 mb-3">{brand.country}</p>
      {/* Badges */}
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 border border-gray-200 rounded text-[10px] font-bold text-gray-600">{brand.models} Mẫu xe</span>
        <span className="px-2 py-0.5 border border-green-200 bg-green-50 rounded text-[10px] font-bold text-green-600">Hoạt động</span>
      </div>
      {/* Hover actions */}
      <div className="absolute inset-0 bg-white/95 rounded-xl flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(brand)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-black rounded-lg hover:bg-blue-700">Sửa</button>
        <button onClick={() => onDelete(brand.id)} className="px-3 py-1.5 border border-red-200 text-red-500 text-xs font-black rounded-lg hover:bg-red-50">Xóa</button>
      </div>
    </div>
  );
}

/* ─── Add Brand Modal ────────────────────────────────────── */
function BrandModal({ brand, onClose, onSave }) {
  const [form, setForm] = useState(brand
    ? { name: brand.name, country: brand.country, flag: brand.flag }
    : { name: "", country: "", flag: "" }
  );
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e=>e.stopPropagation()}>
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">{brand ? "Chỉnh sửa hãng" : "Đăng ký hãng xe"}</p>
            <h3 className="text-white font-black text-base">{brand ? `Sửa ${brand.name}` : "Nhà sản xuất mới"}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full text-white flex items-center justify-center hover:bg-white/30">✕</button>
        </div>
        <div className="p-6 space-y-4">
          {[
            { label: "Tên hãng", key: "name",    placeholder: "VD: Porsche" },
            { label: "Quốc gia",    key: "country", placeholder: "VD: GERMANY" },
            { label: "Mã cờ",  key: "flag",    placeholder: "VD: DEU" },
          ].map(f=>(
            <div key={f.key}>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">{f.label}</label>
              <input value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder={f.placeholder}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button onClick={() => onSave(form)} className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">
              {brand ? "Lưu thay đổi" : "Đăng ký"}
            </button>
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50">Hủy</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function MasterData() {
  const navigate = useNavigate();
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState("brands");
  const [brands, setBrands]       = useState([]);
  const [fuels, setFuels]         = useState(INIT_FUELS);
  const [trans, setTrans]         = useState(INIT_TRANS);
  const [modal, setModal]         = useState(null);   // null | { mode, data }
  const [editFuel, setEditFuel]   = useState(false);
  const [editTrans, setEditTrans] = useState(false);
  const [newFuel, setNewFuel]     = useState("");
  const [newTrans, setNewTrans]   = useState("");
  const [validating, setValidating] = useState(false);
  const [toast, setToast]         = useState(null);

  useEffect(() => {
    setTimeout(() => { setBrands(INIT_BRANDS); setLoading(false); }, 1000);
  }, []);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const saveBrand = (form) => {
    if (modal.mode === "add") {
      const nb = { id: Date.now(), name: form.name, country: form.country.toUpperCase(), flag: form.flag.toUpperCase(), models: 0,
        logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name)}&background=111827&color=fff&size=80` };
      setBrands(p => [...p, nb]);
      showToast(`✅ Hãng ${form.name} đã được đăng ký`);
    } else {
      setBrands(p => p.map(b => b.id === modal.data.id ? { ...b, ...form, country: form.country.toUpperCase(), flag: form.flag.toUpperCase() } : b));
      showToast(`✏️ Hãng ${form.name} đã được cập nhật`);
    }
    setModal(null);
  };

  const deleteBrand = id => {
    const name = brands.find(b => b.id === id)?.name;
    setBrands(p => p.filter(b => b.id !== id));
    showToast(`🗑️ Hãng ${name} đã bị gỡ bỏ`);
  };

  const runValidation = async () => {
    setValidating(true);
    await new Promise(r => setTimeout(r, 2000));
    setValidating(false);
    showToast("✅ Kiểm tra hoàn tất — độ toàn vẹn 99.4%");
  };

  return (
    <div className="flex h-screen bg-white font-sans text-gray-900 overflow-hidden">

      {/* ─── SIDEBAR ─────────────────────────────────────── */}
      <aside className="w-52 bg-white border-r border-gray-100 flex flex-col shrink-0 h-full">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-black">FM</div>
            <div>
              <p className="text-sm font-black text-gray-900 leading-tight">FleetManager</p>
              <p className="text-[9px] text-gray-400 font-bold tracking-wider uppercase">Precision Logistics</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-3">
          {NAV.map(item => (
            <NavItem key={item.key} icon={item.icon} label={item.label}
              active={item.key === "master"}
              onClick={() => item.to ? navigate(item.to) : null}
            />
          ))}
        </nav>
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
          <div className="relative max-w-xs w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input placeholder="Tìm kiếm hệ thống toàn cầu..." className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <button className="text-gray-400 hover:text-gray-700 text-lg">🔔</button>
            <button className="text-gray-400 hover:text-gray-700 text-lg">❓</button>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-gray-900 leading-tight">Alex Rivera</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Fleet Supervisor</p>
            </div>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shrink-0">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&q=80&fit=crop&crop=face" alt="admin" className="w-full h-full object-cover"/>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="px-8 py-6 flex gap-5">

            {/* ── LEFT PANEL ── */}
            <div className="flex-1 min-w-0">

              {/* Header */}
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Cấu hình hệ thống</p>
              <div className="flex items-end justify-between mb-5">
                <h2 className="text-3xl font-black text-gray-900 leading-tight">Quản lý dữ liệu gốc</h2>
                <div className="flex gap-3 shrink-0">
                  <button onClick={() => setModal({ mode: "add", data: null })}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
                    + Thêm hãng mới
                  </button>
                  <button onClick={() => navigate("/staff/create-car")}
                    className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 bg-white text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 shadow-sm transition-colors">
                    + Thêm mẫu xe mới
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-5 border-b border-gray-200">
                {[
                  { key: "brands",  icon: "🏷️", label: "Hãng xe" },
                  { key: "models",  icon: "🚘", label: "Mẫu xe" },
                ].map(t => (
                  <button key={t.key} onClick={() => setTab(t.key)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
                      tab === t.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-700"
                    }`}>
                    <span>{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>

              {/* Brand Grid */}
              {tab === "brands" && (
                <div className="grid grid-cols-3 gap-4">
                  {loading
                    ? Array(5).fill(0).map((_,i) => (
                        <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 animate-pulse">
                          <div className="w-14 h-14 bg-gray-100 rounded-xl mb-4"/>
                          <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"/>
                          <div className="h-3 bg-gray-100 rounded w-1/2 mb-4"/>
                          <div className="flex gap-2">
                            <div className="h-5 bg-gray-100 rounded w-20"/>
                            <div className="h-5 bg-gray-100 rounded w-14"/>
                          </div>
                        </div>
                      ))
                    : <>
                        {brands.map(b => (
                          <BrandCard key={b.id} brand={b}
                            onEdit={b => setModal({ mode: "edit", data: b })}
                            onDelete={deleteBrand}
                          />
                        ))}
                        {/* Add card */}
                        <button onClick={() => setModal({ mode: "add", data: null })}
                          className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 min-h-[180px] hover:border-blue-400 hover:bg-blue-50/30 transition-all group">
                          <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-gray-400 group-hover:text-blue-500 text-xl transition-colors">+</div>
                          <p className="text-xs font-black uppercase tracking-wider text-gray-400 group-hover:text-blue-500 transition-colors">Đăng ký hãng xe mới</p>
                          <p className="text-[9px] text-gray-300 uppercase tracking-widest">Nhập thủ công</p>
                        </button>
                      </>
                  }
                </div>
              )}

              {/* Car Models tab placeholder */}
              {tab === "models" && (
                <div className="py-16 text-center text-gray-400">
                  <p className="text-4xl mb-3">🚘</p>
                  <p className="font-black uppercase tracking-wider text-sm">Mẫu xe</p>
                  <p className="text-xs mt-1">Sử dụng phần Kho xe để quản lý các mẫu xe.</p>
                  <button onClick={() => navigate("/staff/home/model")}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">
                    Đi tới Quản lý mẫu xe
                  </button>
                </div>
              )}
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="w-60 shrink-0 space-y-4">

              {/* Technical Specs */}
              <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                  <span className="text-base">⚡</span>
                  <span className="text-xs font-black uppercase tracking-widest text-gray-900">Thông số kỹ thuật</span>
                </div>

                {/* Fuel Types */}
                <div className="px-5 py-4 border-b border-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Fuel Types</p>
                    <button onClick={() => setEditFuel(e => !e)} className="text-[10px] font-black text-blue-600 hover:text-blue-800 flex items-center gap-1">
                      ✏️ {editFuel ? "Done" : "Edit"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {fuels.map((f, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded">{f}</span>
                        {editFuel && (
                          <button onClick={() => setFuels(p => p.filter((_,j) => j !== i))}
                            className="text-red-400 hover:text-red-600 text-[10px] font-black">✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                  {editFuel && (
                    <div className="flex gap-1">
                      <input value={newFuel} onChange={e => setNewFuel(e.target.value)}
                        placeholder="Thêm loại nhiên liệu..." onKeyDown={e => { if(e.key==="Enter"&&newFuel.trim()){ setFuels(p=>[...p,newFuel.trim()]); setNewFuel(""); }}}
                        className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"/>
                      <button onClick={() => { if(newFuel.trim()){ setFuels(p=>[...p,newFuel.trim()]); setNewFuel(""); }}}
                        className="px-2 py-1 bg-blue-600 text-white text-xs font-black rounded hover:bg-blue-700">+</button>
                    </div>
                  )}
                </div>

                {/* Transmission */}
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Hộp số</p>
                    <button onClick={() => setEditTrans(e => !e)} className="text-[10px] font-black text-blue-600 hover:text-blue-800 flex items-center gap-1">
                      ✏️ {editTrans ? "Xong" : "Sửa"}
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {trans.map((t, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50">
                        <span className="text-xs font-medium text-gray-700">{t}</span>
                        {editTrans
                          ? <button onClick={() => setTrans(p => p.filter((_,j) => j !== i))} className="text-red-400 hover:text-red-600 text-[10px] font-black">✕</button>
                          : <span className="text-gray-300 text-xs">⣿⣿</span>
                        }
                      </div>
                    ))}
                  </div>
                  {editTrans && (
                    <div className="flex gap-1 mt-2">
                      <input value={newTrans} onChange={e => setNewTrans(e.target.value)}
                        placeholder="Thêm loại..." onKeyDown={e => { if(e.key==="Enter"&&newTrans.trim()){ setTrans(p=>[...p,newTrans.trim()]); setNewTrans(""); }}}
                        className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"/>
                      <button onClick={() => { if(newTrans.trim()){ setTrans(p=>[...p,newTrans.trim()]); setNewTrans(""); }}}
                        className="px-2 py-1 bg-blue-600 text-white text-xs font-black rounded hover:bg-blue-700">+</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Data Integrity */}
              <div className="bg-blue-600 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10"/>
                <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center text-lg mb-3">📊</div>
                <p className="text-white font-black text-base mb-2">Độ toàn vẹn dữ liệu: 99.4%</p>
                <p className="text-blue-200 text-[11px] leading-relaxed mb-4">
                  Tất cả các tham số dữ liệu xe hiện đang được ánh xạ theo tiêu chuẩn ô tô toàn cầu (ISO-15118).
                </p>
                <button onClick={runValidation} disabled={validating}
                  className="w-full py-2.5 bg-white/20 hover:bg-white/30 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {validating
                    ? <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Đang kiểm tra...</>
                    : "Chạy báo cáo kiểm tra"
                  }
                </button>
              </div>
            </div>
          </div>

          {/* ── BOTTOM STATS BAR ── */}
          <div className="border-t border-gray-100 bg-white px-8 py-4 grid grid-cols-4 gap-6">
            {[
              { label: "Nhà sản xuất toàn cầu",  value: brands.length || 142 },
              { label: "Biến thể mẫu xe hoạt động",  value: "2,841" },
              { label: "Kiểm tra đang chờ xử lý",    value: "12" },
              { label: "Đồng bộ lần cuối",            value: "4ph trước" },
            ].map(s => (
              <div key={s.label}>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{s.label}</p>
                <p className="text-2xl font-black text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ─── MODAL ───────────────────────────────────────── */}
      {modal && <BrandModal brand={modal.data} onClose={() => setModal(null)} onSave={saveBrand}/>}

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
