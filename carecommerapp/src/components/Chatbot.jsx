// src/components/ChatWidget.tsx
import { useEffect } from 'react';
import '@n8n/chat/style.css'; // Import n8n chat styles
import { createChat } from '@n8n/chat';
import './../styles/Chatbot.css'; // Import Home.css (adjust path as needed)

const ChatWidget = () => {
  useEffect(() => {
    createChat({
      webhookUrl: 'https://qui0406.app.n8n.cloud/webhook/5f1c0c82-0ff9-40c7-9e2e-b1a96ffe24cd/chat', // Replace with your n8n webhook URL
      target: '#n8n-chat',
      mode: 'window', // Use window mode for a toggleable chat icon
      loadPreviousSession: true,
      showWelcomeScreen: false,
      initialMessages: [
        'Chào mừng bạn đến shop',
        'Bạn cần tôi giúp gì?'
      ],
      i18n: {
        vi: {
          subtitle: 'Bạn cần giúp đỡ gì',
        },
      },
      enableStreaming: false, // Enable if your workflow supports streaming
    });
  }, []);

  return <div id="n8n-chat" className="chat-container"></div>;
};

export default ChatWidget;