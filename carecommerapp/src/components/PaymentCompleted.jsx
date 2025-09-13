import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Container, Row, Col } from "react-bootstrap";
import "./../styles/FormConfirm.css";
import { authApis, endpoints } from "../configs/APIs";

export default function PaymentCompleted() {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const navigate= useNavigate();

    const data = {};
    for (let [key, value] of params.entries()) {
        data[key] = value;
    }

    const createOrder = async()=>{
        try{
            const ordersFromStorage = localStorage.getItem('orders');
            const res= await authApis().post(endpoints["create-orders"], ordersFromStorage)
            
            if(res.status === 200 || res.status === 201){
                console.log("Tạo đơn hàng thành công")
            }
        }
        catch{
            console.error("Lỗi")
        }
    }

    // Translation map for VNPay keys to Vietnamese
    const keyTranslations = {
        vnp_Amount: "Giá tiền đặt cọc",
        vnp_BankCode: "Mã ngân hàng",
        vnp_BankTranNo: "Mã giao dịch ngân hàng",
        vnp_CardType: "Loại thẻ",
        vnp_OrderInfo: "Thông tin đơn hàng",
        vnp_PayDate: "Ngày thanh toán",
        vnp_ResponseCode: "Mã phản hồi",
        vnp_TmnCode: "Mã Tmn",
        vnp_TransactionNo: "Mã giao dịch",
        vnp_TransactionStatus: "Trạng thái giao dịch",
        vnp_TxnRef: "Mã tham chiếu giao dịch",
        code: "Mã kết quả"
    };

    return (
        <>
        <div style={{ padding: "70px" }}>
            <h3 className="text-center">Kết quả giao dịch</h3>
            <table border="1" cellPadding="10" style={{ marginTop: "20px" }}>
                <thead>
                    <tr>
                        <th>Thông tin</th>
                        <th>Giá trị</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(data).map(([key, value]) => (
                        <tr key={key}>
                            <td>{keyTranslations[key] || key}</td>
                            <td>
                                {key === "vnp_Amount"
                                    ? `${parseInt(value) / 100} VND`
                                    : value}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="d-flex justify-content-center mt-4" style={{paddingBottom: "50px"}}>
            <button className="btn btn-success" onClick={() => navigate("/home")}>
                Quay về trang chủ
            </button>
        </div>

        </>
    );
}