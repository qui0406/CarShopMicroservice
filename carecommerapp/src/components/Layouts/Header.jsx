import { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { MyUserContext, MyDispatchContext } from "../../configs/MyContexts";
import { Badge } from "react-bootstrap";
import {
  FaShoppingCart, FaCarSide, FaTags, FaNewspaper, FaStar,
  FaBox, FaHistory, FaSignOutAlt, FaRegUserCircle, FaBars, FaTimes, FaChevronDown
} from "react-icons/fa";

const NAV_STYLE = {
  position: "fixed", top: 0, left: 0, right: 0, zIndex: 1050,
  backgroundColor: "#ffffff", borderBottom: "1px solid #e7e8e9",
  fontFamily: "'Montserrat', 'Roboto', sans-serif",
  boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
};

const LINK = {
  color: "#191c1d", fontWeight: 600, fontSize: "0.92rem",
  textDecoration: "none", padding: "8px 14px", borderRadius: 6,
  whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4,
  transition: "color 0.15s, background 0.15s",
};

const DROP_ITEM = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "10px 18px", color: "#191c1d", textDecoration: "none",
  fontSize: "0.88rem", fontWeight: 500, whiteSpace: "nowrap",
  transition: "background 0.15s",
};

function DropdownMenu({ label, items }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}>
      <button style={{ ...LINK, background: "none", border: "none", cursor: "pointer" }}>
        {label} <FaChevronDown size={10} style={{ opacity: 0.6 }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, background: "#fff",
          borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          border: "1px solid #e8f0fe", minWidth: 200, zIndex: 1100, padding: "6px 0"
        }}>
          {items.map(({ to, icon: Icon, label: lbl }) => (
            <Link key={to} to={to} style={DROP_ITEM}
              onMouseEnter={e => e.currentTarget.style.background = "#f0f7ff"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              {Icon && <Icon style={{ color: "#1a73e8", flexShrink: 0 }} />} {lbl}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const Header = () => {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatchContext);
  const nav = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const logout = () => { dispatch({ type: "logout" }); nav("/login"); };
  const isStaff = user?.result?.roles?.includes("STAFF");

  const productItems = [
    { to: "/car-new",  icon: FaCarSide, label: "Xe ô tô mới" },
    { to: "/car-old",  icon: FaCarSide, label: "Xe ô tô cũ (Lướt)" },
    { to: "/sell-car", icon: FaTags,    label: "Bán xe cũ của bạn" },
    { to: "/voucher",  icon: FaTags,    label: "Voucher ưu đãi" },
  ];
  const serviceItems = [
    { to: "/news",      icon: FaNewspaper, label: "Tin tức thị trường" },
    { to: "/valuation", icon: FaStar,      label: "Định giá xe AI" },
  ];
  const personalItems = [
    { to: "/all-my-reserve", icon: FaBox,    label: "Đơn hàng đã đặt" },
    { to: "/all-my-deposit", icon: FaHistory, label: "Lịch sử giao dịch" },
  ];

  return (
    <div style={NAV_STYLE}>
      <div style={{ display: "flex", alignItems: "center", padding: "10px 40px", gap: 8 }}>

        {/* Logo */}
        <Link to="/home" style={{ fontWeight: 800, fontSize: "1.4rem", color: "#1a73e8", letterSpacing: "-1px", textDecoration: "none", marginRight: 20, flexShrink: 0 }}>
          CarShop
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, flexWrap: "wrap" }}>
          {isStaff ? (
            <>
              <NavLink to="/staff/home" end style={({ isActive }) => ({ ...LINK, color: isActive ? "#1a73e8" : "#191c1d" })}>Dashboard</NavLink>
              <NavLink to="/staff/home/model" style={({ isActive }) => ({ ...LINK, color: isActive ? "#1a73e8" : "#191c1d" })}>Mẫu xe</NavLink>
              <NavLink to="/staff/home/cashier" style={({ isActive }) => ({ ...LINK, color: isActive ? "#1a73e8" : "#191c1d" })}>Thu ngân</NavLink>
            </>
          ) : (
            <>
              <DropdownMenu label="Sản phẩm"      items={productItems} />
              <DropdownMenu label="Dịch vụ & Tin tức" items={serviceItems} />
              <DropdownMenu label="Cá nhân"        items={personalItems} />
              <NavLink to="/about" style={({ isActive }) => ({ ...LINK, color: isActive ? "#1a73e8" : "#191c1d" })}>Về chúng tôi</NavLink>
            </>
          )}
        </div>

        {/* Right Section */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {/* Cart */}
          <div style={{ position: "relative", cursor: "pointer", padding: 8, borderRadius: "50%", background: "#f8f9fa", color: "#5d6571" }}>
            <FaShoppingCart size={17} />
            <Badge bg="danger" pill style={{ position: "absolute", top: -2, right: -6, fontSize: "0.55rem", border: "2px solid white", padding: "2px 5px" }}>2</Badge>
          </div>

          {/* Auth */}
          {user === null ? (
            <div style={{ display: "flex", gap: 8, paddingLeft: 16, borderLeft: "1px solid #e2e8f0" }}>
              <Link to="/login" style={{ padding: "8px 16px", background: "#e8f0fe", color: "#1a73e8", borderRadius: 6, fontWeight: 700, textDecoration: "none", fontSize: "0.88rem" }}>Đăng nhập</Link>
              <Link to="/register" style={{ padding: "8px 16px", background: "#1a73e8", color: "#fff", borderRadius: 6, fontWeight: 700, textDecoration: "none", fontSize: "0.88rem" }}>Đăng ký</Link>
            </div>
          ) : (
            <div style={{ paddingLeft: 16, borderLeft: "1px solid #e2e8f0", position: "relative" }}
              onMouseEnter={() => setUserMenuOpen(true)}
              onMouseLeave={() => setUserMenuOpen(false)}>
              <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <img
                  src={user.result?.avatar || "https://via.placeholder.com/32"}
                  alt="avatar"
                  style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: "2px solid #e8f0fe" }}
                />
                <FaChevronDown size={10} style={{ color: "#94a3b8" }} />
              </button>
              {userMenuOpen && (
                <div style={{ position: "absolute", top: "100%", right: 0, background: "#fff", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid #e8f0fe", minWidth: 200, zIndex: 1100, padding: "6px 0" }}>
                  <div style={{ padding: "10px 18px 8px", borderBottom: "1px solid #f1f5f9", marginBottom: 4 }}>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Xin chào,</div>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>{user.result?.username}</div>
                  </div>
                  <Link to="/profile" style={{ ...DROP_ITEM }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f0f7ff"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <FaRegUserCircle style={{ color: "#1a73e8" }} /> Hồ sơ của tôi
                  </Link>
                  <button onClick={logout} style={{ ...DROP_ITEM, background: "none", border: "none", cursor: "pointer", width: "100%", color: "#ef4444" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <FaSignOutAlt style={{ color: "#ef4444" }} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(o => !o)}
            style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 6 }}
            className="header-mobile-btn">
            {mobileOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ borderTop: "1px solid #f1f5f9", padding: "12px 24px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
          {[...productItems, ...serviceItems, ...personalItems, { to: "/about", label: "Về chúng tôi" }].map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)}
              style={{ ...LINK, padding: "10px 0", borderBottom: "1px solid #f8fafc" }}>
              {label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .header-mobile-btn { display: flex !important; }
        }
        .nav-link-hover:hover { background: #f0f7ff !important; color: #1a73e8 !important; }
      `}</style>
    </div>
  );
};

export default Header;
