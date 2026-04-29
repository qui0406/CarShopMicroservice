import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authApis, endpoints } from '../configs/APIs';
import { MyUserContext } from '../configs/MyContexts';

const fmt = (n) => (n == null ? '0 đ' : Number(n).toLocaleString('vi-VN') + ' đ');

export default function DepositConfirm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { order, form, car, paymentMethod, depositAmount } = location.state || {};

  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const user = useContext(MyUserContext);

  // Guard: not logged in → go to login, come back after
  useEffect(() => {
    if (user !== undefined && user === null) {
      navigate('/login?next=/deposit-confirm', { state: location.state });
    }
  }, [user, navigate, location.state]);

  // Guard: if no state, redirect back
  useEffect(() => {
    if (!order || !car) navigate('/home');
  }, [order, car, navigate]);

  if (!order || !car) return null;

  const carImg = car?.imageUrls?.[0] || car?.carModel?.thumbnailImage
    || 'https://images.unsplash.com/photo-1617469767524-4f5eb3b2b2f1?w=900';

  const handlePay = async () => {
    setPaying(true);
    setError('');
    try {
      const res = await authApis().get(
        endpoints['create-vnpay-url'](order.id, depositAmount, 'DEPOSIT')
      );
      const url = res.data?.result || res.data;
      if (url) {
        window.location.href = url;
      } else {
        setError('Không thể tạo liên kết thanh toán. Vui lòng thử lại.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Lỗi kết nối, vui lòng thử lại.');
    } finally {
      setPaying(false);
    }
  };

  const payMethodLabel = {
    'vnpay-qr': 'VNPAY-QR Code',
    'atm': 'Thẻ ATM nội địa',
    'intl': 'Thẻ quốc tế',
  }[paymentMethod] || 'VNPAY';

  return (
    <div style={s.page}>
      {/* NAV */}
      <nav style={s.nav}>
        <button onClick={() => navigate('/')} style={s.logo}>PRECISION</button>
        <div style={s.navLinks}>
          {['DÒNG XE','MUA XE','DỊCH VỤ','TRẢI NGHIỆM','CỬA HÀNG'].map(item => (
            <span key={item} style={{ ...s.navLink, ...(item==='MUA XE' ? s.navLinkActive : {}) }}>{item}</span>
          ))}
        </div>
        <button style={s.reserveBtn}>Đặt xe ngay</button>
      </nav>

      {/* HERO LABEL */}
      <div style={s.heroSection}>
        <p style={s.portalLabel}>CỔNG ĐẶT XE</p>
        <h1 style={s.heroTitle}>ĐẶT CỌC TRỰC TUYẾN</h1>
        <div style={s.titleLine}></div>
      </div>

      {/* CONTENT */}
      <div style={s.content}>

        {/* LEFT: Confirmed Info */}
        <div style={s.leftCol}>

          {/* Customer Info Summary */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardIconWrap}>👤</div>
              <span style={s.cardTitle}>Thông tin khách hàng</span>
            </div>
            <div style={s.infoGrid}>
              {[
                { label: 'HỌ VÀ TÊN', value: form.fullName },
                { label: 'SỐ ĐIỆN THOẠI', value: form.phone },
                ...(form.idNumber ? [{ label: 'SỐ CCCD/HỘ CHIẾU', value: form.idNumber }] : []),
                ...(form.dob ? [{ label: 'NGÀY SINH', value: new Date(form.dob).toLocaleDateString('vi-VN') }] : []),
              ].map(row => (
                <div key={row.label} style={s.infoRow}>
                  <span style={s.infoLabel}>{row.label}</span>
                  <span style={s.infoValue}>{row.value}</span>
                </div>
              ))}
              <div style={{ ...s.infoRow, flexDirection:'column', alignItems:'flex-start', gap:4, gridColumn:'1/-1' }}>
                <span style={s.infoLabel}>ĐỊA CHỈ GIAO XE</span>
                <span style={{ ...s.infoValue, textAlign:'left', fontWeight:600, color:'#374151' }}>{form.address}</span>
              </div>
            </div>
          </div>

          {/* Order Info Summary */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardIconWrap}>📄</div>
              <span style={s.cardTitle}>Thông tin đơn hàng</span>
            </div>
            <div style={s.infoGrid}>
              {[
                { label: 'MÃ ĐƠN HÀNG', value: order.id ? `#${order.id.substring(0,12).toUpperCase()}` : '#N/A' },
                { label: 'NGÀY ĐẶT', value: new Date().toLocaleString('vi-VN') },
                { label: 'PHƯƠNG THỨC TT', value: payMethodLabel },
                { label: 'TRẠNG THÁI', value: 'Chờ thanh toán' },
              ].map(row => (
                <div key={row.label} style={s.infoRow}>
                  <span style={s.infoLabel}>{row.label}</span>
                  <span style={{ ...s.infoValue, ...(row.label==='TRẠNG THÁI' ? { color:'#d97706' } : {}) }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardIconWrap}>💳</div>
              <span style={s.cardTitle}>Phương thức thanh toán</span>
            </div>
            <div style={s.methodRow}>
              {[
                { key:'vnpay-qr', label: 'VNPAY-QR', icon:'▦' },
                { key:'atm', label: 'Thẻ ATM', icon:'🏦' },
                { key:'intl', label: 'Thẻ Quốc tế', icon:'🌐' },
              ].map(m => (
                <div key={m.key} style={{ ...s.methodChip, ...(m.key === paymentMethod ? s.methodChipActive : {}) }}>
                  <span style={{ fontSize:'1rem' }}>{m.icon}</span>
                  <span style={{ fontSize:'0.75rem', fontWeight:800 }}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT: Car + Deposit */}
        <div style={s.rightCol}>

          {/* Car Card */}
          <div style={s.carCard}>
            <div style={s.carCardTop}>
              <div>
                <h3 style={s.carName}>{car.name}</h3>
                <p style={s.carSub}>{car.carModel?.name || 'Performance Edition'}</p>
              </div>
              <span style={{ fontSize:'1.5rem' }}>🚗</span>
            </div>

            <img src={carImg} alt={car.name} style={s.carImg}
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1617469767524-4f5eb3b2b2f1?w=900'; }} />

            <div style={s.carSpecs}>
              {[
                { label: 'MÀU NGOẠI THẤT', value: car.carModel?.exteriorColor || 'Chưa cập nhật' },
                { label: 'NỘI THẤT', value: car.carModel?.interiorColor || 'Chưa cập nhật' },
                { label: 'MÂM XE', value: car.carModel?.rimType || 'Thiết kế tiêu chuẩn 20"' },
              ].map(row => (
                <div key={row.label} style={s.specRow}>
                  <span style={s.specLabel}>{row.label}</span>
                  <span style={s.specValue}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deposit CTA */}
          <div style={s.depositCard}>
            <p style={s.depositMeta}>SỐ TIỀN ĐẶT CỌC TỐI THIỂU</p>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <span style={s.depositAmt}>{fmt(depositAmount)}</span>
              <span style={s.depositBadge}>✔</span>
            </div>

            <div style={s.breakdown}>
              <div style={s.bRow}>
                <span style={s.bLabel}>Giá trị xe dự tính</span>
                <span style={s.bVal}>{fmt(car.price)}</span>
              </div>
              <div style={s.bRow}>
                <span style={s.bLabel}>Phí dịch vụ trực tuyến</span>
                <span style={{ ...s.bVal, color:'#86efac' }}>Miễn phí</span>
              </div>
            </div>

            {error && (
              <div style={s.errorBox}>⚠️ {error}</div>
            )}

            <button onClick={handlePay} disabled={paying} style={{ ...s.payBtn, opacity: paying ? 0.7 : 1 }}>
              {paying
                ? <><span style={s.spinnerWhite}></span> Đang xử lý...</>
                : 'TIẾN HÀNH THANH TOÁN →'}
            </button>

            <p style={s.disclaimer}>
              Bằng việc nhấn đặt cọc, bạn đồng ý với điều khoản và chính sách của chúng tôi.
            </p>
          </div>

          {/* Perf Specs */}
          {(car.carModel?.technicalSpec?.horsepower || car.carModel?.technicalSpec?.acceleration) && (
            <div style={s.perfGrid}>
              {[
                car.carModel?.technicalSpec?.acceleration && { label:'TĂNG TỐC 0–100KM/H', value:`${car.carModel.technicalSpec.acceleration} s` },
                car.carModel?.technicalSpec?.horsepower && { label:'CÔNG SUẤT CỰC ĐẠI', value:`${car.carModel.technicalSpec.horsepower} kW` },
              ].filter(Boolean).map(spec => (
                <div key={spec.label} style={s.perfItem}>
                  <p style={s.perfLabel}>{spec.label}</p>
                  <p style={s.perfVal}>{spec.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Back button */}
          <button onClick={() => navigate(-1)} style={s.backBtn}>
            ← Chỉnh sửa thông tin
          </button>
        </div>

      </div>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={s.footerLeft}>
          <span style={s.footerLogo}>PRECISION</span>
          {['Thông báo pháp lý','Chính sách bảo mật','Chính sách Cookie','Tiêu thụ/Phát thải'].map(l => (
            <a key={l} href="#" style={s.footerLink}>{l}</a>
          ))}
        </div>
        <span style={{ fontSize:'0.7rem', color:'#9ca3af' }}>© 2026 Bản kỹ thuật số Precision. Tất cả các quyền được bảo lưu.</span>
      </footer>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const s = {
  page:{ minHeight:'100vh', background:'#fff', fontFamily:"'Inter','Segoe UI',sans-serif", display:'flex', flexDirection:'column' },

  nav:{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 56px', height:68, borderBottom:'1px solid #e5e7eb', background:'#fff', position:'sticky', top:0, zIndex:100 },
  logo:{ fontWeight:900, fontSize:'1rem', letterSpacing:'3px', background:'none', border:'none', cursor:'pointer', color:'#111' },
  navLinks:{ display:'flex', gap:36 },
  navLink:{ fontSize:'0.78rem', fontWeight:600, color:'#6c757d', cursor:'pointer', letterSpacing:'0.3px', paddingBottom:2, borderBottom:'2px solid transparent' },
  navLinkActive:{ color:'#0a58ca', borderBottom:'2px solid #0a58ca' },
  reserveBtn:{ background:'#0a58ca', color:'#fff', border:'none', borderRadius:6, padding:'9px 22px', fontWeight:800, fontSize:'0.78rem', cursor:'pointer' },

  heroSection:{ padding:'44px 56px 0' },
  portalLabel:{ fontSize:'0.65rem', fontWeight:900, color:'#0a58ca', textTransform:'uppercase', letterSpacing:'3px', margin:'0 0 8px' },
  heroTitle:{ fontSize:'2.4rem', fontWeight:900, color:'#111', margin:'0 0 12px', letterSpacing:'-1px' },
  titleLine:{ width:48, height:3, background:'#0a58ca', borderRadius:2, marginBottom:36 },

  content:{ display:'grid', gridTemplateColumns:'1fr 400px', gap:32, padding:'0 56px 60px', flex:1, alignItems:'start' },
  leftCol:{ display:'flex', flexDirection:'column', gap:20 },
  rightCol:{ display:'flex', flexDirection:'column', gap:16 },

  card:{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, padding:'24px' },
  cardHeader:{ display:'flex', alignItems:'center', gap:12, marginBottom:20 },
  cardIconWrap:{ fontSize:'1.1rem' },
  cardTitle:{ fontWeight:900, fontSize:'0.95rem', color:'#111' },

  infoGrid:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px 24px' },
  infoRow:{ display:'flex', flexDirection:'column', gap:4 },
  infoLabel:{ fontSize:'0.62rem', fontWeight:900, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'1.5px' },
  infoValue:{ fontWeight:800, fontSize:'0.9rem', color:'#111', textAlign:'left' },

  methodRow:{ display:'flex', gap:12 },
  methodChip:{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'12px 16px', border:'1.5px solid #e5e7eb', borderRadius:10, flex:1, color:'#374151' },
  methodChipActive:{ border:'2px solid #0a58ca', background:'#eff6ff', color:'#0a58ca' },

  // Car Card
  carCard:{ border:'1px solid #e5e7eb', borderRadius:14, overflow:'hidden' },
  carCardTop:{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'18px 20px 14px' },
  carName:{ fontWeight:900, fontSize:'1.1rem', color:'#111', margin:'0 0 4px' },
  carSub:{ fontSize:'0.78rem', color:'#6c757d', margin:0, fontWeight:500 },
  carImg:{ width:'100%', height:210, objectFit:'cover', display:'block', borderTop:'1px solid #f1f5f9', borderBottom:'1px solid #f1f5f9' },
  carSpecs:{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:10 },
  specRow:{ display:'flex', justifyContent:'space-between', alignItems:'center' },
  specLabel:{ fontSize:'0.68rem', fontWeight:800, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'1px' },
  specValue:{ fontSize:'0.82rem', fontWeight:700, color:'#374151' },

  // Deposit CTA
  depositCard:{ background:'#0a58ca', borderRadius:14, padding:'28px 24px' },
  depositMeta:{ fontSize:'0.62rem', fontWeight:900, color:'rgba(255,255,255,.65)', textTransform:'uppercase', letterSpacing:'2px', margin:'0 0 6px' },
  depositAmt:{ fontSize:'1.8rem', fontWeight:900, color:'#fff', letterSpacing:'-0.5px' },
  depositBadge:{ width:32, height:32, background:'rgba(255,255,255,.2)', borderRadius:'50%', display:'inline-flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'0.95rem' },
  breakdown:{ background:'rgba(0,0,0,.15)', borderRadius:8, padding:'14px 16px', marginBottom:20, display:'flex', flexDirection:'column', gap:10 },
  bRow:{ display:'flex', justifyContent:'space-between', alignItems:'center' },
  bLabel:{ fontSize:'0.75rem', fontWeight:600, color:'rgba(255,255,255,.75)' },
  bVal:{ fontSize:'0.82rem', fontWeight:800, color:'#fff' },
  errorBox:{ background:'rgba(255,255,255,.15)', borderRadius:8, padding:'10px 14px', color:'#fef2f2', fontSize:'0.8rem', fontWeight:700, marginBottom:12 },
  payBtn:{ width:'100%', background:'#fff', color:'#0a58ca', border:'none', borderRadius:8, padding:'16px', fontWeight:900, fontSize:'0.82rem', letterSpacing:'1px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:14, transition:'transform .15s' },
  disclaimer:{ fontSize:'0.62rem', color:'rgba(255,255,255,.5)', textAlign:'center', lineHeight:1.7, margin:0 },
  spinnerWhite:{ width:14, height:14, border:'2px solid rgba(10,88,202,0.25)', borderTopColor:'#0a58ca', borderRadius:'50%', display:'inline-block', animation:'spin .8s linear infinite' },

  perfGrid:{ display:'grid', gridTemplateColumns:'1fr 1fr', border:'1px solid #e5e7eb', borderRadius:12, overflow:'hidden' },
  perfItem:{ padding:'18px 16px', borderRight:'1px solid #e5e7eb' },
  perfLabel:{ fontSize:'0.6rem', fontWeight:800, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'1.5px', margin:'0 0 6px' },
  perfVal:{ fontSize:'1.3rem', fontWeight:900, color:'#111', margin:0 },

  backBtn:{ background:'none', border:'1.5px solid #e5e7eb', borderRadius:10, padding:'12px 20px', fontWeight:700, fontSize:'0.82rem', color:'#374151', cursor:'pointer', width:'100%', transition:'background .15s' },

  footer:{ borderTop:'1px solid #e5e7eb', background:'#fff', padding:'24px 56px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginTop:'auto' },
  footerLeft:{ display:'flex', alignItems:'center', gap:28, flexWrap:'wrap' },
  footerLogo:{ fontWeight:900, fontSize:'0.85rem', letterSpacing:'3px', color:'#111' },
  footerLink:{ fontSize:'0.72rem', color:'#6c757d', fontWeight:600, textDecoration:'none' },
};
