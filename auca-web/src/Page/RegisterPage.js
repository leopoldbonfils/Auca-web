import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineUser, HiOutlineLockClosed, HiOutlineMail, HiOutlinePhone, HiOutlineAcademicCap, HiOutlineOfficeBuilding, HiOutlineLibrary } from 'react-icons/hi';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { MdArrowForward } from 'react-icons/md';
import '../Styles/login.css';

let aucaLogo;
try { aucaLogo = require('../assets/auca_logoo.png'); } catch (e) { aucaLogo = null; }

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('student');
  const [formData, setFormData] = useState({
    id: '',           // students only
    fullName: '',
    email: '',
    phone: '',        // both
    password: '',
    confirmPassword: '',
    studyLevel: '',   // students only
    faculty: '',
    department: '',
  });

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const studyLevels = ['Undergraduate', 'Masters'];
  const facultyOptions = {
    IT: ['Software Engineering', 'Information Management', 'Networking'],
    Business: ['Accounting', 'Finance', 'Marketing'],
    Education: ['Mathematics Education', 'English Education'],
    Theology: ['Pastoral Theology', 'Church Administration'],
  };

  const handleInputChange = (field, value) => {
    setError('');
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'faculty' ? { department: '' } : {}),
    }));
  };

  const handleRoleChange = (role) => {
    setUserRole(role);
    setError('');
    setFormData({
      id: '', fullName: '', email: '', phone: '', password: '', 
      confirmPassword: '', studyLevel: '', faculty: '', department: ''
    });
  };

  const validateBeforeSubmit = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match.");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password too short. Minimum 6 characters required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (formData.phone.length < 9) {
      setError("Please enter a valid phone number.");
      return false;
    }
    return true;
  };

  const isFormValid = () => {
    const base = formData.fullName && formData.email && formData.phone &&
                 formData.password && formData.confirmPassword &&
                 formData.faculty && formData.department;
    if (userRole === 'student') return base && formData.id && formData.studyLevel;
    return base;
  };

  const handleRegister = async () => {
    if (!validateBeforeSubmit()) return;
    setLoading(true);
    setError('');

    try {
      const payload = {
        userRole,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        faculty: formData.faculty,
        department: formData.department,
        ...(userRole === 'student' && {
          id: formData.id,
          studyLevel: formData.studyLevel,
        }),
      };

      const res = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 409) setError(data.message || 'Already registered.');
        else if (res.status === 400) setError(data.message || 'Invalid data.');
        else setError(data.message || 'Registration failed.');
        setLoading(false);
        return;
      }

      setSuccessMsg('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      setError('Network error. Check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="lp-root">
      {/* LEFT PANEL */}
      <div className="lp-left">
        <div className="lp-left-circles" />
        <div className="lp-logo-wrap">
          {aucaLogo
            ? <img src={aucaLogo} alt="AUCA Logo" />
            : <span style={{ color: '#0d3b8e', fontWeight: 900, fontSize: '22px' }}>AUCA</span>
          }
        </div>
        <div className="lp-left-title">Create Account</div>
        <div className="lp-left-sub">Join AUCA Community</div>
      </div>

      {/* RIGHT PANEL */}
      <div className="lp-right">
        <button className="lp-signup-btn" onClick={() => navigate('/login')}>
          Log In
        </button>
        <div className="lp-form">
          <div className="lp-form-title">Welcome</div>
          <div className="lp-form-sub">Please fill in your details to register.</div>

          {/* Role toggle */}
          <div className={`lp-staff${userRole === 'staff' ? ' active' : ''}`} onClick={() => handleRoleChange(userRole === 'student' ? 'staff' : 'student')} style={{ marginBottom: '20px' }}>
            <HiOutlineUserGroup size={22} color={userRole === 'staff' ? '#f0a500' : '#8090a0'} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: userRole === 'staff' ? '#1a1a2e' : '#8090a0', lineHeight: 1.4 }}>
              Tap here if you are a lecturer or a staff member.
            </span>
            <div className={`lp-radio${userRole === 'staff' ? ' on' : ''}`}>
              {userRole === 'staff' && <div className="lp-radio-dot" />}
            </div>
          </div>

          {userRole === 'student' && (
            <div className="lp-field">
              <span className="lp-field-icon-left"><HiOutlineUser size={18} /></span>
              <input
                type="text"
                placeholder="Student ID (e.g., 26636)"
                value={formData.id}
                onChange={e => handleInputChange('id', e.target.value)}
              />
            </div>
          )}

          <div className="lp-field">
            <span className="lp-field-icon-left"><HiOutlineUser size={18} /></span>
            <input
              type="text"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={e => handleInputChange('fullName', e.target.value)}
            />
          </div>

          <div className="lp-field">
            <span className="lp-field-icon-left"><HiOutlineMail size={18} /></span>
            <input
              type="email"
              placeholder={userRole === 'student' ? 'Email Address' : 'Email (@auca.ac.rw)'}
              value={formData.email}
              onChange={e => handleInputChange('email', e.target.value)}
            />
          </div>

          <div className="lp-field">
            <span className="lp-field-icon-left"><HiOutlinePhone size={18} /></span>
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={e => handleInputChange('phone', e.target.value)}
            />
          </div>

          <div className="lp-field">
            <span className="lp-field-icon-left"><HiOutlineLockClosed size={18} /></span>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Password"
              value={formData.password}
              onChange={e => handleInputChange('password', e.target.value)}
            />
            <button className="lp-field-icon-right" onClick={() => setShowPass(v => !v)} tabIndex={-1} type="button">
              {showPass ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
            </button>
          </div>

          <div className="lp-field">
            <span className="lp-field-icon-left"><HiOutlineLockClosed size={18} /></span>
            <input
              type={showConfirmPass ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={e => handleInputChange('confirmPassword', e.target.value)}
            />
            <button className="lp-field-icon-right" onClick={() => setShowConfirmPass(v => !v)} tabIndex={-1} type="button">
              {showConfirmPass ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
            </button>
          </div>

          {userRole === 'student' && (
            <div className="lp-field">
              <span className="lp-field-icon-left"><HiOutlineAcademicCap size={18} /></span>
              <select value={formData.studyLevel} onChange={e => handleInputChange('studyLevel', e.target.value)}>
                <option value="" disabled>Select Study Level</option>
                {studyLevels.map(level => <option key={level} value={level}>{level}</option>)}
              </select>
            </div>
          )}

          <div className="lp-field">
            <span className="lp-field-icon-left"><HiOutlineOfficeBuilding size={18} /></span>
            <select value={formData.faculty} onChange={e => handleInputChange('faculty', e.target.value)}>
              <option value="" disabled>Select Faculty</option>
              {Object.keys(facultyOptions).map(faculty => <option key={faculty} value={faculty}>{faculty}</option>)}
            </select>
          </div>

          {formData.faculty && (
            <div className="lp-field">
              <span className="lp-field-icon-left"><HiOutlineLibrary size={18} /></span>
              <select value={formData.department} onChange={e => handleInputChange('department', e.target.value)}>
                <option value="" disabled>Select Department</option>
                {facultyOptions[formData.faculty].map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>
          )}

          {error && <div className="lp-error">{error}</div>}
          {successMsg && <div className="lp-error" style={{ backgroundColor: '#e6fffa', borderColor: '#38b2ac', color: '#2c7a7b' }}>{successMsg}</div>}

          <button
            className={`lp-submit ${isFormValid() && !loading ? 'on' : 'off'}`}
            onClick={handleRegister}
            disabled={!isFormValid() || loading}
            style={{ marginTop: '10px' }}
          >
            {loading ? <><span className="lp-spinner" /> Registering...</> : <>Register <MdArrowForward size={20} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
