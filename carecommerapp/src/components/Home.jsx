import React, { useState, useEffect } from "react";
import { FaCarSide, FaTruckPickup } from "react-icons/fa";
import { GiCarSeat, GiGearStick } from "react-icons/gi";
import { useParams } from "react-router-dom";
import cookie from "react-cookies";
import { Card, Button, Row, Col, Spinner } from "react-bootstrap";
import Hero from "./Layouts/Hero";
import MySpinner from "./Layouts/MySpinner";
import { authApis, endpoints } from "./../configs/APIs";
import "./../styles/Home.css";
import { Link } from 'react-router-dom';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [branches, setBranch] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [cars, setCars] = useState([]);
  const [carPage, setCarPage] = useState(1);
  const [carTotalPages, setCarTotalPages] = useState(1);


  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 5; // 5 cards per page on desktop

  // Calculate the indices for the current page
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentBranches = branches.slice(indexOfFirstCard, indexOfLastCard);


  const totalPageBranches = Math.ceil(branches.length / cardsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const fetchBranches = async (pageNum) => {
    try {
      setLoading(true);
      const res = await authApis().get(endpoints["car-branch"], {
        params: { page: pageNum },
      });

      const result = res.data.result;
      setBranch(result.data);
      setTotalPages(result.totalPages);
      console.log("Branches fetched:", result.data);
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProductsCars = async (pageNum) => {
    try {
      setLoading(true);
      const res = await authApis().get(endpoints["get-cars"], {
        params: { page: pageNum },
      });

      const result = res.data.result;
      console.log("Result:", result.data);
      setCars(result.data);
      setCarTotalPages(result.totalPages);
      console.log("Cars fetched:", result.data);
    } catch (error) {
      console.error("Error fetching cars:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches(page);
    loadProductsCars(carPage);
  }, [page, carPage]);

  const handleBranchPageChange = (pageNumber) => {
    setPage(pageNumber);
  };

  const handleCarPageChange = (pageNumber) => {
    setCarPage(pageNumber);
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
          {/* Overlay */}
          <div className="overlay"></div>

          <div className="relative z-10 text-center px-4">
            <h2 className="text-white text-lg mb-3">
              Find cars for sale and rent near you
            </h2>
            <h1 className="text-white text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect Car
            </h1>

            {/* Tabs */}
            <div className="flex justify-center gap-6 text-white mb-8">
              <button className="tab-button border-b-2 border-white">All</button>
              <button className="tab-button">New</button>
              <button className="tab-button">Used</button>
            </div>

            {/* Search Form */}
            <div className="search-form max-w-4xl mx-auto">
              <select className="custom-select">
                <option value="">Any Makes</option>
                <option value="toyota">Toyota</option>
                <option value="honda">Honda</option>
                <option value="bmw">BMW</option>
              </select>
              <select className="custom-select">
                <option value="">Any Models</option>
                <option value="civic">Civic</option>
                <option value="camry">Camry</option>
                <option value="3series">3 Series</option>
              </select>
              <select className="custom-select">
                <option value="">Prices: All Prices</option>
                <option value="10-20">$10k - $20k</option>
                <option value="20-40">$20k - $40k</option>
                <option value="40+">$40k+</option>
              </select>
              <button className="search-button">Search Cars</button>
            </div>

            {/* Categories */}
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <div className="category-item">
                <FaCarSide /> SUV
              </div>
              <div className="category-item">
                <GiCarSeat /> Sedan
              </div>
              <div className="category-item">
                <GiGearStick /> Hatchback
              </div>
              <div className="category-item">
                <FaTruckPickup /> Coupe
              </div>
              <div className="category-item">Hybrid</div>
            </div>
          </div>
        </div>
      </div>

      <div className="car-container my-4">
        <h2 className="car-title mb-4 text-center">Explore All Vehicles</h2>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
          <>
            <Row>
              {cars.map((car) => (
                <Col md={3} sm={6} xs={12} key={car.id} className="mb-3">
                  <Link to={`/get-car-by-id/${car.id}`} style={{ textDecoration: 'none' }}>
                  <Card className="car-card shadow-sm">
                    <Card.Img
                      variant="top"
                      src={car.carImage} // ảnh xe
                      alt={car.name}
                      className="car-image"
                    />
                    <Card.Body className="text-center">
                      <Card.Title className="car-name">{car.name}</Card.Title>
                      <Card.Text className="car-type">{car.type}</Card.Text>
                      <Card.Text className="car-year">Năm sản xuất: {new Date(car.year).getFullYear()}</Card.Text>
                      <Card.Text className="car-price">
                        Giá: {car.price.toLocaleString('vi-VN')} VND
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
              {Array.from({ length: carTotalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handleCarPageChange(pageNum)}
                    className={`btn ${
                      carPage === pageNum ? "btn-primary" : "btn-outline-primary"
                    } me-2`}
                  >
                    {pageNum}
                  </button>
                )
              )}
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

      <div className="brand-container my-4">
      <h2 className="brand-title mb-4 text-center">Explore Our Premium Brands</h2>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          <Row className="g-4 justify-content-center">
            {currentBranches.map((branch) => (
              <Col
                md={2} // 5 columns on medium and larger screens (12 / 2 = 6, adjusted for 5)
                sm={6} // 2 columns on small screens
                xs={12} // 1 column on extra small screens
                key={branch.id}
                className="mb-4"
              >
                <Card className="brand-card shadow-sm h-100 d-flex flex-column">
                  <Card.Img
                    variant="top"
                    src={branch.imageBranch}
                    alt={branch.name}
                    className="brand-image"
                    style={{ objectFit: "cover", height: "200px" }} // Uniform image height
                  />
                  <Card.Body className="text-center d-flex flex-column justify-content-between">
                    <div>
                      <Card.Title className="brand-name">{branch.name}</Card.Title>
                      <Card.Text className="brand-country">{branch.country}</Card.Text>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          
        </>
      )}
    </div>
    </>
  );
};

export default Home;