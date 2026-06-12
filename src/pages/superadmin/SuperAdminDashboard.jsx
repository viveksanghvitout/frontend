import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';
import useTheme from '../../hooks/useTheme';

const SuperAdminDashboard = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const token = localStorage.getItem('sa_token');
  const adminName = localStorage.getItem('sa_name') || 'Super Admin';

  useEffect(() => {
    if (!token) {
      navigate('/superadmin/login');
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("sa_token");
    localStorage.removeItem("sa_name");
    navigate('/superadmin/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 font-sans relative transition-colors duration-300">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-40 shadow-md transition-colors duration-300">
        <h1 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">Admin Portal</h1>
        <button 
          onClick={() => setIsMobileMenuOpen(true)} 
          className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 p-2 rounded-lg bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
        >
          <i className="bi bi-list text-2xl leading-none"></i>
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between mb-2 md:hidden">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Menu</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white p-1">
              <i className="bi bi-x-lg text-lg"></i>
            </button>
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Administration Portal</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{adminName} - Master Control Portal</p>
          </div>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          <NavLink 
            to="/superadmin/dashboard/clients" 
            className={({ isActive }) => `w-full text-left p-3 rounded-lg font-medium transition flex items-center gap-3 ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 shadow-inner' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300'}`}
          >
            <i className="bi bi-buildings-fill"></i> Manage Clients
          </NavLink>
          <NavLink 
            to="/superadmin/dashboard/settings" 
            className={({ isActive }) => `w-full text-left p-3 rounded-lg font-medium transition flex items-center gap-3 ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 shadow-inner' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300'}`}
          >
            <i className="bi bi-gear-fill"></i> Global Settings
          </NavLink>
          <NavLink 
            to="/superadmin/dashboard/deleted" 
            className={({ isActive }) => `w-full text-left p-3 rounded-lg font-medium transition flex items-center gap-3 ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 shadow-inner' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300'}`}
          >
            <i className="bi bi-trash-fill"></i> Deleted Accounts
          </NavLink>
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <button onClick={toggleTheme} className="w-full text-left p-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-300 transition font-medium flex items-center gap-3">
            {theme === 'dark' ? <><i className="bi bi-sun-fill text-yellow-400"></i> Light Mode</> : <><i className="bi bi-moon-stars-fill text-blue-500"></i> Dark Mode</>}
          </button>
          <button onClick={handleLogout} className="w-full text-left p-3 rounded-lg text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950 transition font-medium flex items-center gap-3">
            <i className="bi bi-box-arrow-right"></i> Secure Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-4 md:p-8 overflow-y-auto bg-gray-50 dark:bg-slate-900 relative pt-24 md:pt-8 w-full transition-colors duration-300">
        <Suspense fallback={
          <div className="flex h-full items-center justify-center pt-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        }>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
