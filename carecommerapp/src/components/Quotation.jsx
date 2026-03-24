import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Button, Spinner } from "react-bootstrap";
import { BiArrowBack, BiGift, BiPhoneCall, BiMessageRoundedDetail } from "react-icons/bi";
import { FaRegUserCircle } from "react-icons/fa";

export default function Quotation() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  // Giả lập load data xe (Bạn có thể gọi API thật endpoint 'get-car-by-id')
  useEffect(() => {
    setTimeout(() => {
      setCar({
        id: "CAR-15565",
        name: "Porsche 911 GT3",
        subtitle: "Phiên bản hiệu năng cao • Shark Blue Custom",
        price: 18500000000,
        manufacturingYear: 2024,
        image: "https://images.unsplash.com/photo-1503376710356-6cb021d7bfa0?q=80&w=2070&auto=format&fit=crop"
      });
      setLoading(false);
    }, 600);
  }, [id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + " đ";
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8f9fa", paddingTop: "80px" }}>
        <Spinner animation="border" style={{ color: "#2563eb", width: "3rem", height: "3rem" }} />
      </div>
    );
  }

  if (!car) return null;

  // Tính toán phí lăn bánh
  const basePrice = car.price;
  const plateFee = 20000000;
  const roadFee = 2160000;
  const tax = basePrice * 0.1; // 10%
  const total = basePrice + plateFee + roadFee + tax;

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", fontFamily: "'Inter', 'Roboto', sans-serif", paddingBottom: "100px" }}>
      
      {/* HEADER BÁO GIÁ */}
      <div style={{ backgroundColor: "#ffffff", padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px", position: "sticky", top: 0, zIndex: 10, borderBottom: "1px solid #eaeaea", paddingTop: "80px" }}>
        <BiArrowBack size={24} color="#2563eb" style={{ cursor: "pointer" }} onClick={() => navigate(-1)} />
        <h1 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0, color: "#111" }}>Báo giá chi tiết</h1>
      </div>

      <Container style={{ maxWidth: "600px", paddingTop: "24px" }}>
        
        {/* CAR IMAGE & INFO */}
        <div style={{ position: "relative", marginBottom: "20px", borderRadius: "12px", overflow: "hidden", backgroundColor: "#1e1e1e", height: "auto" }}>
          <img src={car.image} alt={car.name} style={{ width: "100%", height: "240px", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", bottom: "16px", left: "16px", backgroundColor: "rgba(255,255,255,0.9)", color: "#111", padding: "6px 12px", fontSize: "0.75rem", fontWeight: 800, borderRadius: "4px", letterSpacing: "0.5px" }}>
            MODEL {car.manufacturingYear}
          </div>
        </div>

        <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#111", margin: "0 0 4px 0" }}>{car.name}</h2>
        <p style={{ fontSize: "0.95rem", color: "#555", marginBottom: "32px" }}>{car.subtitle}</p>

        {/* CHI TIẾT LĂN BÁNH */}
        <h3 style={{ fontSize: "0.75rem", fontWeight: 800, color: "#666", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>CHI TIẾT GIÁ LĂN BÁNH</h3>
        
        <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #eaeaea", overflow: "hidden", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "16px", borderBottom: "1px solid #eaeaea" }}>
            <span style={{ color: "#444", fontSize: "0.95rem" }}>Giá xe (Base Price)</span>
            <span style={{ fontWeight: 700, color: "#111" }}>{formatPrice(basePrice)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "16px", borderBottom: "1px solid #eaeaea" }}>
            <span style={{ color: "#444", fontSize: "0.95rem" }}>Phí biển số (Plate Fee)</span>
            <span style={{ fontWeight: 700, color: "#111" }}>{formatPrice(plateFee)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "16px", borderBottom: "1px solid #eaeaea" }}>
            <span style={{ color: "#444", fontSize: "0.95rem" }}>Bảo trì đường bộ (Road Fee)</span>
            <span style={{ fontWeight: 700, color: "#111" }}>{formatPrice(roadFee)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "16px", backgroundColor: "#f0f7ff", border: "1px solid #bae6fd", borderRadius: "0 0 12px 12px", margin: "-1px" }}>
            <span style={{ color: "#1d4ed8", fontSize: "0.95rem", fontWeight: 600 }}>Thuế trước bạ (Tax - 10%)</span>
            <span style={{ fontWeight: 800, color: "#1d4ed8" }}>{formatPrice(tax)}</span>
          </div>
        </div>

        {/* ƯU ĐÃI KHUYẾN MÃI */}
        <div style={{ backgroundColor: "#e0f2fe", border: "1px solid #bae6fd", borderRadius: "12px", padding: "20px", display: "flex", gap: "16px", marginBottom: "40px" }}>
          <div style={{ backgroundColor: "#2563eb", width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <BiGift color="#fff" size={24} />
          </div>
          <div>
            <div style={{ fontSize: "1rem", fontWeight: 800, color: "#1d4ed8", marginBottom: "4px" }}>Ưu đãi đặc biệt</div>
            <div style={{ fontSize: "0.9rem", color: "#334155", lineHeight: 1.5 }}>
              Tặng gói bảo dưỡng 2 năm hoặc phủ Ceramic khi đặt cọc online trong hôm nay.
            </div>
          </div>
        </div>

        {/* NHÂN VIÊN TƯ VẤN */}
        <h3 style={{ fontSize: "0.75rem", fontWeight: 800, color: "#666", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>NHÂN VIÊN TƯ VẤN</h3>
        
        <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #eaeaea", padding: "24px" }}>
          <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ backgroundColor: "#eff6ff", width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FaRegUserCircle color="#2563eb" size={32} />
            </div>
            <div>
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#111", marginBottom: "4px" }}>Liên hệ với nhân viên tư vấn</div>
              <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Hỗ trợ 24/7 về thủ tục trả góp & lăn bánh</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
            <Button style={{ flex: 1, backgroundColor: "#2563eb", border: "none", padding: "12px", fontWeight: 700, borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
              <BiPhoneCall size={20} /> Gọi điện
            </Button>
            <Button style={{ flex: 1, backgroundColor: "#eff6ff", color: "#2563eb", border: "none", padding: "12px", fontWeight: 700, borderRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
              <BiMessageRoundedDetail size={20} /> Nhắn tin
            </Button>
          </div>
          <Button style={{ width: "100%", backgroundColor: "#ffffff", color: "#334155", border: "1px solid #cbd5e1", padding: "12px", fontWeight: 700, borderRadius: "8px" }}>
            Yêu cầu gọi lại
          </Button>
        </div>

      </Container>

      {/* STICKY BOTTOM BAR */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: "#ffffff", borderTop: "1px solid #eaeaea", padding: "20px 24px", zIndex: 100, display: "flex", justifyContent: "center", boxShadow: "0 -4px 20px rgba(0,0,0,0.05)" }}>
        <div style={{ maxWidth: "600px", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "24px" }}>
          <div>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Tổng cộng</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#111" }}>{formatPrice(total)}</div>
          </div>
          <Button 
            onClick={() => {
              sessionStorage.setItem("car", JSON.stringify(car));
              navigate(`/reserve/${car.id}`, { state: { car } });
            }}
            style={{ backgroundColor: "#2563eb", border: "none", padding: "16px 24px", fontWeight: 700, borderRadius: "8px", flex: 1, textAlign: "center" }}>
            Tiến hành Đặt cọc giữ xe
          </Button>
        </div>
      </div>

    </div>
  );
}
