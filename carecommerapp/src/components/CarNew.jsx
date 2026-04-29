import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Spinner, Container, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaRegCalendarAlt, FaCarSide, FaBolt, FaGasPump } from "react-icons/fa";
import { GiCarSeat } from "react-icons/gi";
import axios, { endpoints } from "../configs/APIs";

export default function CarSection() {
  const [cars, setCars] = useState([]);
  const [carPage, setCarPage] = useState(1);
  const [carTotalPages, setCarTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [fuelType, setFuelType] = useState("Xăng");
  const [selectedBrands, setSelectedBrands] = useState(["BMW"]);
  const [priceRange, setPriceRange] = useState(80);

  useEffect(() => {
    fetchCars(carPage);
  }, [carPage]);

  const fetchCars = async (pageNum) => {
    try {
      setLoading(true);
      
      const res = await axios.get(endpoints["get-products"](pageNum, 12));
      const resData = res.data?.result || {};
      const fetchedCars = Array.isArray(resData.data) ? resData.data.map(car => ({
        id: car.id,
        brand: "CAR SHOP",
        name: car.name,
        price: car.price,
        year: 2024,
        seats: car.seatCapacity ? `${car.seatCapacity} Chỗ` : "5 Chỗ",
        engine: car.engineSize || "1.8L",
        fuel: car.fuelType || "Xăng",
        status: "XE MỚI",
        statusColor: "#1a73e8",
        image: car.thumbnail || "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop"
      })) : [];

      setCars(fetchedCars);
      setCarTotalPages(resData.totalPages || 1);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching cars:", err);
      setError("Không thể tải danh sách xe. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  const handleCarPageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= carTotalPages) {
      setCarPage(pageNum);
    }
  };



  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", paddingTop: "100px", paddingBottom: "60px", fontFamily: "'Montserrat', 'Roboto', sans-serif" }}>
      
      <style>{`
        .custom-checkbox input:checked {
          background-color: #1a73e8;
          border-color: #1a73e8;
        }
      `}</style>

      <Container style={{ maxWidth: "1350px" }}>
        <Row>
          {/* LEFT SIDEBAR: FILTER */}
          <Col lg={3} md={4} style={{ borderRight: "1px solid #e7e8e9", paddingRight: "30px" }}>
            <h5 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#5d6571", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "30px", paddingBottom: "15px", borderBottom: "1px solid #e7e8e9" }}>Bộ Lọc Tìm Kiếm</h5>
            
            <div className="mb-4">
              <label style={{ fontSize: "0.95rem", fontWeight: 700, color: "#191c1d", marginBottom: "15px", display: "block" }}>Thương hiệu</label>
              {['Mercedes-Benz', 'BMW', 'Porsche', 'Audi'].map(brand => (
                <Form.Check 
                  key={brand}
                  type="checkbox"
                  label={brand}
                  id={`brand-${brand}`}
                  checked={selectedBrands.includes(brand)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedBrands([...selectedBrands, brand]);
                    else setSelectedBrands(selectedBrands.filter(b => b !== brand));
                  }}
                  style={{ marginBottom: "12px", color: selectedBrands.includes(brand) ? "#1a73e8" : "#5d6571", fontWeight: selectedBrands.includes(brand) ? 600 : 400 }}
                  className="custom-checkbox"
                />
              ))}
            </div>

            <div className="mb-4">
              <label style={{ fontSize: "0.95rem", fontWeight: 700, color: "#191c1d", marginBottom: "15px", display: "block" }}>Dòng xe</label>
              <Form.Select style={{ background: "#f8f9fa", border: "1px solid #e7e8e9", borderRadius: "4px", boxShadow: "none", padding: "12px", fontSize: "0.9rem", color: "#5d6571" }}>
                <option>Tất cả dòng xe</option>
                <option>Sedan</option>
                <option>SUV</option>
                <option>Coupe</option>
              </Form.Select>
            </div>

            <div className="mb-4">
              <label style={{ fontSize: "0.95rem", fontWeight: 700, color: "#191c1d", marginBottom: "15px", display: "flex", justifyContent: "space-between" }}>
                <span>Khoảng giá (VND)</span>
                <span style={{ color: "#1a73e8" }}>Dưới {(priceRange / 10).toFixed(1)} Tỷ</span>
              </label>
              <Form.Range 
                style={{ width: "100%", accentColor: "#1a73e8" }} 
                min={15} 
                max={80} 
                value={priceRange} 
                onChange={(e) => setPriceRange(e.target.value)} 
              />
              <div className="d-flex justify-content-between mt-2" style={{ fontSize: "0.75rem", color: "#8c949c", fontWeight: 600 }}>
                <span>1.5 Tỷ</span>
                <span>8.0 Tỷ</span>
              </div>
            </div>

            <div className="mb-5">
              <label style={{ fontSize: "0.95rem", fontWeight: 700, color: "#191c1d", marginBottom: "15px", display: "block" }}>Loại nhiên liệu</label>
              <Row className="g-2">
                {['Xăng', 'Điện', 'Hybrid', 'Diesel'].map(type => (
                  <Col xs={6} key={type}>
                    <Button 
                      variant={fuelType === type ? "primary" : "outline-light"} 
                      onClick={() => setFuelType(type)}
                      style={{ 
                        width: "100%", 
                        border: fuelType === type ? "none" : "1px solid #e7e8e9",
                        backgroundColor: fuelType === type ? "#1a73e8" : "#ffffff",
                        color: fuelType === type ? "#ffffff" : "#191c1d",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        padding: "10px 0"
                      }}
                    >
                      {type}
                    </Button>
                  </Col>
                ))}
              </Row>
            </div>

            <Button style={{ width: "100%", background: "#191c1d", color: "#ffffff", border: "none", padding: "14px", fontWeight: 700, borderRadius: "4px", fontSize: "0.9rem", letterSpacing: "0.5px" }}>ÁP DỤNG BỘ LỌC</Button>

          </Col>

          {/* RIGHT CONTENT: CARS */}
          <Col lg={9} md={8} style={{ paddingLeft: "40px" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px", borderBottom: "1px solid #e7e8e9", paddingBottom: "20px" }}>
              <div>
                <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#191c1d", marginBottom: "8px", letterSpacing: "-1px" }}>Danh Mục Xe Mới</h1>
                <p style={{ color: "#5d6571", fontSize: "1rem", margin: 0 }}>Khám phá những mẫu xe sang trọng nhất phiên bản 2024 & 2025.</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "0.9rem", color: "#8c949c", fontWeight: 500 }}>Sắp xếp theo:</span>
                <Form.Select style={{ border: "none", background: "transparent", fontWeight: 700, color: "#1a73e8", boxShadow: "none", width: "auto", cursor: "pointer", paddingRight: "30px" }}>
                  <option>Mới nhất</option>
                  <option>Giá tăng dần</option>
                  <option>Giá giảm dần</option>
                </Form.Select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5"><Spinner animation="border" style={{ color: "#1a73e8" }} /></div>
            ) : error ? (
              <div className="text-center py-5 text-danger">{error}</div>
            ) : (
              <>
                <Row className="g-4">
                  {cars.map((car) => (
                    <Col lg={6} key={car.id}>
                      <Card style={{ border: "1px solid #e7e8e9", borderRadius: "8px", overflow: "hidden", boxShadow: "none", height: "100%", backgroundColor: "#ffffff" }}>
                        <div style={{ position: "relative", height: "260px", backgroundColor: "#f1f5f9", cursor: "pointer" }} onClick={() => window.location.href = `/get-car-by-id/${car.id}`}>
                          {car.status && (
                            <span style={{ position: "absolute", top: "15px", left: "15px", backgroundColor: car.statusColor, color: "white", padding: "6px 12px", fontSize: "0.75rem", fontWeight: 700, borderRadius: "4px", zIndex: 2, letterSpacing: "1px" }}>
                              {car.status}
                            </span>
                          )}
                          <Card.Img src={car.image} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }} onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"} />
                        </div>

                        <Card.Body style={{ padding: "30px 24px" }}>
                          <div style={{ marginBottom: "24px" }}>
                            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#8c949c", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>{car.brand}</div>
                            <Card.Title as={Link} to={`/get-car-by-id/${car.id}`} style={{ fontSize: "1.4rem", fontWeight: 800, color: "#191c1d", margin: 0, letterSpacing: "-0.5px", marginBottom: "6px", textDecoration: "none", display: "block" }}>{car.name}</Card.Title>
                            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "red" }}>{car.price ? car.price.toLocaleString("vi-VN") + " VND" : "Liên hệ"}</div>
                          </div>

                          <div style={{ backgroundColor: "#f8f9fa", borderRadius: "4px", padding: "16px", display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
                            <div style={{ textAlign: "center", color: "#5d6571", minWidth: "50px" }}>
                              <FaRegCalendarAlt size={18} style={{ color: "#191c1d", marginBottom: "8px" }} />
                              <div style={{ fontSize: "0.75rem", fontWeight: 600 }}>{car.year}</div>
                            </div>
                            <div style={{ borderLeft: "1px solid #e7e8e9" }}></div>
                            <div style={{ textAlign: "center", color: "#5d6571", minWidth: "50px" }}>
                              <GiCarSeat size={18} style={{ color: "#191c1d", marginBottom: "8px" }} />
                              <div style={{ fontSize: "0.75rem", fontWeight: 600 }}>{car.seats}</div>
                            </div>
                            <div style={{ borderLeft: "1px solid #e7e8e9" }}></div>
                            <div style={{ textAlign: "center", color: "#5d6571", minWidth: "50px" }}>
                              <FaBolt size={18} style={{ color: "#191c1d", marginBottom: "8px" }} />
                              <div style={{ fontSize: "0.75rem", fontWeight: 600 }}>{car.engine}</div>
                            </div>
                            <div style={{ borderLeft: "1px solid #e7e8e9" }}></div>
                            <div style={{ textAlign: "center", color: "#5d6571", minWidth: "50px" }}>
                              <FaGasPump size={18} style={{ color: "#191c1d", marginBottom: "8px" }} />
                              <div style={{ fontSize: "0.75rem", fontWeight: 600 }}>{car.fuel}</div>
                            </div>
                          </div>

                          <Row className="g-3">
                            <Col xs={12}>
                              <Button as={Link} to={`/get-car-by-id/${car.id}`} style={{ width: "100%", background: "#1a73e8", color: "#ffffff", border: "none", padding: "14px 0", fontWeight: 700, borderRadius: "4px", fontSize: "1rem" }}>Xem chi tiết</Button>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {carTotalPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "60px" }}>
                    <Button onClick={() => handleCarPageChange(carPage - 1)} disabled={carPage === 1} style={{ background: "#f8f9fa", color: "#191c1d", border: "none", borderRadius: "4px", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "none" }}><FaChevronLeft size={12} /></Button>
                    {Array.from({ length: Math.min(5, carTotalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      return (
                        <Button key={pageNum} onClick={() => handleCarPageChange(pageNum)} style={{ background: carPage === pageNum ? "#1a73e8" : "#f8f9fa", color: carPage === pageNum ? "#ffffff" : "#191c1d", border: "none", borderRadius: "4px", width: "40px", height: "40px", fontWeight: 600, boxShadow: "none", fontSize: "0.9rem" }}>{pageNum}</Button>
                      );
                    })}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "40px", color: "#8c949c", fontWeight: 700 }}>...</span>
                    <Button onClick={() => handleCarPageChange(8)} style={{ background: "#f8f9fa", color: "#191c1d", border: "none", borderRadius: "4px", width: "40px", height: "40px", fontWeight: 600, boxShadow: "none" }}>8</Button>
                    <Button onClick={() => handleCarPageChange(carPage + 1)} disabled={carPage === 8} style={{ background: "#f8f9fa", color: "#191c1d", border: "none", borderRadius: "4px", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "none" }}><FaChevronRight size={12} /></Button>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
