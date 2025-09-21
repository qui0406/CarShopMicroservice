import React, { useState, useEffect, useRef } from "react";
import { FaCarSide, FaTruckPickup, FaCamera, FaSearch, FaFilter, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { GiCarSeat, GiGearStick } from "react-icons/gi";
import { Link } from "react-router-dom";
import { Card, Button, Row, Col, Spinner, Modal, Form } from "react-bootstrap";
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
    try {
      setLoading(true);
      const res = await axios.get(endpoints["car-branch"]);
      const result = res.data?.result || {};

      console.log("Branch", res.data?.result)
      setBranches(res.data?.result);
    } catch (error) {
      console.error("Error fetching branches:", error);
      setError("Failed to fetch branches. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(endpoints["car-category"]);
      const result = res.data?.result || {};
      setCategories(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to fetch categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch models
  const fetchModels = async () => {
    try {
      setLoading(true);
      const res = await axios.get(endpoints["car-model"]);
      const result = res.data?.result || {};
      setModels(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Error fetching models:", error);
      setError("Failed to fetch models. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch cars
  const fetchCars = async (pageNum) => {
    try {
      setLoading(true);
      const res = await axios.get(endpoints["get-cars"], {
        params: { page: pageNum },
      });
      const result = res.data?.result || {};

      console.log(result)
      setCars(Array.isArray(result.data) ? result.data : []);
      setCarTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error("Error fetching cars:", error);
      setError("Failed to fetch cars. Please try again.");
    } finally {
      setLoading(false);
    }
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
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pageNum,
        size: 10
      };

      if (selectedBranch) params.branch = selectedBranch;
      if (selectedModel) params.model = selectedModel;
      if (selectedCategory) params.category = selectedCategory;

      if (selectedPriceRange) {
        const cleanRange = selectedPriceRange.replace(/\$/g, "").replace(/k/g, "000").replace(/\s/g, "");
        const [from, to] = cleanRange.split("-");
        
        if (from && to) {
          params.fromPrice = parseInt(from);
          params.toPrice = parseInt(to);
        }
      }

      const res = await axios.get(endpoints["filter-cars"], { params });

      const result = res.data?.result || {};

      setCars(Array.isArray(result.data) ? result.data : []);
      setCarTotalPages(result.totalPages || 1);

    } catch (error) {
      console.error("Error fetching cars:", error);
      setError("Failed to fetch cars. Please try again.");
    } finally {
      setLoading(false);
    }
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
    <>
      <div className="w-full">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <div className="hero-text">
              {/* <h1 className="hero-title">
                Tìm Chiếc Xe <span className="hero-highlight">Hoàn Hảo</span> Của Bạn
              </h1> */}
              <p className="hero-description">
                Khám phá hàng nghìn xe ô tô chất lượng cao từ các thương hiệu hàng đầu
              </p>
            </div>

            {/* Modern Search Form */}
            <div className="search-container">
              <div className="search-form-modern">
                <div className="search-row">
                  <div className="search-field">
                    <label>Hãng xe</label>
                    <select 
                      className="modern-select" 
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                    >
                      <option value="">Tất cả hãng xe</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.name}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="search-field">
                    <label>Dòng xe</label>
                    <select 
                      className="modern-select"
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                    >
                      <option value="">Tất cả dòng xe</option>
                      {models.map((model) => (
                        <option key={model.id} value={model.name}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="search-field">
                    <label>Khoảng giá</label>
                    <select 
                      className="modern-select"
                      value={selectedPriceRange}
                      onChange={(e) => setSelectedPriceRange(e.target.value)}
                    >
                      <option value="">Tất cả mức giá</option>
                      <option value="30000000-500000000">300 triệu - 500 triệu</option>
                      <option value="500000000-1000000000">500 triệu - 1 tỷ</option>
                      <option value="1000000000-5000000000">1 tỷ - 5 tỷ</option>
                      <option value="5000000000+">Trên 5 tỷ</option>
                    </select>
                  </div>
                </div>
                
                <div className="search-actions">
                  <button 
                    className="search-btn primary"
                    onClick={() => handleSearch(1)}
                    disabled={loading}
                  >
                    <FaSearch className="me-2" />
                    {loading ? 'Đang tìm...' : 'Tìm kiếm'}
                  </button>
                  
                  <button 
                    className="search-btn secondary"
                    onClick={() => setShowImageSearch(true)}
                  >
                    <FaCamera className="me-2" />
                    Tìm bằng ảnh
                  </button>
                </div>
              </div>
            </div>

            {/* Category Pills */}
            <div className="category-pills">
              {categories.slice(0, 8).map((cat) => (
                <div
                  key={cat.id}
                  className={`category-pill ${selectedCategory === cat.name ? " active" : ""}`}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    handleSearch(1); 
                  }}
                >
                  <div className="category-icon">
                    {cat.name === "SUV" && <FaCarSide />}
                    {cat.name === "Sedan" && <GiCarSeat />}
                    {cat.name === "Hatchback" && <GiGearStick />}
                    {cat.name === "Coupe" && <FaTruckPickup />}
                  </div>
                  <span>{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Image Search Modal */}
        <Modal show={showImageSearch} onHide={resetImageSearch} centered size="md">
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-bold">Tìm kiếm bằng hình ảnh</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <div className="image-upload-area">
              {!imagePreview ? (
                <div 
                  className="upload-placeholder"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FaCamera size={48} className="text-muted mb-3" />
                  <h5 className="mb-2">Tải lên ảnh xe</h5>
                  <p className="text-muted">Chọn ảnh để tìm những chiếc xe tương tự</p>
                  <Button variant="outline-primary" className="mt-2">
                    Chọn ảnh
                  </Button>
                </div>
              ) : (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                  <div className="image-actions">
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Đổi ảnh
                    </Button>
                  </div>
                </div>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="d-none"
              />
            </div>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="outline-secondary" onClick={resetImageSearch}>
              Hủy
            </Button>
            <Button 
              variant="primary" 
              onClick={handleImageSearch}
              disabled={!selectedImage || imageSearchLoading}
            >
              {imageSearchLoading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Đang tìm...
                </>
              ) : (
                <>
                  <FaSearch className="me-2" />
                  Tìm kiếm
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

      {/* Prediction Result Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="md">
        <Modal.Header closeButton>
          <Modal.Title>Kết quả dự đoán</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Xe được dự đoán là: <span className="fw-bold">{nameCarPredict.predicted_class}</span></h5>
          <p>Độ tin cậy: {(nameCarPredict.confidence * 100).toFixed(2)}%</p>
          
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>


      {/* Cars Section */}
      <div className="cars-section">
        <div className="section-header">
          <h2 className="section-title">Khám Phá Tất Cả Xe</h2>
          <p className="section-subtitle">Tìm chiếc xe phù hợp nhất với nhu cầu của bạn</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <Spinner animation="border" variant="primary" size="lg" />
            <p className="mt-3">Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-message">{error}</div>
          </div>
        ) : cars.length === 0 ? (
          <div className="no-results">
            <h4>Không tìm thấy xe nào</h4>
            <p>Hãy thử thay đổi bộ lọc tìm kiếm</p>
          </div>
        ) : (
          <>
            <div className="cars-grid">
              {cars.map((car) => (
                <Link to={`/get-car-by-id/${car.id}`} key={car.id} className="car-card-link">
                  <div className="car-card-modern">
                    <div className="car-image-container">
                      <img
                        src={car.carImage || "https://via.placeholder.com/400x250"}
                        alt={car.name}
                        className="car-image"
                      />
                      <div className="car-overlay">
                        <span className="view-details">Xem chi tiết</span>
                      </div>
                    </div>
                    <div className="car-content">
                      <div className="car-header">
                        <h3 className="car-name">{car.name || "Unknown Car"}</h3>
                      </div>
                      <div className="car-info">
                        <div className="car-year">
                          Năm: {car.year ? new Date(car.year).getFullYear() : "N/A"}
                        </div>
                        <div className="car-price">
                          {car.price ? car.price.toLocaleString("vi-VN") + " VND" : "Liên hệ"}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Modern Pagination */}
            <div className="modern-pagination">
              <button
                onClick={() => handleCarPageChange(carPage - 1)}
                disabled={carPage === 1}
                className="pagination-btn"
              >
                <FaChevronLeft />
              </button>
              
              <div className="pagination-numbers">
                {Array.from({ length: Math.min(5, carTotalPages) }, (_, i) => {
                  let pageNum;
                  if (carTotalPages <= 5) {
                    pageNum = i + 1;
                  } else if (carPage <= 3) {
                    pageNum = i + 1;
                  } else if (carPage >= carTotalPages - 2) {
                    pageNum = carTotalPages - 4 + i;
                  } else {
                    pageNum = carPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handleCarPageChange(pageNum)}
                      className={`pagination-number ${carPage === pageNum ? " active" : ""}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handleCarPageChange(carPage + 1)}
                disabled={carPage === carTotalPages}
                className="pagination-btn"
              >
                <FaChevronRight />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Brands Section */}
      <div className="brands-section">
      <div className="section-header">
        <h2 className="section-title">Thương Hiệu Hàng Đầu</h2>
        <p className="section-subtitle">Khám phá các thương hiệu xe hơi uy tín nhất</p>
      </div>

      <div className="brands-grid">
        {currentBranches.map((branch) => (
          <div
            key={branch.id}
            className="brand-card-modern"
            onClick={() => console.log("Chọn:", branch.name)}
          >
            <div className="brand-image-container">
              <img
                src={branch.imageBranch || "https://via.placeholder.com/200"}
                alt={branch.name}
                className="brand-image"
              />
            </div>
            <div className="brand-info">
              <h4 className="brand-name">{branch.name}</h4>
              <p className="brand-country">{branch.country || "N/A"}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="modern-pagination">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn">
          <FaChevronLeft />
        </button>
        <div className="pagination-numbers">

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => handlePageChange(i + 1)}
            className={`pagination-number${currentPage === i + 1 ? " active" : ""}`}
          >
            {i + 1}
          </button>
        ))}
        </div>

        <button className="pagination-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          <FaChevronRight />
        </button>
      </div>
    </div>

      <Chat />

    </>
  )

}