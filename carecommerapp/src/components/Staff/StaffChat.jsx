import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send, Plus, Search, Phone, Video, MoreVertical, Smile, Paperclip, MessageSquare } from "lucide-react";
import { authApis, endpoints } from './../../configs/APIs';
import cookie from "react-cookies";
import { io } from "socket.io-client";

export default function CustomerStaffChat() {
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messagesMap, setMessagesMap] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 12,
    totalElements: 0
  });

  const messageContainerRef = useRef(null);
  const messageInputRef = useRef(null);
  const socketRef = useRef(null);
  const tempMessageId = useRef(0);

  // Get current user info from token or API
  const getCurrentUser = useCallback(async () => {
    try {
      // You might have an endpoint to get current user info
      // const res = await authApis().get(endpoints["current-user"]);
      // For now, we'll extract from token or set default
      const token = cookie.load("token");
      if (token) {
        // Decode token to get user info or set default
        setCurrentUser({ 
          id: "current_staff_id", 
          name: "Staff User", 
          role: "STAFF" 
        });
      }
    } catch (error) {
      console.error("Error getting current user:", error);
      // Set default user
      setCurrentUser({ 
        id: "current_staff_id", 
        name: "Staff User", 
        role: "STAFF" 
      });
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, []);

  const generateTempId = useCallback(() => {
    tempMessageId.current += 1;
    return `temp_${Date.now()}_${tempMessageId.current}`;
  }, []);

  const fetchConversations = async (page = 1) => {
    try {
      setLoading(true);
      const res = await authApis().get(endpoints["get-all-conversation"], {
        params: { page, size: 12 }
      });
      
      if (res.status === 200 || res.status === 201) {
        const responseData = res.data.result;
        
        // Update pagination info
        setPagination({
          currentPage: responseData.currentPage,
          totalPages: responseData.totalPages,
          pageSize: responseData.pageSize,
          totalElements: responseData.totalElements
        });

        // Map conversations with proper structure
        const mappedConversations = responseData.data.map(conv => ({
          id: conv.id,
          customerId: conv.customerId,
          customerInfo: conv.customerInfo,
          staff: conv.staff,
          status: conv.status,
          createdAt: conv.createdAt,
          // Add computed fields
          participants: [
            { 
              id: conv.customerId, 
              name: conv.customerInfo?.name || "Customer", 
              role: "CUSTOMER",
              avatar: conv.customerInfo?.avatar || "C"
            },
            ...(conv.staff ? [{
              id: conv.staff.id,
              name: conv.staff.name,
              role: "STAFF",
              avatar: conv.staff.avatar || "S"
            }] : [])
          ],
          lastMessage: "", // Will be updated when messages are loaded
          lastTimestamp: conv.createdAt,
          unread: 0 // Will be calculated from messages
        }));

        setConversations(prev => 
          page === 1 ? mappedConversations : [...prev, ...mappedConversations]
        );

        console.log("Conversations loaded:", mappedConversations);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId, page = 1) => {
    try {
      setLoading(true);
      const res = await authApis().get(endpoints["get-message"], {
        params: { conversationId, page, size: 50 }
      });
      
      if (res.status === 200 || res.status === 201) {
        const messages = res.data.result;
        
        const fetchedMessages = messages.map((msg) => ({
          id: msg.id,
          message: msg.message || msg.content, // Handle different field names
          sender: {
            id: msg.senderId || (msg.me ? currentUser?.id : "support"),
            name: msg.senderName || (msg.me ? currentUser?.name : "Support"),
            role: msg.senderRole || (msg.me ? "STAFF" : "CUSTOMER")
          },
          createdDate: msg.createdDate || msg.createdAt,
          conversationId: msg.conversationId || conversationId,
          isTemporary: false
        }));

        setMessagesMap((prev) => {
          const existingMessages = prev[conversationId] || [];
          
          // Merge and deduplicate messages
          const allMessages = [...existingMessages, ...fetchedMessages];
          const uniqueMessages = allMessages.filter((msg, index, self) =>
            index === self.findIndex((m) => m.id === msg.id)
          );
          
          // Sort by creation date
          uniqueMessages.sort((a, b) => 
            new Date(a.createdDate) - new Date(b.createdDate)
          );

          return {
            ...prev,
            [conversationId]: uniqueMessages
          };
        });

        console.log("Messages loaded for conversation:", conversationId);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const addMessageToUI = useCallback((conversationId, messageData) => {
    setMessagesMap((prev) => {
      const existingMessages = prev[conversationId] || [];
      
      // Check if message already exists
      if (messageData.id && !messageData.id.toString().startsWith('temp_')) {
        const messageExists = existingMessages.some((m) => 
          m.id === messageData.id
        );
        if (messageExists) {
          return prev;
        }

        // Update temporary message if exists
        if (messageData.tempId) {
          const updatedMessages = existingMessages.map((msg) =>
            msg.tempId === messageData.tempId
              ? { ...messageData}
              : msg
          );
          return {
            ...prev,
            [conversationId]: updatedMessages
          };
        }
      }

      // Add new message
      const newMessages = [...existingMessages, messageData];
      newMessages.sort((a, b) => 
        new Date(a.createdDate) - new Date(b.createdDate)
      );

      return {
        ...prev,
        [conversationId]: newMessages
      };
    });
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation?.id || sendingMessage || !currentUser) return;

    const tempId = generateTempId();
    const messageText = message.trim();
    
    setSendingMessage(true);
    setMessage("");

    // Add temporary message to UI
    const tempMessage = {
      id: tempId,
      tempId: tempId,
      message: messageText,
      sender: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role
      },
      createdDate: new Date().toISOString(),
      conversationId: selectedConversation.id,
    };

    addMessageToUI(selectedConversation.id, tempMessage);

    try {
      const res = await authApis().post(endpoints["create-message"], {
        conversationId: selectedConversation.id,
        message: messageText
      });

      if (res.status === 200 || res.status === 201) {
        console.log("Message sent successfully:", res.data.result);
        
        const serverMessage = {
          id: res.data.result.id,
          tempId: tempId,
          message: res.data.result.message || res.data.result.content,
          sender: {
            id: res.data.result.senderId || currentUser.id,
            name: res.data.result.senderName || currentUser.name,
            role: res.data.result.senderRole || currentUser.role
          },
          createdDate: res.data.result.createdDate || res.data.result.createdAt,
          conversationId: selectedConversation.id,
        };

        addMessageToUI(selectedConversation.id, serverMessage);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Remove temporary message on error
      setMessagesMap(prev => ({
        ...prev,
        [selectedConversation.id]: (prev[selectedConversation.id] || []).filter(
          msg => msg.tempId !== tempId
        )
      }));
      
      setMessage(messageText);
      alert("Không thể gửi tin nhắn. Vui lòng thử lại!");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Socket connection
  useEffect(() => {
    if (!socketRef.current && currentUser) {
      console.log("Initializing socket connection...");
      const token = cookie.load("token");
      const connectionUrl = `http://localhost:8099?token=${token}`;
      socketRef.current = io(connectionUrl);

      socketRef.current.on("connect", () => {
        console.log("Socket connected");
      });

      socketRef.current.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      socketRef.current.on("message", (msg) => {
        try {
          const messageObject = typeof msg === "string" ? JSON.parse(msg) : msg;
          console.log("Received socket message:", messageObject);
          
          const conversationId = messageObject.conversationId;
          
          const newMessage = {
            id: messageObject.id,
            message: messageObject.message || messageObject.content,
            sender: {
              id: messageObject.senderId || (messageObject.me ? currentUser.id : "customer"),
              name: messageObject.senderName || (messageObject.me ? currentUser.name : "Customer"),
              role: messageObject.senderRole || (messageObject.me ? "STAFF" : "CUSTOMER")
            },
            createdDate: messageObject.createdDate || messageObject.createdAt,
            conversationId: conversationId,
          };

          // Only add message if it's not from current user (avoid duplicates)
          if (newMessage.sender.id !== currentUser.id) {
            addMessageToUI(conversationId, newMessage);
          }

        } catch (error) {
          console.error("Error parsing socket message:", error);
        }
      });
    }

    return () => {
      if (socketRef.current) {
        console.log("Disconnecting socket...");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [currentUser, addMessageToUI]);

  // Join room when conversation changes
  useEffect(() => {
    if (socketRef.current && selectedConversation?.id) {
      socketRef.current.emit("join-room", { 
        conversationId: selectedConversation.id 
      });
      console.log("Joined room for conversation:", selectedConversation.id);
    }
  }, [selectedConversation?.id]);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return date.toLocaleTimeString("vi-VN", { 
        hour: "2-digit", 
        minute: "2-digit" 
      });
    }
    return date.toLocaleDateString("vi-VN", { 
      day: "2-digit", 
      month: "2-digit" 
    });
  };

  const getOtherParticipant = useCallback((conversation) => {
    if (!currentUser) return null;
    return conversation.participants?.find((p) => p.id !== currentUser.id);
  }, [currentUser]);

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

  const filteredConversations = conversations.filter((conv) => {
    if (!searchTerm) return true;
    const otherParticipant = getOtherParticipant(conv);
    return (
      otherParticipant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const currentMessages = selectedConversation ? messagesMap[selectedConversation.id] || [] : [];

  // Initialize current user
  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  // Load conversations after user is set
  useEffect(() => {
    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser]);

  // Auto-select first conversation
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversation?.id && currentUser) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation?.id, currentUser]);

  // Auto scroll
  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, scrollToBottom]);

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
            filteredConversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              const isSelected = selectedConversation?.id === conversation.id;

              return (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    isSelected ? "bg-blue-50 border-blue-200" : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                        {otherParticipant?.avatar || otherParticipant?.name?.charAt(0) || "U"}
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
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage || "Chưa có tin nhắn"}
                        </p>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(conversation.status)}`}></div>
                          <span className="text-xs text-gray-400">
                            {getStatusText(conversation.status)}
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

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                    {getOtherParticipant(selectedConversation)?.avatar || 
                     getOtherParticipant(selectedConversation)?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h2 className="font-medium text-gray-900">
                      {getOtherParticipant(selectedConversation)?.name || "Unknown User"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {getStatusText(selectedConversation.status)}
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

            {/* Messages */}
            <div
              ref={messageContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
            >
              {currentMessages.map((msg) => {
                const isCurrentUser = msg.sender.id === currentUser.id;
                const uniqueKey = msg.tempId || msg.id;

                return (
                  <div
                    key={uniqueKey}
                    className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                        isCurrentUser ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      {!isCurrentUser && (
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {msg.sender.name?.charAt(0) || "U"}
                        </div>
                      )}
                      <div className="flex flex-col space-y-1">
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isCurrentUser
                              ? `bg-blue-500 text-white rounded-br-sm `
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

            {/* Input */}
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
                    disabled={sendingMessage}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 disabled:opacity-50"
                    rows="1"
                    style={{ minHeight: "48px" }}
                  />
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <Smile size={20} className="text-gray-600" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sendingMessage}
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