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
                setProfile(response.data);
            } catch (error) {
                setMsg("Không thể tải thông tin cá nhân.");
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    return (
        <Container className="mt-5">
            <Card>
                <Card.Body>
                    <Row>
                        <Col md={3} className="text-center mb-3">
                            <Image
                                src={profile?.avatar}
                                roundedCircle
                                width={120}
                                height={120}
                                alt="Avatar"
                            />
                        </Col>
                        <Col md={9}>
                            <Card.Title style={{ fontSize: 28, fontWeight: 700 }}>
                                {profile?.firstName} {profile?.lastName}
                            </Card.Title>
                            <hr />
                            <Row>
                                <Col md={6}><b>Tên đăng nhập:</b> {profile?.username}</Col>
                                <Col md={6}><b>Role:</b> {profile?.role}</Col>

                                {profile?.mssv && <Col md={6}><b>MSSV:</b> {profile?.mssv}</Col>}
                                {profile?.msgv && <Col md={6}><b>MSGV:</b> {profile?.msgv}</Col>}
                                <Col md={6}><b>Email:</b> {profile?.email}</Col>
                                <Col md={6}><b>Điện thoại:</b> {profile?.phone}</Col>
                                <Col md={6}><b>Giới tính:</b> {profile?.gender === true ? "Nam" : "Nữ"}</Col>
                                {profile?.dob && <Col md={6}><b>Ngày sinh:</b> {profile?.dob}</Col>}
                                {profile?.address && <Col md={6}><b>Địa chỉ:</b> {profile?.address}</Col>}
                                {profile?.classroom && <Col md={6}><b>Lớp:</b> {profile?.classroom.name}</Col>}
                                {profile?.schoolYear && <Col md={6}><b>Niên khóa:</b> {profile?.schoolYear}</Col>}
                                {profile?.position && <Col md={6}><b>Chức vụ:</b> {profile?.position}</Col>}
                                {profile?.experience && <Col md={6}><b>Kinh nghiệm:</b> {profile?.experience}</Col>}
                                {profile?.faculty && <Col md={6}><b>Khoa:</b> {profile?.faculty.name}</Col>}
                            </Row>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
};
export default Profile;