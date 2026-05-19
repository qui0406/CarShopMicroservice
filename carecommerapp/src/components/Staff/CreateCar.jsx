import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StaffLayout from "./StaffLayout";
import { authApis, endpoints } from "../../configs/APIs";

/* ─── Tùy chọn tĩnh bằng tiếng Việt ───────────────────────── */
const STATUSES = [
  { key: "NEW", label: "Xe mới (New)" },
  { key: "USED", label: "Xe đã qua sử dụng (Used)" },
  { key: "CERTIFIED PRE-OWNED", label: "Xe lướt chính hãng (Certified)" }
];

const FUELS = [
  { key: "Gasoline", label: "Xăng (Gasoline)" },
  { key: "Diesel", label: "Dầu (Diesel)" },
  { key: "Electric", label: "Điện (Electric)" },
  { key: "Hybrid", label: "Động cơ Hybrid" },
  { key: "Plug-in Hybrid", label: "Động cơ Plug-in Hybrid" }
];

const TRANSMISSIONS = [
  { key: "Automatic", label: "Số tự động (Automatic)" },
  { key: "Manual", label: "Số sàn (Manual)" },
  { key: "CVT", label: "Hộp số vô cấp CVT" },
  { key: "DCT", label: "Hộp số ly hợp kép DCT" }
];

const COLORS_LIST = ["#1a1a1a", "#ffffff", "#c0392b", "#2980b9", "#27ae60", "#f39c12", "#8e44ad", "#7f8c8d", "#e8d5b7", "#2c3e50"];

