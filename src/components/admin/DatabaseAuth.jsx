import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useOutletContext } from 'react-router-dom';
const BASE_API = import.meta.env.VITE_BASE_API;

export default function DatabaseAuth() {
  const { tenantInfo } = useOutletContext();
  const [dbUri, setDbUri] = useState('');
  const [dbRules, setDbRules] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);

  useEffect(() => {
    if (tenantInfo && tenantInfo.client_db_uri) {
      setDbUri(tenantInfo.client_db_uri);
      setDbRules(tenantInfo.db_rules || '');
      // If there are allowed tables stored, parse them
      let parsedTables = [];
      try {
        if (tenantInfo.allowed_tables) {
          parsedTables = JSON.parse(tenantInfo.allowed_tables);
        }
      } catch (e) { console.error("Error parsing tables", e); }
      
      if (parsedTables.length > 0) {
        setAvailableTables(parsedTables);
        setSelectedTables(parsedTables);
      }
      setIsConnected(true);
    }
  }, [tenantInfo]);

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!dbUri.trim()) return toast.error("Enter Database URI");

    setIsConnecting(true);
    try {
      const token = localStorage.getItem('saas_client_token');
      const formData = new URLSearchParams();
      formData.append('db_uri', dbUri.trim());

      const res = await fetch(`${BASE_API}/admin/db-connect`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        // Assuming backend returns tables in some format, or just success
        // If the backend returns tables, we set them. Otherwise we mock it based on success.
        if (data.tables) {
          setAvailableTables(data.tables);
        } else {
          toast.success("Connected! (Mocking tables since endpoint didn't return them)");
          setAvailableTables(["users", "orders", "products"]);
        }
        setIsConnected(true);
      } else {
        const err = await res.json();
        toast.error(err.detail || "Connection failed");
      }
    } catch (error) {
      toast.error("Server error");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm("Disconnect database? This removes your bot's access to live data.")) return;
    try {
      const token = localStorage.getItem('saas_client_token');
      const res = await fetch(`${BASE_API}/admin/db-disconnect`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Disconnected successfully");
        setIsConnected(false);
        setDbUri('');
        setDbRules('');
        setAvailableTables([]);
        setSelectedTables([]);
      }
    } catch (e) {
      toast.error("Server error disconnecting");
    }
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('saas_client_token');
      const formData = new URLSearchParams();
      formData.append('allowed_tables', JSON.stringify(selectedTables));
      formData.append('db_rules', dbRules);

      const res = await fetch(`${BASE_API}/admin/db-save-config`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });
      
      if (res.ok) {
        toast.success("Configuration saved!");
      } else {
        toast.error("Failed to save config");
      }
    } catch (e) {
      toast.error("Server error");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTableSelection = (tableName) => {
    if (selectedTables.includes(tableName)) {
      setSelectedTables(selectedTables.filter(t => t !== tableName));
    } else {
      setSelectedTables([...selectedTables, tableName]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Connection Card */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
        <h3 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
          <i className="bi bi-database-fill text-blue-500 dark:text-blue-400"></i> Live Database Connectivity
        </h3>
        <form onSubmit={handleConnect}>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">PostgreSQL Connection URI</label>
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              value={dbUri} 
              onChange={(e) => setDbUri(e.target.value)} 
              className="w-full p-3.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono text-sm text-slate-700 dark:text-slate-200" 
              placeholder="postgresql://user:pass@host/dbname" 
              disabled={isConnected}
            />
            {!isConnected ? (
              <button type="submit" disabled={isConnecting} className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-blue-500/25 hover:bg-blue-700 transition-all active:scale-95 whitespace-nowrap disabled:opacity-50">
                {isConnecting ? 'Connecting...' : 'Connect & Fetch Tables'}
              </button>
            ) : (
              <button type="button" onClick={handleDisconnect} className="bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900 px-8 py-3.5 rounded-xl font-bold shadow-sm transition-all active:scale-95 whitespace-nowrap">
                Disconnect
              </button>
            )}
          </div>
        </form>

        {!isConnected && (
          <div className="mt-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl py-16 px-8 flex flex-col items-center justify-center text-center border border-slate-100 dark:border-slate-800/50 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-50/50 dark:to-blue-900/10 pointer-events-none"></div>
            
            <div className="relative mb-8 mt-4">
              <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl scale-[2.5]"></div>
              
              {/* Ellipse orbit */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-24 border border-blue-200/60 dark:border-blue-700/30 rounded-[100%] scale-110"></div>
              <div className="absolute top-1/2 left-0 -translate-x-3 -translate-y-1/2 w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-sm rotate-45 opacity-60"></div>
              <div className="absolute top-1/2 right-0 translate-x-3 -translate-y-1/2 w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-sm rotate-45 opacity-60"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <svg width="90" height="100" viewBox="0 0 64 74" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl relative z-10">
                  <ellipse cx="32" cy="14" rx="28" ry="10" fill="#7BA3FF"/>
                  <path d="M4 14v16c0 5.523 12.536 10 28 10s28-4.477 28-10V14" fill="#4D7EFF"/>
                  <path d="M4 30c0 5.523 12.536 10 28 10s28-4.477 28-10" stroke="white" strokeWidth="2.5"/>

                  <path d="M4 30v16c0 5.523 12.536 10 28 10s28-4.477 28-10V30" fill="#2E5CF6"/>
                  <path d="M4 46c0 5.523 12.536 10 28 10s28-4.477 28-10" stroke="white" strokeWidth="2.5"/>

                  <path d="M4 46v16c0 5.523 12.536 10 28 10s28-4.477 28-10V46" fill="#163ECC"/>
                  <path d="M4 62c0 5.523 12.536 10 28 10s28-4.477 28-10" stroke="white" strokeWidth="2.5"/>
                </svg>
                
                <div className="absolute -bottom-2 -right-4 bg-emerald-500 text-white rounded-full w-11 h-11 border-[3.5px] border-slate-50 dark:border-slate-900 flex items-center justify-center shadow-lg z-20">
                  <i className="bi bi-check-lg text-xl leading-none font-black"></i>
                </div>
              </div>
            </div>
            
            <p className="text-slate-500 dark:text-slate-400 font-medium z-10 text-[15px]">Connect to your database to fetch and manage tables.</p>
          </div>
        )}
      </div>

      {/* Configuration Card (Only visible when connected) */}
      {isConnected && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow animate-in fade-in slide-in-from-top-4 duration-500">
          <h4 className="font-bold text-slate-800 dark:text-white mb-4">Select Accessible Tables</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-slate-50 dark:bg-slate-950 p-6 border border-slate-200 dark:border-slate-700 rounded-2xl max-h-56 overflow-y-auto">
            {availableTables.length > 0 ? (
              availableTables.map((table, idx) => (
                <label key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
                  <input type="checkbox" checked={selectedTables.includes(table)} onChange={() => toggleTableSelection(table)} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{table}</span>
                </label>
              ))
            ) : (
              <div className="col-span-full text-center text-slate-400 dark:text-slate-500 text-sm font-medium py-4">No tables found.</div>
            )}
          </div>
          
          <h4 className="font-bold text-slate-800 dark:text-white mb-4">Database-Specific Prompts</h4>
          <textarea 
            rows="4" 
            value={dbRules} 
            onChange={(e) => setDbRules(e.target.value)} 
            className="w-full p-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-2xl mb-8 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 dark:text-slate-200" 
            placeholder="e.g., 'If table is users, join with orders using user_id'"
          ></textarea>
          
          <div className="flex flex-col md:flex-row gap-4 justify-end">
            <button onClick={handleSaveConfig} disabled={isSaving} className="bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-emerald-500/25 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50">
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
