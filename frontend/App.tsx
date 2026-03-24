import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './src/pages/Home';
import { Play, BookOpen, GraduationCap, ArrowRight, Upload, Search, MessageSquare, X, Send, Menu, LogOut, LayoutDashboard, User } from 'lucide-react';
import { CourseView } from './src/pages/CourseView';
import { MaterialsView } from './src/pages/MaterialsView';
import { AdminDashboard } from './src/pages/AdminDashboard';
import Login from './src/pages/Login';
import Register from './src/pages/Register';
import { NotFound } from './src/pages/NotFound';
import { Header } from './src/components/Header';
import ProtectedRoute from './src/components/ProtectedRoute';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { AuthProvider } from './src/context/AuthContext';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/university/:universityId" element={<CourseView />} />
              <Route
                path="/course/:courseId"
                element={
                  <ProtectedRoute>
                    <MaterialsView />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/materials/:courseId/:yearId"
                element={
                  <ProtectedRoute>
                    <MaterialsView />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;