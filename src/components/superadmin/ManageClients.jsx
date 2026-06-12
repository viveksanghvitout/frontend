import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import BASE_API from '../../config';

export default function ManageClients() {
  const [clients, setClients] = useState([]);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showClientDetailModal, setShowClientDetailModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    subscription_plan: 'Basic'
  });

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('saas_superadmin_token');
      const res = await fetch(`${BASE_API}/superadmin/clients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('saas_superadmin_token');
      const res = await fetch(`${BASE_API}/superadmin/clients`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success("Client onboarded successfully!");
        setShowNewClientModal(false);
        setFormData({
          company_name: '',
          email: '',
          phone: '',
          website: '',
          industry: '',
          subscription_plan: 'Basic'
        });
        fetchClients();
      } else {
        const err = await res.json();
        toast.error(err.detail || "Failed to add client");
      }
    } catch (error) {
      toast.error("Server error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (clientId) => {
    if (!window.confirm("Toggle this client's access?")) return;
    try {
      const token = localStorage.getItem('saas_superadmin_token');
      const res = await fetch(`${BASE_API}/superadmin/clients/${clientId}/toggle`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Status toggled.");
        fetchClients();
      }
    } catch (e) {
      toast.error("Error toggling status");
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm("Delete this client? They will be moved to the deleted accounts list.")) return;
    try {
      const token = localStorage.getItem('saas_superadmin_token');
      const res = await fetch(`${BASE_API}/superadmin/clients/${clientId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Client moved to trash.");
        fetchClients();
      }
    } catch (e) {
      toast.error("Error deleting client");
    }
  };

  const openClientDetails = async (clientId) => {
    try {
      const token = localStorage.getItem('saas_superadmin_token');
      const res = await fetch(`${BASE_API}/superadmin/clients/${clientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedClient(data);
        setShowClientDetailModal(true);
      } else {
        toast.error("Failed to load details");
      }
    } catch (e) {
      toast.error("Error loading details");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 pb-6 border-b border-slate-200 dark:border-slate-800/50 gap-4 transition-colors duration-300">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 tracking-tight mb-2">Active Workspaces</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Manage billing, API access, and platform suspensions.</p>
        </div>
        
        <button 
          onClick={() => setShowNewClientModal(true)} 
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-1 hover:shadow-indigo-500/40 border border-indigo-400/20 active:scale-95"
        >
          + Onboard New Client
        </button>
      </div>

      <div className="bg-white dark:bg-slate-950/50 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm dark:shadow-2xl transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest transition-colors duration-300">
                <th className="p-5 font-bold">Business Name</th>
                <th className="p-5 font-bold">Plan</th>
                <th className="p-5 font-bold">Workspace API Key</th>
                <th className="p-5 font-bold">Status</th>
                <th className="p-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500 font-medium">No clients found.</td></tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="border-b border-slate-200 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="p-5 font-bold text-slate-800 dark:text-slate-200">{client.company_name}</td>
                    <td className="p-5">
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">{client.subscription_plan}</span>
                    </td>
                    <td className="p-5 font-mono text-xs text-indigo-600 dark:text-indigo-400">
                      {client.api_key.substring(0, 12)}...
                    </td>
                    <td className="p-5">
                      {client.is_suspended ? (
                        <span className="bg-red-50 text-red-600 border-red-200 text-xs font-bold px-3 py-1 rounded-full border">Suspended</span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-600 border-emerald-200 text-xs font-bold px-3 py-1 rounded-full border">Active</span>
                      )}
                    </td>
                    <td className="p-5 text-right flex justify-end gap-2">
                      <button onClick={() => openClientDetails(client.id)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg"><i className="bi bi-eye-fill"></i></button>
                      <button onClick={() => handleToggleStatus(client.id)} className="text-amber-500 hover:text-amber-700 bg-amber-50 p-2 rounded-lg"><i className="bi bi-power"></i></button>
                      <button onClick={() => handleDeleteClient(client.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg"><i className="bi bi-trash-fill"></i></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showNewClientModal && (
        <div className="fixed inset-0 bg-slate-900/20 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-3xl p-8 w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-200 transition-colors duration-300">
            <button onClick={() => setShowNewClientModal(false)} className="absolute top-6 right-6 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 p-2 rounded-full">✖</button>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-8">Onboard New Client</h2>
            <form onSubmit={handleAddClient} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Company Name *</label>
                <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} required className="w-full p-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-400 dark:placeholder-slate-600" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Admin Email *</label><input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" /></div>
                <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Phone Number *</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full p-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" /></div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Website URL</label>
                <input type="text" name="website" value={formData.website} onChange={handleChange} className="w-full p-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Industry</label><input type="text" name="industry" value={formData.industry} onChange={handleChange} className="w-full p-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" /></div>
                <div><label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Plan Tier</label>
                  <select name="subscription_plan" value={formData.subscription_plan} onChange={handleChange} className="w-full p-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-800 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer">
                    <option value="Basic" className="bg-white dark:bg-slate-900">Basic</option>
                    <option value="Pro" className="bg-white dark:bg-slate-900">Pro</option>
                    <option value="Enterprise" className="bg-white dark:bg-slate-900">Enterprise</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={isSaving} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl mt-6 transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 text-lg disabled:opacity-50">
                {isSaving ? 'Saving...' : 'Generate API Key & Save'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showClientDetailModal && (
        <div className="fixed inset-0 bg-slate-900/20 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-3xl p-8 w-full max-w-5xl shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-200 transition-colors duration-300">
            <button onClick={() => setShowClientDetailModal(false)} className="absolute top-6 right-6 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 p-2 rounded-full">✖</button>
            
{selectedClient && (
            <>
            <div className="mb-8 border-b border-slate-200 dark:border-slate-800/80 pb-6">
              <h2 className="text-4xl font-black text-slate-800 dark:text-white flex items-center gap-4 mb-3 tracking-tight">
                <span>{selectedClient.company_name}</span>
                {selectedClient.is_suspended ? (
                  <span className="text-xs px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 font-bold uppercase tracking-widest shadow-inner">Suspended</span>
                ) : (
                  <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-bold uppercase tracking-widest shadow-inner">Active</span>
                )}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">API Key: <code className="bg-slate-50 dark:bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 select-all font-mono shadow-inner text-sm">{selectedClient.api_key}</code></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-inner hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <h3 className="text-slate-700 dark:text-slate-300 font-bold mb-5 text-sm uppercase tracking-widest flex items-center gap-2"><i className="bi bi-clipboard2-data-fill text-indigo-500 dark:text-indigo-400"></i> Business Details</h3>
                <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex justify-between"><strong className="text-slate-800 dark:text-slate-500">Email</strong> <span className="text-slate-700 dark:text-slate-300">{selectedClient.email}</span></li>
                  <li className="flex justify-between"><strong className="text-slate-800 dark:text-slate-500">Phone</strong> <span className="text-slate-700 dark:text-slate-300">{selectedClient.phone}</span></li>
                  <li className="flex justify-between"><strong className="text-slate-800 dark:text-slate-500">Website</strong> <span className="text-slate-700 dark:text-slate-300">{selectedClient.website || 'N/A'}</span></li>
                  <li className="flex justify-between"><strong className="text-slate-800 dark:text-slate-500">Industry</strong> <span className="text-slate-700 dark:text-slate-300">{selectedClient.industry || 'N/A'}</span></li>
                  <li className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex justify-between"><strong className="text-slate-800 dark:text-slate-500">Plan</strong> <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded">{selectedClient.subscription_plan}</span></li>
                  <li className="flex justify-between"><strong className="text-slate-800 dark:text-slate-500">Joined</strong> <span className="text-slate-700 dark:text-slate-300">{new Date(selectedClient.created_at).toLocaleDateString()}</span></li>
                </ul>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-inner hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <h3 className="text-slate-700 dark:text-slate-300 font-bold mb-5 text-sm uppercase tracking-widest flex items-center gap-2"><i className="bi bi-robot text-indigo-500 dark:text-indigo-400"></i> Bot Configuration</h3>
                <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400 mb-6">
                  <li className="flex justify-between"><strong className="text-slate-800 dark:text-slate-500">Bot Name</strong> <span className="text-slate-700 dark:text-slate-300">{selectedClient.bot_name || 'N/A'}</span></li>
                  <li className="flex justify-between"><strong className="text-slate-800 dark:text-slate-500">Support Email</strong> <span className="text-slate-700 dark:text-slate-300">{selectedClient.support_email || 'N/A'}</span></li>
                </ul>
                <div>
                  <strong className="text-slate-500 text-xs uppercase tracking-widest block mb-2">Custom Bot Rules</strong>
                  <div className="bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs h-28 overflow-y-auto text-slate-500 dark:text-slate-400 shadow-inner custom-scrollbar">{selectedClient.custom_rules || 'No custom rules set.'}</div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-inner hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <h3 className="text-slate-700 dark:text-slate-300 font-bold mb-5 text-sm uppercase tracking-widest flex items-center gap-2"><i className="bi bi-bar-chart-fill text-indigo-500 dark:text-indigo-400"></i> Platform Usage</h3>
                <div className="space-y-4">
                  <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 p-5 rounded-2xl text-center shadow-inner">
                    <span className="block text-4xl font-black text-indigo-600 dark:text-indigo-400 mb-1">{selectedClient.agent_count || 0}</span>
                    <span className="text-xs text-indigo-500 dark:text-indigo-300/80 uppercase tracking-widest font-bold">Human Agents</span>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-5 rounded-2xl text-center shadow-inner">
                    <span className="block text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-1">{selectedClient.session_count || 0}</span>
                    <span className="text-xs text-emerald-500 dark:text-emerald-300/80 uppercase tracking-widest font-bold">Total Chat Sessions</span>
                  </div>
                </div>
              </div>
            </div>
            </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
