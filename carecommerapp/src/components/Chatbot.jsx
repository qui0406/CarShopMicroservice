import React, { useEffect, useMemo, useRef, useState, useCallback, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios, { authApis, endpoints } from "../configs/APIs";
import { MyUserContext } from "../configs/MyContexts";

/* ─────────────────────────── helpers ─────────────────────────── */
const now = () =>
  new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

const toCurrency = (n) =>
  `${Number(n || 0).toLocaleString("vi-VN")} đ`;

const fallbackCarImage =
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80";

const CHAT_SESSION_KEY = "car_ai_chat_session_id";

function getOrCreateSessionId() {
  try {
    let id = localStorage.getItem(CHAT_SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(CHAT_SESSION_KEY, id);
    }
    return id;
  } catch {
    return `anon_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }
}

const WELCOME_TEXT =
  "Xin chào! 👋 Tôi là **Car AI Assistant** – trợ lý tư vấn xe thông minh của showroom.\n\nTôi có thể giúp bạn:\n• 🔍 Tìm xe theo nhu cầu & ngân sách\n• 📊 So sánh các dòng xe\n• 📷 Nhận diện xe qua hình ảnh\n• 💰 Tư vấn giá và thương lượng\n\nBạn cần tìm xe như thế nào?";

function makeWelcomeMessage() {
  return {
    id: `welcome_${Date.now()}`,
    role: "bot",
    text: WELCOME_TEXT,
    time: now(),
    cards: [],
  };
}

const normalizeCars = (data) => {
  const list = data?.result?.content || data?.result || data || [];
  if (!Array.isArray(list)) return [];
  return list.map((car) => ({
    id: car.id,
    name: car.name || "Mẫu xe đang cập nhật",
    price: car.price || 0,
    bodyType: car?.carModel?.bodyType || "",
    image: car?.imageUrls?.[0] || car?.carModel?.thumbnailImage || fallbackCarImage,
    link: car?.id ? `/get-car-by-id/${car.id}` : "/car-new",
    modelName: car?.carModel?.name || "",
    fuelType: car?.carModel?.fuelType || "",
  }));
};

const extractCardsFromIdentify = (result, allCars) => {
  if (!result) return [];
  const potentialNames = [
    result?.ai_detected?.model,
    result?.ai_detected?.version,
    result?.detected_car?.model,
    result?.detected_car?.name,
  ]
    .filter(Boolean)
    .map((x) => String(x).toLowerCase());
  return allCars
    .filter((car) => potentialNames.some((name) => car.name.toLowerCase().includes(name)))
    .slice(0, 3);
};

const formatBotText = (text) => {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
};

/* ─────────────────────────── component ─────────────────────────── */
export default function Chatbot() {
  const user = useContext(MyUserContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [cars, setCars] = useState([]);
  const [messages, setMessages] = useState(() => [makeWelcomeMessage()]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [sessionId, setSessionId] = useState(getOrCreateSessionId);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [identifyLoading, setIdentifyLoading] = useState(false);
  const [identifyResult, setIdentifyResult] = useState(null);
  const [hasUnread, setHasUnread] = useState(false);
  const [pulseBtn, setPulseBtn] = useState(true);

  const endRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => setPulseBtn(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadCars = async () => {
      try {
        const res = await axios.get(endpoints["get-products"](1, 30));
        setCars(normalizeCars(res.data));
      } catch {
        setCars([]);
      }
    };
    loadCars();
  }, []);

  const quickSuggestions = useMemo(() => [
    "Xe gia đình dưới 1 tỷ",
    "Xe tiết kiệm nhiên liệu",
    "Xe SUV đang có",
    "Xe điện đang có",
  ], []);

  const addMessage = useCallback((payload) => {
    setMessages((prev) => [
      ...prev,
      { ...payload, id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}` },
    ]);
  }, []);

  const buildLocalCards = useCallback((query) => {
    const q = query.toLowerCase();
    return cars
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.modelName.toLowerCase().includes(q) ||
          c.bodyType.toLowerCase().includes(q) ||
          c.fuelType.toLowerCase().includes(q)
      )
      .slice(0, 2);
  }, [cars]);

  const startNewChat = async () => {
    try {
      await axios.post(endpoints["clear-chat-history"], { session_id: sessionId });
    } catch { /* redis có thể không khả dụng */ }
    let newId;
    try {
      newId = crypto.randomUUID();
      localStorage.setItem(CHAT_SESSION_KEY, newId);
    } catch {
      newId = `anon_${Date.now()}`;
    }
    setSessionId(newId);
    setMessages([makeWelcomeMessage()]);
  };

  const sendMessage = async (forcedText) => {
    const text = (forcedText || input).trim();
    if (!text || chatLoading) return;
    setInput("");
    addMessage({ role: "user", text, time: now(), cards: [] });
    setChatLoading(true);

    try {
      const response = await axios.post(endpoints["chat"], {
        message: text,
        session_id: sessionId,
      });

      // AI service might return data directly or wrapped in 'result'
      const payload = response.data?.result || response.data || {};

      if (payload.session_id && payload.session_id !== sessionId) {
        setSessionId(payload.session_id);
      }

      const replyText =
        payload.reply ||
        payload.answer ||
        payload.message ||
        "Em đã nhận câu hỏi. Anh/chị có thể cho em thêm nhu cầu để tư vấn chính xác hơn.";

      // Backend calls this 'cards', frontend was looking for 'cars'
      const remoteData = payload.cards || payload.cars || [];
      const remoteCardsList = Array.isArray(remoteData) ? remoteData : [];

      let cards = remoteCardsList.map((c) => ({
        id: c.id,
        name: c.name || c.model || c.car_name || "Mẫu xe",
        price: c.price || 0,
        priceLabel: c.price_formatted || (c.price != null && Number(c.price) > 0 ? toCurrency(c.price) : ""),
        image: c.image || c.thumbnail || (Array.isArray(c.images) && c.images[0]) || fallbackCarImage,
        link: c.id ? `/get-car-by-id/${c.id}` : "/car-new",
        bodyType: c.body_type || c.bodyType || "",
      })).slice(0, 3);

      if (!cards.length) cards = buildLocalCards(text);

      addMessage({ role: "bot", text: replyText, time: now(), cards });
    } catch (error) {
      const server = error.response?.data;
      const fallbackCards = buildLocalCards(text);

      // If server returned an error but included a reply/cards, use them
      const errorReply = server?.reply || server?.message;
      const errorCards = server?.cards || server?.cars || [];

      addMessage({
        role: "bot",
        text: errorReply ||
          "Hiện chưa kết nối được AI service. Em hiển thị nhanh một số xe trong database để anh/chị tham khảo.",
        time: now(),
        cards: Array.isArray(errorCards) && errorCards.length
          ? errorCards.slice(0, 2).map((c) => ({
            id: c.id,
            name: c.name || c.model || "Mẫu xe",
            price: c.price || 0,
            priceLabel: c.price_formatted || toCurrency(c.price),
            image: c.image || c.thumbnail || fallbackCarImage,
            link: c.id ? `/get-car-by-id/${c.id}` : "/car-new",
            bodyType: c.body_type || c.bodyType || "",
          }))
          : fallbackCards,
      });
    } finally {
      setChatLoading(false);
      if (!isOpen) setHasUnread(true);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setIdentifyResult(null);
    setPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleIdentify = async () => {
    if (!imageFile || identifyLoading) return;
    setIdentifyLoading(true);
    setIdentifyResult(null);
    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      const res = await axios.post(endpoints["identify-car"], formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const result = res.data?.result || res.data || {};
      const cards = extractCardsFromIdentify(result, cars);
      setIdentifyResult({ ok: true, result, cards });
      addMessage({
        role: "bot",
        text: `🔍 Đã nhận diện được xe!\n**Hãng:** ${result?.ai_detected?.brand || "--"}\n**Dòng xe:** ${result?.ai_detected?.model || "--"}\n**Phiên bản:** ${result?.ai_detected?.version || "--"}\n\nDưới đây là những xe tương tự trong showroom:`,
        time: now(),
        cards,
      });
      setActiveTab("chat");
    } catch {
      setIdentifyResult({ ok: false, error: "Không thể nhận diện ảnh. Vui lòng thử lại với ảnh rõ hơn." });
    } finally {
      setIdentifyLoading(false);
    }
  };

  const handleDropZoneClick = () => fileInputRef.current?.click();

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setIdentifyResult(null);
      setPreview((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
    }
  };

  /* ─── floating button ─── */
  if (!isOpen) {
    return (
      <button
        type="button"
        style={{
          ...styles.floatingBtn,
          animation: pulseBtn ? "chatbotPulse 2s infinite" : "none",
        }}
        onClick={() => setIsOpen(true)}
        aria-label="Mở trợ lý AI"
      >
        <style>{`
          @keyframes chatbotPulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.5), 0 8px 25px rgba(37,99,235,0.4); }
            50% { box-shadow: 0 0 0 12px rgba(37,99,235,0), 0 8px 25px rgba(37,99,235,0.4); }
          }
          @keyframes chatbotSlideIn {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes typingDot {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
            40% { transform: scale(1); opacity: 1; }
          }
        `}</style>
        <div style={styles.floatingBtnInner}>
          <span style={styles.floatingIcon}>🤖</span>
          {hasUnread && <span style={styles.unreadBadge} />}
        </div>
        <div style={styles.floatingLabel}>AI Tư Vấn</div>
      </button>
    );
  }

  /* ─── main widget ─── */
  return (
    <div style={{ ...styles.widget, ...(isMinimized ? styles.widgetMinimized : {}), ...(!user && !isMinimized ? styles.widgetLogin : {}) }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes chatbotSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes typingDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes messageIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .chatbot-msg { animation: messageIn 0.25s ease-out; }
        .chatbot-quick-btn:hover {
          background: rgba(99,102,241,0.08) !important;
          border-color: rgba(99,102,241,0.4) !important;
          color: #4f46e5 !important;
          transform: translateY(-1px);
        }
        .chatbot-send-btn:hover { background: #4338ca !important; transform: scale(1.05); }
        .chatbot-new-btn:hover { background: rgba(255,255,255,0.2) !important; }
        .chatbot-tab:hover { background: rgba(0,0,0,0.02) !important; }
        .chatbot-car-card:hover { border-color: rgba(99,102,241,0.3) !important; background: rgba(99,102,241,0.04) !important; transform: translateX(2px); }
        .chatbot-link-btn:hover { color: #4338ca !important; }
        .chatbot-identify-btn:hover:not(:disabled) { background: linear-gradient(135deg,#7c3aed,#4f46e5) !important; }
      `}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.avatarWrap}>
            <div style={styles.avatar}>🤖</div>
            <div style={styles.onlineDot} />
          </div>
          <div>
            <div style={styles.headerTitle}>Car AI Assistant</div>
            <div style={styles.headerSub}>Trợ lý tư vấn xe thông minh</div>
          </div>
        </div>
        <div style={styles.headerActions}>
          <button
            type="button"
            className="chatbot-new-btn"
            style={styles.actionBtn}
            onClick={startNewChat}
            disabled={chatLoading}
            title="Cuộc hội thoại mới"
          >
            ✨ Mới
          </button>
          <button
            type="button"
            style={styles.iconBtn}
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? "Mở rộng" : "Thu nhỏ"}
          >
            {isMinimized ? "▲" : "▼"}
          </button>
          <button
            type="button"
            style={styles.iconBtn}
            onClick={() => setIsOpen(false)}
            title="Đóng"
          >
            ✕
          </button>
        </div>
      </header>

      {!isMinimized && !user && (
        /* ─── Login Gate ─── */
        <div style={styles.loginGate}>
          <div style={styles.loginIconWrap}>
            <div style={styles.loginIconBig}>🔐</div>
          </div>
          <div style={styles.loginTitle}>Đăng nhập để sử dụng</div>
          <div style={styles.loginDesc}>
            Trợ lý AI chỉ dành cho thành viên đã đăng ký. Đăng nhập để được tư vấn xe cá nhân hóa và nhận diện xe qua ảnh.
          </div>
          <div style={styles.loginFeatures}>
            {[
              { icon: "💬", text: "Tư vấn xe theo nhu cầu" },
              { icon: "📷", text: "Nhận diện xe qua hình ảnh" },
              { icon: "🔍", text: "So sánh giá & thông số" },
            ].map((f) => (
              <div key={f.text} style={styles.loginFeatureItem}>
                <span style={styles.loginFeatureIcon}>{f.icon}</span>
                <span style={styles.loginFeatureText}>{f.text}</span>
              </div>
            ))}
          </div>
          <button
            style={styles.loginBtn}
            onClick={() => { setIsOpen(false); navigate("/login"); }}
          >
            🚀 Đăng nhập ngay
          </button>
          <button
            style={styles.registerBtn}
            onClick={() => { setIsOpen(false); navigate("/register"); }}
          >
            Chưa có tài khoản? Đăng ký miễn phí
          </button>
        </div>
      )}

      {!isMinimized && user && (
        <>
          {/* Tabs */}
          <div style={styles.tabRow}>
            <button
              className="chatbot-tab"
              style={{ ...styles.tabBtn, ...(activeTab === "chat" ? styles.tabActive : {}) }}
              onClick={() => setActiveTab("chat")}
            >
              <span>💬</span> Chat tư vấn
            </button>
            <button
              className="chatbot-tab"
              style={{ ...styles.tabBtn, ...(activeTab === "vision" ? styles.tabActive : {}) }}
              onClick={() => setActiveTab("vision")}
            >
              <span>📷</span> Nhận diện ảnh
            </button>
          </div>

          {/* Chat Tab */}
          {activeTab === "chat" && (
            <div style={styles.chatWrapper}>
              <div style={styles.messages}>
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className="chatbot-msg"
                    style={{
                      ...styles.messageRow,
                      ...(m.role === "user" ? styles.messageRowUser : {}),
                    }}
                  >
                    {m.role === "bot" && (
                      <div style={styles.botAvatar}>🤖</div>
                    )}
                    <div style={{ maxWidth: "82%" }}>
                      <div style={{
                        ...styles.bubble,
                        ...(m.role === "user" ? styles.bubbleUser : styles.bubbleBot),
                      }}>
                        <div
                          style={styles.messageText}
                          dangerouslySetInnerHTML={{ __html: formatBotText(m.text) }}
                        />
                        <div style={styles.time}>{m.time}</div>
                      </div>
                      {Array.isArray(m.cards) && m.cards.length > 0 && (
                        <div style={styles.cardGrid}>
                          {m.cards.map((car, idx) => (
                            <div key={`${car.id || car.name}-${idx}`} className="chatbot-car-card" style={styles.carCard}>
                              <img
                                src={car.image || fallbackCarImage}
                                alt={car.name}
                                style={styles.carImage}
                                onError={(e) => { e.currentTarget.src = fallbackCarImage; }}
                              />
                              <div style={styles.cardBody}>
                                <div style={styles.carName}>{car.name}</div>
                                {car.bodyType && <div style={styles.carBadge}>{car.bodyType}</div>}
                                <div style={styles.carPrice}>
                                  {car.priceLabel || toCurrency(car.price)}
                                </div>
                                <Link to={car.link} className="chatbot-link-btn" style={styles.linkBtn}>
                                  Xem chi tiết →
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {chatLoading && (
                  <div className="chatbot-msg" style={styles.messageRow}>
                    <div style={styles.botAvatar}>🤖</div>
                    <div style={{ ...styles.bubble, ...styles.bubbleBot }}>
                      <div style={styles.typingWrap}>
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            style={{
                              ...styles.typingDot,
                              animationDelay: `${i * 0.16}s`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              {/* Quick suggestions */}
              <div style={styles.quickRow}>
                {quickSuggestions.map((q) => (
                  <button
                    key={q}
                    className="chatbot-quick-btn"
                    style={styles.quickBtn}
                    onClick={() => sendMessage(q)}
                    disabled={chatLoading}
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input row */}
              <div style={styles.inputRow}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nhập câu hỏi của bạn..."
                  style={styles.input}
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <button
                  className="chatbot-send-btn"
                  style={{
                    ...styles.sendBtn,
                    opacity: !input.trim() || chatLoading ? 0.5 : 1,
                  }}
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || chatLoading}
                >
                  ➤
                </button>
              </div>
            </div>
          )}

          {/* Vision Tab */}
          {activeTab === "vision" && (
            <div style={styles.visionWrap}>
              {/* Upload zone */}
              <div
                style={styles.uploadZone}
                onClick={handleDropZoneClick}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                {preview ? (
                  <div style={styles.previewWrap}>
                    <img src={preview} alt="preview" style={styles.previewImg} />
                    <div style={styles.previewOverlay}>
                      <span style={{ fontSize: "1.5rem" }}>🔄</span>
                      <span>Đổi ảnh</span>
                    </div>
                  </div>
                ) : (
                  <div style={styles.uploadPlaceholder}>
                    <div style={styles.uploadIconBig}>📷</div>
                    <div style={styles.uploadTitle}>Tải ảnh xe lên</div>
                    <div style={styles.uploadSub}>Kéo thả hoặc click để chọn ảnh</div>
                    <div style={styles.uploadFormats}>JPG, PNG, WEBP</div>
                  </div>
                )}
              </div>

              <button
                className="chatbot-identify-btn"
                style={{
                  ...styles.identifyBtn,
                  opacity: imageFile && !identifyLoading ? 1 : 0.5,
                }}
                disabled={!imageFile || identifyLoading}
                onClick={handleIdentify}
              >
                {identifyLoading ? (
                  <span>
                    <span style={styles.spinner}>⏳</span> Đang nhận diện...
                  </span>
                ) : (
                  "🔍 Nhận diện hình ảnh"
                )}
              </button>

              {/* Result */}
              {identifyResult?.ok && (
                <div style={styles.resultCard}>
                  <div style={styles.resultHeader}>✅ Kết quả nhận diện</div>
                  <div style={styles.resultGrid}>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Hãng xe</span>
                      <span style={styles.resultValue}>
                        {identifyResult.result?.ai_detected?.brand || "—"}
                      </span>
                    </div>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Dòng xe</span>
                      <span style={styles.resultValue}>
                        {identifyResult.result?.ai_detected?.model || "—"}
                      </span>
                    </div>
                    <div style={styles.resultItem}>
                      <span style={styles.resultLabel}>Phiên bản</span>
                      <span style={styles.resultValue}>
                        {identifyResult.result?.ai_detected?.version || "—"}
                      </span>
                    </div>
                  </div>
                  {identifyResult.cards?.length > 0 && (
                    <>
                      <div style={styles.resultSubtitle}>Xe tương tự trong showroom:</div>
                      <div style={styles.cardGrid}>
                        {identifyResult.cards.map((car) => (
                          <div key={car.id} className="chatbot-car-card" style={styles.carCard}>
                            <img src={car.image} alt={car.name} style={styles.carImage}
                              onError={(e) => { e.currentTarget.src = fallbackCarImage; }} />
                            <div style={styles.cardBody}>
                              <div style={styles.carName}>{car.name}</div>
                              <div style={styles.carPrice}>{toCurrency(car.price)}</div>
                              <Link to={car.link} className="chatbot-link-btn" style={styles.linkBtn}>
                                Xem xe →
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
              {identifyResult && !identifyResult.ok && (
                <div style={styles.errorCard}>
                  ❌ {identifyResult.error}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─────────────────────────── styles ─────────────────────────── */
const styles = {
  /* Floating button */
  floatingBtn: {
    position: "fixed",
    bottom: 28,
    right: 28,
    background: "linear-gradient(135deg, #6366f1, #2563eb)",
    border: "none",
    borderRadius: 20,
    padding: "10px 16px 10px 12px",
    cursor: "pointer",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    gap: 8,
    boxShadow: "0 8px 25px rgba(37,99,235,0.4)",
    transition: "transform 0.2s ease",
  },
  floatingBtnInner: { position: "relative", display: "flex" },
  floatingIcon: { fontSize: "1.5rem" },
  floatingLabel: {
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.85rem",
    fontFamily: "Inter, sans-serif",
    letterSpacing: "0.01em",
  },
  unreadBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#f43f5e",
    border: "2px solid #fff",
  },

  /* Widget */
  widget: {
    position: "fixed",
    bottom: 100,
    right: 28,
    width: 400,
    height: 620,
    maxWidth: "92vw",
    maxHeight: "82vh",
    background: "#ffffff",
    borderRadius: 20,
    boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    zIndex: 9999,
    fontFamily: "Inter, -apple-system, sans-serif",
    animation: "chatbotSlideIn 0.3s ease-out",
  },
  widgetMinimized: { height: "auto" },

  /* Header */
  header: {
    background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
    padding: "14px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "none",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  avatarWrap: { position: "relative", flexShrink: 0 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.3rem",
    border: "2px solid rgba(255,255,255,0.25)",
  },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#22c55e",
    border: "2px solid #5560ff",
  },
  headerTitle: {
    fontWeight: 700,
    fontSize: "0.95rem",
    color: "#fff",
    letterSpacing: "0.01em",
  },
  headerSub: { fontSize: "0.72rem", color: "rgba(255,255,255,0.6)", marginTop: 2 },
  headerActions: { display: "flex", gap: 6, alignItems: "center" },
  actionBtn: {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "#fff",
    borderRadius: 10,
    padding: "5px 11px",
    fontSize: "0.75rem",
    cursor: "pointer",
    fontWeight: 600,
    transition: "background 0.2s",
    fontFamily: "Inter, sans-serif",
  },
  iconBtn: {
    background: "rgba(255,255,255,0.08)",
    border: "none",
    color: "rgba(255,255,255,0.7)",
    borderRadius: 8,
    width: 30,
    height: 30,
    cursor: "pointer",
    fontSize: "0.8rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
  },

  /* Tabs */
  tabRow: {
    display: "flex",
    background: "#f8fafc",
    borderBottom: "1px solid rgba(0,0,0,0.05)",
  },
  tabBtn: {
    flex: 1,
    padding: "11px 8px",
    border: "none",
    background: "transparent",
    color: "#64748b",
    fontWeight: 600,
    fontSize: "0.82rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    transition: "all 0.2s",
    fontFamily: "Inter, sans-serif",
  },
  tabActive: {
    color: "#3b82f6",
    borderBottom: "2px solid #3b82f6",
    background: "rgba(59,130,246,0.05)",
  },

  /* Chat */
  chatWrapper: { display: "flex", flexDirection: "column", flex: 1, minHeight: 0 },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "14px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(99,102,241,0.3) transparent",
  },
  messageRow: {
    display: "flex",
    gap: 8,
    marginBottom: 6,
    alignItems: "flex-end",
  },
  messageRowUser: { flexDirection: "row-reverse" },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.9rem",
    flexShrink: 0,
    border: "1px solid #dbeafe",
  },
  bubble: {
    borderRadius: 14,
    padding: "10px 13px",
    lineHeight: 1.5,
  },
  bubbleBot: {
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    color: "#1e293b",
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    background: "linear-gradient(135deg, #4f46e5, #3b82f6)",
    color: "#fff",
    borderBottomRightRadius: 4,
    boxShadow: "0 4px 12px rgba(59,130,246,0.25)",
  },
  messageText: {
    fontSize: "0.875rem",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  time: {
    marginTop: 5,
    fontSize: "0.68rem",
    color: "#94a3b8",
    textAlign: "right",
  },

  /* Typing */
  typingWrap: { display: "flex", gap: 5, padding: "4px 2px", alignItems: "center" },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#3b82f6",
    animation: "typingDot 1.2s infinite ease-in-out",
  },

  /* Car cards */
  cardGrid: { display: "flex", flexDirection: "column", gap: 7, marginTop: 8 },
  carCard: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "8px 10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  carImage: {
    width: 80,
    height: 58,
    objectFit: "cover",
    borderRadius: 8,
    flexShrink: 0,
    border: "1px solid #f1f5f9",
  },
  cardBody: { flex: 1, minWidth: 0 },
  carName: {
    fontWeight: 700,
    fontSize: "0.82rem",
    color: "#1e293b",
    marginBottom: 3,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  carBadge: {
    display: "inline-block",
    background: "#eff6ff",
    color: "#3b82f6",
    fontSize: "0.68rem",
    borderRadius: 6,
    padding: "2px 6px",
    marginBottom: 3,
    fontWeight: 600,
  },
  carPrice: {
    fontSize: "0.77rem",
    color: "#059669",
    fontWeight: 700,
    marginBottom: 4,
  },
  linkBtn: {
    textDecoration: "none",
    color: "#4f46e5",
    fontWeight: 600,
    fontSize: "0.75rem",
    transition: "color 0.2s",
  },

  /* Quick suggestions */
  quickRow: {
    padding: "8px 10px",
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    background: "#fff",
  },
  quickBtn: {
    border: "1px solid #dbeafe",
    background: "#f0f9ff",
    color: "#4f46e5",
    borderRadius: 20,
    padding: "5px 10px",
    fontSize: "0.72rem",
    cursor: "pointer",
    fontWeight: 500,
    transition: "all 0.2s ease",
    fontFamily: "Inter, sans-serif",
    whiteSpace: "nowrap",
  },

  /* Input */
  inputRow: {
    padding: "10px 12px",
    borderTop: "1px solid #f1f5f9",
    display: "flex",
    gap: 8,
    alignItems: "flex-end",
    background: "#fff",
  },
  input: {
    flex: 1,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: "10px 14px",
    resize: "none",
    outline: "none",
    fontFamily: "Inter, sans-serif",
    fontSize: "0.875rem",
    color: "#1e293b",
    lineHeight: 1.5,
    transition: "all 0.2s",
    maxHeight: 100,
  },
  sendBtn: {
    border: "none",
    borderRadius: 12,
    background: "linear-gradient(135deg, #4f46e5, #3b82f6)",
    color: "#fff",
    width: 40,
    height: 40,
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
  },

  /* Vision tab */
  visionWrap: {
    flex: 1,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    overflowY: "auto",
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(99,102,241,0.3) transparent",
  },
  uploadZone: {
    border: "2px dashed #cbd5e1",
    borderRadius: 14,
    minHeight: 160,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    background: "#f8fafc",
    transition: "all 0.2s",
    overflow: "hidden",
    position: "relative",
  },
  previewWrap: { position: "relative", width: "100%", height: "100%" },
  previewImg: {
    width: "100%",
    height: 155,
    objectFit: "cover",
  },
  previewOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    opacity: 0,
    transition: "opacity 0.2s",
    color: "#fff",
    fontSize: "0.85rem",
    fontWeight: 600,
  },
  uploadPlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: 20,
  },
  uploadIconBig: { fontSize: "2.5rem" },
  uploadTitle: { color: "#1e293b", fontWeight: 700, fontSize: "0.9rem" },
  uploadSub: { color: "#64748b", fontSize: "0.78rem" },
  uploadFormats: {
    color: "#94a3b8",
    fontSize: "0.7rem",
    background: "#f1f5f9",
    borderRadius: 6,
    padding: "2px 8px",
  },
  identifyBtn: {
    border: "none",
    borderRadius: 12,
    background: "linear-gradient(135deg, #4f46e5, #3b82f6)",
    color: "#fff",
    padding: "12px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "0.875rem",
    fontFamily: "Inter, sans-serif",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 14px rgba(59,130,246,0.3)",
  },
  resultCard: {
    background: "rgba(99,102,241,0.08)",
    border: "1px solid rgba(99,102,241,0.25)",
    borderRadius: 14,
    padding: 12,
  },
  resultHeader: {
    fontWeight: 700,
    color: "#3b82f6",
    fontSize: "0.875rem",
    marginBottom: 10,
    display: "flex",
    gap: 6,
    alignItems: "center",
  },
  resultGrid: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 },
  resultItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "5px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  resultLabel: { color: "#64748b", fontSize: "0.78rem" },
  resultValue: { color: "#1e293b", fontWeight: 600, fontSize: "0.82rem" },
  resultSubtitle: {
    color: "#64748b",
    fontSize: "0.78rem",
    marginBottom: 8,
    fontWeight: 600,
  },
  errorCard: {
    background: "rgba(244,63,94,0.1)",
    border: "1px solid rgba(244,63,94,0.3)",
    borderRadius: 12,
    padding: "10px 14px",
    color: "#fb7185",
    fontSize: "0.85rem",
    fontWeight: 600,
  },
  spinner: { display: "inline-block" },

  /* Login gate */
  widgetLogin: {
    height: "auto",
  },
  loginGate: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "28px 24px 24px",
    gap: 14,
    textAlign: "center",
  },
  loginIconWrap: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: "#eff6ff",
    border: "1px solid #dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loginIconBig: { fontSize: "2.2rem" },
  loginTitle: {
    fontWeight: 800,
    fontSize: "1.05rem",
    color: "#1e293b",
    letterSpacing: "0.01em",
  },
  loginDesc: {
    fontSize: "0.82rem",
    color: "#64748b",
    lineHeight: 1.6,
    maxWidth: 280,
  },
  loginFeatures: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    width: "100%",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "12px 16px",
  },
  loginFeatureItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  loginFeatureIcon: { fontSize: "1rem", flexShrink: 0 },
  loginFeatureText: {
    fontSize: "0.82rem",
    color: "#475569",
    textAlign: "left",
    fontWeight: 500,
  },
  loginBtn: {
    width: "100%",
    border: "none",
    borderRadius: 12,
    background: "linear-gradient(135deg, #4f46e5, #3b82f6)",
    color: "#fff",
    padding: "12px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "0.9rem",
    fontFamily: "Inter, sans-serif",
    boxShadow: "0 4px 14px rgba(59,130,246,0.3)",
    transition: "opacity 0.2s",
  },
  registerBtn: {
    width: "100%",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    background: "transparent",
    color: "#64748b",
    padding: "10px",
    fontWeight: 500,
    cursor: "pointer",
    fontSize: "0.8rem",
    fontFamily: "Inter, sans-serif",
    transition: "color 0.2s",
  },
};
