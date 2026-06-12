import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import BASE_API from '../../config';

export default function GlobalSettings() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    gemini_api_key: '',
    smtp_server: '',
    smtp_email: '',
    smtp_password: ''
  });

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('saas_superadmin_token');
      const res = await fetch(`${BASE_API}/superadmin/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFormData({
          gemini_api_key: data.gemini_api_key || '',
          smtp_server: data.smtp_server || '',
          smtp_email: data.smtp_email || '',
          smtp_password: data.smtp_password || ''
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem('saas_superadmin_token');
      const payload = new URLSearchParams();
      payload.append('gemini_api_key', formData.gemini_api_key);
      payload.append('smtp_server', formData.smtp_server);
      payload.append('smtp_email', formData.smtp_email);
      payload.append('smtp_password', formData.smtp_password);

      const res = await fetch(`${BASE_API}/superadmin/settings`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: payload
      });

      if (res.ok) {
        toast.success("Global settings saved successfully!");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (e) {
      toast.error("Server error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto">
      <div className="mb-8 pb-6 border-b border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
        <h2 className="text-4xl font-extrabold text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-slate-200 dark:to-slate-400 tracking-tight mb-2">Global AI Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Configure master fallback keys and platform-wide notification services.</p>
      </div>
      
      <div className="bg-white dark:bg-slate-950/50 backdrop-blur-md p-8 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-2xl transition-colors duration-300">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-3"><i className="bi bi-key-fill text-indigo-500 dark:text-indigo-400"></i> Master Keys</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">If a client does not provide their own API key, the platform will fall back to using this master key to generate their chatbot responses.</p>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Gemini API Key (Global)</label>
            <input type="password" name="gemini_api_key" value={formData.gemini_api_key} onChange={handleChange} placeholder="sk-..." className="w-full p-4 bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono shadow-inner" />
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/50 mt-8 transition-colors duration-300">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-3"><i className="bi bi-envelope-fill text-emerald-500 dark:text-emerald-400"></i> Email Notifications (SMTP)</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">Configure the master email account used to send platform alerts and welcome emails to clients.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">SMTP Server (Host:Port)</label>
                <input type="text" name="smtp_server" value={formData.smtp_server} onChange={handleChange} placeholder="e.g., smtp.gmail.com:587" className="w-full p-4 bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Sender Email</label>
                <input type="email" name="smtp_email" value={formData.smtp_email} onChange={handleChange} placeholder="notifications@myplatform.com" className="w-full p-4 bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">SMTP Password</label>
                <div className="relative group">
                  <input type={showPassword ? "text" : "password"} name="smtp_password" value={formData.smtp_password} onChange={handleChange} placeholder="••••••••" className="w-full p-4 bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner pr-12" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-indigo-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-6 flex justify-end">
            <button type="submit" disabled={isSaving} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-1 active:scale-95 text-lg disabled:opacity-50">
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