/* ─── Hộp bọc phần giao diện (Section) ───────────────────────── */
function Section({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">{title}</h3>
        {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

/* ─── Hộp bọc ô nhập liệu (Field) ───────────────────────── */
function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-300 transition-shadow";
const selectCls = inputCls + " cursor-pointer";

/* ─── Component Chính ────────────────────────────────────── */
export default function CreateCar() {
  const navigate = useNavigate();
  const imageRef = useRef(null);
  const model3dRef = useRef(null);

  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: "", vin: "", brand: "", category: "", year: "",
    price: "", status: "NEW", mileage: "", fuel: "Gasoline",
    transmission: "Automatic", engine: "", horsepower: "",
    seats: "", doors: "", color: "", description: "",
    features: "",
  });

  const [images, setImages] = useState([]);
  const [rawImages, setRawImages] = useState([]);
  const [model3d, setModel3d] = useState(null);
  const [model3dFile, setModel3dFile] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [allBrands, setAllBrands] = useState([]);
  const [allCats, setAllCats] = useState([]);
  const [allModels, setAllModels] = useState([]);
  const [selectedModelId, setSelectedModelId] = useState("");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchHelpers = async () => {
      try {
        const [resB, resC, resM] = await Promise.all([
          authApis().get(endpoints["get-all-branch"]),
          authApis().get(endpoints["get-all-category"]),
          authApis().get(endpoints["get-all-model"])
        ]);
        setAllBrands(resB.data?.result?.data || resB.data?.result || []);
        setAllCats(resC.data?.result?.data || resC.data?.result || []);
        setAllModels(resM.data?.result?.data || resM.data?.result || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!isEdit) setLoading(false);
      }
    };
    fetchHelpers();
  }, [isEdit]);

  useEffect(() => {
    if (isEdit) {
      const fetchCar = async () => {
        try {
          const res = await authApis().get(endpoints["get-car-by-id"](id));
          const car = res.data?.result;
          if (car) {
            setForm({
              name: car.name || "",
              vin: car.vinNumber || "",
              brand: car.carModel?.carBranch?.id || "",
              category: car.carModel?.category?.id || "",
              year: car.manufacturingYear || "",
              price: car.price || "",
              status: car.isUsed ? "USED" : "NEW",
              mileage: car.mileage || "0",
              fuel: car.carModel?.technicalSpec?.fuelType || "Gasoline",
              transmission: car.carModel?.technicalSpec?.transmission || "Automatic",
              engine: car.carModel?.technicalSpec?.engineSize || "",
              horsepower: car.carModel?.technicalSpec?.horsepower || "",
              seats: car.carModel?.seatCapacity || "",
              doors: car.carModel?.technicalSpec?.doors || "",
              color: car.color || "",
              description: car.carModel?.description || "",
              features: "",
            });
            setSelectedModelId(car.carModel?.id || "");
            if (car.imageUrls) {
              setImages(car.imageUrls.map(url => ({ url, name: "image" })));
            }
          }
        } catch (err) {
          console.error("Fetch car error:", err);
          alert("Không thể tải thông tin xe!");
        } finally {
          defaultValue: setLoading(false);
        }
      };
      fetchCar();
    }
  }, [id, isEdit]);

  const set = (key, val) => { setForm(f => ({ ...f, [key]: val })); setErrors(e => ({ ...e, [key]: "" })); };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setRawImages(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setImages(prev => [...prev, { url: ev.target.result, name: file.name }]);
      reader.readAsDataURL(file);
    });
  };

  const EXT_3D = [".glb", ".gltf", ".fbx", ".usdz", ".obj", ".stl"];
  const handle3DModel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!EXT_3D.includes(ext)) {
      alert("Định dạng không hỗ trợ. Vui lòng chọn file 3D: " + EXT_3D.join(", "));
      return;
    }
    setModel3dFile(file);
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    setModel3d({ name: file.name, size: sizeMB + " MB", format: ext.replace(".", "").toUpperCase() });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Vui lòng chọn hoặc nhập tên xe";
    if (!form.vin.trim()) e.vin = "Vui lòng nhập số khung (VIN)";
    if (!selectedModelId) e.model = "Vui lòng chọn model xe";
    if (!form.year) e.year = "Vui lòng nhập năm sản xuất";
    if (!form.price) e.price = "Vui lòng nhập giá bán";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const carRequest = {
        name: form.name,
        price: parseFloat(form.price),
        carModelId: parseInt(selectedModelId),
        manufacturingYear: parseInt(form.year),
        isUsed: form.status !== "NEW",
        mileage: parseInt(form.mileage || 0),
        vinNumber: form.vin,
        color: form.color
      };

      const formData = new FormData();
      formData.append("request", new Blob([JSON.stringify(carRequest)], { type: "application/json" }));

      rawImages.forEach(file => {
        formData.append("images", file);
      });

      let response;
      if (isEdit) {
        response = await authApis().put(endpoints["update-car"](id), formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await authApis().post(endpoints["create-car"], formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // Tải mô hình 3D nếu có
      const createdCarId = response.data?.result?.id;
      if (model3dFile && createdCarId) {
        const mData = new FormData();
        mData.append("file", model3dFile);
        await authApis().post(endpoints["upload-3d-model"](createdCarId), mData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => navigate("/staff/car-list"), 2000);
    } catch (err) {
      console.error(err);
      alert("Lưu thông tin thất bại: " + (err.response?.data?.message || err.message));
      setSubmitting(false);
    }
  };

  if (submitted) return (
    <div className="fixed inset-0 bg-blue-600 flex items-center justify-center z-50 flex-col gap-4">
      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-2xl"></div>
      <h2 className="text-white font-black text-2xl">{isEdit ? "Cập nhật thành công!" : "Niêm yết xe mới thành công!"}</h2>
      <p className="text-blue-200 text-sm">Đang chuyển hướng về danh sách xe của bạn...</p>
    </div>
  );

  if (loading) return (
    <StaffLayout>
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      </div>
    </StaffLayout>
  );

  return (
    <StaffLayout searchPlaceholder="Tìm kiếm cấu hình...">
      <div className="px-8 py-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">
              Cổng thông tin <span className="text-blue-500 mx-1">/</span> Danh sách xe <span className="text-blue-500 mx-1">/</span> {isEdit ? "Chỉnh sửa" : "Tạo xe mới"}
            </p>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 leading-tight">{isEdit ? "Chỉnh sửa thông tin xe" : "Tạo xe mới"}</h2>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate("/staff/car-list")} className="px-4 py-2 border border-gray-200 bg-white text-sm font-bold text-gray-600 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60"
            >
              {submitting ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Đang lưu...</>
              ) : (
                <>Tạo xe mới</>
              )}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-5 pb-10">
          <div className="col-span-2 space-y-5">

            {/* Định Danh Xe */}
            <Section title="Nhận Diện Xe (Identity)" subtitle="Thông tin cơ bản hiển thị trên trang showroom">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Field label="Tên xe / Model" required>
                    <select
                      value={selectedModelId}
                      onChange={e => {
                        const modelId = e.target.value;
                        setSelectedModelId(modelId);
                        const model = allModels.find(m => m.id === parseInt(modelId));
                        if (model) {
                          set("name", model.name);
                          set("brand", model.carBranch?.id || "");
                          set("category", model.category?.id || "");
                          set("fuel", model.technicalSpec?.fuelType || "Gasoline");
                          set("transmission", model.technicalSpec?.transmission || "Automatic");
                          set("engine", model.technicalSpec?.engineSize || "");
                          set("horsepower", model.technicalSpec?.horsepower || "");
                          set("seats", model.seatCapacity || "");
                          set("doors", model.technicalSpec?.doors || "");
                          set("description", model.description || "");
                        }
                      }}
                      className={`${selectCls} ${errors.model ? "border-red-400" : ""}`}
                    >
                      <option value="">Chọn mẫu xe (Model)...</option>
                      {allModels.map(m => (
                        <option key={m.id} value={m.id}>{m.name} ({m.carBranch?.name})</option>
                      ))}
                    </select>
                    {errors.model && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.model}</p>}
                  </Field>
                </div>
                <Field label="Số Khung (Số VIN)" required>
                  <input value={form.vin} onChange={e => set("vin", e.target.value.toUpperCase())}
                    placeholder="Nhập 17 ký tự VIN..." maxLength={17}
                    className={`${inputCls} font-mono tracking-wider ${errors.vin ? "border-red-400" : ""}`} />
                  {errors.vin && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.vin}</p>}
                </Field>
                <Field label="Năm Sản Xuất" required>
                  <input type="number" value={form.year} onChange={e => set("year", e.target.value)}
                    placeholder="Ví dụ: 2023" min={1990} max={2030}
                    className={`${inputCls} ${errors.year ? "border-red-400" : ""}`} />
                  {errors.year && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.year}</p>}
                </Field>
                <Field label="Hãng Xe" required>
                  <select value={form.brand} onChange={e => set("brand", e.target.value)}
                    className={`${selectCls} ${errors.brand ? "border-red-400" : ""}`}>
                    <option value="">Chọn hãng xe (Branch)...</option>
                    {allBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  {errors.brand && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.brand}</p>}
                </Field>
                <Field label="Phân Khúc Xe" required>
                  <select value={form.category} onChange={e => set("category", e.target.value)}
                    className={`${selectCls} ${errors.category ? "border-red-400" : ""}`}>
                    <option value="">Chọn loại xe (Category)...</option>
                    {allCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.category && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.category}</p>}
                </Field>
              </div>
            </Section>

            {/* Định Giá */}
            <Section title="Giá Bán & Trạng Thái" subtitle="Thiết lập giá chào bán và tình trạng hoạt động">
              <div className="grid grid-cols-3 gap-4">
                <Field label="Giá Chào Bán (VND)" required>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₫</span>
                    <input type="number" value={form.price} onChange={e => set("price", e.target.value)}
                      placeholder="Giá trị xe..."
                      className={`${inputCls} pl-7 ${errors.price ? "border-red-400" : ""}`} />
                  </div>
                  {errors.price && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.price}</p>}
                </Field>
                <Field label="Số ODO Đã Đi (km)">
                  <input type="number" value={form.mileage} onChange={e => set("mileage", e.target.value)}
                    placeholder="Nhập 0 đối với xe mới" className={inputCls} />
                </Field>
                <Field label="Tình Trạng Niêm Yết">
                  <select value={form.status} onChange={e => set("status", e.target.value)} className={selectCls}>
                    {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </Field>
              </div>
            </Section>

            {/* Thông số kỹ thuật */}
            <Section title="Thông Số Kỹ Thuật" subtitle="Chi tiết động cơ và cấu hình cơ học">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Loại Nhiên Liệu">
                  <select value={form.fuel} onChange={e => set("fuel", e.target.value)} className={selectCls}>
                    {FUELS.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                  </select>
                </Field>
                <Field label="Hộp Số">
                  <select value={form.transmission} onChange={e => set("transmission", e.target.value)} className={selectCls}>
                    {TRANSMISSIONS.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                  </select>
                </Field>
                <Field label="Động Cơ">
                  <input value={form.engine} onChange={e => set("engine", e.target.value)}
                    placeholder='Ví dụ: "3.0L Twin-Turbo Flat-6"' className={inputCls} />
                </Field>
                <Field label="Công Suất Mã Lực (hp)">
                  <input type="number" value={form.horsepower} onChange={e => set("horsepower", e.target.value)}
                    placeholder="Ví dụ: 473" className={inputCls} />
                </Field>
                <Field label="Số Chỗ Ngồi">
                  <input type="number" value={form.seats} onChange={e => set("seats", e.target.value)}
                    placeholder="Ví dụ: 4" min={1} max={12} className={inputCls} />
                </Field>
                <Field label="Số Cửa Xe">
                  <input type="number" value={form.doors} onChange={e => set("doors", e.target.value)}
                    placeholder="Ví dụ: 2" min={1} max={6} className={inputCls} />
                </Field>
              </div>
            </Section>

            {/* Mô Tả */}
            <Section title="Bài Viết Giới Thiệu (Mô tả)" subtitle="Viết bài giới thiệu hoặc quảng bá thu hút khách mua xe">
              <textarea
                rows={4}
                value={form.description}
                onChange={e => set("description", e.target.value)}
                placeholder="Nhập mô tả xe sinh động: tình trạng sử dụng, trang bị nâng cấp thêm, lịch sử bảo dưỡng..."
                className={`${inputCls} resize-none`}
              />
              <p className="text-[10px] text-gray-300 mt-2 text-right">{form.description.length}/1000 ký tự</p>
            </Section>

            {/* Tính Năng nổi bật */}
            <Section title="Trang Bị Tiện Ích Nổi Bật" subtitle="Danh sách các trang bị đặc trưng (ngăn cách bằng dấu phẩy)">
              <input
                value={form.features}
                onChange={e => set("features", e.target.value)}
                placeholder="Ví dụ: Cửa sổ trời toàn cảnh, Ghế sưởi, Camera 360, Âm thanh Burmester..."
                className={inputCls}
              />
              {form.features && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.features.split(",").map(f => f.trim()).filter(Boolean).map((f, i) => (
                    <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded uppercase tracking-wider">{f}</span>
                  ))}
                </div>
              )}
            </Section>
          </div>

          {/* ── BẢNG BÊN PHẢI: Hình Ảnh & Mô Hình 3D ── */}
          <div className="col-span-1 space-y-5">

            {/* Hình ảnh */}
            <Section title="Hình Ảnh Thực Tế" subtitle="Tải ảnh lên (Ảnh đầu tiên sẽ làm ảnh bìa đại diện)">
              <input ref={imageRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
              <button type="button" onClick={() => imageRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/30 transition-all group mb-3">
                <span className="text-2xl">📷</span>
                <span className="text-[11px] font-black text-gray-400 group-hover:text-blue-500 uppercase tracking-wider">Nhấp để chọn ảnh</span>
                <span className="text-[9px] text-gray-300">Định dạng JPG, PNG, WEBP tối đa 10MB</span>
              </button>
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img.url} alt={img.name} className="w-full h-20 object-cover rounded-lg border border-gray-100" />
                      {i === 0 && <span className="absolute top-1 left-1 text-[8px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase">Ảnh Bìa</span>}
                      <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-black hidden group-hover:flex items-center justify-center">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Mô hình 3D */}
            <Section title="Mô Hình 3D Tương Tác" subtitle="Tải lên file mô hình 3D cho trình xoay xe tương tác">
              <input
                ref={model3dRef}
                type="file"
                accept=".glb,.gltf,.fbx,.usdz,.obj,.stl"
                className="hidden"
                onChange={handle3DModel}
              />

              {!model3d ? (
                <button
                  type="button"
                  onClick={() => model3dRef.current?.click()}
                  className="w-full h-28 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-black text-gray-400 group-hover:text-blue-500 uppercase tracking-wider">Tải lên mô hình 3D</span>
                  <span className="text-[9px] text-gray-300">GLB · GLTF · FBX · USDZ · OBJ · STL</span>
                </button>
              ) : (
                <div className="border border-gray-100 rounded-lg p-4 bg-gray-900 relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-blue-400">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-bold truncate">{model3d.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase">{model3d.format}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{model3d.size}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setModel3d(null); model3dRef.current.value = ""; }}
                      className="w-6 h-6 bg-red-500/80 rounded-full text-white text-[10px] font-black flex items-center justify-center hover:bg-red-500 transition-colors"
                    >✕</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-green-400 font-black uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Đã sẵn sàng niêm yết
                    </span>
                    <button type="button" onClick={() => model3dRef.current?.click()}
                      className="text-[9px] text-blue-400 font-black uppercase tracking-wider hover:text-blue-300">
                      Thay thế
                    </button>
                  </div>
                </div>
              )}
            </Section>

            {/* Màu ngoại thất */}
            <Section title="Màu Sắc Ngoại Thất" subtitle="Chọn tông màu sơn bên ngoài của xe">
              <div className="flex flex-wrap gap-2 mb-3">
                {COLORS_LIST.map(c => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => { setSelectedColor(c); set("color", c); }}
                    className={`w-7 h-7 rounded-full transition-all ${selectedColor === c ? "scale-125 ring-2 ring-offset-2 ring-blue-500" : "hover:scale-110"}`}
                    style={{ backgroundColor: c, border: c === "#ffffff" ? "1px solid #e5e7eb" : "none" }}
                  />
                ))}
              </div>
              {selectedColor && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-5 h-5 rounded-full border border-gray-100" style={{ backgroundColor: selectedColor }} />
                  <span className="text-[10px] font-black text-gray-500 uppercase font-mono">{selectedColor}</span>
                </div>
              )}
              <input
                value={form.color}
                onChange={e => { set("color", e.target.value); setSelectedColor(""); }}
                placeholder="hoặc gõ tên màu tùy biến khác..."
                className={`${inputCls} mt-2 text-xs`}
              />
            </Section>

            {/* Tóm tắt */}
            <Section title="Tóm Tắt Tin Đăng" subtitle="Xem trước thông tin xe trước khi đăng bán">
              <div className="space-y-2">
                {[
                  { label: "Tên xe", val: form.name || "—" },
                  { label: "Số khung VIN", val: form.vin || "—" },
                  { label: "Thương hiệu", val: allBrands.find(b => String(b.id) === String(form.brand))?.name || "—" },
                  { label: "Phân khúc", val: allCats.find(c => String(c.id) === String(form.category))?.name || "—" },
                  { label: "Năm SX", val: form.year || "—" },
                  { label: "Giá chào bán", val: form.price ? `${parseInt(form.price).toLocaleString()} ₫` : "—" },
                  { label: "Tình trạng", val: STATUSES.find(s => s.key === form.status)?.label || form.status },
                  { label: "Hình ảnh", val: `Đã chọn ${images.length} ảnh` },
                  { label: "Mô hình 3D", val: model3d ? `${model3d.format} · ${model3d.size}` : "Chưa có" },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between py-1.5 border-b border-gray-50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{r.label}</span>
                    <span className={`text-[11px] font-bold truncate max-w-[120px] ${r.val === "—" ? "text-gray-300" : "text-gray-800"}`}>{r.val}</span>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-4 py-3 bg-blue-600 text-white text-sm font-black rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting
                  ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Đang đăng...</>
                  : "Tạo xe mới"
                }
              </button>
              <button type="button" onClick={() => navigate("/staff/car-list")}
                className="w-full mt-2 py-2.5 border border-gray-200 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors">
                Hủy bản nháp
              </button>
            </Section>
          </div>
        </form>
      </div>
    </StaffLayout>
  );
}
