import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Button, Row, Col, Container } from "react-bootstrap";
import "./../styles/FormConfirm.css"
import axios, { authApis, endpoints } from "./../configs/APIs";

export default function FormConfirm() {
  const location = useLocation();
  const navigate = useNavigate();

  const { car, orders } = location.state || {};

  const handlePay = async () => {
    try {
      // Call backend API to get VNPay payment URL
      const response = await authApis().post("http://localhost:8888/api/v1/payment/checkout/url", {
        txnRef: orders.id,
        amount: 5000000,
        ipAddress: "127.0.0.1",
      });
        window.location.href = response.data.result.vnpUrl;
      } catch (error) {
        console.error("Error fetching payment URL:", error);
        alert("Không thể tạo URL thanh toán. Vui lòng thử lại!");
      }
    };

  useEffect(() => {
    if (car && orders) {
      console.log("Car:", car);
      console.log("Orders:", orders);
    }
  }, [car, orders]);

  if (!car || !orders) {
    return (
      <Container className="my-5 text-center">
        <h2>Không có thông tin đơn hàng</h2>
        <Button variant="primary" onClick={() => navigate("/")}>
          Quay về trang chủ
        </Button>
      </Container>
    );
  }

  return (
    <Container className="my-5 form-confirm">
      <Row>
        {/* Thông tin xe */}
        <Col md={6}>
          <Card className="mb-4">
            <Card.Img
              variant="top"
              src={car.images?.[0] || "https://via.placeholder.com/600x400"}
              style={{ height: "250px", objectFit: "cover" }}
            />
            <Card.Body>
              <Card.Title>{car.carModel}</Card.Title>
              <Card.Text>
                <strong>Tên xe:</strong> {car.name}
              </Card.Text>
              <Card.Text>
                <strong>Năm sản xuất:</strong> {car.year?.split("-")[0]}
              </Card.Text>
              <Card.Text>
                <strong>Giá mỗi xe:</strong>{" "}
                {new Intl.NumberFormat("vi-VN").format(car.price)} VNĐ
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Chi tiết đặt hàng */}
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Chi tiết đặt hàng</Card.Title>
              <Card.Text>
                <strong>Mã đơn hàng:</strong> {orders.id}
              </Card.Text>
              <Card.Text>
                <strong>Họ tên:</strong> {orders.orderDetails.fullName}
              </Card.Text>
              <Card.Text>
                <strong>Số điện thoại:</strong> {orders.orderDetails.phoneNumber}
              </Card.Text>
              <Card.Text>
                <strong>Địa chỉ:</strong> {orders.orderDetails.address}
              </Card.Text>
              <Card.Text>
                <strong>Ngày sinh:</strong> {orders.orderDetails.dob}
              </Card.Text>
              <Card.Text>
                <strong>CCCD:</strong> {orders.orderDetails.cccd}
              </Card.Text>
              <Card.Text>
                <strong>Số lượng:</strong> {orders.orderDetails.quantity}
              </Card.Text>
              <Card.Text>
                <strong>Tổng tiền:</strong>{" "}
                {new Intl.NumberFormat("vi-VN").format(orders.orderDetails.totalAmount)} VNĐ
              </Card.Text>

              <Button variant="success" className="w-100 mt-3" onClick={handlePay}>
                Thanh toán
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
