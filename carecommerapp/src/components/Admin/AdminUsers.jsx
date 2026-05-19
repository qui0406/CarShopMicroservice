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
    desc: "Admin @m_vance đã thay đổi quyền hạn của 'Moderator'.",
    time: "2ph trước", iconBg: "#dbeafe", iconColor: "#2563eb", icon: "🔑",
  },
  {
    type: "ENTITY_AUTH_BLOCKED",
    desc: "Hệ thống tự động hạn chế @blackwell_j do lưu lượng truy cập bất thường.",
    time: "45ph trước", iconBg: "#fee2e2", iconColor: "#dc2626", icon: "🔒",
  },
];

/* ─── Authority Matrix config ────────────────────────────── */
const INIT_PERMS = {
  "Sửa dữ liệu xe": true,
  "Cấp mã VIN mới": false,
  "Phê duyệt tin đăng": true,
  "Tạo người dùng": false,
  "Xóa nhật ký": false,
  "Báo cáo tài chính": false,
  "Thông số sức khỏe hệ thống": true,
};

const PERM_GROUPS = [
  { label: "Vận hành kho xe", keys: ["Sửa dữ liệu xe", "Cấp mã VIN mới", "Phê duyệt tin đăng"] },
  { label: "Kiểm soát truy cập", keys: ["Tạo người dùng", "Xóa nhật ký"] },
  { label: "Xem phân tích", keys: ["Báo cáo tài chính", "Thông số sức khỏe hệ thống"] },
];

