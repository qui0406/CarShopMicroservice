import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { endpoints, authApis } from "../../configs/APIs";
import StaffLayout from "./StaffLayout";

function fmt(n) {
  if (n == null) return "0.00";
  return n.toLocaleString("vi-VN") + " VND";
}

/* ─── Main Component ────────────────────────────────────── */
export default function Inventory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState([]);
  const [brandFilter, setBrandFilter] = useState("All Brands");
  const [catFilter, setCatFilter] = useState("All Categories");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [allBrands, setAllBrands] = useState(["All Brands"]);
  const [allCats, setAllCats] = useState(["All Categories"]);
  const [totalUnits, setTotalUnits] = useState(0);
  const ROWS = 10;

  const [invLoading, setInvLoading] = useState(true);
  const [inventories, setInventories] = useState([]);
  const [invPage, setInvPage] = useState(1);
  const [invTotal, setInvTotal] = useState(0);
  const [invRefresh, setInvRefresh] = useState(0);
  const INV_ROWS = 12;

  // Modals for CRUD
  const [showInvModal, setShowInvModal] = useState(false);
  const [isEditInv, setIsEditInv] = useState(false);
  const [invForm, setInvForm] = useState({ id: "", carId: "", quantity: 0, showRoomId: "" });
  const [invSubmitting, setInvSubmitting] = useState(false);

  // Car Autocomplete State
  const [carOptions, setCarOptions] = useState([]);
  const [carSearchTerm, setCarSearchTerm] = useState("");
  const [showCarDropdown, setShowCarDropdown] = useState(false);

  /* Fetch Data */
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const res = await axios.get(endpoints["get-products"](page, 50));
        const resData = res.data?.result;
        let arr = resData?.data || [];

        const mappedCars = arr.map(car => ({
          id: car.id,
          name: car.name,
          vin: car.vinNumber || "N/A",
          brand: car.carModel?.carBranch?.name || "CAR SHOP",
          category: car.carModel?.category?.name || "OTHER",
          catColor: "#f0fdf4",
          catText: "#16a34a",
          year: car.manufacturingYear || 2024,
          price: car.price,
          status: car.isUsed ? "USED" : "NEW",
          statusDot: car.isUsed ? "#9ca3af" : "#22c55e",
          image: (car.imageUrls && car.imageUrls.length > 0) ? car.imageUrls[0] : (car.carModel?.thumbnailImage || "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=120&q=80&fit=crop"),
        }));

        const brandsInit = ["All Brands", ...new Set(mappedCars.map(c => c.brand))];
        const catsInit = ["All Categories", ...new Set(mappedCars.map(c => c.category))];
        setAllBrands(brandsInit);
        setAllCats(catsInit);
        setCars(mappedCars);
        setTotalUnits(resData?.totalElements || mappedCars.length);
      } catch (err) {
        console.error("Fetch cars error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, [page]);

  /* Fetch Inventory API */
  useEffect(() => {
    const fetchInv = async () => {
      try {
        setInvLoading(true);
        const res = await axios.get(endpoints["get-all-inventory"](invPage, INV_ROWS));
        const resData = res.data?.result;
        setInventories(resData?.data || []);
        setInvTotal(resData?.totalElements || resData?.data?.length || 0);
      } catch (err) {
        console.error("Fetch inventory error:", err);
      } finally {
        setInvLoading(false);
      }
    };
    fetchInv();
  }, [invPage, invRefresh]);

  /* CRUD Handlers */
  const handleOpenCreateInv = async () => {
    setInvForm({ id: "", carId: "", quantity: 0, showRoomId: "" });
    setCarSearchTerm("");
    setIsEditInv(false);
    setShowInvModal(true);
    
    // Fetch some generic cars for dropdown initially
    try {
      const res = await axios.get(endpoints["get-products"](1, 500));
      setCarOptions(res.data?.result?.data || []);
    } catch (e) {}
  };

  const handleOpenEditInv = (inv) => {
    setInvForm({ id: inv.id, carId: inv.carId, quantity: inv.quantity, showRoomId: inv.showRoom?.id || "" });
    setCarSearchTerm(inv.carName || inv.carId);
    setIsEditInv(true);
    setShowInvModal(true);
  };

  const handleDeleteInv = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inventory record?")) return;
    try {
      await authApis().delete(endpoints["delete-inventory"](id));
      setInvRefresh(prev => prev + 1);
    } catch (err) {
      console.error(err);
      alert("Delete failed!");
    }
  };

  const handleSubmitInv = async (e) => {
    e.preventDefault();
    setInvSubmitting(true);
    try {
      const payload = {
        carId: invForm.carId,
        quantity: parseInt(invForm.quantity)
      };
      if (invForm.showRoomId) payload.showRoomId = invForm.showRoomId;

      if (isEditInv) {
        await authApis().put(endpoints["update-inventory"](invForm.id), payload);
      } else {
        await authApis().post(endpoints["create-inventory"], payload);
      }
      setShowInvModal(false);
      setInvRefresh(prev => prev + 1);
    } catch (err) {
      console.error(err);
      alert("Request failed!");
    } finally {
      setInvSubmitting(false);
    }
  };

  /* Filtering */
  const filtered = cars.filter((c) => {
    const matchBrand = brandFilter === "All Brands" || c.brand === brandFilter;
    const matchCat = catFilter === "All Categories" || c.category === catFilter;
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
    <StaffLayout searchPlaceholder="Search by name or VIN..." searchVal={search} onSearchChange={(e) => setSearch(e.target.value)}>
      <div className="px-8 py-6">

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
                {[1, 2, 3, 4].map(i => (
                  <div key={i}><div className="h-2 bg-gray-100 rounded w-20 mb-3" /><div className="h-7 bg-gray-100 rounded w-16" /></div>
                ))}
              </div>
            ) : (
              <div className="flex gap-8">
                {[
                  { label: "TOTAL UNITS", value: totalUnits.toLocaleString(), color: "text-gray-900" },
                  { label: "ACTIVE LISTINGS", value: filtered.length, color: "text-blue-600" },
                  { label: "SOLD THIS MONTH", value: "0", color: "text-gray-900" },
                  { label: "INVENTORY VALUE", value: "Automated", color: "text-gray-900", icon: true },
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
                {allBrands.map(b => <option key={b}>{b}</option>)}
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
                {allCats.map(c => <option key={c}>{c}</option>)}
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
                    <td className="px-5 py-4"><div className="w-4 h-4 bg-gray-100 rounded" /></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-12 bg-gray-100 rounded" />
                        <div><div className="h-3 bg-gray-100 rounded w-32 mb-2" /><div className="h-2 bg-gray-100 rounded w-24" /></div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><div className="h-3 bg-gray-100 rounded w-16" /></td>
                    <td className="px-4 py-4"><div className="h-5 bg-gray-100 rounded w-16" /></td>
                    <td className="px-4 py-4"><div className="h-3 bg-gray-100 rounded w-10" /></td>
                    <td className="px-4 py-4"><div className="h-3 bg-gray-100 rounded w-20" /></td>
                    <td className="px-4 py-4"><div className="h-5 bg-gray-100 rounded w-14" /></td>
                    <td className="px-4 py-4"><div className="flex gap-2"><div className="w-6 h-6 bg-gray-100 rounded" /><div className="w-6 h-6 bg-gray-100 rounded" /><div className="w-6 h-6 bg-gray-100 rounded" /></div></td>
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
                            <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
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
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: car.statusDot }} />
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
                <span>Showing 1-{Math.min(ROWS, filtered.length)} of <strong className="text-gray-900">{totalUnits}</strong> units</span>
                <div className="flex items-center gap-1 ml-4">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-500">‹</button>
                  {[Math.max(1, page - 1), page, page + 1].map(n => (
                    <button key={n} onClick={() => setPage(n)}
                      className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-colors ${page === n ? "bg-blue-600 text-white border border-blue-600" : "border border-gray-200 hover:bg-gray-50 text-gray-700"}`}>
                      {n}
                    </button>
                  ))}
                  <span className="px-1 text-gray-400">...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── INVENTORY API LIST ────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-6 relative">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-black text-gray-900 text-lg">Inventory Summary</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Sourced from get-all-inventory API</p>
            </div>
            <button onClick={handleOpenCreateInv} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-black uppercase tracking-wide rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              + ADD INVENTORY
            </button>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                <th className="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Car</th>
                <th className="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Specs</th>
                <th className="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Quantity</th>
                <th className="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                <th className="px-5 py-3 w-20 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-16" /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded" />
                        <div><div className="h-4 bg-gray-100 rounded w-32 mb-1" /><div className="h-3 bg-gray-100 rounded w-12" /></div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><div className="h-3 bg-gray-100 rounded w-24 mb-1" /><div className="h-3 bg-gray-100 rounded w-32" /></td>
                    <td className="px-5 py-4 text-center"><div className="h-4 bg-gray-100 rounded w-8 mx-auto" /></td>
                    <td className="px-5 py-4 text-right"><div className="h-4 bg-gray-100 rounded w-20 ml-auto" /></td>
                    <td className="px-5 py-4"></td>
                  </tr>
                ))
              ) : inventories.length === 0 ? (
                <tr><td colSpan="6" className="py-10 text-center text-gray-400 font-medium">No inventory data found.</td></tr>
              ) : (
                inventories.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4 text-xs font-mono text-gray-500">{inv.id ? inv.id.substring(0, 8) + "..." : "---"}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 rounded overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                          {inv.carThumbnail ? (
                            <img src={inv.carThumbnail} alt={inv.carName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-[9px] uppercase tracking-widest font-bold">No Image</div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{inv.carName || "Unknown Car"}</p>
                          <p className="text-[10px] text-gray-400 font-bold mt-0.5 tracking-wider">SKU: {inv.carSku || "N/A"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <p className="font-medium text-gray-700">Color: <span className="font-bold">{inv.color || "N/A"}</span></p>
                      <p className="font-medium text-gray-700 mt-0.5">Fuel: <span className="font-bold">{inv.fuelType || "N/A"}</span></p>
                      <p className="font-medium text-gray-700 mt-0.5">Trans: <span className="font-bold">{inv.transmission || "N/A"}</span></p>
                    </td>
                    <td className="px-5 py-4 text-center font-black text-gray-900 text-lg">
                      {inv.quantity != null ? inv.quantity : "-"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="font-black text-blue-600 mb-1">{fmt(inv.carPrice)}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-tight">
                        Updated:<br />{inv.lastUpdated ? new Date(inv.lastUpdated).toLocaleDateString("vi-VN") : "N/A"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => handleOpenEditInv(inv)} className="text-gray-400 hover:text-amber-600 text-base" title="Edit">✏️</button>
                        <button onClick={() => handleDeleteInv(inv.id)} className="text-gray-400 hover:text-red-500 text-base" title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Inventory Pagination */}
          {!invLoading && (
            <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Showing page <strong className="text-gray-900">{invPage}</strong> • <strong className="text-gray-900">{invTotal}</strong> total units</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setInvPage(p => Math.max(1, p - 1))} disabled={invPage === 1}
                  className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-white text-gray-500 disabled:opacity-50">‹</button>
                <div className="px-3 text-xs font-bold text-gray-700">{invPage}</div>
                <button onClick={() => setInvPage(p => p + 1)} disabled={inventories.length < INV_ROWS}
                  className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-white text-gray-500 disabled:opacity-50">›</button>
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

        {/* ─── INVENTORY CRUD MODAL ────────────────────────────────────── */}
        {showInvModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-black text-lg text-gray-900">{isEditInv ? "Edit Inventory" : "Add Inventory"}</h3>
                <button onClick={() => setShowInvModal(false)} className="text-gray-400 hover:text-gray-900 text-xl font-black">✕</button>
              </div>

              <form onSubmit={handleSubmitInv} className="p-6 flex flex-col gap-5">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Select Car</label>
                  <div className="relative">
                    <input required disabled={isEditInv} type="text"
                      value={carSearchTerm}
                      onChange={e => {
                        setCarSearchTerm(e.target.value);
                        setInvForm(prev => ({...prev, carId: ""})); // reset id when typing
                        setShowCarDropdown(true);
                      }}
                      onFocus={() => setShowCarDropdown(true)}
                      placeholder="Type car name to search..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    {!isEditInv && showCarDropdown && carOptions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {carOptions
                          .filter(c => c.name.toLowerCase().includes(carSearchTerm.toLowerCase()))
                          .map(c => (
                            <div key={c.id} 
                              onClick={() => {
                                setInvForm(prev => ({...prev, carId: c.id}));
                                setCarSearchTerm(c.name);
                                setShowCarDropdown(false);
                              }}
                              className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-50"
                            >
                              <p className="text-sm font-bold text-gray-900">{c.name}</p>
                              <p className="text-[10px] text-gray-400 font-mono">ID: {c.id}</p>
                            </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {isEditInv ? (
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">Car cannot be changed during editing.</p>
                  ) : (
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">
                      {invForm.carId ? <span className="text-emerald-600 font-bold">✓ Selected: {invForm.carId}</span> : "Please select a car from the list."}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Quantity</label>
                  <input required type="number" min="0"
                    value={invForm.quantity} onChange={e => setInvForm(prev => ({...prev, quantity: e.target.value}))}
                    placeholder="E.g. 10"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Optional ShowRoom ID */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">ShowRoom ID (Optional)</label>
                  <input type="text"
                    value={invForm.showRoomId} onChange={e => setInvForm(prev => ({...prev, showRoomId: e.target.value}))}
                    placeholder="Leave blank for explicit/primary bounds..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setShowInvModal(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-xs font-black tracking-widest uppercase hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={invSubmitting}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-black tracking-widest uppercase hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center">
                    {invSubmitting ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/> : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </StaffLayout>
  );
}
