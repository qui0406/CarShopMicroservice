import React, { useState, useEffect } from "react";

export default function Cashier() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    setOrders([
      {
        orderId: "DH001",
        fullName: "Nguyễn Văn A",
        username: "nguyenvana",
        address: "Hà Nội",
        quantity: 2,
        totalAmount: 500000,
        disposableAmount: 100000,
        remainAmount: 400000,
        transactionId: null,
        createdAt: "2025-09-11T10:20:00",
        paymentStatus: "PENDING",
      },
      {
        orderId: "DH002",
        fullName: "Trần Thị B",
        username: "tranb",
        address: "TPHCM",
        quantity: 1,
        totalAmount: 200000,
        disposableAmount: 50000,
        remainAmount: 150000,
        transactionId: "TXN123456",
        createdAt: "2025-09-10T14:30:00",
        paymentStatus: "PAID",
      },
    ]);
  }, []);

  const formatDateTime = (dateStr) => new Date(dateStr).toLocaleString("vi-VN");

  const handleConfirmPayment = (orderId) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.orderId === orderId 
          ? { ...order, paymentStatus: "PAID", transactionId: "TXN" + Date.now() }
          : order
      )
    );
    setSelectedOrder(null);
  };

  const handleCancelOrder = (orderId) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
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
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Khách hàng</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Địa chỉ</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tổng tiền</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Trạng thái</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr key={order.orderId} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-3 px-4 font-medium text-gray-900">{order.orderId}</td>
                    <td className="py-3 px-4 text-gray-700">{order.fullName}</td>
                    <td className="py-3 px-4 text-gray-700">{order.address}</td>
                    <td className="py-3 px-4 text-gray-700">{order.totalAmount.toLocaleString()} VND</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.paymentStatus === "PENDING" 
                          ? "bg-yellow-100 text-yellow-800" 
                          : order.paymentStatus === "PAID"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {order.paymentStatus === "PENDING" ? "Chờ thanh toán" : 
                         order.paymentStatus === "PAID" ? "Đã thanh toán" : "Đã hủy"}
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
                ))}
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
                    <p className="text-gray-900 font-semibold">{selectedOrder.orderId}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên khách hàng</label>
                    <p className="text-gray-900">{selectedOrder.fullName}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <p className="text-gray-900">{selectedOrder.username || "Chưa có"}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                    <p className="text-gray-900">{selectedOrder.address}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
                    <p className="text-gray-900">{selectedOrder.quantity}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tổng tiền</label>
                    <p className="text-gray-900 font-semibold text-lg">{selectedOrder.totalAmount.toLocaleString()} VND</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền đặt cọc</label>
                    <p className="text-gray-900">{selectedOrder.disposableAmount?.toLocaleString()} VND</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền còn lại</label>
                    <p className="text-gray-900 font-medium text-orange-600">{selectedOrder.remainAmount?.toLocaleString()} VND</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã giao dịch</label>
                    <p className="text-gray-900">{selectedOrder.transactionId || "Chưa có"}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo đơn</label>
                    <p className="text-gray-900">{formatDateTime(selectedOrder.createdAt)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedOrder.paymentStatus === "PENDING" 
                        ? "bg-yellow-100 text-yellow-800" 
                        : selectedOrder.paymentStatus === "PAID"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {selectedOrder.paymentStatus === "PENDING" ? "Chờ thanh toán" : 
                       selectedOrder.paymentStatus === "PAID" ? "Đã thanh toán" : "Đã hủy"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              {selectedOrder.paymentStatus === "PENDING" && (
                <>
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
                    onClick={() => handleConfirmPayment(selectedOrder.orderId)}
                  >
                    Xác nhận thanh toán
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