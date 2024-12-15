// src/pages/ChatPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar'; // Import Navbar
import Footer from '../components/Footer'; // Import Footer
import axios from 'axios';
import '../styles/chatpage.css'; // Import page-specific styles

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (userInput.trim() !== '') {
      setMessages([...messages, { sender: 'user', text: userInput }]);
      setUserInput('');

      try {
        const response = await axios.post('http://localhost:5000/api/chat', {
          message: userInput,
          history: messages.map((msg) => ({
            role: msg.sender,
            text: msg.text,
          })),
        });

        setIsTyping(true);
        setTimeout(() => {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'chatbot', text: response.data.reply },
          ]);
          setIsTyping(false);
        }, 1500);
      } catch (error) {
        console.error('Error:', error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'chatbot', text: 'Error with the chatbot API' },
        ]);
      }
    }
  };

  return (
    <div>
      {/* Navbar */}
      <Navbar />

      {/* Chat Section */}
      <div className="chat-container" style={{ background: '#FF4081' }}>
        <div className="chat-body" ref={chatContainerRef}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={msg.sender === 'user' ? 'user-message' : 'chatbot-message'}
            >
              <p>{msg.text}</p>
            </div>
          ))}
          {isTyping && (
            <div className="chatbot-message typing">
              <p>...</p>
            </div>
          )}
        </div>

        <div className="chat-input">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything!"
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ChatPage;
