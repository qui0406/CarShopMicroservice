import React, { useState, useEffect } from "react";
import { authApis, endpoints } from "../../configs/APIs";

export default function Cashier() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await authApis().get(endpoints["get-all-deposit"]);
      console.log("DS", res.data);
      if (res.status === 200 || res.status === 201) {
        setOrders(res.data.result);
      }
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    console.log(orders)
  }, []);

  const formatDateTime = (dateStr) => new Date(dateStr).toLocaleString("vi-VN");

  const handleConfirmPayment = async (orderId) => {
    // Thêm logic gọi API để xác nhận thanh toán nếu cần
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.orderId === orderId 
          ? { ...order, paymentStatus: "PAID" }
          : order
      )
    );
    setSelectedOrder(null);
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      // Thêm logic gọi API để hủy đơn hàng nếu cần
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orderId === orderId 
            ? { ...order, paymentStatus: "CANCELLED" }
            : order
        )
      );
      setSelectedOrder(null);
    }
  };

  // Tính toán trạng thái dựa trên dữ liệu
  const getPaymentStatus = (order) => {
    if (order.remainingAmount === 0) return "PAID";
    if (order.depositAmount > 0) return "PARTIAL_PAID";
    return "PENDING";
  };

  const getStatusText = (order) => {
    const status = getPaymentStatus(order);
    switch (status) {
      case "PAID": return "Đã thanh toán";
      case "PARTIAL_PAID": return "Đã đặt cọc";
      case "PENDING": return "Chờ thanh toán";
      default: return "Đã hủy";
    }
  };

  const getStatusStyle = (order) => {
    const status = getPaymentStatus(order);
    switch (status) {
      case "PAID": 
        return "bg-green-100 text-green-800";
      case "PARTIAL_PAID": 
        return "bg-blue-100 text-blue-800";
      case "PENDING": 
        return "bg-yellow-100 text-yellow-800";
      default: 
        return "bg-red-100 text-red-800";
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center" style={{ paddingTop: '80px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen" style={{ paddingTop: '80px' }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Danh sách đơn hàng</h2>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Mã đơn hàng</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Phương thức thanh toán</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tổng tiền</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Đã đặt cọc</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Còn lại</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Trạng thái</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 px-4 text-center text-gray-500">
                      Không có đơn hàng nào
                    </td>
                  </tr>
                ) : (
                  orders.map((order, index) => (
                    <tr key={order.orderId} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {order.orderId.substring(0, 8)}...
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {order.paymentMethod === "BANK_TRANSFER" ? "Chuyển khoản" : order.paymentMethod}
                      </td>
                      <td className="py-3 px-4 text-gray-700 font-medium">
                        {order.price.toLocaleString()} VND
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {order.depositAmount.toLocaleString()} VND
                      </td>
                      <td className="py-3 px-4 text-gray-700 font-medium text-orange-600">
                        {order.remainingAmount.toLocaleString()} VND
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(order)}`}>
                          {getStatusText(order)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                          onClick={() => setSelectedOrder(order)}
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Chi tiết đơn hàng</h3>
              <button
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã đơn hàng</label>
                    <p className="text-gray-900 font-semibold break-all">{selectedOrder.orderId}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
                    <p className="text-gray-900">
                      {selectedOrder.paymentMethod === "BANK_TRANSFER" ? "Chuyển khoản ngân hàng" : selectedOrder.paymentMethod}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã giao dịch</label>
                    <p className="text-gray-900 font-medium">{selectedOrder.transactionId}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo đơn</label>
                    <p className="text-gray-900">{formatDateTime(selectedOrder.createdAt)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tổng tiền</label>
                    <p className="text-gray-900 font-bold text-lg text-blue-600">
                      {selectedOrder.price.toLocaleString()} VND
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền đã đặt cọc</label>
                    <p className="text-gray-900 font-semibold text-green-600">
                      {selectedOrder.depositAmount.toLocaleString()} VND
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền còn lại</label>
                    <p className="text-gray-900 font-semibold text-orange-600">
                      {selectedOrder.remainingAmount.toLocaleString()} VND
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(selectedOrder)}`}>
                      {getStatusText(selectedOrder)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tiến độ thanh toán</label>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((selectedOrder.price - selectedOrder.remainingAmount) / selectedOrder.price) * 100}%` 
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Đã thanh toán: {(((selectedOrder.price - selectedOrder.remainingAmount) / selectedOrder.price) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              {selectedOrder.remainingAmount > 0 && (
                <>
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
                    onClick={() => handleConfirmPayment(selectedOrder.orderId)}
                  >
                    Xác nhận thanh toán đủ
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
                    onClick={() => handleCancelOrder(selectedOrder.orderId)}
                  >
                    Hủy đơn hàng
                  </button>
                </>
              )}
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
                onClick={() => setSelectedOrder(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}