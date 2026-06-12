import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import React, { lazy, Suspense } from 'react';
import 'react-toastify/dist/ReactToastify.css';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

// Super Admin Pages
import SuperAdminLogin from './pages/superadmin/SuperAdminLogin';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';

// Widget
import ChatWidget from './components/widget/ChatWidget';

// Lazy-loaded Admin Components
const DashboardOverview = lazy(() => import('./components/admin/DashboardOverview'));
const BotSettings = lazy(() => import('./components/admin/BotSettings'));
const KnowledgeBase = lazy(() => import('./components/admin/KnowledgeBase'));
const DatabaseAuth = lazy(() => import('./components/admin/DatabaseAuth'));
const TeamManagement = lazy(() => import('./components/admin/TeamManagement'));
const ChatLogs = lazy(() => import('./components/admin/ChatLogs'));

// Lazy-loaded SuperAdmin Components
const ManageClients = lazy(() => import('./components/superadmin/ManageClients'));
const DeletedAccounts = lazy(() => import('./components/superadmin/DeletedAccounts'));
const GlobalSettings = lazy(() => import('./components/superadmin/GlobalSettings'));

// Fallback loader
const FallbackLoader = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>
);

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Redirect root to admin login */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Suspense fallback={<FallbackLoader />}><DashboardOverview /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<FallbackLoader />}><BotSettings /></Suspense>} />
          <Route path="knowledge" element={<Suspense fallback={<FallbackLoader />}><KnowledgeBase /></Suspense>} />
          <Route path="database" element={<Suspense fallback={<FallbackLoader />}><DatabaseAuth /></Suspense>} />
          <Route path="team" element={<Suspense fallback={<FallbackLoader />}><TeamManagement /></Suspense>} />
          <Route path="history" element={<Suspense fallback={<FallbackLoader />}><ChatLogs /></Suspense>} />
        </Route>

        {/* Super Admin Routes */}
        <Route path="/superadmin" element={<Navigate to="/superadmin/login" replace />} />
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />}>
          <Route index element={<Navigate to="clients" replace />} />
          <Route path="clients" element={<Suspense fallback={<FallbackLoader />}><ManageClients /></Suspense>} />
          <Route path="deleted" element={<Suspense fallback={<FallbackLoader />}><DeletedAccounts /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<FallbackLoader />}><GlobalSettings /></Suspense>} />
        </Route>

        {/* Widget Route */}
        <Route path="/widget-window" element={<ChatWidget />} />
      </Routes>
    </Router>
  );
}

export default App;
