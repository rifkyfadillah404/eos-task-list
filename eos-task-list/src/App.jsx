import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { Login } from './pages/Login';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import './App.css';

function AppContent() {
  const { isAuthenticated, isAdmin } = useAuth();

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
