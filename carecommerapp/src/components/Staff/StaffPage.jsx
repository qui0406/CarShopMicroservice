import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ─── Mock staff data ───────────────────────────────────── */
const MOCK_STAFF = [
  {
    id: 1, name: "Marcus Vane",     role: "Inventory Manager", dept: "Operations",
    email: "m.vane@precision.com",  phone: "+1 (555) 201-4821",
    status: "ACTIVE", statusColor: "#16a34a", statusBg: "#dcfce7",
    joined: "Jan 2021", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80&fit=crop&crop=face",
    tag: "ADMIN",
  },
  {
    id: 2, name: "Sarah Chen",      role: "Sales Executive",   dept: "Sales",
    email: "s.chen@precision.com",  phone: "+1 (555) 319-7734",
    status: "ACTIVE", statusColor: "#16a34a", statusBg: "#dcfce7",
    joined: "Mar 2022", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80&fit=crop&crop=face",
    tag: "CASHIER",
  },
  {
    id: 3, name: "Alex Reed",       role: "Finance Officer",   dept: "Finance",
    email: "a.reed@precision.com",  phone: "+1 (555) 482-0093",
    status: "ON LEAVE", statusColor: "#d97706", statusBg: "#fef9c3",
    joined: "Jul 2020", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80&fit=crop&crop=face",
    tag: "ADMIN",
  },
  {
    id: 4, name: "Jordan Smith",    role: "IT Technician",     dept: "Technology",
    email: "j.smith@precision.com", phone: "+1 (555) 673-1102",
    status: "ACTIVE", statusColor: "#16a34a", statusBg: "#dcfce7",
    joined: "Nov 2022", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80&fit=crop&crop=face",
    tag: "TECHNICAL",
  },
  {
    id: 5, name: "Priya Nair",      role: "Marketing Manager", dept: "Marketing",
    email: "p.nair@precision.com",  phone: "+1 (555) 904-3315",
    status: "ACTIVE", statusColor: "#16a34a", statusBg: "#dcfce7",
    joined: "Apr 2023", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80&fit=crop&crop=face",
    tag: "MANAGER",
  },
  {
    id: 6, name: "Tom Keller",      role: "Service Advisor",   dept: "Service",
    email: "t.keller@precision.com",phone: "+1 (555) 117-6640",
    status: "INACTIVE", statusColor: "#6b7280", statusBg: "#f3f4f6",
    joined: "Sep 2019", avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&q=80&fit=crop&crop=face",
    tag: "CASHIER",
  },
  {
    id: 7, name: "Nina Rossi",      role: "Fleet Coordinator", dept: "Operations",
    email: "n.rossi@precision.com", phone: "+1 (555) 250-8821",
    status: "ACTIVE", statusColor: "#16a34a", statusBg: "#dcfce7",
    joined: "Feb 2024", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80&fit=crop&crop=face",
    tag: "MANAGER",
  },
  {
    id: 8, name: "David Park",      role: "Tech Support Lead", dept: "Technology",
    email: "d.park@precision.com",  phone: "+1 (555) 388-9902",
    status: "ON LEAVE", statusColor: "#d97706", statusBg: "#fef9c3",
    joined: "Jun 2021", avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=80&q=80&fit=crop&crop=face",
    tag: "TECHNICAL",
  },
];

const ROLE_TABS = ["ALL", "ADMIN", "MANAGER", "CASHIER", "TECHNICAL"];

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

/* ─── Staff Card ────────────────────────────────────────── */
function StaffCard({ member, onView, onEdit, onRemove }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow group">
      {/* Top: avatar + status */}
      <div className="flex items-start justify-between">
        <div className="relative">
          <img
            src={member.avatar} alt={member.name}
            className="w-14 h-14 rounded-xl object-cover border border-gray-100 shadow-sm"
          />
          <div
            className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white"
            style={{ backgroundColor: member.statusColor }}
          />
        </div>
        <span
          className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded"
          style={{ color: member.statusColor, backgroundColor: member.statusBg }}
        >
          {member.status}
        </span>
      </div>

      {/* Info */}
      <div>
        <p className="font-black text-gray-900 text-sm leading-tight">{member.name}</p>
        <p className="text-[11px] text-gray-500 font-medium mt-0.5">{member.role}</p>
        <span className="inline-block mt-1.5 text-[9px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          {member.dept}
        </span>
      </div>

      {/* Contact */}
      <div className="space-y-1 border-t border-gray-50 pt-3">
        <p className="text-[10px] text-gray-400 font-medium truncate">✉ {member.email}</p>
        <p className="text-[10px] text-gray-400 font-medium">📞 {member.phone}</p>
        <p className="text-[10px] text-gray-400 font-medium">📅 Joined {member.joined}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onView(member)} className="flex-1 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase rounded hover:bg-blue-700 transition-colors">View</button>
        <button onClick={() => onEdit(member)} className="flex-1 py-1.5 border border-gray-200 text-gray-700 text-[10px] font-black uppercase rounded hover:bg-gray-50 transition-colors">Edit</button>
        <button onClick={() => onRemove(member.id)} className="py-1.5 px-2.5 border border-red-100 text-red-400 text-[10px] font-black uppercase rounded hover:bg-red-50 hover:text-red-600 transition-colors">✕</button>
      </div>
    </div>
  );
}

