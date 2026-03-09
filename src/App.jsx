import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import FeedPage from './pages/FeedPage';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Skills from './pages/Skills';
import Projects from './pages/Projects';
import EventsPage from './pages/EventsPage';
import FacultyPortal from './pages/FacultyPortal';
import UserProfilePage from './pages/UserProfilePage';
import ConnectionsPage from './pages/ConnectionsPage';
import NotificationsPage from './pages/NotificationsPage';
import SkillGraphPage from './pages/SkillGraphPage';
import TeamRequestsPage from './pages/TeamRequestsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<FeedPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:userId" element={<UserProfilePage />} />
              <Route path="/connections" element={<ConnectionsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/skills" element={<Skills />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/network" element={<SkillGraphPage />} />
              <Route path="/teams" element={<TeamRequestsPage />} />
              <Route path="/faculty" element={<FacultyPortal />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
