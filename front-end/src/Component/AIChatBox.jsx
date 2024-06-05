import React, { useState, useEffect } from 'react';
import { FaRobot, FaUser } from 'react-icons/fa';
import { SlActionRedo } from "react-icons/sl";
import axiosProvider from "../utils/axiosConfig";

const AIChatbox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [pendingBugReport, setPendingBugReport] = useState(null);

  useEffect(() => {
    // Set the default welcoming message
    setMessages([
      { type: 'bot', text: 'Welcome! How can I assist you today?' },
      { type: 'bot', text: 'Please choose an option: "Report a Bug" or "Need Other Assistance"' },
    ]);
  }, []);

  const handleSendMessage = async () => {
    if (input.trim() !== '') {
      const userMessage = input;
      setMessages([...messages, { type: 'user', text: input }]);
      setInput('');

      if (userMessage.toLowerCase() === 'report a bug') {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: 'bot', text: 'Please describe the bug you encountered:' },
        ]);
        setPendingBugReport(true);
      } else if (userMessage.toLowerCase() === 'need other assistance') {
        try {
          const response = await axiosProvider.post('/api/chat', { message: userMessage });
          const botMessage = response.data.message;
          setMessages((prevMessages) => [
            ...prevMessages,
            { type: 'bot', text: botMessage },
          ]);
        } catch (error) {
          console.error('Error communicating with OpenAI:', error);
          setMessages((prevMessages) => [
            ...prevMessages,
            { type: 'bot', text: 'An error occurred. Would you like to report this issue?' },
          ]);
        }
      } else if (pendingBugReport) {
        handleCreateIssue('Bug Report', userMessage);
        setPendingBugReport(false);
      }
    }
  };

  const handleCreateIssue = async (title, body) => {
    try {
      const response = await axiosProvider.post('/api/create-issue', { title, body });
      console.log('Issue created successfully:', response.data);
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: 'bot', text: 'Issue reported successfully. Thank you!' },
      ]);
    } catch (error) {
      console.error('Error creating GitHub issue:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: 'bot', text: 'Failed to create GitHub issue. Please try again later.' },
      ]);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="page-container">
      <h2 style={{ padding: '10px', display: 'flex', alignItems: 'center' }}>
        Input your issue here to talk to our AI assistant <SlActionRedo />
      </h2>
      <div className="chatbox-container">
        <div className="chatbox-header">Get Help Chatbox</div>
        <div className="chatbox-body">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`chatbox-message ${message.type === 'user' ? 'user-message' : 'bot-message'}`}
            >
              {message.type === 'bot' && (
                <div className="icon-container">
                  <FaRobot className="icon-bot" />
                </div>
              )}
              <div className={`message-bubble ${message.type === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                {message.text}
              </div>
              {message.type === 'user' && (
                <div className="icon-container">
                  <FaUser className="icon-user" />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="chatbox-input-container">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="chatbox-input"
          />
          <button onClick={handleSendMessage} className="chatbox-send-button">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatbox;
