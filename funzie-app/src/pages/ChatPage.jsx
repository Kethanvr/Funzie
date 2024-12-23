import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar'; // Import Navbar
import Footer from '../components/Footer'; // Import Footer
import axios from 'axios';
import '../styles/chatpage.css'; // Import page-specific styles

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [inputType, setInputType] = useState('text');
  const chatContainerRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }

    // Initialize Speech Recognition API
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.continuous = true;
      recognition.interimResults = true;
      setSpeechRecognition(recognition);
    }
  }, []);

  // Handle sending message (text or voice)
  const handleSendMessage = async () => {
    if (userInput.trim() !== '') {
      const newMessage = {
        sender: 'user',
        text: userInput,
        type: inputType,
      };

      setMessages([...messages, newMessage]);
      setUserInput('');

      try {
        const response = await axios.post('http://localhost:5000/api/chat', {
          message: userInput,
          history: messages.map((msg) => ({
            role: msg.sender,
            text: msg.text,
          })),
        });

        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'chatbot', text: response.data.reply, type: 'text' },
        ]);

        // Voice Output - Gemini API response can generate an audio file
        playVoiceOutput(response.data.reply);
      } catch (error) {
        console.error('Error:', error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'chatbot', text: 'Error with the chatbot API', type: 'text' },
        ]);
      }
    }
  };

  // Play voice output using the Gemini API (example using Web Speech API for simplicity)
  const playVoiceOutput = (text) => {
    const speechSynthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = speechSynthesis.getVoices().find(voice => voice.name === 'Google UK English Male'); // Customize voice
    speechSynthesis.speak(utterance);
  };

  // Start/Stop Recording
  const toggleRecording = () => {
    if (isRecording) {
      speechRecognition.stop();
      setIsRecording(false);
    } else {
      speechRecognition.start();
      setIsRecording(true);

      speechRecognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setUserInput(transcript); // Set the transcribed text in the input field
      };
    }
  };

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  return (
    <div>
      {/* Navbar */}
      <Navbar />

      {/* Chat Section */}
      <div className="chat-container" style={{ background: '#FF4081' }}>
        <div className="chat-body" ref={chatContainerRef}>
          {messages.map((msg, index) => (
            <div key={index} className={msg.sender === 'user' ? 'user-message' : 'chatbot-message'}>
              <p>{msg.text}</p>
            </div>
          ))}
        </div>

        <div className="chat-input">
          {/* Text Input */}
          <input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            placeholder="Type your message here"
            style={{ display: inputType === 'text' ? 'block' : 'none' }}
          />

          {/* Send Button */}
          <button onClick={handleSendMessage}>Send</button>

          {/* Microphone Button */}
          <button onClick={toggleRecording}>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ChatPage;
