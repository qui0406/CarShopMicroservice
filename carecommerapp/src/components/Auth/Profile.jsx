import React, { useState, useRef, useEffect, useContext } from "react";
import { FloatingLabel, Form, Button, Alert, Container, Card, Col, Row, Image } from "react-bootstrap";
import Apis, { authApis, endpoints } from "./../../configs/APIs";
import { MyUserContext } from "./../../configs/MyContexts";


const Profile = () => {
    const [profile, setProfile] = useState(null);
    const user = useContext(MyUserContext);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await authApis().get(endpoints['my-profile']);
                console.log(response.data.result)
                setProfile(response.data.result);
            } catch (error) {
                setMsg("Không thể tải thông tin cá nhân.");
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    return (
        <div style={{ minHeight: "100vh", background: "#f8f9fa", paddingTop: "100px", paddingBottom: "60px", fontFamily: "'Montserrat', 'Roboto', sans-serif" }}>
            <Container>
                {msg && <Alert variant="danger" style={{ borderRadius: 8, border: "none" }}>{msg}</Alert>}
                
                {loading ? (
                    <div className="text-center mt-5"><span style={{ color: "#1a73e8", fontWeight: 600 }}>Đang tải dữ liệu...</span></div>
                ) : profile && (
                    <div 
                        style={{
                            background: "#ffffff",
                            borderRadius: 12,
                            border: "1px solid #e7e8e9",
                            padding: "48px",
                            boxShadow: "none",
                            maxWidth: "900px",
                            margin: "0 auto"
                        }}
                    >
                        <Row className="align-items-center">
                            {/* Avatar Section */}
                            <Col md={4} className="text-center d-flex flex-column align-items-center mb-4 mb-md-0 border-md-end border-light" style={{ borderRight: window.innerWidth > 768 ? "1px solid #e7e8e9" : "none" }}>
                                <div style={{ 
                                    padding: "6px", 
                                    background: "#e8f0fe", 
                                    borderRadius: "50%", 
                                    display: "inline-block",
                                    marginBottom: "20px"
                                }}>
                                    <Image
                                        src={profile.avatar || "https://res.cloudinary.com/dwyz1a6f5/image/upload/v1703649568/avatar-default-icon_f48qbe.png"}
                                        style={{ 
                                            borderRadius: "50%", 
                                            height: "160px", 
                                            width: "160px", 
                                            objectFit: "cover",
                                            border: "4px solid #ffffff"
                                        }}
                                    />
                                </div>
                                <h3 style={{ color: "#1a73e8", fontWeight: 700, margin: 0, fontSize: "1.6rem" }}>
                                    {profile.lastName} {profile.firstName}
                                </h3>
                                <p style={{ color: "#5d6571", marginTop: "6px", fontSize: "1rem" }}>@{profile.username}</p>
                                <Button 
                                    style={{ 
                                        background: "#e8f0fe", 
                                        color: "#1a73e8", 
                                        border: "none", 
                                        fontWeight: 600, 
                                        borderRadius: "6px",
                                        padding: "8px 24px",
                                        marginTop: "10px"
                                    }}
                                >
                                    Chỉnh sửa hồ sơ
                                </Button>
                            </Col>

                            {/* Info Section */}
                            <Col md={8}>
                                <div style={{ padding: "0 20px" }}>
                                    <h5 style={{ color: "#191c1d", fontWeight: 700, marginBottom: "28px", fontSize: "1.2rem", borderBottom: "1px solid #e7e8e9", paddingBottom: "12px" }}>
                                        Thông tin cá nhân
                                    </h5>
                                    <Row className="gy-4">
                                        <Col sm={6}>
                                            <div style={{ fontSize: "0.85rem", color: "#5d6571", fontWeight: 600, marginBottom: "4px" }}>Họ và tên</div>
                                            <div style={{ color: "#191c1d", fontSize: "1.05rem", fontWeight: 500 }}>{profile.lastName} {profile.firstName}</div>
                                        </Col>
                                        <Col sm={6}>
                                            <div style={{ fontSize: "0.85rem", color: "#5d6571", fontWeight: 600, marginBottom: "4px" }}>Tên đăng nhập</div>
                                            <div style={{ color: "#191c1d", fontSize: "1.05rem", fontWeight: 500 }}>{profile.username}</div>
                                        </Col>
                                        <Col sm={6}>
                                            <div style={{ fontSize: "0.85rem", color: "#5d6571", fontWeight: 600, marginBottom: "4px" }}>Email</div>
                                            <div style={{ color: "#191c1d", fontSize: "1.05rem", fontWeight: 500 }}>{profile.email || "Chưa cập nhật"}</div>
                                        </Col>
                                        <Col sm={6}>
                                            <div style={{ fontSize: "0.85rem", color: "#5d6571", fontWeight: 600, marginBottom: "4px" }}>Số điện thoại</div>
                                            <div style={{ color: "#191c1d", fontSize: "1.05rem", fontWeight: 500 }}>{profile.phone || "Chưa cập nhật"}</div>
                                        </Col>
                                        <Col sm={6}>
                                            <div style={{ fontSize: "0.85rem", color: "#5d6571", fontWeight: 600, marginBottom: "4px" }}>Giới tính</div>
                                            <div style={{ color: "#191c1d", fontSize: "1.05rem", fontWeight: 500 }}>{profile.gender === true ? "Nam" : profile.gender === false ? "Nữ" : "Chưa cập nhật"}</div>
                                        </Col>
                                        
                                        {profile.mssv && (
                                            <Col sm={6}>
                                                <div style={{ fontSize: "0.85rem", color: "#5d6571", fontWeight: 600, marginBottom: "4px" }}>MSSV</div>
                                                <div style={{ color: "#191c1d", fontSize: "1.05rem", fontWeight: 500 }}>{profile.mssv}</div>
                                            </Col>
                                        )}
                                        {profile.msgv && (
                                            <Col sm={6}>
                                                <div style={{ fontSize: "0.85rem", color: "#5d6571", fontWeight: 600, marginBottom: "4px" }}>MSGV</div>
                                                <div style={{ color: "#191c1d", fontSize: "1.05rem", fontWeight: 500 }}>{profile.msgv}</div>
                                            </Col>
                                        )}
                                    </Row>
                                </div>
                            </Col>
                        </Row>
                    </div>
                )}
            </Container>
        </div>
    );
};
export default Profile;