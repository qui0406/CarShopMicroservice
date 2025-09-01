import React, { useState, useEffect } from "react";
import { FaCarSide, FaGasPump, FaSpinner, FaCalendarAlt, FaMapMarkerAlt, FaKey, FaSnowflake, FaBluetooth, FaCamera, FaShieldAlt } from "react-icons/fa";
import { GiCarSeat, GiGearStick } from "react-icons/gi";
import { IoMdSpeedometer } from "react-icons/io";
import { Card, Button, Row, Col, Spinner, Badge, Container } from "react-bootstrap";
import Hero from "./Layouts/Hero";
import axios, { authApis, endpoints } from "./../configs/APIs";
import "./../styles/Car.css";
import { Link } from "react-router-dom";

export default function Car() {
  const [cars, setCars] = useState([]); // Added missing cars state
  const [carPage, setCarPage] = useState(1);
  const [carTotalPages, setCarTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch cars when component mounts or carPage changes
  useEffect(() => {
    fetchCars(carPage);
  }, [carPage]);

  const fetchCars = async (pageNum) => {
    try {
      setLoading(true);
      setError(""); // Reset error state
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

  // Handle pagination
  const handleCarPageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= carTotalPages) {
      setCarPage(pageNum);
    }
  };

  return (
    <>
      <Container className="car-container my-4">
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
                        <Card.Text className="car-year">
                          {/* <FaCalendarAlt className="me-2" /> */}
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
              <Button
                onClick={() => handleCarPageChange(carPage - 1)}
                disabled={carPage === 1}
                variant="outline-primary"
                className="me-2"
              >
                Previous
              </Button>
              {Array.from({ length: carTotalPages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  onClick={() => handleCarPageChange(pageNum)}
                  variant={carPage === pageNum ? "primary" : "outline-primary"}
                  className="me-2"
                >
                  {pageNum}
                </Button>
              ))}
              <Button
                onClick={() => handleCarPageChange(carPage + 1)}
                disabled={carPage === carTotalPages}
                variant="outline-primary"
              >
                Next
              </Button>
            </div>
          </>
        )}
      </Container>
    </>
  );
}