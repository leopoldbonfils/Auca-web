import React, { useState, useRef, useEffect } from 'react';
import { IoArrowBack } from 'react-icons/io5';
import { BiLike, BiDislike } from 'react-icons/bi';
import { BiSolidLike, BiSolidDislike } from 'react-icons/bi';
import { BsThreeDotsVertical }from 'react-icons/bs';
import { MdDeleteOutline } from "react-icons/md";
import { BsFlag } from "react-icons/bs";
import api from '../utils/api';

//  Helpers 
function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}
function avatarBg(name = '') {
  const c = [
    'linear-gradient(135deg,#0d3b8e,#1a4fa8)',
    'linear-gradient(135deg,#7c3aed,#a855f7)',
    'linear-gradient(135deg,#059669,#34d399)',
    'linear-gradient(135deg,#dc2626,#f87171)',
    'linear-gradient(135deg,#d97706,#fbbf24)',
  ];
  return c[(name.charCodeAt(0) || 0) % c.length];
}

//  Three-dot menu (unchanged) 
function ThreeDotMenu({ onDelete, onReport }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button onClick={() => setOpen(p => !p)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: '50%', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', transition: 'background 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <BsThreeDotsVertical size={15} />
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '110%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 100, minWidth: '130px', overflow: 'hidden', animation: 'fadeIn 0.12s ease' }}>
          <button onClick={() => { onDelete(); setOpen(false); }}
            style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 650, color: '#e53935', textAlign: 'left', fontFamily: 'inherit', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          ><MdDeleteOutline size={22} /> Delete</button>
          <button onClick={() => { onReport(); setOpen(false); }}
            style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 650, color: 'var(--text-secondary)', textAlign: 'left', fontFamily: 'inherit', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          ><BsFlag size={18} /> Report</button>
        </div>
      )}
    </div>
  );
}

