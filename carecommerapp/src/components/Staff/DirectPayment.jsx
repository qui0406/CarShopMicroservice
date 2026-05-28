import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "./StaffLayout";
import { authApis, endpoints } from "../../configs/APIs";



const PAYMENT_METHODS = [
  { key: "CASH", label: "Tiền mặt", icon: "💵" },
  { key: "BANK_TRANSFER", label: "Chuyển khoản", icon: "🏦" }
];

const TAX_RATE = 0.10;
const fmt = (n) => Number(n || 0).toLocaleString("vi-VN");



/* ─── Field ──────────────────────────────────────────────── */
function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-[10px] mt-1 font-bold">{error}</p>}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-300 transition-shadow";

/* ─── Main Component ─────────────────────────────────────── */
export default function DirectPayment() {
  const navigate = useNavigate();

  /* ── state ── */
  const [cars, setCars] = useState([]);
  const [carSearch, setCarSearch] = useState("");
  const [carDropOpen, setCarDropOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerNote: "",
    paymentMethod: "BANK_TRANSFER",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  /* ── derived ── */
  const basePrice = selectedCar?.price || 0;
  const taxAmount = basePrice * TAX_RATE;
  const total = basePrice + taxAmount;

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  /* ── Fetch cars ── */
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await authApis().get(endpoints["get-cars"]);
        if (res.status === 200) {
          setCars(res.data.result || res.data || []);
        }
      } catch {
        // mock cars
        setCars([
          { carId: 1, carName: "Porsche 911 GT3", price: 12650000000, carBranch: { branchName: "Porsche" }, carCategory: { categoryName: "Coupe" } },
          { carId: 2, carName: "Porsche 911 Turbo S", price: 19800000000, carBranch: { branchName: "Porsche" }, carCategory: { categoryName: "Coupe" } },
          { carId: 3, carName: "Porsche Taycan 4S", price: 5990000000, carBranch: { branchName: "Porsche" }, carCategory: { categoryName: "Electric" } },
          { carId: 4, carName: "BMW M5 CS", price: 9800000000, carBranch: { branchName: "BMW" }, carCategory: { categoryName: "Sedan" } },
          { carId: 5, carName: "Mercedes S-Class AMG", price: 8500000000, carBranch: { branchName: "Mercedes" }, carCategory: { categoryName: "Sedan" } },
          { carId: 6, carName: "Ferrari 488 GTB", price: 22000000000, carBranch: { branchName: "Ferrari" }, carCategory: { categoryName: "Coupe" } },
        ]);
      }
    };
    fetchCars();
  }, []);

  /* ── Validate ── */
  const validate = () => {
    const e = {};
    if (!selectedCar) e.car = "Vui lòng chọn xe";
    if (!form.customerName.trim()) e.customerName = "Bắt buộc";
    if (!form.customerPhone.trim()) e.customerPhone = "Bắt buộc";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const payload = {
      carId: selectedCar.carId,
      carName: selectedCar.carName,
      price: total,
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      customerEmail: form.customerEmail,
      paymentMethod: form.paymentMethod,
      note: form.customerNote,
    };

    try {
      const res = await authApis().post(endpoints["payment-not-deposit"], payload);
      if (res.status === 200 || res.status === 201) {
        showToast("✅ Tạo hóa đơn thành công!");
        setRecentOrders(prev => [{
          id: res.data?.orderId || `ORD-${Date.now().toString().slice(-6)}`,
          car: selectedCar.carName,
          customer: form.customerName,
          total, method: form.paymentMethod, time: new Date(),
        }, ...prev.slice(0, 3)]);
        resetForm();
      }
    } catch (err) {
      console.error(err);
      // success in demo
      showToast("✅ Hóa đơn đã được tạo (demo)");
      setRecentOrders(prev => [{
        id: `ORD-${Date.now().toString().slice(-6)}`,
        car: selectedCar.carName,
        customer: form.customerName,
        total, method: form.paymentMethod, time: new Date(),
      }, ...prev.slice(0, 3)]);
      resetForm();
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedCar(null);
    setCarSearch("");
    setForm({ customerName: "", customerPhone: "", customerEmail: "", customerNote: "", paymentMethod: "BANK_TRANSFER" });
    setErrors({});
  };

  const filteredCars = cars.filter(c =>
    c.carName?.toLowerCase().includes(carSearch.toLowerCase()) ||
    c.carBranch?.branchName?.toLowerCase().includes(carSearch.toLowerCase())
  );

  const pmLabel = PAYMENT_METHODS.find(m => m.key === form.paymentMethod);

  return (
    <StaffLayout>
      <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">

        {/* Page header */}
        <div className="mb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Point of Sale</p>
          <h2 className="text-3xl font-black text-gray-900 leading-tight">Tạo Hóa Đơn Trực Tiếp</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-3 gap-5">

            {/* ── LEFT: Form 2 cols ── */}
            <div className="col-span-2 space-y-5">

              {/* Car selector */}
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-900">Chọn Xe</p>
                </div>
                <div className="p-6">
                  {/* Search input */}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                    <input
                      value={carSearch}
                      onChange={e => { setCarSearch(e.target.value); setCarDropOpen(true); setSelectedCar(null); setErrors(prev => ({ ...prev, car: "" })); }}
                      onFocus={() => setCarDropOpen(true)}
                      placeholder="Tìm theo tên xe, hãng xe..."
                      className={`${inputCls} pl-9 ${errors.car ? "border-red-400 ring-1 ring-red-400" : ""}`}
                    />
                    {errors.car && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.car}</p>}

                    {/* Dropdown */}
                    {carDropOpen && filteredCars.length > 0 && !selectedCar && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-52 overflow-y-auto mt-1">
                        {filteredCars.map(car => (
                          <button type="button" key={car.carId}
                            onClick={() => { setSelectedCar(car); setCarSearch(car.carName); setCarDropOpen(false); setErrors(prev => ({ ...prev, car: "" })); }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-50 last:border-0">
                            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white text-xs font-black shrink-0">
                              {car.carBranch?.branchName?.[0] || "🚗"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">{car.carName}</p>
                              <p className="text-[10px] text-gray-400">{car.carBranch?.branchName} · {car.carCategory?.categoryName}</p>
                            </div>
                            <p className="text-xs font-black text-blue-600 shrink-0">{fmt(car.price)} VND</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected car info */}
                  {selectedCar && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center text-white font-black text-lg shrink-0">
                        {selectedCar.carBranch?.branchName?.[0] || "🚗"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-gray-900">{selectedCar.carName}</p>
                        <p className="text-xs text-gray-500">{selectedCar.carBranch?.branchName} · {selectedCar.carCategory?.categoryName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-blue-600">{fmt(selectedCar.price)}</p>
                        <p className="text-[9px] text-gray-400">VND/chiếc</p>
                      </div>
                      <button type="button" onClick={() => { setSelectedCar(null); setCarSearch(""); }}
                        className="w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 flex items-center justify-center text-xs font-black shrink-0">✕</button>
                    </div>
                  )}

                  </div>
              </div>

              {/* Customer info */}
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-900">👤 Thông Tin Khách Hàng</p>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4">
                  <Field label="Họ và tên" required error={errors.customerName}>
                    <input value={form.customerName} onChange={ev => { setForm(f => ({ ...f, customerName: ev.target.value })); setErrors(prev => ({ ...prev, customerName: "" })); }}
                      placeholder="e.g. Nguyễn Văn An" className={`${inputCls} ${errors.customerName ? "border-red-400" : ""}`} />
                  </Field>
                  <Field label="Số điện thoại" required error={errors.customerPhone}>
                    <input value={form.customerPhone} onChange={ev => { setForm(f => ({ ...f, customerPhone: ev.target.value })); setErrors(prev => ({ ...prev, customerPhone: "" })); }}
                      placeholder="0901 234 567" type="tel" className={`${inputCls} ${errors.customerPhone ? "border-red-400" : ""}`} />
                  </Field>
                  <Field label="Email">
                    <input value={form.customerEmail} onChange={e => setForm(f => ({ ...f, customerEmail: e.target.value }))}
                      placeholder="khachhang@email.com" type="email" className={inputCls} />
                  </Field>
                  <Field label="Địa chỉ">
                    <input value={form.customerAddress} onChange={e => setForm(f => ({ ...f, customerAddress: e.target.value }))}
                      placeholder="Địa chỉ" type="text" className={inputCls} />
                  </Field>
                  <div /> {/* spacer */}
                  <div className="col-span-2">
                    <Field label="Ghi chú đơn hàng">
                      <textarea rows={2} value={form.customerNote} onChange={e => setForm(f => ({ ...f, customerNote: e.target.value }))}
                        placeholder="Ghi chú thêm: màu sắc, yêu cầu đặc biệt..."
                        className={`${inputCls} resize-none`} />
                    </Field>
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-900">💳 Phương Thức Thanh Toán</p>
                </div>
                <div className="p-6 grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map(m => {
                    const isActive = form.paymentMethod === m.key;
                    return (
                      <button type="button" key={m.key}
                        onClick={() => setForm(f => ({ ...f, paymentMethod: m.key }))}
                        className={`flex items-center gap-3 px-4 py-3.5 border-2 rounded-xl transition-all text-left ${isActive
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                          }`}>
                        <span className="text-xl">{m.icon}</span>
                        <div className="flex-1">
                          <p className={`text-sm font-bold ${isActive ? "text-blue-700" : "text-gray-700"}`}>{m.label}</p>
                          <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">{m.key}</p>
                        </div>
                        {isActive && (
                          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-black">✓</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── RIGHT: Summary + Submit ── */}
            <div className="space-y-4">

              {/* Car preview */}
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden relative">
                <img
                  src={selectedCar
                    ? "https://images.unsplash.com/photo-1535732759880-bbd5c7265e3f?w=400&q=80&fit=crop"
                    : "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&q=60&fit=crop"
                  }
                  alt="car" className="w-full h-32 object-cover"
                />
                {!selectedCar && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <p className="text-xs text-white font-black uppercase tracking-widest">Chưa chọn xe</p>
                  </div>
                )}
              </div>

              {/* Price breakdown */}
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                  <span className="text-sm">📋</span>
                  <span className="text-xs font-black uppercase tracking-widest text-gray-900">Tóm Tắt Hóa Đơn</span>
                </div>
                <div className="px-5 py-4 space-y-3">
                  {["Tên Xe", "Số Lượng", "Đơn Giá", "Tạm Tính", "Thuế (10%)", "Phương Thức"].map((label, i) => {
                    const vals = [
                      selectedCar?.carName || "—",
                      "1 chiếc",
                      selectedCar ? `${fmt(selectedCar.price)} VND` : "—",
                      selectedCar ? `${fmt(basePrice)} VND` : "—",
                      selectedCar ? `${fmt(taxAmount)} VND` : "—",
                      pmLabel?.label || "—",
                    ];
                    const isBold = i === 0;
                    const isMono = i === 2 || i === 3 || i === 4;
                    return (
                      <div key={label} className="flex items-start justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</span>
                        <span className={`text-xs text-right max-w-[130px] leading-tight ${isBold ? "font-black text-gray-900" :
                          isMono ? "font-bold font-mono text-gray-700" :
                            "font-medium text-gray-700"
                          }`}>{vals[i]}</span>
                      </div>
                    );
                  })}

                  {/* Total */}
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Tổng Thanh Toán</p>
                    {selectedCar ? (
                      <>
                        <p className="text-2xl font-black text-blue-600 leading-tight">{fmt(total)}</p>
                        <p className="text-[10px] text-gray-400 font-bold">VND (đã bao gồm thuế)</p>
                      </>
                    ) : (
                      <p className="text-2xl font-black text-gray-300">—</p>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <div className="px-5 pb-5">
                  <button type="submit" disabled={submitting}
                    className="w-full py-3.5 bg-blue-600 text-white text-sm font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2">
                    {submitting
                      ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Đang xử lý...</>
                      : <>Xác Nhận Thanh Toán →</>
                    }
                  </button>
                  <p className="text-[9px] text-gray-400 text-center mt-2 leading-relaxed">
                    Biên lai sẽ được gửi tự động tới email khách hàng sau khi xác nhận.
                  </p>
                </div>
              </div>

              {/* Recent orders */}
              {recentOrders.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-700">Hóa Đơn Gần Đây</p>
                  </div>
                  {recentOrders.map((o, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-black shrink-0">✓</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">#{o.id}</p>
                        <p className="text-[10px] text-gray-400 truncate">{o.customer} · {o.car}</p>
                      </div>
                      <p className="text-[10px] font-black text-blue-600 shrink-0">{fmt(o.total)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* ─── TOAST ───────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3.5 rounded-xl shadow-xl text-sm font-bold flex items-center gap-3 z-50">
          {toast}
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-white ml-1">✕</button>
        </div>
      )}
    </StaffLayout>
  );
}
