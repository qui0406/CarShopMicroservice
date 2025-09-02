import React, { useState } from "react";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import { authApis, endpoints } from "../../configs/APIs";

export default function HomeStaff() {
  const [car, setCar] = useState({
    name: "",
    price: "",
    year: "",
    carBranch: "",
    carModel: "",
    carFeature: {
      carComfortResponse: {
        mayDieuHoa: false,
        manHinh: "",
        ghe: "",
        sacKhongDay: false,
        copDien: false,
        cuaSo: "",
        bluetooth: false,
        loa: "",
        gps: false,
      },
      carExteriorResponse: {
        den: "",
        gatMua: "",
        smartKey: false,
        guongDien: false,
      },
      featureSafetyResponse: {
        tuiKhi: false,
        phanh: "",
        canBangDienTu: false,
        hoTroGiuLan: false,
        camera: false,
        camBienDoXe: false,
      },
    },
    carService: {
      dongCo: "",
      hopSo: "",
      congSuat: "",
      momenXoan: "",
      dungTichXiLanh: "",
      dungTichXang: "",
      chieuDai: "",
      mauSac: "",
      tocDoToiDa: "",
      loaiNhienLieu: "",
    },
  });

  const [images, setImages] = useState([]); // Store selected image files

  const handleChange = (e, path) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;

    if (!path) {
      setCar({ ...car, [e.target.name]: value });
    } else {
      const keys = path.split(".");
      const newCar = { ...car };
      let obj = newCar;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      setCar(newCar);
    }
  };

  const handleImageChange = (e) => {
    const newImages = [...images, ...Array.from(e.target.files)];
    setImages(newImages);
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    // Create FormData object
    const formData = new FormData();
    
    // Append car data as JSON
    for (const key in car) {
      if (typeof car[key] === "object") {
        for (const subKey in car[key]) {
          if (typeof car[key][subKey] === "object") {
            for (const subSubKey in car[key][subKey]) {
              formData.append(`${key}.${subKey}.${subSubKey}`, car[key][subKey][subSubKey]);
            }
          } else {
            formData.append(`${key}.${subKey}`, car[key][subKey]);
          }
        }
      } else {
        formData.append(key, car[key]);
      }
    }

    
    // Append image files
    images.forEach((image, index) => {
      formData.append(`images[${index}]`, image);
    });

    console.log(formData)

    try {
      // Send FormData to backend
      const response = await authApis().post(endpoints["create-car"],  formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })

      

      if (response.ok) {
        const result = await response.json();
        console.log("Dữ liệu đã gửi thành công:", result);
        alert("Thông tin xe và hình ảnh đã được lưu!");
      } else {
        console.error("Lỗi khi gửi dữ liệu:", response.statusText);
        alert("Có lỗi xảy ra khi gửi dữ liệu!");
      }
    } catch (error) {
      console.error("Lỗi:", error);
      alert("Có lỗi xảy ra khi gửi dữ liệu!");
    }
  };

  return (
    <div className="container mt-4" style={{ padding: "70px" }}>
      <Card className="p-4 shadow-lg">
        <h3>Tạo thông tin xe</h3>
        <Form onSubmit={handleSubmit}>
          {/* Thông tin cơ bản */}
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Tên xe</Form.Label>
                <Form.Control name="name" value={car.name} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Giá</Form.Label>
                <Form.Control type="number" name="price" value={car.price} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Năm sản xuất</Form.Label>
                <Form.Control type="date" name="year" value={car.year} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Dòng xe:</Form.Label>
                <Form.Control name="carBranch" value={car.carBranch} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          <hr />
          <h5>Car Comfort</h5>
          <Row>
            <Col>
              <Form.Check
                label="Máy điều hòa"
                checked={car.carFeature.carComfortResponse.mayDieuHoa}
                onChange={(e) => handleChange(e, "carFeature.carComfortResponse.mayDieuHoa")}
                type="checkbox"
              />
              <Form.Check
                label="Sạc không dây"
                checked={car.carFeature.carComfortResponse.sacKhongDay}
                onChange={(e) => handleChange(e, "carFeature.carComfortResponse.sacKhongDay")}
                type="checkbox"
              />
              <Form.Check
                label="Cốp điện"
                checked={car.carFeature.carComfortResponse.copDien}
                onChange={(e) => handleChange(e, "carFeature.carComfortResponse.copDien")}
                type="checkbox"
              />
              <Form.Check
                label="Bluetooth"
                checked={car.carFeature.carComfortResponse.bluetooth}
                onChange={(e) => handleChange(e, "carFeature.carComfortResponse.bluetooth")}
                type="checkbox"
              />
              <Form.Check
                label="GPS"
                checked={car.carFeature.carComfortResponse.gps}
                onChange={(e) => handleChange(e, "carFeature.carComfortResponse.gps")}
                type="checkbox"
              />
              <Form.Group>
                <Form.Label>Màn hình</Form.Label>
                <Form.Control
                  value={car.carFeature.carComfortResponse.manHinh}
                  onChange={(e) => handleChange(e, "carFeature.carComfortResponse.manHinh")}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Cửa sổ</Form.Label>
                <Form.Control
                  value={car.carFeature.carComfortResponse.cuaSo}
                  onChange={(e) => handleChange(e, "carFeature.carComfortResponse.cuaSo")}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Ghế</Form.Label>
                <Form.Control
                  value={car.carFeature.carComfortResponse.ghe}
                  onChange={(e) => handleChange(e, "carFeature.carComfortResponse.ghe")}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Loa</Form.Label>
                <Form.Control
                  value={car.carFeature.carComfortResponse.loa}
                  onChange={(e) => handleChange(e, "carFeature.carComfortResponse.loa")}
                />
              </Form.Group>
            </Col>
          </Row>

          <hr />
          <h5>Car Exterior</h5>
          <Row>
            <Col md={6}>
              <Form.Check
                label="Gương điện"
                checked={car.carFeature.carExteriorResponse.guongDien}
                onChange={(e) => handleChange(e, "carFeature.carExteriorResponse.guongDien")}
                type="checkbox"
              />
              <Form.Group>
                <Form.Label>Gạt mưa</Form.Label>
                <Form.Control
                  value={car.carFeature.carExteriorResponse.gatMua}
                  onChange={(e) => handleChange(e, "car.carFeature.carExteriorResponse.gatMua")}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Check
                label="SmartKey"
                checked={car.carFeature.carExteriorResponse.smartKey}
                onChange={(e) => handleChange(e, "carFeature.carExteriorResponse.smartKey")}
                type="checkbox"
              />
              <Form.Group>
                <Form.Label>Đèn</Form.Label>
                <Form.Control
                  value={car.carFeature.carExteriorResponse.den}
                  onChange={(e) => handleChange(e, "car.carFeature.carExteriorResponse.den")}
                />
              </Form.Group>
            </Col>
          </Row>

          <hr />
          <h5>Car Service</h5>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Động cơ</Form.Label>
                <Form.Control
                  value={car.carService.dongCo}
                  onChange={(e) => handleChange(e, "carService.dongCo")}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Màu sắc</Form.Label>
                <Form.Control
                  value={car.carService.mauSac}
                  onChange={(e) => handleChange(e, "carService.mauSac")}
                />
              </Form.Group>
            </Col>
          </Row>

          <hr />
          <h5>Hình ảnh</h5>
          <Form.Group>
            <Form.Label>Chọn hình ảnh</Form.Label>
            <Form.Control
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="mb-2"
            />
          </Form.Group>
          {images.length > 0 && (
            <div className="mt-2">
              <h6>Danh sách hình ảnh đã chọn:</h6>
              {images.map((image, index) => (
                <div key={index} className="d-flex align-items-center mb-2">
                  <span>{image.name}</span>
                  <Button
                    variant="danger"
                    size="sm"
                    className="ms-2"
                    onClick={() => handleRemoveImage(index)}
                  >
                    Xóa
                  </Button>
                </div>
              ))}
            </div>
          )}
          <Button
            variant="secondary"
            onClick={() => document.querySelector('input[type="file"]').click()}
            className="mt-2"
          >
            + Thêm ảnh
          </Button>

          <hr />
          <Button type="submit" variant="primary" className="mt-3" >
            Lưu thông tin xe
          </Button>
        </Form>
      </Card>
    </div>
  );
}