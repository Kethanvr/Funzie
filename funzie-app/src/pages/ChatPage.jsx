import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar'; // Import Navbar
import Footer from '../components/Footer'; // Import Footer
import axios from 'axios';
import '../styles/chatpage.css'; // Import page-specific styles

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [mediaInput, setMediaInput] = useState('');
  const [inputType, setInputType] = useState('text'); // State to track input type
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (userInput.trim() !== '' || mediaInput.trim() !== '') {
      const newMessage = {
        sender: 'user',
        text: userInput,
        media: mediaInput,
        type: inputType,
      };

      setMessages([...messages, newMessage]);
      setUserInput('');
      setMediaInput('');

      try {
        const response = await axios.post('http://localhost:5000/api/chat', {
          message: userInput,
          media: mediaInput,
          history: messages.map((msg) => ({
            role: msg.sender,
            text: msg.text,
            media: msg.media,
          })),
        });

        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'chatbot', text: response.data.reply, media: '', type: 'text' },
        ]);
      } catch (error) {
        console.error('Error:', error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'chatbot', text: 'Error with the chatbot API', media: '', type: 'text' },
        ]);
      }
    }
  };

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleMediaChange = (e) => {
    setMediaInput(e.target.value);
  };

  const handleInputTypeChange = (e) => {
    const fileType = e.target.files ? e.target.files[0] : null;
    if (fileType) {
      const fileUrl = URL.createObjectURL(fileType);
      setMediaInput(fileUrl);
      setInputType('file');
    } else if (e.target.type === 'file') {
      setInputType('file');
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
              {msg.media && (
                <div>
                  {msg.type === 'image' && <img src={msg.media} alt="user-uploaded" />}
                  {msg.type === 'audio' && <audio controls src={msg.media}></audio>}
                  {msg.type === 'file' && <a href={msg.media} target="_blank" rel="noopener noreferrer">Download File</a>}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="chat-input">
          {/* Text Input */}
          <input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message here"
            style={{ display: inputType === 'text' ? 'block' : 'none' }}
          />

          {/* Media URL Input for Image, Audio, and File */}
          <input
            type="text"
            value={mediaInput}
            onChange={handleMediaChange}
            placeholder={
              inputType === 'image' ? 'Enter image URL' :
              inputType === 'audio' ? 'Enter audio URL' :
              inputType === 'file' ? 'Enter file URL' : ''
            }
            style={{ display: inputType !== 'text' ? 'block' : 'none' }}
          />

          {/* File Input for uploading files */}
          <input
            type="file"
            onChange={handleInputTypeChange}
            style={{ display: inputType === 'file' ? 'block' : 'none' }}
          />

          {/* Send Button */}
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ChatPage;
