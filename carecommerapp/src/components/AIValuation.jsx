import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, ProgressBar, Badge, Alert } from "react-bootstrap";
import APIs, { endpoints } from "../configs/APIs";
import {
  BiCheckShield,
  BiCloudUpload,
  BiInfoCircle,
  BiTrendingDown,
  BiCheckCircle,
  BiErrorCircle,
  BiFile,
  BiRefresh,
  BiChevronRight
} from "react-icons/bi";
import { FaCarSide, FaCogs, FaClock, FaCalendarAlt, FaGasPump, FaUserFriends, FaTachometerAlt } from "react-icons/fa";

export default function AIValuation({ isSection = false }) {
  const [valuing, setValuing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [valuationResult, setValuationResult] = useState(null);
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    brand_name: "",
    model_name: "",
    trim_name: "",
    year: new Date().getFullYear(),
    odo: 0,
    fuel: "Xăng",
    origin: "Việt Nam",
    owner_count: 1,
    service_history: "true",
    description: "",
    body_type: "SUV",
    color: "Trắng",
    gearbox: "Tự động",
    seats: 5,
    engine_capacity: 2.0,
    drivetrain: "FWD",
    airbags: 6
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const branchRes = await APIs.get(endpoints["get-all-branch"]);
        const bData = branchRes.data?.result?.data || branchRes.data?.result || [];
        setBranches(Array.isArray(bData) ? bData : []);
        
        const catRes = await APIs.get(endpoints["get-all-category"]);
        const cData = catRes.data?.result?.data || catRes.data?.result || [];
        setCategories(Array.isArray(cData) ? cData : []);
      } catch (err) {
        console.error("Error fetching metadata:", err);
      }
    };
    fetchMetadata();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleValuation = async () => {
    if (files.length === 0) {
      setError("Vui lòng tải lên ít nhất một ảnh xe để AI có thể phân tích ngoại thất.");
      return;
    }

    // Client-side Mazda validation
    const MAZDA_ALIASES = ["mazda", "madaz", "madza", "mazada"];
    const modelLower = (formData.model_name || "").toLowerCase();
    const brandLower = (formData.brand_name || "").toLowerCase();
    
    const isMazda = MAZDA_ALIASES.some(alias => modelLower.includes(alias) || brandLower.includes(alias));
    
    if (!isMazda && (formData.model_name || formData.brand_name)) {
      setError(`⚠️ Mô hình định giá của chúng tôi chỉ hỗ trợ dòng xe Mazda. Xe "${formData.brand_name} ${formData.model_name}" không nằm trong phạm vi hỗ trợ.`);
      setValuing(false);
      return;
    }

    setValuing(true);
    setError(null);

    const data = new FormData();
    // Append fields
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    // Append files
    files.forEach(file => {
      data.append("files", file);
    });

    try {
      const response = await APIs.post(endpoints["predict-car-price"], data, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });

      if (response.data.success) {
        setValuationResult(response.data.data);
        setShowResult(true);
        if (window.innerWidth < 992) {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
      } else {
        setError(response.data.error || "Có lỗi xảy ra khi định giá.");
      }
    } catch (err) {
      setError("Không thể kết nối đến máy chủ AI. Vui lòng kiểm tra lại kết nối mạng.");
      console.error(err);
    } finally {
      setValuing(false);
    }
  };

  const onFileChange = (e) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const containerStyle = {
    backgroundColor: "#fff",
    borderRadius: "20px",
    padding: "32px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    marginBottom: "24px",
    border: "1px solid #f1f5f9"
  };

  const headerStepStyle = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px"
  };

  const numberBadgeStyle = {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#2563eb",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700
  };

  const titleStyle = {
    fontSize: "1.25rem",
    fontWeight: 700,
    margin: 0,
    color: "#1e293b"
  };

  const labelStyle = {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: "8px",
    display: "block"
  };

  const inputStyle = {
    borderRadius: "10px",
    padding: "12px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0"
  };

  return (
    <div style={{
      backgroundColor: isSection ? "transparent" : "#f8faff",
      minHeight: isSection ? "auto" : "100vh",
      paddingTop: isSection ? "0" : "120px",
      paddingBottom: isSection ? "0" : "100px",
      fontFamily: "'Inter', 'Roboto', sans-serif"
    }}>
      <Container>
        <Row className="justify-content-between">
          {/* LEFT COLUMN: INPUT FORM */}
          <Col lg={7}>
            <div style={{ marginBottom: "40px" }}>
              <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#111", marginBottom: "12px", letterSpacing: "-1px" }}>
                Định giá xe AI chính xác
              </h1>
              <p style={{ fontSize: "1.1rem", color: "#64748b", maxWidth: "600px", lineHeight: 1.6 }}>
                Cung cấp thông tin xe để nhận kết quả thẩm định giá dựa trên thị trường thực tế và tình trạng hao mòn.
              </p>
            </div>

            {/* ERROR ALERT */}
            {error && (
              <Alert variant="danger" style={{ borderRadius: "12px", marginBottom: "24px", border: "none", boxShadow: "0 4px 12px rgba(220, 38, 38, 0.1)" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <BiErrorCircle size={24} />
                  <div>
                    <strong>Lỗi:</strong> {error}
                  </div>
                </div>
              </Alert>
            )}

            {/* STEP 1: THÔNG TIN ĐỊNH DANH */}
            <div style={containerStyle}>
              <div style={headerStepStyle}>
                <div style={numberBadgeStyle}>1</div>
                <h3 style={titleStyle}>Định danh xe</h3>
              </div>

              <Row className="g-4">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>THƯƠNG HIỆU (BRAND_NAME)</Form.Label>
                    <Form.Select
                      style={inputStyle}
                      name="brand_name"
                      value={formData.brand_name}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Chọn thương hiệu</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>DÒNG XE (MODEL_NAME)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ví dụ: Mazda 3"
                      style={inputStyle}
                      name="model_name"
                      value={formData.model_name}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>PHIÊN BẢN (TRIM_NAME)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ví dụ: 1.5L Luxury"
                      style={inputStyle}
                      name="trim_name"
                      value={formData.trim_name}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>NĂM SẢN XUẤT (YEAR)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Ví dụ: 2025"
                      style={inputStyle}
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>XUẤT XỨ (ORIGIN)</Form.Label>
                    <Form.Select
                      style={inputStyle}
                      name="origin"
                      value={formData.origin}
                      onChange={handleInputChange}
                    >
                      <option value="Việt Nam">Việt Nam</option>
                      <option value="Nhập khẩu">Nhập khẩu</option>
                      <option value="Nhật Bản">Nhật Bản</option>
                      <option value="Hàn Quốc">Hàn Quốc</option>
                      <option value="Mỹ">Mỹ</option>
                      <option value="Đức">Đức</option>
                      <option value="Thái Lan">Thái Lan</option>
                      <option value="Indonesia">Indonesia</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>NHIÊN LIỆU (FUEL)</Form.Label>
                    <Form.Select
                      style={inputStyle}
                      name="fuel"
                      value={formData.fuel}
                      onChange={handleInputChange}
                    >
                      <option value="Xăng">Xăng</option>
                      <option value="Dầu">Dầu</option>
                      <option value="Điện">Điện</option>
                      <option value="Hybrid">Hybrid</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* STEP 2: TÌNH TRẠNG VẬN HÀNH */}
            <div style={containerStyle}>
              <div style={headerStepStyle}>
                <div style={numberBadgeStyle}>2</div>
                <h3 style={titleStyle}>Tình trạng & Lịch sử</h3>
              </div>

              <Row className="g-4">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>SỐ ODO (ODO)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Ví dụ: 11999"
                      style={inputStyle}
                      name="odo"
                      value={formData.odo}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>SỐ ĐỜI CHỦ (OWNER_COUNT)</Form.Label>
                    <Form.Control
                      type="number"
                      style={inputStyle}
                      name="owner_count"
                      value={formData.owner_count}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>BẢO DƯỠNG (SERVICE_HISTORY)</Form.Label>
                    <Form.Select
                      style={inputStyle}
                      name="service_history"
                      value={formData.service_history}
                      onChange={handleInputChange}
                    >
                      <option value="true">Đầy đủ hãng</option>
                      <option value="false">Bảo dưỡng ngoài</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>MÔ TẢ CHI TIẾT (DESCRIPTION)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="CẦN BÁN MAZDA 3 LUXURY... (AI sẽ trích xuất lỗi từ đây)"
                      style={inputStyle}
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* STEP 3: THÔNG SỐ KỸ THUẬT */}
            <div style={containerStyle}>
              <div style={headerStepStyle}>
                <div style={numberBadgeStyle}>3</div>
                <h3 style={titleStyle}>Thông số kỹ thuật</h3>
              </div>

              <Row className="g-4">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>KIỂU DÁNG (BODY_TYPE)</Form.Label>
                    <Form.Select
                      style={inputStyle}
                      name="body_type"
                      value={formData.body_type}
                      onChange={handleInputChange}
                    >
                      <option value="">Chọn kiểu dáng</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>MÀU SẮC (COLOR)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ví dụ: Trắng"
                      style={inputStyle}
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>HỘP SỐ (GEARBOX)</Form.Label>
                    <Form.Select
                      style={inputStyle}
                      name="gearbox"
                      value={formData.gearbox}
                      onChange={handleInputChange}
                    >
                      <option value="Tự động">Tự động</option>
                      <option value="Số sàn">Số sàn</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>SỐ CHỖ (SEATS)</Form.Label>
                    <Form.Control
                      type="number"
                      style={inputStyle}
                      name="seats"
                      value={formData.seats}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>DUNG TÍCH (ENGINE)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      style={inputStyle}
                      name="engine_capacity"
                      value={formData.engine_capacity}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>DẪN ĐỘNG (DRIVETRAIN)</Form.Label>
                    <Form.Select
                      style={inputStyle}
                      name="drivetrain"
                      value={formData.drivetrain}
                      onChange={handleInputChange}
                    >
                      <option value="FWD">FWD (Cầu trước)</option>
                      <option value="RWD">RWD (Cầu sau)</option>
                      <option value="AWD">AWD (4 bánh toàn thời gian)</option>
                      <option value="4WD">4WD (2 cầu)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label style={labelStyle}>TÚI KHÍ (AIRBAGS)</Form.Label>
                    <Form.Control
                      type="number"
                      style={inputStyle}
                      name="airbags"
                      value={formData.airbags}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* STEP 4 */}
            <div style={{
              backgroundColor: "#fff",
              borderRadius: "20px",
              padding: "32px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              marginBottom: "40px",
              border: "1px solid #f1f5f9"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#2563eb",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700
                }}>4</div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "#1e293b" }}>Hình ảnh xe</h3>
              </div>

              <div
                style={{
                  border: "2px dashed #cbd5e1",
                  borderRadius: "16px",
                  padding: "40px",
                  textAlign: "center",
                  backgroundColor: "#f8faff",
                  cursor: "pointer",
                  marginBottom: "8px",
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = "#2563eb"}
                onMouseOut={(e) => e.currentTarget.style.borderColor = "#cbd5e1"}
                onClick={() => document.getElementById("hidden-file-input").click()}
              >
                <BiCloudUpload size={48} color="#2563eb" style={{ marginBottom: "16px" }} />
                <h5 style={{ fontWeight: 700, color: "#1e293b" }}>Kéo thả hoặc tải lên 6-7 ảnh</h5>
                <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Hỗ trợ JPG, PNG (Tối đa 10MB/ảnh)</p>
                <input type="file" id="hidden-file-input" multiple className="d-none" onChange={onFileChange} />

                {files.length > 0 && (
                  <div className="mt-3 d-flex flex-wrap gap-2 justify-content-center">
                    {files.map((f, index) => (
                      <Badge key={index} bg="primary" style={{ padding: "8px 12px", borderRadius: "6px" }}>{f.name}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleValuation}
              disabled={valuing}
              style={{
                width: "100%",
                backgroundColor: "#2563eb",
                border: "none",
                borderRadius: "14px",
                padding: "18px",
                fontSize: "1.1rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                boxShadow: "0 10px 25px rgba(37, 99, 235, 0.2)"
              }}>
              {valuing ? (
                <>
                  <BiRefresh className="spin-animation" size={24} /> Đang phân tích dữ liệu...
                </>
              ) : (
                <>
                  <BiRefresh size={24} /> Bắt đầu định giá
                </>
              )}
            </Button>

            <style>
              {`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                .spin-animation {
                  animation: spin 1s linear infinite;
                }
              `}
            </style>
          </Col>

          {/* RIGHT COLUMN: RESULTS */}
          <Col lg={4}>
            {showResult && valuationResult ? (
              <div style={{ position: "sticky", top: "120px" }}>
                <div style={{
                  backgroundColor: "#2563eb",
                  borderRadius: "24px",
                  padding: "32px",
                  color: "#fff",
                  boxShadow: "0 20px 40px rgba(37, 99, 235, 0.15)",
                  backgroundImage: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  marginBottom: "24px",
                  textAlign: "center"
                }}>
                  <p style={{ fontSize: "0.9rem", opacity: 0.8, marginBottom: "8px" }}>Giá trị ước tính hiện tại</p>
                  <h2 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: "20px" }}>
                    {(valuationResult.summary.final_price * 1000000).toLocaleString('vi-VN')} VNĐ
                  </h2>

                </div>

                <div style={{ backgroundColor: "#f0fdf4", borderRadius: "24px", padding: "24px", border: "1px solid #bbf7d0", marginBottom: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#166534" }}>
                      <BiInfoCircle size={22} />
                      <h5 style={{ margin: 0, fontWeight: 700, fontSize: "1rem" }}>Lý giải từ AI</h5>
                    </div>
                    {valuationResult.summary.model_info?.segment && (
                      <span style={{ 
                        backgroundColor: "#dcfce7", 
                        color: "#166534", 
                        padding: "4px 12px", 
                        borderRadius: "100px", 
                        fontSize: "0.75rem", 
                        fontWeight: 700,
                        border: "1px solid #bbf7d0"
                      }}>
                        Phân khúc: {valuationResult.summary.model_info.segment}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.95rem", color: "#166534", margin: "0 0 12px 0", lineHeight: 1.6 }}>
                    Dựa trên dữ liệu thị trường, mẫu xe <strong>{formData.model_name} {formData.year}</strong> có giá trị gốc khoảng <strong>{valuationResult.summary.raw_price.toLocaleString('vi-VN')} triệu VNĐ</strong>.
                    Sau khi phân tích kỹ thuật, hệ thống ghi nhận các yếu tố ảnh hưởng đến giá trị:
                    <ul style={{ paddingLeft: "20px", marginTop: "8px", marginBottom: "8px" }}>
                      <li key="odo">Mức ODO <strong>{formData.odo.toLocaleString()}km</strong>: {formData.odo > (new Date().getFullYear() - formData.year) * 15000 ? "Vượt mức trung bình." : "Hành trình lý tưởng."}</li>
                      {valuationResult.deductions.map((d, i) => (
                        <li key={i}>
                          <strong>{d.label}</strong>: {d.amount > 0 
                            ? <>Làm giảm <strong style={{color: '#c53030'}}>{d.amount.toLocaleString('vi-VN')} triệu VNĐ</strong></>
                            : <>Cộng thêm <strong style={{color: '#166534'}}>{Math.abs(d.amount).toLocaleString('vi-VN')} triệu VNĐ</strong></>
                          } vào giá trị thực tế.
                        </li>
                      ))}
                    </ul>
                    Tổng mức khấu trừ là <strong>{valuationResult.summary.total_penalty.toLocaleString('vi-VN')} triệu VNĐ</strong>. Mức giá đề xuất đảm bảo sát với tình trạng thực tế của xe.
                  </div>
                  {valuationResult.summary.ref_note && (
                    <div style={{ 
                      fontSize: "0.75rem", 
                      color: "#166534", 
                      opacity: 0.8, 
                      paddingTop: "12px", 
                      borderTop: "1px dashed #bbf7d0",
                      fontStyle: "italic" 
                    }}>
                      Nguồn tham chiếu: {valuationResult.summary.ref_note}
                    </div>
                  )}
                </div>

                <div style={{ backgroundColor: "#fff", borderRadius: "24px", padding: "32px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", border: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>PHÂN BỔ GIÁ TRỊ</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: valuationResult.summary.total_penalty > 0 ? "#e3342f" : "#166534" }}>
                      {valuationResult.summary.total_penalty > 0 ? `KHẤU TRỪ: -${valuationResult.summary.total_penalty.toFixed(1)}TR` : `TĂNG GIÁ: +${Math.abs(valuationResult.summary.total_penalty).toFixed(1)}TR`}
                    </span>
                  </div>
                  <ProgressBar
                    now={Math.min(100, (valuationResult.summary.final_price / valuationResult.summary.raw_price) * 100)}
                    variant={valuationResult.summary.final_price >= valuationResult.summary.raw_price ? "success" : "primary"}
                    style={{ height: "10px", borderRadius: "100px", marginBottom: "8px" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#64748b" }}>
                    <span>Giá gốc: {valuationResult.summary.raw_price.toFixed(1)}tr</span>
                    <span>{valuationResult.summary.total_penalty > 0 ? "Tổng khấu trừ" : "Giá trị cộng thêm"}</span>
                  </div>

                  <hr style={{ margin: "24px 0", borderTop: "1px solid #f1f5f9" }} />

                  <h5 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "16px", color: "#1e293b" }}>Chi tiết các yếu tố AI</h5>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                    {valuationResult.deductions.map((d, index) => (
                      <div key={index} style={{
                        backgroundColor: d.amount > 0 ? "#fff5f5" : "#f0fff4",
                        border: `1px solid ${d.amount > 0 ? "#feb2b2" : "#9ae6b4"}`,
                        borderRadius: "10px",
                        padding: "10px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                      }}>
                        {d.amount > 0 ? <BiErrorCircle color="#e53e3e" /> : <BiCheckCircle color="#38a169" />}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "0.75rem", color: d.amount > 0 ? "#c53030" : "#22543d", fontWeight: 600 }}>{d.label}:</div>
                          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: d.amount > 0 ? "#c53030" : "#38a169" }}>
                            {d.amount > 0 ? `-${d.amount.toFixed(2)}tr` : `+${Math.abs(d.amount).toFixed(2)}tr`}
                          </div>
                        </div>
                      </div>
                    ))}
                    {valuationResult.deductions.length === 0 && (
                      <div style={{ textAlign: "center", padding: "20px", color: "#64748b", fontSize: "0.9rem" }}>
                        Không có khoản khấu trừ nào được phát hiện.
                      </div>
                    )}
                  </div>



                  <Button variant="outline-primary" style={{
                    width: "100%",
                    borderRadius: "12px",
                    padding: "12px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}>
                    <BiFile size={20} /> Tải báo cáo chi tiết (PDF)
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{
                backgroundColor: "#fff",
                borderRadius: "24px",
                padding: "48px 32px",
                border: "1px dashed #cbd5e1",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "400px",
                color: "#64748b"
              }}>
                <div style={{
                  width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#f1f5f9",
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px"
                }}>
                  <BiInfoCircle size={40} color="#94a3b8" />
                </div>
                <h5 style={{ fontWeight: 700, color: "#1e293b", marginBottom: "12px" }}>Chờ kết quả định giá</h5>
                <p style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>
                  Vui lòng điền đầy đủ thông tin bên trái và nhấn nút "Bắt đầu định giá" để AI thực hiện phân tích.
                </p>

                <div style={{ marginTop: "32px", textAlign: "left", width: "100%" }}>
                  <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                    <BiCheckCircle color="#2563eb" size={20} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: "0.85rem" }}>Phân tích hơn 100 điểm dữ liệu thị trường</span>
                  </div>
                  <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                    <BiCheckCircle color="#2563eb" size={20} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: "0.85rem" }}>Nhận diện trầy xước qua ảnh (Computer Vision)</span>
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <BiCheckCircle color="#2563eb" size={20} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: "0.85rem" }}>Độ chính xác cao từ mô hình Machine Learning</span>
                  </div>
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
