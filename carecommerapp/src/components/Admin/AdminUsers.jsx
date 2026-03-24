import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ─── Nav config ─────────────────────────────────────────── */
const NAV = [
  { icon: "⊞",  label: "DASHBOARD",   key: "dashboard",  to: "/admin" },
  { icon: "🚗", label: "INVENTORY",    key: "inventory",  to: "/staff/inventory" },
  { icon: "👥", label: "USERS",        key: "users",      to: "/admin/users" },
  { icon: "🗃️", label: "MASTER DATA",  key: "master",     to: "/admin/master-data" },
  { icon: "🛡️", label: "MODERATION",   key: "moderation", to: null },
  { icon: "📊", label: "ANALYTICS",    key: "analytics",  to: null },
  { icon: "⚙️", label: "SETTINGS",     key: "settings",   to: null },
];

/* ─── Mock users ─────────────────────────────────────────── */
const INIT_USERS = [
  {
    id: 1, initials: "EL", color: "#2563eb",
    name: "Erik Lagerfeld", handle: "@lagerfeld_e",
    role: "ADMIN", roleStyle: "bg-gray-900 text-white",
    status: "Active", statusColor: "#22c55e",
    lastActivity: "2023-11-24 14:02",
  },
  {
    id: 2, initials: "SM", color: "#6b7280",
    name: "Sarah Miller", handle: "@miller_ops",
    role: "STAFF", roleStyle: "bg-gray-100 text-gray-700",
    status: "Active", statusColor: "#22c55e",
    lastActivity: "2023-11-24 09:15",
  },
  {
    id: 3, initials: "JB", color: "#2563eb",
    name: "James Blackwell", handle: "@blackwell_j",
    role: "MODERATOR", roleStyle: "bg-blue-100 text-blue-700",
    status: "Blocked", statusColor: "#ef4444",
    lastActivity: "2023-10-12 11:30",
  },
];

const EVENTS = [
  {
    type: "PERMISSION_CHANGE_GRANTED",
    desc: "Admin @m_vance modified role 'Moderator' permissions.",
    time: "2m ago", iconBg: "#dbeafe", iconColor: "#2563eb", icon: "🔑",
  },
  {
    type: "ENTITY_AUTH_BLOCKED",
    desc: "System automatically restricted @blackwell_j due to suspicious egress.",
    time: "45m ago", iconBg: "#fee2e2", iconColor: "#dc2626", icon: "🔒",
  },
];

/* ─── Authority Matrix config ────────────────────────────── */
const INIT_PERMS = {
  "Can Edit Vehicle Data":    true,
  "Can Provision New VINs":   false,
  "Can Approve Listings":     true,
  "User Creation":            false,
  "Log Deletion":             false,
  "Financial Reports":        false,
  "System Health Metrics":    true,
};

const PERM_GROUPS = [
  { label: "Fleet Operations", keys: ["Can Edit Vehicle Data", "Can Provision New VINs", "Can Approve Listings"] },
  { label: "Access Control",   keys: ["User Creation", "Log Deletion"] },
  { label: "Analytics View",   keys: ["Financial Reports", "System Health Metrics"] },
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

/* ─── Toggle Switch ──────────────────────────────────────── */
function Toggle({ on, onChange, danger }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${
        on ? (danger ? "bg-red-400" : "bg-blue-600") : "bg-gray-200"
      }`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`}/>
    </button>
  );
}

