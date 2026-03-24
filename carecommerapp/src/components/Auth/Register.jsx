import React, { useState, useRef } from "react";
import { FloatingLabel, Form, Button, Alert } from "react-bootstrap";
import Apis from "./../../configs/APIs";
import { endpoints } from "./../../configs/APIs";
import { useNavigate } from "react-router-dom";
import MySpinner from "./../Layouts/MySpinner";

const Register = () => {
    const info = [{
        label: "Tên đăng nhập",
        type: "text",
        field: "username"
    }, {
        label: "Mật khẩu",
        type: "password",
        field: "password"
    }, {
        label: "Xác nhận mật khẩu",
        type: "password",
        field: "confirmPassword"
    }, {
        label: "Tên",
        type: "text",
        field: "firstName"
    }, {
        label: "Họ",
        type: "text",
        field: "lastName"
    },
    {
        label: "Email address",
        type: "email",
        field: "email"
    }, {
        label: "Số điện thoại",
        type: "text",
        field: "phone"
    }, {
        label: "Địa chỉ",
        type: "text",
        field: "address"
    }, {
        label: "Giới tính",
        type: "select",
        field: "gender",
        options: [
            { value: true, label: "Nam" },
            { value: false, label: "Nữ" }
        ]
    }, {
        label: "Ngày sinh",
        type: "date",
        field: "dob"
    }, {
        label: "Ảnh đại diện",
        type: "file",
        field: "avatar"
    }];
    const nav = useNavigate();
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);

    const [msg, setMsg] = useState("");
    const avatar = useRef();
    const setState = (value, field) => {
        setUser({ ...user, [field]: value });
    };
    const register = async (e) => {
        e.preventDefault(); // để không reload page
        if (user.password !== user.confirmPassword) {
            setMsg("Mật khẩu không khớp");
        } else {
            try {
                setLoading(true);
                let formData = new FormData();
                for (let f of info) {
                    if (f.field != 'confirmPassword') {
                        formData.append(f.field, user[f.field]);
                    }
                }
                formData.append("avatar", avatar.current.files[0]);


                let res = await Apis.post(endpoints['register'], formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });


                if (res.status === 200) {
                    setMsg("Đăng ký thành công");
                    nav("/login");
                }
            } catch (error) {
                if (error.response) {
                    setMsg(error.response.data.message || "Đăng ký thất bại");
                } else {
                    setMsg("Lỗi kết nối");
                }
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div
            className="d-flex justify-content-center align-items-center"
            style={{
                minHeight: "100vh",
                background: "#f8f9fa",
                padding: "100px 20px 80px",
                fontFamily: "'Montserrat', 'Roboto', sans-serif"
            }}
        >
            <div
                style={{
                    width: 700,
                    padding: "48px 40px",
                    background: "#ffffff",
                    borderRadius: 8,
                    border: "1px solid #e7e8e9",
                    boxShadow: "none"
                }}
            >
                <div className="text-center mb-4">
                    <h2 style={{
                        color: "#1a73e8",
                        fontWeight: 700,
                        letterSpacing: "-0.5px",
                        margin: 0
                    }}>Đăng ký tài khoản</h2>

                </div>

                {msg && <Alert variant="danger" style={{ borderRadius: 4, border: "none" }}>{msg}</Alert>}

                <Form onSubmit={register}>
                    <div className="row">
                        {info.map(f => {
                            if (f.type === "file") return null;

                            // Make some fields 50% width to save vertical space
                            const isHalfWidth = ["password", "confirmPassword", "firstName", "lastName", "email", "phone", "gender", "dob"].includes(f.field);

                            const commonInputStyle = {
                                background: "#f8f9fa",
                                border: "1px solid #c1c6d6",
                                borderRadius: 4,
                                padding: "12px 16px",
                                fontSize: "0.95rem",
                                boxShadow: "none",
                                color: "#191c1d"
                            };

                            const labelStyle = {
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                color: "#191c1d",
                                marginBottom: "8px"
                            };

                            if (f.type === "select") {
                                return (
                                    <Form.Group key={f.field} className={`mb-3 ${isHalfWidth ? 'col-md-6' : 'col-12'}`} controlId={`input-${f.field}`}>
                                        <Form.Label style={labelStyle}>{f.label}</Form.Label>
                                        <Form.Select
                                            required
                                            value={user[f.field] || ""}
                                            onChange={e => setState(e.target.value, f.field)}
                                            style={commonInputStyle}
                                        >
                                            <option value="">Chọn {f.label.toLowerCase()}</option>
                                            {f.options.map(opt =>
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            )}
                                        </Form.Select>
                                    </Form.Group>
                                );
                            }
                            return (
                                <Form.Group key={f.field} className={`mb-3 ${isHalfWidth ? 'col-md-6' : 'col-12'}`} controlId={`input-${f.field}`}>
                                    <Form.Label style={labelStyle}>{f.label}</Form.Label>
                                    <Form.Control
                                        type={f.type}
                                        placeholder={`Nhập ${f.label.toLowerCase()}`}
                                        required
                                        value={user[f.field] || ""}
                                        onChange={e => setState(e.target.value, f.field)}
                                        style={commonInputStyle}
                                    />
                                </Form.Group>
                            );
                        })}

                        <Form.Group className="mb-4 col-12" controlId="input-avatar">
                            <Form.Label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#191c1d", marginBottom: "8px" }}>Ảnh đại diện</Form.Label>
                            <Form.Control
                                type="file"
                                required
                                ref={avatar}
                                onChange={(e) => setState(e.target.files[0], "avatar")}
                                style={{
                                    background: "#f8f9fa",
                                    border: "1px solid #c1c6d6",
                                    borderRadius: 4,
                                    padding: "10px 16px",
                                    fontSize: "0.95rem",
                                    boxShadow: "none",
                                    color: "#191c1d"
                                }}
                            />
                        </Form.Group>
                    </div>

                    {loading ? (
                        <div className="text-center mt-3"><MySpinner /></div>
                    ) : (
                        <Button
                            type="submit"
                            className="mt-3 w-100 py-2"
                            style={{
                                background: "#1a73e8",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: 4,
                                padding: "14px",
                                fontWeight: 600,
                                fontSize: "1rem",
                                boxShadow: "none"
                            }}
                        >
                            Đăng ký
                        </Button>
                    )}

                    <div className="mt-4 text-center">
                        <span style={{ color: "#5d6571", fontSize: "0.9rem" }}>Đã có tài khoản? </span>
                        <a href="/login" style={{
                            color: "#1a73e8",
                            fontWeight: 600,
                            textDecoration: "none",
                            fontSize: "0.9rem"
                        }}>
                            Đăng nhập ngay
                        </a>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default Register;