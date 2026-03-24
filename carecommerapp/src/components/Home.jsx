import React, { useState, useEffect, useRef } from "react";
import { FaCarSide, FaTruckPickup, FaCamera, FaSearch, FaFilter, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { GiCarSeat, GiGearStick } from "react-icons/gi";
import { Link } from "react-router-dom";
import { Card, Button, Row, Col, Spinner, Modal, Form, Alert } from "react-bootstrap";
import axios, { authApis, endpoints } from "./../configs/APIs";
import "./../styles/Home.css";
import Chat from "./Chat";
import { MyUserContext, MyDispatchContext } from "./../configs/MyContexts";
import { useContext } from "react";


export default function Home (){
  // Initialize state as arrays to prevent undefined errors
  const user = useContext(MyUserContext);

  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [models, setModels] = useState([]);
  const [cars, setCars] = useState([]);
  const [nameCarPredict, setNameCarPredict]= useState([])
  const [showModal, setShowModal] = useState(false);
  const [predictCar, setPredictedCar]= useState([])
  
  const [pageBranch, setPageBranch] = useState(1);
  const [totalPagesBranch, setTotalPagesBranch] = useState(1);
  const [pageCategory, setPageCategory] = useState(1);
  const [totalPagesCategory, setTotalPagesCategory] = useState(1);
  const [pageModel, setPageModel] = useState(1);
  
  const [carPage, setCarPage] = useState(1);
  const [carTotalPages, setCarTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Image search states
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageSearchLoading, setImageSearchLoading] = useState(false);
  const fileInputRef = useRef(null);

  const cardsPerPage = 5;
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;


  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState(""); 


  const [currentPageBranch, setCurrentPageBranch] = useState(1);
  const itemsPerPage = 4; // số thương hiệu mỗi trang

  // Tính toán dữ liệu trang hiện tại
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentBranches = branches.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(branches.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Fetch branches
  const fetchBranches = async () => {
    setLoading(true);
    setTimeout(() => {
      setBranches([
        { id: 1, name: "Toyota", imageBranch: "https://www.carlogos.org/car-logos/toyota-logo-2005-download.png" },
        { id: 2, name: "Honda", imageBranch: "https://www.carlogos.org/car-logos/honda-logo-2000-full-download.png" },
        { id: 3, name: "Mercedes-Benz", imageBranch: "https://www.carlogos.org/car-logos/mercedes-benz-logo-2011-download.png" },
        { id: 4, name: "BMW", imageBranch: "https://www.carlogos.org/car-logos/bmw-logo-2020-blue-white.png" },
        { id: 5, name: "Audi", imageBranch: "https://www.carlogos.org/car-logos/audi-logo-2016.png" },
        { id: 6, name: "Lexus", imageBranch: "https://www.carlogos.org/car-logos/lexus-logo-2015-download.png" }
      ]);
      setLoading(false);
    }, 500);
  };

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    setTimeout(() => {
      setCategories([
        { id: 1, name: "SUV" },
        { id: 2, name: "Sedan" },
        { id: 3, name: "Hatchback" },
        { id: 4, name: "Coupe" },
        { id: 5, name: "Truck" }
      ]);
      setLoading(false);
    }, 500);
  };

  // Fetch models
  const fetchModels = async () => {
    setLoading(true);
    setTimeout(() => {
      setModels([
        { id: 1, name: "Corolla Cross" },
        { id: 2, name: "Civic" },
        { id: 3, name: "C-Class" },
        { id: 4, name: "X5" },
        { id: 5, name: "Q7" },
      ]);
      setLoading(false);
    }, 500);
  };

  // Fetch cars
  const fetchCars = async (pageNum) => {
    setLoading(true);
    setTimeout(() => {
      setCars([
        { id: 1, name: "Toyota Corolla Cross 1.8V", carImage: "https://toyota-vietnam.vn/wp-content/uploads/2021/08/Cross-V-300x200.png", year: "2024-01-01", price: 860000000 },
        { id: 2, name: "Honda Civic RS", carImage: "https://hondaotoosales.com/wp-content/uploads/2022/07/civic-rs-trang-300x200.png", year: "2023-01-01", price: 870000000 },
        { id: 3, name: "Mercedes-Benz C 300 AMG", carImage: "https://www.mercedes-benz.com.vn/content/dam/hq/passengercars/cars/c-class/saloon-w206-pi/model-overview/04-2021/images/mercedes-benz-c-class-w206-model-overview-300x200-04-2021.png", year: "2024-05-10", price: 2199000000 },
        { id: 4, name: "BMW X5 xDrive40i", carImage: "https://www.bmw.vn/content/dam/bmw/common/all-models/x-series/x5/2023/navigation/bmw-x5-lci-modelfinder.png", year: "2022-12-10", price: 4169000000 },
        { id: 5, name: "Audi Q7 45 TFSI", carImage: "https://www.audi.vn/content/dam/nemo/models/q7/q7/my-2024/NeMo-Derivate-Startpage/Silhouette-Q7-TFSI-e-my2024.png", year: "2023-08-01", price: 3400000000 },
        { id: 6, name: "Lexus RX 350", carImage: "https://lexus.com.vn/content/dam/lexus-v3-blueprint/models/suv/rx/rx-350-premium/1.png", year: "2024-02-15", price: 3430000000 },
        { id: 7, name: "Toyota Camry 2.5Q", carImage: "https://toyota-vietnam.vn/wp-content/uploads/2021/12/Camry-2.5Q-300x200.png", year: "2023-05-20", price: 1405000000 },
        { id: 8, name: "Honda CR-V L AWD", carImage: "https://hondaotoosales.com/wp-content/uploads/2023/10/crv-l-awd-trang-300x200.png", year: "2024-03-05", price: 1310000000 }
      ]);
      setCarTotalPages(2);
      setLoading(false);
    }, 600);
  };

  // Load data on mount and page changes
  useEffect(() => {
    fetchBranches(pageBranch);
    fetchCategories(pageCategory);
    fetchModels(pageModel);
    fetchCars(carPage);
  }, [pageBranch, pageCategory, pageModel, carPage]);

  // Handle pagination
  const handleBranchPageChange = (pageNumber) => {
    setPageBranch(pageNumber);
    setCurrentPage(pageNumber);
  };

  const handleCarPageChange = (pageNumber) => {
    setCarPage(pageNumber);
  };

  const handleSearch = async (pageNum = 1) => {
    setLoading(true);
    setTimeout(() => {
      fetchCars(pageNum);
    }, 500);
  };

  // Image search handlers
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSearch = async () => {
    
    if (!selectedImage) return;

    try {
      setImageSearchLoading(true);
      const formData = new FormData();
      formData.append('image', selectedImage);

      // // Replace with your actual image search endpoint
      const resPredict = await axios.post("http://127.0.0.1:5000/predict", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // const result = {
      //   "predicted_class": "Toyota Innova",
      //   "confidence": 0.9876,
      //   "class_index": 6,
      //   "image_path": "static/uploads/example.jpg"
      // }

      setShowModal(true);
      setPredictedCar(resPredict.data.predicted_class);
      setNameCarPredict(resPredict.data);

      const [carBranch = "", category = ""] = resPredict.data.predicted_class.split(" ");

      const res = await axios.get(endpoints["filter-cars"], { 
        params: { carBranch, category },
      });

      const resultData = res.data?.result || {};

      setCars(Array.isArray(resultData.data) ? resultData.data : []);
      setCarTotalPages(resultData.totalPages || 1);



      // setCars(Array.isArray(result) ? result : []);
      setNameCarPredict(resPredict.data)
      setShowImageSearch(false);
      
    } catch (error) {
      console.error("Error searching by image:", error);
      setError("Failed to search by image. Please try again.");
    } finally {
      setImageSearchLoading(false);
    }
  };

  const resetImageSearch = () => {
    setSelectedImage(null);
    setImagePreview("");
    setShowImageSearch(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", paddingBottom: "50px" }}>
      {/* 1. Hero Section */}
      <div style={{ 
        position: "relative",
        background: "url('https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop') center/cover no-repeat",
        height: "550px",
        display: "flex",
        alignItems: "center",
        padding: "0 10%"
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 100%)" }}></div>
        <div style={{ position: "relative", zIndex: 2, maxWidth: "600px" }}>
          <h1 style={{ color: "#ffffff", fontSize: "3.5rem", fontWeight: 800, lineHeight: 1.1, marginBottom: "20px", letterSpacing: "-1px" }}>Ưu đãi chào tháng<br/>mới – Lãi suất 0%</h1>
          <p style={{ color: "#e0e0e0", fontSize: "1.2rem", fontWeight: 400, marginBottom: "30px" }}>CarShop - Nơi bạn tìm thấy chiếc xe mơ ước.</p>
          <Button style={{ background: "#1a73e8", color: "#ffffff", border: "none", borderRadius: "4px", padding: "12px 32px", fontSize: "1rem", fontWeight: 600, boxShadow: "none" }}>Xem ngay</Button>
        </div>
      </div>

      {/* 2. Floating Search Box */}
      <div className="container" style={{ maxWidth: "1200px", margin: "-60px auto 0", position: "relative", zIndex: 10 }}>
        <div style={{ background: "#ffffff", padding: "24px 32px", display: "flex", alignItems: "flex-end", gap: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", borderRadius: "4px", border: "1px solid #e7e8e9" }}>
          
          <div style={{ flex: "1.5" }}>
            <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#191c1d", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px", display: "block" }}>TÌM KIẾM TÊN XE</label>
            <Form.Control type="text" placeholder="Toyota Corolla Cross..." style={{ background: "#f8f9fa", border: "1px solid #e7e8e9", borderRadius: "4px", boxShadow: "none", padding: "12px 16px", fontSize: "0.95rem" }} />
          </div>

          <div style={{ flex: "1.2" }}>
            <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#191c1d", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px", display: "block" }}>THƯƠNG HIỆU</label>
            <Form.Select 
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              style={{ background: "#f8f9fa", border: "1px solid #e7e8e9", borderRadius: "4px", boxShadow: "none", padding: "12px 16px", fontSize: "0.95rem", color: "#5d6571", appearance: "none" }}
            >
              <option value="">Tất cả</option>
              {branches.map(branch => <option key={branch.id} value={branch.name}>{branch.name}</option>)}
            </Form.Select>
          </div>

          <div style={{ flex: "1.2" }}>
            <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#191c1d", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px", display: "block" }}>KIỂU DÁNG</label>
            <Form.Select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              style={{ background: "#f8f9fa", border: "1px solid #e7e8e9", borderRadius: "4px", boxShadow: "none", padding: "12px 16px", fontSize: "0.95rem", color: "#5d6571", appearance: "none" }}
            >
              <option value="">Tất cả</option>
              {models.map(model => <option key={model.id} value={model.name}>{model.name}</option>)}
            </Form.Select>
          </div>

          <div style={{ flex: "2" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "5px" }}>
              <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#191c1d", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>KHOẢNG GIÁ</label>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1a73e8" }}>
                {selectedPriceRange ? (selectedPriceRange >= 1000 ? `Dưới ${(selectedPriceRange / 1000).toFixed(1)} Tỷ` : `Dưới ${selectedPriceRange} Triệu`) : "Mọi mức giá"}
              </span>
            </div>
            <Form.Range 
              min={0} 
              max={5000} 
              step={100}
              value={selectedPriceRange || 0}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSelectedPriceRange(val === 0 ? "" : val);
              }}
              style={{ width: "100%", accentColor: "#1a73e8" }} 
            />
          </div>

          <div style={{ flex: "1" }}>
            <Button 
              onClick={() => setShowImageSearch(true)}
              style={{ background: "#eff6ff", color: "#1a73e8", border: "none", borderRadius: "4px", width: "100%", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "none", gap: "8px" }}
            >
              <FaCamera size={16} />
              <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Tìm bằng hình ảnh</span>
            </Button>
          </div>
          
        </div>
      </div>

        {/* 3. Categories */}
        <div className="container" style={{ maxWidth: "1200px", margin: "60px auto 60px auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
            {categories.slice(0, 5).map((cat) => (
              <div
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.name); handleSearch(1); }}
                style={{
                  flex: 1,
                  background: selectedCategory === cat.name ? "#e8f0fe" : "#f1f5f9",
                  color: "#1a73e8",
                  padding: "30px 10px",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  borderRadius: "4px", cursor: "pointer",
                  border: selectedCategory === cat.name ? "1px solid #1a73e8" : "1px solid transparent",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "12px" }}>
                  {cat.name === "SUV" && <FaCarSide />}
                  {cat.name === "Sedan" && <GiCarSeat />}
                  {cat.name === "Hatchback" && <GiGearStick />}
                  {cat.name === "Coupe" && <FaTruckPickup />}
                  {(!["SUV", "Sedan", "Hatchback", "Coupe"].includes(cat.name)) && <FaCarSide />}
                </div>
                <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#191c1d" }}>{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Brands Layout (Thương hiệu đối tác) */}
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto 80px auto" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#191c1d", marginBottom: "30px", textAlign: "left" }}>Thương hiệu đối tác</h2>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {branches.map((branch) => (
              <div
                key={branch.id}
                style={{
                  width: "120px", height: "120px",
                  background: "#ffffff",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", padding: "16px"
                }}
                onClick={() => { setSelectedBranch(branch.name); handleSearch(1); }}
              >
                <img src={branch.imageBranch || "https://via.placeholder.com/80"} alt={branch.name} style={{ width: "70px", height: "70px", objectFit: "contain", filter: "grayscale(100%)", opacity: 0.5, transition: "0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.filter = "none"; }} onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.5; e.currentTarget.style.filter = "grayscale(100%)"; }} />
              </div>
            ))}
          </div>
        </div>

        {/* 5. Featured Cars Section */}
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto 80px auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "30px" }}>
            <div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#191c1d", marginBottom: "5px" }}>Mẫu xe Nổi bật</h2>
              <p style={{ color: "#5d6571", fontSize: "0.9rem", margin: 0 }}>Những lựa chọn hàng đầu được tinh tuyển trong tuần này.</p>
            </div>
            <Link to="#" style={{ color: "#1a73e8", fontWeight: 600, fontSize: "0.95rem", textDecoration: "none" }}>Xem tất cả kho xe &rarr;</Link>
          </div>

          {loading ? (
            <div className="text-center py-5"><Spinner animation="border" style={{ color: "#1a73e8" }} /></div>
          ) : error ? (
            <Alert variant="danger" style={{ borderRadius: "4px", border: "none" }}>{error}</Alert>
          ) : cars.length === 0 ? (
            <div className="text-center py-5 text-muted" style={{ fontSize: "1.1rem" }}>Không tìm thấy xe phù hợp!</div>
          ) : (
            <>
              <Row className="g-4">
                {cars.slice(0, 3).map((car) => (
                  <Col md={4} key={car.id}>
                    <Card style={{ border: "none", borderRadius: "0", boxShadow: "none", backgroundColor: "transparent" }}>
                      <div style={{ height: "240px", backgroundColor: "#f1f5f9", overflow: "hidden" }}>
                        <Card.Img variant="top" src={car.carImage} style={{ height: "100%", objectFit: "cover" }} />
                      </div>
                      <Card.Body style={{ padding: "24px 0" }}>
                        <Card.Title style={{ color: "#1a73e8", fontWeight: 700, fontSize: "1.1rem", marginBottom: "15px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{car.name || "Unknown Car"}</Card.Title>
                        
                        <div style={{ backgroundColor: "#f8f9fa", padding: "12px", display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                          <div style={{ textAlign: "center", color: "#191c1d" }}>
                            <GiCarSeat size={18} style={{ marginBottom: "5px" }} />
                            <div style={{ fontSize: "0.6rem", fontWeight: 700 }}>5 CHỖ</div>
                          </div>
                          <div style={{ textAlign: "center", color: "#191c1d" }}>
                            <GiGearStick size={18} style={{ marginBottom: "5px" }} />
                            <div style={{ fontSize: "0.6rem", fontWeight: 700 }}>XĂNG</div>
                          </div>
                          <div style={{ textAlign: "center", color: "#191c1d" }}>
                            <FaCarSide size={18} style={{ marginBottom: "5px" }} />
                            <div style={{ fontSize: "0.6rem", fontWeight: 700 }}>1.8L</div>
                          </div>
                        </div>

                        <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#191c1d", marginBottom: "20px" }}>
                          {car.price ? car.price.toLocaleString("vi-VN") + "đ" : "Liên hệ"}
                        </div>

                        <div style={{ display: "flex", gap: "10px" }}>
                          <Button as={Link} to={`/get-car-by-id/${car.id}`} variant="outline-primary" style={{ flex: 1, borderColor: "#1a73e8", color: "#1a73e8", fontWeight: 600, borderRadius: "4px" }}>Xem chi tiết</Button>
                          <Button as={Link} to={`/get-car-by-id/${car.id}`} variant="primary" style={{ flex: 1, backgroundColor: "#1a73e8", borderColor: "#1a73e8", fontWeight: 600, borderRadius: "4px" }}>Lái thử</Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
              
              {carTotalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "50px" }}>
                  <Button onClick={() => handleCarPageChange(carPage - 1)} disabled={carPage === 1} style={{ background: "#ffffff", color: "#191c1d", border: "1px solid #e7e8e9", borderRadius: "4px", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "none" }}><FaChevronLeft /></Button>
                  {Array.from({ length: Math.min(5, carTotalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    return (
                      <Button key={pageNum} onClick={() => handleCarPageChange(pageNum)} style={{ background: carPage === pageNum ? "#1a73e8" : "#ffffff", color: carPage === pageNum ? "#ffffff" : "#191c1d", border: carPage === pageNum ? "none" : "1px solid #e7e8e9", borderRadius: "4px", width: "40px", height: "40px", fontWeight: 600, boxShadow: "none" }}>{pageNum}</Button>
                    );
                  })}
                  <Button onClick={() => handleCarPageChange(carPage + 1)} disabled={carPage === carTotalPages} style={{ background: "#ffffff", color: "#191c1d", border: "1px solid #e7e8e9", borderRadius: "4px", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "none" }}><FaChevronRight /></Button>
                </div>
              )}
            </>
          )}
        </div>

      {/* Image Search Modal */}
      <Modal show={showImageSearch} onHide={resetImageSearch} centered>
        <Modal.Header closeButton style={{ borderBottom: "1px solid #e7e8e9", background: "#f8f9fa" }}>
          <Modal.Title style={{ fontWeight: 700, color: "#1a73e8", fontSize: "1.2rem" }}>Tìm kiếm bằng hình ảnh</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "30px", background: "#ffffff" }}>
          <div style={{ textAlign: "center" }}>
            {!imagePreview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{ border: "2px dashed #c1c6d6", borderRadius: "8px", padding: "40px 20px", cursor: "pointer", background: "#f8f9fa", transition: "background 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#e8f0fe"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#f8f9fa"}
              >
                <FaCamera size={48} style={{ color: "#1a73e8", marginBottom: "16px" }} />
                <h5 style={{ fontWeight: 600, color: "#191c1d", marginBottom: "8px" }}>Tải lên ảnh xe</h5>
                <p style={{ color: "#5d6571", fontSize: "0.95rem" }}>Chọn ảnh để tìm những chiếc xe tương tự hoặc chính xác</p>
                <Button style={{ background: "#ffffff", color: "#1a73e8", border: "1px solid #1a73e8", borderRadius: "4px", fontWeight: 600, marginTop: "16px" }}>Chọn ảnh</Button>
              </div>
            ) : (
              <div>
                <img src={imagePreview} alt="Preview" style={{ width: "100%", maxHeight: "250px", objectFit: "contain", borderRadius: "8px", border: "1px solid #e7e8e9", marginBottom: "16px", padding: "10px" }} />
                <Button onClick={() => fileInputRef.current?.click()} style={{ background: "#f8f9fa", color: "#191c1d", border: "1px solid #c1c6d6", borderRadius: "4px", fontWeight: 600, boxShadow: "none" }}>Đổi ảnh</Button>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="d-none" />
          </div>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "1px solid #e7e8e9", background: "#f8f9fa" }}>
          <Button variant="light" onClick={resetImageSearch} style={{ border: "1px solid #e7e8e9", fontWeight: 600, borderRadius: "4px" }}>Hủy</Button>
          <Button onClick={handleImageSearch} disabled={!selectedImage || imageSearchLoading} style={{ background: "#1a73e8", color: "#ffffff", border: "none", fontWeight: 600, borderRadius: "4px", display: "flex", alignItems: "center" }}>
            {imageSearchLoading ? <><Spinner size="sm" className="me-2" /> Đang tìm...</> : <><FaSearch className="me-2" /> Tìm kiếm</>}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Prediction Result Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton style={{ borderBottom: "1px solid #e7e8e9" }}>
          <Modal.Title style={{ fontWeight: 700, color: "#1a73e8", fontSize: "1.2rem" }}>Kết quả dự đoán AI</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "30px", textAlign: "center" }}>
          <FaCarSide size={60} style={{ color: "#1a73e8", marginBottom: "16px" }} />
          <h5 style={{ color: "#5d6571", fontWeight: 500, fontSize: "1rem" }}>Hệ thống nhận diện mẫu xe:</h5>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#191c1d", marginTop: "10px", marginBottom: "16px" }}>{nameCarPredict.predicted_class}</div>
          <p style={{ color: "#5d6571", fontWeight: 500 }}>Độ nhạy (Confidence): <strong style={{ color: "#34a853" }}>{(nameCarPredict.confidence * 100).toFixed(2)}%</strong></p>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "none", justifyContent: "center" }}>
          <Button onClick={() => setShowModal(false)} style={{ background: "#1a73e8", color: "#ffffff", border: "none", fontWeight: 600, borderRadius: "4px", padding: "8px 32px" }}>Xác nhận</Button>
        </Modal.Footer>
      </Modal>

      <Chat />
    </div>
  );
};