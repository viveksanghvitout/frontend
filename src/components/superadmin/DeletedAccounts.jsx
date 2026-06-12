import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import BASE_API from '../../config';

export default function DeletedAccounts() {
  const [deletedClients, setDeletedClients] = useState([]);

  const fetchDeletedClients = async () => {
    try {
      const token = localStorage.getItem('saas_superadmin_token');
      const res = await fetch(`${BASE_API}/superadmin/clients/deleted`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDeletedClients(data.deleted_clients || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDeletedClients();
  }, []);

  const handleRecover = async (clientId) => {
    if (!window.confirm("Recover this client account? It will become active again.")) return;
    try {
      const token = localStorage.getItem('saas_superadmin_token');
      const res = await fetch(`${BASE_API}/superadmin/clients/${clientId}/recover`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Account recovered successfully.");
        fetchDeletedClients();
      } else {
        toast.error("Failed to recover account.");
      }
    } catch (e) {
      toast.error("Error recovering account.");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 pb-6 border-b border-slate-200 dark:border-slate-800/50 gap-4 transition-colors duration-300">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-red-400 dark:via-orange-400 dark:to-red-400 tracking-tight mb-2 transition-colors">Deleted Accounts Archive</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Review historical records or fully recover past accounts back to active state.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-950/50 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm dark:shadow-2xl transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest transition-colors duration-300">
                <th className="p-5 font-bold">Business Name</th>
                <th className="p-5 font-bold">Plan</th>
                <th className="p-5 font-bold">Workspace API Key</th>
                <th className="p-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deletedClients.length === 0 ? (
               <tr><td colSpan="4" className="p-8 text-center text-slate-500 font-medium italic">No deleted accounts found in the archive history.</td></tr>
              ) : (
                deletedClients.map(client => (
                  <tr key={client.id} className="border-b border-slate-200 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="p-5 font-bold text-slate-800 dark:text-slate-200">{client.company_name}</td>
                    <td className="p-5">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{client.subscription_plan}</span>
                    </td>
                    <td className="p-5 font-mono text-xs text-indigo-600 dark:text-indigo-400">
                      {client.api_key.substring(0, 12)}...
                    </td>
                    <td className="p-5 text-right flex justify-end gap-2">
                      <button onClick={() => handleRecover(client.id)} className="text-emerald-500 hover:text-emerald-700 bg-emerald-50 p-2 px-4 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2"><i className="bi bi-arrow-counterclockwise"></i> Recover Account</button>
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
