import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Container, Row, Col, Button } from "react-bootstrap";
import  axios ,{ authApis, endpoints } from "./../configs/APIs";
import "./../styles/Reserve.css";

export default function MyReserve() {
    const location = useLocation();
    const navigate = useNavigate();
    const [orders, setOrders]= useState([]);
    const [loading, setLoading]= useState(false);

    const loadMyAllReserve = async () => {
        setLoading(true);
        try {
            const res = await authApis().get(endpoints["get-reserves"]);
            if (res.status === 200 || res.status === 201) {
                setOrders(res.data.result || []);
                console.log(res.data.result)
            }
        } catch (error) {
            console.error("Lỗi khi tải đơn đặt xe:", error);
        }
        finally{
            setLoading(false)
        }
    };

    useEffect(() => {
        loadMyAllReserve();
    }, []);


    return (
        <Container className="mt-4" style={{ paddingTop: "70px" }}>
            {loading ? (
                <p className="text-center">Đang tải đơn đặt xe...</p>
            ) : orders.length === 0 ? (
                <p className="text-center">Bạn chưa có đơn đặt xe nào.</p>
            ) : (
                orders.map((order) => (
                    <Card key={order.orderId} className="mb-3">
                        <Card.Body>
                            <Card.Title>{order.fullName}</Card.Title>
                            <Card.Text>
                                <strong>Địa chỉ:</strong> {order.address} <br />
                                <strong>Mã đơn hàng:</strong> {order.orderId} <br />
                                <strong>Số lượng:</strong> {order.quantity} <br />
                                <strong>Tổng tiền:</strong> {order.totalAmount.toLocaleString()} VND <br />
                                <strong>Trạng thái:</strong>{" "}
                                <span
                                    style={{
                                        color: order.paymentStatus === "PENDING" ? "orange" : "green",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {order.paymentStatus}
                                </span>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                ))
            )}
        </Container>

    );
}