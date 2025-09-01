import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import "./../styles/Reserve.css";
import { useNavigate } from "react-router-dom";
import  axios ,{ authApis, endpoints } from "./../configs/APIs";

export default function Reserve() {
  const location = useLocation();
  const car = location.state?.car || JSON.parse(sessionStorage.getItem("car"));
  const navigate = useNavigate();
  

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    dob: "",
    cccd: "",
    quantity: 1
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phoneNumber || !formData.address || !formData.dob || !formData.cccd) {
      alert("Vui lòng nhập đầy đủ thông tin trước khi đặt xe!");
      return;
    }

    const totalAmount = car.price * formData.quantity;

    const orders = {
      carId: car.id,
      unitPrice: car.price,
      quantity: formData.quantity,
      orderDetailsRequest: {
        address: formData.address,
        fullName: formData.fullName,
        dob: formData.dob, // đảm bảo dạng "2004-04-06"
        cccd: formData.cccd,
        phoneNumber: formData.phoneNumber, // đúng key
        unitPrice: car.price,
        quantity: formData.quantity,
        totalAmount: totalAmount,
      },
    };

    console.log(orders)

    try {
      const response = await authApis().post(endpoints["create-orders"], orders);
      
      if (response.status === 200 || response.status === 201) {
        console.log("Order created:", response.data);
        alert("Đặt hàng thành công!");
        navigate("/confirm", { state: { car, orders: response.data.result } }); 
      } else {
        console.error("Error:", response.data);
        alert("Đặt hàng thất bại!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Lỗi kết nối server!");
    }
  };

  if (!car) {
    return (
      <Container className="my-5 text-center">
        <h2>Không có thông tin xe</h2>
        <p>Vui lòng quay lại chọn xe.</p>
      </Container>
    );
  }

  return (
    <Container className="my-5 form-reserve">
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
                <strong>Giá:</strong> {new Intl.NumberFormat("vi-VN").format(car.price)} VNĐ
              </Card.Text>
              <Card.Text>
                <strong>Tên:</strong> {car.name || "N/A"}
              </Card.Text>
              <Card.Text>
                <strong>Năm sản xuất:</strong> {car.year.split("-")[0] || "N/A"}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Form đặt xe */}
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Đặt Xe</Card.Title>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Họ và tên</Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Nhập họ và tên"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Họ và tên</Form.Label>
                  <Form.Control
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Số điện thoại"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>CCCD/CMND:</Form.Label>
                  <Form.Control
                    type="number"
                    name="cccd"
                    value={formData.cccd}
                    onChange={handleChange}
                    placeholder="Nhập CCCD"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Ngày sinh: </Form.Label>
                  <Form.Control
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Địa chỉ: </Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Địa chỉ"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Số lượng: </Form.Label>
                  <div className="d-flex align-items-center">
                    <Button
                      variant="secondary"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          quantity: Math.max(1, prev.quantity - 1),
                        }))
                      }
                    >
                      -
                    </Button>

                    <Form.Control
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      className="mx-2 text-center"
                      style={{ width: "80px" }}
                      min="1"
                      required
                    />

                    <Button
                      variant="secondary"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          quantity: prev.quantity + 1,
                        }))
                      }
                    >
                      +
                    </Button>
                  </div>
                </Form.Group>



                <Button variant="primary" type="submit" className="w-100" onClick={handleSubmit}>
                  Xác nhận đặt xe
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
