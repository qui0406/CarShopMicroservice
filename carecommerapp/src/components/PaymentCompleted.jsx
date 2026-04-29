import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { endpoints, authApis } from '../configs/APIs';

const fmt = (n) => (n == null ? '0 đ' : Number(n).toLocaleString('vi-VN') + ' đ');

export default function PaymentCompleted() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'failed'
  const [orderInfo, setOrderInfo] = useState(null);
  const [carInfo, setCarInfo] = useState(null);

  // VNPAY return params
  const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
  const vnp_TxnRef = searchParams.get('vnp_TxnRef');
  const vnp_Amount = searchParams.get('vnp_Amount'); // in VND * 100
  const vnp_BankCode = searchParams.get('vnp_BankCode');
  const vnp_PayDate = searchParams.get('vnp_PayDate');

  useEffect(() => {
    const checkPayment = async () => {
      try {
        if (!vnp_TxnRef) {
          setStatus('failed');
          return;
        }

        // Call status API if needed, or just rely on vnp_ResponseCode
        if (vnp_ResponseCode === '00') {
           setStatus('success');
           // Fetch order details to show on the success page
           try {
             // Assuming TxnRef contains the order ID or we can fetch it
             // Let's try to get the order status from our backend
             const orderRes = await authApis().get(endpoints['get-order-by-id'](vnp_TxnRef));
             const orderData = orderRes.data.result || orderRes.data;
             setOrderInfo(orderData);

             if (orderData?.carId) {
                 const carRes = await axios.get(endpoints['get-product-by-id'](orderData.carId));
                 setCarInfo(carRes.data.result || carRes.data);
             }
           } catch (e) {
               console.error("Could not fetch order/car details", e);
           }
        } else {
           setStatus('failed');
        }

      } catch (error) {
        console.error('Error checking payment:', error);
        setStatus('failed');
      }
    };

    checkPayment();
  }, [vnp_ResponseCode, vnp_TxnRef]);

  // Format VNPAY valid Date string (yyyyMMddHHmmss)
  const formatVnpDate = (dateStr) => {
    if (!dateStr || dateStr.length !== 14) return new Date().toLocaleString('vi-VN');
    const yyyy = dateStr.slice(0, 4);
    const MM = dateStr.slice(4, 6);
    const dd = dateStr.slice(6, 8);
    const HH = dateStr.slice(8, 10);
    const mm = dateStr.slice(10, 12);
    return `${HH}:${mm} - ${dd}/${MM}/${yyyy}`;
  };

  const amountDisplay = vnp_Amount ? fmt(parseInt(vnp_Amount) / 100) : '0 đ';
  const payDateDisplay = formatVnpDate(vnp_PayDate);

  if (status === 'loading') {
    return (
      <div style={s.pageCenter}>
        <div style={s.spinner}></div>
        <p style={{ marginTop: 16, color: '#6c757d', fontWeight: 600 }}>Đang kiểm tra trạng thái thanh toán...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div style={s.pageCenter}>
        <div style={s.failedIcon}>✖</div>
        <h2 style={s.failedTitle}>Thanh toán thất bại</h2>
        <p style={s.failedText}>Giao dịch không thành công hoặc đã bị hủy.</p>
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
           <button onClick={() => navigate(-1)} style={s.outlineBtn}>Thử lại</button>
           <button onClick={() => navigate('/home')} style={s.primaryBtn}>Về trang chủ</button>
        </div>
      </div>
    );
  }

  const carImg = carInfo?.imageUrls?.[0] || carInfo?.carModel?.thumbnailImage || 'https://images.unsplash.com/photo-1503376713431-155e81fcae13?q=80&w=800&auto=format';
  const carName = carInfo?.name || 'Porsche 911 GT3';
  const carModelName = carInfo?.carModel?.name || carName;

  return (
    <div style={s.page}>
      {/* NAV */}
      <nav style={s.nav}>
        <button onClick={() => navigate('/')} style={s.logo}>PRECISION MOTORS</button>
        <div style={s.navLinks}>
          {['KHO XE','CẤU HÌNH','TÀI CHÍNH', 'CHỦ SỞ HỮU'].map(item => (
            <span key={item} style={{ ...s.navLink, ...(item==='CHỦ SỞ HỮU' ? s.navLinkActive : {}) }}>{item}</span>
          ))}
        </div>
        <button style={s.reserveBtn}>Đặt xe ngay</button>
      </nav>

      {/* CONTENT */}
      <div style={s.content}>
        
        {/* Header Icon & Title */}
        <div style={s.headerWrap}>
           <div style={s.successIconWrap}>
              <div style={s.successIcon}>✓</div>
           </div>
           <h1 style={s.pageTitle}>THANH TOÁN ĐẶT CỌC THÀNH CÔNG!</h1>
           <p style={s.pageSub}>
             Mã giao dịch: <span style={{fontWeight: 800}}>{vnp_TxnRef || 'VNP12345678'}</span>.<br/>
             Chúc mừng Quý khách đã đặt giữ chỗ thành công chiếc xe <span style={{color: '#0a58ca', fontWeight: 700}}>{carName}</span>.
           </p>
        </div>

        {/* Receipt Card */}
        <div style={s.receiptCard}>
           {/* Left: Car Image */}
           <div style={s.receiptLeft}>
              <div style={s.imgWrap}>
                 <img src={carImg} alt="Car" style={s.carImg} />
              </div>
              <div style={s.carInfoWrap}>
                 <p style={s.carLabel}>MẪU XE</p>
                 <h3 style={s.carName}>{carModelName}</h3>
                 <div style={s.carMetaGrid}>
                    <div>
                       <p style={s.metaLabel}>VIN</p>
                       <p style={s.metaValue}>WP0ZZZ99ZLS123456</p>
                    </div>
                    <div>
                       <p style={s.metaLabel}>CONFIG ID</p>
                       <p style={s.metaValue}>GT3-2026-PM99</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Right: Payment Details */}
           <div style={s.receiptRight}>
              <div style={{ marginBottom: 24 }}>
                 <p style={s.totalLabel}>TỔNG SỐ TIỀN ĐẶT CỌC</p>
                 <p style={s.totalAmount}>{amountDisplay}</p>
              </div>

              <div style={s.detailRows}>
                 <div style={s.row}>
                    <span style={s.rowLabel}>Phương thức thanh toán</span>
                    <span style={s.rowValue}>VNPAY-QR{vnp_BankCode ? ` (${vnp_BankCode})` : ''}</span>
                 </div>
                 <div style={s.row}>
                    <span style={s.rowLabel}>Tên khách hàng</span>
                    <span style={s.rowValue}>{orderInfo?.receiverName || 'Nguyễn Văn A'}</span>
                 </div>
                 <div style={s.row}>
                    <span style={s.rowLabel}>Thời gian</span>
                    <span style={s.rowValue}>{payDateDisplay}</span>
                 </div>
                 <div style={s.row}>
                    <span style={s.rowLabel}>Trạng thái</span>
                    <span style={s.statusBadge}>HOÀN TẤT</span>
                 </div>
              </div>

              <div style={s.disclaimerWrap}>
                 <span style={s.checkMark}>✔</span>
                 <span style={s.disclaimerText}>Chứng từ điện tử có giá trị pháp lý theo quy định hiện hành.</span>
              </div>
           </div>
        </div>

        {/* Actions */}
        <div style={s.actionsWrap}>
           <button style={s.actionBtnPrimary}>
             <span style={{marginRight: 6}}>📥</span> TÀI BIÊN LAI (PDF)
           </button>
           <button onClick={() => navigate('/all-my-reserve')} style={s.actionBtnSecondary}>
             <span style={{marginRight: 6}}>🕒</span> XEM LỊCH SỬ ĐƠN HÀNG
           </button>
        </div>

        {/* Footer Note */}
        <div style={s.footerNoteLine}></div>
        <p style={s.footerNoteText}>
           QUÝ KHÁCH VUI LÒNG KIỂM TRA EMAIL ĐỂ NHẬN XÁC NHẬN CHI TIẾT. NẾU CÓ<br/>
           BẤT KỲ THẮC MẮC NÀO, VUI LÒNG LIÊN HỆ BỘ PHẬN HỖ TRỢ PRECISION MOTORS<br/>
           QUA SỐ <strong>1900-XXXX</strong>.
        </p>

      </div>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={s.footerLogoWrap}>
           <span style={s.footerLogo}>PRECISION MOTORS</span>
        </div>
        <div style={s.footerLinks}>
          {['CHÍNH SÁCH BẢO MẬT','ĐIỀU KHOẢN DỊCH VỤ','THÔNG SỐ PHÁP LÝ','HỖ TRỢ'].map(l => (
            <a key={l} href="#" style={s.footerLink}>{l}</a>
          ))}
        </div>
        <span style={s.footerCopy}>© 2026 PRECISION MOTORS. CHI TIẾT ĐẾN TỪ SỰ HOÀN HẢO.</span>
      </footer>

    </div>
  );
}

