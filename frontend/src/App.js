import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import Authors from './pages/Authors';
import Series from './pages/Series';
import Universes from './pages/Universes';
import ReadingLog from './pages/ReadingLog';
import Settings from './pages/Settings';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <BrowserRouter>
      <div className="layout">
        <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? '✕' : '☰'}
        </button>

        <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={closeSidebar} />

        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-logo">📚 Bookshelf</div>
          <NavLink to="/" onClick={closeSidebar}>Dashboard</NavLink>
          <NavLink to="/books" onClick={closeSidebar}>Books</NavLink>
          <NavLink to="/authors" onClick={closeSidebar}>Authors</NavLink>
          <NavLink to="/series" onClick={closeSidebar}>Series</NavLink>
          <NavLink to="/universes" onClick={closeSidebar}>Universes</NavLink>
          <NavLink to="/reading-log" onClick={closeSidebar}>Reading Log</NavLink>
          <NavLink to="/settings" onClick={closeSidebar}>Settings</NavLink>
        </nav>

        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/books" element={<Books />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/authors" element={<Authors />} />
            <Route path="/series" element={<Series />} />
            <Route path="/universes" element={<Universes />} />
            <Route path="/reading-log" element={<ReadingLog />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;