//  Single comment row 
function CommentRow({ c, onLike, onDislike, onDelete }) {
  const [showReply, setShowReply] = useState(false);
  const [reply, setReply] = useState('');
  const handleReport = () => alert(`Reported @${c.username}`);

  return (
    <div style={{ display: 'flex', gap: '12px', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 38, height: 38, borderRadius: '50%', background: avatarBg(c.username), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '13px', flexShrink: 0, marginTop: 2 }}>
        {c.avatar
          ? <img src={c.avatar} alt={c.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          : initials(c.username)
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
          <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>{c.username}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.time}</span>
          <div style={{ marginLeft: 'auto' }}>
            <ThreeDotMenu onDelete={() => onDelete(c.id)} onReport={handleReport} />
          </div>
        </div>
        <div style={{ fontSize: '14px', lineHeight: 1.55, color: 'var(--text-secondary)', marginBottom: '10px', wordBreak: 'break-word' }}>{c.text}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button onClick={() => onLike(c.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', padding: '5px 10px', borderRadius: '20px', color: c.liked ? 'var(--primary)' : 'var(--text-muted)', fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            {c.liked ? <BiSolidLike size={16} /> : <BiLike size={16} />}
            {c.likes > 0 && <span>{c.likes}</span>}
          </button>
          <button onClick={() => onDislike(c.id)}
            style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '5px 10px', borderRadius: '20px', color: c.disliked ? '#e53935' : 'var(--text-muted)', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            {c.disliked ? <BiSolidDislike size={16} /> : <BiDislike size={16} />}
          </button>
          <button onClick={() => setShowReply(p => !p)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'inherit', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >Reply</button>
        </div>
        {showReply && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: avatarBg('me'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '10px', flexShrink: 0 }}>Me</div>
            <input autoFocus value={reply} onChange={e => setReply(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && reply.trim()) { setReply(''); setShowReply(false); }}}
              placeholder={`Reply to ${c.username}...`}
              style={{ flex: 1, border: 'none', borderBottom: '2px solid var(--primary)', outline: 'none', fontSize: 13, padding: '4px 0', fontFamily: 'inherit', background: 'transparent', color: 'var(--text-primary)' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

//  Main Comment page 
export default function Comment({ post, onBack }) {
  const [comments,setComments] = useState([]);
  const [input,setInput]    = useState('');
  const [loading,setLoading]  = useState(true);
  const [posting,setPosting]  = useState(false);
  const bottomRef =useRef(null);

  const p = post || {};
  const postId = p.id || p._raw?.Id;
  const totalLikes = Object.values(p.reactions || {}).reduce((a, b) => a + b, 0);

  // CHANGE: fetch comments from backend when post changes
  useEffect(() => {
    if (!postId) { setLoading(false); return; }
    let cancelled = false;

    async function loadComments() {
      try {
        setLoading(true);
        const data = await api.get(`/home/posts/comment?postId=${postId}`);
        if (!cancelled) {
          // Map backend fields → local shape
          const list = Array.isArray(data) ? data : [];
          setComments(list.map(c => ({
            id:       c.Id,
            username: c.commentorNames || 'Unknown',
            avatar:   c.commentorProfile || null,
            text:     c.Text || '',
            time:     c.Timestamp ? new Date(c.Timestamp).toLocaleString() : '',
            likes:    0,
            liked:    false,
            disliked: false,
          })));
        }
      } catch {
        if (!cancelled) setComments([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadComments();
    return () => { cancelled = true; };
  }, [postId]);

  // Like / dislike (local only — no backend endpoint for comment likes)
  const handleLike = (id) =>
    setComments(prev => prev.map(c =>
      c.id === id ? { ...c, liked: !c.liked, disliked: false, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c
    ));

  const handleDislike = (id) =>
    setComments(prev => prev.map(c =>
      c.id === id ? { ...c, disliked: !c.disliked, liked: false, likes: c.liked ? c.likes - 1 : c.likes } : c
    ));

  // Local delete only (no delete endpoint for comments in backend yet)
  const handleDelete = (id) => setComments(prev => prev.filter(c => c.id !== id));

  // CHANGE: post comment to backend
  const handlePost = async () => {
    if (!input.trim() || !postId) return;
    setPosting(true);
    try {
      await api.post('/home/posts/comment', { postId: Number(postId), comment: input.trim() });
      // Add optimistically to local list
      setComments(prev => [...prev, {
        id:       Date.now(),
        username: 'You',
        avatar:   null,
        text:     input.trim(),
        time:     'Just now',
        likes:    0,
        liked:    false,
        disliked: false,
      }]);
      setInput('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (err) {
      alert('Failed to post comment: ' + err.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <div style={{ maxWidth: '600px', margin: '0 auto', fontFamily: "'Nunito', -apple-system, sans-serif", background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 80px)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: '50%', display: 'flex', alignItems: 'center', color: 'var(--text-primary)', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          ><IoArrowBack size={22} /></button>
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Comments</span>
          <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--text-muted)' }}>
            {comments.length} comment{comments.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Post preview (unchanged) */}
        {p.author && (
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', flexShrink: 0, background: avatarBg(p.author), color: '#fff', fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p.avatarUrl ? <img src={p.avatarUrl} alt={p.author} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : initials(p.author)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{p.author}</div>
                {(p.department || p.timestamp) && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{[p.department, p.timestamp].filter(Boolean).join(' · ')}</div>}
              </div>
            </div>
            {p.content && <div style={{ fontSize: '15px', lineHeight: 1.6, marginBottom: '13px', color: 'var(--text-primary)' }}>{p.content}</div>}
            {p.image && <div style={{ width: '100%', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}><img src={p.image} alt="post" style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: '320px' }} /></div>}
            {totalLikes > 0 && <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>{totalLikes.toLocaleString()} likes</div>}
          </div>
        )}

        {/* Comments list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px', maxHeight: '480px' }}>
          {loading && <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>Loading comments...</div>}
          {!loading && comments.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '32px', marginBottom: 8 }}></div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>No comments yet</div>
              <div style={{ fontSize: '13px', marginTop: 4 }}>Be the first to comment!</div>
            </div>
          )}
          {!loading && comments.map(c => (
            <CommentRow key={c.id} c={c} onLike={handleLike} onDislike={handleDislike} onDelete={handleDelete} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--surface)', position: 'sticky', bottom: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: avatarBg('me'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '10px', flexShrink: 0 }}>Me</div>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePost()}
            placeholder="Add a comment..."
            disabled={posting}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: 'var(--text-primary)', background: 'transparent', fontFamily: 'inherit' }}
          />
          <button
            onClick={handlePost}
            disabled={!input.trim() || posting}
            style={{ background: 'none', border: 'none', cursor: input.trim() && !posting ? 'pointer' : 'default', fontSize: '14px', fontWeight: 700, color: input.trim() && !posting ? 'var(--primary)' : 'var(--text-muted)', fontFamily: 'inherit', padding: 0, transition: 'color 0.15s' }}
          >
            {posting ? 'Posting...' : 'Post'}
          </button>
        </div>

      </div>
    </>
  );
}