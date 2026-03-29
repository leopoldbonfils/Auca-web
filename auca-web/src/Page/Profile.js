import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RiEditLine, RiSaveLine } from 'react-icons/ri';
import { BsCalendar3 } from 'react-icons/bs';
import { GoLocation } from 'react-icons/go';
import { MdWorkOutline } from 'react-icons/md';
import { IoClose } from 'react-icons/io5';
import { BsCamera } from 'react-icons/bs';
import PostCard from '../component/PostCard';
import api from '../utils/api';

const TABS = ['Posts', 'Announcements', 'About'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('https://')) return url;
  if (url.startsWith('http://') && !url.includes('localhost') && !url.includes('127.0.0.1')) return url;
  return null;
}

function formatTimeFromUTC(utcTimestamp) {
  if (!utcTimestamp) return '';
  const messageDate = new Date(utcTimestamp);
  const now = new Date();
  const diffMs = now - messageDate;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();
  const isYesterday = (d) => { const y = new Date(now); y.setDate(y.getDate() - 1); return isSameDay(d, y); };
  const fmtTime = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  if (diffMin < 1)  return 'now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (isSameDay(messageDate, now)) return diffHrs < 2 ? `${diffHrs}h ago` : fmtTime(messageDate);
  if (isYesterday(messageDate)) return 'Yesterday';
  if (diffDays < 7) return messageDate.toLocaleDateString('en-US', { weekday: 'short' });
  if (messageDate.getFullYear() === now.getFullYear()) return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return messageDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatUserName(fullName) {
  if (!fullName) return '';
  const parts = fullName.trim().split(' ');
  if (parts.length <= 2) return fullName;
  const first = parts[0];
  const last = parts[parts.length - 1];
  const mids = parts.slice(1, -1).map(w => w.charAt(0).toUpperCase() + '.').join(' ');
  return `${first} ${mids} ${last}`;
}

const EMOJI_NAME_MAP = {
  love: '❤️', happy: '😄', laugh: '😂', thumbs_up: '👍',
  skull: '💀', angry: '😡', sad: '😢',
};

function parseReactions(raw) {
  if (!raw) return {};
  try {
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!Array.isArray(arr)) return {};
    const map = {};
    arr.forEach(name => {
      const emoji = EMOJI_NAME_MAP[name];
      if (emoji) map[emoji] = (map[emoji] || 0) + 1;
    });
    return map;
  } catch { return {}; }
}

function mapPost(post, myId) {
  const imageUrl = resolveImageUrl(post.FullUrl) || resolveImageUrl(post.ThumbnailUrl);
  return {
    id:           String(post.Id),
    rawId:        post.Id,
    author:       formatUserName(`${post.Fname || ''} ${post.Lname || ''}`.trim()),
    role:         post.Role       || '',
    department:   post.Department || '',
    timestamp:    formatTimeFromUTC(post.Timestamp),
    content:      post.Description || '',
    image:        imageUrl,
    thumbnailUrl: resolveImageUrl(post.ThumbnailUrl),
    avatarUrl:    resolveImageUrl(post.ProfileUrl),
    type:         'post',
    commentCount: post.PostComments  || 0,
    reactions:    parseReactions(post.ReactionTypes),
    reactionCount: post.PostReactions || 0,
    isOwner:      !!(myId && String(post.CreatorId) === String(myId)),
    _raw:         post,
  };
}

