import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MyUserContext } from "./../configs/MyContexts";
import { authApis, endpoints } from "./../configs/APIs";

const CarInfoCard = ({ car }) => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
    <img
      src={car.images?.[0] || "https://via.placeholder.com/600x400"}
      alt={car.carModel}
      className="w-full h-64 object-cover"
    />
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-3">{car.carModel}</h3>
      <p className="text-gray-600 mb-2">
        <span className="font-medium">Tên xe:</span> {car.name}
      </p>
      <p className="text-gray-600 mb-2">
        <span className="font-medium">Năm sản xuất:</span> {car.year[0]}
      </p>
      <p className="text-gray-600">
        <span className="font-medium">Giá mỗi xe:</span>{" "}
        {new Intl.NumberFormat("vi-VN").format(car.price)} VNĐ
      </p>
    </div>
  </div>
);

const OrderDetailsCard = ({ orders, isStaff, handleDeposit, handlePay, loading }) => (
  <div className="bg-white rounded-lg shadow-lg p-6">
    <h3 className="text-xl font-semibold mb-4">Chi tiết đặt hàng</h3>
    <p className="text-gray-600 mb-2">
      <span className="font-medium">Mã đơn hàng:</span> {orders.id}
    </p>
    <p className="text-gray-600 mb-2">
      <span className="font-medium">Họ tên:</span> {orders.orderDetails.fullName}
    </p>
    <p className="text-gray-600 mb-2">
      <span className="font-medium">Số điện thoại:</span> {orders.orderDetails.phoneNumber}
    </p>
    <p className="text-gray-600 mb-2">
      <span className="font-medium">Địa chỉ:</span> {orders.orderDetails.address}
    </p>
    <p className="text-gray-600 mb-2">
      <span className="font-medium">Ngày sinh:</span> {orders.orderDetails.dob}
    </p>
    <p className="text-gray-600 mb-2">
      <span className="font-medium">CCCD:</span> {orders.orderDetails.cccd}
    </p>
    <p className="text-gray-600 mb-2">
      <span className="font-medium">Số lượng:</span> {orders.orderDetails.quantity}
    </p>
    <p className="text-gray-600 mb-4">
      <span className="font-medium">Tổng tiền:</span>{" "}
      {new Intl.NumberFormat("vi-VN").format(orders.orderDetails.totalAmount)} VNĐ
    </p>
    <button
      onClick={handleDeposit}
      className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition mb-3"
      disabled={loading}
    >
      Đặt cọc qua VNPay
    </button>
    {isStaff && (
      <button
        onClick={handlePay}
        className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
        disabled={loading}
      >
        {loading ? "Đang xử lý..." : "Thanh toán"}
      </button>
    )}
  </div>
);

const FormConfirm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useContext(MyUserContext);
  const [loading, setLoading] = useState(false);

  const isStaff = user?.result?.roles?.includes("STAFF");
  const { car, orders } = location.state || {};

  useEffect(() => {
    if (car && orders) {
      console.log("Car:", car);
      console.log("Orders:", orders);
    }
  }, [car, orders]);

  const handleDeposit = async () => {
    try {
      setLoading(true);
      const response = await authApis().post("http://localhost:8888/api/v1/payment/api/checkout/url", {
        txnRef: orders.id,
        amount: 5000000,
        ipAddress: "127.0.0.1",
      });
      window.location.href = response.data.result.vnpUrl;
    } catch (error) {
      console.error("Error fetching payment URL:", error);
      alert("Không thể tạo URL thanh toán. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    try {
      setLoading(true);
      const res = await authApis().post(endpoints["payment-not-deposit"], orders.id);
      if (res.status === 200 || res.status === 201) {
        console.log("Thanh toán thành công");
        alert("Thanh toán thành công!");
      }
    } catch (error) {
      console.error("Thanh toán thất bại:", error);
      alert("Thanh toán thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  if (!car || !orders) {
    return (
      <div className="container mx-auto my-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Không có thông tin đơn hàng
        </h2>
        <button
          onClick={() => navigate("/home")}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
        >
          Quay về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto my-12 px-4" style={{padding: "100px"}}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CarInfoCard car={car} />
        <OrderDetailsCard
          orders={orders}
          isStaff={isStaff}
          handleDeposit={handleDeposit}
          handlePay={handlePay}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default FormConfirm;