import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Spinner, Form, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaSearch, FaChevronLeft, FaChevronRight, FaGasPump, FaCar, FaCalendarAlt, FaTachometerAlt, FaTimes } from "react-icons/fa";
import { GiCarSeat } from "react-icons/gi";
import axios, { endpoints } from "../configs/APIs";

const FUEL_LABELS = { GAS: "Xăng", DIESEL: "Diesel", HYBRID: "Hybrid", ELECTRIC: "Điện" };
const PAGE_SIZE = 9;

export default function CarNew() {
  const [cars, setCars] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");

  const getCarName = (car) => car.name || car.carModel?.name || car.carName || car.modelName || car.car_model?.name || "Mẫu xe đang cập nhật";
  const getCategory = (car) => car.carModel?.category?.name || "";
  const getBranch = (car) => car.carModel?.carBranch?.name || "";
  const getSeats = (car) => car.carModel?.seatCapacity || 5;
  const getEngine = (car) => car.carModel?.technicalSpec?.engine || "";
  const isUsed = (car) => car.used || car.mileage > 0;

  // Fetch branches & categories once
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

  // Fetch cars whenever filters or page change
  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      try {
        // Default: get-cars with isReady+used. With filters: filter-car with isReady+used.
        const BASE_PARAMS = { isReady: true, used: false };
        const hasFilter = activeSearch || selectedBranch || selectedCategory || selectedPrice;
        let endpoint;
        if (hasFilter) {
          const params = { page, size: PAGE_SIZE, ...BASE_PARAMS };
          if (activeSearch) params.carName = activeSearch;
          if (selectedBranch) params.carBranch = selectedBranch;
          if (selectedCategory) params.carCategory = selectedCategory;
          if (selectedPrice) params.price = selectedPrice; // already in full VND
          endpoint = endpoints["filter-car"](params);
        } else {
          endpoint = endpoints["get-cars"](page, PAGE_SIZE, BASE_PARAMS);
        }
        const res = await axios.get(endpoint);
        const resData = res.data?.result || res.data || {};
        const data = Array.isArray(resData.data) ? resData.data : (Array.isArray(resData) ? resData : []);
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
  }, [page, activeSearch, selectedBranch, selectedCategory, selectedPrice]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); setActiveSearch(searchInput); };
  const handleReset = () => { setSearchInput(""); setActiveSearch(""); setSelectedBranch(""); setSelectedCategory(""); setSelectedPrice(""); setPage(1); };
  const hasActiveFilter = activeSearch || selectedBranch || selectedCategory || selectedPrice;

  // Pagination renderer
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
          style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid #e2e8f0", background: page === 1 ? "#f8fafc" : "#fff", cursor: page === 1 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", opacity: page === 1 ? 0.5 : 1 }}>
          <FaChevronLeft size={12} />
        </button>
        {start > 1 && <>
          <button onClick={() => setPage(1)} style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: 600, color: "#374151" }}>1</button>
          {start > 2 && <span style={{ color: "#94a3b8", fontWeight: 700 }}>…</span>}
        </>}
        {pages.map(p => (
          <button key={p} onClick={() => setPage(p)}
            style={{ width: 40, height: 40, borderRadius: "50%", border: p === page ? "none" : "1px solid #e2e8f0", background: p === page ? "#1a73e8" : "#fff", color: p === page ? "#fff" : "#374151", fontWeight: p === page ? 700 : 500, cursor: "pointer", fontSize: "0.9rem", transition: "all 0.15s" }}>
            {p}
          </button>
        ))}
        {end < totalPages && <>
          {end < totalPages - 1 && <span style={{ color: "#94a3b8", fontWeight: 700 }}>…</span>}
          <button onClick={() => setPage(totalPages)} style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: 600, color: "#374151" }}>{totalPages}</button>
        </>}
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
          style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid #e2e8f0", background: page === totalPages ? "#f8fafc" : "#fff", cursor: page === totalPages ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", opacity: page === totalPages ? 0.5 : 1 }}>
          <FaChevronRight size={12} />
        </button>
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', 'Roboto', sans-serif" }}>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 55%, #1a73e8 100%)", padding: "56px 10%", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, right: -100, width: 350, height: 350, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ position: "absolute", bottom: -80, left: "35%", width: 250, height: 250, borderRadius: "50%", background: "rgba(26,115,232,0.12)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(26,115,232,0.2)", border: "1px solid rgba(96,165,250,0.35)", borderRadius: 50, padding: "5px 14px", marginBottom: 14 }}>
            <FaCar size={11} style={{ color: "#60a5fa" }} />
            <span style={{ color: "#93c5fd", fontSize: "0.72rem", fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" }}>Showroom</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: "2.6rem", fontWeight: 800, margin: "0 0 10px", letterSpacing: "-1px" }}>
            Tất cả xe <span style={{ color: "#60a5fa" }}>tại showroom</span>
          </h1>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
            Khám phá {totalElements} mẫu xe đang có — mới & qua sử dụng
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>

        {/* Filter Bar */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", margin: "28px 0 24px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <form onSubmit={handleSearch} style={{ flex: 2, minWidth: 200, display: "flex", gap: 8 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <FaSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 12 }} />
              <Form.Control type="text" placeholder="Tìm theo tên xe..." value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                style={{ paddingLeft: 36, borderRadius: 10, border: "1px solid #e2e8f0", height: 44, fontSize: "0.88rem" }} />
            </div>
            <Button type="submit" style={{ background: "#1a73e8", border: "none", borderRadius: 10, height: 44, paddingInline: 18, fontWeight: 700, flexShrink: 0 }}>
              <FaSearch size={13} />
            </Button>
          </form>

          <Form.Select value={selectedBranch} onChange={e => { setSelectedBranch(e.target.value); setPage(1); }}
            style={{ flex: 1, minWidth: 130, borderRadius: 10, border: "1px solid #e2e8f0", height: 44, fontSize: "0.88rem", color: selectedBranch ? "#1e293b" : "#94a3b8" }}>
            <option value="">Thương hiệu</option>
            {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
          </Form.Select>

          <Form.Select value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setPage(1); }}
            style={{ flex: 1, minWidth: 130, borderRadius: 10, border: "1px solid #e2e8f0", height: 44, fontSize: "0.88rem", color: selectedCategory ? "#1e293b" : "#94a3b8" }}>
            <option value="">Phân khúc</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </Form.Select>

          <Form.Select value={selectedPrice} onChange={e => { setSelectedPrice(e.target.value); setPage(1); }}
            style={{ flex: 1, minWidth: 145, borderRadius: 10, border: "1px solid #e2e8f0", height: 44, fontSize: "0.88rem", color: selectedPrice ? "#1e293b" : "#94a3b8" }}>
            <option value="">Khoảng giá</option>
            <option value="500000000">Dưới 500 triệu</option>
            <option value="800000000">Dưới 800 triệu</option>
            <option value="1000000000">Dưới 1 tỷ</option>
            <option value="2000000000">Dưới 2 tỷ</option>
            <option value="5000000000">Dưới 5 tỷ</option>
          </Form.Select>

          {hasActiveFilter && (
            <Button onClick={handleReset}
              style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 10, height: 44, paddingInline: 14, color: "#64748b", fontWeight: 600, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <FaTimes size={11} /> Xoá lọc
            </Button>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ color: "#64748b", fontSize: "0.88rem" }}>
            {loading ? "Đang tải..." : <>Hiển thị <b style={{ color: "#1e293b" }}>{cars.length}</b> trong <b style={{ color: "#1e293b" }}>{totalElements}</b> xe{totalPages > 1 ? ` · Trang ${page}/${totalPages}` : ""}</>}
          </span>
          <Link to="/" style={{ color: "#1a73e8", fontWeight: 600, fontSize: "0.88rem", textDecoration: "none" }}>
            ← Trang chủ
          </Link>
        </div>

        {/* Car Grid */}
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
              const used = isUsed(car);

              return (
                <Col key={car.id} md={6} lg={4}>
                  <Card style={{ border: "none", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", height: "100%", background: "#fff", transition: "transform 0.25s, box-shadow 0.25s", cursor: "pointer" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 14px 36px rgba(0,0,0,0.13)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)"; }}
                    onClick={() => window.location.href = `/get-car-by-id/${car.id}`}>

                    {/* Thumbnail */}
                    <div style={{ position: "relative", height: 210, overflow: "hidden", background: "#f1f5f9" }}>
                      <img
                        src={car.thumbnail || "https://via.placeholder.com/400x240?text=No+Image"}
                        alt={name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.45s" }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                      />
                      {/* Badges top-left */}
                      <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
                        <Badge style={{ background: used ? "#f59e0b" : "#10b981", fontSize: "0.68rem", fontWeight: 700, borderRadius: 6, padding: "4px 9px", letterSpacing: 0.5 }}>
                          {used ? "ĐÃ QUA SỬ DỤNG" : "XE MỚI"}
                        </Badge>
                        {category && (
                          <Badge style={{ background: "rgba(15,23,42,0.65)", fontSize: "0.68rem", fontWeight: 600, borderRadius: 6, padding: "4px 9px", backdropFilter: "blur(4px)" }}>
                            {category}
                          </Badge>
                        )}
                      </div>
                      {/* Color chip */}
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
                          <span>{car.manufacturingYear || "2024"}</span>
                        </div>
                        {used ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#475569", fontSize: "0.8rem" }}>
                            <FaTachometerAlt size={12} style={{ color: "#f59e0b", flexShrink: 0 }} />
                            <span>{car.mileage?.toLocaleString()} km</span>
                          </div>
                        ) : engine ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#475569", fontSize: "0.8rem", overflow: "hidden" }}>
                            <FaCar size={12} style={{ color: "#1a73e8", flexShrink: 0 }} />
                            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{engine}</span>
                          </div>
                        ) : null}
                      </div>

                      <Button as={Link} to={`/get-car-by-id/${car.id}`}
                        onClick={e => e.stopPropagation()}
                        style={{ width: "100%", background: "linear-gradient(135deg, #1a73e8, #0056b3)", border: "none", borderRadius: 10, fontWeight: 700, padding: "11px", fontSize: "0.9rem" }}>
                        Xem chi tiết →
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}

        {renderPagination()}
        <div style={{ height: 64 }} />
      </div>
    </div>
  );
}
