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
export default function CarListManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState([]);
  const [brandFilter, setBrandFilter] = useState("Tất cả hãng xe");
  const [catFilter, setCatFilter] = useState("Tất cả danh mục");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [allBrands, setAllBrands] = useState(["Tất cả hãng xe"]);
  const [allCats, setAllCats] = useState(["Tất cả danh mục"]);
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
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
  const [selectedCarForView, setSelectedCarForView] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [modalTab, setModalTab] = useState("general");

  // Car Autocomplete State
  const [carOptions, setCarOptions] = useState([]);
  const [carSearchTerm, setCarSearchTerm] = useState("");
  const [showCarDropdown, setShowCarDropdown] = useState(false);

  /* Fetch Helper Data */
  useEffect(() => {
    const fetchHelpers = async () => {
      try {
        const [resB, resC] = await Promise.all([
          authApis().get(endpoints["get-all-branch"]),
          authApis().get(endpoints["get-all-category"])
        ]);
        const bList = resB.data?.result?.data || resB.data?.result || [];
        const cList = resC.data?.result?.data || resC.data?.result || [];
        console.log(bList, cList)
        setBranches(bList);
        setCategories(cList);
        setAllBrands(["Tất cả hãng xe", ...bList.map(b => b.name)]);
        setAllCats(["Tất cả danh mục", ...cList.map(c => c.name)]);

      } catch (err) {
        console.error("Helper fetch error:", err);
      }
    };
    fetchHelpers();
  }, []);

  /* Fetch Data */
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const res = await authApis().get(endpoints["get-staff-management-cars"](page, ROWS));
        const resData = res.data?.result;

        console.log("Management Data:", resData);
        let arr = resData?.data || [];

        const mappedCars = arr.map(car => ({
          id: car.id,
          name: car.carName,
          vin: car.vinNumber || "N/A",
          brand: car.carBranch || "CAR SHOP",
          category: car.category || "OTHER",
          catColor: "#f0fdf4",
          catText: "#16a34a",
          year: car.year || 2024,
          price: car.price,
          status: car.sold ? "Đã bán" : (car.deposited ? "Đã đặt cọc" : (car.isReady ? "Sẵn sàng" : "Chưa sẵn sàng")),
          statusDot: car.sold ? "#9ca3af" : (car.deposited ? "#eab308" : (car.isReady ? "#22c55e" : "#ef4444")),
          quantity: car.quantity || 0,
          image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=120&q=80&fit=crop", // Backend should ideally provide thumbnail
        }));

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
        const res = await authApis().get(endpoints["get-all-inventory"](invPage, INV_ROWS));
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
  const handleManageStock = async (car) => {
    try {
      const res = await authApis().get(endpoints["get-inventory-by-car-id"](car.id));
      const inv = res.data?.result;
      if (inv && inv.id) {
        setInvForm({ id: inv.id, carId: car.id, quantity: inv.quantity, showRoomId: "" });
        setCarSearchTerm(car.name);
        setIsEditInv(true);
        setShowInvModal(true);
      } else {
        throw new Error("No inventory found");
      }
    } catch (error) {
      // Create new inventory if none exists
      setInvForm({ id: "", carId: car.id, quantity: 0, showRoomId: "" });
      setCarSearchTerm(car.name);
      setIsEditInv(false);
      setShowInvModal(true);
    }
  };

  const setViewCarDetails = async (car) => {
    try {
      setViewLoading(true);
      const res = await authApis().get(endpoints["get-car-by-id"](car.id));
      const detailedData = res.data?.result;

      if (detailedData) {
        // Map the API response to match our modal needs
        setSelectedCarForView({
          ...car,
          ...detailedData,
          name: detailedData.name,
          images: detailedData.imageUrls || [],
          specs: detailedData.carModel?.technicalSpec || {},
          equipment: detailedData.carModel?.equipment || {},
          description: detailedData.carModel?.description || "Chưa có mô tả chi tiết.",
        });
        setModalTab("general");
      } else {
        setSelectedCarForView(car);
      }
    } catch (err) {
      console.error("View car error:", err);
      setSelectedCarForView(car); // Fallback to list data if API fails
    } finally {
      setViewLoading(false);
    }
  };

  const handleDeleteInv = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bản ghi kho này không?")) return;
    try {
      await authApis().delete(endpoints["delete-inventory"](id));
      setInvRefresh(prev => prev + 1); // trigger refetch
    } catch (err) {
      console.error(err);
      alert("Xóa thất bại!");
    }
  };

  const handleDeleteCar = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chiếc xe này khỏi danh sách? Thao tác này không thể hoàn tác.")) return;
    try {
      await authApis().delete(endpoints["delete-car"](id));
      setCars(prev => prev.filter(c => c.id !== id));
      setTotalUnits(prev => prev - 1);
      alert("Đã xóa xe thành công!");
    } catch (err) {
      console.error(err);
      alert("Xóa xe thất bại! Vui lòng kiểm tra lại quyền hạn hoặc ràng buộc dữ liệu.");
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
      // Trigger car refetch to update stock in main table
      setCars(prev => prev.map(c => c.id === invForm.carId ? { ...c, quantity: parseInt(invForm.quantity) } : c));
    } catch (err) {
      console.error(err);
      alert("Yêu cầu thất bại!");
    } finally {
      setInvSubmitting(false);
    }
  };

  /* Filtering */
  const filtered = cars.filter((c) => {
    const matchBrand = brandFilter === "Tất cả hãng xe" || c.brand === brandFilter;
    const matchCat = catFilter === "Tất cả danh mục" || c.category === catFilter;
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.vin.toLowerCase().includes(search.toLowerCase());
    return matchBrand && matchCat && matchSearch;
  });

  const toggleRow = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map((c) => c.id));

  const clearFilters = () => { setBrandFilter("Tất cả hãng xe"); setCatFilter("Tất cả danh mục"); setSearch(""); };

  return (
    <StaffLayout searchPlaceholder="Tìm kiếm theo tên hoặc VIN..." searchVal={search} onSearchChange={(e) => setSearch(e.target.value)}>
      <div className="px-8 py-6">

        {/* Breadcrumb */}
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">
          Cổng thông tin <span className="text-blue-500 mx-1">/</span> Quản lý danh sách xe
        </p>

        {/* Page header */}
        <div className="flex items-start justify-between mb-5">
          <h1 className="text-[34px] font-black tracking-tight text-gray-900 uppercase leading-none">Quản lý danh sách xe</h1>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
              Xuất dữ liệu
            </button>
            <button onClick={() => navigate("/staff/create-car")} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 shadow-sm transition-colors">
              + THÊM XE MỚI
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
                  { label: "TỔNG SỐ XE", value: totalUnits.toLocaleString(), color: "text-gray-900" },
                  { label: "ĐÃ BÁN TRONG THÁNG", value: "0", color: "text-gray-900" },
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
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Thao tác nhanh</p>
            <div>
              <p className="text-lg font-black leading-tight mt-2">Tạo báo cáo tuân thủ kỹ thuật</p>
            </div>
          </div>
        </div>

        {/* Filter + Table card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Filter bar */}
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3 flex-wrap">
            {/* Brand filter */}
            <div className="flex items-center gap-2 border border-gray-200 rounded px-3 py-1.5 bg-white">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Hãng xe:</span>
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
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Danh mục:</span>
              <select
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                className="text-xs font-bold text-gray-700 bg-transparent focus:outline-none cursor-pointer"
              >
                {allCats.map(c => <option key={c}>{c}</option>)}
              </select>
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
                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Hình ảnh</th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Mã số</th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên xe</th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Năm</th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Giá niêm yết</th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Tồn kho</th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Hành động</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading
                ? Array(4).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="w-4 h-4 bg-gray-100 rounded" /></td>
                    <td className="px-4 py-4"><div className="w-12 h-12 bg-gray-100 rounded-lg" /></td>
                    <td className="px-4 py-4"><div className="h-3 bg-gray-100 rounded w-16" /></td>
                    <td className="px-4 py-4"><div className="h-3 bg-gray-100 rounded w-32" /></td>
                    <td className="px-4 py-4"><div className="h-3 bg-gray-100 rounded w-10" /></td>
                    <td className="px-4 py-4"><div className="h-3 bg-gray-100 rounded w-24" /></td>
                    <td className="px-4 py-4"><div className="h-3 bg-gray-100 rounded w-10" /></td>
                    <td className="px-4 py-4"><div className="h-3 bg-gray-100 rounded w-20" /></td>
                    <td className="px-4 py-4"><div className="flex gap-2 justify-center"><div className="w-6 h-6 bg-gray-100 rounded" /><div className="w-6 h-6 bg-gray-100 rounded" /></div></td>
                  </tr>
                ))
                : filtered.length === 0
                  ? (
                    <tr><td colSpan="9" className="py-16 text-center text-gray-400 font-medium">Không có xe nào khớp với bộ lọc của bạn.</td></tr>
                  )
                  : filtered.map((car, idx) => (
                    <tr key={`${car.id}-${idx}`} className={`hover:bg-gray-50/60 transition-colors ${selected.includes(car.id) ? "bg-blue-50/40" : ""}`}>
                      <td className="px-5 py-4">
                        <input type="checkbox" className="rounded border-gray-300"
                          checked={selected.includes(car.id)}
                          onChange={() => toggleRow(car.id)}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                          {car.image ? (
                            <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 font-mono text-gray-500 font-bold text-xs">#{car.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-4 py-3">
                        <p className="font-black text-gray-900 text-sm leading-tight">{car.name}</p>
                      </td>
                      <td className="px-4 py-4 font-mono text-gray-600">{car.year}</td>
                      <td className="px-4 py-4 font-black text-gray-900">{fmt(car.price)}</td>
                      <td className="px-4 py-4 font-black text-blue-600 text-base">{car.quantity}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: car.statusDot }} />
                          <span className="text-[11px] font-black text-gray-700 uppercase">
                            {car.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setViewCarDetails(car)}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Xem thêm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                          <button onClick={() => navigate(`/staff/edit-car/${car.id}`)}
                            className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm" title="Sửa">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => handleManageStock(car)}
                            className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition-all shadow-sm" title="Quản lý kho">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                          </button>
                          <button onClick={() => handleDeleteCar(car.id)}
                            className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm" title="Xóa">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>

          {/* Pagination */}
          {!loading && totalUnits > ROWS && (
            <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="font-bold text-gray-600">Số dòng mỗi trang:</span>
                <span className="font-black text-gray-900">{ROWS}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Đang hiển thị {((page - 1) * ROWS) + 1}-{Math.min(page * ROWS, totalUnits)} trong số <strong className="text-gray-900">{totalUnits}</strong> xe</span>
                <div className="flex items-center gap-1 ml-4">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed">‹</button>
                  {Array.from(new Set([
                    1,
                    Math.max(1, page - 1),
                    page,
                    Math.min(Math.ceil(totalUnits / ROWS), page + 1),
                    Math.ceil(totalUnits / ROWS)
                  ])).sort((a, b) => a - b).map((n, idx, arr) => (
                    <React.Fragment key={n}>
                      {idx > 0 && n !== arr[idx - 1] + 1 && <span className="px-1 text-gray-400">...</span>}
                      <button onClick={() => setPage(n)}
                        className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-colors ${page === n ? "bg-blue-600 text-white border border-blue-600" : "border border-gray-200 hover:bg-gray-50 text-gray-700"}`}>
                        {n}
                      </button>
                    </React.Fragment>
                  ))}
                  <button onClick={() => setPage(p => Math.min(Math.ceil(totalUnits / ROWS), p + 1))} disabled={page >= Math.ceil(totalUnits / ROWS)}
                    className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed">›</button>
                </div>
              </div>
            </div>
          )}
        </div>



        {/* Footer info */}
        <div className="mt-6 flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <div>
            <p className="text-gray-500 font-black mb-1">Hướng dẫn kỹ thuật</p>
            <p className="font-medium text-gray-400 text-[9px] normal-case tracking-normal max-w-md">
              Trạng thái kho được đồng bộ mỗi 15 phút với DMS trung tâm. Các mục mới yêu cầu xác minh VIN bắt buộc trước khi phát sóng lên các kênh công cộng.
            </p>
          </div>
        </div>

        {/* ─── INVENTORY CRUD MODAL ────────────────────────────────────── */}
        {showInvModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-black text-lg text-gray-900">{isEditInv ? "Chỉnh sửa kho hàng" : "Thêm vào kho"}</h3>
                <button onClick={() => setShowInvModal(false)} className="text-gray-400 hover:text-gray-900 text-xl font-black">✕</button>
              </div>

              <form onSubmit={handleSubmitInv} className="p-6 flex flex-col gap-5">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Chọn xe</label>
                  <div className="relative">
                    <input required disabled={isEditInv} type="text"
                      value={carSearchTerm}
                      onChange={e => {
                        setCarSearchTerm(e.target.value);
                        setInvForm(prev => ({ ...prev, carId: "" })); // reset id when typing
                        setShowCarDropdown(true);
                      }}
                      onFocus={() => setShowCarDropdown(true)}
                      placeholder="Nhập tên xe để tìm kiếm..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    {!isEditInv && showCarDropdown && carOptions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {carOptions
                          .filter(c => c.name.toLowerCase().includes(carSearchTerm.toLowerCase()))
                          .map(c => (
                            <div key={c.id}
                              onClick={() => {
                                setInvForm(prev => ({ ...prev, carId: c.id }));
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
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">Không thể thay đổi xe trong khi chỉnh sửa.</p>
                  ) : (
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">
                      {invForm.carId ? <span className="text-emerald-600 font-bold">✓ Đã chọn: {invForm.carId}</span> : "Vui lòng chọn một chiếc xe từ danh sách."}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Số lượng</label>
                  <input required type="number" min="0"
                    value={invForm.quantity} onChange={e => setInvForm(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="E.g. 10"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Optional ShowRoom ID */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">ID Phòng trưng bày (Tùy chọn)</label>
                  <input type="text"
                    value={invForm.showRoomId} onChange={e => setInvForm(prev => ({ ...prev, showRoomId: e.target.value }))}
                    placeholder="Để trống cho các giới hạn mặc định..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setShowInvModal(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-xs font-black tracking-widest uppercase hover:bg-gray-200 transition-colors">
                    Hủy
                  </button>
                  <button type="submit" disabled={invSubmitting}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-black tracking-widest uppercase hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center">
                    {invSubmitting ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Car Detail Modal */}
        {selectedCarForView && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <h3 className="text-white font-black text-sm uppercase tracking-widest">Chi tiết xe</h3>
                  <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] text-white font-mono">#{selectedCarForView.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <button onClick={() => setSelectedCarForView(null)} className="text-white/80 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="p-0 max-h-[85vh] overflow-y-auto custom-scrollbar bg-gray-50/30">
                {/* Image Hero Section */}
                <div className="relative h-72 bg-gray-200">
                  {selectedCarForView.images && selectedCarForView.images.length > 0 ? (
                    <img src={selectedCarForView.images[0]} alt={selectedCarForView.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-8 right-8">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded">{selectedCarForView.isUsed ? "Xe cũ" : "Xe mới"}</span>
                      {selectedCarForView.carModel?.category && (
                        <span className="px-2 py-0.5 bg-white/20 text-white text-[9px] font-black uppercase tracking-widest rounded backdrop-blur-md">{selectedCarForView.carModel.category.name}</span>
                      )}
                    </div>
                    <h4 className="text-3xl font-black text-white">{selectedCarForView.name}</h4>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex bg-white border-b border-gray-100 sticky top-0 z-10 px-8">
                  {["general", "specs", "equipment"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setModalTab(t)}
                      className={`py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${modalTab === t ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                      {t === "general" ? "Tổng quan" : t === "specs" ? "Thông số" : "Trang bị"}
                      {modalTab === t && <div className="absolute bottom-0 left-6 right-6 h-1 bg-blue-600 rounded-t-full" />}
                    </button>
                  ))}
                </div>

                <div className="p-8">
                  {/* TAB: GENERAL */}
                  {modalTab === "general" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Giá bán đề xuất</p>
                          <p className="text-xl font-black text-emerald-600">{fmt(selectedCarForView.price)}</p>
                        </div>
                        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Tồn kho hiện tại</p>
                          <p className="text-xl font-black text-blue-600">{selectedCarForView.quantity} <span className="text-xs text-gray-400 font-bold">chiếc</span></p>
                        </div>
                        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Tình trạng</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: selectedCarForView.statusDot }} />
                            <span className="text-xs font-black text-gray-700 uppercase">
                              {selectedCarForView.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div>
                          <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            Mô tả từ hãng
                          </h5>
                          <p className="text-sm text-gray-500 leading-relaxed bg-white p-6 rounded-3xl border border-gray-100 italic">
                            "{selectedCarForView.description}"
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4">Thông tin cơ bản</h5>
                            <div className="space-y-3">
                              {[
                                { label: "Năm sản xuất", value: selectedCarForView.year || selectedCarForView.manufacturingYear },
                                { label: "Màu ngoại thất", value: selectedCarForView.color },
                                { label: "Số ghế ngồi", value: selectedCarForView.carModel?.seatCapacity + " chỗ" },
                                { label: "Số khung (VIN)", value: selectedCarForView.vinNumber },
                              ].map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50">
                                  <span className="text-[11px] text-gray-400 font-medium">{item.label}</span>
                                  <span className="text-[11px] text-gray-900 font-black">{item.value || "N/A"}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4">Pháp lý & Lịch sử</h5>
                            <div className="space-y-3">
                              {[
                                { label: "Odometer", value: selectedCarForView.mileage + " km" },
                                { label: "Tình trạng", value: selectedCarForView.isUsed ? "Xe đã qua sử dụng" : "Xe mới 100%" },
                                { label: "Báo cáo kiểm định", value: selectedCarForView.inspectionReportUrl ? "Đã có" : "Chưa cập nhật", color: selectedCarForView.inspectionReportUrl ? "text-emerald-600" : "" },
                              ].map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50">
                                  <span className="text-[11px] text-gray-400 font-medium">{item.label}</span>
                                  <span className={`text-[11px] font-black ${item.color || "text-gray-900"}`}>{item.value || "N/A"}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB: SPECS */}
                  {modalTab === "specs" && (
                    <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                      <div className="grid grid-cols-2 gap-x-16 gap-y-8">
                        <div>
                          <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 border-l-4 border-blue-600 pl-3">Động cơ & Vận hành</h5>
                          <div className="space-y-4">
                            {[
                              { label: "Động cơ", value: selectedCarForView.specs.engine },
                              { label: "Dung tích", value: selectedCarForView.specs.engineSize },
                              { label: "Hộp số", value: selectedCarForView.specs.transmission },
                              { label: "Hệ dẫn động", value: selectedCarForView.specs.bodyType },
                              { label: "Công suất cực đại", value: selectedCarForView.specs.horsepower + " Hp" },
                              { label: "Mô-men xoắn", value: selectedCarForView.specs.torque + " Nm" },
                            ].map((s, i) => (
                              <div key={i} className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-xs text-gray-500">{s.label}</span>
                                <span className="text-xs text-gray-900 font-black">{s.value || "N/A"}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 border-l-4 border-emerald-600 pl-3">Kích thước & Trọng lượng</h5>
                          <div className="space-y-4">
                            {[
                              { label: "Dài x Rộng x Cao", value: `${selectedCarForView.specs.length} x ${selectedCarForView.specs.width} x ${selectedCarForView.specs.height} mm` },
                              { label: "Khoảng sáng gầm", value: selectedCarForView.specs.groundClearance + " mm" },
                              { label: "Dung tích bình xăng", value: selectedCarForView.specs.fuelCapacity + " Lít" },
                              { label: "Tốc độ tối đa", value: selectedCarForView.specs.topSpeed + " km/h" },
                            ].map((s, i) => (
                              <div key={i} className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-xs text-gray-500">{s.label}</span>
                                <span className="text-xs text-gray-900 font-black">{s.value || "N/A"}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB: EQUIPMENT */}
                  {modalTab === "equipment" && (
                    <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div className="bg-white p-6 rounded-3xl border border-gray-100">
                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Nội thất & Tiện nghi</h5>
                            <div className="grid grid-cols-1 gap-3">
                              {[
                                { label: "Điều hòa tự động", active: selectedCarForView.equipment.hasAirConditioning },
                                { label: "Màn hình giải trí", val: selectedCarForView.equipment.screenType },
                                { label: "Chất liệu ghế", val: selectedCarForView.equipment.seatMaterial },
                                { label: "Hệ thống loa", val: selectedCarForView.equipment.speakerSystem },
                                { label: "Cửa sổ trời", val: selectedCarForView.equipment.sunRoof },
                                { label: "Sạc không dây", active: selectedCarForView.equipment.wirelessCharge },
                                { label: "Cốp điện", active: selectedCarForView.equipment.electricTrunk },
                              ].map((e, i) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                  <span className="text-gray-500">{e.label}</span>
                                  {e.val ? (
                                    <span className="font-black text-gray-900">{e.val}</span>
                                  ) : (
                                    <span className={e.active ? "text-emerald-600 font-black" : "text-gray-300"}>{e.active ? "✓ Có" : "✕ Không"}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-6">
                          <div className="bg-white p-6 rounded-3xl border border-gray-100">
                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">An toàn & Công nghệ</h5>
                            <div className="grid grid-cols-1 gap-3">
                              {[
                                { label: "Túi khí an toàn", active: selectedCarForView.equipment.hasAirbags },
                                { label: "Hỗ trợ giữ làn", active: selectedCarForView.equipment.laneKeepAssist },
                                { label: "Camera 360/Lùi", active: selectedCarForView.equipment.hasCamera },
                                { label: "Chìa khóa thông minh", active: selectedCarForView.equipment.smartKey },
                                { label: "Đèn pha", val: selectedCarForView.equipment.headlampType },
                                { label: "Bluetooth", active: selectedCarForView.equipment.hasBluetooth },
                              ].map((e, i) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                  <span className="text-gray-500">{e.label}</span>
                                  {e.val ? (
                                    <span className="font-black text-gray-900">{e.val}</span>
                                  ) : (
                                    <span className={e.active ? "text-emerald-600 font-black" : "text-gray-300"}>{e.active ? "✓ Có" : "✕ Không"}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-12 flex gap-4">
                    <button onClick={() => setSelectedCarForView(null)}
                      className="flex-1 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase hover:bg-black transition-all shadow-xl active:scale-[0.98]">
                      Đóng cửa sổ
                    </button>
                    {selectedCarForView.model3dUrl && (
                      <button onClick={() => window.open(selectedCarForView.model3dUrl, "_blank")}
                        className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-[0.98]">
                        Xem 3D Model
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay for Detail View */}
        {viewLoading && (
          <div className="fixed inset-0 bg-white/20 backdrop-blur-[2px] z-[10000] flex items-center justify-center">
            <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đang lấy dữ liệu...</p>
            </div>
          </div>
        )}

      </div>
    </StaffLayout>
  );
}
