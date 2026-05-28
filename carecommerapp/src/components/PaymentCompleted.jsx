import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios, { endpoints, authApis } from '../configs/APIs';

const fmt = (n) => (n == null ? '0 đ' : Number(n).toLocaleString('vi-VN') + ' đ');

const formatVnpDate = (s) => {
  if (!s || s.length < 12) return '';
  return `${s.slice(8,10)}:${s.slice(10,12)} - ${s.slice(6,8)}/${s.slice(4,6)}/${s.slice(0,4)}`;
};

export default function PaymentCompleted() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus]     = useState('loading');
  const [orderInfo, setOrderInfo] = useState(null);
  const [carInfo,   setCarInfo]   = useState(null);

  const urlStatus   = searchParams.get('status');
  const orderId     = searchParams.get('orderId');
  const vnp_TxnRef  = searchParams.get('vnp_TxnRef');
  const vnp_Amount  = searchParams.get('vnp_Amount');
  const vnp_BankCode= searchParams.get('vnp_BankCode');
  const vnp_PayDate = searchParams.get('vnp_PayDate');

  useEffect(() => {
    const load = async () => {
      if (urlStatus !== 'success') { setStatus('failed'); return; }
      setStatus('success');
      if (!orderId) return;
      try {
        const oRes = await authApis().get(endpoints['get-order-by-id'](orderId));
        const order = oRes.data?.result || oRes.data;
        setOrderInfo(order);
        const carId = order?.orderItem?.carId;
        if (carId) {
          const cRes = await axios.get(endpoints['get-car-by-id'](carId));
          setCarInfo(cRes.data?.result || cRes.data);
        }
      } catch (e) { console.error('Fetch order/car failed', e); }
    };
    load();
  }, [urlStatus, orderId]);

  const handleExportInvoice = async () => {
    if (!orderId) return;
    try {
      const response = await authApis().get(endpoints['download-order-pdf'](orderId), {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Xuất hóa đơn thất bại!");
    }
  };

  /* ─── LOADING ─── */
  if (status === 'loading') return (
    <div style={s.center}>
      <div style={s.spinner} />
      <p style={{ color: '#6c757d', fontWeight: 600, marginTop: 16 }}>Đang kiểm tra giao dịch...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  /* ─── FAILED ─── */
  if (status === 'failed') return (
    <div style={s.center}>
      <div style={s.failIcon}>✕</div>
      <h2 style={s.failTitle}>Thanh toán không thành công</h2>
      <p style={s.failSub}>Giao dịch bị từ chối hoặc đã bị huỷ. Vui lòng thử lại.</p>
      {vnp_TxnRef && (
        <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: 24 }}>
          Mã giao dịch: <strong style={{ color: '#374151' }}>{vnp_TxnRef}</strong>
        </p>
      )}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={s.outlineBtn}>← Thử lại</button>
        <button onClick={() => navigate('/')} style={s.primaryBtn}>Về trang chủ</button>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  /* ─── SUCCESS ─── */
  const amountDisplay = vnp_Amount ? fmt(parseInt(vnp_Amount) / 100) : (orderInfo?.totalAmount ? fmt(orderInfo.totalAmount) : '—');
  const carImg = carInfo?.imageUrls?.[0] || carInfo?.carModel?.thumbnailImage
    || 'https://images.unsplash.com/photo-1503376713431-155e81fcae13?q=80&w=900&auto=format';
  const carName = carInfo?.name || orderInfo?.orderItem?.carId || 'Xe đặt cọc';
  const buyer   = orderInfo?.orderItem?.fullName || '';

  return (
    <div style={s.page}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}`}</style>

      {/* HERO BAND */}
      <div style={s.heroBand}>
        <div style={s.successCircle}>✓</div>
        <div>
          <h1 style={s.heroTitle}>THANH TOÁN ĐẶT CỌC THÀNH CÔNG</h1>
          <p style={s.heroSub}>
            Mã giao dịch: <span style={{ fontWeight: 800 }}>{vnp_TxnRef || '—'}</span>
            {buyer && <span>  •  Khách hàng: <span style={{ fontWeight: 800 }}>{buyer}</span></span>}
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div style={s.content}>

        {/* Left: receipt */}
        <div style={s.receiptCard}>
          {/* Car image */}
          <img src={carImg} alt={carName} style={s.carImg} />
          <div style={s.carInfoBox}>
            <p style={s.metaLabel}>MẪU XE</p>
            <h3 style={s.carName}>{carName}</h3>
            {carInfo?.color && <p style={s.carSub}>Màu: {carInfo.color}</p>}
            {carInfo?.vinNumber && <p style={s.carSub}>VIN: {carInfo.vinNumber}</p>}
          </div>

          {/* Order item detail */}
          {orderInfo?.orderItem && (
            <div style={s.section}>
              <p style={s.sectionLabel}>THÔNG TIN NGƯỜI NHẬN XE</p>
              <div style={s.itemGrid}>
                {orderInfo.orderItem.fullName   && <Row label="Họ tên"  value={orderInfo.orderItem.fullName} />}
                {orderInfo.orderItem.phoneNumber&& <Row label="SĐT"     value={orderInfo.orderItem.phoneNumber} />}
                {orderInfo.orderItem.cccd       && <Row label="CCCD"    value={orderInfo.orderItem.cccd} />}
                {orderInfo.orderItem.dob        && <Row label="Ngày sinh" value={orderInfo.orderItem.dob} />}
                {orderInfo.orderItem.address    && <Row label="Địa chỉ" value={orderInfo.orderItem.address} span />}
              </div>
            </div>
          )}
        </div>

        {/* Right: payment summary */}
        <div style={s.summaryCol}>

          <div style={s.amtCard}>
            <p style={s.amtLabel}>SỐ TIỀN ĐÃ THANH TOÁN</p>
            <p style={s.amtValue}>{amountDisplay}</p>
            <span style={s.paidBadge}>ĐÃ THANH TOÁN</span>
          </div>

          <div style={s.detailCard}>
            <p style={s.sectionLabel}>CHI TIẾT GIAO DỊCH</p>
            {orderId     && <Row label="Mã đơn hàng" value={`#${orderId.slice(0,12).toUpperCase()}`} />}
            {vnp_TxnRef  && <Row label="Mã GD VNPay" value={vnp_TxnRef} />}
            {vnp_BankCode&& <Row label="Ngân hàng"   value={vnp_BankCode} />}
            {vnp_PayDate && <Row label="Thời gian"    value={formatVnpDate(vnp_PayDate)} />}
            {orderInfo?.type && <Row label="Loại đơn" value={orderInfo.type === 'DEPOSIT' ? 'Đặt cọc' : 'Mua ngay'} />}

            {/* Breakdown */}
            {orderInfo && (
              <>
                <div style={s.divider} />
                {orderInfo.baseAmount    && <Row label="Giá xe"        value={fmt(orderInfo.baseAmount)} />}
                {orderInfo.taxAmount     && <Row label="Thuế trước bạ" value={fmt(orderInfo.taxAmount)} />}
                {orderInfo.plateFeeAmount&& <Row label="Phí biển số"   value={fmt(orderInfo.plateFeeAmount)} />}
                {orderInfo.insuranceAmount&&<Row label="Bảo hiểm"      value={fmt(orderInfo.insuranceAmount)} />}
                <div style={s.divider} />
                {orderInfo.totalAmount   && <Row label="Tổng lăn bánh" value={fmt(orderInfo.totalAmount)} bold />}
              </>
            )}
          </div>

          <div style={s.noteBox}>
            <span style={{ fontWeight: 800, color: '#0a58ca' }}>📧 </span>
            Biên lai xác nhận đã được gửi vào email của bạn. Nhân viên sẽ liên hệ trong vòng 24 giờ.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={handleExportInvoice} style={{ ...s.primaryBtn, background: '#198754' }}>
              📄 Tải hóa đơn PDF
            </button>
            <button onClick={() => navigate('/all-my-deposit')} style={s.primaryBtn}>
              🕒 Xem lịch sử đơn hàng
            </button>
            <button onClick={() => navigate('/')} style={s.outlineBtn}>
              ← Về trang chủ
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={s.footer}>
        <span style={s.footerLogo}>PRECISION</span>
        <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>© 2026 Precision Motors. Chi tiết đến từ sự hoàn hảo.</span>
      </footer>
    </div>
  );
}

