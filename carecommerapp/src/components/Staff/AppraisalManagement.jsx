import React, { useState, useEffect } from "react";
import StaffLayout from "./StaffLayout";
import { Spinner } from "react-bootstrap";
import { authApis, endpoints } from "../../configs/APIs";
import {
  FaEye, FaCheck, FaTimes, FaTag, FaCarAlt, FaPhoneAlt,
  FaChevronLeft, FaChevronRight, FaWarehouse
} from "react-icons/fa";

const STATUS_MAP = {
  PENDING:   { label: "Chờ thẩm định", bg: "#fef3c7", color: "#92400e" },
  APPRAISED: { label: "Đã định giá",   bg: "#dbeafe", color: "#1e40af" },
  ACCEPTED:  { label: "KH chấp nhận",  bg: "#d1fae5", color: "#065f46" },
  REJECTED:  { label: "Từ chối",       bg: "#fee2e2", color: "#991b1b" },
  COMPLETED: { label: "Hoàn thành",    bg: "#f3f4f6", color: "#374151" },
};

function Badge({ status }) {
  const s = STATUS_MAP[status] || { label: status, bg: "#f3f4f6", color: "#374151" };
  return (
    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function OfferModal({ item, onClose, onSuccess }) {
  const [price, setPrice] = useState(item.offeredPrice || "");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!price) { setError("Vui lòng nhập giá đề nghị."); return; }
    setLoading(true);
    try {
      await authApis().patch(endpoints["offer-price"](item.id), null, {
        params: { price: Number(price), note }
      });
      onSuccess("Đã cập nhật giá đề nghị.");
    } catch {
      setError("Không thể cập nhật. Vui lòng thử lại.");
    } finally { setLoading(false); }
  };

  return (
    <Overlay onClose={onClose}>
      <h3 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: 20, color: "#0f172a" }}>
        💰 Đưa ra giá đề nghị
      </h3>
      <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: 16 }}>
        Xe: <b style={{ color: "#0f172a" }}>{item.modelName || item.model?.name || "—"}</b>
        &nbsp;·&nbsp;KH mong muốn: <b style={{ color: "#1a73e8" }}>
          {item.expectedPrice ? item.expectedPrice.toLocaleString("vi-VN") + "đ" : "Chưa có"}
        </b>
      </p>
      <label style={labelSt}>Giá đề nghị (VNĐ) <span style={{ color: "#ef4444" }}>*</span></label>
      <input value={price} onChange={e => setPrice(e.target.value)} type="number" style={inputSt} placeholder="VD: 450000000" />
      <label style={{ ...labelSt, marginTop: 14 }}>Ghi chú</label>
      <textarea value={note} onChange={e => setNote(e.target.value)} style={{ ...inputSt, minHeight: 80, resize: "vertical" }} placeholder="Lý do định giá, tình trạng xe..." />
      {error && <p style={{ color: "#ef4444", fontSize: "0.82rem", marginTop: 8 }}>{error}</p>}
      <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={btnSecondary}>Huỷ</button>
        <button onClick={submit} disabled={loading} style={btnPrimary}>
          {loading ? "Đang lưu..." : "Xác nhận giá"}
        </button>
      </div>
    </Overlay>
  );
}

