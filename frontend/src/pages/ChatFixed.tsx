import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import { chatAPI } from '../utils/api';
import 'react-calendar/dist/Calendar.css';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatFixed: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const loadConversations = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await chatAPI.getConversations(dateStr);
      
      const loadedMessages: Message[] = [];
      response.conversations.forEach((conv: any, index: number) => {
        loadedMessages.push({
          id: `user-${index}`,
          text: conv.user_input,
          isUser: true,
          timestamp: new Date(conv.timestamp),
        });
        loadedMessages.push({
          id: `ai-${index}`,
          text: conv.response,
          isUser: false,
          timestamp: new Date(conv.timestamp),
        });
      });
      
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setMessages([]);
    }
  };

  const simulateTyping = (text: string, callback: (char: string) => void, onComplete: () => void) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        callback(text[index]);
        index++;
      } else {
        clearInterval(interval);
        onComplete();
      }
    }, 20);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    const messageText = inputText;
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      console.log('Sending message:', messageText);
      const response = await chatAPI.sendMessage(messageText);
      console.log('Received response:', response);
      
      let typedText = '';
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      simulateTyping(
        response.response,
        (char: string) => {
          typedText += char;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === aiMessage.id 
                ? { ...msg, text: typedText }
                : msg
            )
          );
        },
        () => {
          setIsTyping(false);
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      setIsTyping(false);
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleDateChange = (date: any) => {
    setSelectedDate(date);
    setShowCalendar(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-primary-bg via-secondary-bg to-primary-bg">
      {/* Header */}
      <div className="glass border-b border-accent-bg/30 backdrop-blur-sm">
        <div className="flex items-center justify-between p-6">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-3 text-primary-text hover:text-accent-color transition-all duration-300 font-semibold group"
          >
            <div className="w-8 h-8 rounded-full bg-accent-bg/30 flex items-center justify-center group-hover:bg-accent-color/20 transition-all duration-300">
              <span className="text-lg">←</span>
            </div>
            Back
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold gradient-text mb-1">AI Companion</h1>
            <p className="text-sm text-accent-color font-medium">Powered by Gemini</p>
          </div>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className={`w-12 h-12 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
              showCalendar 
                ? 'border-accent-color bg-accent-color/20 text-accent-color scale-110' 
                : 'border-accent-bg text-primary-text hover:border-accent-color hover:text-accent-color hover:scale-110'
            }`}
          >
            <span className="text-xl">📅</span>
          </button>
        </div>
      </div>

      {/* Calendar */}
      {showCalendar && (
        <div className="p-6 border-b border-accent-bg/30 animate-slide-in">
          <div className="max-w-md mx-auto glass rounded-custom-lg p-6">
            <h3 className="text-primary-text font-bold mb-6 text-center text-xl">
              View Past Conversations
            </h3>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              className="bg-transparent text-primary-text w-full"
            />
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 pb-32">
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <div className="mb-12">
                <div className="w-32 h-32 mx-auto bg-gradient-to-r from-accent-color to-teal-400 rounded-full flex items-center justify-center shadow-large mb-8 animate-pulse">
                  <span className="text-5xl">🤖</span>
                </div>
                <h3 className="text-4xl font-bold gradient-text mb-6">Hi! I'm your AI companion</h3>
                <p className="text-xl text-secondary-text max-w-2xl mx-auto leading-relaxed mb-8">
                  I'm here to listen and support you. I remember our conversations and learn about you.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {[
                  { text: 'How are you feeling today?', icon: '😊' },
                  { text: 'I need someone to talk to', icon: '💬' },
                  { text: 'Help me feel calmer', icon: '🧘‍♀️' }
                ].map((suggestion) => (
                  <button
                    key={suggestion.text}
                    onClick={() => {
                      setInputText(suggestion.text);
                    }}
                    className="glass rounded-custom-lg p-6 border border-accent-bg/30 hover:border-accent-color/50 transition-all duration-300 hover:shadow-large group"
                  >
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{suggestion.icon}</div>
                    <p className="text-primary-text font-medium">{suggestion.text}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-4 message-enter ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!message.isUser && (
                  <div className="w-12 h-12 bg-gradient-to-r from-accent-color to-teal-400 rounded-full flex items-center justify-center shadow-medium flex-shrink-0">
                    <span className="text-lg">🤖</span>
                  </div>
                )}
                <div
                  className={`max-w-xs lg:max-w-2xl px-6 py-5 shadow-medium hover:shadow-large transition-all duration-300 ${
                    message.isUser
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-3xl rounded-br-lg'
                      : 'glass border border-accent-color/30 text-primary-text rounded-3xl rounded-bl-lg'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed text-base font-medium">{message.text}</p>
                  <div className={`flex items-center justify-between mt-4 pt-3 border-t ${
                    message.isUser ? 'border-white/20' : 'border-accent-color/20'
                  }`}>
                    <span className={`text-xs font-medium ${message.isUser ? 'text-white/80' : 'text-secondary-text'}`}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    {!message.isUser && (
                      <span className="text-xs text-accent-color font-bold bg-accent-color/10 px-2 py-1 rounded-full">
                        Gemini AI
                      </span>
                    )}
                  </div>
                </div>
                {message.isUser && (
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-medium flex-shrink-0">
                    <span className="text-lg">👤</span>
                  </div>
                )}
              </div>
            ))
          )}
          {isTyping && (
            <div className="flex items-start gap-4 justify-start message-enter">
              <div className="w-12 h-12 bg-gradient-to-r from-accent-color to-teal-400 rounded-full flex items-center justify-center shadow-medium flex-shrink-0 animate-pulse">
                <span className="text-lg">🤖</span>
              </div>
              <div className="glass border border-accent-color/30 px-6 py-5 rounded-3xl rounded-bl-lg shadow-medium">
                <div className="flex items-center gap-3">
                  <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                  <span className="text-accent-color text-sm font-medium">Gemini is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-20 left-0 right-0 glass border-t border-accent-color/30 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-end gap-4">
            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Share your thoughts... (Press Enter to send)"
                rows={1}
                disabled={isLoading}
                className="w-full px-6 py-4 rounded-3xl bg-secondary-bg/70 border-2 border-accent-bg text-primary-text placeholder-secondary-text focus:border-accent-color focus:outline-none resize-none transition-all duration-300 shadow-medium focus:shadow-large"
                style={{
                  minHeight: '60px',
                  maxHeight: '120px',
                  lineHeight: '1.6',
                  fontSize: '16px',
                }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputText.trim() || isLoading}
              className={`
                w-16 h-16 rounded-full font-bold text-white shadow-large transition-all duration-300 transform flex items-center justify-center
                ${(!inputText.trim() || isLoading) 
                  ? 'bg-accent-bg/50 cursor-not-allowed opacity-50' 
                  : 'bg-gradient-to-r from-accent-color to-blue-500 hover:shadow-2xl hover:scale-110 active:scale-95'
                }
              `}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="text-2xl">→</span>
              )}
            </button>
          </div>
          <div className="text-center mt-3">
            <span className="text-xs text-accent-color font-medium">
              Powered by Gemini AI • I remember our conversations
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatFixed;
