import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheck, FaDownload, FaHistory } from "react-icons/fa";
import { ShieldCheck } from "lucide-react";

export default function PaymentCompleted() {
  const location = useLocation();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);

  useEffect(() => {
    // Lấy thông tin xe đã lưu từ quá trình đặt cọc trước đó
    const savedCar = sessionStorage.getItem("car");
    if (savedCar) {
      try {
        setCar(JSON.parse(savedCar));
      } catch (e) {
        console.error("Failed to parse car info from session storage", e);
      }
    } else {
      // Mock data cho chiếc xe nếu test trực tiếp
      setCar({
        name: "Porsche 911 GT3",
        vinNumber: "WP0ZZZ99ZLS123456",
        images: ["https://images.unsplash.com/photo-1503376710356-6cb021d7bfa0?q=80&w=1000&auto=format&fit=crop"]
      });
    }
  }, []);

  // Lấy dữ liệu từ query parameters VNPay trả về
  const params = new URLSearchParams(location.search);
  let data = Object.fromEntries(params.entries());

  // NẾU TRUY CẬP TRỰC TIẾP KHÔNG CÓ PARAM (CHẾ ĐỘ TEST/MOCK DATA)
  if (Object.keys(data).length === 0) {
    data = {
      vnp_Amount: "50000000000", // 500.000.000 VND (VNPay format * 100)
      vnp_TransactionNo: "VNP12345678",
      vnp_BankCode: "VNPAY-QR",
      vnp_PayDate: "20260525143000", // 14:30 25/05/2026
      vnp_OrderInfo: "Nguyễn Văn A" // Tên khách mock
    };
  }

  // Format số tiền
  const formatAmount = (amountStr) => {
    const raw = parseInt(amountStr || 0);
    // VNPay amount is multiplied by 100
    const finalAmount = raw > 0 ? raw / 100 : 50000000; // fallback to 50M if missing
    return new Intl.NumberFormat("vi-VN").format(finalAmount) + " đ";
  };

  // Format thời gian từ chuỗi kiểu 20240525143000
  const formatPayDate = (payDateStr) => {
    if (!payDateStr || payDateStr.length !== 14) return "14:30 - 25/05/2026"; // mockup fallback
    const yyyy = payDateStr.slice(0,4);
    const MM = payDateStr.slice(4,6);
    const dd = payDateStr.slice(6,8);
    const hh = payDateStr.slice(8,10);
    const mm = payDateStr.slice(10,12);
    return `${hh}:${mm} - ${dd}/${MM}/${yyyy}`;
  };

  const transactionNo = data["vnp_TransactionNo"] || "VNP12345678";
  const bankCode = data["vnp_BankCode"] || "VNPAY-QR";
  const orderInfo = data["vnp_OrderInfo"] ? decodeURIComponent(data["vnp_OrderInfo"]).replace(/\+/g, " ") : "Thanh toán giao dịch";
  
  // Trích xuất tên từ orderInfo giả định nếu có, hoặc để fallback
  const customerName = orderInfo.length < 20 && orderInfo !== "Thanh toán giao dịch" ? orderInfo : "Nguyễn Văn A";

  return (
    <div className="min-h-screen bg-[#f8f9fc] pt-32 pb-24 px-4 font-['Inter',_sans-serif]">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER TRẠNG THÁI */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-100 text-[#0056b3] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-50">
            <FaCheck size={30} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight mb-4">
            Thanh toán đặt cọc thành công!
          </h1>
          <p className="text-gray-600 text-[15px] mb-1">
            Mã giao dịch: <strong className="text-gray-900">{transactionNo}</strong>.
          </p>
          <p className="text-gray-600 text-[15px]">
            Chúc mừng Quý khách đã đặt giữ chỗ thành công chiếc xe <strong className="text-[#0056b3]">{car?.name || "Porsche 911 GT3"}</strong>.
          </p>
        </div>

        {/* THẺ HÓA ĐƠN ĐIỆN TỬ */}
        <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col md:flex-row overflow-hidden mb-10">
          
          {/* Cột Trái: Ảnh xe và thông tin cơ bản */}
          <div className="w-full md:w-[45%] bg-[#f4f4f5] p-6 lg:p-8 flex flex-col justify-center relative">
            <div className="aspect-[16/10] bg-transparent rounded-xl flex items-center justify-center overflow-hidden mb-8 mix-blend-multiply">
              <img 
                src={car?.images?.[0] || car?.image || "https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=1000&auto=format&fit=crop"} 
                alt="Car" 
                className="w-full h-full object-contain mix-blend-multiply scale-110 drop-shadow-2xl" 
                style={{ filter: "contrast(1.1) brightness(0.9)" }}
              />
            </div>
            
            <div className="mb-6">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Vehicle Model</div>
              <h2 className="text-xl font-extrabold text-gray-900 uppercase">{car?.name || "Porsche 911 GT3"}</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-gray-200/60 pt-6">
              <div>
                 <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">VIN</div>
                 <div className="text-sm font-mono text-gray-800">{car?.vinNumber || "WP0ZZZ99ZLS123456"}</div>
              </div>
              <div>
                 <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Config ID</div>
                 <div className="text-sm font-mono text-gray-800">GT3-2026-PM99</div>
              </div>
            </div>
          </div>

          {/* Cột Phải: Bảng Tóm tắt Giao dịch */}
          <div className="w-full md:w-[55%] p-6 lg:p-8 bg-white flex flex-col justify-center">
            
            <div className="mb-8">
               <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Total Deposit Amount</div>
               <div className="text-4xl text-[#0056b3] font-black tracking-tight">{formatAmount(data["vnp_Amount"])}</div>
            </div>

            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                 <span className="text-gray-500 text-sm font-medium">Phương thức thanh toán</span>
                 <span className="font-bold text-gray-900">{bankCode}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                 <span className="text-gray-500 text-sm font-medium">Tên khách hàng</span>
                 <span className="font-bold text-gray-900">{customerName}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                 <span className="text-gray-500 text-sm font-medium">Thời gian</span>
                 <span className="font-bold text-gray-900">{formatPayDate(data["vnp_PayDate"])}</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                 <span className="text-gray-500 text-sm font-medium">Trạng thái</span>
                 <span className="px-3 py-1 bg-green-100 text-green-700 font-bold text-[11px] rounded-[4px] uppercase tracking-wider">
                   Hoàn tất
                 </span>
              </div>
            </div>

            <div className="mt-8 flex gap-2 items-center italic text-gray-500 text-xs">
              <ShieldCheck size={14} className="text-gray-400" />
              <span>Chứng từ điện tử có giá trị pháp lý theo quy định hiện hành.</span>
            </div>

          </div>
        </div>

        {/* NÚT ACTION */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
          <button className="w-full sm:w-auto bg-[#0056b3] text-white py-3.5 px-8 rounded-[8px] font-bold hover:bg-[#004494] transition-colors shadow-lg shadow-blue-500/20 text-sm uppercase tracking-wider flex justify-center items-center gap-2">
            <FaDownload size={14} /> Tải biên lai (PDF)
          </button>
          <button 
             onClick={() => navigate("/all-my-reserve")}
             className="w-full sm:w-auto bg-transparent text-[#0056b3] border-2 border-[#0056b3] py-[12px] px-8 rounded-[8px] font-bold hover:bg-blue-50/50 transition-colors text-sm uppercase tracking-wider flex justify-center items-center gap-2"
          >
            <FaHistory size={14} /> Xem lịch sử đơn hàng
          </button>
        </div>

        {/* GHI CHÚ CUỐI TRANG */}
        <div className="border-t border-gray-200 pt-8 text-center max-w-2xl mx-auto">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[1px] leading-relaxed">
            Quý khách vui lòng kiểm tra email để nhận xác nhận chi tiết. Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ bộ phận hỗ trợ Precision Motors qua số <span className="text-gray-900">1900-XXXX</span>.
          </p>
        </div>

      </div>
    </div>
  );
}