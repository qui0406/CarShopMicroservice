import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "./StaffLayout";

/* ─── Static options ────────────────────────────────────── */
const BRANDS = ["Porsche", "BMW", "Audi", "Mercedes-Benz", "Ferrari", "Toyota", "Honda", "Ford", "Tesla", "Lamborghini"];
const CATEGORIES = ["Sedan", "SUV", "Coupe", "Hatchback", "Electric", "Convertible", "Truck", "Van"];
const STATUSES = ["NEW", "USED", "CERTIFIED PRE-OWNED"];
const FUELS = ["Gasoline", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"];
const TRANSMISSIONS = ["Automatic", "Manual", "CVT", "DCT"];
const COLORS_LIST = ["#1a1a1a", "#ffffff", "#c0392b", "#2980b9", "#27ae60", "#f39c12", "#8e44ad", "#7f8c8d", "#e8d5b7", "#2c3e50"];

/* ─── Section wrapper ───────────────────────────────────── */
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

/* ─── Field wrapper ─────────────────────────────────────── */
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

/* ─── Main Component ────────────────────────────────────── */
export default function CreateCar() {
  const navigate = useNavigate();
  const imageRef  = useRef(null);
  const model3dRef = useRef(null);

  const [form, setForm] = useState({
    name: "", vin: "", brand: "", category: "", year: "",
    price: "", status: "NEW", mileage: "", fuel: "Gasoline",
    transmission: "Automatic", engine: "", horsepower: "",
    seats: "", doors: "", color: "", description: "",
    features: "",
  });

  const [images, setImages]           = useState([]);
  const [model3d, setModel3d]         = useState(null);   // { name, size, format }
  const [selectedColor, setSelectedColor] = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [errors, setErrors]           = useState({});

  const set = (key, val) => { setForm(f => ({ ...f, [key]: val })); setErrors(e => ({ ...e, [key]: "" })); };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
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
      alert("Unsupported format. Please upload: " + EXT_3D.join(", "));
      return;
    }
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    setModel3d({ name: file.name, size: sizeMB + " MB", format: ext.replace(".", "").toUpperCase() });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name     = "Required";
    if (!form.vin.trim())      e.vin      = "Required";
    if (!form.brand)           e.brand    = "Required";
    if (!form.category)        e.category = "Required";
    if (!form.year)            e.year     = "Required";
    if (!form.price)           e.price    = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1800));
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => navigate("/staff/inventory"), 2000);
  };

  /* ── Success overlay ── */
  if (submitted) return (
    <div className="fixed inset-0 bg-blue-600 flex items-center justify-center z-50 flex-col gap-4">
      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-2xl">✅</div>
      <h2 className="text-white font-black text-2xl">Car Listed Successfully!</h2>
      <p className="text-blue-200 text-sm">Redirecting to Inventory...</p>
    </div>
  );

  return (
    <StaffLayout searchPlaceholder="Search configurations...">
      <div className="px-8 py-6 pb-20">

          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">
                Portal <span className="text-blue-500 mx-1">/</span> Inventory <span className="text-blue-500 mx-1">/</span> New Listing
              </p>
              <h2 className="text-3xl font-black tracking-tight text-gray-900 leading-tight">Add New Car</h2>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate("/staff/inventory")} className="px-4 py-2 border border-gray-200 bg-white text-sm font-bold text-gray-600 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                Discard
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60"
              >
                {submitting ? (
                  <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Publishing...</>
                ) : (
                  <>✅ Publish Listing</>
                )}
              </button>
            </div>
          </div>

          {/* 2-column layout */}
          <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-5 pb-10">

            {/* ── LEFT: main form ── */}
            <div className="col-span-2 space-y-5">

              {/* Basic Info */}
              <Section title="Vehicle Identity" subtitle="Core information shown in listing">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Field label="Car Name / Model" required>
                      <input value={form.name} onChange={e => set("name", e.target.value)}
                        placeholder='e.g. "Porsche 911 Carrera S"' className={`${inputCls} ${errors.name ? "border-red-400 ring-1 ring-red-400" : ""}`}/>
                      {errors.name && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.name}</p>}
                    </Field>
                  </div>
                  <Field label="VIN Number" required>
                    <input value={form.vin} onChange={e => set("vin", e.target.value.toUpperCase())}
                      placeholder="e.g. WP0AA2A9XLS203" maxLength={17}
                      className={`${inputCls} font-mono tracking-wider ${errors.vin ? "border-red-400" : ""}`}/>
                    {errors.vin && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.vin}</p>}
                  </Field>
                  <Field label="Year" required>
                    <input type="number" value={form.year} onChange={e => set("year", e.target.value)}
                      placeholder="e.g. 2023" min={1990} max={2030}
                      className={`${inputCls} ${errors.year ? "border-red-400" : ""}`}/>
                    {errors.year && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.year}</p>}
                  </Field>
                  <Field label="Brand" required>
                    <select value={form.brand} onChange={e => set("brand", e.target.value)}
                      className={`${selectCls} ${errors.brand ? "border-red-400" : ""}`}>
                      <option value="">Select Brand</option>
                      {BRANDS.map(b => <option key={b}>{b}</option>)}
                    </select>
                    {errors.brand && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.brand}</p>}
                  </Field>
                  <Field label="Category" required>
                    <select value={form.category} onChange={e => set("category", e.target.value)}
                      className={`${selectCls} ${errors.category ? "border-red-400" : ""}`}>
                      <option value="">Select Category</option>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    {errors.category && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.category}</p>}
                  </Field>
                </div>
              </Section>

              {/* Pricing */}
              <Section title="Pricing & Status" subtitle="Set listing price and availability status">
                <div className="grid grid-cols-3 gap-4">
                  <Field label="List Price (USD)" required>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                      <input type="number" value={form.price} onChange={e => set("price", e.target.value)}
                        placeholder="132,400"
                        className={`${inputCls} pl-7 ${errors.price ? "border-red-400" : ""}`}/>
                    </div>
                    {errors.price && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.price}</p>}
                  </Field>
                  <Field label="Mileage (km)">
                    <input type="number" value={form.mileage} onChange={e => set("mileage", e.target.value)}
                      placeholder="0 for new" className={inputCls}/>
                  </Field>
                  <Field label="Listing Status">
                    <select value={form.status} onChange={e => set("status", e.target.value)} className={selectCls}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>
              </Section>

              {/* Technical */}
              <Section title="Technical Specifications" subtitle="Engine details and mechanical configuration">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Fuel Type">
                    <select value={form.fuel} onChange={e => set("fuel", e.target.value)} className={selectCls}>
                      {FUELS.map(f => <option key={f}>{f}</option>)}
                    </select>
                  </Field>
                  <Field label="Transmission">
                    <select value={form.transmission} onChange={e => set("transmission", e.target.value)} className={selectCls}>
                      {TRANSMISSIONS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Engine">
                    <input value={form.engine} onChange={e => set("engine", e.target.value)}
                      placeholder='e.g. "3.0L Twin-Turbo Flat-6"' className={inputCls}/>
                  </Field>
                  <Field label="Horsepower (hp)">
                    <input type="number" value={form.horsepower} onChange={e => set("horsepower", e.target.value)}
                      placeholder="e.g. 473" className={inputCls}/>
                  </Field>
                  <Field label="Seats">
                    <input type="number" value={form.seats} onChange={e => set("seats", e.target.value)}
                      placeholder="e.g. 4" min={1} max={12} className={inputCls}/>
                  </Field>
                  <Field label="Doors">
                    <input type="number" value={form.doors} onChange={e => set("doors", e.target.value)}
                      placeholder="e.g. 2" min={1} max={6} className={inputCls}/>
                  </Field>
                </div>
              </Section>

              {/* Description */}
              <Section title="Description" subtitle="Marketing description for the car listing">
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={e => set("description", e.target.value)}
                  placeholder="Write a compelling description highlighting key features, performance characteristics and condition..."
                  className={`${inputCls} resize-none`}
                />
                <p className="text-[10px] text-gray-300 mt-2 text-right">{form.description.length}/1000</p>
              </Section>

              {/* Features */}
              <Section title="Key Features" subtitle="Comma-separated list of standout features">
                <input
                  value={form.features}
                  onChange={e => set("features", e.target.value)}
                  placeholder="e.g. Heated Seats, Panoramic Roof, Night Vision, Sport Exhaust..."
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

            {/* ── RIGHT: sidebar panels ── */}
            <div className="col-span-1 space-y-5">

              {/* Image upload */}
              <Section title="Photos" subtitle="Upload car images (first = cover)">
                <input ref={imageRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImages}/>
                <button type="button" onClick={() => imageRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/30 transition-all group mb-3">
                  <span className="text-2xl">📷</span>
                  <span className="text-[11px] font-black text-gray-400 group-hover:text-blue-500 uppercase tracking-wider">Click to Upload</span>
                  <span className="text-[9px] text-gray-300">JPG, PNG, WEBP up to 10MB</span>
                </button>
                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {images.map((img, i) => (
                      <div key={i} className="relative group">
                        <img src={img.url} alt={img.name} className="w-full h-20 object-cover rounded-lg border border-gray-100"/>
                        {i === 0 && <span className="absolute top-1 left-1 text-[8px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase">Cover</span>}
                        <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-black hidden group-hover:flex items-center justify-center">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* 3D Model upload */}
              <Section title="3D Model" subtitle="Upload interactive 3D asset for the car viewer">
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
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-[11px] font-black text-gray-400 group-hover:text-blue-500 uppercase tracking-wider">Upload 3D Model</span>
                    <span className="text-[9px] text-gray-300">GLB · GLTF · FBX · USDZ · OBJ · STL</span>
                  </button>
                ) : (
                  <div className="border border-gray-100 rounded-lg p-4 bg-gray-900 relative">
                    {/* 3D preview placeholder */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-blue-400">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"/> Ready to publish
                      </span>
                      <button type="button" onClick={() => model3dRef.current?.click()}
                        className="text-[9px] text-blue-400 font-black uppercase tracking-wider hover:text-blue-300">
                        Replace
                      </button>
                    </div>
                  </div>
                )}
              </Section>

              {/* Color */}
              <Section title="Exterior Color" subtitle="Select the vehicle's exterior color">
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
                    <div className="w-5 h-5 rounded-full border border-gray-100" style={{ backgroundColor: selectedColor }}/>
                    <span className="text-[10px] font-black text-gray-500 uppercase font-mono">{selectedColor}</span>
                  </div>
                )}
                <input
                  value={form.color}
                  onChange={e => { set("color", e.target.value); setSelectedColor(""); }}
                  placeholder="or type custom color name..."
                  className={`${inputCls} mt-2 text-xs`}
                />
              </Section>

              {/* Summary */}
              <Section title="Listing Summary" subtitle="Preview before publishing">
                <div className="space-y-2">
                  {[
                    { label: "Name",     val: form.name     || "—" },
                    { label: "VIN",      val: form.vin      || "—" },
                    { label: "Brand",    val: form.brand    || "—" },
                    { label: "Category", val: form.category || "—" },
                    { label: "Year",     val: form.year     || "—" },
                    { label: "Price",    val: form.price    ? `$${parseInt(form.price).toLocaleString()}` : "—" },
                    { label: "Status",   val: form.status },
                    { label: "Photos",   val: `${images.length} uploaded` },
                    { label: "3D Model", val: model3d ? `${model3d.format} · ${model3d.size}` : "None" },
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
                    ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Publishing...</>
                    : "✅ Publish Listing"
                  }
                </button>
                <button type="button" onClick={() => navigate("/staff/inventory")}
                  className="w-full mt-2 py-2.5 border border-gray-200 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors">
                  Discard Draft
                </button>
              </Section>
            </div>
          </form>
      </div>
    </StaffLayout>
  );
}
