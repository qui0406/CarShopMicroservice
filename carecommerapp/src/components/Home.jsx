import React, { useState, useEffect, useRef } from "react";
import { FaCarSide, FaTruckPickup, FaCamera, FaSearch, FaFilter, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { GiCarSeat, GiGearStick } from "react-icons/gi";
import { Link, useNavigate } from "react-router-dom";
import { Card, Button, Row, Col, Spinner, Modal, Form, Alert, Badge } from "react-bootstrap";
import axios, { authApis, endpoints } from "./../configs/APIs";
import "./../styles/Home.css";
import Chat from "./Chat";
import { MyUserContext, MyDispatchContext } from "./../configs/MyContexts";
import { useContext } from "react";
import AIValuation from "./AIValuation";


export default function Home() {
  // Initialize state as arrays to prevent undefined errors
  const user = useContext(MyUserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const roles = user.result?.roles || [];
      if (roles.includes("ADMIN")) {
        navigate("/admin");
      } else if (roles.includes("STAFF")) {
        navigate("/staff/home");
      }
    }
  }, [user, navigate]);

  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [models, setModels] = useState([]);
  const [cars, setCars] = useState([]);
  const [carsIsReady, setCarsIsReady] = useState([]);
  const [nameCarPredict, setNameCarPredict] = useState([])
  const [showModal, setShowModal] = useState(false);
  const [predictCar, setPredictedCar] = useState([])

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
    try {
      setLoading(true);
      console.log("Attempting to fetch branches...");
      const res = await axios.get(endpoints["get-all-branch"]);
      console.log("Branch Response received:", res.data);
      const resData = res.data?.result;
      const data = Array.isArray(resData?.data) ? resData.data : (Array.isArray(resData) ? resData : []);
      console.log("Processed branches:", data);
      setBranches(data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch branches error:", err);
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log("Attempting to fetch categories...");
      const res = await axios.get(endpoints["get-all-category"]);
      console.log("Category Response received:", res.data);
      const resData = res.data?.result;
      const data = Array.isArray(resData?.data) ? resData.data : (Array.isArray(resData) ? resData : []);
      console.log("Processed categories:", data);
      setCategories(data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch categories error:", err);
      setLoading(false);
    }
  };

  // Fetch models
  const fetchModels = async () => {
    try {
      setLoading(true);
      const res = await axios.get(endpoints["get-all-model"]);
      const resData = res.data?.result;
      setModels(Array.isArray(resData) ? resData : []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Fetch cars
  const fetchCars = async (pageNum = 1) => {
    try {
      setLoading(true);

      const params = {
        page: pageNum,
        size: 12
      };

      if (selectedBranch) params.carBranch = selectedBranch;
      if (selectedCategory) params.carCategory = selectedCategory;
      if (selectedPriceRange) params.price = selectedPriceRange * 1_000_000; // convert triệu → VND
      if (selectedModel) params.carName = selectedModel;

      // Use filter-car if any filters are active, else use get-products
      const endpoint = (selectedBranch || selectedCategory || selectedPriceRange || selectedModel)
        ? endpoints["filter-car"](params)
        : endpoints["get-cars"](pageNum, 12);

      const res = await axios.get(endpoint);
      const resData = res.data?.result || res.data || {};
      const data = Array.isArray(resData.data) ? resData.data : (Array.isArray(resData) ? resData : []);

      console.log("Cars data received:", data);
      if (data.length > 0) console.log("Example car fields:", Object.keys(data[0]));

      setCars(data);
      setCarTotalPages(resData.totalPages || 1);
      setLoading(false);
    } catch (err) {
      console.error("Fetch cars error:", err);
      setLoading(false);
    }
  };

  // Load data on mount and page changes
  useEffect(() => {
    console.log("Home component mounted, fetching initial data...");
    fetchBranches();
    fetchCategories();
    fetchModels();
    isListReadyCar();
  }, []);

  useEffect(() => {
    fetchCars(carPage);
  }, [carPage]); // Only refetch when page changes, or when handleSearch is called manually

  // Handle pagination
  const handleBranchPageChange = (pageNumber) => {
    setPageBranch(pageNumber);
    setCurrentPage(pageNumber);
  };

  const isListReadyCar = async () => {
    try {
      const res = await axios.get(endpoints["get-cars"]());
      const resData = res.data?.result || res.data || {};
      const data = Array.isArray(resData.data) ? resData.data : (Array.isArray(resData) ? resData : []);
      // Show all available cars as suggestions in the AI modal
      setCarsIsReady(data);
    } catch (err) {
      console.error("Fetch cars error:", err);
    }
  }

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
      formData.append('file', selectedImage); // Endpoint expects 'file'

      // Call the AI Service via Gateway
      const resPredict = await axios.post(endpoints["identify-car"], formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const responseData = resPredict.data;
      if (responseData.success) {
        setNameCarPredict(responseData.ai_detected);
        const data = Array.isArray(responseData.data) ? responseData.data : [];
        setCars(data);
        setCarsIsReady(data); // Show these recommended cars in the modal
        setCarTotalPages(1);
        setShowModal(true);
      } else {
        setError(responseData.message || "Failed to identify car.");
      }

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
    <div style={{ backgroundColor: "#f4f6f8", minHeight: "100vh", paddingBottom: "50px" }}>
      {/* 1. Hero Section */}
      <div style={{ padding: "142px 10% 80px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", backgroundColor: "#f4f6f8" }}>
        <div style={{ flex: 1, minWidth: "400px", paddingRight: "40px", marginBottom: "40px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", padding: "6px 12px", backgroundColor: "#e8f0fe", borderRadius: "50px", marginBottom: "20px" }}>
            <span style={{ color: "#1a73e8", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
              ⚡ AI POWERED
            </span>
          </div>
          <h1 style={{ fontSize: "3.5rem", fontWeight: 800, color: "#191c1d", lineHeight: 1.2, marginBottom: "20px", letterSpacing: "-1px" }}>
            Định giá xe AI <br />
            <span style={{ color: "#1a73e8" }}>chính xác nhất</span>
          </h1>
          <p style={{ color: "#5d6571", fontSize: "1.1rem", marginBottom: "30px", lineHeight: 1.6, maxWidth: "450px" }}>
            Sử dụng công nghệ Computer Vision để phân tích tình trạng xe và so sánh với 100,000+ dữ liệu thị trường thực tế.
          </p>
          <div style={{ display: "flex", gap: "15px" }}>
            <Button as={Link} to="/valuation" style={{ backgroundColor: "#0056b3", color: "#ffffff", border: "none", borderRadius: "6px", padding: "12px 28px", fontWeight: 600, fontSize: "1rem" }}>
              Thẩm định ngay &rarr;
            </Button>
            <Button style={{ backgroundColor: "#ffffff", color: "#191c1d", border: "1px solid #e7e8e9", borderRadius: "6px", padding: "12px 28px", fontWeight: 600, fontSize: "1rem" }}>
              Tìm hiểu thêm
            </Button>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: "400px", position: "relative", display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: "90%", borderRadius: "20px", overflow: "hidden", position: "relative", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <img src="https://mazdalongan.vn/media/1vxbkcbp/new-mazda6_1.jpg" alt="AI Valuation Car" style={{ width: "100%", display: "block", filter: "brightness(0.9)" }} />

          </div>
        </div>
      </div>

      {/* 2. Floating Search Box */}
      <div className="container" style={{ maxWidth: "1200px", marginTop: "20px", position: "relative", zIndex: 10 }}>
        <div style={{ background: "#ffffff", padding: "24px 30px", display: "flex", alignItems: "flex-end", gap: "15px", boxShadow: "0 10px 40px rgba(0,0,0,0.05)", borderRadius: "16px" }}>

          <div style={{ flex: 1.5 }}>
            <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#5d6571", textTransform: "uppercase", marginBottom: "8px", display: "block" }}>TÊN XE</label>
            <div style={{ position: "relative" }}>
              <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9aa0a6" }} />
              <Form.Control
                type="text"
                placeholder="Nhập tên xe..."
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                style={{ background: "#f4f6f8", border: "none", borderRadius: "8px", padding: "14px 14px 14px 40px", fontSize: "0.95rem", fontWeight: 500 }}
              />
            </div>
          </div>

          <div style={{ flex: 1.2 }}>
            <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#5d6571", textTransform: "uppercase", marginBottom: "8px", display: "block" }}>THƯƠNG HIỆU</label>
            <Form.Select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              style={{ background: "#f4f6f8", border: "none", borderRadius: "8px", padding: "14px", fontSize: "0.95rem", color: "#191c1d", fontWeight: 500 }}
            >
              <option value="">Tất cả</option>
              {branches.map(branch => <option key={branch.id} value={branch.name}>{branch.name}</option>)}
            </Form.Select>
          </div>

          <div style={{ flex: 1.2 }}>
            <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#5d6571", textTransform: "uppercase", marginBottom: "8px", display: "block" }}>PHÂN KHÚC</label>
            <Form.Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ background: "#f4f6f8", border: "none", borderRadius: "8px", padding: "14px", fontSize: "0.95rem", color: "#191c1d", fontWeight: 500 }}
            >
              <option value="">Tất cả</option>
              {categories.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
            </Form.Select>
          </div>

          <div style={{ flex: 1.5 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
              <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#5d6571", textTransform: "uppercase", margin: 0 }}>KHOẢNG GIÁ</label>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1a73e8" }}>
                {selectedPriceRange ? (selectedPriceRange >= 1000 ? `Dưới ${(selectedPriceRange / 1000).toFixed(1)} Tỷ` : `Dưới ${selectedPriceRange} Triệu`) : "Mọi mức giá"}
              </span>
            </div>
            <div style={{ background: "#f4f6f8", borderRadius: "8px", padding: "14px 20px" }}>
              <Form.Range
                min={0}
                max={5000}
                step={100}
                value={selectedPriceRange || 0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSelectedPriceRange(val === 0 ? "" : val);
                }}
                style={{ width: "100%", accentColor: "#1a73e8", margin: 0 }}
              />
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", gap: "10px" }}>
            <Button
              onClick={() => handleSearch(1)}
              style={{ background: "#1a73e8", color: "#ffffff", border: "none", borderRadius: "8px", flex: 1, height: "52px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: 700, fontSize: "0.9rem" }}
            >
              <FaSearch size={16} />
            </Button>
            <Button
              onClick={() => setShowImageSearch(true)}
              style={{ background: "#f8f9fa", color: "#1a73e8", border: "1px solid #e8f0fe", borderRadius: "8px", width: "52px", height: "52px", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
              title="Tìm bằng ảnh"
            >
              <FaCamera size={18} />
            </Button>
          </div>

        </div>
      </div>

      {/* 3. Featured Cars Section */}
      <div className="container" style={{ maxWidth: "1200px", margin: "80px auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "30px" }}>
          <div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#191c1d", marginBottom: "8px" }}>Mẫu xe Nổi bật</h2>
            <p style={{ color: "#5d6571", fontSize: "0.95rem", margin: 0, fontWeight: 500 }}>Khám phá những dòng xe Mazda được ưa chuộng nhất hiện nay.</p>
          </div>
          <Link to="/car-new" style={{ color: "#0056b3", fontWeight: 700, fontSize: "0.95rem", textDecoration: "none" }}>Xem tất cả &rarr;</Link>
        </div>

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" style={{ color: "#0056b3" }} /></div>
        ) : error ? (
          <Alert variant="danger" style={{ borderRadius: "8px", border: "none" }}>{error}</Alert>
        ) : cars.length === 0 ? (
          <div className="text-center py-5 text-muted" style={{ fontSize: "1.1rem" }}>Không tìm thấy xe phù hợp!</div>
        ) : (
          <>
            <Row className="g-4">
              {cars.slice(0, 3).map((car, idx) => {
                const badges = ["NEW 2024", "PREMIUM", "TOUGH"];
                return (
                  <Col md={4} key={car.id}>
                    <Card style={{ border: "1px solid #e7e8e9", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", overflow: "hidden", backgroundColor: "#ffffff" }}>
                      <div style={{ position: "relative", height: "220px", cursor: "pointer", overflow: "hidden" }} onClick={() => window.location.href = `/get-car-by-id/${car.id}`}>
                        <Card.Img
                          src={car.thumbnail || car.image || car.imageCar || car.url || car.imageBranch || "https://via.placeholder.com/400x240?text=No+Image"}
                          style={{ height: "100%", width: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                        />
                      </div>
                      <Card.Body style={{ padding: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                          <Card.Title style={{ color: "#191c1d", fontWeight: 800, fontSize: "1.2rem", margin: 0, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "70%" }}>
                            {car.name || car.carModel?.name || car.carName || car.modelName || car.car_model?.name || "Mẫu xe đang cập nhật"}
                          </Card.Title>
                          <span style={{ fontSize: "0.6rem", fontWeight: 800, backgroundColor: "#f4f6f8", padding: "4px 8px", borderRadius: "4px", color: "#191c1d", border: "1px solid #e7e8e9" }}>{badges[idx % 3]}</span>
                        </div>

                        <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1a73e8", marginBottom: "24px" }}>
                          {car.price ? "Từ " + car.price.toLocaleString("vi-VN") + "đ" : "Liên hệ"}
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", padding: "0 10px" }}>
                          <div style={{ textAlign: "center", color: "#1a73e8" }}>
                            <GiCarSeat size={20} style={{ marginBottom: "8px" }} />
                            <div style={{ fontSize: "0.65rem", fontWeight: 600, color: "#5d6571" }}>{car.seatCapacity ? `${car.seatCapacity} Chỗ` : "5 Chỗ"}</div>
                          </div>
                          <div style={{ textAlign: "center", color: "#1a73e8" }}>
                            <GiGearStick size={20} style={{ marginBottom: "8px" }} />
                            <div style={{ fontSize: "0.65rem", fontWeight: 600, color: "#5d6571" }}>{car.fuelType === "Xăng" || car.fuelType === "GASOLINE" ? "Xăng 2.0L" : (car.fuelType || "Xăng 2.0L")}</div>
                          </div>
                          <div style={{ textAlign: "center", color: "#1a73e8" }}>
                            <FaCarSide size={20} style={{ marginBottom: "8px" }} />
                            <div style={{ fontSize: "0.65rem", fontWeight: 600, color: "#5d6571" }}>Số tự động</div>
                          </div>
                        </div>

                        <Button as={Link} to={`/get-car-by-id/${car.id}`} style={{ width: "100%", backgroundColor: "#0056b3", border: "none", fontWeight: 600, borderRadius: "6px", padding: "12px", fontSize: "0.95rem" }}>
                          Xem chi tiết
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
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
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton style={{ borderBottom: "1px solid #e7e8e9", background: "#f8f9fa" }}>
          <Modal.Title style={{ fontWeight: 700, color: "#1a73e8", fontSize: "1.2rem" }}>Tư vấn Xe theo Hình Ảnh (AI)</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "30px", background: "#ffffff" }}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <FaCarSide size={48} style={{ color: "#1a73e8", marginBottom: "16px" }} />
            <h5 style={{ color: "#5d6571", fontWeight: 600, fontSize: "1.1rem" }}>Hệ thống nhận diện chiếc xe trong ảnh là:</h5>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#191c1d", marginTop: "10px", marginBottom: "8px" }}>
              {nameCarPredict?.brand && nameCarPredict?.brand !== "Unknown" ? nameCarPredict.brand : ""} {nameCarPredict?.model && nameCarPredict?.model !== "Unknown" ? nameCarPredict.model : "Không rõ mẫu xe"}
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              {nameCarPredict?.year && nameCarPredict.year !== "Unknown" && (
                <Badge bg="primary" style={{ fontSize: "0.85rem", padding: "6px 12px" }}>Đời dự đoán: {nameCarPredict.year}</Badge>
              )}
              {nameCarPredict?.version && nameCarPredict.version !== "Unknown" && (
                <Badge bg="secondary" style={{ fontSize: "0.85rem", padding: "6px 12px" }}>Phiên bản: {nameCarPredict.version}</Badge>
              )}
            </div>
          </div>

          <hr style={{ borderColor: "#e7e8e9", margin: "24px 0" }} />

          <div style={{ textAlign: "left" }}>
            <h6 style={{ fontWeight: 700, color: "#191c1d", marginBottom: "16px" }}>Gợi ý xe tương tự tại Showroom:</h6>
            {carsIsReady.length > 0 ? (
              <div style={{ display: "flex", gap: "15px", overflowX: "auto", paddingBottom: "10px", flexWrap: "wrap" }}>
                {carsIsReady.slice(0, 3).map(car => (
                  <Card key={car.id} style={{ flex: 1, minWidth: "220px", border: "1px solid #e7e8e9", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                    <Card.Img variant="top" src={car.thumbnail || car.image || car.imageCar} style={{ height: "140px", objectFit: "cover", borderTopLeftRadius: "12px", borderTopRightRadius: "12px" }} />
                    <Card.Body style={{ padding: "16px" }}>
                      <Card.Title style={{ fontSize: "1rem", fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{car.name || car.carModel?.name || car.carName || car.modelName || car.car_model?.name || "Mẫu xe đang cập nhật"}</Card.Title>
                      <div style={{ color: "#1a73e8", fontWeight: 700, fontSize: "1rem" }}>{car.price ? car.price.toLocaleString("vi-VN") + "đ" : "Liên hệ"}</div>
                      <Button onClick={() => window.location.href = `/get-car-by-id/${car.id}`} size="sm" style={{ width: "100%", marginTop: "12px", backgroundColor: "#f8f9fa", color: "#1a73e8", border: "1px solid #1a73e8", fontWeight: 600 }}>Xem chi tiết</Button>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            ) : (
              <Alert variant="warning" style={{ borderRadius: "8px", border: "none", color: "#856404", backgroundColor: "#fff3cd" }}>
                Hiện tại showroom chưa có mẫu xe này hoặc các phiên bản tương tự. Bạn có thể liên hệ trực tiếp để nhận thông báo khi xe về!
              </Alert>
            )}
          </div>
        </Modal.Body>
      </Modal>

      <Chat />
    </div>
  );
};