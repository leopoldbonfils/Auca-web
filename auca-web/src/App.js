import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './Styles/global.css';
import Navbar from './component/Navbar';
import Home from './Page/Home';
import Search from './Page/Search';
import CreatePost from './Page/CreatePost';
import Profile from './Page/Profile';
import Comment from './Page/Comment';
import LoginPage from './Page/LoginPage';
import AUCASADashboard from './Page/AUCASADashboard';
import ClaimDetails from './Page/ClaimDetails';

// ============================================================================
// 🚨 TEMPORARY DEVELOPMENT BYPASS CONFIGURATION
// Set DEV_BYPASS_LOGIN to true to automatically log in as an AUCASA user.
// Set to false for standard student/staff/AUCASA login flow.
const DEV_BYPASS_LOGIN = true; 

// Paste an active backend-signed token here if claims endpoints validate signatures.
const DEV_BYPASS_TOKEN = "bypass-test-token-value";
// ============================================================================

// ── Route wrappers for pages that need a "post" object passed via nav state ─
// This avoids modifying Comment.js or ClaimDetails.js internals.
function CommentRoute() {
  const { state } = useLocation();
  const navigate   = useNavigate();
  const post = state?.post;
  if (!post) return <Navigate to="/home" replace />;
  return <Comment post={post} onBack={() => navigate('/home')} />;
}

function ClaimDetailsRoute() {
  const { state } = useLocation();
  const navigate   = useNavigate();
  const post = state?.post;
  if (!post) return <Navigate to="/aucasa" replace />;
  return <ClaimDetails post={post} onBack={() => navigate('/aucasa')} />;
}

// ── Main app (requires BrowserRouter in index.js, which is already there) ──
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // ── Auth — read real values from localStorage (no more mock token) ────────
  const [auth, setAuth] = useState(() => {
    if (DEV_BYPASS_LOGIN) {
      const mockProfile = {
        Id: 1001,
        Fname: "AUCASA",
        Lname: "Representative (Dev Bypass)",
        Email: "aucasa.dev@auca.ac.rw",
        Role: "aucasa",
        aucasaUserRole: "Minister of Communication",
        Department: "Communication",
      };

      // Seed localStorage so that Navbar and other sub-pages/components have access to it
      localStorage.setItem('accessToken', DEV_BYPASS_TOKEN);
      localStorage.setItem('isStaff', 'false');
      localStorage.setItem('isAucasa', 'true');
      localStorage.setItem('userProfile', JSON.stringify(mockProfile));

      return {
        accessToken: DEV_BYPASS_TOKEN,
        profile: mockProfile,
        isStaff: false,
        isAucasa: true,
      };
    }

    const token   = localStorage.getItem('accessToken');
    const raw     = localStorage.getItem('userProfile');
    const profile = raw ? JSON.parse(raw) : null;
    const isStaff  = localStorage.getItem('isStaff')  === 'true';
    const isAucasa = localStorage.getItem('isAucasa') === 'true';
    return token ? { accessToken: token, profile, isStaff, isAucasa } : null;
  });

  const [navExpanded, setNavExpanded] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem('auca-theme') || 'light'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('auca-theme', theme);
  }, [theme]);

  // Redirect to AUCASA dashboard when bypass is active and we start at root/login
  useEffect(() => {
    if (DEV_BYPASS_LOGIN) {
      if (location.pathname === '/' || location.pathname === '/login') {
        navigate('/aucasa', { replace: true });
      }
    }
  }, [navigate, location.pathname]);

  // ── Derive the active nav item from the real URL path ────────────────────
  const activePage = (() => {
    const p = location.pathname;
    if (p.startsWith('/search'))  return 'search';
    if (p.startsWith('/create'))  return 'create';
    if (p.startsWith('/profile')) return 'profile';
    if (p.startsWith('/aucasa'))  return 'aucasa';
    return 'home';
  })();

  // ── Navigation handler — maps page names / objects to real URL paths ──────
  const handleNavigate = (target) => {
    if (target && typeof target === 'object') {
      const { page, post } = target;
      if (page === 'comments') {
        navigate('/comments', { state: { post } });
      } else if (page === 'claimDetails') {
        navigate('/aucasa/claims', { state: { post } });
      } else {
        navigate('/' + page);
      }
    } else {
      navigate('/' + target);
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.clear();
    setAuth(null);
    navigate('/login', { replace: true });
  };

  // ── NOT LOGGED IN → Login page ────────────────────────────────────────────
  if (!auth) {
    return (
      <LoginPage
        onLoginSuccess={({ accessToken, profile, isStaff, isAucasa }) => {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('isStaff',  String(isStaff));
          localStorage.setItem('isAucasa', String(isAucasa));
          if (profile) localStorage.setItem('userProfile', JSON.stringify(profile));
          setAuth({ accessToken, profile, isStaff, isAucasa });
          // Route based on role: AUCASA members go to dashboard, everyone else to home
          const isAucasaRole = isAucasa || !!profile?.aucasaUserRole;
          navigate(isAucasaRole ? '/aucasa' : '/home', { replace: true });
        }}
      />
    );
  }

  // ── LOGGED IN → main layout with real React Router routes ────────────────
  return (
    <div className="app-layout">
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        theme={theme}
        onThemeChange={setTheme}
        onLogout={handleLogout}
        onExpandedChange={setNavExpanded}
      />
      <main
        style={{
          marginLeft: navExpanded ? '240px' : '72px',
          flex: 1,
          padding: '24px 16px',
          background: 'var(--bg)',
          minHeight: '100vh',
          transition: 'background 0.3s',
        }}
      >
        <Routes>
          {/* Root redirect */}
          <Route path="/"       element={<Navigate to="/home"  replace />} />
          <Route path="/login"  element={<Navigate to="/home"  replace />} />

          {/* Main pages */}
          <Route path="/home"    element={<Home onNavigate={handleNavigate} />} />
          <Route path="/search"  element={<Search />} />
          <Route path="/create"  element={
            <CreatePost
              onNavigate={handleNavigate}
              onPostCreated={() => navigate('/home')}
            />
          } />
          <Route path="/profile" element={<Profile onNavigate={handleNavigate} />} />

          {/* Pages that receive a post object via location.state */}
          <Route path="/comments"     element={<CommentRoute />} />
          <Route path="/aucasa/claims" element={<ClaimDetailsRoute />} />

          {/* AUCASA dashboard — AUCASA users only (redirects others to /home) */}
          <Route
            path="/aucasa"
            element={
              auth?.isAucasa
                ? <AUCASADashboard onNavigate={handleNavigate} />
                : <Navigate to="/home" replace />
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
    </div>
  );
}