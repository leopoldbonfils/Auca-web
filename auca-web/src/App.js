import React, { useState, useEffect } from 'react';
import './Styles/global.css';
import Navbar from './component/Navbar';
import Home from './Page/Home';
import Search from './Page/Search';
import CreatePost from './Page/CreatePost';
import Profile from './Page/Profile';

// ── Placeholder ───────────────────────────────────────────────────────────────
const Placeholder = ({ page }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '60vh', gap: '12px',
    fontFamily: "'Nunito', sans-serif",
  }}>
    <span style={{ fontSize: '48px' }}>🚧</span>
    <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
      {page.charAt(0).toUpperCase() + page.slice(1)} Page
    </span>
    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Coming soon!</span>
  </div>
);

// ── Page renderer ─────────────────────────────────────────────────────────────
function renderPage(page, onNavigate, onPostCreated) {
  switch (page) {
    case 'home':    return <Home onNavigate={onNavigate} />;
    case 'search':  return <Search />;
    case 'create':  return <CreatePost onNavigate={onNavigate} onPostCreated={onPostCreated} />;
    case 'profile': return <Profile />;
    default:        return <Home onNavigate={onNavigate} />;
  }
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  // Load saved theme or default to light
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('auca-theme') || 'light';
  });

  // Apply theme to <html> — CSS variables switch automatically
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('auca-theme', theme);
  }, [theme]);

  const handlePostCreated = () => setCurrentPage('home');

  return (
    <div className="app-layout">
      <Navbar
        activePage={currentPage}
        onNavigate={setCurrentPage}
        theme={theme}
        onThemeChange={setTheme}
      />
      <main className="app-main">
        {renderPage(currentPage, setCurrentPage, handlePostCreated)}
      </main>
    </div>
  );
}