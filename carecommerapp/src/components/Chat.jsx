import React, { useState, useRef, useEffect } from 'react';
import { authApis, endpoints } from '../configs/APIs';
import cookie from "react-cookies";
import { io } from "socket.io-client";

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Xin chào! Tôi có thể giúp gì cho bạn?", sender: "support", time: "10:19" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [conversation, setConversation] = useState(null);
  const [allMessage, setAllMessage] = useState([]);
  const messagesEndRef = useRef(null);

  const socketRef = useRef(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) loadConversation();
  };

  const loadConversation = async () => {
    try {
      const res = await authApis().post(endpoints["get-or-create-conversation"]);
      if (res.status === 200 || res.status === 201) {
        setConversation(res.data.result);
        console.log("Conversation loaded:", res.data.result);
        loadMessage(res.data.result.id);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  };

  const loadMessage = async (conversationId) => {
    try {
      const res = await authApis().get(endpoints["get-message"], {
        params: { conversationId }
      });
      if (res.status === 200 || res.status === 201) {
        const fetchedMessages = res.data.result.map((msg) => ({
          id: msg.id,
          text: msg.message,
          sender: msg.me ? "user" : "support", // Use 'me' to determine sender
          time: new Date(msg.createdDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setAllMessage(res.data.result);
        setMessages(fetchedMessages);
        console.log("Messages loaded:", res.data.result);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const sendMessage = async () => {
    if (inputValue.trim() && conversation?.id) {
      const newMessage = {
        conversationId: conversation.id,
        message: inputValue
      };

      const messageForUI = {
        id: Date.now(), // Temporary ID
        text: inputValue,
        sender: "user", // Assume sent by user
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages([...messages, messageForUI]);
      setInputValue("");

      try {
        const res = await authApis().post(endpoints["create-message"], newMessage);
        if (res.status === 200 || res.status === 201) {
          console.log("Message sent:", res.data.result);
          const serverMessage = {
            id: res.data.result.id,
            text: res.data.result.message,
            sender: res.data.result.me ? "user" : "support", // Use 'me' from server response
            time: new Date(res.data.result.createdDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === messageForUI.id ? serverMessage : msg
            )
          );
        }
      } catch (error) {
        console.error("Error sending message:", error);
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== messageForUI.id)
        );
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
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

      socketRef.current.on("message", (message) => {
        console.log("New message received:", message);
        const messageObject = typeof message === "string" ? JSON.parse(message) : message;
        const newMessage = {
          id: messageObject.id || Date.now(),
          text: messageObject.message,
          sender: messageObject.me ? "user" : "support", // Use 'me' for alignment
          time: new Date(messageObject.createdDate || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });
    }

    return () => {
      if (socketRef.current) {
        console.log("Disconnecting socket...");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      zIndex: 1000,
      fontFamily: 'Arial, sans-serif'
    }}>
      {!isOpen && (
        <div
          onClick={toggleChat}
          style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#FF6B35',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease'
          }}
        >
          <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v3l4-3h8c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
        </div>
      )}

      {isOpen && (
        <div style={{
          width: '320px',
          height: '450px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{
            backgroundColor: '#FF6B35',
            color: 'white',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Hỗ trợ khách hàng</div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>
                  <span style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#4CAF50',
                    borderRadius: '50%',
                    marginRight: '6px'
                  }}></span>
                  Đang online
                </div>
              </div>
            </div>
            <button
              onClick={toggleChat}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '4px'
              }}
            >
              ✕
            </button>
          </div>

          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            backgroundColor: '#f8f9fa'
          }}>
            {messages.map((message) => (
              <div key={message.id} style={{
                marginBottom: '12px',
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '70%',
                  padding: '8px 12px',
                  borderRadius: '16px',
                  backgroundColor: message.sender === 'user' ? '#007bff' : 'white',
                  color: message.sender === 'user' ? 'white' : '#333',
                  fontSize: '14px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  position: 'relative'
                }}>
                  {message.text}
                  <div style={{
                    fontSize: '11px',
                    opacity: 0.7,
                    marginTop: '4px',
                    textAlign: message.sender === 'user' ? 'right' : 'left'
                  }}>
                    {message.time}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div style={{
            padding: '16px',
            borderTop: '1px solid #eee',
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '20px',
                outline: 'none',
                fontSize: '14px'
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: '#FF6B35',
                border: 'none',
                borderRadius: '50%',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;