import React, { useState, useEffect, useContext } from "react";
import { FaCarSide, FaGasPump, FaSpinner, FaCalendarAlt, FaMapMarkerAlt, FaKey, FaSnowflake, FaBluetooth, FaCamera, FaShieldAlt } from "react-icons/fa";
import { GiCarSeat, GiGearStick } from "react-icons/gi";
import { IoMdSpeedometer } from "react-icons/io";
import { useParams } from "react-router-dom";
import { Card, Button, Row, Col, Spinner, Badge, Container } from "react-bootstrap";
import Hero from "./Layouts/Hero";
import axios, { authApis, endpoints } from "./../configs/APIs";
import "./../styles/Home.css";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import {MyUserContext } from "./../configs/MyContexts"

export default function CarDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [carImages, setCarImages] = useState([]);
  const user = useContext(MyUserContext);



  const fetchCarDetails = async () => {
    try {
      const res = await axios.get(endpoints["get-car-by-id"](id));
      console.log("Response from API:", res);
      console.log("Car details fetched:", res.data);
      setCar(res.data.result);
      setCarImages(res.data.result.images || []);
      console.log("Car images:", res.data.result.images);
    } catch (error) {
      console.error("Error fetching car details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  // Format price with commas for Vietnamese Dong
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + " VNĐ";
  };

  // Format date to get only the year
  const formatYear = (dateString) => {
    return new Date(dateString).getFullYear();
  };

  const handleBookNow = () => {
    sessionStorage.setItem("car", JSON.stringify(car));

    if (!user) {
      // Nếu chưa đăng nhập → chuyển đến login và thêm next param
      navigate(`/login?next=/reserve`, { state: { car } });
    } else {
      // Nếu đã đăng nhập → đi thẳng đến reserve
      navigate("/reserve", { state: { car } });
    }
  };



  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (!car) {
    return (
      <Container className="my-5 text-center">
        <h2>Car not found</h2>
        <p>Sorry, the car you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary mt-3">
          Back to Home
        </Link>
      </Container>
    );
  }



  if (loading) {
    return (
      <Card className="mb-4">
        <div className="car-image-placeholder d-flex justify-content-center align-items-center bg-light" 
             style={{height: "400px"}}>
          <FaSpinner size={30} className="text-muted spin" />
          <span className="ms-2 text-muted">Loading images...</span>
        </div>
      </Card>
    );
  }

  if (!carImages || carImages.length === 0) {
    return (
      <Card className="mb-4">
        <div className="car-image-placeholder d-flex justify-content-center align-items-center bg-light" 
             style={{height: "400px"}}>
          <FaCarSide size={50} className="text-muted" />
          <span className="ms-2 text-muted">Car Image</span>
        </div>
      </Card>
    );
  }


  return (
    <div className="car-details">
      <Container className="my-5">
        <Row>
          <Col md={8} className="col-left">
            <Card className="mb-4">
              <div className="car-image-main" style={{height: "400px", overflow: "hidden"}}>
                <img 
                  src={carImages[selectedImage]} 
                  alt={`Car ${id} - Image ${selectedImage + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center"
                  }}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/600x400?text=Image+Not+Found";
                  }}
                />
              </div>
              
              {/* Thumbnail gallery */}
              {carImages.length > 1 && (
                <div className="p-3 bg-light">
                  <div className="d-flex gap-2 overflow-auto">
                    {carImages.map((img, index) => (
                      <div 
                        key={img.id || index}
                        className={`thumbnail ${selectedImage === index ? 'thumbnail-active' : ''}`}
                        style={{
                          width: "80px",
                          height: "60px",
                          cursor: "pointer",
                          border: selectedImage === index ? "3px solid #007bff" : "2px solid #ddd",
                          borderRadius: "4px",
                          overflow: "hidden",
                          flexShrink: 0
                        }}
                        onClick={() => setSelectedImage(index)}
                      >
                        <img 
                          src={img} 
                          alt={`Thumbnail ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                          }}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/80x60?text=Error";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
            
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Overview</Card.Title>
                <Row>
                  <Col md={6}>
                    <div className="d-flex align-items-center mb-3">
                      <FaCalendarAlt className="me-2 text-muted" />
                      <span className="me-2">Year:</span>
                      <strong>{formatYear(car.year)}</strong>
                    </div>
                    
                    <div className="d-flex align-items-center mb-3">
                      <GiGearStick className="me-2 text-muted" />
                      <span className="me-2">Transmission:</span>
                      <strong>{car.carService?.hopSo || "N/A"}</strong>
                    </div>
                    
                    <div className="d-flex align-items-center mb-3">
                      <FaGasPump className="me-2 text-muted" />
                      <span className="me-2">Fuel Type:</span>
                      <strong>{car.carService?.loaiNhienLieu || "N/A"}</strong>
                    </div>
                  </Col>
                  
                  <Col md={6}>
                    <div className="d-flex align-items-center mb-3">
                      <IoMdSpeedometer className="me-2 text-muted" />
                      <span className="me-2">Engine:</span>
                      <strong>{car.carService?.dongCo || "N/A"}</strong>
                    </div>
                    
                    <div className="d-flex align-items-center mb-3">
                      <GiCarSeat className="me-2 text-muted" />
                      <span className="me-2">Seat Material:</span>
                      <strong>{car.carFeature?.carComfortResponse?.ghe || "N/A"}</strong>
                    </div>
                    
                    <div className="d-flex align-items-center mb-3">
                      <FaMapMarkerAlt className="me-2 text-muted" />
                      <span className="me-2">Branch:</span>
                      <strong>{car.carBranch}</strong>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
            
            {/* Technical Specifications */}
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Technical Specifications</Card.Title>
                <Row>
                  <Col md={6}>
                    <div className="d-flex justify-content-between border-bottom py-2">
                      <span>Engine Capacity</span>
                      <strong>{car.carService?.dungTichXiLanh ? `${car.carService.dungTichXiLanh}L` : "N/A"}</strong>
                    </div>
                    <div className="d-flex justify-content-between border-bottom py-2">
                      <span>Power</span>
                      <strong>{car.carService?.congSuat ? `${car.carService.congSuat} HP` : "N/A"}</strong>
                    </div>
                    <div className="d-flex justify-content-between border-bottom py-2">
                      <span>Torque</span>
                      <strong>{car.carService?.momenXoan ? `${car.carService.momenXoan} Nm` : "N/A"}</strong>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="d-flex justify-content-between border-bottom py-2">
                      <span>Fuel Tank Capacity</span>
                      <strong>{car.carService?.dungTichXang ? `${car.carService.dungTichXang}L` : "N/A"}</strong>
                    </div>
                    <div className="d-flex justify-content-between border-bottom py-2">
                      <span>Max Speed</span>
                      <strong>{car.carService?.tocDoToiDa ? `${car.carService.tocDoToiDa} km/h` : "N/A"}</strong>
                    </div>
                    <div className="d-flex justify-content-between border-bottom py-2">
                      <span>Payload</span>
                      <strong>{car.carService?.taiTrong ? `${car.carService.taiTrong} kg` : "N/A"}</strong>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
            
            {/* Features */}
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Features</Card.Title>
                
                <h6 className="mt-3">Comfort</h6>
                <Row>
                  {car.carFeature?.carComfortResponse?.mayDieuHoa && (
                    <Col md={6} className="mb-2">
                      <FaSnowflake className="me-2 text-primary" />
                      Air Conditioning
                    </Col>
                  )}
                  {car.carFeature?.carComfortResponse?.manHinh && (
                    <Col md={6} className="mb-2">
                      <i className="bi bi-display me-2 text-primary"></i>
                      {car.carFeature.carComfortResponse.manHinh} Screen
                    </Col>
                  )}
                  {car.carFeature?.carComfortResponse?.sacKhongDay && (
                    <Col md={6} className="mb-2">
                      <i className="bi bi-lightning-charge me-2 text-primary"></i>
                      Wireless Charging
                    </Col>
                  )}
                  {car.carFeature?.carComfortResponse?.copDien && (
                    <Col md={6} className="mb-2">
                      <i className="bi bi-plug me-2 text-primary"></i>
                      Power Outlet
                    </Col>
                  )}
                  {car.carFeature?.carComfortResponse?.bluetooth && (
                    <Col md={6} className="mb-2">
                      <FaBluetooth className="me-2 text-primary" />
                      Bluetooth
                    </Col>
                  )}
                  {car.carFeature?.carComfortResponse?.gps && (
                    <Col md={6} className="mb-2">
                      <i className="bi bi-geo me-2 text-primary"></i>
                      GPS Navigation
                    </Col>
                  )}
                </Row>
                
                <h6 className="mt-4">Exterior</h6>
                <Row>
                  {car.carFeature?.carExteriorResponse?.den && (
                    <Col md={6} className="mb-2">
                      <i className="bi bi-lightbulb me-2 text-primary"></i>
                      {car.carFeature.carExteriorResponse.den} Headlights
                    </Col>
                  )}
                  {car.carFeature?.carExteriorResponse?.smartKey && (
                    <Col md={6} className="mb-2">
                      <FaKey className="me-2 text-primary" />
                      Smart Key
                    </Col>
                  )}
                  {car.carFeature?.carExteriorResponse?.guongDien && (
                    <Col md={6} className="mb-2">
                      <i className="bi bi-mirror me-2 text-primary"></i>
                      Electric Mirrors
                    </Col>
                  )}
                </Row>
                
                <h6 className="mt-4">Safety</h6>
                <Row>
                  {car.carFeature?.featureSafetyResponse?.tuiKhi && (
                    <Col md={6} className="mb-2">
                      <FaShieldAlt className="me-2 text-primary" />
                      Airbags
                    </Col>
                  )}
                  {car.carFeature?.featureSafetyResponse?.camera && (
                    <Col md={6} className="mb-2">
                      <FaCamera className="me-2 text-primary" />
                      Rear Camera
                    </Col>
                  )}
                  {car.carFeature?.featureSafetyResponse?.camBienDoXe && (
                    <Col md={6} className="mb-2">
                      <i className="bi bi-sensor me-2 text-primary"></i>
                      Parking Sensors
                    </Col>
                  )}
                  {car.carFeature?.featureSafetyResponse?.canBangDienTu && (
                    <Col md={6} className="mb-2">
                      <i className="bi bi-sliders me-2 text-primary"></i>
                      Electronic Stability Control
                    </Col>
                  )}
                  {car.carFeature?.featureSafetyResponse?.hoTroGiuLan && (
                    <Col md={6} className="mb-2">
                      <i className="bi bi-sign-turn-right me-2 text-primary"></i>
                      Lane Keep Assist
                    </Col>
                  )}
                </Row>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={4} className="col-right">
            <Card className="sticky-top" style={{ top: "20px" }}>
              <Card.Body>
                <Card.Title className="text-primary">{formatPrice(car.price)}</Card.Title>
                <div className="text-muted mb-3">Price</div>
                
                <div className="d-grid gap-2 mb-3">
                  <Button variant="primary" size="lg" onClick={handleBookNow}>
                    Book Now
                  </Button>
                  <Button variant="outline-primary">
                    Contact Dealer
                  </Button>
                </div>
                
                <div className="car-specs">
                  <h5 className="mb-3">Quick Specs</h5>
                  
                  <div className="d-flex align-items-center mb-2">
                    <FaCarSide className="me-2 text-muted" />
                    <span className="me-2">Model:</span>
                    <strong>{car.carModel}</strong>
                  </div>
                  
                  <div className="d-flex align-items-center mb-2">
                    <FaCalendarAlt className="me-2 text-muted" />
                    <span className="me-2">Year:</span>
                    <strong>{formatYear(car.year)}</strong>
                  </div>
                  
                  <div className="d-flex align-items-center mb-2">
                    <GiGearStick className="me-2 text-muted" />
                    <span className="me-2">Transmission:</span>
                    <strong>{car.carService?.hopSo || "N/A"}</strong>
                  </div>
                  
                  <div className="d-flex align-items-center mb-2">
                    <FaGasPump className="me-2 text-muted" />
                    <span className="me-2">Fuel Type:</span>
                    <strong>{car.carService?.loaiNhienLieu || "N/A"}</strong>
                  </div>
                  
                  <div className="d-flex align-items-center mb-2">
                    <IoMdSpeedometer className="me-2 text-muted" />
                    <span className="me-2">Engine:</span>
                    <strong>{car.carService?.dongCo || "N/A"}</strong>
                  </div>
                  
                  <div className="d-flex align-items-center mb-2">
                    <FaMapMarkerAlt className="me-2 text-muted" />
                    <span className="me-2">Branch:</span>
                    <strong>{car.carBranch}</strong>
                  </div>
                </div>
                
                <div className="availability mt-3">
                  <Badge bg="success" className="p-2">
                    Available for Purchase
                  </Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}