const s = {
  pageCenter: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' },
  spinner: { width: 40, height: 40, border: '4px solid #e5e7eb', borderTopColor: '#0a58ca', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  
  failedIcon: { width: 64, height: 64, borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: 20 },
  failedTitle: { fontSize: '1.8rem', fontWeight: 900, color: '#111', margin: '0 0 12px' },
  failedText: { fontSize: '0.95rem', color: '#6c757d', textAlign: 'center' },
  primaryBtn: { background: '#0a58ca', color: '#fff', border: 'none', borderRadius: 6, padding: '12px 24px', fontWeight: 800, cursor: 'pointer' },
  outlineBtn: { background: 'transparent', color: '#0a58ca', border: '2px solid #0a58ca', borderRadius: 6, padding: '10px 24px', fontWeight: 800, cursor: 'pointer' },

  page: { minHeight: '100vh', background: '#f8f9fa', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' },
  
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 56px', height: 68, borderBottom: '1px solid #e5e7eb', background: '#fff', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontWeight: 900, fontSize: '1rem', letterSpacing: '1px', background: 'none', border: 'none', cursor: 'pointer', color: '#111' },
  navLinks: { display: 'flex', gap: 36 },
  navLink: { fontSize: '0.78rem', fontWeight: 600, color: '#6c757d', cursor: 'pointer', letterSpacing: '0.3px', paddingBottom: 4, borderBottom: '2px solid transparent' },
  navLinkActive: { color: '#0a58ca', borderBottom: '2px solid #0a58ca' },
  reserveBtn: { background: '#0a58ca', color: '#fff', border: 'none', borderRadius: 4, padding: '9px 22px', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' },

  content: { flex: 1, padding: '60px 20px', maxWidth: 900, margin: '0 auto', width: '100%' },

  headerWrap: { textAlign: 'center', marginBottom: 40 },
  successIconWrap: { display: 'inline-flex', padding: 12, background: '#e0e7ff', borderRadius: '50%', marginBottom: 24 },
  successIcon: { width: 48, height: 48, borderRadius: '50%', background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900 },
  pageTitle: { fontSize: '2rem', fontWeight: 900, color: '#111', letterSpacing: '-0.5px', marginBottom: 16 },
  pageSub: { fontSize: '0.95rem', color: '#495057', lineHeight: 1.6 },

  receiptCard: { display: 'flex', flexWrap: 'wrap', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', marginBottom: 40 },
  receiptLeft: { flex: '1 1 350px', background: '#f8fafc', borderRight: '1px solid #e5e7eb' },
  imgWrap: { padding: '24px 24px 0' },
  carImg: { width: '100%', height: 'auto', display: 'block', borderRadius: 4, border: '1px solid #f1f5f9' },
  carInfoWrap: { padding: '24px' },
  carLabel: { fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', letterSpacing: '1px', marginBottom: 4 },
  carName: { fontSize: '1.2rem', fontWeight: 900, color: '#111', margin: '0 0 20px' },
  carMetaGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  metaLabel: { fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', letterSpacing: '1px', marginBottom: 4 },
  metaValue: { fontSize: '0.75rem', fontWeight: 600, color: '#374151', fontFamily: 'monospace' },

  receiptRight: { flex: '1 1 400px', padding: '40px' },
  totalLabel: { fontSize: '0.65rem', fontWeight: 800, color: '#6c757d', letterSpacing: '1.5px', marginBottom: 8 },
  totalAmount: { fontSize: '2rem', fontWeight: 900, color: '#0a58ca', margin: 0, letterSpacing: '-0.5px' },
  detailRows: { borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: '0.8rem', color: '#6c757d', fontWeight: 500 },
  rowValue: { fontSize: '0.85rem', fontWeight: 800, color: '#111' },
  statusBadge: { background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.5px' },
  disclaimerWrap: { display: 'flex', alignItems: 'flex-start', gap: 8 },
  checkMark: { color: '#6b7280', fontSize: '0.8rem', marginTop: 2 },
  disclaimerText: { fontStyle: 'italic', fontSize: '0.75rem', color: '#6b7280' },

  actionsWrap: { display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 48, flexWrap: 'wrap' },
  actionBtnPrimary: { background: '#0a58ca', color: '#fff', border: 'none', borderRadius: 4, padding: '14px 28px', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.5px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  actionBtnSecondary: { background: '#fff', color: '#0a58ca', border: '1px solid #0a58ca', borderRadius: 4, padding: '14px 28px', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '0.5px', cursor: 'pointer', display: 'flex', alignItems: 'center' },

  footerNoteLine: { height: 1, background: '#e5e7eb', marginBottom: 24 },
  footerNoteText: { textAlign: 'center', fontSize: '0.7rem', color: '#6c757d', lineHeight: 1.8, letterSpacing: '1px' },

  footer: { borderTop: '1px solid #e5e7eb', background: '#f8fafc', padding: '32px 56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 },
  footerLogoWrap: { flex: '1 1 100%' },
  footerLogo: { fontWeight: 900, fontSize: '1rem', letterSpacing: '1px', color: '#111' },
  footerLinks: { display: 'flex', gap: 24, flexWrap: 'wrap' },
  footerLink: { fontSize: '0.7rem', color: '#6c757d', fontWeight: 700, letterSpacing: '0.5px', textDecoration: 'none', borderBottom: '1px solid #cbd5e1' },
  footerCopy: { fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600 },
};
