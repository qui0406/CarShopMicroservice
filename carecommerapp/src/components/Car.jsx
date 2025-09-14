import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Spinner, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import axios, { endpoints } from "./../configs/APIs";
import "./../styles/Car.css";

export default function CarSection() {
  const [cars, setCars] = useState([]);
  const [carPage, setCarPage] = useState(1);
  const [carTotalPages, setCarTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch cars when page changes
  useEffect(() => {
    fetchCars(carPage);
  }, [carPage]);

  const fetchCars = async (pageNum) => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(endpoints["get-cars"], {
        params: { page: pageNum },
      });
      const result = res.data?.result || {};
      setCars(Array.isArray(result.data) ? result.data : []);
      setCarTotalPages(result.totalPages || 1);
    } catch (err) {
      console.error("Error fetching cars:", err);
      setError("Không thể tải danh sách xe. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleCarPageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= carTotalPages) {
      setCarPage(pageNum);
    }
  };

  return (
    <Container className="cars-section my-5">
      <div className="section-header text-center mb-4">
        <h2 className="section-title">Khám Phá Tất Cả Xe</h2>
        <p className="section-subtitle">
          Tìm chiếc xe phù hợp nhất với nhu cầu của bạn
        </p>
      </div>

      {loading ? (
        <div className="loading-container text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="error-container text-center text-danger">{error}</div>
      ) : cars.length === 0 ? (
        <div className="no-results text-center">
          <h5>Không tìm thấy xe nào</h5>
          <p>Hãy thử thay đổi bộ lọc tìm kiếm</p>
        </div>
      ) : (
        <>
          <Row>
            {cars.map((car) => (
              <Col md={4} sm={6} xs={12} key={car.id} className="mb-4">
                <Link
                  to={`/get-car-by-id/${car.id}`}
                  className="car-card-link"
                >
                  <Card className="car-card-modern shadow-sm h-100">
                    <div className="car-image-container">
                      <Card.Img
                        variant="top"
                        src={car.carImage || "https://via.placeholder.com/400x250"}
                        alt={car.name}
                        className="car-image"
                      />
                      <div className="car-overlay">
                        <span className="view-details">Xem chi tiết</span>
                      </div>
                    </div>
                    <Card.Body className="car-content text-center">
                      <Card.Title className="car-name">
                        {car.name || "Unknown Car"}
                      </Card.Title>
                      <Card.Text className="car-year">
                        Năm:{" "}
                        {car.year ? new Date(car.year).getFullYear() : "N/A"}
                      </Card.Text>
                      <Card.Text className="car-price">
                        {car.price
                          ? car.price.toLocaleString("vi-VN") + " VND"
                          : "Liên hệ"}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          <div className="modern-pagination d-flex justify-content-center mt-4">
            <Button
              onClick={() => handleCarPageChange(carPage - 1)}
              disabled={carPage === 1}
              variant="outline-primary"
              className="pagination-btn me-2"
            >
              <FaChevronLeft />
            </Button>

            {Array.from({ length: carTotalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <Button
                  key={pageNum}
                  onClick={() => handleCarPageChange(pageNum)}
                  variant={carPage === pageNum ? "primary" : "outline-primary"}
                  className="pagination-number me-2"
                >
                  {pageNum}
                </Button>
              )
            )}

            <Button
              onClick={() => handleCarPageChange(carPage + 1)}
              disabled={carPage === carTotalPages}
              variant="outline-primary"
              className="pagination-btn"
            >
              <FaChevronRight />
            </Button>
          </div>
        </>
      )}
    </Container>
  );
}
