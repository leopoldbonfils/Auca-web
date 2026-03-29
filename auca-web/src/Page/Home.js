import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import PostCard from '../component/PostCard';
import api from '../utils/api';
import { io } from 'socket.io-client';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const TABS = ['All', 'Announcements', 'Posts'];

//  Emoji name → character map (mirrors the app's emojiData) 
const EMOJI_NAME_MAP = {
  love: '❤️', happy: '😄', laugh: '😂', thumbs_up: '👍',
  skull: '💀', angry: '😡', sad: '😢',
};

//  Feature 5: relative timestamp (mirrors app's formatTimeFromUTC) 
function formatTimeFromUTC(utcTimestamp) {
  if (!utcTimestamp) return '';
  const messageDate = new Date(utcTimestamp);
  const now = new Date();
  const diffMs = now - messageDate;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();
  const isYesterday = (d) => {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    return isSameDay(d, y);
  };
  const fmtTime = (d) =>
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (diffMin < 1)  return 'now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (isSameDay(messageDate, now))
    return diffHrs < 2 ? `${diffHrs}h ago` : fmtTime(messageDate);
  if (isYesterday(messageDate)) return 'Yesterday';
  if (diffDays < 7) return messageDate.toLocaleDateString('en-US', { weekday: 'short' });
  if (messageDate.getFullYear() === now.getFullYear())
    return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return messageDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

//  Author name abbreviator (mirrors app's formatUserName) 
function formatUserName(fullName) {
  if (!fullName) return '';
  const parts = fullName.trim().split(' ');
  if (parts.length <= 2) return fullName;
  const first = parts[0];
  const last  = parts[parts.length - 1];
  const mids  = parts.slice(1, -1).map(w => w.charAt(0).toUpperCase() + '.').join(' ');
  return `${first} ${mids} ${last}`;
}

//  Helpers 
function getCurrentUser() {
  try {
    const p = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const name = `${p.Fname || ''} ${p.Lname || ''}`.trim() || 'User';
    const initials  = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const rawUrl    = p.ProfileUrl || '';
    const avatarUrl = rawUrl.startsWith('https://') ? rawUrl : null;
    return { name, initials, avatarUrl };
  } catch {
    return { name: 'User', initials: 'U', avatarUrl: null };
  }
}

function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('https://')) return url;
  if (url.startsWith('http://') && !url.includes('localhost') && !url.includes('127.0.0.1')) return url;
  return null;
}

// Parse backend ReactionTypes (JSON string or array) → { emoji: count }
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

function mapPost(post) {
  const p   = JSON.parse(localStorage.getItem('userProfile') || '{}');
  const myId = p?.Id || p?.StudentId;
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

//  Feature 7: Toast component 
function Toast({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div style={{
      position: 'fixed', top: '20px', right: '20px',
      zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          padding: '12px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
          color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.25)', maxWidth: '300px',
          background:
            t.type === 'success' ? '#16a34a' :
            t.type === 'error'   ? '#dc2626' : '#2563eb',
          animation: 'toastSlideIn 0.25s ease',
        }}>
          {t.message}
        </div>
      ))}
      <style>{`
        @keyframes toastSlideIn {
          from { opacity:0; transform:translateX(40px); }
          to   { opacity:1; transform:translateX(0);    }
        }
      `}</style>
    </div>
  );
}

