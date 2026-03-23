// src/Page/Home.js
// CHANGE: replaced MOCK_POSTS with real API fetch from /home/posts
// FIX: mapPost now validates image URLs — only uses https:// Cloudinary URLs
// Everything else (tabs, PostCard rendering, delete logic) is unchanged.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import PostCard from '../component/PostCard';
import api from '../utils/api';

const TABS = ['All', 'Announcements', 'Posts'];

// FIX: Read real logged-in user info from localStorage for the avatar
function getCurrentUser() {
  try {
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const fname   = profile.Fname || '';
    const lname   = profile.Lname || '';
    const name    = `${fname} ${lname}`.trim() || 'User';
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const rawUrl   = profile.ProfileUrl || '';
    const avatarUrl = rawUrl.startsWith('https://') ? rawUrl : null;
    return { name, initials, avatarUrl };
  } catch {
    return { name: 'User', initials: 'U', avatarUrl: null };
  }
}

// Returns a valid image URL or null
// Rejects old localhost/local-file paths that no longer work
function resolveImageUrl(url) {
  if (!url) return null;
  // Only accept proper remote https URLs (Cloudinary, etc.)
  if (url.startsWith('https://')) return url;
  // http:// might work for some setups — allow it too
  if (url.startsWith('http://') && !url.includes('localhost') && !url.includes('127.0.0.1')) return url;
  // Everything else (localhost paths, file paths) → discard
  return null;
}

// Maps backend post fields → PostCard prop shape
function mapPost(post) {
  const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const myId    = profile?.Id || profile?.StudentId;

  // Prefer FullUrl (original), fall back to ThumbnailUrl
  const imageUrl = resolveImageUrl(post.FullUrl) || resolveImageUrl(post.ThumbnailUrl);

  return {
    id:           String(post.Id),
    author:       `${post.Fname || ''} ${post.Lname || ''}`.trim(),
    role:         post.Role         || '',
    department:   post.Department   || '',
    timestamp:    post.Timestamp
                    ? new Date(post.Timestamp).toLocaleString()
                    : '',
    content:      post.Description  || '',
    image:        imageUrl,
    thumbnailUrl: resolveImageUrl(post.ThumbnailUrl),
    // FIX: pass author's profile photo so PostCard shows real avatar
    avatarUrl:    resolveImageUrl(post.ProfileUrl),
    type:         'post',
    commentCount: post.PostComments  || 0,
    reactions:    {},
    isOwner:      !!(myId && String(post.CreatorId) === String(myId)),
    _raw:         post,
  };
}

export default function Home({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('All');
  const [posts,     setPosts]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  // FIX: real logged-in user for avatar in quick-create bar
  const currentUser = useMemo(() => getCurrentUser(), []);

  // Fetch posts on mount
  // useRef guard prevents double-fetch (React StrictMode or Fast Refresh)
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    let cancelled = false;

    async function loadPosts() {
      try {
        setLoading(true);
        setError('');
        // Use ?since= to hit the working backend query path
        // (the no-since path uses p.Audience which doesn't exist → 500)
        const data = await api.get('/home/posts?since=2000-01-01T00:00:00.000Z');
        if (!cancelled) {
          const list = Array.isArray(data) ? data : (data.posts || []);

          // FIX: deduplicate by post Id — React StrictMode runs effects twice
          // in development which can cause double fetches and duplicate entries
          const seen = new Set();
          const unique = list.filter(post => {
            if (seen.has(post.Id)) return false;
            seen.add(post.Id);
            return true;
          });

          setPosts(unique.map(mapPost));
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPosts();
    return () => { cancelled = true; };
  }, []);

  // Delete post — calls DELETE /home/posts then removes from local state
  const handleDelete = async (id) => {
    try {
      await api.delete('/home/posts', { Id: Number(id) });
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Could not delete post: ' + err.message);
    }
  };

  const filtered = posts.filter(p => {
    if (activeTab === 'Announcements') return p.type === 'announcement' || p.type === 'memo';
    if (activeTab === 'Posts')         return p.type === 'post';
    return true;
  });

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', fontFamily: "'Nunito', sans-serif" }}>

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Home</h2>
      </div>

      {/* ── Quick create ── */}
      <div style={{
        background: 'var(--surface)', borderRadius: '14px', padding: '14px 16px',
        marginBottom: '16px', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: '12px',
        boxShadow: 'var(--shadow)',
      }}>
        {/* FIX: show real profile image in quick-create bar */}
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: currentUser.avatarUrl ? 'transparent' : 'linear-gradient(135deg, #0d3b8e, #f0a500)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: '14px', flexShrink: 0,
          overflow: 'hidden',
        }}>
          {currentUser.avatarUrl
            ? <img src={currentUser.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
            : currentUser.initials
          }
        </div>
        <input
          readOnly
          onClick={() => onNavigate && onNavigate('create')}
          placeholder="Share something with AUCA..."
          style={{
            flex: 1, padding: '10px 14px', borderRadius: '22px',
            border: '1px solid var(--border)', background: 'var(--surface-2)',
            fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer',
            outline: 'none', fontFamily: "'Nunito', sans-serif",
          }}
        />
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{
              padding: '8px 16px', fontSize: '13px',
              fontWeight: activeTab === t ? 700 : 500,
              color: activeTab === t ? 'var(--primary)' : 'var(--text-secondary)',
              background: 'none', border: 'none',
              borderBottom: activeTab === t ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: '-1px', cursor: 'pointer',
              fontFamily: "'Nunito', sans-serif", transition: 'color 0.15s',
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Feed ── */}
      <div style={{ paddingBottom: '40px' }}>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{
              width: '36px', height: '36px', border: '3px solid var(--border)',
              borderTop: '3px solid var(--primary)', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 14px',
            }} />
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Loading posts...</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {error && !loading && (
          <div style={{
            textAlign: 'center', padding: '40px 20px',
            background: '#fff5f5', borderRadius: '14px',
            border: '1px solid #fcc', margin: '0 0 16px',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}></div>
            <div style={{ fontSize: '14px', color: '#c00', fontWeight: 600 }}>{error}</div>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '12px', padding: '8px 20px', borderRadius: '8px',
                background: 'var(--primary)', color: '#fff', border: 'none',
                cursor: 'pointer', fontSize: '13px', fontWeight: 700,
                fontFamily: "'Nunito', sans-serif",
              }}
            >Try Again</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}></div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>No posts yet</div>
            <div style={{ fontSize: '13px', marginTop: '6px', color: 'var(--text-muted)' }}>Be the first to share something!</div>
          </div>
        )}

        {!loading && !error && filtered.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onDelete={handleDelete}
            onComment={id => onNavigate({ page: 'comments', post: posts.find(p => p.id === id) })}
          />
        ))}
      </div>

    </div>
  );
}