import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send, Plus, Search, Phone, Video, MoreVertical, Smile, Paperclip, MessageSquare } from "lucide-react";
import { authApis, endpoints } from './../../configs/APIs'; // Verify this path
import cookie from "react-cookies";
import { io } from "socket.io-client";

export default function CustomerStaffChat() {
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messagesMap, setMessagesMap] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser] = useState({ id: "staff1", name: "Lê Thị B", role: "STAFF" });

  const messageContainerRef = useRef(null);
  const messageInputRef = useRef(null);
  const socketRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await authApis().post(endpoints["get-or-create-conversation"]);
      if (res.status === 200 || res.status === 201) {
        setConversations([res.data.result]); // Assuming single conversation for simplicity
        console.log("Conversations loaded:", res.data.result);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      setLoading(true);
      const res = await authApis().get(endpoints["get-message"], {
        params: { conversationId }
      });
      if (res.status === 200 || res.status === 201) {
        const fetchedMessages = res.data.result.map((msg) => ({
          id: msg.id,
          message: msg.message, // Match server field
          sender: {
            id: msg.me ? currentUser.id : "support", // Use 'me' to determine sender
            name: msg.me ? currentUser.name : "Support"
          },
          createdDate: msg.createdDate
        }));
        setMessagesMap((prev) => ({
          ...prev,
          [conversationId]: fetchedMessages
        }));
        console.log("Messages loaded:", res.data.result);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (message.trim() && selectedConversation?.id) {
      const newMessage = {
        conversationId: selectedConversation.id,
        message
      };

      const messageForUI = {
        id: Date.now(), // Temporary ID
        message,
        sender: {
          id: currentUser.id,
          name: currentUser.name
        },
        createdDate: new Date().toISOString()
      };

      setMessagesMap((prev) => ({
        ...prev,
        [selectedConversation.id]: [...(prev[selectedConversation.id] || []), messageForUI]
      }));
      setMessage("");

      try {
        const res = await authApis().post(endpoints["create-message"], newMessage);
        if (res.status === 200 || res.status === 201) {
          console.log("Message sent:", res.data.result);
          const serverMessage = {
            id: res.data.result.id,
            message: res.data.result.message,
            sender: {
              id: res.data.result.me ? currentUser.id : "support",
              name: res.data.result.me ? currentUser.name : "Support"
            },
            createdDate: res.data.result.createdDate
          };
          setMessagesMap((prev) => ({
            ...prev,
            [selectedConversation.id]: prev[selectedConversation.id].map((msg) =>
              msg.id === messageForUI.id ? serverMessage : msg
            )
          }));
        }
      } catch (error) {
        console.error("Error sending message:", error);
        setMessagesMap((prev) => ({
          ...prev,
          [selectedConversation.id]: prev[selectedConversation.id].filter(
            (msg) => msg.id !== messageForUI.id
          )
        }));
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (!socketRef.current) {
      console.log("Initializing socket connection...");
      const connectionUrl = "http://localhost:8099?token=" + cookie.load("token");
      socketRef.current = io(connectionUrl);

      socketRef.current.on("connect", () => {
        console.log("Socket connected");
      });

      socketRef.current.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      socketRef.current.on("message", (msg) => {
        console.log("New message received:", msg);
        const messageObject = typeof msg === "string" ? JSON.parse(msg) : msg;
        const newMessage = {
          id: messageObject.id || Date.now(),
          message: messageObject.message,
          sender: {
            id: messageObject.me ? currentUser.id : "support",
            name: messageObject.me ? currentUser.name : "Support"
          },
          createdDate: messageObject.createdDate || new Date().toISOString()
        };
        setMessagesMap((prev) => ({
          ...prev,
          [selectedConversation?.id]: [...(prev[selectedConversation?.id] || []), newMessage]
        }));
      });
    }

    return () => {
      if (socketRef.current) {
        console.log("Disconnecting socket...");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [selectedConversation, currentUser]);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants?.find((p) => p.id !== currentUser.id);
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchTerm) return true;
    const otherParticipant = getOtherParticipant(conv);
    return (
      otherParticipant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const currentMessages = selectedConversation ? messagesMap[selectedConversation.id] || [] : [];

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  useEffect(() => {
    if (selectedConversation?.id) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, scrollToBottom]);

  return (
    <div className="flex h-screen bg-gray-50" style={{ paddingTop: "70px" }}>
      {/* Sidebar - Danh sách cuộc trò chuyện */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-semibold text-gray-800">Chat Hỗ trợ</h1>
            <button className="p-2 hover:bg-gray-100 rounded-full">
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
          {loading ? (
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
            filteredConversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              const isSelected = selectedConversation?.id === conversation.id;

              return (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                        {otherParticipant?.avatar || "👤"}
                      </div>
                      {conversation.unread > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                          {conversation.unread}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">
                          {otherParticipant?.name || "Unknown User"}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastTimestamp)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                        <div className="flex items-center space-x-1">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              otherParticipant?.role === "CUSTOMER" ? "bg-green-500" : "bg-blue-500"
                            }`}
                          ></div>
                          <span className="text-xs text-gray-400 capitalize">
                            {otherParticipant?.role?.toLowerCase()}
                          </span>
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

      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                    {getOtherParticipant(selectedConversation)?.avatar || "👤"}
                  </div>
                  <div>
                    <h2 className="font-medium text-gray-900">
                      {getOtherParticipant(selectedConversation)?.name}
                    </h2>
                    <p className="text-sm text-gray-500 capitalize">
                      {getOtherParticipant(selectedConversation)?.role?.toLowerCase()} • Đang hoạt động
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Phone size={20} className="text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Video size={20} className="text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <MoreVertical size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            <div
              ref={messageContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
            >
              {currentMessages.map((msg) => {
                const isCurrentUser = msg.sender.id === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                        isCurrentUser ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      {!isCurrentUser && (
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {msg.sender.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex flex-col space-y-1">
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isCurrentUser
                              ? "bg-blue-500 text-white rounded-br-sm"
                              : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        </div>
                        <div
                          className={`text-xs text-gray-500 ${
                            isCurrentUser ? "text-right" : "text-left"
                          }`}
                        >
                          {formatTime(msg.createdDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-end space-x-3">
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Paperclip size={20} className="text-gray-600" />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    ref={messageInputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập tin nhắn..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32"
                    rows="1"
                    style={{ minHeight: "48px" }}
                  />
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Smile size={20} className="text-gray-600" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
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
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                Chọn một cuộc trò chuyện
              </h3>
              <p className="text-gray-500">
                Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}