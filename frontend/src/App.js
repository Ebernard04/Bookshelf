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
  return (
    <BrowserRouter>
      <div className="layout">
        <nav className="sidebar">
          <div className="sidebar-logo">📚 Bookshelf</div>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/books">Books</NavLink>
          <NavLink to="/authors">Authors</NavLink>
          <NavLink to="/series">Series</NavLink>
          <NavLink to="/universes">Universes</NavLink>
          <NavLink to="/reading-log">Reading Log</NavLink>
          <NavLink to="/settings">Settings</NavLink>
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