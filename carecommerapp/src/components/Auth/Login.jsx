import React, { useState, useContext } from "react";
import { FloatingLabel, Form, Button } from "react-bootstrap";
import { authApis, endpoints } from "./../../configs/APIs";
import Apis from "./../../configs/APIs";
import cookie from "react-cookies";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MyDispatchContext } from "./../../configs/MyContexts";

const Login = () => {
    const info = [
        { label: "Tên đăng nhập", type: "text", field: "username" },
        { label: "Mật khẩu", type: "password", field: "password" }
    ];
    const dispatch = useContext(MyDispatchContext);
    const [user, setUser] = useState({});
    const [q] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();
    const setState = (value, field) => {
        setUser({ ...user, [field]: value });
    };
    const login = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            let res = await Apis.post(endpoints['login'], { ...user });
            console.log("Login response:", res.data.result.access_token);
            cookie.save('token', res.data.result.access_token);
            let userInfo = await authApis().get(endpoints['my-profile']);
            dispatch({
                "type": "login",
                "payload": userInfo.data
            });
            let next = q.get('next');
            if (next) {
                nav(next);
            } else {
                const roles = userInfo.data.result?.roles || [];
                if (roles.includes("ADMIN")) {
                    nav("/admin");
                } else if (roles.includes("STAFF")) {
                    nav("/staff/home");
                } else {
                    nav("/home");
                }
            }
        } catch (e) {
            alert("Đăng nhập thất bại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="d-flex align-items-center justify-content-center"
            style={{
                minHeight: "85vh",
                background: "#f8f9fa", /* Light gray background */
                padding: "70px",
                fontFamily: "'Montserrat', 'Roboto', sans-serif"
            }}
        >
            <div
                style={{
                    width: 380,
                    padding: "48px 36px",
                    background: "#ffffff", /* Pure white form */
                    borderRadius: 8, /* Minimal rounded corners */
                    boxShadow: "none", /* Flat design - NO box shadows */
                    border: "1px solid #e7e8e9", /* Subtle division instead of shadow */
                    marginBottom: "60px"
                }}
            >
                <div className="text-center mb-4">
                    <h2 style={{
                        color: "#1a73e8", /* Primary Dark Blue */
                        fontWeight: 700,
                        letterSpacing: "-0.5px",
                        margin: 0
                    }}>Đăng nhập</h2>
                </div>
                <Form onSubmit={login}>
                    {info.map(f =>
                        <Form.Group key={f.field} className="mb-3" controlId={f.field}>
                            <Form.Label style={{
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                color: "#191c1d",
                                marginBottom: "8px"
                            }}>{f.label}</Form.Label>
                            <Form.Control
                                type={f.type}
                                placeholder={`Nhập ${f.label.toLowerCase()}`}
                                value={user[f.field] || ""}
                                onChange={e => setState(e.target.value, f.field)}
                                style={{
                                    background: "#f8f9fa",
                                    border: "1px solid #c1c6d6",
                                    borderRadius: 4,
                                    padding: "12px 16px",
                                    fontSize: "0.95rem",
                                    boxShadow: "none", /* Remove boostrap default glow */
                                    color: "#191c1d"
                                }}
                            />
                        </Form.Group>
                    )}
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-100 mt-4"
                        style={{
                            background: "#1a73e8", /* Solid Dark Blue */
                            color: "#ffffff",
                            border: "none",
                            borderRadius: 4,
                            padding: "14px",
                            fontWeight: 600,
                            fontSize: "1rem",
                            boxShadow: "none" /* Flat button */
                        }}
                    >
                        {loading ? "Đang xử lý..." : "Đăng nhập"}
                    </Button>
                </Form>
                <div className="mt-4 text-center">
                    <span style={{ color: "#5d6571", fontSize: "0.9rem" }}>Bạn chưa có tài khoản? </span>
                    <Link to="/register" style={{
                        color: "#1a73e8",
                        fontWeight: 600,
                        textDecoration: "none",
                        fontSize: "0.9rem"
                    }}>
                        Đăng ký ngay
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;