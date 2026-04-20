import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Spinner, Container, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaRegCalendarAlt, FaGasPump, FaTachometerAlt, FaCog, FaUndo } from "react-icons/fa";
import axios, { endpoints } from "../configs/APIs";

export default function CarOldSection() {
  const [cars, setCars] = useState([]);
  const [carPage, setCarPage] = useState(1);
  const [carTotalPages, setCarTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [priceRange, setPriceRange] = useState(50);

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
        name: car.name,
        subtitle: `MODEL 2023 • SIÊU LƯỚT`,
        price: car.price ? car.price.toLocaleString("vi-VN") + " VND" : "Liên hệ",
        odo: "10,000 KM",
        year: "2023",
        transmission: "AUTO",
        fuel: car.fuelType || "GASOLINE",
        badge: "XE LƯỚT",
        image: car.thumbnail || "https://images.unsplash.com/photo-1503376710356-6cb021d7bfa0?q=80&w=2070&auto=format&fit=crop"
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
      
      <Container style={{ maxWidth: "1350px" }}>
        <Row>
          {/* LEFT SIDEBAR: FILTER */}
          <Col lg={3} md={4} style={{ borderRight: "1px solid #e7e8e9", paddingRight: "30px" }}>
            <h5 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#5d6571", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "30px", paddingBottom: "15px", borderBottom: "1px solid #e7e8e9" }}>Bộ Lọc Tìm Kiếm</h5>
            
            <div className="mb-4">
              <label style={{ fontSize: "0.95rem", fontWeight: 700, color: "#191c1d", marginBottom: "15px", display: "block" }}>Thương hiệu</label>
              <Form.Select style={{ background: "#f8f9fa", border: "1px solid #e7e8e9", borderRadius: "4px", boxShadow: "none", padding: "12px", fontSize: "0.9rem", color: "#5d6571", fontWeight: 500 }}>
                <option>Tất cả thương hiệu</option>
                <option>Mercedes-Benz</option>
                <option>BMW</option>
                <option>Porsche</option>
                <option>Audi</option>
              </Form.Select>
            </div>

            <div className="mb-4">
              <label style={{ fontSize: "0.95rem", fontWeight: 700, color: "#191c1d", marginBottom: "15px", display: "block" }}>Năm sản xuất</label>
              <div className="d-flex gap-2">
                <Form.Control type="text" placeholder="Từ" style={{ background: "#f8f9fa", border: "1px solid #e7e8e9", borderRadius: "4px", padding: "12px", fontSize: "0.9rem", boxShadow: "none" }} />
                <Form.Control type="text" placeholder="Đến" style={{ background: "#f8f9fa", border: "1px solid #e7e8e9", borderRadius: "4px", padding: "12px", fontSize: "0.9rem", boxShadow: "none" }} />
              </div>
            </div>

            <div className="mb-4">
              <label style={{ fontSize: "0.95rem", fontWeight: 700, color: "#191c1d", marginBottom: "15px", display: "block" }}>Số KM đã đi</label>
              <Form.Select style={{ background: "#f8f9fa", border: "1px solid #e7e8e9", borderRadius: "4px", boxShadow: "none", padding: "12px", fontSize: "0.9rem", color: "#5d6571", fontWeight: 500 }}>
                <option>Dưới 5,000 km</option>
                <option>Dưới 10,000 km</option>
                <option>Dưới 20,000 km</option>
                <option>Tất cả</option>
              </Form.Select>
            </div>

            <div className="mb-5">
              <label style={{ fontSize: "0.95rem", fontWeight: 700, color: "#191c1d", marginBottom: "15px", display: "flex", justifyContent: "space-between" }}>
                <span>Khoảng giá (Tỷ VNĐ)</span>
                <span style={{ color: "#1a73e8" }}>Dưới {(priceRange / 10).toFixed(1).replace(".0", "")} Tỷ</span>
              </label>
              <Form.Range 
                style={{ width: "100%", accentColor: "#1a73e8" }} 
                min={1} 
                max={50} 
                value={priceRange} 
                onChange={(e) => setPriceRange(e.target.value)} 
              />
              <div className="d-flex justify-content-between mt-2" style={{ fontSize: "0.75rem", color: "#8c949c", fontWeight: 600, textTransform: "uppercase" }}>
                <span>100 Triệu</span>
                <span>5 Tỷ</span>
              </div>
            </div>

            <Button style={{ width: "100%", background: "#191c1d", color: "#ffffff", border: "none", padding: "14px", fontWeight: 700, borderRadius: "4px", fontSize: "0.9rem", letterSpacing: "0.5px", marginBottom: "15px" }}>ÁP DỤNG BỘ LỌC</Button>
            
            <div style={{ textAlign: "center" }}>
              <Button variant="link" style={{ color: "#5d6571", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <FaUndo size={12} /> Đặt lại tìm kiếm
              </Button>
            </div>

          </Col>

          {/* RIGHT CONTENT: CARS */}
          <Col lg={9} md={8} style={{ paddingLeft: "40px" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px", borderBottom: "1px solid #e7e8e9", paddingBottom: "20px" }}>
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1a73e8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>PREMIUM PRE-OWNED</div>
                <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#191c1d", margin: 0, letterSpacing: "-1px" }}>Xe Lướt Tuyển Chọn</h1>
              </div>
              <div style={{ fontSize: "0.9rem", color: "#5d6571", paddingBottom: "5px" }}>
                Hiển thị <span style={{ fontWeight: 700, color: "#191c1d" }}>24</span> trên <span style={{ fontWeight: 700, color: "#191c1d" }}>156</span> xe có sẵn
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
                        <div style={{ position: "relative", height: "260px", backgroundColor: "#f1f5f9" }}>
                          {car.badge && (
                            <span style={{ position: "absolute", top: "15px", left: "15px", backgroundColor: "#ffffff", color: "#1a73e8", padding: "6px 12px", fontSize: "0.75rem", fontWeight: 800, borderRadius: "2px", zIndex: 2, letterSpacing: "1px" }}>
                              {car.badge}
                            </span>
                          )}
                          <Card.Img src={car.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>

                        <Card.Body style={{ padding: "30px 24px" }}>
                          <div style={{ marginBottom: "24px" }}>
                            <Card.Title style={{ fontSize: "1.4rem", fontWeight: 800, color: "#191c1d", margin: 0, letterSpacing: "-0.5px", marginBottom: "6px" }}>{car.name}</Card.Title>
                            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#8c949c", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>{car.subtitle}</div>
                            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "red" }}>{car.price}</div>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "28px", paddingBottom: "24px", borderBottom: "1px solid #f1f5f9" }}>
                            <div style={{ textAlign: "center", color: "#5d6571", minWidth: "50px" }}>
                              <FaTachometerAlt size={16} style={{ color: "#191c1d", marginBottom: "8px" }} />
                              <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>{car.odo}</div>
                            </div>
                            <div style={{ textAlign: "center", color: "#5d6571", minWidth: "50px" }}>
                              <FaRegCalendarAlt size={16} style={{ color: "#191c1d", marginBottom: "8px" }} />
                              <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>{car.year}</div>
                            </div>
                            <div style={{ textAlign: "center", color: "#5d6571", minWidth: "50px" }}>
                              <FaCog size={16} style={{ color: "#191c1d", marginBottom: "8px" }} />
                              <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>{car.transmission}</div>
                            </div>
                            <div style={{ textAlign: "center", color: "#5d6571", minWidth: "50px" }}>
                              <FaGasPump size={16} style={{ color: "#191c1d", marginBottom: "8px" }} />
                              <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>{car.fuel}</div>
                            </div>
                          </div>

                          <Row className="g-3">
                            <Col xs={6}>
                              <Button as={Link} to={`/get-car-by-id/${car.id}`} style={{ width: "100%", background: "#f8f9fa", color: "#191c1d", border: "1px solid #e7e8e9", padding: "12px 0", fontWeight: 700, borderRadius: "4px", fontSize: "0.85rem", letterSpacing: "0.5px" }}>CHI TIẾT</Button>
                            </Col>
                            <Col xs={6}>
                              <Button as={Link} to={`/get-car-by-id/${car.id}`} style={{ width: "100%", background: "#0b5ed7", color: "#ffffff", border: "none", padding: "12px 0", fontWeight: 700, borderRadius: "4px", fontSize: "0.85rem", letterSpacing: "0.5px" }}>ĐẶT LỊCH XEM</Button>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {carTotalPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "60px" }}>
                    <Button onClick={() => handleCarPageChange(carPage - 1)} disabled={carPage === 1} style={{ background: "#ffffff", color: "#191c1d", border: "none", borderRadius: "4px", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "none" }}><FaChevronLeft size={12} /></Button>
                    {Array.from({ length: Math.min(5, carTotalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      return (
                        <Button key={pageNum} onClick={() => handleCarPageChange(pageNum)} style={{ background: carPage === pageNum ? "#1a73e8" : "#ffffff", color: carPage === pageNum ? "#ffffff" : "#191c1d", border: "none", borderRadius: "4px", width: "40px", height: "40px", fontWeight: 600, boxShadow: "none", fontSize: "0.9rem" }}>{pageNum}</Button>
                      );
                    })}
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "40px", color: "#8c949c", fontWeight: 700 }}>...</span>
                    <Button onClick={() => handleCarPageChange(8)} style={{ background: "#ffffff", color: "#191c1d", border: "none", borderRadius: "4px", width: "40px", height: "40px", fontWeight: 600, boxShadow: "none" }}>8</Button>
                    <Button onClick={() => handleCarPageChange(carPage + 1)} disabled={carPage === 8} style={{ background: "#ffffff", color: "#191c1d", border: "none", borderRadius: "4px", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "none" }}><FaChevronRight size={12} /></Button>
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
