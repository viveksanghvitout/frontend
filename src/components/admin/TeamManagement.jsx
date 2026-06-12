import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
const BASE_API = import.meta.env.VITE_BASE_API;

export default function TeamManagement() {
  const [agents, setAgents] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    startTime: '09:00',
    endTime: '17:00',
    is_active: 'true'
  });

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem('saas_client_token');
      const res = await fetch(`${BASE_API}/admin/agents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveAgent = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      role: 'agent',
      phone_number: formData.phone_number,
      chat_hours: `${formData.startTime} - ${formData.endTime}`,
      is_active: formData.is_active === 'true'
    };

    try {
      const token = localStorage.getItem('saas_client_token');
      const res = await fetch(`${BASE_API}/admin/agents`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        if (editingId) {
          toast.info("Backend update API pending. Please delete and recreate for now.");
          setEditingId(null);
        } else {
          toast.success("Agent created! They will receive an email with their auto-generated password.");
        }
        setFormData({
          name: '',
          email: '',
          phone_number: '',
          startTime: '09:00',
          endTime: '17:00',
          is_active: 'true'
        });
        fetchAgents();
      } else {
        const err = await res.json();
        toast.error(err.detail || "Failed to process agent");
      }
    } catch (error) {
      toast.error("Server error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (agent) => {
    let start = '09:00';
    let end = '17:00';
    if (agent.chat_hours && agent.chat_hours.includes(' - ')) {
      [start, end] = agent.chat_hours.split(' - ');
    }
    setFormData({
      name: agent.name || '',
      email: agent.email || '',
      phone_number: agent.phone_number || '',
      startTime: start,
      endTime: end,
      is_active: agent.is_active ? 'true' : 'false'
    });
    setEditingId(agent.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      phone_number: '',
      startTime: '09:00',
      endTime: '17:00',
      is_active: 'true'
    });
  };

  const handleDelete = async (agentId) => {
    if (!window.confirm("Delete this agent?")) return;
    try {
      const token = localStorage.getItem('saas_client_token');
      const res = await fetch(`${BASE_API}/admin/agents/${agentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Agent deleted.");
        fetchAgents();
      }
    } catch (error) {
      toast.error("Error deleting agent");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow duration-300">
        <h3 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
          {editingId ? (
            <><i className="bi bi-pencil-square text-indigo-500 dark:text-indigo-400"></i> Edit Team Member</>
          ) : (
            <><i className="bi bi-person-plus-fill text-indigo-500 dark:text-indigo-400"></i> Add New Team Member</>
          )}
        </h3>
        <form onSubmit={handleSaveAgent} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div>
            <label className="block text-sm mb-2 font-bold text-slate-700 dark:text-slate-300">Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-700 dark:text-slate-200 font-medium" required />
          </div>
          <div>
            <label className="block text-sm mb-2 font-bold text-slate-700 dark:text-slate-300">Login Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-700 dark:text-slate-200 font-medium" required />
          </div>
          <div>
            <label className="block text-sm mb-2 font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
            <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-700 dark:text-slate-200 font-medium" />
          </div>
          <div>
            <label className="block text-sm mb-2 font-bold text-slate-700 dark:text-slate-300">Chat Hours</label>
            <div className="flex items-center gap-3">
              <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-700 dark:text-slate-200 font-medium" />
              <span className="text-slate-400 dark:text-slate-500 font-bold uppercase text-xs">to</span>
              <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-700 dark:text-slate-200 font-medium" />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-2 font-bold text-slate-700 dark:text-slate-300">Account Status</label>
            <select name="is_active" value={formData.is_active} onChange={handleChange} className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-700 dark:text-slate-200 font-medium">
              <option value="true">Active (Can Login & Chat)</option>
              <option value="false">Inactive (Blocked)</option>
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end mt-4 gap-4">
            {editingId && (
              <button type="button" onClick={cancelEdit} className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-8 py-3.5 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95">
                Cancel
              </button>
            )}
            <button type="submit" disabled={isSaving} className="bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 disabled:opacity-50">
              {isSaving ? 'Processing...' : (editingId ? 'Update Agent' : 'Create Agent')}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow duration-300">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Team Members</h3>
          <button onClick={fetchAgents} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 flex items-center gap-2 text-sm"><i className="bi bi-arrow-clockwise text-lg leading-none"></i> Refresh List</button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
          <table className="w-full text-left border-collapse bg-white dark:bg-slate-900">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm tracking-wide">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Email / Contact</th>
                <th className="p-4 font-semibold">Schedule</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400 dark:text-slate-500 font-medium">No agents found.</td></tr>
              ) : (
                agents.map((agent) => (
                  <tr key={agent.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{agent.name}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">
                      <div className="text-sm">{agent.email}</div>
                      <div className="text-xs text-slate-400 mt-1">{agent.phone_number}</div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 text-sm font-medium">{agent.chat_hours}</td>
                    <td className="p-4">
                      {agent.is_active ? (
                        <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50">Active</span>
                      ) : (
                        <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full border border-red-200 dark:border-red-800/50">Inactive</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(agent)} className="text-blue-500 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/50 p-2.5 rounded-xl transition-colors"><i className="bi bi-pencil-fill"></i></button>
                        <button onClick={() => handleDelete(agent.id)} className="text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-950/50 p-2.5 rounded-xl transition-colors"><i className="bi bi-trash-fill"></i></button>
                      </div>
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