function DetailModal({ item, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const doAction = async (action) => {
    setLoading(true);
    try {
      if (action === "reject") {
        await authApis().patch(endpoints["update-appraisal-status"](item.id), null, { params: { status: false } });
        onSuccess("Đã từ chối yêu cầu.");
      } else if (action === "convert") {
        await authApis().post(endpoints["convert-to-inventory"](item.id));
        onSuccess("Đã thêm xe vào kho (chờ kiểm định).");
      }
    } catch {
      onSuccess("⚠ Thao tác thất bại.");
    } finally { setLoading(false); }
  };

  const imgs = item.images || [];

  return (
    <Overlay onClose={onClose} wide>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h3 style={{ fontWeight: 800, fontSize: "1.15rem", margin: 0, color: "#0f172a" }}>
            {item.modelName || item.model?.name || "Chưa rõ"}
          </h3>
          <Badge status={item.status} />
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.3rem", color: "#94a3b8" }}>✕</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <InfoSection title="Thông tin xe">
            <Info label="Thương hiệu" value={item.branch?.name || "—"} />
            <Info label="Phiên bản" value={item.trimLevel || "—"} />
            <Info label="Năm SX" value={item.manufacturingYear || "—"} />
            <Info label="Số km" value={item.mileage ? item.mileage.toLocaleString() + " km" : "—"} />
            <Info label="Nhiên liệu" value={item.fuelType || "—"} />
            <Info label="Hộp số" value={item.transmission || "—"} />
            <Info label="Màu" value={item.color || "—"} />
            <Info label="Số chủ" value={item.numberOfOwners || "—"} />
            <Info label="Biển số" value={item.licensePlate || "—"} />
            <Info label="Số VIN" value={item.vinNumber || "—"} />
          </InfoSection>

          <InfoSection title="Tình trạng">
            <Info label="Mô tả" value={item.conditionNote || "Không có"} />
            <Info label="Tai nạn" value={item.accidentHistory || "Không có"} />
            <Info label="Bảo dưỡng" value={item.serviceHistory || "Không có"} />
          </InfoSection>
        </div>

        <div>
          <InfoSection title="Thông tin liên hệ">
            <Info label="Họ tên" value={item.contactName || "—"} />
            <Info label="SĐT" value={item.contactPhone || "—"} />
            <Info label="Email" value={item.contactEmail || "—"} />
            <Info label="Địa điểm" value={item.location || "—"} />
          </InfoSection>

          <InfoSection title="Giá cả">
            <Info label="KH mong muốn" value={item.expectedPrice ? item.expectedPrice.toLocaleString("vi-VN") + "đ" : "—"} highlight />
            <Info label="Đề nghị của showroom" value={item.offeredPrice ? item.offeredPrice.toLocaleString("vi-VN") + "đ" : "Chưa có"} highlight />
          </InfoSection>

          {imgs.length > 0 && (
            <InfoSection title={`Hình ảnh (${imgs.length})`}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                {imgs.slice(0, 6).map((img, i) => (
                  <img key={i} src={img.imageUrl || img.url || img} alt=""
                    style={{ width: "100%", height: 70, objectFit: "cover", borderRadius: 8, border: "1px solid #e2e8f0" }} />
                ))}
              </div>
            </InfoSection>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
        {item.status === "PENDING" && (
          <button onClick={() => doAction("reject")} disabled={loading}
            style={{ ...btnDanger, display: "flex", alignItems: "center", gap: 6 }}>
            <FaTimes size={12} /> Từ chối
          </button>
        )}
        {item.status === "ACCEPTED" && (
          <button onClick={() => doAction("convert")} disabled={loading}
            style={{ ...btnSuccess, display: "flex", alignItems: "center", gap: 6 }}>
            <FaWarehouse size={12} /> Thêm vào kho (chờ kiểm định)
          </button>
        )}
      </div>
    </Overlay>
  );
}

export default function AppraisalManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [offerTarget, setOfferTarget] = useState(null);
  const [toast, setToast] = useState("");

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await authApis().get(endpoints["get-all-appraisals"](page, 10, statusFilter));
      const d = res.data?.result || {};
      setItems(Array.isArray(d.data) ? d.data : []);
      setTotalPages(d.totalPages || 1);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [page, statusFilter]);

  const showToast = (msg) => {
    setToast(msg); setSelected(null); setOfferTarget(null);
    fetch(); setTimeout(() => setToast(""), 3500);
  };

  return (
    <StaffLayout>
      <div className="px-8 py-6">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Yêu cầu thu mua xe cũ</h2>
            <p className="text-sm text-gray-500 mt-0.5">Quản lý các yêu cầu thẩm định từ khách hàng</p>
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 14px", fontSize: "0.85rem", color: "#374151", background: "#fff" }}>
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        {toast && (
          <div style={{ background: "#10b981", color: "#fff", padding: "12px 20px", borderRadius: 10, marginBottom: 16, fontWeight: 600, fontSize: "0.88rem" }}>
            ✅ {toast}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <Spinner animation="border" style={{ color: "#1a73e8", width: 40, height: 40, borderWidth: 3 }} />
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#94a3b8" }}>
            <FaCarAlt size={48} style={{ marginBottom: 16, opacity: 0.25 }} />
            <p style={{ fontWeight: 600, color: "#64748b" }}>Chưa có yêu cầu nào</p>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.87rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #f1f5f9", background: "#f8fafc" }}>
                  {["Khách hàng", "Xe", "Năm SX", "Km", "Giá mong muốn", "Offer", "Trạng thái", "Hành động"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 700, color: "#0f172a" }}>{item.contactName || "—"}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{item.contactPhone || ""}</div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>{item.modelName || item.model?.name || "—"}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{item.branch?.name || ""}</div>
                    </td>
                    <td style={{ padding: "14px 16px", color: "#374151" }}>{item.manufacturingYear || "—"}</td>
                    <td style={{ padding: "14px 16px", color: "#374151" }}>{item.mileage ? item.mileage.toLocaleString() + " km" : "—"}</td>
                    <td style={{ padding: "14px 16px", color: "#1a73e8", fontWeight: 700 }}>
                      {item.expectedPrice ? item.expectedPrice.toLocaleString("vi-VN") + "đ" : "—"}
                    </td>
                    <td style={{ padding: "14px 16px", color: "#10b981", fontWeight: 700 }}>
                      {item.offeredPrice ? item.offeredPrice.toLocaleString("vi-VN") + "đ" : <span style={{ color: "#94a3b8" }}>Chưa có</span>}
                    </td>
                    <td style={{ padding: "14px 16px" }}><Badge status={item.status} /></td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <ActionBtn icon={<FaEye size={11} />} title="Xem" color="#1a73e8" onClick={() => setSelected(item)} />
                        {(item.status === "PENDING" || item.status === "APPRAISED") && (
                          <ActionBtn icon={<FaTag size={11} />} title="Đưa giá" color="#f59e0b" onClick={() => setOfferTarget(item)} />
                        )}
                        {item.status === "ACCEPTED" && (
                          <ActionBtn icon={<FaWarehouse size={11} />} title="Thêm kho" color="#10b981"
                            onClick={async () => {
                              try {
                                await authApis().post(endpoints["convert-to-inventory"](item.id));
                                showToast("Đã thêm xe vào kho — đang chờ kiểm định.");
                              } catch { showToast("⚠ Thao tác thất bại."); }
                            }} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
            <PagBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><FaChevronLeft size={11} /></PagBtn>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <PagBtn key={p} onClick={() => setPage(p)} active={p === page}>{p}</PagBtn>
            ))}
            <PagBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><FaChevronRight size={11} /></PagBtn>
          </div>
        )}
      </div>

      {selected && <DetailModal item={selected} onClose={() => setSelected(null)} onSuccess={showToast} />}
      {offerTarget && <OfferModal item={offerTarget} onClose={() => setOfferTarget(null)} onSuccess={showToast} />}
    </StaffLayout>
  );
}

