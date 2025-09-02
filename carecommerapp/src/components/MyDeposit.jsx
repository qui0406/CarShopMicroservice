import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Container, Row, Col, Button } from "react-bootstrap";
import  axios ,{ authApis, endpoints } from "./../configs/APIs";
import "./../styles/Reserve.css";

export default function MyDeposit() {
    const location = useLocation();
    const navigate = useNavigate();
    const [orders, setOrders]= useState([]);
    const [loading, setLoading]= useState(false);

    const formatDateTime = (isoDate) => {
        const date = new Date(isoDate);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    };



    const loadMyAllDeposit = async () => {
        setLoading(true);
        try {
            const res = await authApis().get(endpoints["get-deposits"]);
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
        loadMyAllDeposit();
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
                                <strong>Mã đơn hàng:</strong> {order.orderId} <br />
                                <strong>Họ tên:</strong> {order.fullName} <br />
                                <strong>Username:</strong> {order.username || "Chưa có"} <br />
                                <strong>Địa chỉ:</strong> {order.address} <br />
                                <strong>Số lượng:</strong> {order.quantity} <br />
                                <strong>Tổng tiền:</strong> {order.totalAmount.toLocaleString()} VND <br />
                                <strong>Số tiền đặt cọc:</strong> {order.disposableAmount?.toLocaleString()} VND <br />
                                <strong>Số tiền còn lại:</strong> {order.remainAmount?.toLocaleString()} VND <br />
                                <strong>Mã giao dịch:</strong> {order.transactionId || "Chưa có"} <br />
                                <strong>Ngày tạo đơn:</strong> {formatDateTime(order.createdAt)} <br />

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