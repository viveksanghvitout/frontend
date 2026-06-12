import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import BASE_API from '../../config';

export default function ChatWidget() {
  const [searchParams] = useSearchParams();
  const apiKey = searchParams.get('apiKey');
  const isInline = searchParams.get('inline') === 'true';

  const [isOpen, setIsOpen] = useState(isInline);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState([{ text: "Hello! How can I help you today?", sender: 'ai' }]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('Establishing secure connection...');
  const [isListening, setIsListening] = useState(false);
  const [botConfig, setBotConfig] = useState({
    name: 'Support Bot',
    color: '#2563eb',
    position: 'right',
    iconUrl: ''
  });

  const messagesEndRef = useRef(null);
  const sessionId = useRef('sess_' + Math.random().toString(36).substr(2, 9));
  const recognitionRef = useRef(null);
  const thoughtInterval = useRef(null);
  const lastMsgId = useRef(0);

  const MAX_CHARS = 1000;
  const remainingChars = MAX_CHARS - inputValue.length;

  useEffect(() => {
    // Fetch configuration
    const fetchConfig = async () => {
      if (!apiKey) return;
      try {
        const res = await fetch(`${BASE_API}/widget/config`, {
          headers: { 'X-API-Key': apiKey }
        });
        if (res.ok) {
          const data = await res.json();
          setBotConfig({
            name: data.bot_name || 'Support Bot',
            color: data.primary_color || '#2563eb',
            position: data.widget_position || 'right',
            iconUrl: data.widget_icon_url || ''
          });
          
          // Inform parent of position preference if not inline
          if (!isInline) {
            window.parent.postMessage({ type: 'SAAS_WIDGET_POSITION', position: data.widget_position || 'right' }, '*');
          }
        }
      } catch (err) {
        console.warn("Could not fetch widget config", err);
      }
    };
    fetchConfig();
  }, [apiKey, isInline]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    // Handle iframe resize
    if (!isInline) {
      if (isOpen) {
        const width = isMaximized ? '50vw' : '380px';
        const height = isMaximized ? '85vh' : '680px'; // Account for spacing
        // Give it extra padding for the shadow and positioning
        const finalWidth = isMaximized ? 'min(700px, 100vw)' : 'min(420px, 100vw)';
        const finalHeight = isMaximized ? '100vh' : 'min(720px, 100vh)';
        window.parent.postMessage({ type: 'SAAS_WIDGET_RESIZE', width: finalWidth, height: finalHeight, isOpen: true }, '*');
      } else {
        window.parent.postMessage({ type: 'SAAS_WIDGET_RESIZE', width: '80px', height: '80px', isOpen: false }, '*');
      }
    }
  }, [isOpen, isMaximized, isInline]);

  useEffect(() => {
    // Setup Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setInputValue(prev => prev + finalTranscript + interimTranscript);
      };
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = (event) => {
        console.warn("Speech recognition error", event.error);
        setIsListening(false);
      };
    }
    
    return () => {
      if (thoughtInterval.current) clearInterval(thoughtInterval.current);
    };
  }, []);

  useEffect(() => {
    // Polling for agent messages
    if (!apiKey || !isOpen) return;

    const pollAgentMessages = async () => {
      try {
        const res = await fetch(`${BASE_API}/widget/agent-messages/${sessionId.current}?last_msg_id=${lastMsgId.current}`, {
          headers: { 'X-API-Key': apiKey }
        });
        if (res.ok) {
          const data = await res.json();
          let newMsgs = [];
          if (data && data.messages && Array.isArray(data.messages)) newMsgs = data.messages;
          else if (data && data.chats && Array.isArray(data.chats)) newMsgs = data.chats;
          else if (data && data.data && Array.isArray(data.data)) newMsgs = data.data;
          else if (Array.isArray(data)) newMsgs = data;
          
          if (newMsgs.length > 0) {
            let maxId = lastMsgId.current;
            const parsedMessages = newMsgs.map(msg => {
              if (msg.id && typeof msg.id === 'number' && msg.id > maxId) maxId = msg.id;
              
              const rawText = msg.message || msg.content || msg.text || '';
              let formattedHTML = rawText
                .replace(/\r\n/g, '\n')
                .replace(/\n/g, '<br>');
                
              formattedHTML = formattedHTML.replace(/(https?:\/\/[^\s<]+)/g, function(url) {
                  let lastChar = url.slice(-1);
                  let punctuation = ['.', ',', '!', '?', ';', ':'];
                  if (punctuation.includes(lastChar)) {
                      let cleanUrl = url.slice(0, -1);
                      return `<a href="${cleanUrl}" target="_blank" style="color: #0056b3; text-decoration: underline; font-weight: 600;">${cleanUrl}</a>${lastChar}`;
                  }
                  return `<a href="${url}" target="_blank" style="color: #0056b3; text-decoration: underline; font-weight: 600;">${url}</a>`;
              });

              return { 
                text: formattedHTML, 
                sender: 'ai',
                isAgent: true
              };
            });
            
            // Increment fallback if backend has no real IDs
            if (maxId === lastMsgId.current) maxId += newMsgs.length;
            lastMsgId.current = maxId;

            setMessages(prev => [...prev, ...parsedMessages]);
          }
        }
      } catch (err) {
        // silently ignore polling errors
      }
    };

    const intervalId = setInterval(pollAgentMessages, 3000);
    return () => clearInterval(intervalId);
  }, [apiKey, isOpen]);

  const toggleListen = (e) => {
    e.preventDefault();
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !apiKey) return;
    
    const userText = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { text: userText, sender: 'user' }]);
    setIsTyping(true);

    const thoughts = [
      "Establishing secure connection...",
      "Analyzing semantic intent...",
      "Scanning knowledge repository...",
      "Synthesizing contextual response..."
    ];
    let tIndex = 0;
    setTypingText(thoughts[0]);
    thoughtInterval.current = setInterval(() => {
      tIndex++;
      if (tIndex < thoughts.length) {
        setTypingText(thoughts[tIndex]);
      }
    }, 1800);

    const formData = new FormData();
    formData.append('question', userText);
    formData.append('session_id', sessionId.current);
    formData.append('user_name', 'Web Visitor');

    try {
      const response = await fetch(`${BASE_API}/ask_question`, {
        method: 'POST',
        headers: { 'X-API-Key': apiKey },
        body: formData
      });

      if (!response.ok) throw new Error("API Error");

      clearInterval(thoughtInterval.current);
      setIsTyping(false);
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      let fullText = "";
      
      setMessages(prev => [...prev, { text: "", sender: 'ai', isStreaming: true }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setMessages(prev => {
            const newArr = [...prev];
            newArr[newArr.length - 1].isStreaming = false;
            return newArr;
          });
          break;
        }
        
        const chunkText = decoder.decode(value, { stream: true });
        fullText += chunkText;
        
        // Simple formatter
        let formattedHTML = fullText
          .replace(/\r\n/g, '\n')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/(?:^|\n)[\*\-]\s+(<strong>[^<]+<\/strong>:?)\s*(?=\n|$)/g, '\n<div style="margin-top: 8px;">$1</div>')
          .replace(/(?:^|\n)[\*\-]\s/g, '\n&bull; &nbsp;')
          .replace(/([^\>\n])\s[\*\-]\s/g, '$1\n&bull; &nbsp;')
          .replace(/\n/g, '<br>')
          .replace(/(<br>\s*){2,}(?=&bull;)/g, '<br>')
          .replace(/(<br>\s*)+$/g, '');

        formattedHTML = formattedHTML.replace(/(https?:\/\/[^\s<]+)/g, function(url) {
            let lastChar = url.slice(-1);
            let punctuation = ['.', ',', '!', '?', ';', ':'];
            if (punctuation.includes(lastChar)) {
                let cleanUrl = url.slice(0, -1);
                return `<a href="${cleanUrl}" target="_blank" style="color: #0056b3; text-decoration: underline; font-weight: 600;">${cleanUrl}</a>${lastChar}`;
            }
            return `<a href="${url}" target="_blank" style="color: #0056b3; text-decoration: underline; font-weight: 600;">${url}</a>`;
        });
        
        setMessages(prev => {
          const newArr = [...prev];
          newArr[newArr.length - 1].text = formattedHTML;
          return newArr;
        });
      }
    } catch (err) {
      clearInterval(thoughtInterval.current);
      setIsTyping(false);
      setMessages(prev => [...prev, { text: "Sorry, I am having trouble connecting to the server.", sender: 'ai' }]);
    }
  };

  const handlePlayAudio = (text) => {
    // Basic text extraction from HTML
    const temp = document.createElement("div");
    temp.innerHTML = text;
    const cleanText = temp.textContent || temp.innerText || "";
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    window.speechSynthesis.speak(utterance);
  };

  const lightColor = `${botConfig.color}15`; // ~10% opacity hex
  const borderDark = `${botConfig.color}40`; // ~25% opacity hex

  if (!isOpen && !isInline) {
    return (
      <div className="fixed bottom-0 right-0 w-full h-full flex items-end justify-end p-6">
        <button 
          onClick={() => setIsOpen(true)}
          style={{ backgroundColor: botConfig.color }}
          className="w-16 h-16 rounded-full text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        >
          {botConfig.iconUrl ? (
            <img src={botConfig.iconUrl} className="w-full h-full object-cover rounded-full" alt="Bot Icon" />
          ) : (
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path></svg>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-white overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.15)] border border-slate-200 transition-all duration-300 ease-in-out ${isInline ? 'w-full h-full' : (isMaximized ? 'fixed bottom-4 right-4 w-[50vw] h-[85vh] rounded-2xl max-w-[700px]' : 'fixed bottom-20 right-6 w-[380px] h-[600px] max-h-[85vh] rounded-2xl')}`}>
      {/* Header */}
      <div style={{ backgroundColor: botConfig.color }} className="text-white p-4 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
          {botConfig.iconUrl && <img src={botConfig.iconUrl} className="w-10 h-10 object-cover rounded-xl" alt="Bot" />}
          <div className="flex flex-col">
            <span className="font-semibold text-base leading-tight">{botConfig.name}</span>
            <div className="flex items-center gap-1.5 text-sm opacity-90 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_0_rgba(74,222,128,0.4)] animate-pulse"></span>
              Live
            </div>
          </div>
        </div>
        {!isInline && (
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMaximized(!isMaximized)} className="opacity-80 hover:opacity-100 transition-opacity">
              {isMaximized ? (
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M.172 15.828a.5.5 0 0 0 .707 0l4.096-4.096V14.5a.5.5 0 1 0 1 0v-3.975a.5.5 0 0 0-.5-.5H1.5a.5.5 0 0 0 0 1h2.768L.172 15.121a.5.5 0 0 0 0 .707zM15.828.172a.5.5 0 0 0-.707 0l-4.096 4.096V1.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H14.5a.5.5 0 0 0 0-1h-2.768L15.828.879a.5.5 0 0 0 0-.707z"/></svg>
              ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707m4.344-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707"/></svg>
              )}
            </button>
            <button onClick={() => setIsOpen(false)} className="opacity-80 hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/></svg>
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`p-3 rounded-2xl max-w-[85%] leading-relaxed text-[14.5px] break-words ${msg.sender === 'user' ? 'self-end text-white rounded-br-sm shadow-[0_2px_8px_rgba(0,0,0,0.1)]' : 'self-start text-slate-800 rounded-bl-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] border'}`} style={msg.sender === 'user' ? { backgroundColor: botConfig.color } : { backgroundColor: lightColor, borderColor: borderDark }}>
            {msg.sender === 'ai' ? (
              <div className="flex items-start gap-2">
                <div className="flex-1" dangerouslySetInnerHTML={{ __html: msg.text }} />
                {!msg.isStreaming && (
                  <button onClick={() => handlePlayAudio(msg.text)} className="text-slate-500 hover:text-slate-700 p-1 mt-0.5 shrink-0" title="Read aloud">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                  </button>
                )}
              </div>
            ) : (
              msg.text
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="self-start rounded-2xl rounded-bl-sm border shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-3 px-4 max-w-[85%] flex flex-col items-start gap-1" style={{ backgroundColor: lightColor, borderColor: borderDark }}>
            <div className="text-xs text-slate-500 font-medium mb-1">{typingText}</div>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full animate-bounce opacity-60" style={{ backgroundColor: botConfig.color, animationDelay: '-0.32s' }}></div>
              <div className="w-1.5 h-1.5 rounded-full animate-bounce opacity-60" style={{ backgroundColor: botConfig.color, animationDelay: '-0.16s' }}></div>
              <div className="w-1.5 h-1.5 rounded-full animate-bounce opacity-60" style={{ backgroundColor: botConfig.color }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex flex-col bg-white border-t border-slate-100 p-3 pb-2 z-10">
        <div className="flex items-center gap-2.5 w-full">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.substring(0, MAX_CHARS))}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isTyping}
            maxLength={MAX_CHARS}
            placeholder={isListening ? "Listening..." : "Type your message..."}
            className="flex-1 p-3 border border-slate-200 rounded-full outline-none text-[14.5px] bg-slate-50 focus:bg-white focus:border-slate-300 transition-colors disabled:opacity-70 disabled:bg-slate-100"
          />
          {recognitionRef.current && (
            <button 
              onClick={toggleListen}
              disabled={isTyping}
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors text-white disabled:opacity-50"
              style={{ backgroundColor: isListening ? '#ef4444' : botConfig.color }}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>
            </button>
          )}
          <button 
            onClick={handleSend}
            disabled={isTyping || !inputValue.trim()}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors text-white disabled:opacity-50 hover:brightness-110"
            style={{ backgroundColor: botConfig.color }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current ml-0.5"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
          </button>
        </div>
        <div className={`text-[11px] font-medium text-left pl-3 mt-1.5 ${remainingChars <= 10 ? 'text-red-500' : 'text-slate-400'}`}>
          {remainingChars} characters remaining
        </div>
        <div className="text-center text-[11px] text-slate-400 font-medium pb-1 mt-1 bg-white">
          Powered by <span className="text-slate-500 font-bold">ABC Company</span>
        </div>
      </div>
    </div>
  );
}
