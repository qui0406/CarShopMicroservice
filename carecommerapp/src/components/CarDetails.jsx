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
  const user = useContext(MyUserContext);

  const fetchCarDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(endpoints["get-product-by-id"](id));
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
            <div style={{ fontSize: "0.85rem", color: "#6c757d", fontWeight: 600, marginBottom: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>Estimated Price</div>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "24px", flexWrap: "wrap" }}>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0a58ca", margin: 0 }}>
                {formatPrice(car.price)}
              </h2>
              <Button onClick={() => navigate(`/reserve/${id}`)} style={{ backgroundColor: "#0a58ca", color: "#fff", border: "none", padding: "12px 30px", fontWeight: 800, borderRadius: "4px", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px", boxShadow: "0 4px 12px rgba(10, 88, 202, 0.2)" }}>
                Order Car
              </Button>
            </div>

            <div style={{ backgroundColor: "#f8f9fa", border: "1px solid #e0e5f2", padding: "24px", borderRadius: "4px", fontSize: "0.95rem", color: "#495057", lineHeight: 1.6, marginBottom: "24px" }}>
              Precision engineering meets breathtaking design. The {car.manufacturingYear || "2026"} {car.name} continues to push the boundaries of design language with refined luxury.
            </div>

            <Row className="g-3">
              <Col xs={6}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px", border: "1px solid #e9ecef", borderRadius: "4px", backgroundColor: "#fff", fontWeight: 700, fontSize: "0.9rem", color: "#212529" }}>
                  <FaMedal color="#0a58ca" size={20} /> Official Dealer
                </div>
              </Col>
              <Col xs={6}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px", border: "1px solid #e9ecef", borderRadius: "4px", backgroundColor: "#fff", fontWeight: 700, fontSize: "0.9rem", color: "#212529" }}>
                  <BiCheckShield color="#0a58ca" size={22} /> 5-Year Warranty
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
              <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#111", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Engine</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111" }}>{car.carModel?.technicalSpec?.engine || "1.5L SkyActiv"}</div>
            </div>
          </Col>
          <Col md={3}>
            <div style={{ border: "1px solid #e0e5f2", borderRadius: "4px", backgroundColor: "#fff", padding: "24px 16px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <LuSettings2 color="#0a58ca" size={26} style={{ marginBottom: "12px" }} />
              <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#111", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Transmission</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111" }}>{car.carModel?.technicalSpec?.transmission || "Automatic"}</div>
            </div>
          </Col>
          <Col md={3}>
            <div style={{ border: "1px solid #e0e5f2", borderRadius: "4px", backgroundColor: "#fff", padding: "24px 16px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <MdOutlineLocalGasStation color="#0a58ca" size={28} style={{ marginBottom: "12px" }} />
              <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#111", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Seats</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111" }}>{car.carModel?.seatCapacity || 5} Seats</div>
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
              <div style={{ paddingBottom: "15px", borderBottom: "3px solid #0a58ca", color: "#0a58ca", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer" }}>Overview</div>
              <div style={{ paddingBottom: "15px", color: "#495057", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer" }}>Technical Specs</div>
              <div style={{ paddingBottom: "15px", color: "#495057", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer" }}>Equipment</div>
            </div>

            <div style={{ backgroundColor: "#fff", padding: "40px 30px", borderRadius: "4px", border: "1px solid #e0e5f2" }}>
              <h4 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#212529", marginBottom: "24px" }}>Vehicle Performance & Details</h4>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "45px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "#f8f9fa", padding: "16px 20px", borderRadius: "4px" }}>
                  <span style={{ color: "#6c757d", fontSize: "0.9rem" }}>Engine Capacity</span>
                  <span style={{ fontWeight: 800, color: "#212529", fontSize: "0.9rem" }}>{car.carModel?.technicalSpec?.engineSize || "1.5L"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "#f8f9fa", padding: "16px 20px", borderRadius: "4px" }}>
                  <span style={{ color: "#6c757d", fontSize: "0.9rem" }}>Max Power</span>
                  <span style={{ fontWeight: 800, color: "#212529", fontSize: "0.9rem" }}>{car.carModel?.technicalSpec?.horsepower || "110"} Hp</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "#f8f9fa", padding: "16px 20px", borderRadius: "4px" }}>
                  <span style={{ color: "#6c757d", fontSize: "0.9rem" }}>Max Torque</span>
                  <span style={{ fontWeight: 800, color: "#212529", fontSize: "0.9rem" }}>{car.carModel?.technicalSpec?.torque || "146"} Nm</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "#f8f9fa", padding: "16px 20px", borderRadius: "4px" }}>
                  <span style={{ color: "#6c757d", fontSize: "0.9rem" }}>Fuel Tank</span>
                  <span style={{ fontWeight: 800, color: "#212529", fontSize: "0.9rem" }}>{car.carModel?.technicalSpec?.fuelCapacity || "51"} L</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "#f8f9fa", padding: "16px 20px", borderRadius: "4px" }}>
                  <span style={{ color: "#6c757d", fontSize: "0.9rem" }}>Wheelbase</span>
                  <span style={{ fontWeight: 800, color: "#212529", fontSize: "0.9rem" }}>{car.carModel?.technicalSpec?.length || "2,725"} mm</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "#f8f9fa", padding: "16px 20px", borderRadius: "4px" }}>
                  <span style={{ color: "#6c757d", fontSize: "0.9rem" }}>Ground Clearance</span>
                  <span style={{ fontWeight: 800, color: "#212529", fontSize: "0.9rem" }}>{car.carModel?.technicalSpec?.groundClearance || "145"} mm</span>
                </div>
              </div>

              <h4 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#212529", marginBottom: "24px" }}>Safety & Smart Equipment</h4>
              
              <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", paddingBottom: "20px" }}>
                {[
                  car.carModel?.equipment?.laneKeepAssist ? "Lane Keep Assist" : null, 
                  car.carModel?.equipment?.hasBluetooth ? "Bluetooth System" : null,
                  car.carModel?.equipment?.hasAirbags ? "Airbags Protection" : null,
                  car.carModel?.equipment?.smartKey ? "Smart Key Technology" : null,
                  car.carModel?.equipment?.hasCamera ? "Camera System" : null,
                  car.carModel?.equipment?.electricTrunk ? "Electric Trunk" : null,
                  car.carModel?.equipment?.wirelessCharge ? "Wireless Charge" : null,
                  car.carModel?.equipment?.headlampType ? `${car.carModel?.equipment?.headlampType} Lights` : null,
                  car.carModel?.equipment?.seatMaterial || "Premium Seats",
                ].filter(Boolean).map((feat, idx) => (
                  <div key={idx} style={{ width: "calc(33.33% - 15px)", display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", color: "#111", fontWeight: 600 }}>
                    <FaCheckCircle color="#0a58ca" size={16} /> {feat}
                  </div>
                ))}
              </div>
            </div>

            {/* Artisan & Eco Cards */}
            <Row className="g-3 mt-3">
              <Col md={6}>
                <div style={{ backgroundColor: "#e9ecef", borderRadius: "4px", padding: "30px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", minHeight: "220px", position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)" }}>
                  <h5 style={{ fontWeight: 800, color: "#111", marginBottom: "12px", zIndex: 2 }}>Artisan Craftsmanship</h5>
                  <p style={{ color: "#495057", fontSize: "0.9rem", margin: 0, zIndex: 2, lineHeight: 1.5 }}>Every detail in the cabin is curated to provide a tactile experience that connects the driver to the machine.</p>
                </div>
              </Col>
              <Col md={6}>
                <div style={{ backgroundColor: "#0a58ca", borderRadius: "4px", padding: "30px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", minHeight: "220px", position: "relative", overflow: "hidden" }}>
                  <div style={{ marginBottom: "auto" }}>
                    <BiCube color="#fff" size={28} />
                  </div>
                  <h5 style={{ fontWeight: 800, color: "#fff", marginBottom: "12px" }}>Eco Efficiency</h5>
                  <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.9rem", margin: 0, lineHeight: 1.5 }}>Optimized combustion for lower emissions without compromising power.</p>
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
                    <div style={{ fontWeight: 800, color: "#111", fontSize: "1.05rem" }}>Le Anh Tuan</div>
                    <div style={{ fontSize: "0.85rem", color: "#6c757d", fontWeight: 500 }}>Sales Consultant</div>
                  </div>
                </div>

                <Button style={{ width: "100%", backgroundColor: "#0a58ca", border: "none", padding: "16px", fontWeight: 700, borderRadius: "4px", fontSize: "0.95rem", marginBottom: "14px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }} onClick={handleBookNow}>
                  <FaPhoneAlt size={14} /> Call Now
                </Button>
                
                <Button style={{ width: "100%", backgroundColor: "#fff", color: "#0a58ca", border: "1px solid #0a58ca", padding: "16px", fontWeight: 800, borderRadius: "4px", fontSize: "0.95rem", marginBottom: "14px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }} onClick={() => setShowSchedule(true)}>
                  <FaRegCalendarAlt size={16} /> Book Test Drive
                </Button>

                <Button 
                  onClick={() => setShow3DModel(true)}
                  style={{ width: "100%", backgroundColor: "#e9ecef", color: "#212529", border: "none", padding: "16px", fontWeight: 800, borderRadius: "4px", fontSize: "0.95rem", marginBottom: "40px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
                >
                  <BiCube size={20} /> View 3D Model
                </Button>

                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#495057", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>Share This Model</div>
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
                <div style={{ fontSize: "1rem", fontWeight: 800, color: "#212529", marginBottom: "8px" }}>Location</div>
                <div style={{ fontSize: "0.9rem", color: "#6c757d", marginBottom: "24px", fontWeight: 500 }}>68 Le Van Luong, Thanh Xuan, Hanoi</div>
                
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

      {/* 3D MODAL */}
      <Modal show={show3DModel} onHide={() => setShow3DModel(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontWeight: 800 }}>Mô hình 3D - {car.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: "75vh", padding: 0 }}>
          <iframe 
            src="https://drive.google.com/file/d/13aqW3hVVtaDSECYHKp6SzAwYO3znqZ7D/preview" 
            width="100%" 
            height="100%" 
            style={{ border: "none", borderRadius: "0 0 4px 4px" }}
            allow="autoplay"
            title="3D Model Preview"
          ></iframe>
        </Modal.Body>
      </Modal>

    </div>
  );
}

