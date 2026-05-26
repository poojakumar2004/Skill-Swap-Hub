// App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import PrivateRoute from './components/PrivateRoute';
import MainLayout from './components/MainLayout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PeerLearning from './pages/PeerLearning';

import SkillManager from './pages/SkillManager';
import Matches from './pages/Matches';
import SkillMatchPage from './pages/SkillMatchPage';
import SessionsPage from './pages/SessionsPage';
import SettingsPage from './pages/SettingsPage';
import Chat from './pages/Chat';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<SignupPage />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <MainLayout>
              <SettingsPage />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/peer-learning"
        element={
          <PrivateRoute>
            <MainLayout>
              <PeerLearning />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/sessions"
        element={
          <PrivateRoute>
            <MainLayout>
              <SessionsPage />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/skills"
        element={
          <PrivateRoute>
            <MainLayout>
              <SkillManager />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/matches"
        element={
          <PrivateRoute>
            <MainLayout>
              <Matches />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <PrivateRoute>
            <MainLayout>
              <Chat />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/marketplace"
        element={
          <PrivateRoute>
            <MainLayout>
              <SkillMatchPage />
            </MainLayout>
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
