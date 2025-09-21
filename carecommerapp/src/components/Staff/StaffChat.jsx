import React, { useState, useEffect, useRef, useCallback, useMemo, useContext } from "react";
import { Send, Plus, Search, Phone, Video, MoreVertical, Smile, Paperclip, MessageSquare } from "lucide-react";
import { authApis, endpoints } from "./../../configs/APIs";
import cookie from "react-cookies";
import { io } from "socket.io-client";
import { MyUserContext } from "./../../configs/MyContexts"; // <-- dùng context

const CHAT_SERVER_URL = process.env.REACT_APP_CHAT_URL || "http://localhost:8099";

export default function CustomerStaffChat() {
  // lấy raw user từ context (giống Header)
  const rawUser = useContext(MyUserContext);

  // currentUser chuẩn hoá để dùng trong chat
  const currentUser = useMemo(() => {
    if (!rawUser) return null;
    const fullName = `${rawUser.firstName || ""} ${rawUser.lastName || ""}`.trim()
      || rawUser.username
      || (rawUser.email ? rawUser.email.split("@")[0] : "")
      || "User";
    const role = Array.isArray(rawUser.roles)
      ? (rawUser.roles.includes("STAFF") ? "STAFF" : (rawUser.roles[0] || "USER"))
      : "USER";
    return {
      id: rawUser.id,
      name: fullName,
      role,
      avatar: rawUser.avatar || null
    };
  }, [rawUser]);

  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messagesMap, setMessagesMap] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 12,
    totalElements: 0
  });

  const messageContainerRef = useRef(null);
  const socketRef = useRef(null);
  const tempMessageId = useRef(0);

  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, []);

  const generateTempId = useCallback(() => {
    tempMessageId.current += 1;
    return `temp_${Date.now()}_${tempMessageId.current}`;
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffH = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffH < 24) {
      return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "WAITING": return "bg-yellow-500";
      case "ACTIVE": return "bg-green-500";
      case "CLOSED": return "bg-gray-500";
      default: return "bg-blue-500";
    }
  };
  const getStatusText = (status) => {
    switch (status) {
      case "WAITING": return "Đang chờ";
      case "ACTIVE": return "Đang hoạt động";
      case "CLOSED": return "Đã đóng";
      default: return status?.toLowerCase() || "unknown";
    }
  };

  // “other” = customerInfo từ API get-all-conversation
  const getOther = useCallback((conv) => {
    const ci = conv?.customerInfo;
    if (!ci) return null;
    const name = ci.username || "Customer";
    return { id: conv.customerId, name, avatar: ci.avatar || null, role: "CUSTOMER" };
  }, []);

  // map conversation theo API bạn gửi
  const mapConversationFromApi = (apiConv) => {
    const other = getOther(apiConv);
    return {
      id: apiConv.id,
      status: apiConv.status,
      createdAt: apiConv.createdAt,
      customerId: apiConv.customerId,
      customerInfo: apiConv.customerInfo,
      staff: apiConv.staff,
      other,
      lastMessage: "",
      lastTimestamp: apiConv.createdAt,
      unread: 0
    };
  };

  const fetchConversations = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await authApis().get(endpoints["get-all-conversation"], { params: { page, size: 12 } });
      if (res.status === 200 || res.status === 201) {
        const payload = res.data.result;
        setPagination({
          currentPage: payload.currentPage,
          totalPages: payload.totalPages,
          pageSize: payload.pageSize,
          totalElements: payload.totalElements
        });
        const mapped = (payload.data || []).map(mapConversationFromApi);
        setConversations(prev => (page === 1 ? mapped : [...prev, ...mapped]));
      }
    } catch (e) {
      console.error("Error loading conversations:", e);
    } finally {
      setLoading(false);
    }
  }, [getOther]);

  const fetchMessages = useCallback(async (conversationId, page = 1) => {
    try {
      setLoading(true);
      const res = await authApis().get(endpoints["get-message"], { params: { conversationId, page, size: 50 } });
      if (res.status === 200 || res.status === 201) {
        const raw = res.data.result || [];
        const msgs = raw.map((m) => ({
          id: m.id,
          message: m.message || m.content,
          sender: {
            id: m.sender?.id || m.senderId || (m.me ? currentUser?.id : getOther(selectedConversation)?.id),
            name: m.sender
              ? `${m.sender.firstName || ""} ${m.sender.lastName || ""}`.trim() || m.sender.username || "User"
              : (m.senderName || "User"),
            role: m.sender?.role || m.senderRole || (m.me ? "STAFF" : "CUSTOMER"),
            avatar: m.sender?.avatar || null
          },
          createdDate: m.createdDate || m.createdAt,
          conversationId: m.conversationId || conversationId,
          me: !!m.me,
          isTemporary: false
        }));

        setMessagesMap((prev) => {
          const exist = prev[conversationId] || [];
          const merged = [...exist, ...msgs].reduce((acc, cur) => {
            if (!acc.find(x => x.id === cur.id)) acc.push(cur);
            return acc;
          }, []);
          merged.sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));
          return { ...prev, [conversationId]: merged };
        });

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== conversationId) return c;
            const last = [...msgs].sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))[0];
            return last ? { ...c, lastMessage: last.message, lastTimestamp: last.createdDate } : c;
          })
        );
      }
    } catch (e) {
      console.error("Error loading messages:", e);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, getOther, selectedConversation]);

  const addMessageToUI = useCallback((conversationId, messageData) => {
    setMessagesMap((prev) => {
      const ex = prev[conversationId] || [];
      if (messageData.id && !String(messageData.id).startsWith("temp_")) {
        if (ex.some(m => m.id === messageData.id)) return prev;
        if (messageData.tempId) {
          const replaced = ex.map(m => (m.tempId === messageData.tempId ? { ...messageData } : m));
          return { ...prev, [conversationId]: replaced };
        }
      }
      const next = [...ex, messageData].sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));
      return { ...prev, [conversationId]: next };
    });
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || !selectedConversation?.id || sendingMessage || !currentUser) return;

    const text = message.trim();
    setMessage("");
    setSendingMessage(true);

    const tempId = generateTempId();
    const tempMsg = {
      id: tempId,
      tempId,
      message: text,
      sender: { id: currentUser.id, name: currentUser.name, role: currentUser.role, avatar: currentUser.avatar },
      createdDate: new Date().toISOString(),
      conversationId: selectedConversation.id,
      me: true,
      isTemporary: true
    };
    addMessageToUI(selectedConversation.id, tempMsg);

    try {
      const res = await authApis().post(endpoints["create-message"], {
        conversationId: selectedConversation.id,
        message: text
      });
      if (res.status === 200 || res.status === 201) {
        const s = res.data.result;
        const confirm = {
          id: s.id,
          tempId,
          message: s.message,
          sender: {
            id: s.sender?.id || currentUser.id,
            name: `${s.sender?.firstName || ""} ${s.sender?.lastName || ""}`.trim() || currentUser.name,
            role: s.sender?.role || currentUser.role,
            avatar: s.sender?.avatar || currentUser.avatar
          },
          createdDate: s.createdDate,
          conversationId: s.conversationId || selectedConversation.id,
          me: !!s.me,
          isTemporary: false
        };
        addMessageToUI(selectedConversation.id, confirm);

        setConversations(prev => prev.map(c =>
          c.id === selectedConversation.id ? { ...c, lastMessage: confirm.message, lastTimestamp: confirm.createdDate } : c
        ));
      } else {
        throw new Error("Send failed");
      }
    } catch (e) {
      console.error("Error sending message:", e);
      setMessagesMap(prev => ({
        ...prev,
        [selectedConversation.id]: (prev[selectedConversation.id] || []).filter(m => m.tempId !== tempId)
      }));
      setMessage(text);
      alert("Không thể gửi tin nhắn. Vui lòng thử lại!");
    } finally {
      setSendingMessage(false);
    }
  }, [message, selectedConversation?.id, sendingMessage, currentUser, generateTempId, addMessageToUI]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Socket: init khi có currentUser
  useEffect(() => {
    if (socketRef.current || !currentUser) return;

    const token = cookie.load("token");
    const s = io(CHAT_SERVER_URL, {
      query: { token },
      transports: ["websocket", "polling"]
    });
    socketRef.current = s;

    s.on("connect", () => console.log("[socket] connected"));
    s.on("disconnect", () => console.log("[socket] disconnected"));
    s.on("error", (err) => console.error("[socket] error", err));

    s.on("message", (payload) => {
      try {
        const msg = typeof payload === "string" ? JSON.parse(payload) : payload;
        const convId = msg.conversationId || selectedConversation?.id;
        const normalized = {
          id: msg.id || `sock_${Date.now()}`,
          message: msg.message,
          sender: {
            id: msg.sender?.id || msg.senderId,
            name: msg.sender
              ? `${msg.sender.firstName || ""} ${msg.sender.lastName || ""}`.trim() || msg.sender.username || "User"
              : (msg.senderName || "User"),
            role: msg.sender?.role || msg.senderRole || "USER",
            avatar: msg.sender?.avatar || null
          },
          createdDate: msg.createdDate || msg.createdAt || new Date().toISOString(),
          conversationId: convId,
          me: !!msg.me,
          isTemporary: false
        };

        if (normalized.sender.id !== currentUser.id && !normalized.me) {
          addMessageToUI(convId, normalized);
          setConversations(prev => prev.map(c =>
            c.id === convId ? { ...c, lastMessage: normalized.message, lastTimestamp: normalized.createdDate } : c
          ));
        }
      } catch (e) {
        console.error("Error parsing socket message:", e);
      }
    });

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [currentUser, addMessageToUI, selectedConversation?.id]);

  // Join room theo conversation
  useEffect(() => {
    if (socketRef.current && selectedConversation?.id) {
      socketRef.current.emit("join-room", { conversationId: selectedConversation.id });
    }
  }, [selectedConversation?.id]);

  // Load data sau khi có currentUser
  useEffect(() => {
    if (currentUser) {
      fetchConversations(1);
    }
  }, [currentUser, fetchConversations]);

  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  useEffect(() => {
    if (selectedConversation?.id && currentUser) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation?.id, currentUser, fetchMessages]);

  const currentMessages = useMemo(
    () => (selectedConversation ? (messagesMap[selectedConversation.id] || []) : []),
    [messagesMap, selectedConversation]
  );

  useEffect(() => { scrollToBottom(); }, [currentMessages, scrollToBottom]);

  // filter theo tên customer/lastMessage/status
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      if (!searchTerm) return true;
      const other = getOther(c);
      return (
        other?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [conversations, searchTerm, getOther]);

  if (!currentUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50" style={{ paddingTop: "70px" }}>
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-semibold text-gray-800">
              Chat Hỗ trợ ({pagination.totalElements})
            </h1>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Plus size={20} className="text-gray-600" />
            </button>
          </div>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm cuộc trò chuyện..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && conversations.length === 0 ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Đang tải...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageSquare size={40} className="mx-auto mb-2 text-gray-300" />
              <p>Chưa có cuộc trò chuyện nào</p>
            </div>
          ) : (
            filteredConversations.map((c) => {
              const other = getOther(c);
              const isSelected = selectedConversation?.id === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedConversation(c)}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    isSelected ? "bg-blue-50 border-blue-200" : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium overflow-hidden">
                        {other?.avatar ? (
                          <img
                            src={other.avatar}
                            alt={other.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          (other?.name || "U").charAt(0)
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">
                          {other?.name || "Unknown User"}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatTime(c.lastTimestamp || c.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">{c.lastMessage || "Chưa có tin nhắn"}</p>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(c.status)}`} />
                          <span className="text-xs text-gray-400">{getStatusText(c.status)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium overflow-hidden">
                    {getOther(selectedConversation)?.avatar ? (
                      <img
                        src={getOther(selectedConversation).avatar}
                        alt={getOther(selectedConversation).name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      (getOther(selectedConversation)?.name || "U").charAt(0)
                    )}
                  </div>
                  <div>
                    <h2 className="font-medium text-gray-900">
                      {getOther(selectedConversation)?.name || "Unknown User"}
                    </h2>
                    <p className="text-sm text-gray-500">{getStatusText(selectedConversation.status)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full"><Phone size={20} className="text-gray-600" /></button>
                  <button className="p-2 hover:bg-gray-100 rounded-full"><Video size={20} className="text-gray-600" /></button>
                  <button className="p-2 hover:bg-gray-100 rounded-full"><MoreVertical size={20} className="text-gray-600" /></button>
                </div>
              </div>
            </div>

            <div ref={messageContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {(messagesMap[selectedConversation.id] || []).map((msg) => {
                const isMe = !!msg.me || msg.sender.id === currentUser.id;
                const key = msg.tempId || msg.id;
                return (
                  <div key={key} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isMe ? "flex-row-reverse space-x-reverse" : ""}`}>
                      {!isMe && (
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium overflow-hidden">
                          {msg.sender.avatar ? (
                            <img src={msg.sender.avatar} alt={msg.sender.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            (msg.sender.name || "U").charAt(0)
                          )}
                        </div>
                      )}
                      <div className="flex flex-col space-y-1">
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isMe
                              ? `bg-blue-500 text-white rounded-br-sm ${msg.isTemporary ? "opacity-70" : ""}`
                              : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        </div>
                        <div className={`text-xs text-gray-500 ${isMe ? "text-right" : "text-left"}`}>
                          {formatTime(msg.createdDate)}
                          {msg.isTemporary && <span className="ml-1 text-gray-400">Đang gửi...</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-end space-x-3">
                <button className="p-2 hover:bg-gray-100 rounded-full"><Paperclip size={20} className="text-gray-600" /></button>
                <div className="flex-1 relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập tin nhắn..."
                    disabled={sendingMessage}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 disabled:opacity-50"
                    rows={1}
                    style={{ minHeight: 48 }}
                  />
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full"><Smile size={20} className="text-gray-600" /></button>
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sendingMessage || !selectedConversation?.id}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-full transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare size={64} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">Chọn một cuộc trò chuyện</h3>
              <p className="text-gray-500">Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
