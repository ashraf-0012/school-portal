import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

import PublicLayout from './components/layout/PublicLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import AdminDashboard from './pages/dashboards/AdminDashboard';
import TeacherDashboard from './pages/dashboards/TeacherDashboard';
import StudentDashboard from './pages/dashboards/StudentDashboard';

function NotFoundPage() {
  return (
    <main className="min-h-screen flex-center flex-col gap-4">
      <h1 className="heading-lg">404 - Page Not Found</h1>

      <p className="text-muted">
        The page you are looking for does not exist.
      </p>

      <Link to="/">Return to the homepage</Link>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public website */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
      </Route>

      {/* Authentication */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Admin dashboard */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Teacher dashboard */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRole="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      {/* Student dashboard */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Unknown pages */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}