import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
const BASE_API = import.meta.env.VITE_BASE_API || "http://bot.a4tool.com";
import useTheme from '../../hooks/useTheme';

const SuperAdminLogin = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('sa_token');
    if (token) {
      navigate('/superadmin/dashboard');
    }
  }, [navigate]);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error("Please enter both email and password.");
    }

    setIsLoading(true);
    try {
      const loginResponse = await fetch(`${BASE_API}/superadmin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const loginData = await loginResponse.json();
      
      if (!loginResponse.ok || loginData.status !== "success") {
        toast.error(loginData.message || "Invalid email or password");
        setIsLoading(false);
        return; 
      }

      const otpResponse = await fetch(`${BASE_API}/superadmin/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }) 
      });
      const otpData = await otpResponse.json();
      
      if (otpResponse.ok && otpData.status === "success") {
        setStep(2);
      } else {
        toast.error(otpData.message || "Failed to send OTP. Please try again.");
      }
    } catch (err) {
      toast.error("Server connection failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_API}/superadmin/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp_code: otp })
      });
      const data = await response.json();
      
      if (response.ok && data.status === "success") {
        localStorage.setItem("sa_token", data.access_token);
        if (data.name) localStorage.setItem("sa_name", data.name);
        navigate('/superadmin/dashboard');
      } else {
        toast.error(data.message || "Invalid OTP Code");
      }
    } catch (err) {
      toast.error("Server connection failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const cancelLogin = () => {
    setStep(1);
    setOtp('');
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-slate-950 font-sans transition-colors duration-300 relative">
      <button 
        onClick={toggleTheme} 
        className="absolute top-6 right-6 p-3 rounded-full bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-md hover:shadow-lg transition flex items-center justify-center border border-slate-200 dark:border-transparent"
      >
        {theme === 'dark' ? <i className="bi bi-sun-fill text-xl leading-none text-yellow-400"></i> : <i className="bi bi-moon-stars-fill text-xl leading-none text-blue-500"></i>}
      </button>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-96 relative transition-colors duration-300">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">System Administration</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Super Admin Access Only</p>
        </div>
        
        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wide mb-1">Master Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wide mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white outline-none focus:border-indigo-500 transition"
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg transition disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Authenticate'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wide mb-1 text-center">Enter 6-Digit OTP</label>
              <input 
                type="text" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required 
                placeholder="123456" 
                className="w-full p-3 bg-emerald-50 dark:bg-slate-800 border border-emerald-300 dark:border-emerald-500/50 rounded-lg text-slate-800 dark:text-white text-center font-mono text-2xl tracking-widest outline-none focus:border-emerald-500 transition"
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow-lg transition disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <div className="text-center">
              <button 
                type="button" 
                onClick={cancelLogin} 
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
              >
                ← Back to Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SuperAdminLogin;