// ── Small helpers ──────────────────────────────────
function Overlay({ children, onClose, wide }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 16, width: wide ? 860 : 440, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        {children}
      </div>
    </div>
  );
}

function InfoSection({ title, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: "#1a73e8", marginBottom: 8, paddingBottom: 4, borderBottom: "2px solid #eff6ff" }}>{title}</div>
      {children}
    </div>
  );
}

function Info({ label, value, highlight }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #f8fafc" }}>
      <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: "0.82rem", color: highlight ? "#1a73e8" : "#1e293b", fontWeight: highlight ? 800 : 600, textAlign: "right", maxWidth: "60%" }}>{value}</span>
    </div>
  );
}

function ActionBtn({ icon, title, color, onClick }) {
  return (
    <button onClick={onClick} title={title}
      style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${color}20`, background: `${color}12`, color, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
      {icon}
    </button>
  );
}

function PagBtn({ children, onClick, disabled, active }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ width: 36, height: 36, borderRadius: "50%", border: active ? "none" : "1px solid #e2e8f0", background: active ? "#1a73e8" : "#fff", color: active ? "#fff" : "#374151", fontWeight: active ? 700 : 500, cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: disabled ? 0.4 : 1 }}>
      {children}
    </button>
  );
}

const labelSt = { fontSize: "0.75rem", fontWeight: 700, color: "#374151", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 };
const inputSt = { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: "0.88rem", color: "#1e293b", background: "#f8fafc", outline: "none" };
const btnPrimary = { background: "#1a73e8", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 700, cursor: "pointer", fontSize: "0.88rem" };
const btnSecondary = { background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontSize: "0.88rem" };
const btnDanger = { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontSize: "0.88rem" };
const btnSuccess = { background: "#d1fae5", color: "#065f46", border: "1px solid #a7f3d0", borderRadius: 10, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontSize: "0.88rem" };
