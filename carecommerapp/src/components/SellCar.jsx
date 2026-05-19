import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Spinner, Alert } from "react-bootstrap";
import { FaCamera, FaTrash, FaCarAlt, FaCheckCircle } from "react-icons/fa";
import { authApis, endpoints } from "../configs/APIs";
import axios from "../configs/APIs";

const FUEL_TYPES = ["GAS", "DIESEL", "HYBRID", "ELECTRIC"];
const TRANSMISSIONS = ["6AT", "5MT", "6MT", "CVT", "7DCT"];
const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

const Field = ({ label, required, children }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: 0.6, display: "block", marginBottom: 6 }}>
      {label}{required && <span style={{ color: "#ef4444" }}> *</span>}
    </label>
    {children}
  </div>
);

const inputStyle = {
  width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0",
  fontSize: "0.9rem", color: "#1e293b", background: "#f8fafc", outline: "none",
  transition: "border 0.15s",
};

export default function SellCar() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [branches, setBranches] = useState([]);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    branchId: "", modelName: "", trimLevel: "", engineSize: "", fuelType: "GAS",
    transmission: "6AT", manufacturingYear: new Date().getFullYear() - 1,
    mileage: "", vinNumber: "", licensePlate: "", color: "", interiorColor: "",
    numberOfOwners: 1, conditionNote: "", contactName: "", contactPhone: "",
    contactEmail: "", location: "", accidentHistory: "", serviceHistory: "",
    expectedPrice: "",
  });

  useEffect(() => {
    axios.get(endpoints["get-all-branch"]).then(res => {
      const d = res.data?.result;
      setBranches(Array.isArray(d?.data) ? d.data : Array.isArray(d) ? d : []);
    }).catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setImages(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) { setError("Vui lòng tải lên ít nhất 1 ảnh xe."); return; }
    if (!form.contactName || !form.contactPhone) { setError("Vui lòng điền đầy đủ thông tin liên hệ."); return; }
    setError(""); setSubmitting(true);
    try {
      const fd = new FormData();
      const dto = {
        ...form,
        branchId: form.branchId ? Number(form.branchId) : null,
        manufacturingYear: Number(form.manufacturingYear),
        mileage: form.mileage ? Number(form.mileage) : null,
        numberOfOwners: Number(form.numberOfOwners),
        expectedPrice: form.expectedPrice ? Number(form.expectedPrice) : null,
      };
      fd.append("dto", new Blob([JSON.stringify(dto)], { type: "application/json" }));
      images.forEach(img => fd.append("images", img));
      await authApis().post(endpoints["create-appraisal"], fd);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Gửi yêu cầu thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <div style={{ textAlign: "center", padding: 48, background: "#fff", borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.08)", maxWidth: 480 }}>
        <FaCheckCircle size={64} style={{ color: "#10b981", marginBottom: 20 }} />
        <h2 style={{ fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>Gửi yêu cầu thành công!</h2>
        <p style={{ color: "#64748b", marginBottom: 28 }}>Chúng tôi sẽ xem xét và liên hệ với bạn trong vòng 1–2 ngày làm việc.</p>
        <Link to="/" style={{ background: "#1a73e8", color: "#fff", padding: "12px 32px", borderRadius: 10, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
          Về trang chủ
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0f172a, #1e3a5f 55%, #1a73e8)", padding: "90px 10% 48px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(26,115,232,0.2)", border: "1px solid rgba(96,165,250,0.35)", borderRadius: 50, padding: "5px 14px", marginBottom: 14 }}>
            <FaCarAlt size={11} style={{ color: "#93c5fd" }} />
            <span style={{ color: "#93c5fd", fontSize: "0.72rem", fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" }}>Bán xe cũ</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: "2.4rem", fontWeight: 800, margin: "0 0 10px", letterSpacing: "-1px" }}>
            Đề xuất <span style={{ color: "#60a5fa" }}>bán xe của bạn</span>
          </h1>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
            Điền thông tin xe — đội ngũ chuyên gia sẽ thẩm định và đưa ra mức giá hợp lý nhất.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 900, margin: "36px auto", padding: "0 20px 60px" }}>
        {error && <Alert variant="danger" style={{ borderRadius: 10, marginBottom: 20 }}>{error}</Alert>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* ── Left Column ── */}
          <div>
            <SectionTitle>Thông tin xe</SectionTitle>

            <Field label="Thương hiệu">
              <select style={inputStyle} value={form.branchId} onChange={e => set("branchId", e.target.value)}>
                <option value="">-- Chọn thương hiệu --</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </Field>

            <Field label="Tên dòng xe" required>
              <input style={inputStyle} placeholder="VD: Mazda CX-5, Toyota Camry..." value={form.modelName} onChange={e => set("modelName", e.target.value)} required />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Phiên bản">
                <input style={inputStyle} placeholder="VD: Luxury, Premium..." value={form.trimLevel} onChange={e => set("trimLevel", e.target.value)} />
              </Field>
              <Field label="Dung tích">
                <input style={inputStyle} placeholder="VD: 2.0L" value={form.engineSize} onChange={e => set("engineSize", e.target.value)} />
              </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Nhiên liệu">
                <select style={inputStyle} value={form.fuelType} onChange={e => set("fuelType", e.target.value)}>
                  {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Hộp số">
                <select style={inputStyle} value={form.transmission} onChange={e => set("transmission", e.target.value)}>
                  {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Năm SX" required>
                <select style={inputStyle} value={form.manufacturingYear} onChange={e => set("manufacturingYear", e.target.value)}>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </Field>
              <Field label="Số km đã đi" required>
                <input style={inputStyle} type="number" placeholder="65000" min={0} value={form.mileage} onChange={e => set("mileage", e.target.value)} required />
              </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Màu ngoại thất">
                <input style={inputStyle} placeholder="VD: Trắng, Đỏ..." value={form.color} onChange={e => set("color", e.target.value)} />
              </Field>
              <Field label="Màu nội thất">
                <input style={inputStyle} placeholder="VD: Đen, Nâu..." value={form.interiorColor} onChange={e => set("interiorColor", e.target.value)} />
              </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Số chủ sở hữu">
                <input style={inputStyle} type="number" min={1} value={form.numberOfOwners} onChange={e => set("numberOfOwners", e.target.value)} />
              </Field>
              <Field label="Giá mong muốn (VNĐ)">
                <input style={inputStyle} type="number" placeholder="500000000" value={form.expectedPrice} onChange={e => set("expectedPrice", e.target.value)} />
              </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Số VIN">
                <input style={inputStyle} placeholder="17 ký tự" value={form.vinNumber} onChange={e => set("vinNumber", e.target.value)} />
              </Field>
              <Field label="Biển số xe">
                <input style={inputStyle} placeholder="VD: 51A-12345" value={form.licensePlate} onChange={e => set("licensePlate", e.target.value)} />
              </Field>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div>
            <SectionTitle>Tình trạng & liên hệ</SectionTitle>

            <Field label="Tình trạng xe">
              <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} placeholder="Mô tả tình trạng tổng quát của xe..." value={form.conditionNote} onChange={e => set("conditionNote", e.target.value)} />
            </Field>

            <Field label="Lịch sử tai nạn">
              <textarea style={{ ...inputStyle, minHeight: 72, resize: "vertical" }} placeholder="Xe có từng bị tai nạn không? Mô tả nếu có..." value={form.accidentHistory} onChange={e => set("accidentHistory", e.target.value)} />
            </Field>

            <Field label="Lịch sử bảo dưỡng">
              <textarea style={{ ...inputStyle, minHeight: 72, resize: "vertical" }} placeholder="Lịch sử bảo dưỡng định kỳ..." value={form.serviceHistory} onChange={e => set("serviceHistory", e.target.value)} />
            </Field>

            <SectionTitle>Thông tin liên hệ</SectionTitle>

            <Field label="Họ tên" required>
              <input style={inputStyle} placeholder="Nguyễn Văn A" value={form.contactName} onChange={e => set("contactName", e.target.value)} required />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Số điện thoại" required>
                <input style={inputStyle} type="tel" placeholder="0901234567" value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)} required />
              </Field>
              <Field label="Email">
                <input style={inputStyle} type="email" placeholder="email@gmail.com" value={form.contactEmail} onChange={e => set("contactEmail", e.target.value)} />
              </Field>
            </div>
            <Field label="Địa điểm xe">
              <input style={inputStyle} placeholder="VD: Quận 1, TP.HCM" value={form.location} onChange={e => set("location", e.target.value)} />
            </Field>

            {/* Image Upload */}
            <SectionTitle>Hình ảnh xe</SectionTitle>
            <div style={{ border: "2px dashed #cbd5e1", borderRadius: 12, padding: 20, background: "#f8fafc", cursor: "pointer" }}
              onClick={() => fileRef.current?.click()}>
              <input type="file" ref={fileRef} accept="image/*" multiple onChange={handleImages} style={{ display: "none" }} />
              <div style={{ textAlign: "center" }}>
                <FaCamera size={28} style={{ color: "#94a3b8", marginBottom: 8 }} />
                <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0, fontWeight: 600 }}>Nhấn để tải ảnh lên</p>
                <p style={{ color: "#94a3b8", fontSize: "0.75rem", margin: "4px 0 0" }}>JPG, PNG, WEBP — Tối thiểu 1 ảnh</p>
              </div>
            </div>

            {previews.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 12 }}>
                {previews.map((src, i) => (
                  <div key={i} style={{ position: "relative", borderRadius: 8, overflow: "hidden", height: 80 }}>
                    <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button type="button" onClick={() => removeImage(i)}
                      style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: 22, height: 22, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FaTrash size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 32, display: "flex", justifyContent: "center", gap: 16 }}>
          <Link to="/" style={{ padding: "13px 32px", borderRadius: 12, border: "1px solid #e2e8f0", fontWeight: 700, color: "#64748b", textDecoration: "none", background: "#fff" }}>
            Huỷ
          </Link>
          <button type="submit" disabled={submitting}
            style={{ padding: "13px 48px", borderRadius: 12, background: "linear-gradient(135deg, #1a73e8, #0056b3)", border: "none", color: "#fff", fontWeight: 800, fontSize: "1rem", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1, display: "flex", alignItems: "center", gap: 10 }}>
            {submitting ? <><Spinner size="sm" /> Đang gửi...</> : "Gửi yêu cầu thẩm định →"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontWeight: 800, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 1.2, color: "#1a73e8", marginBottom: 14, marginTop: 4, paddingBottom: 6, borderBottom: "2px solid #eff6ff" }}>
      {children}
    </div>
  );
}
