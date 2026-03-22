import React, { useState } from 'react';
import { HiOutlineUser, HiOutlineLockClosed } from 'react-icons/hi';
import { HiOutlineEye, HiOutlineEyeOff }      from 'react-icons/hi';
import { HiOutlineUserGroup }                  from 'react-icons/hi';
import { MdArrowForward }                      from 'react-icons/md';

// ── AUCA logo from assets ─────────────────────────────────────────────────────
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
    const payload = { Id: isStaff ? id : Number(id), Password: password, isStaff };
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { font-family: 'Nunito', sans-serif; }

        .lp-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'Nunito', sans-serif;
        }

        /* ── Left panel ── */
        .lp-left {
          background: linear-gradient(155deg, #0d3b8e 0%, #1a4fa8 50%, #0a2472 100%);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 60px 40px;
          position: relative; overflow: hidden;
        }
        .lp-left::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.06) 0%, transparent 55%),
            radial-gradient(circle at 80% 70%, rgba(240,165,0,0.12) 0%, transparent 50%);
          pointer-events: none;
        }
        .lp-left-circles {
          position: absolute;
          width: 400px; height: 400px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.05);
          top: -100px; left: -100px;
          box-shadow: 0 0 0 80px rgba(255,255,255,0.02), 0 0 0 160px rgba(255,255,255,0.015);
        }

        .lp-logo-wrap {
          position: relative; z-index: 1;
          width: 130px; height: 130px; border-radius: 50%;
          background: rgba(255,255,255,0.12);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 32px;
          box-shadow: 0 0 0 8px rgba(255,255,255,0.06), 0 20px 50px rgba(0,0,0,0.3);
          backdrop-filter: blur(10px);
        }
        .lp-logo-wrap img { width: 90px; height: 90px; object-fit: contain; border-radius: 50%; }

        .lp-left-title {
          position: relative; z-index: 1;
          color: #fff; font-size: 32px; font-weight: 900;
          text-align: center; margin-bottom: 12px; letter-spacing: -0.5px;
        }
        .lp-left-sub {
          position: relative; z-index: 1;
          color: rgba(255,255,255,0.65); font-size: 15px;
          text-align: center; line-height: 1.6; max-width: 280px;
        }
        .lp-left-badge {
          position: relative; z-index: 1;
          margin-top: 40px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 50px; padding: 10px 22px;
          color: #f0a500; font-size: 13px; font-weight: 700;
          letter-spacing: 0.5px; backdrop-filter: blur(8px);
        }

        /* ── Right panel ── */
        .lp-right {
          background: #f8f9fc;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 60px 48px;
          position: relative;
        }

        .lp-signup-btn {
          position: absolute; top: 24px; right: 24px;
          background: transparent;
          border: 1.5px solid #1a4fa8; border-radius: 50px;
          padding: 8px 22px; font-size: 13px; font-weight: 700;
          color: #f0a500; cursor: pointer;
          font-family: 'Nunito', sans-serif; transition: all .2s;
        }
        .lp-signup-btn:hover { background: #1a4fa8; color: #fff; }

        .lp-form { width: 100%; max-width: 380px; }

        .lp-form-title {
          font-size: 28px; font-weight: 900; color: #1a1a2e;
          margin-bottom: 6px;
        }
        .lp-form-sub {
          font-size: 14px; color: #8090a0; margin-bottom: 36px; font-weight: 500;
        }

        /* ── Input ── */
        .lp-field {
          position: relative; margin-bottom: 14px;
        }
        .lp-field-icon-left {
          position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
          color: #f0a500; display: flex; align-items: center; pointer-events: none;
        }
        .lp-field-icon-right {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; padding: 4px;
          color: #aab0c0; display: flex; align-items: center; transition: color .15s;
        }
        .lp-field-icon-right:hover { color: #1a4fa8; }
        .lp-field input {
          width: 100%; padding: 15px 44px 15px 46px;
          background: #fff; border: 1.5px solid #e4e8f0;
          border-radius: 14px; font-size: 14px; color: #1a1a2e;
          font-family: 'Nunito', sans-serif; outline: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          transition: border-color .2s, box-shadow .2s;
        }
        .lp-field input:focus {
          border-color: #1a4fa8;
          box-shadow: 0 0 0 4px rgba(26,79,168,.1);
        }
        .lp-field input::placeholder { color: #b0bac8; }

        /* ── Forgot ── */
        .lp-forgot {
          text-align: right; margin-bottom: 20px; margin-top: -4px;
        }
        .lp-forgot button {
          background: none; border: none; cursor: pointer;
          font-size: 13px; font-weight: 700; color: #f0a500;
          font-family: 'Nunito', sans-serif;
        }

        /* ── Staff row ── */
        .lp-staff {
          display: flex; align-items: center; gap: 12px;
          background: #fff; border: 1.5px solid #e4e8f0;
          border-radius: 14px; padding: 14px 16px;
          cursor: pointer; margin-bottom: 28px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          transition: border-color .2s, box-shadow .2s;
        }
        .lp-staff:hover { border-color: #1a4fa8; box-shadow: 0 0 0 4px rgba(26,79,168,.08); }
        .lp-staff.active { border-color: #f0a500; box-shadow: 0 0 0 4px rgba(240,165,0,.1); background: #fffdf5; }

        .lp-radio {
          width: 20px; height: 20px; border-radius: 50%;
          border: 2px solid #d0d8e8; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: border-color .2s;
        }
        .lp-radio.on { border-color: #f0a500; }
        .lp-radio-dot { width: 10px; height: 10px; border-radius: 50%; background: #f0a500; }

        /* ── Error ── */
        .lp-error {
          background: #fff5f5; border: 1px solid #fcc; border-radius: 10px;
          padding: 10px 14px; font-size: 13px; color: #c00;
          text-align: center; margin-bottom: 16px;
        }

        /* ── Submit ── */
        .lp-submit {
          width: 100%; padding: 16px; border: none; border-radius: 14px;
          font-size: 16px; font-weight: 800; font-family: 'Nunito', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          cursor: pointer; transition: all .2s; letter-spacing: 0.2px;
        }
        .lp-submit.on {
          background: linear-gradient(135deg, #1a4fa8, #0d3b8e);
          color: #fff;
          box-shadow: 0 8px 24px rgba(13,59,142,.35);
        }
        .lp-submit.on:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(13,59,142,.45); }
        .lp-submit.on:active { transform: translateY(0); }
        .lp-submit.off { background: #e8edf5; color: #b0bac8; cursor: not-allowed; }

        .lp-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: #fff; border-radius: 50%;
          animation: lp-spin .7s linear infinite; display: inline-block;
        }
        @keyframes lp-spin { to { transform: rotate(360deg); } }

        /* ── Responsive ── */
        @media (max-width: 720px) {
          .lp-root { grid-template-columns: 1fr; }
          .lp-left { display: none; }
          .lp-right { padding: 80px 24px 40px; background: #fff; }
        }
      `}</style>

      <div className="lp-root">

        {/* ══ LEFT PANEL ══ */}
        <div className="lp-left">
          <div className="lp-left-circles" />

          <div className="lp-logo-wrap">
           
          </div>

          <div className="lp-left-title">AUCA Social Hub</div>
          <div className="lp-left-sub">
            Your university community platform  connect, share, and stay informed.
          </div>
          <div className="lp-left-badge">🎓 Adventist University of Central Africa</div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="lp-right">
          <button className="lp-signup-btn">Sign Up</button>

          <div className="lp-form">
            <div className="lp-form-title">Welcome Back</div>
            <div className="lp-form-sub">Please log in to continue</div>

            {/* ID / Email */}
            <div className="lp-field">
              <span className="lp-field-icon-left"><HiOutlineUser size={18} /></span>
              <input
                type={isStaff ? 'email' : 'number'}
                placeholder="ID / Email"
                value={id}
                onChange={e => { setId(e.target.value); setError(''); }}
                
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