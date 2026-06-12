import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
const BASE_API = import.meta.env.VITE_BASE_API;

export default function ChatLogs() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [chats, setChats] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatContainerRef = useRef(null);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('saas_client_token');
      const res = await fetch(`${BASE_API}/admin/live-sessions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || data || []);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const fetchChats = async (sessionId) => {
    if (!sessionId) return;
    try {
      const token = localStorage.getItem('saas_client_token');
      const res = await fetch(`${BASE_API}/admin/sessions/${sessionId}/chats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        let chatsData = [];
        if (data && data.chats && Array.isArray(data.chats)) {
          chatsData = data.chats;
        } else if (data && data.messages && Array.isArray(data.messages)) {
          chatsData = data.messages;
        } else if (data && data.history && Array.isArray(data.history)) {
          chatsData = data.history;
        } else if (data && data.data && Array.isArray(data.data)) {
          chatsData = data.data;
        } else if (Array.isArray(data)) {
          chatsData = data;
        }
        setChats(chatsData);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      const sId = selectedSession.id || selectedSession.session_id;
      fetchChats(sId);
      const interval = setInterval(() => {
        fetchChats(sId);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedSession]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chats]);

  const handleTakeover = async () => {
    if (!selectedSession) return;
    try {
      const sId = selectedSession.id || selectedSession.session_id;
      const token = localStorage.getItem('saas_client_token');
      const res = await fetch(`${BASE_API}/admin/sessions/${sId}/takeover`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const isNowHuman = !selectedSession.human_takeover;
        toast.success(isNowHuman ? "You have taken over this chat" : "AI has resumed control");
        setSelectedSession(prev => ({ ...prev, human_takeover: isNowHuman }));
        fetchSessions(); // Refresh list to show takeover status
      }
    } catch (error) {
      toast.error("Failed to toggle takeover");
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedSession) return;
    setIsSending(true);
    try {
      const sId = selectedSession.id || selectedSession.session_id;
      const token = localStorage.getItem('saas_client_token');
      const res = await fetch(`${BASE_API}/admin/sessions/${sId}/send`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: replyText.trim() })
      });
      if (res.ok) {
        setReplyText('');
        fetchChats(sId);
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      toast.error("Error sending message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 h-[85vh] md:h-[80vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors duration-300">
      <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-slate-800 dark:text-white flex items-center gap-2">
        <i className="bi bi-chat-square-text-fill text-blue-500 dark:text-blue-400"></i> Inspect User Conversations
      </h3>
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 flex-1 overflow-hidden">
        
        {/* Sidebar: Session List */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 pb-4 md:pb-0 md:pr-6 flex flex-col h-1/3 md:h-auto shrink-0 md:shrink">
          <button onClick={fetchSessions} className="mb-4 bg-indigo-600 text-white p-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 flex justify-center items-center gap-2 text-sm">
            <i className="bi bi-arrow-clockwise text-lg leading-none"></i> Refresh Sessions
          </button>
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
            {sessions.length === 0 ? (
              <p className="text-slate-500 text-sm text-center">No active sessions.</p>
            ) : (
              sessions.map((session) => (
                <div 
                  key={session.id || session.session_id || idx} 
                  onClick={() => setSelectedSession(session)}
                  className={`p-4 border rounded-2xl cursor-pointer hover:shadow-md transition-all group ${selectedSession && (selectedSession.id || selectedSession.session_id) === (session.id || session.session_id) ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500'}`}
                >
                  <div className={`text-sm font-bold truncate ${selectedSession && (selectedSession.id || selectedSession.session_id) === (session.id || session.session_id) ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
                    {session.human_takeover 
                      ? `Agent: ${session.agent_name || localStorage.getItem('saas_agent_name') || localStorage.getItem('sa_name') || 'Human Support'}`
                      : `Session: ${(session.id || session.session_id || 'Unknown').substring(0, 8)}...`}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(session.created_at || Date.now()).toLocaleTimeString()}
                    </div>
                    {session.human_takeover && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Human</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content: Chat View */}
        <div className="w-full md:w-2/3 md:pl-2 flex flex-col relative flex-1 min-h-0">
          {!selectedSession ? (
            <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 flex items-center justify-center border border-slate-100 dark:border-slate-800 mb-6 custom-scrollbar shadow-inner">
              <p className="text-center text-slate-400 dark:text-slate-500 font-medium">Select a session from the left panel to view its complete chat log history.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-lg">
                    {selectedSession.human_takeover ? (
                      <>Taken over by: <span className="font-mono text-sm font-normal text-slate-500">{selectedSession.agent_name || localStorage.getItem('saas_agent_name') || localStorage.getItem('sa_name') || 'Human Support'}</span></>
                    ) : (
                      <>Session ID: <span className="font-mono text-sm font-normal text-slate-500">{(selectedSession.id || selectedSession.session_id)}</span></>
                    )}
                  </h4>
                  <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${selectedSession.human_takeover ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                    <span className={`w-2 h-2 rounded-full ${selectedSession.human_takeover ? 'bg-amber-500' : 'bg-slate-400 dark:bg-slate-500'}`}></span>
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">{selectedSession.human_takeover ? 'Agent Managing' : 'AI Managing'}</span>
                  </div>
                </div>
                <button 
                  onClick={handleTakeover}
                  className={`px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all active:scale-95 ${selectedSession.human_takeover ? 'bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700' : 'bg-red-500 hover:bg-red-600 text-white hover:shadow-red-500/25'}`}
                >
                  {selectedSession.human_takeover ? 'Restore AI Control' : 'Take Over Chat'}
                </button>
              </div>
              
              <div ref={chatContainerRef} className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 overflow-y-auto border border-slate-100 dark:border-slate-800 mb-6 custom-scrollbar shadow-inner flex flex-col gap-4">
                {!Array.isArray(chats) || chats.length === 0 ? (
                  <p className="text-center text-slate-400 dark:text-slate-500 font-medium mt-10">No messages yet.</p>
                ) : (
                  chats.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
                      <div className={`text-xs font-bold mb-1 uppercase tracking-wider ${msg.role === 'user' ? 'text-slate-500' : msg.role === 'agent' ? 'text-amber-600' : 'text-blue-600'}`}>
                        {msg.role}
                      </div>
                      <div className={`p-3 rounded-2xl text-sm ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-sm' 
                          : msg.role === 'agent'
                            ? 'bg-amber-100 text-amber-900 border border-amber-200 rounded-tl-sm'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                      }`}>
                        {msg.message || msg.content || msg.text || ''}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedSession.human_takeover && (
                <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                  <input 
                    type="text" 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                    className="flex-1 p-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm" 
                    placeholder="Type your reply to the customer..." 
                  />
                  <button 
                    onClick={handleSendReply}
                    disabled={isSending || !replyText.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95 whitespace-nowrap disabled:opacity-50"
                  >
                    {isSending ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
