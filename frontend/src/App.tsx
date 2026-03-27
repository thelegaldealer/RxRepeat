import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Public Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifyEmail from './pages/VerifyEmail';
import Onboarding from './pages/Onboarding';

// Dashboard Placeholder Pages
import PlaceholderPage from './pages/PlaceholderPage';
import SuperadminSubscribers from './pages/SuperadminSubscribers';
import MyCourses from './pages/MyCourses';
import CourseDetail from './pages/CourseDetail';
import ModuleContent from './pages/ModuleContent';
import ModuleFlashcards from './pages/ModuleFlashcards';
import PracticePapers from './pages/PracticePapers';
import AccountSettings from './pages/AccountSettings';
import Inbox from './pages/Inbox';
import Community from './pages/Community';
import Schedule from './pages/Schedule';
import Resources from './pages/Resources';
import Progress from './pages/Progress';
import Contact from './pages/Contact';

export default function App() {
  // Global Copy & Print Deterrence
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C' || e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <ThemeProvider>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id'}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/onboarding" element={<Onboarding />} />

            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<MyCourses />} />
              <Route path="courses/:courseId" element={<CourseDetail />} />
              <Route path="courses/:courseId/expert" element={<PlaceholderPage title="Contact an Expert" />} />
              <Route path="nodes/:nodeId/content" element={<ModuleContent />} />
              <Route path="nodes/:nodeId/flashcards" element={<ModuleFlashcards />} />
              <Route path="nodes/:nodeId/papers" element={<PracticePapers />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="inbox" element={<Inbox />} />
              <Route path="settings" element={<AccountSettings />} />
              <Route path="community" element={<Community />} />
              <Route path="resources" element={<Resources />} />
              <Route path="progress" element={<Progress />} />
              <Route path="contact" element={<Contact />} />
              <Route path="inbox" element={<PlaceholderPage title="Notifications Inbox" />} />
              <Route path="account" element={<PlaceholderPage title="Profile & Settings" />} />
              <Route path="subscribers" element={
                <RoleRoute allowedRoles={['owner']}>
                  <SuperadminSubscribers />
                </RoleRoute>
              } />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
    </ThemeProvider>
  );
}
