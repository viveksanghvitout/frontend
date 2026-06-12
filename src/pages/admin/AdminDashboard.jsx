import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';
const BASE_API = import.meta.env.VITE_BASE_API || "http://bot.a4tool.com";
import useTheme from '../../hooks/useTheme';

const AdminDashboard = () => {
  const { theme, toggleTheme } = useTheme();
  const [tenantInfo, setTenantInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('saas_client_token');
  const role = localStorage.getItem('saas_user_role');
  const agentName = localStorage.getItem('saas_agent_name');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const fetchTenantInfo = async () => {
      try {
        const res = await fetch(`${BASE_API}/admin/tenant-info`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.ok && data.status === "success") {
          setTenantInfo(data.data);
        } else {
          toast.error("Session Expired");
          handleLogout();
        }
      } catch (error) {
        toast.error("Server Connection Error");
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenantInfo();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("saas_client_token");
    localStorage.removeItem("saas_user_role");
    localStorage.removeItem("saas_agent_id");
    localStorage.removeItem("saas_agent_name");
    navigate('/admin/login');
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-gray-50">Loading...</div>;
  }

  const isAdmin = role !== 'agent';
  
  const displayName = isAdmin ? (tenantInfo?.company_name || 'Unknown Business') : agentName;
  const displayInitial = displayName.charAt(0).toUpperCase();
  const customIcon = tenantInfo?.widget_icon_url || '';

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-800 dark:text-slate-200 font-sans relative transition-colors duration-300">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold overflow-hidden border border-slate-500">
            {isAdmin && customIcon ? (
              <img src={customIcon} className="w-full h-full object-cover" alt="Avatar" />
            ) : (
              displayInitial
            )}
          </div>
          <span className="text-white font-bold truncate max-w-[200px]">{displayName}</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)} 
          className="text-slate-300 hover:text-white p-2 rounded-lg bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <i className="bi bi-list text-2xl leading-none"></i>
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-gray-300 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-700 flex flex-col gap-3">
          <div className="flex items-center justify-between mb-2 md:hidden">
            <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Menu</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white p-1">
              <i className="bi bi-x-lg text-lg"></i>
            </button>
          </div>
          <div className="hidden md:flex items-center gap-3 p-3 rounded-lg shadow-inner">
            <div className="relative w-10 h-10 rounded-full flex-shrink-0 overflow-hidden bg-blue-600 flex items-center justify-center border border-slate-500">
              {isAdmin && customIcon ? (
                <img src={customIcon} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">{displayInitial}</div>
              )}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-lg font-bold text-white break-words leading-tight mt-0.5">{displayName}</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 flex flex-col">
          <NavLink to="/admin/dashboard/overview" className={({ isActive }) => `w-full text-left p-3 rounded transition flex items-center gap-3 ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}><i className="bi bi-bar-chart-fill"></i> Dashboard</NavLink>
          
          {isAdmin && (
            <>
              <NavLink to="/admin/dashboard/settings" className={({ isActive }) => `w-full text-left p-3 rounded transition flex items-center gap-3 ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}><i className="bi bi-gear-fill"></i> Bot Settings</NavLink>
              <NavLink to="/admin/dashboard/knowledge" className={({ isActive }) => `w-full text-left p-3 rounded transition flex items-center gap-3 ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}><i className="bi bi-journal-text"></i> Knowledge Base</NavLink>
              <NavLink to="/admin/dashboard/database" className={({ isActive }) => `w-full text-left p-3 rounded transition flex items-center gap-3 ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}><i className="bi bi-database-fill"></i> Database Auth</NavLink>
              <NavLink to="/admin/dashboard/team" className={({ isActive }) => `w-full text-left p-3 rounded transition flex items-center gap-3 ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}><i className="bi bi-people-fill"></i> Team Management</NavLink>
            </>
          )}

          <NavLink to="/admin/dashboard/history" className={({ isActive }) => `w-full text-left p-3 rounded transition flex items-center gap-3 ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}><i className="bi bi-chat-square-text-fill"></i> Chat Logs</NavLink>
          
          <div className="mt-auto pt-8 space-y-2">
            <button onClick={toggleTheme} className="w-full text-left p-3 rounded text-slate-400 hover:bg-slate-800 hover:text-white transition flex items-center gap-3">
              {theme === 'dark' ? <><i className="bi bi-sun-fill text-yellow-400"></i> Light Mode</> : <><i className="bi bi-moon-stars-fill text-blue-400"></i> Dark Mode</>}
            </button>
            <button onClick={handleLogout} className="w-full text-left p-3 rounded text-red-400 hover:bg-red-900 hover:text-white transition flex items-center gap-3"><i className="bi bi-box-arrow-right"></i> Logout</button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 min-w-0 p-4 md:p-8 h-screen overflow-y-auto pt-24 md:pt-8 w-full relative">
        <div className="max-w-5xl mx-auto w-full">
          <Suspense fallback={
            <div className="flex h-full items-center justify-center pt-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          }>
            <Outlet context={{ tenantInfo }} />
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
