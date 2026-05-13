import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaThLarge,
  FaCarAlt,
  FaPlusSquare,
  FaImages,
  FaIdBadge,
  FaQuestionCircle,
  FaSignOutAlt,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaClipboardList
} from "react-icons/fa";

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-[calc(100%-2rem)] mx-auto flex items-center gap-4 px-4 py-3 text-[11px] font-black tracking-widest uppercase transition-all rounded text-left mb-1 ${active
          ? "text-blue-600 bg-blue-50/70 border-l-[3px] border-blue-600"
          : "text-gray-500 border-l-[3px] border-transparent hover:bg-gray-100 hover:text-gray-800"
        }`}
    >
      <Icon className="text-base" />
      {label}
    </button>
  );
}

export default function StaffLayout({ children, searchPlaceholder = "Search...", searchVal, onSearchChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const isActive = (route) => path.includes(route);

  return (
    <div className="flex h-screen bg-white font-sans text-gray-900 overflow-hidden">
      {/* ─── SIDEBAR ─────────────────────────────────────── */}
      <aside className="w-64 border-r border-gray-100 flex flex-col shrink-0 h-full bg-gray-50/50 z-10">

        <div className="px-8 py-8 mb-4">
          <h1 className="text-[20px] font-black text-gray-900 tracking-tight leading-none mb-1">Inventory Control</h1>
          <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-0">TERMINAL V2.4.0</p>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <NavItem icon={FaThLarge} label="Dashboard" active={path === "/staff/home" && !path.includes("/model")} onClick={() => navigate("/staff/home")} />
          <NavItem icon={FaCarAlt} label="Inventory" active={path === "/staff/inventory"} onClick={() => navigate("/staff/inventory")} />
          <NavItem icon={FaPlusSquare} label="Add New Car" active={isActive("/staff/create-car") || isActive("/staff/home/model")} onClick={() => navigate("/staff/create-car")} />
          <NavItem icon={FaImages} label="Media Library" active={isActive("/staff/media")} onClick={() => navigate("/staff/media")} />
          <NavItem icon={FaMoneyBillWave} label="Cashier" active={isActive("/staff/home/cashier")} onClick={() => navigate("/staff/home/cashier")} />
          <NavItem icon={FaFileInvoiceDollar} label="Direct Payment" active={isActive("/staff/direct-payment")} onClick={() => navigate("/staff/direct-payment")} />
          <NavItem icon={FaClipboardList} label="Thu mua xe cũ" active={isActive("/staff/appraisals")} onClick={() => navigate("/staff/appraisals")} />
          <NavItem icon={FaIdBadge} label="Staff Directory" active={isActive("/staff/directory")} onClick={() => navigate("/staff/directory")} />
        </nav>

        <div className="p-6 pt-2">
          <button className="w-full bg-[#0052cc] hover:bg-blue-700 text-white font-bold text-[11px] uppercase tracking-widest py-3 mb-6 rounded shadow-sm transition-colors cursor-pointer">
            Publish Inventory
          </button>

          <div className="flex flex-col gap-1">
            <button className="flex items-center gap-3 px-2 py-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest hover:text-gray-800 transition-colors text-left w-full hover:bg-gray-100 rounded">
              <FaQuestionCircle className="text-base" /> Support
            </button>
            <button onClick={() => navigate("/login")} className="flex items-center gap-3 px-2 py-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest hover:text-gray-800 transition-colors text-left w-full hover:bg-gray-100 rounded">
              <FaSignOutAlt className="text-base" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN ────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        {/* TOP BAR / Header removed or simplified to match user's request */}
        {/* We keep a very minimal thin border if any, or none, as the user said "bố cục đơn giản đừng bị rối tung lên" */}

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative w-full h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
