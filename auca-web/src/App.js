import React, { useState, useEffect } from 'react';
import './Styles/global.css';
import Navbar from './component/Navbar';
import Home from './Page/Home';
import Search from './Page/Search';
import CreatePost from './Page/CreatePost';
import Profile from './Page/Profile';

function renderPage(page, onNavigate, onPostCreated) {
  switch (page) {
    case 'home':    return <Home onNavigate={onNavigate} />;
    case 'search':  return <Search />;
    case 'create':  return <CreatePost onNavigate={onNavigate} onPostCreated={onPostCreated} />;
    case 'profile': return <Profile />;
    default:        return <Home onNavigate={onNavigate} />;
  }
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [theme, setTheme] = useState(() => localStorage.getItem('auca-theme') || 'light');

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
      {/* Always offset by the slim width (72px) — navbar slides over content on hover */}
      <main style={{
        marginLeft: '72px',
        flex: 1,
        padding: '24px 16px',
        background: 'var(--bg)',
        minHeight: '100vh',
        transition: 'background 0.3s',
      }}>
        {renderPage(currentPage, setCurrentPage, handlePostCreated)}
      </main>
    </div>
  );
}