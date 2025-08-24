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
    }, {
        label: "Mã số sinh viên",
        type: "text",
        field: "mssv"
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
        style={{ minHeight: "150vh", background: "#f6f8fa" }}
        >
        <div
            style={{
                width: 650,
                padding: "32px 28px",
                background: "#fff",
                borderRadius: 18,
                boxShadow: "0 4px 24px 0 rgba(0,0,0,.08)",
            }}
        >
            <h2 className="mb-2 mt-2 text-center">Đăng ký tài khoản</h2>
            {msg && <Alert variant="danger">{msg}</Alert>}
            <Form onSubmit={register}>
                    {info.map(f => {
                        if (f.type === "file") return null;
                        if (f.type === "select") {
                            return (
                                <FloatingLabel key={f.field} controlId={`floating-${f.field}`} label={f.label} className="mb-3">
                                    <Form.Select
                                        required
                                        value={user[f.field] || ""}
                                        onChange={e => setState(e.target.value, f.field)}
                                        style={{ background: "#f7f7f9" }}
                                    >
                                        <option value="">Chọn</option>
                                        {f.options.map(opt =>
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        )}
                                    </Form.Select>
                                </FloatingLabel>
                            );
                        }
                        return (
                            <FloatingLabel key={f.field} controlId="floatingInput" label={f.label} className="mb-3">
                                <Form.Control type={f.type} placeholder={f.label} required value={user[f.field]} onChange={e => setState(e.target.value, f.field)} style={{ background: "#f7f7f9" }}
                                />
                            </FloatingLabel>
                        );
                    })}
                    <FloatingLabel controlId="floatingInput" label="Ảnh đại diện" className="mb-3">
                        <Form.Control style={{ background: "#f7f7f9" }} type="file" placeholder="Ảnh đại diện" ref={avatar} onChange={(e) => setState(e.target.files[0], "avatar")} />
                    </FloatingLabel>
                    {loading ? <MySpinner /> : <Button type="submit" variant="success" className="mt-2 w-100 py-2" style={{ fontWeight: 600, fontSize: 17, letterSpacing: 1 }}>
                        Đăng ký</Button>}
                </Form>
            </div>
        </div>
    );
};

export default Register;