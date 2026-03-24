import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer style={{ background: "#f8f9fa", borderTop: "1px solid #e7e8e9", padding: "80px 0 20px", fontFamily: "'Montserrat', 'Roboto', sans-serif" }}>
      <Container fluid className="px-lg-5">
        <Row className="gy-5 mb-5">
          {/* Brand & Contact */}
          <Col lg={4} md={6}>
            <div className="mb-4 d-flex align-items-center gap-2">
              <h2 className="fw-bold m-0" style={{ color: "#1a73e8", letterSpacing: "-0.5px" }}>CarShop</h2>
            </div>
            <p style={{ color: "#5d6571", fontSize: "0.95rem", lineHeight: "1.6" }} className="mb-4 pe-lg-4">
              Người bạn đồng hành đáng tin cậy trên hành trình tìm kiếm chiếc xe hoàn hảo của bạn. Chúng tôi mang đến chất lượng và trải nghiệm tuyệt vời nhất.
            </p>
            <div className="d-flex flex-column gap-3 mb-4">
              <div className="d-flex align-items-center gap-3">
                <div style={{ width: "40px", height: "40px", background: "#e8f0fe", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a73e8" }}>
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", color: "#5d6571", fontWeight: 600 }}>Địa chỉ</div>
                  <div style={{ color: "#191c1d", fontSize: "0.95rem" }}>123 Phố Ô Tô, Hà Nội</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div style={{ width: "40px", height: "40px", background: "#e8f0fe", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a73e8" }}>
                  <FaPhoneAlt />
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", color: "#5d6571", fontWeight: 600 }}>Điện thoại</div>
                  <div style={{ color: "#191c1d", fontSize: "0.95rem" }}>+84 (24) 1234 5678</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div style={{ width: "40px", height: "40px", background: "#e8f0fe", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a73e8" }}>
                  <FaEnvelope />
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", color: "#5d6571", fontWeight: 600 }}>Email</div>
                  <div style={{ color: "#191c1d", fontSize: "0.95rem" }}>contact@carshop.vn</div>
                </div>
              </div>
            </div>
          </Col>

          {/* Links columns */}
          <Col lg={2} md={6}>
            <h5 className="fw-bold mb-4" style={{ color: "#191c1d" }}>Về Chúng Tôi</h5>
            <div className="d-flex flex-column gap-3">
              <Link to="/about" className="text-decoration-none" style={{ color: "#5d6571", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = '#1a73e8'} onMouseOut={e => e.target.style.color = '#5d6571'}>Giới thiệu</Link>
              <Link to="/blog" className="text-decoration-none" style={{ color: "#5d6571", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = '#1a73e8'} onMouseOut={e => e.target.style.color = '#5d6571'}>Tin bài & Đánh giá</Link>
              <Link to="/services" className="text-decoration-none" style={{ color: "#5d6571", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = '#1a73e8'} onMouseOut={e => e.target.style.color = '#5d6571'}>Dịch vụ</Link>
              <Link to="/faqs" className="text-decoration-none" style={{ color: "#5d6571", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = '#1a73e8'} onMouseOut={e => e.target.style.color = '#5d6571'}>Hỏi đáp (FAQs)</Link>
              <Link to="/contact" className="text-decoration-none" style={{ color: "#5d6571", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = '#1a73e8'} onMouseOut={e => e.target.style.color = '#5d6571'}>Liên hệ trực tiếp</Link>
            </div>
          </Col>

          <Col lg={2} md={6}>
            <h5 className="fw-bold mb-4" style={{ color: "#191c1d" }}>Các Hãng Xe</h5>
            <div className="d-flex flex-column gap-3">
              <Link to="/toyota" className="text-decoration-none" style={{ color: "#5d6571", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = '#1a73e8'} onMouseOut={e => e.target.style.color = '#5d6571'}>Toyota</Link>
              <Link to="/porsche" className="text-decoration-none" style={{ color: "#5d6571", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = '#1a73e8'} onMouseOut={e => e.target.style.color = '#5d6571'}>Porsche</Link>
              <Link to="/audi" className="text-decoration-none" style={{ color: "#5d6571", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = '#1a73e8'} onMouseOut={e => e.target.style.color = '#5d6571'}>Audi</Link>
              <Link to="/bmw" className="text-decoration-none" style={{ color: "#5d6571", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = '#1a73e8'} onMouseOut={e => e.target.style.color = '#5d6571'}>BMW</Link>
              <Link to="/ford" className="text-decoration-none" style={{ color: "#5d6571", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = '#1a73e8'} onMouseOut={e => e.target.style.color = '#5d6571'}>Ford</Link>
            </div>
          </Col>

          {/* Newsletter & Socials */}
          <Col lg={4} md={6}>
            <h5 className="fw-bold mb-4" style={{ color: "#191c1d" }}>Đăng ký nhận tin</h5>
            <p style={{ color: "#5d6571", fontSize: "0.95rem" }} className="mb-3">
              Nhận thông tin cập nhật hằng tuần miễn phí về các mẫu xe mới và ưu đãi độc quyền từ CarShop.
            </p>
            <Form className="d-flex gap-2 mb-5">
              <Form.Control 
                type="email" 
                placeholder="Nhập email của bạn" 
                className="py-2"
                style={{ 
                  borderRadius: "4px", 
                  border: "1px solid #c1c6d6", 
                  background: "#ffffff", 
                  boxShadow: "none",
                  fontSize: "0.95rem"
                }} 
              />
              <Button style={{ 
                background: "#1a73e8", 
                border: "none", 
                borderRadius: "4px", 
                fontWeight: 600,
                padding: "10px 24px"
              }}>
                Gửi
              </Button>
            </Form>
            
            <h6 className="fw-bold mb-3" style={{ color: "#191c1d" }}>Kết Nối Với Chúng Tôi</h6>
            <div className="d-flex gap-3">
              <a href="#" style={{ width: "42px", height: "42px", borderRadius: "8px", background: "#e8f0fe", color: "#1a73e8", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", transition: "all 0.2s", fontSize: "1.2rem" }} onMouseOver={e => {e.currentTarget.style.background = '#1a73e8'; e.currentTarget.style.color = '#ffffff'}} onMouseOut={e => {e.currentTarget.style.background = '#e8f0fe'; e.currentTarget.style.color = '#1a73e8'}}><FaFacebookF /></a>
              <a href="#" style={{ width: "42px", height: "42px", borderRadius: "8px", background: "#e8f0fe", color: "#1a73e8", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", transition: "all 0.2s", fontSize: "1.2rem" }} onMouseOver={e => {e.currentTarget.style.background = '#1a73e8'; e.currentTarget.style.color = '#ffffff'}} onMouseOut={e => {e.currentTarget.style.background = '#e8f0fe'; e.currentTarget.style.color = '#1a73e8'}}><FaTwitter /></a>
              <a href="#" style={{ width: "42px", height: "42px", borderRadius: "8px", background: "#e8f0fe", color: "#1a73e8", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", transition: "all 0.2s", fontSize: "1.2rem" }} onMouseOver={e => {e.currentTarget.style.background = '#1a73e8'; e.currentTarget.style.color = '#ffffff'}} onMouseOut={e => {e.currentTarget.style.background = '#e8f0fe'; e.currentTarget.style.color = '#1a73e8'}}><FaInstagram /></a>
              <a href="#" style={{ width: "42px", height: "42px", borderRadius: "8px", background: "#e8f0fe", color: "#1a73e8", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", transition: "all 0.2s", fontSize: "1.2rem" }} onMouseOver={e => {e.currentTarget.style.background = '#1a73e8'; e.currentTarget.style.color = '#ffffff'}} onMouseOut={e => {e.currentTarget.style.background = '#e8f0fe'; e.currentTarget.style.color = '#1a73e8'}}><FaLinkedinIn /></a>
            </div>
          </Col>
        </Row>

        <div style={{ borderTop: "1px solid #e7e8e9", padding: "28px 0", marginTop: "20px" }}>
          <Row className="align-items-center">
            <Col md={6} className="text-center text-md-start mb-3 mb-md-0">
              <span style={{ color: "#5d6571", fontSize: "0.9rem" }}>© 2024 CarShop.com. Tất cả các quyền được bảo lưu.</span>
            </Col>
            <Col md={6} className="d-flex justify-content-center justify-content-md-end gap-4">
              <Link to="/terms" className="text-decoration-none fw-medium" style={{ color: "#5d6571", fontSize: "0.9rem" }} onMouseOver={e => e.target.style.color = '#1a73e8'} onMouseOut={e => e.target.style.color = '#5d6571'}>Điều khoản</Link>
              <Link to="/privacy" className="text-decoration-none fw-medium" style={{ color: "#5d6571", fontSize: "0.9rem" }} onMouseOver={e => e.target.style.color = '#1a73e8'} onMouseOut={e => e.target.style.color = '#5d6571'}>Bảo mật</Link>
              <Link to="/cookies" className="text-decoration-none fw-medium" style={{ color: "#5d6571", fontSize: "0.9rem" }} onMouseOver={e => e.target.style.color = '#1a73e8'} onMouseOut={e => e.target.style.color = '#5d6571'}>Cookie</Link>
            </Col>
          </Row>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;