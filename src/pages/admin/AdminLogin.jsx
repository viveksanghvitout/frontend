import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
const BASE_API = import.meta.env.VITE_BASE_API || "http://bot.a4tool.com";
import useTheme from '../../hooks/useTheme';

const AdminLogin = () => {
  const [view, setView] = useState('admin'); // 'admin' or 'agent'
  const [step, setStep] = useState(1); // 1 for email, 2 for OTP (admin only)
  
  // Admin states
  const [adminEmail, setAdminEmail] = useState('');
  const [adminOtp, setAdminOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Agent states
  const [agentEmail, setAgentEmail] = useState('');
  const [agentPassword, setAgentPassword] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('saas_client_token');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const switchLoginView = (newView) => {
    setView(newView);
    setStep(1);
    setAdminEmail('');
    setAdminOtp('');
    setAgentEmail('');
    setAgentPassword('');
  };

  const handleAdminSendOTP = async (e) => {
    e.preventDefault();
    if (!adminEmail.trim()) {
      return toast.error("Enter Admin Email");
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_API}/client/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail.trim() })
      });
      const data = await res.json();

      if (res.ok && data.status === "success") {
        toast.success("OTP sent to your email!");
        setStep(2);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (e) {
      toast.error("Server Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminVerifyOTP = async (e) => {
    e.preventDefault();
    if (!adminOtp.trim()) {
      return toast.error("Enter OTP code");
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_API}/client/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail.trim(), otp_code: adminOtp.trim() })
      });
      const data = await res.json();

      if (res.ok && data.status === "success") {
        localStorage.setItem("saas_client_token", data.access_token);
        localStorage.setItem("saas_user_role", "client_admin");
        navigate('/admin/dashboard');
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (e) {
      toast.error("Server Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgentLogin = async (e) => {
    e.preventDefault();
    if (!agentEmail.trim() || !agentPassword) {
      return toast.error("Enter email and password");
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('email', agentEmail.trim());
    formData.append('password', agentPassword);

    try {
      const res = await fetch(`${BASE_API}/agent/login`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (res.ok && data.status === "success") {
        localStorage.setItem("saas_client_token", data.access_token);
        localStorage.setItem("saas_user_role", data.role);
        localStorage.setItem("saas_agent_id", data.agent_id);
        localStorage.setItem("saas_agent_name", data.name);
        navigate('/admin/dashboard');
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (error) {
      toast.error("Server Error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-950 font-sans text-gray-800 dark:text-slate-200 transition-colors duration-300 relative">
      <button 
        onClick={toggleTheme} 
        className="absolute top-6 right-6 p-3 rounded-full bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-md hover:shadow-lg transition flex items-center justify-center"
      >
        {theme === 'dark' ? <i className="bi bi-sun-fill text-xl leading-none text-yellow-400"></i> : <i className="bi bi-moon-stars-fill text-xl leading-none text-blue-500"></i>}
      </button>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-lg w-96 relative overflow-hidden transition-colors duration-300 border border-transparent dark:border-slate-800">
        <h2 className="text-2xl font-bold text-center text-blue-600 dark:text-blue-400 mb-6">Manage Your Bot</h2>

        <div className="flex bg-gray-100 dark:bg-slate-950 rounded-lg p-1 mb-6 transition-colors duration-300">
          <button
            onClick={() => switchLoginView('admin')}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition ${view === 'admin' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300'}`}
          >
            Admin Login
          </button>
          <button
            onClick={() => switchLoginView('agent')}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition ${view === 'agent' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300'}`}
          >
            Support Login
          </button>
        </div>

        {view === 'admin' ? (
          <div>
            {step === 1 ? (
              <form onSubmit={handleAdminSendOTP}>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Admin Email</label>
                <input
                  type="email"
                  placeholder="admin@company.com"
                  className="w-full p-3 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-lg mb-4 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 shadow-lg hover:shadow-blue-500/25"
                >
                  {isLoading ? 'Sending Code...' : 'Send Login OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleAdminVerifyOTP}>
                <label className="block text-xs font-bold text-green-600 dark:text-green-400 mb-1 uppercase tracking-wide">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  placeholder="123456"
                  className="w-full p-3 border border-green-300 dark:border-green-500/50 bg-green-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-center tracking-widest font-mono text-xl rounded-lg mb-4 outline-none focus:border-green-500 transition-colors"
                  value={adminOtp}
                  onChange={(e) => setAdminOtp(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 shadow-lg hover:shadow-green-500/25"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Access Workspace'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-xs text-gray-500 dark:text-slate-400 mt-4 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  ← Use a different email
                </button>
              </form>
            )}
          </div>
        ) : (
          <form onSubmit={handleAgentLogin}>
            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Agent Email</label>
            <input
              type="email"
              placeholder="you@company.com"
              className="w-full p-3 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-lg mb-4 outline-none focus:border-blue-500 transition-colors"
              value={agentEmail}
              onChange={(e) => setAgentEmail(e.target.value)}
              required
            />

            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-3 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-lg mb-4 outline-none focus:border-blue-500 transition-colors"
              value={agentPassword}
              onChange={(e) => setAgentPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 shadow-lg hover:shadow-blue-500/25"
            >
              {isLoading ? 'Authenticating...' : 'Login to Chat Dashboard'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