/* ─── NavItem ────────────────────────────────────────────── */
function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-5 py-3 text-xs font-black tracking-widest text-left transition-colors ${active
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
      className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${on ? (danger ? "bg-red-400" : "bg-blue-600") : "bg-gray-200"
        }`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

/* ─── Provision Modal ────────────────────────────────────── */
function ProvisionModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.username || !form.email || !form.password) {
      setError("Vui lòng điền đầy đủ các trường.");
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-white font-black text-base">Cấp nhân viên mới</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full text-white flex items-center justify-center hover:bg-white/30">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-xs text-red-500 bg-red-50 p-2.5 rounded-lg border border-red-100 font-bold">{error}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Họ</label>
              <input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} placeholder="VD: Marcus" required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Tên</label>
              <input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} placeholder="VD: Vance" required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Tên đăng nhập (Username)</label>
            <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="VD: marcus_vance" required
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="VD: user@domain.com" required
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Mật khẩu</label>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="********" required
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors">Tạo nhân viên</button>
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Edit User Modal ────────────────────────────────────── */
function EditModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({ role: user.role, status: user.status });
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sửa đối tượng</p>
            <h3 className="text-white font-black">{user.name}</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 bg-white/10 rounded-full text-white flex items-center justify-center hover:bg-white/20 text-sm">✕</button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Vai trò hệ thống</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {["ADMIN", "STAFF", "MODERATOR"].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 block">Kết nối</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {["Active", "Blocked", "Suspended"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => onSave(form)} className="flex-1 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">Lưu</button>
            <button onClick={onClose} className="flex-1 py-2 border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50">Hủy</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "#2563eb", "#3b82f6", "#10b981", "#059669",
    "#f59e0b", "#d97706", "#ef4444", "#dc2626",
    "#8b5cf6", "#7c3aed", "#ec4899", "#db2777"
  ];
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("directory");
  const [modal, setModal] = useState(null);
  const [perms, setPerms] = useState(INIT_PERMS);
  const [propagated, setPropagated] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchUsers = async (targetPage = page) => {
    setLoading(true);
    try {
      const res = await authApis().get(endpoints["all-profiles"], {
        params: { page: targetPage, size: 10 }
      });
      const list = res.data?.result?.content || res.data?.result || [];
      const totalPagesVal = res.data?.result?.totalPages || 1;
      const totalElementsVal = res.data?.result?.totalElements || list.length;

      const roleStyleMap = {
        ADMIN: "bg-gray-900 text-white",
        STAFF: "bg-gray-100 text-gray-700",
        MODERATOR: "bg-blue-100 text-blue-700",
        USER: "bg-green-100 text-green-700"
      };

      const mapped = list.map(u => {
        const name = u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : (u.username || "User");
        const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

        // Pick primary role
        const primaryRole = u.roles && u.roles.length > 0 ? [...u.roles][0].toUpperCase().replace("ROLE_", "") : "USER";

        return {
          id: u.id || u.userKeyCloakId,
          initials,
          color: stringToColor(name),
          avatarUrl: u.avatar,
          name,
          handle: u.username ? "@" + u.username : (u.email ? u.email.split("@")[0] : "@user"),
          role: primaryRole,
          roleStyle: roleStyleMap[primaryRole] || "bg-gray-100 text-gray-700",
          status: "Active",
          statusColor: "#22c55e",
          email: u.email || "N/A",
          phone: u.phone || "N/A",
          address: u.address || "N/A",
          dob: u.dob || "N/A"
        };
      });

      setUsers(mapped);
      setTotalPages(totalPagesVal);
      setTotalElements(totalElementsVal);
    } catch (err) {
      console.error("Error fetching users:", err);
      showToast("❌ Lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const saveProvision = async (form) => {
    try {
      const res = await authApis().post(endpoints["create-staff"], {
        username: form.username,
        password: form.password,
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName
      });

      setModal(null);
      showToast(`✅ Nhân viên ${form.firstName} ${form.lastName} đã được cấp quyền!`);
      setPage(1);
      fetchUsers(1);
    } catch (err) {
      console.error("Error creating staff:", err);
      const errMsg = err.response?.data?.message || "Lỗi khi tạo nhân viên";
      showToast(`❌ ${errMsg}`);
    }
  };

  const saveEdit = (userId, form) => {
    const roleStyleMap = { ADMIN: "bg-gray-900 text-white", STAFF: "bg-gray-100 text-gray-700", MODERATOR: "bg-blue-100 text-blue-700" };
    const statusColorMap = { Active: "#22c55e", Blocked: "#ef4444", Suspended: "#f59e0b" };
    setUsers(p => p.map(u => u.id === userId
      ? { ...u, role: form.role, roleStyle: roleStyleMap[form.role], status: form.status, statusColor: statusColorMap[form.status] }
      : u
    ));
    setModal(null);
    showToast(`✏️ Đã cập nhật người dùng`);
  };

  const handlePropagate = () => {
    setPropagated(true);
    setTimeout(() => setPropagated(false), 2500);
    showToast("🔄 Đã lan truyền ma trận quyền hạn");
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.handle.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-white font-sans text-gray-900 overflow-hidden">

      {/* ─── SIDEBAR ─────────────────────────────────────── */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col shrink-0 h-full">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">

          </div>
        </div>
        <nav className="flex-1 py-3">
          {NAV.map(item => (
            <NavItem key={item.key} icon={item.icon} label={item.label}
              active={item.key === "users"}
              onClick={() => item.to ? navigate(item.to) : null}
            />
          ))}
        </nav>
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
          <div className="relative max-w-xs w-full">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm hồ sơ hệ thống..."
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-gray-900 leading-tight">Admin</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">System Admin</p>
            </div>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shrink-0">
              <img src={adminAvatar} alt="admin" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">
          <div className="flex gap-5">

            {/* ── LEFT PANEL ── */}
            <div className="flex-1 min-w-0">

              {/* Identity Engine header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex gap-3 shrink-0">
                  <button onClick={() => setModal({ mode: "provision" })}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
                    Cấp nhân viên mới
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-0 border-b border-gray-200 mb-0">
                {[
                  { key: "directory", label: "Danh sách nhân viên" }
                ].map(t => (
                  <button key={t.key} onClick={() => setTab(t.key)}
                    className={`px-5 py-3 text-xs font-black uppercase tracking-wider transition-colors border-b-2 ${tab === t.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-700"
                      }`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* User Table */}
              <div className="bg-white border border-gray-100 rounded-b-xl shadow-sm mb-5">
                {/* Table header */}
                <div className="grid grid-cols-[2fr_1fr_1fr_1.4fr_auto] gap-4 px-6 py-3 border-b border-gray-50">
                  {["Nhận dạng", "Vai trò", "Kết nối", "Email / Liên hệ", "Thao tác"].map(h => (
                    <p key={h} className="text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</p>
                  ))}
                </div>

                {/* Rows */}
                {loading
                  ? Array(3).fill(0).map((_, i) => (
                    <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1.4fr_auto] gap-4 px-6 py-4 border-b border-gray-50 animate-pulse items-center">
                      <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gray-100" /><div><div className="h-3 bg-gray-100 rounded w-24 mb-1" /><div className="h-2 bg-gray-100 rounded w-16" /></div></div>
                      <div className="h-5 bg-gray-100 rounded w-16" />
                      <div className="h-3 bg-gray-100 rounded w-14" />
                      <div className="h-3 bg-gray-100 rounded w-28" />
                      <div className="w-6 h-6 bg-gray-100 rounded" />
                    </div>
                  ))
                  : filtered.map(u => (
                    <div key={u.id} className="grid grid-cols-[2fr_1fr_1fr_1.4fr_auto] gap-4 px-6 py-4 border-b border-gray-50 items-center hover:bg-gray-50/50 transition-colors">
                      {/* Identity */}
                      <div className="flex items-center gap-3">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                            style={{ backgroundColor: u.color }}>
                            {u.initials}
                          </div>
                        )}
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
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: u.statusColor }} />
                        <span className="text-xs font-bold text-gray-700">{u.status}</span>
                      </div>
                      {/* Contact */}
                      <div>
                        <p className="text-xs font-mono text-gray-700 leading-tight break-all">{u.email}</p>
                        {u.phone && u.phone !== "N/A" && <p className="text-[10px] text-gray-400 font-medium mt-0.5">{u.phone}</p>}
                      </div>
                      {/* Edit */}
                      <button onClick={() => setModal({ mode: "edit", data: u })}
                        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-blue-100 hover:text-blue-600 flex items-center justify-center text-gray-500 transition-colors text-sm">
                        ✏️
                      </button>
                    </div>
                  ))
                }

                {/* Table footer */}
                <div className="flex items-center justify-between px-6 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Hiển thị {filtered.length} trên {totalElements} hồ sơ
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 text-sm"
                    >
                      ‹
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                      <button key={n} onClick={() => setPage(n)}
                        className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-colors ${page === n ? "bg-blue-600 text-white" : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}>
                        {n}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 text-sm"
                    >
                      ›
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─── MODALS ──────────────────────────────────────── */}
      {modal?.mode === "provision" && <ProvisionModal onClose={() => setModal(null)} onSave={saveProvision} />}
      {modal?.mode === "edit" && <EditModal user={modal.data} onClose={() => setModal(null)} onSave={(f) => saveEdit(modal.data.id, f)} />}

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
