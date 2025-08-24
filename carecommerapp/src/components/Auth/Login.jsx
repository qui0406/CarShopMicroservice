import React, { useState, useContext } from "react";
import { FloatingLabel, Form, Button } from "react-bootstrap";
import { authApis, endpoints } from "./../../configs/APIs";
import Apis from "./../../configs/APIs";
import cookie from "react-cookies";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MyUserContext, MyDispatchContext } from "./../../configs/MyContexts";

const Login = () => {
    const info = [
        { label: "Tên đăng nhập", type: "text", field: "username" },
        { label: "Mật khẩu", type: "password", field: "password" }
    ];
    const dispatch = useContext(MyDispatchContext);
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);
    const nav = useNavigate();
    const [q] = useSearchParams();
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
            nav(next ? next : '/home');
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
                background: "linear-gradient(135deg, #e3f0ff 0%, #cfe2ff 100%)"
            }}
        >
            <div
                style={{
                    width: 370,
                    padding: "36px 28px",
                    background: "#fff",
                    borderRadius: 18,
                    boxShadow: "0 4px 24px 0 rgba(0,90,255,.08)",
                    marginBottom: "60px"
                }}
            >
                <div className="text-center mb-3">
                    <h2 className="mb-2 mt-2" style={{ color: "#2563eb" }}>Đăng nhập</h2>
                </div>
                <Form onSubmit={login}>
                    {info.map(f =>
                        <FloatingLabel key={f.field} controlId={f.field} label={f.label} className="mb-3">
                            <Form.Control
                                type={f.type}
                                placeholder={f.label}
                                value={user[f.field] || ""}
                                onChange={e => setState(e.target.value, f.field)}
                                style={{
                                    background: "#f3f8ff",
                                    borderColor: "#b6d4fe"
                                }}
                            />
                        </FloatingLabel>
                    )}
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={loading}
                        className="w-100 py-2 mt-1"
                        style={{
                            fontWeight: 600,
                            fontSize: 17,
                            letterSpacing: 1,
                            background: "linear-gradient(90deg, #388bff 20%, #7dc7ff 100%)",
                            border: "none",
                            boxShadow: "0 2px 8px #388bff44"
                        }}
                    >
                        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </Button>
                </Form>
                <div className="mt-3 text-center">
                    <span style={{ color: "#4c668a" }}>Bạn chưa có tài khoản? </span>
                    <Link to="/register" style={{ color: "#2563eb", fontWeight: 500 }}>
                        Đăng ký
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;