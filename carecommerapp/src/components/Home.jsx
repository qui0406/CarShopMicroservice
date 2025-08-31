import React, { useState, useEffect } from "react";
import { FaCarSide, FaTruckPickup } from "react-icons/fa";
import { GiCarSeat, GiGearStick } from "react-icons/gi";
import { Link } from "react-router-dom";
import { Card, Button, Row, Col, Spinner } from "react-bootstrap";
import  axios ,{ authApis, endpoints } from "./../configs/APIs";
import "./../styles/Home.css";

const Home = () => {
  // Initialize state as arrays to prevent undefined errors
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [models, setModels] = useState([]);
  const [cars, setCars] = useState([]);
  
  const [pageBranch, setPageBranch] = useState(1);
  const [totalPagesBranch, setTotalPagesBranch] = useState(1);
  const [pageCategory, setPageCategory] = useState(1);
  const [totalPagesCategory, setTotalPagesCategory] = useState(1);
  const [pageModel, setPageModel] = useState(1);
  const [totalPagesModel, setTotalPagesModel] = useState(1);
  const [carPage, setCarPage] = useState(1);
  const [carTotalPages, setCarTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cardsPerPage = 5;
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentBranches = branches.slice(indexOfFirstCard, indexOfLastCard);

  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState(""); // dạng "10000-20000"


  // Fetch branches
  const fetchBranches = async (pageNum) => {
    try {
      setLoading(true);
      const res = await axios.get(endpoints["car-branch"], {
        params: { page: pageNum },
      });
      const result = res.data?.result || {};
      setBranches(Array.isArray(result.data) ? result.data : []);
      setTotalPagesBranch(result.totalPagesBranch || 1);
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
        // Ví dụ selectedPriceRange = "$10k - $20k" hoặc "10000-20000"
        const cleanRange = selectedPriceRange.replace(/\$/g, "").replace(/k/g, "000").replace(/\s/g, "");
        const [from, to] = cleanRange.split("-");
        
        if (from && to) {
          params.fromPrice = parseInt(from);
          params.toPrice = parseInt(to);
        }
      }

      const res = await axios.get(endpoints["filter-cars"], { params });
      console.log(params)
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



  return (
    <>
      <div className="w-full">
        {/* Hero Section */}
        <div
          className="relative h-[90vh] bg-cover bg-center flex flex-col items-center justify-center text-white"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1400&q=80')",
          }}
        >
          <div className="overlay"></div>
          <div className="relative z-10 text-center px-4">
            <h2 className="text-white text-lg mb-3">
              Find cars for sale and rent near you
            </h2>
            <h1 className="text-white text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Car
            </h1>

            {/* Search Form */}
            <div className="search-form max-w-4xl mx-auto">
              <select className="custom-select" onChange={(e) => setSelectedBranch(e.target.value)}>
                <option value="">Hãng xe: Tất cả</option>
                {branches.length > 0 ? (
                  branches.map((branch) => (
                    <option key={branch.id} value={branch.name}>
                      {branch.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No branches available</option>
                )}
              </select>
              <select className="custom-select" onChange={(e) => setSelectedModel(e.target.value)}>
                <option value="">Dòng xe: Tất cả</option>
                {models.length > 0 ? (
                  models.map((model) => (
                    <option key={model.id} value={model.name}>
                      {model.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No models available</option>
                )}
              </select>
              <select className="custom-select" onChange={(e) => setSelectedPriceRange(e.target.value)}>
                <option value="">Giá: Tất cả</option>
                <option value="30000000-500000000">300 triệu - 500 triệu</option>
                <option value="500000000-1000000000">500 triệu - 1 tỷ</option>
                <option value="1000000000-5000000000">1 tỷ - 5 tỷ</option>
                <option value="5000000000+">Trên 5 tỷ</option>
              </select>
              <button className="search-button" onClick={() => handleSearch(1)}>Tìm kiếm</button>
            </div>

           <div className="mt-10 flex flex-wrap justify-center gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`category-item ${selectedCategory === cat.name ? "active" : ""}`}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  handleSearch(1); 
                }}
              >
                {cat.name === "SUV" && <FaCarSide />}
                {cat.name === "Sedan" && <GiCarSeat />}
                {cat.name === "Hatchback" && <GiGearStick />}
                {cat.name === "Coupe" && <FaTruckPickup />}
                {cat.name === "Hybrid" && <span>Hybrid</span>}
                {cat.name}
              </div>
            ))}
          </div>


          </div>
        </div>
      </div>

      {/* Cars Section */}
      <div className="car-container my-4">
        <h2 className="car-title mb-4 text-center">Explore All Vehicles</h2>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : error ? (
          <div className="text-center text-danger">{error}</div>
        ) : cars.length === 0 ? (
          <div className="text-center">No cars available</div>
        ) : (
          <>
            <Row>
              {cars.map((car) => (
                <Col md={3} sm={6} xs={12} key={car.id} className="mb-3">
                  <Link to={`/get-car-by-id/${car.id}`} style={{ textDecoration: "none" }}>
                    <Card className="car-card shadow-sm">
                      <Card.Img
                        variant="top"
                        src={car.carImage || "https://via.placeholder.com/300"}
                        alt={car.name}
                        className="car-image"
                      />
                      <Card.Body className="text-center">
                        <Card.Title className="car-name">{car.name || "Unknown Car"}</Card.Title>
                        <Card.Text className="car-type">{car.type || "N/A"}</Card.Text>
                        <Card.Text className="car-year">
                          Năm sản xuất: {car.year ? new Date(car.year).getFullYear() : "N/A"}
                        </Card.Text>
                        <Card.Text className="car-price">
                          Giá: {car.price ? car.price.toLocaleString("vi-VN") + " VND" : "N/A"}
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>

            {/* Pagination for Cars */}
            <div className="pagination d-flex justify-content-center mt-4">
              <button
                onClick={() => handleCarPageChange(carPage - 1)}
                disabled={carPage === 1}
                className="btn btn-outline-primary me-2"
              >
                Previous
              </button>
              {Array.from({ length: carTotalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handleCarPageChange(pageNum)}
                  className={`btn ${carPage === pageNum ? "btn-primary" : "btn-outline-primary"} me-2`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => handleCarPageChange(carPage + 1)}
                disabled={carPage === carTotalPages}
                className="btn btn-outline-primary"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {/* Brands Section */}
      <div className="brand-container my-4">
        <h2 className="brand-title mb-4 text-center">Explore Our Premium Brands</h2>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : error ? (
          <div className="text-center text-danger">{error}</div>
        ) : currentBranches.length === 0 ? (
          <div className="text-center">No brands available</div>
        ) : (
          <Row className="g-4 justify-content-center">
            {currentBranches.map((branch) => {
              const isSelected = selectedBranch === branch.id;
              return (
                <Col
                  key={branch.id}
                  md={2}
                  sm={6}
                  xs={12}
                  className="mb-4"
                  onClick={() => {setSelectedBranch(branch.name); handleSearch(1);}}
                >
                  <Card
                    className={`brand-card shadow-sm h-100 d-flex flex-column ${isSelected ? "border-primary" : ""}`}
                    style={{ cursor: "pointer" }}
                  >
                    <Card.Img
                      variant="top"
                      src={branch.imageBranch || "https://via.placeholder.com/200"}
                      alt={branch.name || "Brand"}
                      className="brand-image"
                      style={{ objectFit: "cover", height: "200px" }}
                    />
                    <Card.Body className="text-center d-flex flex-column justify-content-between">
                      <div>
                        <Card.Title className="brand-name">{branch.name || "Unknown Brand"}</Card.Title>
                        <Card.Text className="brand-country">{branch.country || "N/A"}</Card.Text>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </div>

    </>
  );
};

export default Home;