//  Feature 4: Shimmer skeleton loader 
function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--surface)', borderRadius: '6px',
      marginBottom: '3px', border: '1px solid var(--border)',
      padding: '16px 18px', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -700px 0; }
          100% { background-position:  700px 0; }
        }
        .sk {
          background: linear-gradient(
            90deg,
            var(--border) 25%,
            var(--surface-2) 50%,
            var(--border) 75%
          );
          background-size: 700px 100%;
          animation: shimmer 1.4s infinite linear;
          border-radius: 6px;
        }
      `}</style>

      {/* Header row */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
        <div className="sk" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="sk" style={{ height: 13, width: '40%', marginBottom: 8 }} />
          <div className="sk" style={{ height: 11, width: '25%' }} />
        </div>
      </div>

      {/* Text lines */}
      <div className="sk" style={{ height: 13, width: '90%', marginBottom: 8 }} />
      <div className="sk" style={{ height: 13, width: '65%', marginBottom: 14 }} />

      {/* Image placeholder */}
      <div className="sk" style={{ height: 200, width: '100%', borderRadius: 8, marginBottom: 14 }} />

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {[80, 90, 70].map((w, i) => (
          <div key={i} className="sk" style={{ height: 32, width: w, borderRadius: 20 }} />
        ))}
      </div>
    </div>
  );
}

function SkeletonFeed() {
  return <>{[1, 2, 3].map(i => <SkeletonCard key={i} />)}</>;
}

//  Main component 
export default function Home({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('All');
  const [posts,     setPosts]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [toasts,    setToasts]    = useState([]);

  const currentUser = useMemo(() => getCurrentUser(), []);
  const hasFetched  = useRef(false);

  //  Toast helper 
  const showToast = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  //  Merge incoming posts (deduplicated, newest-first) ─
  const mergePosts = useCallback((incoming) => {
    if (!Array.isArray(incoming) || incoming.length === 0) return;
    setPosts(prev => {
      const existingIds = new Set(prev.map(p => p.rawId ?? Number(p.id)));
      const fresh = incoming
        .filter(p => p && (p.Id || p.rawId) && !existingIds.has(p.Id ?? p.rawId))
        .map(p => (p._raw ? p : mapPost(p)));
      if (fresh.length === 0) return prev;
      return [...fresh, ...prev].sort(
        (a, b) => new Date(b._raw?.Timestamp || 0) - new Date(a._raw?.Timestamp || 0),
      );
    });
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    let cancelled = false;

    async function loadPosts() {
      try {
        setLoading(true);
        setError('');

        // Always fetch all posts — no date filter
        const data = await api.get('/home/posts');
        if (cancelled) return;

        const list = Array.isArray(data) ? data : (data.posts || []);
        const seen = new Set();
        const unique = list.filter(post => {
          if (seen.has(post.Id)) return false;
          seen.add(post.Id);
          return true;
        });

        const mappedPosts = unique.map(mapPost);
        setPosts(mappedPosts);

        // Feature 6: refresh reaction counts from server
        if (unique.length > 0) {
          try {
            const postIds = unique.map(p => p.Id);
            const reactionData = await api.patch('/home/posts/reactions', { postIds });
            if (!cancelled && Array.isArray(reactionData) && reactionData.length > 0) {
              const rMap = new Map(reactionData.map(r => [r.PostId, r]));
              setPosts(prev =>
                prev.map(post => {
                  const upd = rMap.get(post.rawId);
                  if (!upd) return post;
                  return {
                    ...post,
                    reactions:     parseReactions(upd.ReactionTypes),
                    reactionCount: upd.count,
                  };
                }),
              );
            }
          } catch (e) {
            console.warn('[Home] Reaction sync failed:', e.message);
          }
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

  useEffect(() => {
    return () => {
      hasFetched.current = false;
    };
  }, []);

  //  Features 3, 7, 10, 11: Socket.IO 
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    let socket;
    try {
      socket = io(BASE_URL, {
        transports: ['websocket', 'polling'],
        auth: { token },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        timeout: 20000,
      });
    } catch (e) {
      console.warn('[Socket] Failed to initialise:', e.message);
      return;
    }

    socket.on('connect', () =>
      console.log('[Socket] Connected to feed — id:', socket.id));

    socket.on('connect_error', (err) =>
      console.warn('[Socket] Connection error:', err.message));

    // Feature 3 & 7: new post pushed by server
    socket.on('newPost', (payload) => {
      const incoming = Array.isArray(payload) ? payload : [payload];
      mergePosts(incoming);
      showToast('info', '✨ New post just arrived!');
    });

    // Feature 11: post deleted → remove from everyone's feed
    socket.on('postDeleted', ({ PostId }) => {
      setPosts(prev => prev.filter(p => p.rawId !== PostId && p.id !== String(PostId)));
    });

    // Feature 6: live reaction count update
    socket.on('reactionUpdate', (data) => {
      setPosts(prev =>
        prev.map(post => {
          if (post.rawId !== data.PostId) return post;
          return {
            ...post,
            reactions:     parseReactions(data.ReactionTypes),
            reactionCount: data.count,
          };
        }),
      );
    });

    // Feature 10: live comment count update
    socket.on('commentAdded', ({ PostId, commentCount }) => {
      setPosts(prev =>
        prev.map(post =>
          post.rawId !== PostId ? post : { ...post, commentCount },
        ),
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [mergePosts, showToast]);

  //  Delete post 
  const handleDelete = async (id) => {
    try {
      await api.delete('/home/posts', { Id: Number(id) });
      setPosts(prev => prev.filter(p => p.id !== id));
      showToast('success', 'Post deleted.');
    } catch (err) {
      showToast('error', 'Could not delete: ' + err.message);
    }
  };

  const filtered = posts.filter(p => {
    if (activeTab === 'Announcements') return p.type === 'announcement' || p.type === 'memo';
    if (activeTab === 'Posts')         return p.type === 'post';
    return true;
  });

  
  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', fontFamily: "'Nunito', sans-serif" }}>

      {/* Feature 7 toasts */}
      <Toast toasts={toasts} />

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Home</h2>
      </div>

      {/* Quick-create bar */}
      <div style={{
        background: 'var(--surface)', borderRadius: '14px', padding: '14px 16px',
        marginBottom: '16px', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: '12px', boxShadow: 'var(--shadow)',
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
          background: currentUser.avatarUrl ? 'transparent' : 'linear-gradient(135deg, #0d3b8e, #f0a500)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: '14px',
        }}>
          {currentUser.avatarUrl
            ? <img src={currentUser.avatarUrl} alt="me" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
            : currentUser.initials}
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding: '8px 16px', fontSize: '13px',
            fontWeight: activeTab === t ? 700 : 500,
            color: activeTab === t ? 'var(--primary)' : 'var(--text-secondary)',
            background: 'none', border: 'none',
            borderBottom: activeTab === t ? '2px solid var(--primary)' : '2px solid transparent',
            marginBottom: '-1px', cursor: 'pointer',
            fontFamily: "'Nunito', sans-serif", transition: 'color 0.15s',
          }}>{t}</button>
        ))}
      </div>

      {/* Feed */}
      <div style={{ paddingBottom: '40px' }}>

        {/* Feature 4: shimmer skeleton while loading */}
        {loading && <SkeletonFeed />}

        {error && !loading && (
          <div style={{
            textAlign: 'center', padding: '40px 20px',
            background: '#fff5f5', borderRadius: '14px', border: '1px solid #fcc',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}></div>
            <div style={{ fontSize: '14px', color: '#c00', fontWeight: 600 }}>{error}</div>
            <button onClick={() => window.location.reload()} style={{
              marginTop: '12px', padding: '8px 20px', borderRadius: '8px',
              background: 'var(--primary)', color: '#fff', border: 'none',
              cursor: 'pointer', fontSize: '13px', fontWeight: 700,
              fontFamily: "'Nunito', sans-serif",
            }}>Try Again</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
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