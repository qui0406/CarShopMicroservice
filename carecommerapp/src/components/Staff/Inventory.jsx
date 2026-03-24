import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ─── Mock car data ─────────────────────────────────────── */
const MOCK_CARS = [
  {
    id: 1,
    name: "Porsche 911 Carrera S",
    vin: "WP0AA2A9XLS203",
    brand: "Porsche",
    category: "COUPE",
    catColor: "#dbeafe",
    catText: "#1d4ed8",
    year: 2023,
    price: 132400,
    status: "NEW",
    statusDot: "#22c55e",
    image: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=120&q=80&fit=crop",
  },
  {
    id: 2,
    name: "BMW X5 xDrive40i",
    vin: "5UXCR6C00L9B",
    brand: "BMW",
    category: "SUV",
    catColor: "#f0fdf4",
    catText: "#16a34a",
    year: 2022,
    price: 68900,
    status: "USED",
    statusDot: "#9ca3af",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=120&q=80&fit=crop",
  },
  {
    id: 3,
    name: "Audi e-tron GT",
    vin: "WAUBFBF34MN",
    brand: "Audi",
    category: "ELECTRIC",
    catColor: "#ede9fe",
    catText: "#7c3aed",
    year: 2024,
    price: 104900,
    status: "NEW",
    statusDot: "#22c55e",
    image: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=120&q=80&fit=crop",
  },
  {
    id: 4,
    name: "Mercedes-Benz S 500",
    vin: "W1K2F8EB1MA",
    brand: "Mercedes-Benz",
    category: "SEDAN",
    catColor: "#fef9c3",
    catText: "#a16207",
    year: 2023,
    price: 114500,
    status: "NEW",
    statusDot: "#22c55e",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=120&q=80&fit=crop",
  },
  {
    id: 5,
    name: "Ferrari Roma",
    vin: "ZFF95NJA9N0272",
    brand: "Ferrari",
    category: "COUPE",
    catColor: "#dbeafe",
    catText: "#1d4ed8",
    year: 2023,
    price: 225000,
    status: "NEW",
    statusDot: "#22c55e",
    image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=120&q=80&fit=crop",
  },
  {
    id: 6,
    name: "Toyota Land Cruiser",
    vin: "JTMHX3FH5N4001",
    brand: "Toyota",
    category: "SUV",
    catColor: "#f0fdf4",
    catText: "#16a34a",
    year: 2022,
    price: 87500,
    status: "USED",
    statusDot: "#9ca3af",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=120&q=80&fit=crop",
  },
];

const ALL_BRANDS = ["All Brands", "Porsche", "BMW", "Audi", "Mercedes-Benz", "Ferrari", "Toyota"];
const ALL_CATS   = ["All Categories", "COUPE", "SUV", "ELECTRIC", "SEDAN"];

function fmt(n) {
  return "$" + n.toLocaleString("en-US");
}

