import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Container, Row, Col, Spinner, Button, Offcanvas, Form, Card, Modal } from "react-bootstrap";
import { FaCheckCircle, FaGasPump, FaCalendarAlt, FaTachometerAlt, FaCube, FaBolt, FaWrench, FaPhoneAlt, FaRegCalendarAlt, FaShareAlt, FaHeart, FaMapMarkerAlt, FaMedal } from "react-icons/fa";
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
  const [show3DModel, setShow3DModel] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [carImages, setCarImages] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const user = useContext(MyUserContext);

  const fetchCarDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(endpoints["get-car-by-id"](id));
      const resData = res.data?.result || res.data;
      setCar(resData);
      setCarImages(resData?.imageUrls?.length > 0 ? resData.imageUrls : (resData?.carModel?.thumbnailImage ? [resData.carModel.thumbnailImage] : []));
      setLoading(false);
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
    <div style={{ backgroundColor: "#f5f6f8", minHeight: "100vh", paddingTop: "80px", paddingBottom: "100px", fontFamily: "'Inter', sans-serif" }}>
      <Container style={{ maxWidth: "1250px" }}>

        {/* HEADER SECTION */}
        <Row className="mb-4">
          {/* LEFT SIDE: Images */}
          <Col lg={7}>
            <div style={{ position: "relative", marginBottom: "16px", borderRadius: "4px", overflow: "hidden", backgroundColor: "#000", height: "450px" }}>
              <div style={{ position: "absolute", top: "20px", left: "20px", backgroundColor: "#0a58ca", color: "#fff", padding: "6px 16px", fontSize: "0.85rem", fontWeight: 700, borderRadius: "4px", zIndex: 2 }}>
                Mdl - {car.manufacturingYear || "2026"}
              </div>
              <img src={carImages[selectedImage] || car?.carModel?.thumbnailImage || "https://via.placeholder.com/800x450?text=No+Image"} alt={car.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ display: "flex", gap: "12px", overflowX: "auto" }}>
              {carImages.map((img, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  style={{
                    width: "120px", height: "80px", borderRadius: "4px", overflow: "hidden", cursor: "pointer", flexShrink: 0,
                    border: selectedImage === index ? "2px solid #0a58ca" : "2px solid transparent",
                  }}
                >
                  <img src={img} alt="thumb" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          </Col>

          {/* RIGHT SIDE: Info */}
          <Col lg={5} style={{ paddingLeft: "30px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#111", lineHeight: 1.2, marginBottom: "12px", letterSpacing: "-0.5px" }}>
              {car.name}
            </h1>
            <div style={{ fontSize: "0.85rem", color: "#6c757d", fontWeight: 600, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>Giá dự kiến</div>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "24px", flexWrap: "wrap" }}>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0a58ca", margin: 0 }}>
                {formatPrice(car.price)}
              </h2>
              <Button onClick={() => navigate(`/reserve/${id}`)} style={{ backgroundColor: "#0a58ca", color: "#fff", border: "none", padding: "12px 30px", fontWeight: 800, borderRadius: "4px", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px", boxShadow: "0 4px 12px rgba(10, 88, 202, 0.2)" }}>
                Đặt xe ngay
              </Button>
            </div>

            <div style={{ backgroundColor: "#f8f9fa", border: "1px solid #e0e5f2", padding: "24px", borderRadius: "4px", fontSize: "0.95rem", color: "#495057", lineHeight: 1.6, marginBottom: "24px" }}>
              Sự kết hợp giữa kỹ thuật chính xác và thiết kế ngoạn mục. Mẫu {car.name} {car.manufacturingYear || "2026"} tiếp tục bứt phá các giới hạn thiết kế với sự sang trọng tinh tế.
            </div>

            <Row className="g-3">
              <Col xs={6}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px", border: "1px solid #e9ecef", borderRadius: "4px", backgroundColor: "#fff", fontWeight: 700, fontSize: "0.9rem", color: "#212529" }}>
                  <FaMedal color="#0a58ca" size={20} /> Đại lý chính hãng
                </div>
              </Col>
              <Col xs={6}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px", border: "1px solid #e9ecef", borderRadius: "4px", backgroundColor: "#fff", fontWeight: 700, fontSize: "0.9rem", color: "#212529" }}>
                  <BiCheckShield color="#0a58ca" size={22} /> Bảo hành 5 năm
                </div>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* HIGHLIGHT CARDS MIDDLE SECTION */}
        <Row className="g-3 mb-5 mt-3">
          <Col md={3}>
            <div style={{ border: "1px solid #e0e5f2", borderRadius: "4px", backgroundColor: "#fff", padding: "24px 16px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <FaWrench color="#0a58ca" size={24} style={{ marginBottom: "12px" }} />
              <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#111", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Động cơ</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111" }}>{car.carModel?.technicalSpec?.engine || "1.5L SkyActiv"}</div>
            </div>
          </Col>
          <Col md={3}>
            <div style={{ border: "1px solid #e0e5f2", borderRadius: "4px", backgroundColor: "#fff", padding: "24px 16px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <LuSettings2 color="#0a58ca" size={26} style={{ marginBottom: "12px" }} />
              <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#111", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Hộp số</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111" }}>{car.carModel?.technicalSpec?.transmission || "Automatic"}</div>
            </div>
          </Col>
          <Col md={3}>
            <div style={{ border: "1px solid #e0e5f2", borderRadius: "4px", backgroundColor: "#fff", padding: "24px 16px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <MdOutlineLocalGasStation color="#0a58ca" size={28} style={{ marginBottom: "12px" }} />
              <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#111", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Chỗ ngồi</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111" }}>{car.carModel?.seatCapacity || 5} Chỗ</div>
            </div>
          </Col>
          <Col md={3}>
            <div style={{ border: "1px solid #e0e5f2", borderRadius: "4px", backgroundColor: "#fff", padding: "24px 16px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <FaTachometerAlt color="#0a58ca" size={24} style={{ marginBottom: "12px" }} />
              <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#111", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Odo</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111" }}>{car.mileage?.toLocaleString('vi-VN') || 0} Km</div>
            </div>
          </Col>
        </Row>

        {/* BOTTOM SECTION */}
        <Row className="mb-4">
          {/* LEFT TABS AND INFO */}
          <Col lg={8}>
            <div style={{ display: "flex", gap: "30px", borderBottom: "1px solid #dee2e6", marginBottom: "30px", backgroundColor: "#fff", padding: "15px 30px 0 30px", borderRadius: "4px" }}>
              <div 
                onClick={() => setActiveTab("overview")}
                style={{ paddingBottom: "15px", borderBottom: activeTab === "overview" ? "3px solid #0a58ca" : "3px solid transparent", color: activeTab === "overview" ? "#0a58ca" : "#495057", fontWeight: activeTab === "overview" ? 800 : 600, fontSize: "0.95rem", cursor: "pointer", transition: "all 0.2s" }}
              >Tổng quan</div>
              <div 
                onClick={() => setActiveTab("spec")}
                style={{ paddingBottom: "15px", borderBottom: activeTab === "spec" ? "3px solid #0a58ca" : "3px solid transparent", color: activeTab === "spec" ? "#0a58ca" : "#495057", fontWeight: activeTab === "spec" ? 800 : 600, fontSize: "0.95rem", cursor: "pointer", transition: "all 0.2s" }}
              >Thông số kỹ thuật</div>
              <div 
                onClick={() => setActiveTab("equipment")}
                style={{ paddingBottom: "15px", borderBottom: activeTab === "equipment" ? "3px solid #0a58ca" : "3px solid transparent", color: activeTab === "equipment" ? "#0a58ca" : "#495057", fontWeight: activeTab === "equipment" ? 800 : 600, fontSize: "0.95rem", cursor: "pointer", transition: "all 0.2s" }}
              >Trang bị</div>
            </div>

            <div style={{ backgroundColor: "#fff", padding: "40px 30px", borderRadius: "4px", border: "1px solid #e0e5f2" }}>
              {(activeTab === "overview" || activeTab === "spec") && (
                <>
                  <h4 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#212529", marginBottom: "24px" }}>Hiệu suất & Chi tiết xe</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: activeTab === "overview" ? "45px" : "0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "#f8f9fa", padding: "16px 20px", borderRadius: "4px" }}>
                      <span style={{ color: "#6c757d", fontSize: "0.9rem" }}>Dung tích động cơ</span>
                      <span style={{ fontWeight: 800, color: "#212529", fontSize: "0.9rem" }}>{car.carModel?.technicalSpec?.engineSize || "1.5L"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "#f8f9fa", padding: "16px 20px", borderRadius: "4px" }}>
                      <span style={{ color: "#6c757d", fontSize: "0.9rem" }}>Công suất tối đa</span>
                      <span style={{ fontWeight: 800, color: "#212529", fontSize: "0.9rem" }}>{car.carModel?.technicalSpec?.horsepower || "110"} Hp</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "#f8f9fa", padding: "16px 20px", borderRadius: "4px" }}>
                      <span style={{ color: "#6c757d", fontSize: "0.9rem" }}>Mô-men xoắn tối đa</span>
                      <span style={{ fontWeight: 800, color: "#212529", fontSize: "0.9rem" }}>{car.carModel?.technicalSpec?.torque || "146"} Nm</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "#f8f9fa", padding: "16px 20px", borderRadius: "4px" }}>
                      <span style={{ color: "#6c757d", fontSize: "0.9rem" }}>Bình nhiên liệu</span>
                      <span style={{ fontWeight: 800, color: "#212529", fontSize: "0.9rem" }}>{car.carModel?.technicalSpec?.fuelCapacity || "51"} L</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "#f8f9fa", padding: "16px 20px", borderRadius: "4px" }}>
                      <span style={{ color: "#6c757d", fontSize: "0.9rem" }}>Chiều dài cơ sở</span>
                      <span style={{ fontWeight: 800, color: "#212529", fontSize: "0.9rem" }}>{car.carModel?.technicalSpec?.length || "2,725"} mm</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "#f8f9fa", padding: "16px 20px", borderRadius: "4px" }}>
                      <span style={{ color: "#6c757d", fontSize: "0.9rem" }}>Khoảng sáng gầm</span>
                      <span style={{ fontWeight: 800, color: "#212529", fontSize: "0.9rem" }}>{car.carModel?.technicalSpec?.groundClearance || "145"} mm</span>
                    </div>
                  </div>
                </>
              )}

              {(activeTab === "overview" || activeTab === "equipment") && (
                <>
                  <h4 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#212529", marginBottom: "24px", marginTop: activeTab === "overview" ? "0" : "0" }}>An toàn & Trang bị thông minh</h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                    {[
                      car.carModel?.equipment?.laneKeepAssist ? "Hỗ trợ giữ làn" : null,
                      car.carModel?.equipment?.hasBluetooth ? "Hệ thống Bluetooth" : null,
                      car.carModel?.equipment?.hasAirbags ? "Bảo vệ túi khí" : null,
                      car.carModel?.equipment?.smartKey ? "Công nghệ chìa khóa thông minh" : null,
                      car.carModel?.equipment?.hasCamera ? "Hệ thống Camera" : null,
                      car.carModel?.equipment?.electricTrunk ? "Cốp điện" : null,
                      car.carModel?.equipment?.wirelessCharge ? "Sạc không dây" : null,
                      car.carModel?.equipment?.headlampType ? `Đèn ${car.carModel?.equipment?.headlampType}` : null,
                      car.carModel?.equipment?.seatMaterial || "Ghế cao cấp",
                    ].filter(Boolean).map((feat, idx) => (
                      <div key={idx} style={{ width: "calc(33.33% - 15px)", display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", color: "#111", fontWeight: 600 }}>
                        <FaCheckCircle color="#0a58ca" size={16} /> {feat}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Artisan & Eco Cards */}
            <Row className="g-3 mt-3">
              <Col md={6}>
                <div style={{ backgroundColor: "#e9ecef", borderRadius: "4px", padding: "30px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", minHeight: "220px", position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)" }}>
                  <h5 style={{ fontWeight: 800, color: "#111", marginBottom: "12px", zIndex: 2 }}>Tay nghề thủ công Artisan</h5>
                  <p style={{ color: "#495057", fontSize: "0.9rem", margin: 0, zIndex: 2, lineHeight: 1.5 }}>Mọi chi tiết trong khoang lái đều được trau chuốt để mang lại trải nghiệm cảm xúc gắn kết người lái với cỗ máy.</p>
                </div>
              </Col>
              <Col md={6}>
                <div style={{ backgroundColor: "#0a58ca", borderRadius: "4px", padding: "30px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", minHeight: "220px", position: "relative", overflow: "hidden" }}>
                  <div style={{ marginBottom: "auto" }}>
                    <BiCube color="#fff" size={28} />
                  </div>
                  <h5 style={{ fontWeight: 800, color: "#fff", marginBottom: "12px" }}>Hiệu suất Sinh thái</h5>
                  <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.9rem", margin: 0, lineHeight: 1.5 }}>Tối ưu hóa quá trình đốt cháy để giảm phát thải mà không làm giảm công suất.</p>
                </div>
              </Col>
            </Row>
          </Col>

          {/* RIGHT SIDEBAR */}
          <Col lg={4}>
            <Card style={{ border: "1px solid #e0e5f2", borderRadius: "4px", boxShadow: "0 10px 40px rgba(0,0,0,0.02)", marginBottom: "24px" }}>
              <Card.Body style={{ padding: "30px 24px" }}>

                <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "30px" }}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "50%", backgroundColor: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "22px", height: "22px", backgroundColor: "#0a58ca", borderRadius: "50%" }}></div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: "#111", fontSize: "1.05rem" }}>Lê Anh Tuấn</div>
                    <div style={{ fontSize: "0.85rem", color: "#6c757d", fontWeight: 500 }}>Tư vấn bán hàng</div>
                  </div>
                </div>
                <Button style={{ width: "100%", backgroundColor: "#0a58ca", border: "none", padding: "16px", fontWeight: 700, borderRadius: "4px", fontSize: "0.95rem", marginBottom: "14px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }} onClick={handleBookNow}>
                  <FaPhoneAlt size={14} /> Gọi ngay
                </Button>

                <Button style={{ width: "100%", backgroundColor: "#fff", color: "#0a58ca", border: "1px solid #0a58ca", padding: "16px", fontWeight: 800, borderRadius: "4px", fontSize: "0.95rem", marginBottom: "14px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }} onClick={() => setShowSchedule(true)}>
                  <FaRegCalendarAlt size={16} /> Đặt lịch lái thử
                </Button>

                <Button
                  onClick={() => setShow3DModel(true)}
                  style={{ width: "100%", backgroundColor: "#e9ecef", color: "#212529", border: "none", padding: "16px", fontWeight: 800, borderRadius: "4px", fontSize: "0.95rem", marginBottom: "40px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
                >
                  <BiCube size={20} /> Xem mô hình 3D
                </Button>

                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#495057", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>Chia sẻ mẫu xe này</div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "4px", backgroundColor: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#0a58ca" }}>
                    <FaShareAlt size={16} />
                  </div>
                  <div style={{ width: "40px", height: "40px", borderRadius: "4px", backgroundColor: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#0a58ca" }}>
                    <FaHeart size={16} />
                  </div>
                </div>

              </Card.Body>
            </Card>

            <Card style={{ border: "1px solid #e0e5f2", borderRadius: "4px", backgroundColor: "#e9ecef", boxShadow: "none" }}>
              <Card.Body style={{ padding: "30px 24px" }}>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: "#212529", marginBottom: "8px" }}>Vị trí</div>
                <div style={{ fontSize: "0.9rem", color: "#6c757d", marginBottom: "24px", fontWeight: 500 }}>68 Lê Văn Lương, Thanh Xuân, Hà Nội</div>

                <div style={{ width: "100%", height: "200px", backgroundColor: "#dee2e6", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaMapMarkerAlt size={30} color="#adb5bd" />
                </div>
              </Card.Body>
            </Card>

          </Col>
        </Row>

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
            <div style={{ textAlign: "center", fontSize: "0.75rem", color: "#666", margin: "16px", fontWeight: 500 }}>
              Yêu cầu của bạn sẽ được nhân viên phản hồi và duyệt trong 15 phút.
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>

      {/* 3D MODAL - PREMIUM REDESIGN */}
      <Modal 
        show={show3DModel} 
        onHide={() => setShow3DModel(false)} 
        size="xl" 
        centered
        contentClassName="border-0 shadow-lg"
        style={{ backdropFilter: "blur(10px)", backgroundColor: "rgba(0,0,0,0.4)" }}
      >
        <div style={{ position: "relative", backgroundColor: "#111", borderRadius: "12px", overflow: "hidden" }}>
          {/* Custom Header - Transparent & Floating */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "24px 30px", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)" }}>
            <div>
              <h4 style={{ color: "#fff", margin: 0, fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.5px" }}>Trải nghiệm 360°</h4>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", fontWeight: 500 }}>{car.name} - Mô hình thời gian thực</div>
            </div>
            <div 
              onClick={() => setShow3DModel(false)} 
              style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", transition: "all 0.2s" }}
              onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
              onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            >
              <FaCube size={18} />
            </div>
          </div>

          <Modal.Body style={{ height: "85vh", padding: 0, backgroundColor: "#0a0a0a" }}>
            <model-viewer
              src="/models/audi_a7_55_tfsi.glb"
              alt={`3D model of ${car.name}`}
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              shadow-intensity="2"
              shadow-softness="1"
              auto-rotate
              auto-rotate-delay="2000"
              exposure="1"
              environment-image="neutral"
              style={{ width: "100%", height: "100%", outline: "none", "--poster-color": "transparent" }}
            >
              {/* Progress Bar Slot */}
              <div slot="progress-bar" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 10, textAlign: "center" }}>
                <Spinner animation="grow" style={{ color: "#007bff", width: "3.5rem", height: "3.5rem" }} />
                <div style={{ color: "#fff", marginTop: "15px", fontWeight: 700, fontSize: "0.9rem", letterSpacing: "1px" }}>ĐANG TẢI MÔ HÌNH...</div>
              </div>

              {/* Interaction Guide */}
              <div style={{ position: "absolute", bottom: "30px", left: "30px", backgroundColor: "rgba(255,255,255,0.08)", padding: "16px 20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", pointerEvents: "none", backdropFilter: "blur(12px)", animation: "fadeIn 0.5s ease-out" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <FaWrench size={14} color="#007bff" />
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>Hướng dẫn điều khiển</span>
                </div>
                <div style={{ fontSize: "0.8rem", opacity: 0.8, lineHeight: 1.5 }}>
                  Theo dõi mọi góc cạnh bằng cách giữ chuột để quay,<br />lăn chuột để phóng to và quan sát chi tiết.
                </div>
              </div>

              {/* Status Badge */}
              <div style={{ position: "absolute", bottom: "30px", right: "30px", display: "flex", gap: "10px" }}>
                <div style={{ backgroundColor: "#007bff", color: "#fff", padding: "8px 18px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", boxShadow: "0 4px 15px rgba(0,123,255,0.3)" }}>
                  High Fidelity
                </div>
                <div style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#fff", padding: "8px 18px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", backdropFilter: "blur(10px)" }}>
                  Ready to Configure
                </div>
              </div>
            </model-viewer>
          </Modal.Body>
        </div>
      </Modal>

    </div>
  );
}

