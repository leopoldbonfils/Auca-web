import React, { useState } from 'react';
import { HiOutlineUser, HiOutlineLockClosed } from 'react-icons/hi';
import { HiOutlineEye, HiOutlineEyeOff }      from 'react-icons/hi';
import { HiOutlineUserGroup }                  from 'react-icons/hi';
import { MdArrowForward }                      from 'react-icons/md';
import '../Styles/login.css';

//  AUCA logo from assets 
let aucaLogo;
try { aucaLogo = require('../assets/auca_logoo.png'); } catch (e) { aucaLogo = null; }

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export default function LoginPage({ onLoginSuccess }) {
  const [isStaff,  setIsStaff]  = useState(false);
  const [id,       setId]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!id || !password) { setError('Please enter your ID / Email and Password.'); return; }
    setError('');
    setLoading(true);
    // Send as number if it's all digits, otherwise send as string (email)
    const IdValue = /^\d+$/.test(id.trim()) ? Number(id.trim()) : id.trim();
    const payload = { Id: IdValue, Password: password, isStaff };
    try {
      const res  = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(typeof data === 'string' ? data : data.message || 'Invalid credentials.'); setLoading(false); return; }
      localStorage.setItem('accessToken',  data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('isStaff',      String(isStaff));
      const profile = isStaff
        ? (data.staffProfile?.[0]   ?? data.staffProfile)
        : (data.studentProfile?.[0] ?? data.studentProfile);
      if (profile) localStorage.setItem('userProfile', JSON.stringify(profile));
      onLoginSuccess({ accessToken: data.accessToken, profile, isStaff });
    } catch {
      setError('Network error. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => e.key === 'Enter' && handleLogin();
  const canSubmit = id.trim() && password.trim() && !loading;

  return (
    <>
      <div className="lp-root">

        {/* ══ LEFT PANEL ══ */}
        <div className="lp-left">
          <div className="lp-left-circles" />

          {/* FIX 1: auca_logoo.png shown inside the circle */}
          <div className="lp-logo-wrap">
            {aucaLogo
              ? <img src={aucaLogo} alt="AUCA Logo" />
              : <span style={{ color: '#0d3b8e', fontWeight: 900, fontSize: '22px' }}>AUCA</span>
            }
          </div>

          <div className="lp-left-title">AUCA Social Hub</div>
          <div className="lp-left-sub">
            Your university community platform — connect, share, and stay informed.
          </div>
          <div className="lp-left-badge">🎓 Adventist University of Central Africa</div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="lp-right">
          <button className="lp-signup-btn">Sign Up</button>

          <div className="lp-form">
            <div className="lp-form-title">Welcome Back</div>
            <div className="lp-form-sub">Please log in to continue</div>

            {/* FIX 2: type="text" — accepts numbers (student ID) and characters (email) */}
            <div className="lp-field">
              <span className="lp-field-icon-left"><HiOutlineUser size={18} /></span>
              <input
                type="text"
                placeholder="ID / Email"
                value={id}
                onChange={e => { setId(e.target.value); setError(''); }}
                onKeyDown={onKey}
              />
            </div>

            {/* Password */}
            <div className="lp-field">
              <span className="lp-field-icon-left"><HiOutlineLockClosed size={18} /></span>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                onKeyDown={onKey}
              />
              <button className="lp-field-icon-right" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                {showPass ? <HiOutlineEye size={18} /> : <HiOutlineEyeOff size={18} />}
              </button>
            </div>

            {/* Forgot */}
            <div className="lp-forgot">
              <button onClick={() => alert('Contact your administrator to reset your password.')}>
                Forgot password?
              </button>
            </div>

            {/* Staff toggle */}
            <div className={`lp-staff${isStaff ? ' active' : ''}`} onClick={() => setIsStaff(v => !v)}>
              <HiOutlineUserGroup size={22} color={isStaff ? '#f0a500' : '#8090a0'} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: isStaff ? '#1a1a2e' : '#8090a0', lineHeight: 1.4 }}>
                Tap here if you are a lecturer or a staff member.
              </span>
              <div className={`lp-radio${isStaff ? ' on' : ''}`}>
                {isStaff && <div className="lp-radio-dot" />}
              </div>
            </div>

            {/* Error */}
            {error && <div className="lp-error">{error}</div>}

            {/* Submit */}
            <button
              className={`lp-submit ${canSubmit ? 'on' : 'off'}`}
              onClick={handleLogin}
              disabled={!canSubmit}
            >
              {loading
                ? <><span className="lp-spinner" /> Logging in...</>
                : <>Log-in <MdArrowForward size={20} /></>
              }
            </button>
          </div>
        </div>

      </div>
    </>
  );
}