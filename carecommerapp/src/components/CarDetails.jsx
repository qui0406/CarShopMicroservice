import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Container, Row, Col, Spinner, Button, Offcanvas, Form } from "react-bootstrap";
import { FaCheckCircle, FaGasPump, FaCalendarAlt, FaTachometerAlt, FaCube, FaBolt, FaWrench } from "react-icons/fa";
import { LuSettings2 } from "react-icons/lu";
import { MdOutlineLocalGasStation, MdOutlineFileDownload } from "react-icons/md";
import { BiCube, BiCheckShield } from "react-icons/bi";
import axios, { endpoints } from "./../configs/APIs";
import { MyUserContext } from "./../configs/MyContexts";

export default function CarDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [carImages, setCarImages] = useState([]);
  const user = useContext(MyUserContext);

  const fetchCarDetails = async () => {
    try {
      setLoading(true);
      
      // Mock Data chuẩn form mới nhất
      const mockResponse = {
        id: "CAR-15565",
        name: "PORSCHE 911 GT3",
        price: 18500000000,
        manufacturingYear: 2024,
        isUsed: false,
        mileage: 1240,
        vinNumber: "WP0AA2A9XPS2",
        color: "Trắng (White)",
        inspectionReportUrl: "#",
        model3dUrl: "#",
        technicalSpec: {
          engine: "4.0L Box-6",
          transmission: "7-Speed PDK",
          fuelType: "Gasoline",
          horsepower: 502,
          torque: 470,
          displacement: 3996,
          length: 4573,
          topSpeed: 318
        },
        equipment: {
          hasAirConditioning: true,
          screenType: "10.9-inch",
          seatMaterial: "Alcantara Seats",
          speakerSystem: "Bose Sound",
          sunRoof: "",
          wirelessCharge: false,
          electricTrunk: false,
          hasBluetooth: true,
          hasGps: true,
          headlampType: "LED Matrix",
          smartKey: true,
          electricMirror: true,
          hasAirbags: true,
          electronicStability: true,
          laneKeepAssist: false,
          hasCamera: true,
          parkingSensor: true
        },
        images: [
          "https://images.unsplash.com/photo-1503376710356-6cb021d7bfa0?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1582239401831-50eef37a4db7?q=80&w=2070&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=2000&auto=format&fit=crop"
        ]
      };

      setTimeout(() => {
        setCar(mockResponse);
        setCarImages(mockResponse.images || []);
        setLoading(false);
      }, 800);

    } catch (error) {
      console.error("Error fetching car details:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + " đ";
  };

  const handleBookNow = () => {
    sessionStorage.setItem("car", JSON.stringify(car));

    if (!user) {
      navigate(`/login?next=/reserve/${car.id}`, { state: { car } });
    } else {
      navigate(`/reserve/${car.id}`, { state: { car } });
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8f9fa", paddingTop: "80px" }}>
        <Spinner animation="border" style={{ color: "#0056b3", width: "3rem", height: "3rem" }} />
      </div>
    );
  }

  if (!car) return null;

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh", paddingTop: "80px", paddingBottom: "100px", fontFamily: "'Inter', 'Roboto', sans-serif" }}>
      <Container style={{ maxWidth: "800px" }}> {/* Cố tình thu gọn để giống tỷ lệ màn hình dọc tinh tế */}
        
        {/* GALLERY */}
        <div style={{ position: "relative", marginBottom: "16px", borderRadius: "12px", overflow: "hidden", backgroundColor: "#1e1e1e", padding: "40px 0" }}>
          <span style={{ position: "absolute", top: "16px", left: "16px", backgroundColor: "#0056b3", color: "#fff", padding: "4px 12px", fontSize: "0.75rem", fontWeight: 800, borderRadius: "4px", zIndex: 2 }}>
            {car.isUsed ? "USED" : "NEW"}
          </span>
          <img src={carImages[selectedImage]} alt={car.name} style={{ width: "100%", height: "250px", objectFit: "cover" }} />
        </div>

        {/* THUMBNAILS */}
        <div style={{ display: "flex", gap: "12px", overflowX: "auto", marginBottom: "32px" }}>
          {carImages.map((img, index) => (
            <div
              key={index}
              onClick={() => setSelectedImage(index)}
              style={{
                width: "80px", height: "60px", borderRadius: "8px", overflow: "hidden", cursor: "pointer", flexShrink: 0,
                border: selectedImage === index ? "2px solid #0056b3" : "1px solid #e0e0e0",
                opacity: selectedImage === index ? 1 : 0.6
              }}
            >
              <img src={img} alt="thumb" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>

        {/* HEADER OVERVIEW */}
        <div style={{ display: "flex", gap: "16px", fontSize: "0.75rem", fontWeight: 700, color: "#0056b3", marginBottom: "12px", textTransform: "uppercase" }}>
          <span>ID #{car.id}</span>
          <span>VIN {car.vinNumber}</span>
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, color: "#111", lineHeight: 1.1, margin: "0 0 12px 0", textTransform: "uppercase" }}>
          {car.name}
        </h1>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#0056b3", margin: "0 0 24px 0" }}>
          {formatPrice(car.price)}
        </h2>

        {/* ACTIONS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
          <Button onClick={handleBookNow} style={{ width: "100%", background: "#0056b3", border: "none", padding: "14px", fontWeight: 700, borderRadius: "8px", fontSize: "1rem" }}>
            Liên hệ ngay
          </Button>
          <Button onClick={() => setShowSchedule(true)} style={{ width: "100%", background: "#111", color: "#fff", border: "none", padding: "14px", fontWeight: 700, borderRadius: "8px", fontSize: "1rem" }}>
            Đặt lịch xem xe
          </Button>
          <Button as={Link} to={`/quotation/${car.id}`} style={{ width: "100%", background: "#f0f7ff", color: "#0056b3", border: "none", padding: "14px", fontWeight: 700, borderRadius: "8px", fontSize: "1rem" }}>
            Xem báo giá chi tiết
          </Button>
          <Button style={{ width: "100%", background: "#ffffff", color: "#0056b3", border: "1px solid #0056b3", padding: "14px", fontWeight: 700, borderRadius: "8px", fontSize: "1rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
            <BiCube size={20}/> Xem mô hình 3D
          </Button>
        </div>

        {/* INSPECTION WIDGET */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8f9fa", padding: "16px", borderRadius: "8px", marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <BiCheckShield size={24} color="#0056b3" />
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#111" }}>Xe đã qua kiểm định<br/>chuyên sâu</span>
          </div>
          <a href={car.inspectionReportUrl} style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0056b3", textDecoration: "underline" }}>Tải báo cáo</a>
        </div>

        {/* KEY SPECS GRID */}
        <Row className="g-3" style={{ marginBottom: "40px" }}>
          <Col xs={6}>
            <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "8px", textAlign: "center", height: "100%" }}>
              <FaCalendarAlt size={20} color="#555" style={{ marginBottom: "8px" }} />
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#555", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Year</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111" }}>{car.manufacturingYear}</div>
            </div>
          </Col>
          <Col xs={6}>
            <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "8px", textAlign: "center", height: "100%" }}>
              <FaTachometerAlt size={20} color="#555" style={{ marginBottom: "8px" }} />
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#555", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Odo</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111" }}>{car.mileage.toLocaleString('vi-VN')} km</div>
            </div>
          </Col>
          <Col xs={6}>
            <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "8px", textAlign: "center", height: "100%" }}>
              <MdOutlineLocalGasStation size={24} color="#555" style={{ marginBottom: "8px" }} />
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#555", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Fuel</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111" }}>{car.technicalSpec.fuelType}</div>
            </div>
          </Col>
          <Col xs={6}>
            <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "8px", textAlign: "center", height: "100%" }}>
              <LuSettings2 size={24} color="#555" style={{ marginBottom: "8px" }} />
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#555", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Transmission</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111" }}>{car.technicalSpec.transmission}</div>
            </div>
          </Col>
        </Row>

        {/* TECH SPECS */}
        <h3 style={{ fontSize: "1rem", fontWeight: 900, color: "#111", display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", textTransform: "uppercase" }}>
          <div style={{ width: "4px", height: "16px", background: "#0056b3" }}></div> TECH SPECS
        </h3>
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #eaeaea" }}>
             <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
               <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: "1px" }}>Engine</span>
             </div>
             <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#111" }}>{car.technicalSpec.engine}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #eaeaea" }}>
             <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
               <FaBolt color="#666" size={14}/>
               <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: "1px" }}>Power</span>
             </div>
             <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#111" }}>{car.technicalSpec.horsepower} HP</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #eaeaea" }}>
             <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
               <FaWrench color="#666" size={14}/>
               <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: "1px" }}>Torque</span>
             </div>
             <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#111" }}>{car.technicalSpec.torque} Nm</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #eaeaea" }}>
             <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
               <FaTachometerAlt color="#666" size={14}/>
               <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: "1px" }}>Top Speed</span>
             </div>
             <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#111" }}>{car.technicalSpec.topSpeed} km/h</div>
          </div>
        </div>

        {/* EQUIPMENT */}
        <h3 style={{ fontSize: "1rem", fontWeight: 900, color: "#111", display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", textTransform: "uppercase" }}>
          <div style={{ width: "4px", height: "16px", background: "#0056b3" }}></div> EQUIPMENT
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "40px" }}>
          {car.equipment.hasAirConditioning && <div style={{ background: "#f8f9fa", padding: "10px 16px", borderRadius: "100px", fontSize: "0.85rem", fontWeight: 600, color: "#111", display: "flex", alignItems: "center", gap: "6px" }}><FaCheckCircle color="#0056b3" size={14}/> Air Conditioning</div>}
          {car.equipment.seatMaterial && <div style={{ background: "#f8f9fa", padding: "10px 16px", borderRadius: "100px", fontSize: "0.85rem", fontWeight: 600, color: "#111", display: "flex", alignItems: "center", gap: "6px" }}><FaCheckCircle color="#0056b3" size={14}/> {car.equipment.seatMaterial}</div>}
          {car.equipment.speakerSystem && <div style={{ background: "#f8f9fa", padding: "10px 16px", borderRadius: "100px", fontSize: "0.85rem", fontWeight: 600, color: "#111", display: "flex", alignItems: "center", gap: "6px" }}><FaCheckCircle color="#0056b3" size={14}/> {car.equipment.speakerSystem}</div>}
          {car.equipment.smartKey && <div style={{ background: "#f8f9fa", padding: "10px 16px", borderRadius: "100px", fontSize: "0.85rem", fontWeight: 600, color: "#111", display: "flex", alignItems: "center", gap: "6px" }}><FaCheckCircle color="#0056b3" size={14}/> Smart Key</div>}
          {car.equipment.hasBluetooth && <div style={{ background: "#f8f9fa", padding: "10px 16px", borderRadius: "100px", fontSize: "0.85rem", fontWeight: 600, color: "#111", display: "flex", alignItems: "center", gap: "6px" }}><FaCheckCircle color="#0056b3" size={14}/> Bluetooth</div>}
          <div style={{ background: "#f8f9fa", padding: "10px 16px", borderRadius: "100px", fontSize: "0.85rem", fontWeight: 600, color: "#111", display: "flex", alignItems: "center", gap: "6px" }}><FaCheckCircle color="#0056b3" size={14}/> PDK Transmission</div>
        </div>

        {/* 3D WIDGET EXPERIENCE */}
        <h3 style={{ fontSize: "1rem", fontWeight: 900, color: "#111", display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", textTransform: "uppercase" }}>
          <div style={{ width: "4px", height: "16px", background: "#0056b3" }}></div> INTERACTIVE 3D EXPERIENCE
        </h3>
        <div style={{ background: "#f1f5f9", borderRadius: "12px", textAlign: "center", padding: "40px 20px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-20px", left: "50%", transform: "translateX(-50%)", width: "60px", height: "60px", backgroundColor: "#fff", borderRadius: "50%", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: "10px", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
            <BiCube color="#0056b3" size={24}/>
          </div>
          <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111", marginTop: "10px", marginBottom: "12px" }}>Initialize 3D Configuration</h4>
          <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.5, marginBottom: "20px", maxWidth: "400px", margin: "0 auto 20px" }}>
            Explore every detail of the GT3 cockpit and exterior in immersive 360-degree high-fidelity. <span style={{ color: "#0056b3", fontWeight: 800, fontSize: "0.7rem", verticalAlign: "top", marginLeft: "4px" }}>RENDER: 4K RT</span>
          </p>
          <Button style={{ background: "#0056b3", border: "none", padding: "12px 30px", fontWeight: 700, borderRadius: "100px", fontSize: "0.9rem" }}>
            Start Interactive
          </Button>
        </div>

      </Container>

      {/* MODAL ĐẶT LỊCH XEM XE (BOTTOM OFFCANVAS) */}
      <Offcanvas placement="bottom" show={showSchedule} onHide={() => setShowSchedule(false)} style={{ borderTopLeftRadius: "24px", borderTopRightRadius: "24px", height: "auto", minHeight: "50vh", padding: "10px 0 30px" }}>
        {/* Handlebar */}
        <div style={{ width: "40px", height: "5px", backgroundColor: "#e0e0e0", borderRadius: "100px", margin: "10px auto 16px" }}></div>
        
        <Offcanvas.Header style={{ padding: "0 24px 16px", borderBottom: "none" }}>
          <Offcanvas.Title style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0056b3", margin: 0 }}>
            Đặt lịch xem {car.name}
          </Offcanvas.Title>
        </Offcanvas.Header>
        
        <Offcanvas.Body style={{ padding: "0 24px" }}>
          <Form>
            {/* Ngày và Giờ */}
            <Row className="g-3 mb-4">
              <Col xs={6}>
                <Form.Select style={{ backgroundColor: "#f4f4f5", border: "none", padding: "14px", borderRadius: "8px", fontWeight: 600, color: "#444" }}>
                  <option>Hôm nay</option>
                  <option>Ngày mai</option>
                  <option>Trong tuần này</option>
                </Form.Select>
              </Col>
              <Col xs={6}>
                <Form.Select style={{ backgroundColor: "#f4f4f5", border: "none", padding: "14px", borderRadius: "8px", fontWeight: 600, color: "#444" }}>
                  <option>09:00 - 11:00</option>
                  <option>13:00 - 15:00</option>
                  <option>15:00 - 17:00</option>
                </Form.Select>
              </Col>
            </Row>

            {/* Thông tin */}
            <div className="mb-4">
              <Form.Control type="text" placeholder="Họ và tên của bạn" style={{ backgroundColor: "#f4f4f5", border: "none", padding: "14px", borderRadius: "8px", fontWeight: 600, color: "#111", marginBottom: "12px" }} />
              <Form.Control type="tel" placeholder="Số điện thoại" style={{ backgroundColor: "#f4f4f5", border: "none", padding: "14px", borderRadius: "8px", fontWeight: 600, color: "#111", marginBottom: "12px" }} />
              <Form.Control type="text" placeholder="Ghi chú: Lái thử, xem tại nhà..." style={{ backgroundColor: "#f4f4f5", border: "none", padding: "14px", borderRadius: "8px", fontWeight: 600, color: "#111" }} />
            </div>

            {/* Nút Submit */}
            <Button style={{ width: "100%", background: "#0056b3", border: "none", padding: "16px", fontWeight: 800, borderRadius: "12px", fontSize: "1.05rem", textTransform: "uppercase", letterSpacing: "1px" }} onClick={() => {
              alert("Đã gửi yêu cầu đặt lịch thành công!");
              setShowSchedule(false);
            }}>
              Gửi yêu cầu đặt lịch
            </Button>
            <div style={{ textAlign: "center", fontSize: "0.75rem", color: "#666", marginTop: "16px", fontWeight: 500 }}>
              Yêu cầu của bạn sẽ được nhân viên phản hồi và duyệt trong 15 phút.
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>

    </div>
  );
}

