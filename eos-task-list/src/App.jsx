import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { Login } from './pages/Login';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import './App.css';

function AppContent() {
  const { isAuthenticated, isAdmin, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-sm text-slate-500">
        Loading workspace...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => {}} />;
  }

  return isAdmin ? <AdminDashboard /> : <UserDashboard />;
}

function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    </AuthProvider>
  );
}

export default App;
