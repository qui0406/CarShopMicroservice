import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios, { endpoints, authApis } from '../configs/APIs';
import { MyUserContext } from '../configs/MyContexts';

// Removed hardcoded DEPOSIT_AMOUNT to use value from backend
const fmt = (n) => (n == null ? '0 đ' : Number(n).toLocaleString('vi-VN') + ' đ');

export default function Reserve() {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useContext(MyUserContext);

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('vnpay-qr');

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    idNumber: '',
    dob: '',
    address: '',
    note: '',
  });

  useEffect(() => {
    if (user !== undefined && user === null) {
      // Not logged in → redirect to login then come back
      navigate(`/login?next=/reserve/${id}`);
    }
    if (user) {
      setForm(prev => ({
        ...prev,
        fullName: [user.firstName, user.lastName].filter(Boolean).join(' '),
      }));
    }
  }, [user, id, navigate]);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const res = await axios.get(endpoints['get-car-by-id'](id));
        setCar(res.data?.result || res.data);

      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchCar();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.fullName.trim()) return setFormError('Vui lòng nhập họ và tên.');
    if (!form.phone.trim()) return setFormError('Vui lòng nhập số điện thoại.');
    if (!form.address.trim()) return setFormError('Vui lòng nhập địa chỉ thường trú.');
    if (!agreed) return setFormError('Bạn cần đồng ý với điều khoản dịch vụ.');

    setSubmitting(true);
    try {
      const orderRes = await authApis().post(endpoints['create-order'], {
        note: form.note || '',
        orderItem: {
          carId: id,
          fullName: form.fullName,
          phoneNumber: form.phone,
          address: form.address,
          cccd: form.idNumber,
          dob: form.dob
        }
      });
      const order = orderRes.data?.result || orderRes.data;

      // Navigate to confirmation page, passing form + order data
      navigate('/deposit-confirm', {
        state: {
          order,
          form,
          car,
          paymentMethod,
          depositAmount: order.depositAmount, // Dùng số tiền cọc từ backend
        }
      });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const carImg = car?.imageUrls?.[0] || car?.carModel?.thumbnailImage || 'https://images.unsplash.com/photo-1617469767524-4f5eb3b2b2f1?w=900';



  if (loading) return (
    <div style={s.centerPage}>
      <div style={s.spinner}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!car) return (
    <div style={s.centerPage}>
      <p style={{ color: '#6c757d', fontWeight: 600 }}>Không tìm thấy thông tin xe.</p>
      <button onClick={() => navigate(-1)} style={s.blueBtn}>← Quay lại</button>
    </div>
  );

  if (car.deposited || car.sold) return (
    <div style={s.centerPage}>
      <p style={{ color: '#6c757d', fontWeight: 600 }}>Rất tiếc, chiếc xe này đã được đặt cọc hoặc đã bán.</p>
      <button onClick={() => navigate(-1)} style={s.blueBtn}>← Quay lại</button>
    </div>
  );

  return (
    <div style={s.page}>
      {/* NAV */}
      <nav style={s.nav}>
        <button onClick={() => navigate('/')} style={s.logo}>PRECISION</button>
        <div style={s.navLinks}>
          {['DÒNG XE', 'MUA XE', 'DỊCH VỤ', 'TRẢI NGHIỆM', 'CỬA HÀNG'].map(item => (
            <span key={item} style={{ ...s.navLink, ...(item === 'MUA XE' ? s.navLinkActive : {}) }}>{item}</span>
          ))}
        </div>
        <button style={s.reserveBtn}>Đặt xe ngay</button>
      </nav>

      {/* STEPPER */}
      <div style={s.stepperWrap}>
        <div style={s.stepperInner}>
          {/* Step 1: Quote (done) */}
          <div style={s.step}>
            <div style={{ ...s.stepCircle, ...s.stepDone }}>✓</div>
            <span style={s.stepLabel}>BÁO GIÁ</span>
          </div>
          <div style={{ ...s.stepLine, background: '#0a58ca' }}></div>
          {/* Step 2: Info (active) */}
          <div style={s.step}>
            <div style={{ ...s.stepCircle, ...s.stepActive }}>2</div>
            <span style={{ ...s.stepLabel, color: '#0a58ca', fontWeight: 800 }}>THÔNG TIN</span>
          </div>
          <div style={{ ...s.stepLine, background: '#e5e7eb' }}></div>
          {/* Step 3: Payment */}
          <div style={s.step}>
            <div style={{ ...s.stepCircle, ...s.stepInactive }}>3</div>
            <span style={{ ...s.stepLabel, color: '#9ca3af' }}>THANH TOÁN</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={s.content}>
        {/* LEFT: Form */}
        <div style={s.leftCol}>
          <div style={{ borderLeft: '4px solid #0a58ca', paddingLeft: 20, marginBottom: 32 }}>
            <h2 style={s.formTitle}>Thông tin Đăng ký</h2>
            <p style={s.formSub}>Vui lòng cung cấp thông tin pháp lý của bạn cho thỏa thuận đặt cọc xe.</p>
          </div>

          <form onSubmit={handleSubmit} id="reserve-form">
            <div style={s.fieldGrid}>
              <div style={s.fieldWrap}>
                <label style={s.label}>HỌ VÀ TÊN</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>👤</span>
                  <input style={s.input} placeholder="Nhập họ và tên" value={form.fullName}
                    onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} required />
                </div>
              </div>
              <div style={s.fieldWrap}>
                <label style={s.label}>SỐ ĐIỆN THOẠI</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>📞</span>
                  <input style={s.input} placeholder="+84 XXX XXX XXX" type="tel" value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required />
                </div>
              </div>
              <div style={s.fieldWrap}>
                <label style={s.label}>SỐ CMND / CCCD</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>🪪</span>
                  <input style={s.input} placeholder="Nhập số định danh" value={form.idNumber}
                    onChange={e => setForm(p => ({ ...p, idNumber: e.target.value }))} />
                </div>
              </div>
              <div style={s.fieldWrap}>
                <label style={s.label}>NGÀY SINH</label>
                <div style={s.inputWrap}>
                  <span style={s.inputIcon}>📅</span>
                  <input style={{ ...s.input, color: form.dob ? '#111' : '#9ca3af' }} type="date" value={form.dob}
                    onChange={e => setForm(p => ({ ...p, dob: e.target.value }))} />
                </div>
              </div>
            </div>

            <div style={{ ...s.fieldWrap, marginTop: 20 }}>
              <label style={s.label}>ĐỊA CHỈ THƯỜNG TRÚ</label>
              <div style={{ ...s.inputWrap, alignItems: 'flex-start', paddingTop: 12 }}>
                <span style={{ ...s.inputIcon, marginTop: 2 }}>📍</span>
                <textarea style={{ ...s.input, height: 80, resize: 'vertical' }} rows={3}
                  placeholder="Tên đường, Quận/Huyện, Tỉnh/Thành phố" value={form.address}
                  onChange={e => setForm(p => ({ ...p, address: e.target.value }))} required />
              </div>
            </div>

            <div style={{ ...s.fieldWrap, marginTop: 20 }}>
              <label style={s.label}>GHI CHÚ (tuỳ chọn)</label>
              <div style={{ ...s.inputWrap, alignItems: 'flex-start', paddingTop: 12 }}>
                <span style={{ ...s.inputIcon, marginTop: 2 }}>📝</span>
                <textarea style={{ ...s.input, height: 72, resize: 'vertical' }} rows={2}
                  placeholder="VD: Khách hàng muốn nhận xe vào cuối tuần, màu sắc ưa thích..."
                  value={form.note}
                  onChange={e => setForm(p => ({ ...p, note: e.target.value }))} />
              </div>
            </div>

            {/* Terms */}
            <label style={s.termsRow}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={s.checkbox} />
              <span style={s.termsText}>
                Tôi đồng ý với <a href="#" style={s.termsLink}>Điều khoản dịch vụ</a> và{' '}
                <a href="#" style={s.termsLink}>Chính sách đặt cọc</a>. Tôi xác nhận rằng tất cả thông tin cung cấp ở trên là chính xác và có giá trị ràng buộc về mặt pháp lý theo hợp đồng mua bán xe.
              </span>
            </label>

            {formError && <div style={s.errorBox}>⚠️ {formError}</div>}
          </form>
        </div>

        {/* RIGHT: Summary + Payment */}
        <div style={s.rightCol}>

          {/* Transaction Summary */}
          <div style={s.summaryCard}>
            <p style={s.sectionLabel}>TÓM TẮT GIAO DỊCH</p>

            <div style={s.summaryGrid}>
              <div>
                <p style={s.summaryMeta}>LOẠI ĐƠN HÀNG</p>
                <p style={s.summaryVal}>Đặt cọc mua xe</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={s.summaryMeta}>MẪU XE</p>
                <p style={{ ...s.summaryVal, color: '#0a58ca' }}>{car.name}</p>
              </div>
            </div>

            <div style={s.divider}></div>

            <p style={s.summaryMeta}>SỐ TIỀN ĐẶT CỌC (ít nhất 1% giá trị của xe)</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 900, color: '#111', margin: '4px 0 2px', fontStyle: 'italic' }}>
              {(car.price / 100).toLocaleString('vi-VN')} VNĐ
            </p>
            <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: '0 0 16px' }}>
              *Số tiền cuối cùng sẽ được tính toán dựa trên cấu hình của bạn trong bước tiếp theo.
            </p>

            <div style={s.suggestionBox}>
              <span style={{ fontWeight: 800, color: '#0a58ca' }}>Gợi ý: </span>
              Vui lòng đảm bảo hạn mức chuyển khoản hàng ngày của bạn đủ cho số tiền đặt cọc để tránh lỗi giao dịch.
            </div>
          </div>

            <button type="submit" form="reserve-form" disabled={submitting}
              style={{ ...s.payBtn, opacity: submitting ? 0.7 : 1, marginTop: '24px' }}>
              {submitting
                ? <><span style={s.spinnerSmall}></span> Đang xử lý...</>
                : 'Xác nhận và Gửi yêu cầu →'}
            </button>
          </div>
        </div>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        input[type="checkbox"]{width:16px;height:16px;cursor:pointer}
        input::placeholder,textarea::placeholder{color:#9ca3af;}
        input:focus,textarea:focus{outline:none;border-color:#0a58ca !important;box-shadow:0 0 0 3px rgba(10,88,202,0.07);}
      `}</style>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#f8f9fa', fontFamily: "'Inter','Segoe UI',sans-serif", display: 'flex', flexDirection: 'column' },
  centerPage: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#fff' },
  spinner: { width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#0a58ca', borderRadius: '50%', animation: 'spin .8s linear infinite' },
  spinnerSmall: { width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .8s linear infinite' },
  blueBtn: { background: '#0a58ca', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 800, cursor: 'pointer', fontSize: '0.85rem' },

  // Nav
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 56px', height: 68, borderBottom: '1px solid #e5e7eb', background: '#fff', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontWeight: 900, fontSize: '1rem', letterSpacing: '3px', background: 'none', border: 'none', cursor: 'pointer', color: '#111' },
  navLinks: { display: 'flex', gap: 36 },
  navLink: { fontSize: '0.78rem', fontWeight: 600, color: '#6c757d', cursor: 'pointer', letterSpacing: '0.3px', paddingBottom: 2, borderBottom: '2px solid transparent' },
  navLinkActive: { color: '#0a58ca', borderBottom: '2px solid #0a58ca' },
  reserveBtn: { background: '#0a58ca', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 22px', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' },

  // Stepper
  stepperWrap: { background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '28px 56px' },
  stepperInner: { display: 'flex', alignItems: 'center', maxWidth: 480 },
  step: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  stepCircle: { width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.9rem' },
  stepDone: { background: '#fff', border: '2px solid #0a58ca', color: '#0a58ca' },
  stepActive: { background: '#0a58ca', color: '#fff', border: '2px solid #0a58ca' },
  stepInactive: { background: '#fff', border: '2px solid #e5e7eb', color: '#9ca3af' },
  stepLabel: { fontSize: '0.65rem', fontWeight: 700, color: '#6c757d', letterSpacing: '1.5px', textTransform: 'uppercase' },
  stepLine: { flex: 1, height: 2, margin: '0 12px', marginBottom: 24 },

  // Content
  content: { display: 'grid', gridTemplateColumns: '1fr 420px', gap: 32, padding: '48px 56px', flex: 1, alignItems: 'start' },
  leftCol: { display: 'flex', flexDirection: 'column' },
  rightCol: { display: 'flex', flexDirection: 'column', gap: 20 },

  formTitle: { fontSize: '1.7rem', fontWeight: 900, color: '#111', margin: '0 0 6px', letterSpacing: '-0.5px' },
  formSub: { fontSize: '0.85rem', color: '#6c757d', margin: 0, fontWeight: 500 },

  // Form fields
  fieldGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px', marginBottom: 8 },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: '0.65rem', fontWeight: 900, color: '#6c757d', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0 },
  inputWrap: { display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #e5e7eb', borderRadius: 8, padding: '0 12px', background: '#fff', transition: 'border .2s' },
  inputIcon: { fontSize: '0.9rem', flexShrink: 0, lineHeight: 1, opacity: 0.5 },
  input: { border: 'none', outline: 'none', width: '100%', padding: '12px 0', fontSize: '0.88rem', fontWeight: 600, color: '#111', background: 'transparent' },
  textarea: { border: 'none', outline: 'none', width: '100%', padding: '12px 0', fontSize: '0.88rem', fontWeight: 600, color: '#111', background: 'transparent', resize: 'vertical' },

  // Terms
  termsRow: { display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer', marginTop: 28 },
  checkbox: { marginTop: 2, flexShrink: 0 },
  termsText: { fontSize: '0.82rem', color: '#374151', lineHeight: 1.6, fontWeight: 500 },
  termsLink: { color: '#0a58ca', fontWeight: 700, textDecoration: 'none' },

  errorBox: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', color: '#dc2626', fontWeight: 700, fontSize: '0.82rem', marginTop: 16 },

  // Right summary
  summaryCard: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '28px 24px' },
  sectionLabel: { fontSize: '0.6rem', fontWeight: 900, color: '#9ca3af', letterSpacing: '2.5px', margin: '0 0 20px', textTransform: 'uppercase' },
  summaryGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  summaryMeta: { fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' },
  summaryVal: { fontWeight: 900, color: '#111', margin: 0, fontSize: '0.95rem' },
  divider: { height: 1, background: '#f1f5f9', margin: '20px 0' },
  suggestionBox: { background: '#f0f7ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '12px 14px', fontSize: '0.78rem', color: '#374151', lineHeight: 1.6 },

  // Payment method
  methodList: { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 },
  methodRow: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 10, cursor: 'pointer', transition: 'background .15s', border: '1.5px solid transparent', userSelect: 'none' },
  methodRowActive: { border: '1.5px solid #0a58ca', background: '#eff6ff' },

  payBtn: { width: '100%', background: '#0a58ca', color: '#fff', border: 'none', borderRadius: 10, padding: '16px', fontWeight: 900, fontSize: '0.85rem', letterSpacing: '0.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 18, transition: 'background .2s' },
  pciRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  pciIcon: { fontSize: '0.9rem', opacity: 0.5 },
  pciText: { fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', letterSpacing: '1.5px' },

  // Footer
  footer: { borderTop: '1px solid #e5e7eb', background: '#fff', padding: '24px 56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginTop: 'auto' },
  footerLeft: { display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' },
  footerLogo: { fontWeight: 900, fontSize: '0.85rem', letterSpacing: '3px', color: '#111' },
  footerLink: { fontSize: '0.72rem', color: '#6c757d', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.5px' },
};