/* ─── Provision Modal ────────────────────────────────────── */
function ProvisionModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: "", handle: "", role: "STAFF", email: "" });
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e=>e.stopPropagation()}>
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Identity Engine</p>
            <h3 className="text-white font-black text-base">Provision New User</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full text-white flex items-center justify-center hover:bg-white/30">✕</button>
        </div>
        <div className="p-6 space-y-4">
          {[
            { label: "Full Name",    key: "name",   placeholder: "e.g. Marcus Vance", type:"text" },
            { label: "Handle",       key: "handle", placeholder: "@username",          type:"text" },
            { label: "Email",        key: "email",  placeholder: "user@domain.com",    type:"email" },
          ].map(f=>(
            <div key={f.key}>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">{f.label}</label>
              <input type={f.type} value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder={f.placeholder}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
          ))}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">System Role</label>
            <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {["ADMIN","STAFF","MODERATOR"].map(r=><option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={()=>onSave(form)} className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">Provision</button>
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Edit User Modal ────────────────────────────────────── */
function EditModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({ role: user.role, status: user.status });
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden" onClick={e=>e.stopPropagation()}>
        <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Edit Entity</p>
            <h3 className="text-white font-black">{user.name}</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 bg-white/10 rounded-full text-white flex items-center justify-center hover:bg-white/20 text-sm">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">System Role</label>
            <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {["ADMIN","STAFF","MODERATOR"].map(r=><option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Connectivity</label>
            <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {["Active","Blocked","Suspended"].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={()=>onSave(form)} className="flex-1 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">Save</button>
            <button onClick={onClose} className="flex-1 py-2 border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function AdminUsers() {
  const navigate  = useNavigate();
  const [loading, setLoading]   = useState(true);
  const [users, setUsers]       = useState([]);
  const [tab, setTab]           = useState("directory");
  const [modal, setModal]       = useState(null);
  const [perms, setPerms]       = useState(INIT_PERMS);
  const [propagated, setPropagated] = useState(false);
  const [toast, setToast]       = useState(null);
  const [search, setSearch]     = useState("");
  const [page, setPage]         = useState(1);

  useEffect(() => {
    setTimeout(() => { setUsers(INIT_USERS); setLoading(false); }, 900);
  }, []);

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(null),3000); };

  const saveProvision = (form) => {
    const initials = form.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();
    const roleStyleMap = { ADMIN:"bg-gray-900 text-white", STAFF:"bg-gray-100 text-gray-700", MODERATOR:"bg-blue-100 text-blue-700" };
    const newUser = {
      id: Date.now(), initials, color: "#2563eb",
      name: form.name, handle: form.handle.startsWith("@") ? form.handle : "@"+form.handle,
      role: form.role, roleStyle: roleStyleMap[form.role],
      status: "Active", statusColor: "#22c55e",
      lastActivity: new Date().toISOString().slice(0,16).replace("T"," "),
    };
    setUsers(p=>[newUser,...p]);
    setModal(null);
    showToast(`✅ ${form.name} provisioned`);
  };

  const saveEdit = (userId, form) => {
    const roleStyleMap = { ADMIN:"bg-gray-900 text-white", STAFF:"bg-gray-100 text-gray-700", MODERATOR:"bg-blue-100 text-blue-700" };
    const statusColorMap = { Active:"#22c55e", Blocked:"#ef4444", Suspended:"#f59e0b" };
    setUsers(p=>p.map(u=>u.id===userId
      ? { ...u, role:form.role, roleStyle:roleStyleMap[form.role], status:form.status, statusColor:statusColorMap[form.status] }
      : u
    ));
    setModal(null);
    showToast(`✏️ User updated`);
  };

  const handlePropagate = () => {
    setPropagated(true);
    setTimeout(()=>setPropagated(false),2500);
    showToast("🔄 Authority matrix propagated");
  };

  const filtered = users.filter(u=>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.handle.toLowerCase().includes(search.toLowerCase())
  );

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
          {NAV.map(item=>(
            <NavItem key={item.key} icon={item.icon} label={item.label}
              active={item.key==="users"}
              onClick={()=>item.to ? navigate(item.to) : null}
            />
          ))}
        </nav>
        <div className="pb-5 border-t border-gray-100 pt-3">
          <NavItem icon="❓" label="SUPPORT" active={false} onClick={()=>{}}/>
          <NavItem icon="↪" label="LOGOUT"  active={false} onClick={()=>navigate("/login")}/>
        </div>
      </aside>

      {/* ─── MAIN ────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">

        {/* TOP BAR */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-8 gap-5 shrink-0">
          <h1 className="text-base font-black text-gray-900 shrink-0">PrecisionDrive Admin</h1>
          <div className="relative max-w-xs w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search system records..."
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <button className="text-gray-400 hover:text-gray-700 text-lg">🔔</button>
            <button className="text-gray-400 hover:text-gray-700 text-lg">❓</button>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-gray-900 leading-tight">Marcus Vance</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">System Admin</p>
            </div>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shrink-0">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&q=80&fit=crop&crop=face" alt="admin" className="w-full h-full object-cover"/>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">
          <div className="flex gap-5">

            {/* ── LEFT PANEL ── */}
            <div className="flex-1 min-w-0">

              {/* Identity Engine header */}
              <h2 className="text-3xl font-black italic tracking-tight text-gray-900 leading-tight mb-1">IDENTITY ENGINE</h2>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Managing {users.length || 1248} Active Entities Across Global Fleet
                  </p>
                </div>
                <div className="flex gap-3 shrink-0">
                  <button className="px-4 py-2 border border-gray-200 bg-white text-sm font-bold text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition-colors">
                    Export Logs
                  </button>
                  <button onClick={()=>setModal({mode:"provision"})}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
                    👤 Provision User
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-0 border-b border-gray-200 mb-0">
                {[
                  { key:"directory", label:"Active Directory" },
                  { key:"audit",     label:"Audit Trail" },
                  { key:"pending",   label:"Pending Access" },
                ].map(t=>(
                  <button key={t.key} onClick={()=>setTab(t.key)}
                    className={`px-5 py-3 text-xs font-black uppercase tracking-wider transition-colors border-b-2 ${
                      tab===t.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-700"
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* User Table */}
              <div className="bg-white border border-gray-100 rounded-b-xl shadow-sm mb-5">
                {/* Table header */}
                <div className="grid grid-cols-[2fr_1fr_1fr_1.4fr_auto] gap-4 px-6 py-3 border-b border-gray-50">
                  {["Identity","System Role","Connectivity","Last Activity","Actions"].map(h=>(
                    <p key={h} className="text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</p>
                  ))}
                </div>

                {/* Rows */}
                {loading
                  ? Array(3).fill(0).map((_,i)=>(
                      <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1.4fr_auto] gap-4 px-6 py-4 border-b border-gray-50 animate-pulse items-center">
                        <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gray-100"/><div><div className="h-3 bg-gray-100 rounded w-24 mb-1"/><div className="h-2 bg-gray-100 rounded w-16"/></div></div>
                        <div className="h-5 bg-gray-100 rounded w-16"/>
                        <div className="h-3 bg-gray-100 rounded w-14"/>
                        <div className="h-3 bg-gray-100 rounded w-28"/>
                        <div className="w-6 h-6 bg-gray-100 rounded"/>
                      </div>
                    ))
                  : filtered.map(u=>(
                      <div key={u.id} className="grid grid-cols-[2fr_1fr_1fr_1.4fr_auto] gap-4 px-6 py-4 border-b border-gray-50 items-center hover:bg-gray-50/50 transition-colors">
                        {/* Identity */}
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                            style={{backgroundColor:u.color}}>
                            {u.initials}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 leading-tight">{u.name}</p>
                            <p className="text-[11px] text-gray-400 font-medium">{u.handle}</p>
                          </div>
                        </div>
                        {/* Role */}
                        <div>
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider ${u.roleStyle}`}>
                            {u.role}
                          </span>
                        </div>
                        {/* Connectivity */}
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor:u.statusColor}}/>
                          <span className="text-xs font-bold text-gray-700">{u.status}</span>
                        </div>
                        {/* Last activity */}
                        <p className="text-xs font-mono text-gray-500">{u.lastActivity}</p>
                        {/* Edit */}
                        <button onClick={()=>setModal({mode:"edit",data:u})}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-blue-100 hover:text-blue-600 flex items-center justify-center text-gray-500 transition-colors text-sm">
                          ✏️
                        </button>
                      </div>
                    ))
                }

                {/* Table footer */}
                <div className="flex items-center justify-between px-6 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Showing {filtered.length} of 1,248 Records
                  </p>
                  <div className="flex items-center gap-1">
                    <button onClick={()=>setPage(p=>Math.max(1,p-1))} className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 text-sm">‹</button>
                    {[1,2].map(n=>(
                      <button key={n} onClick={()=>setPage(n)}
                        className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-colors ${page===n?"bg-blue-600 text-white":"border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}>
                        {n}
                      </button>
                    ))}
                    <button onClick={()=>setPage(p=>Math.min(2,p+1))} className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 text-sm">›</button>
                  </div>
                </div>
              </div>

              {/* Critical System Events */}
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-700 mb-3">Critical System Events</p>
              <div className="space-y-2">
                {EVENTS.map((ev,i)=>(
                  <div key={i} className="bg-white border border-gray-100 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-base"
                      style={{backgroundColor:ev.iconBg}}>
                      {ev.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-gray-900 uppercase tracking-wider mb-0.5">{ev.type}</p>
                      <p className="text-xs text-gray-500 font-medium truncate">{ev.desc}</p>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 shrink-0">{ev.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="w-60 shrink-0 space-y-4">

              {/* Authority Matrix */}
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-900">Authority Matrix</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Configuring 'Moderator' Scope</p>
                  </div>
                  <span className="text-blue-500 text-lg">⭐</span>
                </div>

                <div className="px-5 py-4 space-y-5">
                  {PERM_GROUPS.map(group=>(
                    <div key={group.label}>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">{group.label}</p>
                      <div className="space-y-3">
                        {group.keys.map(key=>(
                          <div key={key} className="flex items-center justify-between gap-3">
                            <span className="text-[11px] font-medium text-gray-700 leading-tight">{key}</span>
                            <Toggle
                              on={perms[key]}
                              danger={key==="Log Deletion"}
                              onChange={v=>setPerms(p=>({...p,[key]:v}))}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-5 pb-5">
                  <button onClick={handlePropagate}
                    className={`w-full py-2.5 border border-gray-200 text-xs font-black uppercase tracking-widest rounded-lg transition-colors ${
                      propagated ? "bg-green-50 border-green-300 text-green-600" : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}>
                    {propagated ? "✅ Propagated!" : "Propagate Changes"}
                  </button>
                </div>
              </div>

              {/* System Status dark card */}
              <div className="relative rounded-xl overflow-hidden">
                <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=60&fit=crop"
                  alt="servers" className="absolute inset-0 w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-gray-900/80"/>
                <div className="relative p-5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Status Report</p>
                  <p className="text-lg font-black text-white leading-tight mb-4">SYSTEM INTEGRITY<br/>NOMINAL</p>
                  <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                    <div>
                      <p className="text-[9px] font-black uppercase text-gray-500 mb-0.5">Errors</p>
                      <p className="text-xl font-black text-white">0.00%</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-gray-500 mb-0.5">Uptime</p>
                      <p className="text-xl font-black text-white">99.99</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─── MODALS ──────────────────────────────────────── */}
      {modal?.mode==="provision" && <ProvisionModal onClose={()=>setModal(null)} onSave={saveProvision}/>}
      {modal?.mode==="edit" && <EditModal user={modal.data} onClose={()=>setModal(null)} onSave={(f)=>saveEdit(modal.data.id,f)}/>}

      {/* ─── TOAST ───────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-lg shadow-xl text-sm font-bold flex items-center gap-3 z-50">
          {toast}
          <button onClick={()=>setToast(null)} className="text-gray-400 hover:text-white ml-1">✕</button>
        </div>
      )}
    </div>
  );
}
