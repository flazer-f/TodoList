import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import AddTask from './pages/AddTask';
import EditTask from './pages/EditTask';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';

function AppLayout() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <Router>
      {isAuthenticated && (
        <header className="header">
          <div>
            <h1>TaskFlow</h1>
            <p className="subtitle">Organize your work visually.</p>
          </div>
          <nav className="nav">
            <NavLink
              to="/"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Tasks
            </NavLink>
            <NavLink
              to="/add"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Add Task
            </NavLink>
            <span className="nav-user">Hi, {user?.username}</span>
            <button className="btn-icon nav-link" onClick={logout} title="Sign out">
              <i className="fi fi-rr-sign-out-alt"></i>
            </button>
          </nav>
        </header>
      )}

      <main>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />

          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/add" element={<ProtectedRoute><AddTask /></ProtectedRoute>} />
          <Route path="/edit/:id" element={<ProtectedRoute><EditTask /></ProtectedRoute>} />
        </Routes>
      </main>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}

export default App;
