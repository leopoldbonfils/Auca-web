import React, { useState, useEffect } from 'react';
import './Styles/global.css';
import Navbar from './component/Navbar';
import Home from './Page/Home';
import Search from './Page/Search';
import CreatePost from './Page/CreatePost';
import Profile from './Page/Profile';
import Comment from './Page/Comment';
import LoginPage from './Page/LoginPage';

//  Page renderer 
function renderPage(page, onNavigate, onPostCreated, selectedPost) {
  switch (page) {
    case 'home':    
      return <Home onNavigate={onNavigate} />;
    case 'search':   
      return <Search />;
    case 'create':   
      return <CreatePost onNavigate={onNavigate} onPostCreated={onPostCreated} />;
    case 'profile':  
      return <Profile onNavigate={onNavigate} />;
    case 'comments': 
      return <Comment post={selectedPost} onBack={() => onNavigate('home')} />;
    default:         
      return <Home onNavigate={onNavigate} />;
  }
}

export default function App() {
  const [auth, setAuth] = useState(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return null;
    const isStaff = localStorage.getItem('isStaff') === 'true';
    const profile = JSON.parse(localStorage.getItem('userProfile') || 'null');
    return { accessToken, profile, isStaff };
  });
  const [currentPage, setCurrentPage]  = useState('home');
  const [selectedPost, setSelectedPost] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('auca-theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('auca-theme', theme);
  }, [theme]);

  //  Navigate handler (string or { page, post }) 
  const handleNavigate = (target) => {
    if (target && typeof target === 'object' && target.page === 'comments') {
      setSelectedPost(target.post || null);
      setCurrentPage('comments');
    } else {
      setCurrentPage(target);
    }
  };
  

  const handlePostCreated = () => setCurrentPage('home');

  //  Logout 
  const handleLogout = () => {
    localStorage.clear();
    setAuth(null);
    setCurrentPage('home');
  };

  //  NOT LOGGED IN → show Login page 
  if (!auth) {
    return (
      <LoginPage
        onLoginSuccess={({ accessToken, profile, isStaff }) => {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('isStaff', String(isStaff));
          if (profile) localStorage.setItem('userProfile', JSON.stringify(profile));
          setAuth({ accessToken, profile, isStaff });
        }}
      />
    );
  }

  //  LOGGED IN show main app 
  return (
    <div className="app-layout">
      <Navbar
        activePage={currentPage === 'comments' ? 'home' : currentPage}
        onNavigate={handleNavigate}
        theme={theme}
        onThemeChange={setTheme}
        onLogout={handleLogout}
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