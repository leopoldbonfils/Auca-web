import React, { useState } from 'react';
import { HiOutlineUser, HiOutlineLockClosed } from 'react-icons/hi';
import { HiOutlineEye, HiOutlineEyeOff }      from 'react-icons/hi';
import { HiOutlineUserGroup }                  from 'react-icons/hi';
import { MdArrowForward }                      from 'react-icons/md';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export default function LoginPage({ onLoginSuccess }) {
  const [isStaff,   setIsStaff]   = useState(false);
  const [id,        setId]        = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);

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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fff; font-family: 'Nunito', sans-serif; }

        .lp-input-wrap { position: relative; margin-bottom: 14px; }
        .lp-input-wrap input {
          width: 100%; padding: 16px 46px 16px 48px;
          border: 1.5px solid #e8eaf0; border-radius: 14px;
          font-size: 15px; font-family: 'Nunito', sans-serif;
          color: #1a1a2e; background: #f7f8fc;
          outline: none; transition: border-color .2s, box-shadow .2s;
        }
        .lp-input-wrap input:focus {
          border-color: #1a4fa8;
          box-shadow: 0 0 0 3px rgba(26,79,168,.1);
          background: #fff;
        }
        .lp-input-wrap input::placeholder { color: #aab0c0; }
        .lp-icon-left {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: #f0a500; display: flex; align-items: center; pointer-events: none;
        }
        .lp-icon-right {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          color: #aab0c0; display: flex; align-items: center; cursor: pointer;
          background: none; border: none; padding: 0; transition: color .15s;
        }
        .lp-icon-right:hover { color: #1a4fa8; }

        .lp-staff-row {
          display: flex; align-items: center; gap: 12px;
          border: 1.5px solid #e8eaf0; border-radius: 14px;
          padding: 14px 16px; background: #f7f8fc;
          cursor: pointer; margin-bottom: 28px; transition: border-color .2s;
        }
        .lp-staff-row:hover { border-color: #1a4fa8; }
        .lp-staff-row.active { border-color: #f0a500; background: #fffbf0; }

        .lp-radio {
          width: 22px; height: 22px; border-radius: 50%;
          border: 2px solid #ccc; display: flex; align-items: center;
          justify-content: center; flex-shrink: 0; transition: border-color .2s;
        }
        .lp-radio.checked { border-color: #f0a500; }
        .lp-radio-dot {
          width: 10px; height: 10px; border-radius: 50%; background: #f0a500;
        }

        .lp-btn {
          width: 100%; padding: 17px; border-radius: 14px; border: none;
          font-size: 16px; font-weight: 700; font-family: 'Nunito', sans-serif;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          gap: 8px; transition: all .2s;
        }
        .lp-btn.active {
          background: #1a4fa8; color: #fff;
          box-shadow: 0 6px 20px rgba(26,79,168,.3);
        }
        .lp-btn.active:hover { background: #0d3b8e; transform: translateY(-1px); }
        .lp-btn.inactive { background: #e8eaf0; color: #aab0c0; cursor: not-allowed; }

        .lp-error {
          background: #fff0f0; border: 1px solid #fcc; border-radius: 10px;
          padding: 10px 14px; font-size: 13px; color: #c00;
          text-align: center; margin-bottom: 16px;
        }
        .lp-spinner {
          width: 18px; height: 18px; border: 2px solid rgba(255,255,255,.3);
          border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{
        minHeight: '100vh', background: '#fff',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px 20px', fontFamily: "'Nunito', sans-serif",
      }}>

        {/* Sign Up link top right */}
        <div style={{ position: 'fixed', top: 16, right: 16 }}>
          <button style={{
            background: '#fff', border: '1.5px solid #1a4fa8', borderRadius: '10px',
            padding: '8px 20px', fontSize: '14px', fontWeight: 700, color: '#f0a500',
            cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all .15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f7f8fc'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
          >
            Sign Up
          </button>
        </div>

        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              background: 'linear-gradient(135deg, #0d3b8e, #1a4fa8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 24px rgba(13,59,142,.25)',
              border: '4px solid #e8f0fe',
            }}>
              {/* AUCA letters inside circle */}
              <div style={{ textAlign: 'center', color: '#fff', lineHeight: 1.1 }}>
                <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', opacity: 0.85 }}>AUCA</div>
                <div style={{ fontSize: '28px', fontWeight: 900, letterSpacing: '-1px' }}>AA<br/>UC</div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#1a1a2e', marginBottom: '6px' }}>
              Welcome Back
            </h1>
            <p style={{ fontSize: '15px', color: '#8090a0', fontWeight: 500 }}>
              Please log in to continue
            </p>
          </div>

          {/* ID / Email input */}
          <div className="lp-input-wrap">
            <span className="lp-icon-left"><HiOutlineUser size={20} /></span>
            <input
              type={isStaff ? 'email' : 'number'}
              placeholder="ID / Email"
              value={id}
              onChange={e => { setId(e.target.value); setError(''); }}
              onKeyDown={onKey}
            />
          </div>

          {/* Password input */}
          <div className="lp-input-wrap">
            <span className="lp-icon-left"><HiOutlineLockClosed size={20} /></span>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={onKey}
            />
            <button className="lp-icon-right" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
              {showPass ? <HiOutlineEye size={20} /> : <HiOutlineEyeOff size={20} />}
            </button>
          </div>

          {/* Forgot password */}
          <div style={{ textAlign: 'right', marginBottom: '20px', marginTop: '-4px' }}>
            <button
              onClick={() => alert('Contact your administrator to reset your password.')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '14px', fontWeight: 600, color: '#f0a500',
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              Forgot password?
            </button>
          </div>

          {/* Staff toggle row */}
          <div
            className={`lp-staff-row${isStaff ? ' active' : ''}`}
            onClick={() => setIsStaff(v => !v)}
          >
            <HiOutlineUserGroup size={24} color={isStaff ? '#f0a500' : '#8090a0'} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: isStaff ? '#1a1a2e' : '#8090a0', lineHeight: 1.4 }}>
              Tap here if you are a lecturer or a staff member.
            </span>
            <div className={`lp-radio${isStaff ? ' checked' : ''}`}>
              {isStaff && <div className="lp-radio-dot" />}
            </div>
          </div>

          {/* Error */}
          {error && <div className="lp-error">{error}</div>}

          {/* Login button */}
          <button
            className={`lp-btn ${id && password && !loading ? 'active' : 'inactive'}`}
            onClick={handleLogin}
            disabled={!id || !password || loading}
          >
            {loading
              ? <><div className="lp-spinner" /> Logging in...</>
              : <>Log-in <MdArrowForward size={20} /></>
            }
          </button>

        </div>
      </div>
    </>
  );
}