import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Spinner, Form, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaChevronLeft, FaChevronRight, FaGasPump, FaCar,
  FaCalendarAlt, FaTachometerAlt, FaUndo, FaFilter, FaHistory
} from "react-icons/fa";
import { GiCarSeat } from "react-icons/gi";
import axios, { endpoints } from "../configs/APIs";

const FUEL_LABELS = { GAS: "Xăng", DIESEL: "Diesel", HYBRID: "Hybrid", ELECTRIC: "Điện" };
const PAGE_SIZE = 9;

const LabelStyle = { fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, display: "block" };
const SelectStyle = { borderRadius: 8, border: "1px solid #e2e8f0", height: 38, fontSize: "0.82rem", color: "#374151", background: "#f8fafc", boxShadow: "none" };

export default function CarOld() {
  const [cars, setCars] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);

  // Filter state
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedMileage, setSelectedMileage] = useState("");

  // Applied filters (trigger fetch)
  const [applied, setApplied] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const getCarName = (car) => car.name || car.carModel?.name || car.carName || car.modelName || car.car_model?.name || "Mẫu xe đang cập nhật";
  const getCategory = (car) => car.carModel?.category?.name || "";
  const getBranch = (car) => car.carModel?.carBranch?.name || "";
  const getSeats = (car) => car.carModel?.seatCapacity || 5;
  const getEngine = (car) => car.carModel?.technicalSpec?.engine || "";

  // Load meta
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [bRes, cRes] = await Promise.all([
          axios.get(endpoints["get-all-branch"]),
          axios.get(endpoints["get-all-category"]),
        ]);
        const bd = bRes.data?.result;
        setBranches(Array.isArray(bd?.data) ? bd.data : Array.isArray(bd) ? bd : []);
        const cd = cRes.data?.result;
        setCategories(Array.isArray(cd?.data) ? cd.data : Array.isArray(cd) ? cd : []);
      } catch (e) { console.error(e); }
    };
    loadMeta();
  }, []);

  // Fetch cars
  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      try {
        // Default: get-cars with isReady+used. With filters: filter-car with isReady+used.
        const BASE_PARAMS = { isReady: true, used: true };
        const hasFilter = applied.branch || applied.category || applied.price || applied.mileage;
        let endpoint;
        if (hasFilter) {
          const params = { page, size: PAGE_SIZE, ...BASE_PARAMS };
          if (applied.branch) params.carBranch = applied.branch;
          if (applied.category) params.carCategory = applied.category;
          if (applied.price) params.price = applied.price;
          endpoint = endpoints["filter-car"](params);
        } else {
          endpoint = endpoints["get-cars"](page, PAGE_SIZE, BASE_PARAMS);
        }
        const res = await axios.get(endpoint);
        const resData = res.data?.result || res.data || {};
        let data = Array.isArray(resData.data) ? resData.data : (Array.isArray(resData) ? resData : []);

        // Client-side mileage filter
        if (applied.mileage) {
          const maxKm = parseInt(applied.mileage);
          data = data.filter(car => (car.mileage || 0) <= maxKm);
        }

        setCars(data);
        setTotalPages(resData.totalPages || 1);
        setTotalElements(resData.totalElements || data.length);
      } catch (err) {
        console.error("Fetch cars error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, [page, applied]);

  const handleApply = () => {
    setPage(1);
    setApplied({ branch: selectedBranch, category: selectedCategory, price: selectedPrice, mileage: selectedMileage });
  };

  const handleReset = () => {
    setSelectedBranch(""); setSelectedCategory(""); setSelectedPrice(""); setSelectedMileage("");
    setPage(1);
    setApplied({});
  };

  const hasActiveFilter = applied.branch || applied.category || applied.price || applied.mileage;

  // Pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 48 }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
          style={{ width: 38, height: 38, borderRadius: "50%", border: "1px solid #e2e8f0", background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", opacity: page === 1 ? 0.45 : 1 }}>
          <FaChevronLeft size={11} />
        </button>
        {start > 1 && <>
          <button onClick={() => setPage(1)} style={{ width: 38, height: 38, borderRadius: "50%", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: 600, color: "#374151", fontSize: "0.88rem" }}>1</button>
          {start > 2 && <span style={{ color: "#94a3b8", fontWeight: 700 }}>…</span>}
        </>}
        {pages.map(p => (
          <button key={p} onClick={() => setPage(p)}
            style={{ width: 38, height: 38, borderRadius: "50%", border: p === page ? "none" : "1px solid #e2e8f0", background: p === page ? "#1a73e8" : "#fff", color: p === page ? "#fff" : "#374151", fontWeight: p === page ? 700 : 500, cursor: "pointer", fontSize: "0.88rem" }}>
            {p}
          </button>
        ))}
        {end < totalPages && <>
          {end < totalPages - 1 && <span style={{ color: "#94a3b8", fontWeight: 700 }}>…</span>}
          <button onClick={() => setPage(totalPages)} style={{ width: 38, height: 38, borderRadius: "50%", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: 600, color: "#374151", fontSize: "0.88rem" }}>{totalPages}</button>
        </>}
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
          style={{ width: 38, height: 38, borderRadius: "50%", border: "1px solid #e2e8f0", background: "#fff", cursor: page === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", opacity: page === totalPages ? 0.45 : 1 }}>
          <FaChevronRight size={11} />
        </button>
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter','Roboto',sans-serif" }}>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 55%, #1a73e8 100%)", padding: "52px 10%", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ position: "absolute", bottom: -60, left: "38%", width: 220, height: 220, borderRadius: "50%", background: "rgba(26,115,232,0.12)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(26,115,232,0.2)", border: "1px solid rgba(96,165,250,0.35)", borderRadius: 50, padding: "5px 14px", marginBottom: 14 }}>
            <FaHistory size={11} style={{ color: "#93c5fd" }} />
            <span style={{ color: "#93c5fd", fontSize: "0.72rem", fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" }}>Pre-Owned</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: "2.6rem", fontWeight: 800, margin: "0 0 10px", letterSpacing: "-1px" }}>
            Xe <span style={{ color: "#60a5fa" }}>qua sử dụng</span>
          </h1>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
            {totalElements} mẫu xe đã qua sử dụng — được kiểm định kỹ lưỡng
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px 64px" }}>
        <Row className="g-4" style={{ alignItems: "flex-start" }}>

          {/* ── LEFT SIDEBAR ── */}
          <Col lg={sidebarOpen ? 3 : "auto"} md={sidebarOpen ? 4 : "auto"} style={{ flexShrink: 0 }}>
            <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden", position: "sticky", top: 20 }}>

              {/* Sidebar header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #f1f5f9", background: "#fafafa" }}>
                {sidebarOpen && <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "#374151", textTransform: "uppercase", letterSpacing: 0.8 }}>Bộ lọc</span>}
                <button onClick={() => setSidebarOpen(o => !o)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 4, display: "flex", alignItems: "center" }}>
                  <FaFilter size={13} />
                </button>
              </div>

              {sidebarOpen && (
                <div style={{ padding: "16px 14px" }}>

                  {/* Thương hiệu */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={LabelStyle}>Thương hiệu</label>
                    <Form.Select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)} style={SelectStyle}>
                      <option value="">Tất cả</option>
                      {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </Form.Select>
                  </div>

                  {/* Phân khúc */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={LabelStyle}>Phân khúc</label>
                    <Form.Select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={SelectStyle}>
                      <option value="">Tất cả</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </Form.Select>
                  </div>

                  {/* Khoảng giá */}
                  <div style={{ marginBottom: 14 }}>
                    <label style={LabelStyle}>Khoảng giá</label>
                    <Form.Select value={selectedPrice} onChange={e => setSelectedPrice(e.target.value)} style={SelectStyle}>
                      <option value="">Mọi mức giá</option>
                      <option value="300000000">Dưới 300 triệu</option>
                      <option value="500000000">Dưới 500 triệu</option>
                      <option value="800000000">Dưới 800 triệu</option>
                      <option value="1000000000">Dưới 1 tỷ</option>
                      <option value="2000000000">Dưới 2 tỷ</option>
                    </Form.Select>
                  </div>

                  {/* Số km */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={LabelStyle}>Số km đã đi</label>
                    <Form.Select value={selectedMileage} onChange={e => setSelectedMileage(e.target.value)} style={SelectStyle}>
                      <option value="">Tất cả</option>
                      <option value="10000">Dưới 10,000 km</option>
                      <option value="30000">Dưới 30,000 km</option>
                      <option value="50000">Dưới 50,000 km</option>
                      <option value="100000">Dưới 100,000 km</option>
                    </Form.Select>
                  </div>

                  {/* Buttons */}
                  <Button onClick={handleApply}
                    style={{ width: "100%", background: "#1a73e8", border: "none", borderRadius: 8, fontWeight: 700, fontSize: "0.82rem", padding: "9px", marginBottom: 8 }}>
                    Áp dụng
                  </Button>
                  {hasActiveFilter && (
                    <Button onClick={handleReset} variant="outline-secondary"
                      style={{ width: "100%", borderRadius: 8, fontSize: "0.8rem", fontWeight: 600, padding: "8px", border: "1px solid #e2e8f0", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <FaUndo size={10} /> Xoá lọc
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Col>

          {/* ── MAIN CONTENT ── */}
          <Col>
            {/* Stats */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ color: "#64748b", fontSize: "0.88rem" }}>
                {loading ? "Đang tải..." : <>Hiển thị <b style={{ color: "#1e293b" }}>{cars.length}</b> / <b style={{ color: "#1e293b" }}>{totalElements}</b> xe{totalPages > 1 ? ` · Trang ${page}/${totalPages}` : ""}</>}
              </span>
              <Link to="/" style={{ color: "#1a73e8", fontWeight: 600, fontSize: "0.88rem", textDecoration: "none" }}>← Trang chủ</Link>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <Spinner animation="border" style={{ color: "#1a73e8", width: 44, height: 44, borderWidth: 3 }} />
                <p style={{ color: "#64748b", marginTop: 16, fontSize: "0.9rem" }}>Đang tải danh sách xe...</p>
              </div>
            ) : cars.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0", color: "#94a3b8" }}>
                <FaCar size={52} style={{ marginBottom: 16, opacity: 0.25 }} />
                <p style={{ fontSize: "1.05rem", fontWeight: 600, color: "#64748b" }}>Không tìm thấy xe phù hợp</p>
                <Button onClick={handleReset} style={{ marginTop: 12, background: "#1a73e8", border: "none", borderRadius: 10, fontWeight: 700, padding: "10px 24px" }}>
                  Xem tất cả xe
                </Button>
              </div>
            ) : (
              <Row className="g-4">
                {cars.map((car) => {
                  const name = getCarName(car);
                  const category = getCategory(car);
                  const branch = getBranch(car);
                  const seats = getSeats(car);
                  const engine = getEngine(car);
                  const km = car.mileage || 0;

                  return (
                    <Col key={car.id} md={6} xl={4}>
                      <Card
                        style={{ border: "none", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", height: "100%", background: "#fff", transition: "transform 0.25s, box-shadow 0.25s", cursor: "pointer" }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 14px 36px rgba(0,0,0,0.13)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)"; }}
                        onClick={() => window.location.href = `/get-car-by-id/${car.id}`}>

                        {/* Image */}
                        <div style={{ position: "relative", height: 210, overflow: "hidden", background: "#f1f5f9" }}>
                          <img
                            src={car.thumbnail || "https://via.placeholder.com/400x240?text=No+Image"}
                            alt={name}
                            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.45s" }}
                            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"}
                            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                          />
                          {/* Badges */}
                          <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
                            <Badge style={{ background: "#f59e0b", fontSize: "0.68rem", fontWeight: 700, borderRadius: 6, padding: "4px 9px" }}>ĐÃ QUA SỬ DỤNG</Badge>
                            {category && <Badge style={{ background: "rgba(15,23,42,0.65)", fontSize: "0.68rem", fontWeight: 600, borderRadius: 6, padding: "4px 9px", backdropFilter: "blur(4px)" }}>{category}</Badge>}
                          </div>
                          {/* Color */}
                          {car.color && (
                            <div style={{ position: "absolute", bottom: 10, right: 12, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)", borderRadius: 20, padding: "3px 10px", color: "#fff", fontSize: "0.7rem", fontWeight: 600 }}>
                              🎨 {car.color}
                            </div>
                          )}
                        </div>

                        <Card.Body style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column" }}>
                          {branch && <div style={{ color: "#1a73e8", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.1, marginBottom: 4 }}>{branch}</div>}
                          <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: "0 0 6px", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</h3>
                          <div style={{ color: "#1a73e8", fontWeight: 800, fontSize: "1.18rem", marginBottom: 14 }}>
                            {car.price ? car.price.toLocaleString("vi-VN") + "đ" : "Liên hệ"}
                          </div>

                          {/* Spec grid */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 10px", marginBottom: 16, padding: "12px 14px", background: "#f8fafc", borderRadius: 10, flexGrow: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#475569", fontSize: "0.8rem" }}>
                              <GiCarSeat size={14} style={{ color: "#1a73e8", flexShrink: 0 }} />
                              <span>{seats} chỗ</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#475569", fontSize: "0.8rem" }}>
                              <FaGasPump size={12} style={{ color: "#1a73e8", flexShrink: 0 }} />
                              <span>{FUEL_LABELS[car.fuelType] || car.fuelType || "Xăng"}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#475569", fontSize: "0.8rem" }}>
                              <FaCalendarAlt size={12} style={{ color: "#1a73e8", flexShrink: 0 }} />
                              <span>{car.manufacturingYear || "—"}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#475569", fontSize: "0.8rem" }}>
                              <FaTachometerAlt size={12} style={{ color: km > 50000 ? "#ef4444" : "#1a73e8", flexShrink: 0 }} />
                              <span style={{ color: km > 50000 ? "#ef4444" : "inherit" }}>{km > 0 ? km.toLocaleString() + " km" : "Mới"}</span>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: 8 }}>
                            <Button as={Link} to={`/get-car-by-id/${car.id}`} onClick={e => e.stopPropagation()}
                              style={{ flex: 1, background: "#f8fafc", color: "#374151", border: "1px solid #e2e8f0", borderRadius: 10, fontWeight: 600, padding: "10px", fontSize: "0.82rem" }}>
                              Chi tiết
                            </Button>
                            <Button as={Link} to={`/get-car-by-id/${car.id}`} onClick={e => e.stopPropagation()}
                              style={{ flex: 1, background: "linear-gradient(135deg, #1a73e8, #0056b3)", border: "none", borderRadius: 10, fontWeight: 700, padding: "10px", fontSize: "0.82rem", color: "#fff" }}>
                              Đặt lịch xem →
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            )}

            {renderPagination()}
          </Col>
        </Row>
      </div>
    </div>
  );
}
