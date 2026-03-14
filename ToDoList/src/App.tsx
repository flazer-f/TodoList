import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import AddTask from './pages/AddTask';
import EditTask from './pages/EditTask';
import './index.css';

function App() {
  return (
    <Router>
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
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<AddTask />} />
          <Route path="/edit/:id" element={<EditTask />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
