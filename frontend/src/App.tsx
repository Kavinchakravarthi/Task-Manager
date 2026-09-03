import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import TaskBoardPage from './pages/TaskBoardPage';
import TaskDetailPage from './pages/TaskDetailPage';
import TaskFormPage from './pages/TaskFormPage';
import TeamPage from './pages/TeamPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/signup" element={<AuthPage mode="register" />} />
          <Route path="/dashboard" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><AppLayout><TaskBoardPage /></AppLayout></ProtectedRoute>} />
          <Route path="/all-tasks" element={<ProtectedRoute><AppLayout><TaskBoardPage showAllTasks /></AppLayout></ProtectedRoute>} />
          <Route path="/tasks/new" element={<ProtectedRoute><AppLayout><TaskFormPage /></AppLayout></ProtectedRoute>} />
          <Route path="/tasks/:id/edit" element={<ProtectedRoute><AppLayout><TaskFormPage /></AppLayout></ProtectedRoute>} />
          <Route path="/tasks/:id" element={<ProtectedRoute><AppLayout><TaskDetailPage /></AppLayout></ProtectedRoute>} />
          <Route path="/all-tasks/:id/edit" element={<ProtectedRoute><AppLayout><TaskFormPage /></AppLayout></ProtectedRoute>} />
          <Route path="/all-tasks/:id" element={<ProtectedRoute><AppLayout><TaskDetailPage /></AppLayout></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><AppLayout><TeamPage /></AppLayout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
