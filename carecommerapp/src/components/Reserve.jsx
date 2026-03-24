import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { FaUserAlt, FaCreditCard, FaCheckCircle, FaCarSide } from "react-icons/fa";
import { BsQrCode, BsCreditCard2Front, BsGlobe } from "react-icons/bs";
import axios, { authApis, endpoints } from "./../configs/APIs";

export default function Reserve() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [car, setCar] = useState(location.state?.car || null);
  const [loading, setLoading] = useState(!car);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    dob: "",
    cccd: "",
    quantity: 1
  });

  const [paymentMethod, setPaymentMethod] = useState("vnpay");

  useEffect(() => {
    const fetchCarDetails = async () => {
      const carId = id || location.state?.car?.id || new URLSearchParams(location.search).get("id");
      
      if (!carId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      // Giả lập delay mạng
      setTimeout(() => {
        const mockCar = {
          id: carId,
          name: "Porsche Taycan",
          subtitle: "Performance Plus Battery",
          price: 4260000000,
          color: "Ice Grey Metallic",
          manufacturingYear: 2024,
          images: [
            "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=1000&auto=format&fit=crop"
          ],
          equipment: {
            seatMaterial: "Black / Slate Grey",
            wheels: "21\" Mission E Design"
          },
          technicalSpec: {
            horsepower: "560"
          }
        };

        setCar(mockCar);
        setLoading(false);
      }, 600);
    };

    fetchCarDetails();
  }, [id, location, location.search]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phoneNumber || !formData.address || !formData.dob || !formData.cccd) {
      alert("Vui lòng nhập đầy đủ thông tin trước khi đặt cọc!");
      return;
    }

    // Giá xe thật
    const unitPrice = car?.price || 18500000000;
    const totalAmount = unitPrice * formData.quantity;

    const orders = {
      carId: car?.id || "CAR-15565",
      unitPrice: unitPrice,
      quantity: formData.quantity,
      orderDetailsRequest: {
        address: formData.address,
        fullName: formData.fullName,
        dob: formData.dob,
        cccd: formData.cccd,
        phoneNumber: formData.phoneNumber,
        unitPrice: unitPrice,
        quantity: formData.quantity,
        totalAmount: totalAmount,
      },
    };

    console.log("Submitting order:", orders);

    try {
      const response = await authApis().post(endpoints["create-orders"], orders);
      if (response.status === 200 || response.status === 201) {
        navigate("/confirm", { state: { car, orders: response.data.result } }); 
      } else {
        console.error("Error:", response.data);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Lỗi kết nối server!");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + " đ";
  };

  if (loading) {
    return (
      <Container className="my-5 text-center" style={{ paddingTop: "100px", minHeight: "100vh" }}>
        <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Đang tải thông tin xe...</span>
        </div>
      </Container>
    );
  }

  if (!car) {
    return (
      <Container className="my-5 text-center" style={{ paddingTop: "100px", minHeight: "100vh" }}>
        <h2>Không có thông tin xe</h2>
        <p>Vui lòng quay lại trang danh sách chọn xe.</p>
        <Button onClick={() => navigate("/home")} variant="primary">Quay lại Trang Chủ</Button>
      </Container>
    );
  }

  // Số tiền đặt cọc mô phỏng (theo Mockup)
  const depositAmount = 50000000;
  const carPrice = car?.price || 18500000000;

  return (
    <div style={{ backgroundColor: "#f8f9fc", minHeight: "100vh", paddingTop: "80px", paddingBottom: "100px", fontFamily: "'Inter', sans-serif" }}>
      <Container style={{ maxWidth: "1100px", paddingTop: "40px" }}>
        
        {/* TIÊU ĐỀ TRANG */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0056b3", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>Reservation Portal</div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900, color: "#111", textTransform: "uppercase", margin: 0 }}>ĐẶT CỌC TRỰC TUYẾN</h1>
          <div style={{ width: "80px", height: "4px", backgroundColor: "#0056b3", marginTop: "16px" }}></div>
        </div>

        <Row className="g-5">
          {/* CỘT TRÁI - FORM NHẬP XUẤT */}
          <Col lg={7}>
            {/* Box 1: Thông tin khách hàng */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "32px", marginBottom: "32px", boxShadow: "0 10px 40px rgba(0,0,0,0.03)" }}>
              <h4 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#111", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
                <FaUserAlt color="#0056b3" /> Thông tin khách hàng
              </h4>
              
              <Form>
                <Row className="g-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#444", textTransform: "uppercase" }}>Họ và Tên</Form.Label>
                      <Form.Control
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Nguyễn Văn A"
                        style={{ backgroundColor: "#f1f5f9", border: "none", padding: "14px", borderRadius: "8px", fontWeight: 600 }}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#444", textTransform: "uppercase" }}>Số điên thoại</Form.Label>
                      <Form.Control
                        type="text"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="090 123 4567"
                        style={{ backgroundColor: "#f1f5f9", border: "none", padding: "14px", borderRadius: "8px", fontWeight: 600 }}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#444", textTransform: "uppercase" }}>Số CCCD / Hộ Chiếu</Form.Label>
                      <Form.Control
                        type="text"
                        name="cccd"
                        value={formData.cccd}
                        onChange={handleChange}
                        placeholder="012345678901"
                        style={{ backgroundColor: "#f1f5f9", border: "none", padding: "14px", borderRadius: "8px", fontWeight: 600 }}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#444", textTransform: "uppercase" }}>Ngày sinh</Form.Label>
                      <Form.Control
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        style={{ backgroundColor: "#f1f5f9", border: "none", padding: "14px", borderRadius: "8px", fontWeight: 600, color: "#555" }}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#444", textTransform: "uppercase" }}>Địa chỉ thường trú</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Nhập địa chỉ chính xác của bạn"
                        style={{ backgroundColor: "#f1f5f9", border: "none", padding: "14px", borderRadius: "8px", fontWeight: 600 }}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </div>

            {/* Box 2: Phương thức thanh toán */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "32px", boxShadow: "0 10px 40px rgba(0,0,0,0.03)" }}>
              <h4 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#111", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px" }}>
                <FaCreditCard color="#0056b3" /> Phương thức thanh toán
              </h4>
              
              <Row className="g-3">
                <Col xs={4}>
                  <div 
                    onClick={() => setPaymentMethod("vnpay")}
                    style={{ border: paymentMethod === "vnpay" ? "2px solid #0056b3" : "1px solid #eaeaea", backgroundColor: paymentMethod === "vnpay" ? "#ffffff" : "#f8f9fc", padding: "24px 12px", borderRadius: "12px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
                  >
                    <BsQrCode size={28} color={paymentMethod === "vnpay" ? "#0056b3" : "#666"} style={{ marginBottom: "12px" }} />
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: paymentMethod === "vnpay" ? "#0056b3" : "#444" }}>VNPAY-QR</div>
                  </div>
                </Col>
                <Col xs={4}>
                  <div 
                    onClick={() => setPaymentMethod("atm")}
                    style={{ border: paymentMethod === "atm" ? "2px solid #0056b3" : "1px solid #eaeaea", backgroundColor: paymentMethod === "atm" ? "#ffffff" : "#f8f9fc", padding: "24px 12px", borderRadius: "12px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
                  >
                    <BsCreditCard2Front size={28} color={paymentMethod === "atm" ? "#0056b3" : "#666"} style={{ marginBottom: "12px" }} />
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: paymentMethod === "atm" ? "#0056b3" : "#444" }}>Thẻ ATM</div>
                  </div>
                </Col>
                <Col xs={4}>
                  <div 
                    onClick={() => setPaymentMethod("international")}
                    style={{ border: paymentMethod === "international" ? "2px solid #0056b3" : "1px solid #eaeaea", backgroundColor: paymentMethod === "international" ? "#ffffff" : "#f8f9fc", padding: "24px 12px", borderRadius: "12px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
                  >
                    <BsGlobe size={28} color={paymentMethod === "international" ? "#0056b3" : "#666"} style={{ marginBottom: "12px" }} />
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: paymentMethod === "international" ? "#0056b3" : "#444" }}>Thẻ Quốc tế</div>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>

          {/* CỘT PHẢI - THÔNG TIN ĐƠN & THANH TOÁN */}
          <Col lg={5}>
            
            {/* Box Tóm tắt xe */}
            <div style={{ backgroundColor: "#f1f5f9", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 900, color: "#111", margin: "0 0 4px 0" }}>{car?.name || car?.carModel || "Porsche Taycan"}</h3>
                  <div style={{ fontSize: "0.85rem", color: "#555" }}>{car?.subtitle || "Phiên bản cao cấp tiêu chuẩn"}</div>
                </div>
                <FaCarSide size={24} color="#0056b3" />
              </div>
              
              <img src={car?.images?.[0] || car?.image || "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=1000&auto=format&fit=crop"} alt="car" style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px", marginBottom: "24px" }} />
              
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "12px", borderBottom: "1px solid #e2e8f0", marginBottom: "12px", fontSize: "0.85rem", fontWeight: 700 }}>
                <span style={{ color: "#64748b", textTransform: "uppercase" }}>Màu ngoại thất</span>
                <span style={{ color: "#111" }}>{car?.color || "Ice Grey Metallic"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "12px", borderBottom: "1px solid #e2e8f0", marginBottom: "12px", fontSize: "0.85rem", fontWeight: 700 }}>
                <span style={{ color: "#64748b", textTransform: "uppercase" }}>Nội thất</span>
                <span style={{ color: "#111" }}>{car?.equipment?.seatMaterial || "Black / Slate Grey"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 700 }}>
                <span style={{ color: "#64748b", textTransform: "uppercase" }}>Năm sản xuất</span>
                <span style={{ color: "#111" }}>{car?.manufacturingYear || car?.year || "2024"}</span>
              </div>
            </div>

            {/* Box Đặt cọc (Màu xanh) */}
            <div style={{ backgroundColor: "#0056b3", borderRadius: "12px", padding: "32px", color: "#fff", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "24px", right: "24px", opacity: 0.1 }}>
                <FaCheckCircle size={100} />
              </div>

              <div style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Số tiền đặt cọc tối thiểu</div>
              <div style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "32px", display: "flex", alignItems: "center", gap: "10px" }}>
                {formatPrice(depositAmount)}
                <FaCheckCircle size={28} color="#60a5fa" />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "0.9rem" }}>
                <span style={{ opacity: 0.9 }}>Giá trị xe dự tính</span>
                <span style={{ fontWeight: 800 }}>{formatPrice(carPrice)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px", fontSize: "0.9rem" }}>
                <span style={{ opacity: 0.9 }}>Phí dịch vụ trực tuyến</span>
                <span style={{ fontWeight: 800 }}>Miễn phí</span>
              </div>

              <Button 
                onClick={handleSubmit} 
                style={{ width: "100%", backgroundColor: "#ffffff", color: "#0056b3", border: "none", padding: "16px", fontWeight: 800, borderRadius: "8px", fontSize: "1.1rem", textTransform: "uppercase", letterSpacing: "1px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
              >
                TIẾN HÀNH THANH TOÁN ➔
              </Button>

              <div style={{ fontSize: "0.65rem", textAlign: "center", marginTop: "20px", opacity: 0.7, lineHeight: 1.5, letterSpacing: "0.5px" }}>
                BẰNG VIỆC NHẤN ĐẶT CỌC, BẠN ĐỒNG Ý VỚI ĐIỀU KHOẢN VÀ CHÍNH SÁCH CỦA CHÚNG TÔI
              </div>
            </div>

            {/* Box mini stats */}
            <Row className="g-3 mt-3">
              <Col xs={6}>
                <div style={{ backgroundColor: "#f1f5f9", padding: "20px", borderRadius: "12px" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Tăng tốc 0-100km/h</div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "#111" }}>2.8 s</div>
                </div>
              </Col>
              <Col xs={6}>
                <div style={{ backgroundColor: "#f1f5f9", padding: "20px", borderRadius: "12px" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Công suất cực đại</div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "#111" }}>{car?.technicalSpec?.horsepower || "502"} HP</div>
                </div>
              </Col>
            </Row>

          </Col>
        </Row>
      </Container>
    </div>
  );
}