function Row({ label, value, bold, span }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      gap: 12, gridColumn: span ? '1/-1' : undefined, padding: '6px 0',
      borderBottom: '1px solid #f1f5f9' }}>
      <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '0.82rem', color: bold ? '#0a58ca' : '#111', fontWeight: bold ? 900 : 700,
        textAlign: 'right' }}>{value}</span>
    </div>
  );
}

const s = {
  /* shared */
  center: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 12, background: '#f8f9fa', fontFamily: "'Inter','Segoe UI',sans-serif", padding: 24 },
  spinner: { width: 40, height: 40, border: '4px solid #e5e7eb', borderTopColor: '#0a58ca',
    borderRadius: '50%', animation: 'spin 1s linear infinite' },

  /* failed */
  failIcon: { width: 72, height: 72, borderRadius: '50%', background: '#fee2e2', color: '#ef4444',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900 },
  failTitle: { fontSize: '1.6rem', fontWeight: 900, color: '#111', margin: '8px 0 6px', textAlign: 'center' },
  failSub:   { fontSize: '0.9rem', color: '#6c757d', textAlign: 'center', margin: '0 0 8px' },

  /* success page */
  page: { minHeight: '100vh', background: '#f8f9fa', fontFamily: "'Inter','Segoe UI',sans-serif",
    display: 'flex', flexDirection: 'column' },

  heroBand: { background: 'linear-gradient(135deg,#0a58ca 0%,#1d4ed8 100%)', color: '#fff',
    padding: '40px 56px', display: 'flex', alignItems: 'center', gap: 28, animation: 'fadeUp .5s ease' },
  successCircle: { width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900,
    flexShrink: 0, border: '3px solid rgba(255,255,255,.4)' },
  heroTitle: { fontSize: '1.4rem', fontWeight: 900, margin: '0 0 6px', letterSpacing: '0.5px' },
  heroSub:   { fontSize: '0.85rem', color: 'rgba(255,255,255,.8)', margin: 0 },

  content: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28,
    padding: '40px 56px 60px', flex: 1, alignItems: 'start' },

  /* receipt */
  receiptCard: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' },
  carImg: { width: '100%', height: 220, objectFit: 'cover', display: 'block' },
  carInfoBox: { padding: '20px 24px 16px' },
  metaLabel: { fontSize: '0.6rem', fontWeight: 900, color: '#9ca3af', letterSpacing: '2px', margin: '0 0 4px' },
  carName:   { fontSize: '1.2rem', fontWeight: 900, color: '#111', margin: '0 0 4px' },
  carSub:    { fontSize: '0.8rem', color: '#6c757d', margin: '2px 0', fontWeight: 500 },
  section:    { borderTop: '1px solid #f1f5f9', padding: '16px 24px 20px' },
  sectionLabel:{ fontSize: '0.6rem', fontWeight: 900, color: '#9ca3af', letterSpacing: '2px', margin: '0 0 12px' },
  itemGrid:  { display: 'flex', flexDirection: 'column' },

  /* summary col */
  summaryCol: { display: 'flex', flexDirection: 'column', gap: 16 },
  amtCard: { background: '#0a58ca', borderRadius: 14, padding: '28px 24px', color: '#fff' },
  amtLabel: { fontSize: '0.6rem', fontWeight: 900, color: 'rgba(255,255,255,.7)', letterSpacing: '2px', margin: '0 0 8px' },
  amtValue: { fontSize: '2.2rem', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-1px' },
  paidBadge:{ background: 'rgba(255,255,255,.2)', borderRadius: 6, padding: '4px 12px',
    fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1.5px', display: 'inline-block' },

  detailCard: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '20px 20px 16px' },
  divider: { height: 1, background: '#f1f5f9', margin: '8px 0' },

  noteBox: { background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10,
    padding: '14px 16px', fontSize: '0.8rem', color: '#374151', lineHeight: 1.6 },

  /* buttons */
  primaryBtn: { background: '#0a58ca', color: '#fff', border: 'none', borderRadius: 10,
    padding: '14px 20px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center' },
  outlineBtn: { background: '#fff', color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: 10,
    padding: '13px 20px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center' },

  /* footer */
  footer: { borderTop: '1px solid #e5e7eb', background: '#fff', padding: '20px 56px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' },
  footerLogo: { fontWeight: 900, fontSize: '0.9rem', letterSpacing: '3px', color: '#111' },
};
