import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useOutletContext } from 'react-router-dom';
const BASE_API = import.meta.env.VITE_BASE_API;

export default function BotSettings() {
  const { tenantInfo } = useOutletContext();
  const [embedMethod, setEmbedMethod] = useState('script');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    botName: '',
    supportEmail: '',
    customRules: '',
    primaryColor: '#2563eb',
    widgetPosition: 'right',
    widgetIconUrl: '',
    apiKey: ''
  });

  useEffect(() => {
    if (tenantInfo) {
      setFormData({
        companyName: tenantInfo.company_name || '',
        botName: tenantInfo.bot_name || '',
        supportEmail: tenantInfo.support_email || '',
        customRules: tenantInfo.custom_rules || '',
        primaryColor: tenantInfo.primary_color || '#2563eb',
        widgetPosition: tenantInfo.widget_position || 'right',
        widgetIconUrl: tenantInfo.widget_icon_url || '',
        apiKey: tenantInfo.api_key || ''
      });
    }
  }, [tenantInfo]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('saas_client_token');
      const urlEncodedData = new URLSearchParams();
      urlEncodedData.append('company_name', formData.companyName);
      urlEncodedData.append('bot_name', formData.botName);
      urlEncodedData.append('support_email', formData.supportEmail);
      urlEncodedData.append('custom_rules', formData.customRules);
      urlEncodedData.append('primary_color', formData.primaryColor);
      urlEncodedData.append('widget_position', formData.widgetPosition);
      urlEncodedData.append('widget_icon_url', formData.widgetIconUrl);

      const res = await fetch(`${BASE_API}/admin/settings`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: urlEncodedData
      });

      if (res.ok) {
        toast.success("Settings saved successfully!");
      } else {
        const err = await res.json();
        toast.error(err.detail || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Server error while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyCode = () => {
    const code = embedMethod === 'script' 
      ? `<script\n        type="module"\n        src="http://bot.a4tool.com/widget-file"\n        data-api-key="${formData.apiKey}">\n</script>`
      : `<iframe\n        src="http://bot.a4tool.com/widget-window?apiKey=${formData.apiKey}"\n        width="400"\n        height="600"\n        frameborder="0">\n</iframe>`;
    
    navigator.clipboard.writeText(code).then(() => {
      toast.success("Code copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy code");
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 mb-8 hover:shadow-md transition-shadow duration-300">
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <i className="bi bi-gear-fill text-blue-600 dark:text-blue-400"></i> Workspace Configuration
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Company Name</label>
              <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 dark:text-slate-200" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Bot Name</label>
              <input type="text" name="botName" value={formData.botName} onChange={handleChange} placeholder="e.g. Support Assistant" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 dark:text-slate-200" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Support Email</label>
              <input type="text" name="supportEmail" value={formData.supportEmail} onChange={handleChange} className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 dark:text-slate-200" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Core Personality Prompt</label>
            <textarea name="customRules" value={formData.customRules} onChange={handleChange} rows="4" className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 dark:text-slate-200" placeholder="Define behavioral rules, tone, and specific instructions..."></textarea>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow duration-300">
          <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white flex items-center gap-2"><i className="bi bi-palette-fill text-blue-600 dark:text-blue-400"></i> Design & Embed</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">Design your chat experience and copy the embed code to go live.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">API Key</label>
              <div className="relative group">
                <input type={showApiKey ? "text" : "password"} readOnly value={formData.apiKey} className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 pr-12 font-mono text-sm text-slate-600 dark:text-slate-300 transition-all" />
                <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-4 top-3.5 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-lg">
                  <i className={`bi ${showApiKey ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Brand Theme Color</label>
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950 p-2 border border-slate-200 dark:border-slate-700 rounded-xl w-fit pr-6">
                <input type="color" name="primaryColor" value={formData.primaryColor} onChange={handleChange} className="p-0 border-0 rounded-lg w-10 h-10 cursor-pointer shadow-sm hover:scale-105 transition-transform bg-transparent" />
                <span className="text-sm font-mono font-bold text-slate-600 dark:text-slate-300">{formData.primaryColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Widget Position</label>
              <select name="widgetPosition" value={formData.widgetPosition} onChange={handleChange} className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-700 dark:text-slate-200 font-medium transition-all">
                <option value="right">Bottom Right</option>
                <option value="left">Bottom Left</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Custom Icon URL <span className="font-normal text-slate-400 dark:text-slate-500">(Optional)</span></label>
              <input type="text" name="widgetIconUrl" value={formData.widgetIconUrl} onChange={handleChange} placeholder="https://yourdomain.com/logo.png" className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-700 dark:text-slate-200 font-medium transition-all" />
            </div> 
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 mb-2 tracking-wider uppercase">Embed Method</label>
            <div className="inline-flex bg-slate-100 dark:bg-slate-950 rounded-xl p-1.5 shadow-inner border border-slate-200 dark:border-slate-800">
              <button 
                type="button" 
                onClick={() => setEmbedMethod('script')}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${embedMethod === 'script' ? 'bg-white dark:bg-slate-800 shadow-md text-blue-700 dark:text-blue-400 border border-slate-100 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                &lt;script&gt; Tag
              </button>
              <button 
                type="button" 
                onClick={() => setEmbedMethod('iframe')}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${embedMethod === 'iframe' ? 'bg-white dark:bg-slate-800 shadow-md text-blue-700 dark:text-blue-400 border border-slate-100 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                &lt;iframe&gt;
              </button>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">Script = floating button on your site. Iframe = full chat window inside a box.</p>
          </div>

          <div className="relative bg-[#0f172a] rounded-xl p-6 border border-slate-800 shadow-inner group">
            <button type="button" onClick={handleCopyCode} className="absolute top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-4 py-2 rounded-md transition-colors border border-blue-500 shadow-sm active:scale-95">
              Copy Code
            </button>
            <pre className="overflow-x-auto"><code className="text-[#10b981] text-[15px] font-mono whitespace-pre block pr-28 leading-relaxed">
{embedMethod === 'script' 
  ? `<script\n        type="module"\n        src="http://bot.a4tool.com/widget-file"\n        data-api-key="${formData.apiKey || 'YOUR_API_KEY_HERE'}">\n</script>` 
  : `<iframe\n        src="http://bot.a4tool.com/widget-window?apiKey=${formData.apiKey || 'YOUR_API_KEY_HERE'}"\n        width="400"\n        height="600"\n        frameborder="0">\n</iframe>`}
            </code></pre>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button type="submit" disabled={isSaving} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95 text-lg disabled:opacity-50">
            {isSaving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
