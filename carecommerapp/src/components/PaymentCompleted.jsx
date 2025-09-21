import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaHome } from "react-icons/fa";

// Component hiển thị thông tin giao dịch
const TransactionInfo = ({ data, keyTranslations }) => (
  <div className="bg-white rounded-xl shadow-md p-6">
    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
      <FaCheckCircle className="mr-2 text-green-500" /> Kết quả giao dịch
    </h3>
    <div className="grid gap-4">
      {Object.entries(data).map(([key, value]) => (
        <div
          key={key}
          className="flex justify-between border-b border-gray-200 py-2"
        >
          <span className="font-medium text-gray-600">
            {keyTranslations[key] || key}
          </span>
          <span className="text-gray-800">
            {key === "vnp_Amount"
              ? `${new Intl.NumberFormat("vi-VN").format(parseInt(value) / 100)} VNĐ`
              : value}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// Component chính
const PaymentCompleted = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy dữ liệu từ query parameters
  const params = new URLSearchParams(location.search);
  const data = Object.fromEntries(params.entries());

  // Bản đồ dịch các key của VNPay sang tiếng Việt
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
    code: "Mã kết quả",
  };

  // Kiểm tra nếu không có dữ liệu
  if (Object.keys(data).length === 0) {
    return (
      <div className="container mx-auto my-12 text-center px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Không có thông tin giao dịch
        </h2>
        <button
          onClick={() => navigate("/home")}
          className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
        >
          <FaHome className="mr-2" /> Quay về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto my-12 px-4">
      <TransactionInfo data={data} keyTranslations={keyTranslations} />
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => navigate("/home")}
          className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition flex items-center"
        >
          <FaHome className="mr-2" /> Quay về trang chủ
        </button>
      </div>
    </div>
  );
};

export default PaymentCompleted;