/* ─── Sidebar NavItem ───────────────────────────────────── */
function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold tracking-wide transition-colors rounded-none text-left ${
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

/* ─── Main Component ────────────────────────────────────── */
export default function Inventory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState([]);
  const [brandFilter, setBrandFilter] = useState("All Brands");
  const [catFilter, setCatFilter]     = useState("All Categories");
  const [search, setSearch]           = useState("");
  const [selected, setSelected]       = useState([]);
  const [page, setPage]               = useState(1);
  const ROWS = 10;

  /* Simulate fetch */
  useEffect(() => {
    const t = setTimeout(() => {
      setCars(MOCK_CARS);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  /* Filtering */
  const filtered = cars.filter((c) => {
    const matchBrand = brandFilter === "All Brands" || c.brand === brandFilter;
    const matchCat   = catFilter   === "All Categories" || c.category === catFilter;
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                        c.vin.toLowerCase().includes(search.toLowerCase());
    return matchBrand && matchCat && matchSearch;
  });

  const toggleRow = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map((c) => c.id));

  const clearFilters = () => { setBrandFilter("All Brands"); setCatFilter("All Categories"); setSearch(""); };

  return (
    <div className="flex h-screen bg-white font-sans text-gray-900 overflow-hidden">

      {/* ─── SIDEBAR ─────────────────────────────────────── */}
      <aside className="w-52 border-r border-gray-100 flex flex-col shrink-0 h-full bg-white">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-black">ST</div>
            <div>
              <p className="text-sm font-black text-gray-900 leading-tight">Staff Portal</p>
              <p className="text-[9px] text-gray-400 font-bold tracking-wider uppercase">Automotive Precision</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-4">
          <NavItem icon="⊞"  label="Dashboard"  active={false} onClick={() => navigate("/staff/home")} />
          <NavItem icon="🚗" label="Inventory"   active={true}  onClick={() => {}} />
          <NavItem icon="➕" label="Add New"     active={false} onClick={() => navigate("/staff/home/model")} />
          <NavItem icon="🖼️" label="Media"       active={false} onClick={() => navigate("/staff/media")} />
          <NavItem icon="👤" label="Staff"       active={false} onClick={() => navigate("/staff/directory")} />
        </nav>
        <div className="pb-6 border-t border-gray-100 pt-4">
          <NavItem icon="❓" label="Support"  active={false} onClick={() => {}} />
          <NavItem icon="↪"  label="Sign Out" active={false} onClick={() => navigate("/login")} />
        </div>
      </aside>

      {/* ─── MAIN ────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">

        {/* TOP BAR */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-6 gap-4 shrink-0">
          <div className="flex-1 max-w-md relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search by name or VIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="ml-auto flex items-center gap-4">
            <button className="text-gray-400 hover:text-gray-700 text-lg">🔔</button>
            <button className="text-gray-400 hover:text-gray-700 text-lg">⚙️</button>
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-gray-900 leading-tight">Marcus Vane</p>
                <p className="text-[9px] text-gray-400">Inventory Manager</p>
              </div>
              <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shrink-0">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&q=80&fit=crop&crop=face" alt="avatar" className="w-full h-full object-cover"/>
              </div>
            </div>
          </div>
        </header>

        {/* SCROLLABLE AREA */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">

          {/* Breadcrumb */}
          <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">
            Portal <span className="text-blue-500 mx-1">/</span> Inventory Management
          </p>

          {/* Page header */}
          <div className="flex items-start justify-between mb-5">
            <h1 className="text-[34px] font-black tracking-tight text-gray-900 uppercase leading-none">Fleet Overview</h1>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
                📤 Export Data
              </button>
              <button onClick={() => navigate("/staff/create-car")} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 shadow-sm transition-colors">
                + ADD NEW CAR
              </button>
            </div>
          </div>

          {/* Stats + Quick Action */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Stats card */}
            <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              {loading ? (
                <div className="flex gap-8 animate-pulse">
                  {[1,2,3,4].map(i=>(
                    <div key={i}><div className="h-2 bg-gray-100 rounded w-20 mb-3"/><div className="h-7 bg-gray-100 rounded w-16"/></div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-8">
                  {[
                    { label: "TOTAL UNITS",     value: "1,428",       color: "text-gray-900" },
                    { label: "ACTIVE LISTINGS", value: "892",         color: "text-blue-600" },
                    { label: "SOLD THIS MONTH", value: "156",         color: "text-gray-900" },
                    { label: "INVENTORY VALUE", value: "$42,850,000", color: "text-gray-900", icon: true },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                      <div className="flex items-center gap-2">
                        <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                        {s.icon && <span className="text-blue-500 text-lg">📈</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Action card */}
            <div className="bg-blue-600 rounded-xl p-5 flex flex-col justify-between text-white shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10 text-[100px] select-none">📋</div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Quick Action</p>
              <div>
                <p className="text-lg font-black leading-tight mt-2">Generate Technical Compliance Report</p>
              </div>
            </div>
          </div>

          {/* Filter + Table card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Filter bar */}
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3 flex-wrap">
              {/* Brand filter */}
              <div className="flex items-center gap-2 border border-gray-200 rounded px-3 py-1.5 bg-white">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Brand:</span>
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="text-xs font-bold text-gray-700 bg-transparent focus:outline-none cursor-pointer"
                >
                  {ALL_BRANDS.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>

              {/* Category filter */}
              <div className="flex items-center gap-2 border border-gray-200 rounded px-3 py-1.5 bg-white">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Category:</span>
                <select
                  value={catFilter}
                  onChange={(e) => setCatFilter(e.target.value)}
                  className="text-xs font-bold text-gray-700 bg-transparent focus:outline-none cursor-pointer"
                >
                  {ALL_CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <button onClick={clearFilters} className="text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-wider">
                Clear All
              </button>

              <div className="ml-auto flex items-center gap-3">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bulk Actions:</span>
                {selected.length > 0 && (
                  <>
                    <button className="text-red-400 hover:text-red-600 font-bold" title="Delete selected">🗑️</button>
                    <button className="text-gray-400 hover:text-gray-700 font-bold" title="Export selected">📥</button>
                  </>
                )}
                {selected.length === 0 && (
                  <span className="text-gray-300 text-sm">🗑️ 📥</span>
                )}
              </div>
            </div>

            {/* Table */}
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3 w-10">
                    <input type="checkbox" className="rounded border-gray-300"
                      checked={!loading && selected.length === filtered.length && filtered.length > 0}
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Car Name &amp; Detail</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Brand</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Year</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {loading
                  ? Array(4).fill(0).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-5 py-4"><div className="w-4 h-4 bg-gray-100 rounded"/></td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-20 h-12 bg-gray-100 rounded"/>
                            <div><div className="h-3 bg-gray-100 rounded w-32 mb-2"/><div className="h-2 bg-gray-100 rounded w-24"/></div>
                          </div>
                        </td>
                        <td className="px-4 py-4"><div className="h-3 bg-gray-100 rounded w-16"/></td>
                        <td className="px-4 py-4"><div className="h-5 bg-gray-100 rounded w-16"/></td>
                        <td className="px-4 py-4"><div className="h-3 bg-gray-100 rounded w-10"/></td>
                        <td className="px-4 py-4"><div className="h-3 bg-gray-100 rounded w-20"/></td>
                        <td className="px-4 py-4"><div className="h-5 bg-gray-100 rounded w-14"/></td>
                        <td className="px-4 py-4"><div className="flex gap-2"><div className="w-6 h-6 bg-gray-100 rounded"/><div className="w-6 h-6 bg-gray-100 rounded"/><div className="w-6 h-6 bg-gray-100 rounded"/></div></td>
                      </tr>
                    ))
                  : filtered.length === 0
                    ? (
                      <tr><td colSpan="8" className="py-16 text-center text-gray-400 font-medium">No vehicles match your filters.</td></tr>
                    )
                    : filtered.map((car) => (
                        <tr key={car.id} className={`hover:bg-gray-50/60 transition-colors ${selected.includes(car.id) ? "bg-blue-50/40" : ""}`}>
                          <td className="px-5 py-4">
                            <input type="checkbox" className="rounded border-gray-300"
                              checked={selected.includes(car.id)}
                              onChange={() => toggleRow(car.id)}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-20 h-12 rounded overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                                <img src={car.image} alt={car.name} className="w-full h-full object-cover"/>
                              </div>
                              <div>
                                <p className="font-black text-gray-900 text-sm leading-tight">{car.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold mt-0.5 tracking-wider">VIN: {car.vin}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 font-medium text-gray-700">{car.brand}</td>
                          <td className="px-4 py-4">
                            <span className="px-2.5 py-1 text-[10px] font-black rounded uppercase tracking-wider"
                              style={{ backgroundColor: car.catColor, color: car.catText }}>
                              {car.category}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-mono text-gray-600">{car.year}</td>
                          <td className="px-4 py-4 font-black text-gray-900">{fmt(car.price)}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: car.statusDot }}/>
                              <span className="text-[11px] font-black text-gray-700 uppercase">{car.status}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <button className="text-gray-400 hover:text-blue-600 transition-colors text-base" title="View">👁️</button>
                              <button className="text-gray-400 hover:text-amber-600 transition-colors text-base" title="Edit">✏️</button>
                              <button className="text-gray-400 hover:text-red-600 transition-colors text-base" title="Delete">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))
                }
              </tbody>
            </table>

            {/* Pagination */}
            {!loading && (
              <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-bold text-gray-600">Rows per page:</span>
                  <span className="font-black text-gray-900">{ROWS}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Showing 1-{Math.min(ROWS, filtered.length)} of <strong className="text-gray-900">1,428</strong> units</span>
                  <div className="flex items-center gap-1 ml-4">
                    <button onClick={() => setPage(p => Math.max(1, p-1))}
                      className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-500">‹</button>
                    {[1,2,3].map(n => (
                      <button key={n} onClick={() => setPage(n)}
                        className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-colors ${page===n ? "bg-blue-600 text-white border border-blue-600" : "border border-gray-200 hover:bg-gray-50 text-gray-700"}`}>
                        {n}
                      </button>
                    ))}
                    <span className="px-1 text-gray-400">...</span>
                    <button onClick={() => setPage(143)}
                      className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold border border-gray-200 hover:bg-gray-50 text-gray-700 ${page===143 ? "bg-blue-600 text-white border-blue-600" : ""}`}>
                      143
                    </button>
                    <button onClick={() => setPage(p => Math.min(143, p+1))}
                      className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-500">›</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer info */}
          <div className="mt-6 flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <div>
              <p className="text-gray-500 font-black mb-1">Technical Guidance</p>
              <p className="font-medium text-gray-400 text-[9px] normal-case tracking-normal max-w-md">
                Inventory status is synced every 15 minutes with the central DMS. New entries require mandatory VIN verification before broadcast to public channels.
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 font-black mb-1">Shortcuts</p>
              <p className="font-medium text-gray-400 text-[9px] normal-case tracking-normal">CMD + N : NEW CAR</p>
              <p className="font-medium text-gray-400 text-[9px] normal-case tracking-normal">CMD + F : SEARCH</p>
              <p className="font-medium text-gray-400 text-[9px] normal-case tracking-normal">ESC : CLEAR FILTER</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
