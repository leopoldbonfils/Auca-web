import React, { useState, useEffect } from 'react';
import './Styles/global.css';
import Navbar      from './component/Navbar';
import Home        from './Page/Home';
import Search      from './Page/Search';
import CreatePost  from './Page/CreatePost';
import Profile     from './Page/Profile';
import Comment     from './Page/Comment';           // ← NEW

// ── ONLY CHANGE: added selectedPost param + 'comments' case ──────────────────
function renderPage(page, onNavigate, onPostCreated, selectedPost) {
  switch (page) {
    case 'home':     return <Home onNavigate={onNavigate} />;
    case 'search':   return <Search />;
    case 'create':   return <CreatePost onNavigate={onNavigate} onPostCreated={onPostCreated} />;
    case 'profile':  return <Profile />;
    case 'comments': return <Comment post={selectedPost} onBack={() => onNavigate('home')} />; // ← NEW
    default:         return <Home onNavigate={onNavigate} />;
  }
}

export default function App() {
  const [currentPage,  setCurrentPage]  = useState('home');
  const [selectedPost, setSelectedPost] = useState(null); // ← NEW
  const [theme, setTheme] = useState(() => localStorage.getItem('auca-theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('auca-theme', theme);
  }, [theme]);

  const handlePostCreated = () => setCurrentPage('home');

  // ── NEW: wraps setCurrentPage so it also accepts { page:'comments', post }
  const handleNavigate = (target) => {
    if (target && typeof target === 'object' && target.page === 'comments') {
      setSelectedPost(target.post || null);
      setCurrentPage('comments');
    } else {
      setCurrentPage(target);
    }
  };

  return (
    <div className="app-layout">
      <Navbar
        activePage={currentPage === 'comments' ? 'home' : currentPage}
        onNavigate={handleNavigate}
        theme={theme}
        onThemeChange={setTheme}
      />
      <main style={{
        marginLeft: '72px',
        flex: 1,
        padding: '24px 16px',
        background: 'var(--bg)',
        minHeight: '100vh',
        transition: 'background 0.3s',
      }}>
        {renderPage(currentPage, handleNavigate, handlePostCreated, selectedPost)}
      </main>
    </div>
  );
}