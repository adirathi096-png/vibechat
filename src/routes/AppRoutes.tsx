import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Pages
import Splash from '@/pages/Splash';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import ForgotPassword from '@/pages/ForgotPassword';
import CompleteProfile from '@/pages/CompleteProfile';
import Home from '@/pages/Home';
import Chats from '@/pages/Chats';
import ChatRoom from '@/pages/ChatRoom';
import Discover from '@/pages/Discover';
import Music from '@/pages/Music';
import Voice from '@/pages/Voice';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';

// Layout
import AppLayout from '@/components/layout/AppLayout';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root Route (triggers splash auth verification) */}
      <Route path="/" element={<Splash />} />

      {/* Guest/Auth Routes */}
      <Route
        path="/login"
        element={
          <ProtectedRoute requireAuth={false}>
            <Login />
          </ProtectedRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <ProtectedRoute requireAuth={false}>
            <SignUp />
          </ProtectedRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <ProtectedRoute requireAuth={false}>
            <ForgotPassword />
          </ProtectedRoute>
        }
      />

      {/* Onboarding Complete Profile */}
      <Route
        path="/complete-profile"
        element={
          <ProtectedRoute requireAuth={true} allowIncomplete={true}>
            <CompleteProfile />
          </ProtectedRoute>
        }
      />

      {/* Authenticated App Workspace */}
      <Route
        path="/app"
        element={
          <ProtectedRoute requireAuth={true}>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="chats" element={<Chats />} />
        <Route path="chats/:conversationId" element={<ChatRoom />} />
        <Route path="discover" element={<Discover />} />
        <Route path="music" element={<Music />} />
        <Route path="voice" element={<Voice />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