/* ─── Add/Edit Modal ────────────────────────────────────── */
function StaffModal({ staff, onClose, onSave }) {
  const [form, setForm] = useState(
    staff
      ? { name: staff.name, role: staff.role, dept: staff.dept, email: staff.email, phone: staff.phone, status: staff.status }
      : { name: "", role: "", dept: "", email: "", phone: "", status: "ACTIVE" }
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">{staff ? "Edit Member" : "New Member"}</p>
            <h3 className="text-white font-black text-base">{staff ? `Edit ${staff.name}` : "Add Staff Member"}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">✕</button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {[
            { label: "Full Name",   key: "name",   placeholder: "e.g. John Doe",        type: "text" },
            { label: "Role",        key: "role",   placeholder: "e.g. Sales Executive",  type: "text" },
            { label: "Department",  key: "dept",   placeholder: "e.g. Sales",            type: "text" },
            { label: "Email",       key: "email",  placeholder: "name@company.com",      type: "email" },
            { label: "Phone",       key: "phone",  placeholder: "+1 (555) ...",          type: "tel" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">{f.label}</label>
              <input
                type={f.type}
                value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ON LEAVE">On Leave</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => onSave(form)} className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors">
              {staff ? "Save Changes" : "Add Member"}
            </button>
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────── */
export default function StaffPage() {
  const navigate = useNavigate();
  const [loading, setLoading]   = useState(true);
  const [staff, setStaff]       = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch]     = useState("");
  const [modal, setModal]       = useState(null); // null | { mode: 'add'|'edit'|'view', data }
  const [toast, setToast]       = useState(null);
  const [page, setPage]         = useState(1);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const t = setTimeout(() => { setStaff(MOCK_STAFF); setLoading(false); }, 1000);
    return () => clearTimeout(t);
  }, []);

  const filtered = staff.filter(m => {
    const matchTab    = activeTab === "ALL" || m.tag === activeTab;
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
                        m.role.toLowerCase().includes(search.toLowerCase()) ||
                        m.dept.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleSave = (form) => {
    if (modal.mode === "add") {
      const newMember = {
        ...form, id: Date.now(), tag: "ADMIN",
        joined: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name)}&background=1d4ed8&color=fff&size=80`,
        statusColor: form.status === "ACTIVE" ? "#16a34a" : form.status === "ON LEAVE" ? "#d97706" : "#6b7280",
        statusBg:    form.status === "ACTIVE" ? "#dcfce7" : form.status === "ON LEAVE" ? "#fef9c3" : "#f3f4f6",
      };
      setStaff(prev => [newMember, ...prev]);
      showToast(`✅ ${form.name} added successfully`);
    } else {
      setStaff(prev => prev.map(m => m.id === modal.data.id
        ? { ...m, ...form,
            statusColor: form.status === "ACTIVE" ? "#16a34a" : form.status === "ON LEAVE" ? "#d97706" : "#6b7280",
            statusBg:    form.status === "ACTIVE" ? "#dcfce7" : form.status === "ON LEAVE" ? "#fef9c3" : "#f3f4f6",
          }
        : m
      ));
      showToast(`✏️ ${form.name} updated`);
    }
    setModal(null);
  };

  const handleRemove = (id) => {
    const name = staff.find(m => m.id === id)?.name;
    setStaff(prev => prev.filter(m => m.id !== id));
    showToast(`🗑️ ${name} removed`);
  };

  const stats = [
    { label: "TOTAL STAFF",   value: staff.length,                                color: "text-gray-900" },
    { label: "ACTIVE",        value: staff.filter(m => m.status === "ACTIVE").length,   color: "text-emerald-600" },
    { label: "ON LEAVE",      value: staff.filter(m => m.status === "ON LEAVE").length, color: "text-amber-600" },
    { label: "DEPARTMENTS",   value: [...new Set(staff.map(m => m.dept))].length,  color: "text-blue-600" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">

      {/* ─── SIDEBAR ─────────────────────────────────────── */}
      <aside className="w-52 bg-white border-r border-gray-100 flex flex-col shrink-0 h-full">
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
          <NavItem icon="⊞"  label="Dashboard" active={false} onClick={() => navigate("/staff/home")} />
          <NavItem icon="🚗" label="Inventory"  active={false} onClick={() => navigate("/staff/inventory")} />
          <NavItem icon="🖼️" label="Media"      active={false} onClick={() => navigate("/staff/media")} />
          <NavItem icon="👤" label="Staff"      active={true}  onClick={() => {}} />
        </nav>
        <div className="pb-6 border-t border-gray-100 pt-4">
          <NavItem icon="❓" label="Support" active={false} onClick={() => {}} />
          <NavItem icon="↪"  label="Logout"  active={false} onClick={() => navigate("/login")} />
        </div>
      </aside>

      {/* ─── MAIN ────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">

        {/* TOP BAR */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-8 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-black text-gray-900">Precision Portal</h1>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-400 font-medium">Staff Management</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <button className="text-gray-400 hover:text-gray-700 text-lg">🔔</button>
            <button className="text-gray-400 hover:text-gray-700 text-lg">⚙️</button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shrink-0 bg-orange-400 flex items-center justify-center">
              <span className="text-white font-black text-xs">MV</span>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">

          {/* Page header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-gray-900 leading-tight">Team Directory</h2>
              <p className="text-sm text-gray-400 mt-0.5">Manage staff accounts, roles and permissions.</p>
            </div>
            <button
              onClick={() => setModal({ mode: "add", data: null })}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              + Add Member
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {loading
              ? Array(4).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 animate-pulse">
                    <div className="h-2 bg-gray-100 rounded w-3/4 mb-3"/>
                    <div className="h-7 bg-gray-100 rounded w-1/2"/>
                  </div>
                ))
              : stats.map(s => (
                  <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                    <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  </div>
                ))
            }
          </div>

          {/* Search + Tabs */}
          <div className="flex items-center gap-4 mb-5 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search by name, role or department..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
            <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm shrink-0">
              {ROLE_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors ${
                    activeTab === tab ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {!loading && (
              <span className="text-[11px] text-gray-400 font-medium ml-auto">
                Showing <strong className="text-gray-700">{filtered.length}</strong> members
              </span>
            )}
          </div>

          {/* Staff Grid */}
          {loading ? (
            <div className="grid grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-pulse">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-xl"/>
                    <div className="h-4 bg-gray-100 rounded w-16"/>
                  </div>
                  <div className="h-3 bg-gray-100 rounded w-3/4 mb-2"/>
                  <div className="h-2 bg-gray-100 rounded w-1/2 mb-3"/>
                  <div className="space-y-1.5 border-t border-gray-50 pt-3">
                    <div className="h-2 bg-gray-100 rounded w-full"/>
                    <div className="h-2 bg-gray-100 rounded w-3/4"/>
                    <div className="h-2 bg-gray-100 rounded w-1/2"/>
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center text-gray-400 font-medium">No staff members match your search.</div>
          ) : (
            <div className="grid grid-cols-4 gap-4 mb-8">
              {filtered.map(member => (
                <StaffCard
                  key={member.id}
                  member={member}
                  onView={m => setModal({ mode: "view", data: m })}
                  onEdit={m => setModal({ mode: "edit", data: m })}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}

          {/* Pagination + server */}
          {!loading && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 text-sm">‹</button>
                {[1,2,3].map(n => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-colors ${
                      page === n ? "bg-blue-600 text-white border border-blue-600" : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}>{n}</button>
                ))}
                <span className="px-2 text-gray-400">...</span>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-700 text-xs font-bold hover:bg-gray-50">12</button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 text-sm">›</button>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>Server Status: Online</span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ─── MODAL ───────────────────────────────────────── */}
      {modal && (modal.mode === "add" || modal.mode === "edit") && (
        <StaffModal staff={modal.data} onClose={() => setModal(null)} onSave={handleSave}/>
      )}
      {modal && modal.mode === "view" && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="h-24 bg-gradient-to-r from-blue-600 to-blue-800 relative">
              <button onClick={() => setModal(null)} className="absolute top-3 right-3 w-7 h-7 bg-white/20 rounded-full text-white flex items-center justify-center hover:bg-white/30">✕</button>
            </div>
            <div className="px-6 pb-6 -mt-8">
              <img src={modal.data.avatar} alt={modal.data.name} className="w-16 h-16 rounded-xl border-4 border-white shadow-md object-cover mb-3"/>
              <h3 className="font-black text-gray-900 text-lg">{modal.data.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{modal.data.role}</p>
              <span className="text-[9px] font-black px-2 py-0.5 rounded uppercase mr-2"
                style={{ color: modal.data.statusColor, backgroundColor: modal.data.statusBg }}>{modal.data.status}</span>
              <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase">{modal.data.dept}</span>
              <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-600">✉ {modal.data.email}</p>
                <p className="text-xs text-gray-600">📞 {modal.data.phone}</p>
                <p className="text-xs text-gray-600">📅 Joined {modal.data.joined}</p>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setModal({ mode: "edit", data: modal.data })} className="flex-1 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">Edit</button>
                <button onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

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
