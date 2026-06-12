import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BASE_API from '../../config';

export default function DashboardOverview() {
  const [stats, setStats] = useState({ total_sessions: 0, total_messages: 0 });
  const [liveSessions, setLiveSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('saas_client_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch Stats
      const statsRes = await fetch(`${BASE_API}/admin/dashboard-stats`, { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data || statsData || { total_sessions: 0, total_messages: 0 });
      }

      // Fetch Live Sessions
      const sessionsRes = await fetch(`${BASE_API}/admin/live-sessions`, { headers });
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        let sessionsList = [];
        if (sessionsData && sessionsData.sessions && Array.isArray(sessionsData.sessions)) {
          sessionsList = sessionsData.sessions;
        } else if (sessionsData && sessionsData.data && Array.isArray(sessionsData.data)) {
          sessionsList = sessionsData.data;
        } else if (Array.isArray(sessionsData)) {
          sessionsList = sessionsData;
        }
        setLiveSessions(sessionsList);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col gap-2">
        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Analytics <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Overview</span></h2>
        <p className="text-base text-slate-500 dark:text-slate-400 font-medium">Real-time performance metrics for your AI agent.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group">
          <div>
            <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Total Chat Sessions</p>
            <h3 className="text-5xl font-black text-slate-800 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 dark:group-hover:from-blue-400 dark:group-hover:to-indigo-400 transition-all duration-300" id="stat-sessions">{stats.total_sessions || stats.sessions || stats.total_chats || stats.chats || 0}</h3>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center text-4xl shadow-inner border border-blue-100/50 group-hover:scale-110 transition-transform duration-300">
            <i className="bi bi-people-fill"></i>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group">
          <div>
            <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Messages Processed</p>
            <h3 className="text-5xl font-black text-slate-800 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-500 group-hover:to-teal-500 dark:group-hover:from-emerald-400 dark:group-hover:to-teal-400 transition-all duration-300" id="stat-messages">{stats.total_messages || stats.messages || stats.message_count || 0}</h3>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-500 flex items-center justify-center text-4xl shadow-inner border border-emerald-100/50 group-hover:scale-110 transition-transform duration-300">
            <i className="bi bi-chat-dots-fill"></i>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 mt-8 transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            Live Active Chats
          </h3>
          <button onClick={fetchDashboardData} disabled={isLoading} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 flex items-center gap-2 text-sm disabled:opacity-50">
            <i className={`bi bi-arrow-clockwise text-lg leading-none ${isLoading ? 'animate-spin' : ''}`}></i> Refresh
          </button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
          <table className="w-full text-left border-collapse bg-white dark:bg-slate-900">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm tracking-wide">
                <th className="p-4 font-semibold">Session ID</th>
                <th className="p-4 font-semibold">Started</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody id="live-sessions-table">
              {isLoading ? (
                <tr><td colSpan="4" className="p-8 text-center text-slate-400 text-sm font-medium">Loading live sessions...</td></tr>
              ) : liveSessions.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-slate-400 text-sm font-medium">No live sessions found.</td></tr>
              ) : (
                liveSessions.map((session, idx) => (
                  <tr key={session.id || session.session_id || idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-mono text-sm text-slate-600 dark:text-slate-300">
                      {session.human_takeover 
                        ? <span className="font-sans font-semibold text-amber-600 dark:text-amber-500">Agent: {session.agent_name || localStorage.getItem('saas_agent_name') || localStorage.getItem('sa_name') || 'Human Support'}</span>
                        : (session.id || session.session_id || 'Unknown').substring(0, 12) + '...'}
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{new Date(session.created_at || Date.now()).toLocaleString()}</td>
                    <td className="p-4">
                      {session.human_takeover ? (
                         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 text-xs text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider">
                           Agent
                         </span>
                      ) : (
                         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">
                           AI Bot
                         </span>
                      )}
                    </td>
                    <td className="p-4">
                      <Link to="/admin/dashboard/history" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-bold flex items-center gap-1 transition-colors">
                        View Chat <i className="bi bi-arrow-right-short text-lg leading-none"></i>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
