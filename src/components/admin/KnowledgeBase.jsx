import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
const BASE_API = import.meta.env.VITE_BASE_API;

export default function KnowledgeBase() {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [file, setFile] = useState(null);
  const [docName, setDocName] = useState('');
  
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [isSubmittingFaq, setIsSubmittingFaq] = useState(false);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('saas_client_token');
      const res = await fetch(`${BASE_API}/admin/uploaded-documents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFaqs = async () => {
    try {
      const token = localStorage.getItem('saas_client_token');
      const res = await fetch(`${BASE_API}/admin/faqs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFaqs(data.faqs || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchFaqs();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !docName.trim()) return toast.error("File and Document Name are required");
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('files', file);
    formData.append('display_names', docName.trim());

    try {
      const token = localStorage.getItem('saas_client_token');
      const res = await fetch(`${BASE_API}/admin/upload-documents`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        toast.success("PDF trained successfully!");
        setFile(null);
        setDocName('');
        // Reset file input visually
        e.target.reset();
        fetchDocuments();
      } else {
        const err = await res.json();
        toast.error(err.detail || "Upload failed");
      }
    } catch (error) {
      toast.error("Server error during upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to delete all trained knowledge? This cannot be undone.")) return;
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('saas_client_token');
      const res = await fetch(`${BASE_API}/admin/delete-vectors`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("All knowledge deleted successfully.");
        fetchDocuments();
      } else {
        toast.error("Failed to delete knowledge");
      }
    } catch (error) {
      toast.error("Server error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      const token = localStorage.getItem('saas_client_token');
      const res = await fetch(`${BASE_API}/admin/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Document deleted.");
        fetchDocuments();
      }
    } catch (error) {
      toast.error("Error deleting document");
    }
  };

  const handleFAQSubmit = async (e) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;

    setIsSubmittingFaq(true);
    const formData = new URLSearchParams();
    formData.append('question', faqQuestion.trim());
    formData.append('answer', faqAnswer.trim());

    try {
      const token = localStorage.getItem('saas_client_token');
      const res = await fetch(`${BASE_API}/admin/faqs`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });
      if (res.ok) {
        toast.success("FAQ saved successfully!");
        setFaqQuestion('');
        setFaqAnswer('');
        fetchFaqs();
      } else {
        toast.error("Failed to save FAQ");
      }
    } catch (error) {
      toast.error("Server error");
    } finally {
      setIsSubmittingFaq(false);
    }
  };

  const handleDeleteFAQ = async (faqId) => {
    if (!window.confirm("Delete this FAQ?")) return;
    try {
      const token = localStorage.getItem('saas_client_token');
      const res = await fetch(`${BASE_API}/admin/faqs/${faqId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("FAQ deleted.");
        fetchFaqs();
      }
    } catch (error) {
      toast.error("Error deleting FAQ");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow duration-300">
        <h3 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
          <i className="bi bi-journal-text text-indigo-600 dark:text-indigo-400"></i> Upload PDF Manuals
        </h3>
        <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4 items-center">
          <input type="file" onChange={(e) => setFile(e.target.files[0])} accept="application/pdf" className="file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-50 dark:file:bg-indigo-900/40 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/60 p-1.5 w-full border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 outline-none focus:border-indigo-500 transition-all text-sm text-slate-600 dark:text-slate-300 cursor-pointer" required />
          <input type="text" value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="Document Name" className="p-3.5 w-full md:w-1/3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium text-slate-700 dark:text-slate-200" required />
          <button type="submit" disabled={isUploading} className="w-full md:w-auto bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold whitespace-nowrap hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none">
            {isUploading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Training...
              </>
            ) : (
              'Train PDF'
            )}
          </button>
        </form>
        <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide text-sm">Trained Documents</h4>
            <button onClick={fetchDocuments} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 flex items-center gap-2 text-sm"><i className="bi bi-arrow-clockwise text-lg leading-none"></i> Refresh List</button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-950 shadow-inner">
            {documents.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 font-medium italic text-center py-4">No documents uploaded yet...</p>
            ) : (
              documents.map((doc, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{doc.name || doc.display_name || doc}</span>
                  <button onClick={() => handleDeleteDoc(doc.id || doc)} className="text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-950/50 p-2 rounded-lg transition-colors"><i className="bi bi-trash-fill"></i></button>
                </div>
              ))
            )}
          </div>
        </div>
        <button onClick={handleDeleteAll} disabled={isDeleting} className="mt-6 text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900 px-4 py-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50">
          <i className="bi bi-exclamation-triangle-fill"></i> {isDeleting ? 'Deleting...' : 'Delete All Knowledge'}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow duration-300">
        <h3 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
          <i className="bi bi-chat-left-text-fill text-emerald-500 dark:text-emerald-400"></i> Manage Training FAQs
        </h3>
        <form onSubmit={handleFAQSubmit} className="space-y-4 mb-8 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div>
            <label className="block text-sm mb-2 font-bold text-slate-700 dark:text-slate-300">User Question</label>
            <input type="text" value={faqQuestion} onChange={(e) => setFaqQuestion(e.target.value)} className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-700 dark:text-slate-200" placeholder="e.g. How do I reset my password?" required />
          </div>
          <div>
            <label className="block text-sm mb-2 font-bold text-slate-700 dark:text-slate-300">Bot Answer</label>
            <textarea rows="3" value={faqAnswer} onChange={(e) => setFaqAnswer(e.target.value)} className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-slate-700 dark:text-slate-200" placeholder="e.g. You can reset it by clicking the 'Forgot Password' link on the login page." required></textarea>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSubmittingFaq} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg hover:shadow-emerald-500/25 transition-all active:scale-95 disabled:opacity-50">
              {isSubmittingFaq ? 'Saving...' : 'Add New FAQ'}
            </button>
          </div>
        </form>
        <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide text-sm mb-4">Saved FAQs</h4>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {faqs.length === 0 ? (
            <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-2xl text-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-950 font-medium">No FAQs saved yet.</div>
          ) : (
            faqs.map((faq, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm relative">
                <button onClick={() => handleDeleteFAQ(faq.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"><i className="bi bi-trash-fill"></i></button>
                <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">Q: {faq.question}</div>
                <div className="text-slate-600 dark:text-slate-400 text-sm">A: {faq.answer}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