// ─── Edit Profile Modal — Twitter/X style ────────────────────────────────────
function EditProfileModal({ profile, isStaff, onClose, onSaved }) {
  const [form, setForm] = useState({
    Fname: profile?.Fname || '',
    Lname: profile?.Lname || '',
    Phone: profile?.Phone || '',
    Email: profile?.Email || '',
  });

  // Photo previews
  const [coverPreview,  setCoverPreview]  = useState(resolveImageUrl(profile?.CoverUrl)  || null);
  const [avatarPreview, setAvatarPreview] = useState(resolveImageUrl(profile?.ProfileUrl) || null);
  const [coverFile,     setCoverFile]     = useState(null);
  const [avatarFile,    setAvatarFile]    = useState(null);

  const coverInputRef  = useRef(null);
  const avatarInputRef = useRef(null);

  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (field, value) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleImagePick = (file, type) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'cover')  { setCoverPreview(reader.result);  setCoverFile(file); }
      if (type === 'avatar') { setAvatarPreview(reader.result); setAvatarFile(file); }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.Fname.trim() || !form.Lname.trim()) {
      setError('First and last name are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const endpoint = isStaff ? '/staff/profile' : '/student/profile';

      // If photos were changed, use FormData; otherwise JSON PATCH
      if (avatarFile || coverFile) {
        const formData = new FormData();
        Object.entries(form).forEach(([k, v]) => formData.append(k, v));
        if (avatarFile) formData.append('ProfileImage', avatarFile);
        if (coverFile)  formData.append('CoverImage',   coverFile);

        const token = localStorage.getItem('accessToken');
        const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        const res = await fetch(`${BASE_URL}${endpoint}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) {
          const d = await res.json().catch(() => null);
          throw new Error(d?.message || 'Failed to save profile.');
        }
      } else {
        await api.patch(endpoint, form);
      }

      setSuccess(true);
      setTimeout(() => {
        onSaved({ ...form, ProfileUrl: avatarPreview || profile?.ProfileUrl });
        onClose();
      }, 800);
    } catch (err) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const initials = `${form.Fname[0] || ''}${form.Lname[0] || ''}`.toUpperCase();

  const fields = [
    { key: 'Fname', label: 'First Name', placeholder: 'First name' },
    { key: 'Lname', label: 'Last Name',  placeholder: 'Last name' },
    { key: 'Phone', label: 'Phone',      placeholder: 'Phone number' },
    { key: 'Email', label: 'Email',      placeholder: 'Email address', type: 'email' },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeIn   { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp  { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin     { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
        .ep-cam-btn { transition: background 0.15s, transform 0.15s; }
        .ep-cam-btn:hover { background: rgba(0,0,0,0.75) !important; transform: scale(1.08); }
        .ep-input:focus { border-color: var(--primary) !important; }
      `}</style>

      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300, animation: 'fadeIn 0.15s ease' }} />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%', maxWidth: '520px',
        maxHeight: '90vh', overflowY: 'auto',
        background: 'var(--surface)', borderRadius: '18px',
        border: '1px solid var(--border)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        zIndex: 301, animation: 'slideUp 0.2s ease',
        fontFamily: "'Nunito', sans-serif",
      }}>

        {/* ── Top bar: × title Save ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px',
          position: 'sticky', top: 0, background: 'var(--surface)',
          borderBottom: '1px solid var(--border)', zIndex: 10,
          borderRadius: '18px 18px 0 0',
        }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 7, borderRadius: '50%', color: 'var(--text-primary)', display: 'flex', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            <IoClose size={20} />
          </button>

          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Edit Profile</span>

          <button onClick={handleSave} disabled={saving}
            style={{
              padding: '8px 20px', borderRadius: '50px', border: 'none',
              background: saving ? 'var(--border)' : 'var(--text-primary)',
              color: saving ? 'var(--text-muted)' : 'var(--surface)',
              fontSize: '14px', fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: "'Nunito', sans-serif", transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
            {saving
              ? <span style={{ width: 14, height: 14, border: '2px solid #aaa5', borderTop: '2px solid #aaa', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
              : 'Save'
            }
          </button>
        </div>

        {/* ── Cover photo area ── */}
        <div style={{ position: 'relative', height: '160px', background: coverPreview ? 'transparent' : 'linear-gradient(135deg, #0d3b8e, #1a4fa8, #f0a500)', overflow: 'hidden', flexShrink: 0 }}>
          {coverPreview && (
            <img src={coverPreview} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          )}
          {/* Dark overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />

          {/* Cover camera button */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <button
              className="ep-cam-btn"
              onClick={() => coverInputRef.current?.click()}
              title="Change cover photo"
              style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              <BsCamera size={18} />
            </button>

            {coverPreview && (
              <button
                className="ep-cam-btn"
                onClick={() => { setCoverPreview(null); setCoverFile(null); }}
                title="Remove cover photo"
                style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.25)',
                  color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                <IoClose size={18} />
              </button>
            )}
          </div>

          <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => handleImagePick(e.target.files[0], 'cover')} />
        </div>

        {/* ── Avatar overlapping cover ── */}
        <div style={{ padding: '0 20px', position: 'relative' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginTop: '-46px', marginBottom: '12px' }}>
            <div style={{
              width: '88px', height: '88px', borderRadius: '50%',
              border: '4px solid var(--surface)',
              background: avatarPreview ? 'transparent' : 'linear-gradient(135deg, #0d3b8e, #f0a500)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 900, fontSize: '28px',
              overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            }}>
              {avatarPreview
                ? <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials
              }
            </div>

            {/* Avatar camera overlay */}
            <button
              className="ep-cam-btn"
              onClick={() => avatarInputRef.current?.click()}
              title="Change profile photo"
              style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(0,0,0,0.45)', border: 'none',
                color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              <BsCamera size={20} />
            </button>

            <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => handleImagePick(e.target.files[0], 'avatar')} />
          </div>

          {/* ── Form fields ── */}
          <div style={{ paddingBottom: '24px' }}>
            {fields.map(f => (
              <div key={f.key} style={{ marginBottom: '16px' }}>
                <div style={{
                  border: '1.5px solid var(--border)', borderRadius: '10px',
                  padding: '8px 14px', background: 'var(--surface-2)',
                  transition: 'border-color 0.2s',
                }}
                  onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type || 'text'}
                    value={form[f.key]}
                    onChange={e => handleChange(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    style={{
                      width: '100%', border: 'none', outline: 'none', padding: 0,
                      fontSize: '15px', color: 'var(--text-primary)',
                      background: 'transparent', fontFamily: "'Nunito', sans-serif",
                      fontWeight: 600,
                    }}
                  />
                </div>
              </div>
            ))}

            {error && (
              <div style={{ background: '#fff5f5', border: '1px solid #fcc', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#c00', marginBottom: '12px' }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#166534', marginBottom: '12px' }}>
                ✅ Profile saved successfully!
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function SkeletonPostCard() {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: '6px', marginBottom: '3px', border: '1px solid var(--border)', padding: '16px 18px', overflow: 'hidden' }}>
      <style>{`.sk2{background:linear-gradient(90deg,var(--border) 25%,var(--surface-2) 50%,var(--border) 75%);background-size:700px 100%;animation:shimmer2 1.4s infinite linear;border-radius:6px}@keyframes shimmer2{0%{background-position:-700px 0}100%{background-position:700px 0}}`}</style>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
        <div className="sk2" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="sk2" style={{ height: 12, width: '40%', marginBottom: 8 }} />
          <div className="sk2" style={{ height: 10, width: '25%' }} />
        </div>
      </div>
      <div className="sk2" style={{ height: 12, width: '90%', marginBottom: 8 }} />
      <div className="sk2" style={{ height: 12, width: '65%' }} />
    </div>
  );
}

// ─── Main Profile component ───────────────────────────────────────────────────
export default function Profile({ onNavigate }) {
  const [activeTab,    setActiveTab]    = useState('Posts');
  const [showEdit,     setShowEdit]     = useState(false);
  const [profile,      setProfile]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [posts,        setPosts]        = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsFetched, setPostsFetched] = useState(false);
  const [stats,        setStats]        = useState({ posts: '—', reactions: '—', comments: '—' });

  const isStaff = localStorage.getItem('isStaff') === 'true';

  // ── Load profile ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const endpoint = isStaff ? '/staff/profile' : '/student/profile';
        const data = await api.get(endpoint);
        setProfile(data);
        const existing = JSON.parse(localStorage.getItem('userProfile') || '{}');
        localStorage.setItem('userProfile', JSON.stringify({ ...existing, ...data }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [isStaff]);

  // ── Load posts + stats ──────────────────────────────────────────────────────
  const loadMyPosts = useCallback(async () => {
    if (postsFetched) return;
    setPostsLoading(true);
    try {
      const p = JSON.parse(localStorage.getItem('userProfile') || '{}');
      const myId = p?.Id || p?.StudentId;
      const data = await api.get('/home/posts');
      const list = Array.isArray(data) ? data : (data.posts || []);
      const mine = list.filter(post => myId && String(post.CreatorId) === String(myId));
      const mapped = mine.map(post => mapPost(post, myId));
      setPosts(mapped);
      setPostsFetched(true);
      setStats({
        posts:     mine.length,
        reactions: mine.reduce((s, p) => s + (p.PostReactions || 0), 0),
        comments:  mine.reduce((s, p) => s + (p.PostComments  || 0), 0),
      });
    } catch (err) {
      console.warn('[Profile] posts load failed:', err.message);
    } finally {
      setPostsLoading(false);
    }
  }, [postsFetched]);

  useEffect(() => {
    if (activeTab === 'Posts' || activeTab === 'Announcements') loadMyPosts();
  }, [activeTab, loadMyPosts]);

  // ── Saved callback ──────────────────────────────────────────────────────────
  const handleProfileSaved = (updatedFields) => {
    setProfile(prev => ({ ...prev, ...updatedFields }));
    const existing = JSON.parse(localStorage.getItem('userProfile') || '{}');
    localStorage.setItem('userProfile', JSON.stringify({ ...existing, ...updatedFields }));
  };

  // ── Delete post ─────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await api.delete('/home/posts', { Id: Number(id) });
      setPosts(prev => prev.filter(p => p.id !== id));
      setStats(prev => ({ ...prev, posts: Math.max(0, Number(prev.posts) - 1) }));
    } catch (err) {
      alert('Could not delete: ' + err.message);
    }
  };

  // ── Derived values ──────────────────────────────────────────────────────────
  const fullName   = profile ? `${profile.Fname || ''} ${profile.Lname || ''}`.trim() : '—';
  const role       = profile?.Role || (isStaff ? 'Staff' : 'Student');
  const department = profile?.Department || profile?.StudDepartment || '—';
  const email      = profile?.Email || '—';
  const avatarUrl  = resolveImageUrl(profile?.ProfileUrl);
  const initials   = fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const metaItems = [
    { icon: <MdWorkOutline size={14} />, text: department },
    { icon: <GoLocation    size={14} />, text: 'Kigali, Rwanda' },
    { icon: <BsCalendar3   size={14} />, text: 'AUCA Member' },
  ];

  const statItems = [
    { label: 'Posts',     value: stats.posts },
    { label: 'Reactions', value: stats.reactions },
    { label: 'Comments',  value: stats.comments },
  ];

  const filteredPosts = posts.filter(p => {
    if (activeTab === 'Announcements') return p.type === 'announcement' || p.type === 'memo';
    return p.type === 'post';
  });

  if (loading) return (
    <div style={{ maxWidth: '680px', margin: '0 auto', fontFamily: "'Nunito', sans-serif", textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
      Loading profile...
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: '680px', margin: '0 auto', fontFamily: "'Nunito', sans-serif", textAlign: 'center', padding: '60px 20px', color: '#e53935' }}>
      {error}
    </div>
  );

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', fontFamily: "'Nunito', sans-serif" }}>

      {showEdit && (
        <EditProfileModal
          profile={profile}
          isStaff={isStaff}
          onClose={() => setShowEdit(false)}
          onSaved={handleProfileSaved}
        />
      )}

      {/* ── Profile card ── */}
      <div style={{ background: 'var(--surface)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '16px', boxShadow: 'var(--shadow)' }}>
        {/* Cover */}
        <div style={{ height: '110px', background: 'linear-gradient(135deg, #0d3b8e 0%, #1a4fa8 50%, #f0a500 100%)', position: 'relative' }}>
          {resolveImageUrl(profile?.CoverUrl) && (
            <img src={resolveImageUrl(profile.CoverUrl)} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          )}
        </div>

        <div style={{ padding: '0 20px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '12px' }}>
            {/* Avatar */}
            <div style={{ width: '76px', height: '76px', borderRadius: '50%', background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, #0d3b8e, #f0a500)', border: '3px solid var(--surface)', marginTop: '-38px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '26px', boxShadow: '0 4px 12px rgba(13,59,142,0.2)', overflow: 'hidden' }}>
              {avatarUrl
                ? <img src={avatarUrl} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials
              }
            </div>

            {/* Edit button */}
            <button onClick={() => setShowEdit(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '13px', fontWeight: 700, color: 'var(--primary)', cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Nunito', sans-serif" }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-pale)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}>
              <RiEditLine size={15} /> Edit Profile
            </button>
          </div>

          <div style={{ fontSize: '21px', fontWeight: 800, color: 'var(--text-primary)' }}>{fullName}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>{role} · {department}</div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
            {metaItems.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'flex' }}>{m.icon}</span>
                {m.text}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
            {statItems.map((s, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', borderRight: i < statItems.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>
                  {postsLoading ? '...' : s.value}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{ padding: '8px 16px', fontSize: '13px', fontWeight: activeTab === t ? 700 : 500, color: activeTab === t ? 'var(--primary)' : 'var(--text-secondary)', background: 'none', border: 'none', borderBottom: activeTab === t ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: '-1px', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'color 0.15s' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Posts tab */}
      {activeTab === 'Posts' && (
        <div style={{ paddingBottom: '40px' }}>
          {postsLoading && <><SkeletonPostCard /><SkeletonPostCard /></>}
          {!postsLoading && filteredPosts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>📝</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)' }}>No posts yet</div>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>Your posts will appear here</div>
              <button onClick={() => onNavigate && onNavigate('create')}
                style={{ marginTop: '16px', padding: '10px 22px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #0d3b8e, #1a4fa8)', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>
                Create a Post
              </button>
            </div>
          )}
          {!postsLoading && filteredPosts.map(post => (
            <PostCard key={post.id} post={post} onDelete={handleDelete}
              onComment={id => onNavigate && onNavigate({ page: 'comments', post: posts.find(p => p.id === id) })} />
          ))}
        </div>
      )}

      {/* Announcements tab */}
      {activeTab === 'Announcements' && (
        <div style={{ paddingBottom: '40px' }}>
          {postsLoading && <><SkeletonPostCard /><SkeletonPostCard /></>}
          {!postsLoading && filteredPosts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>📢</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)' }}>No announcements yet</div>
            </div>
          )}
          {!postsLoading && filteredPosts.map(post => (
            <PostCard key={post.id} post={post} onDelete={handleDelete}
              onComment={id => onNavigate && onNavigate({ page: 'comments', post: posts.find(p => p.id === id) })} />
          ))}
        </div>
      )}

      {/* About tab */}
      {activeTab === 'About' && (
        <div style={{ background: 'var(--surface)', borderRadius: '14px', padding: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', marginBottom: '40px' }}>
          {[
            { label: 'Full Name',  value: fullName },
            { label: 'Role',       value: role },
            { label: 'Department', value: department },
            { label: 'Email',      value: email },
            { label: 'Phone',      value: profile?.Phone ? `+250 ${profile.Phone}` : '—' },
            { label: 'Faculty',    value: profile?.StudFaculty || profile?.Faculty || '—' },
          ].map((item, i, arr) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{item.label}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 700 }}>{item.value}</span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}