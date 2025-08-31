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
        <Container className="mt-5" style={{paddingTop : "70px"}}>
            <Card>
                <Card.Body>
                    <Row>
                        <Col md={3} className="text-center mb-3">
                            <Image
                                src={profile?.avatar}
                                style={{ borderRadius: "100%", height: "120px", width: "120px" }}
                            />
                        </Col>
                        <Col md={9}>
                            <Card.Title style={{ fontSize: 28, fontWeight: 700 }}>
                                {profile?.firstName} {profile?.lastName}
                            </Card.Title>
                            <hr />
                            <Row>
                                <Col md={6}><b>Tên đăng nhập:</b> {profile?.username}</Col>
                                {profile?.mssv && <Col md={6}><b>MSSV:</b> {profile?.mssv}</Col>}
                                {profile?.msgv && <Col md={6}><b>MSGV:</b> {profile?.msgv}</Col>}
                                <Col md={6}><b>Email:</b> {profile?.email}</Col>
                                <Col md={6}><b>Điện thoại:</b> {profile?.phone}</Col>
                                <Col md={6}><b>Giới tính:</b> {profile?.gender === true ? "Nam" : "Nữ"}</Col>
                            </Row>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
};
export default Profile;