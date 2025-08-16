import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { generateBotResponse } from "../utils/chatBot";

const ChatInterface = ({ userData, setUserData, scenarios, setScenarios }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "Hello! I'm your WealthWise AI assistant. I'm here to help you optimize your pension and retirement benefits. Let's start by getting to know you better.",
      timestamp: new Date(),
      component: "welcome",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message, data = null) => {
    if (!message.trim() && !data) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: "user",
      content: message || "Form submitted",
      timestamp: new Date(),
      data: data,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Generate bot response
    setTimeout(async () => {
      const botResponse = await generateBotResponse(
        message,
        data,
        userData,
        scenarios
      );

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: botResponse.content,
        timestamp: new Date(),
        component: botResponse.component,
        data: botResponse.data,
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);

      // Update app state if needed
      if (botResponse.updateUserData) {
        setUserData((prev) => ({ ...prev, ...botResponse.updateUserData }));
      }
      if (botResponse.updateScenarios) {
        setScenarios(botResponse.updateScenarios);
      }
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Messages */}
      <div className="flex-1 chat-scroll px-4 py-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              userData={userData}
              scenarios={scenarios}
              onFormSubmit={handleSendMessage}
              onUpdateUserData={setUserData}
              onUpdateScenarios={setScenarios}
            />
          ))}

          {isTyping && (
            <div className="flex items-start space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-full flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1 flex gap-2 relative items-center">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your retirement options, tax implications, or any financial planning questions..."
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows="1"
                style={{
                  minHeight: "48px",
                  maxHeight: "120px",
                }}
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isTyping}
                className="px-4 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
          {/* <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • Shift+Enter for new line
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
