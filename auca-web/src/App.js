import React, { useState, useEffect } from 'react';
import './Styles/global.css';
import Navbar from './component/Navbar';
import Home from './Page/Home';
import Search from './Page/Search';
import CreatePost from './Page/CreatePost';
import Profile from './Page/Profile';
import Settings from './Page/Settings';

function renderPage(page, onNavigate, onPostCreated, theme, onThemeChange) {
  switch (page) {
    case 'home':     return <Home onNavigate={onNavigate} />;
    case 'search':   return <Search />;
    case 'create':   return <CreatePost onNavigate={onNavigate} onPostCreated={onPostCreated} />;
    case 'profile':  return <Profile />;
    case 'settings': return <Settings theme={theme} onThemeChange={onThemeChange} />;
    default:         return <Home onNavigate={onNavigate} />;
  }
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [theme,       setTheme]       = useState(() => {
    // Remember theme from last session
    return localStorage.getItem('auca-theme') || 'light';
  });

  // Apply theme to <html> tag so CSS variables kick in
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('auca-theme', theme);
  }, [theme]);

  const handlePostCreated = (post) => {
    setCurrentPage('home');
  };

  return (
    <div className="app-layout">
      <Navbar
        activePage={currentPage}
        onNavigate={setCurrentPage}
        theme={theme}
        onThemeChange={setTheme}
      />
      <main className="app-main">
        {renderPage(currentPage, setCurrentPage, handlePostCreated, theme, setTheme)}
      </main>
    </div>
  );
}