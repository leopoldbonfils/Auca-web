import React, { useState, useRef } from 'react';

// ── Icons ─────────────────────────────────────────────────────────────────────
const ImageIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="8" strokeWidth="3" />
    <line x1="12" y1="12" x2="12" y2="16" />
  </svg>
);



// ── Audience options ──────────────────────────────────────────────────────────
const AUDIENCES = [
  { id: 'everyone',      label: 'Everyone',      sub: 'Students, Staff and Faculty' },
  { id: 'students_only', label: 'Students Only', sub: 'From all faculties' },
  { id: 'staff_only',    label: 'Staff Only',    sub: 'Including lecturers' },
];

// ── Post types ────────────────────────────────────────────────────────────────
const POST_TYPES = [
  { id: 'post',         label: 'Post' },
  { id: 'announcement', label: 'Announcement' },
  { id: 'memo',         label: 'Memo' },
];

// ── CreatePost component ──────────────────────────────────────────────────────
export default function CreatePost({ onNavigate, onPostCreated }) {
  const [postType,   setPostType]   = useState('post');
  const [content,    setContent]    = useState('');
  const [audience,   setAudience]   = useState('everyone');
  const [imageFile,  setImageFile]  = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isPosting,  setIsPosting]  = useState(false);
  const [dragOver,   setDragOver]   = useState(false);

  const fileInputRef = useRef(null);

  // ── Handle image select ──
  const handleImageChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Please select an image file.');
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e) => handleImageChange(e.target.files[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleImageChange(e.dataTransfer.files[0]);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Submit ──
  const handlePost = async () => {
    if (!content.trim()) return alert('Please write something before posting.');
    setIsPosting(true);

    // Simulate API call — replace with your actual API later
    await new Promise(r => setTimeout(r, 1200));

    const newPost = {
      id: Date.now().toString(),
      author: 'Rutanga Claude',
      role: 'Accountant',
      department: 'Finance',
      timestamp: 'Just now',
      content: content.trim(),
      image: imagePreview || null,
      type: postType,
      commentCount: 0,
      reactions: {},
      isOwner: true,
      audience,
    };

    setIsPosting(false);
    if (onPostCreated) onPostCreated(newPost);
    if (onNavigate)    onNavigate('home');
  };

  const charLimit  = 500;
  const charLeft   = charLimit - content.length;
  const isOverLimit = charLeft < 0;

  return (
    <div style={{
      maxWidth: '640px',
      margin: '0 auto',
      fontFamily: "'Nunito', sans-serif",
    }}>

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        marginBottom: '24px',
      }}>
        
        <div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f1923' }}>Create Post</div>
          <div style={{ fontSize: '12px', color: '#5a6a82' }}>Share something with AUCA</div>
        </div>
      </div>

      {/* ── Post type tabs ── */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '20px',
        background: '#f4f6fb', padding: '4px', borderRadius: '12px',
      }}>
        {POST_TYPES.map(pt => (
          <button
            key={pt.id}
            onClick={() => setPostType(pt.id)}
            style={{
              flex: 1, padding: '8px 0', borderRadius: '9px',
              border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700,
              background: postType === pt.id ? '#fff' : 'transparent',
              color: postType === pt.id ? '#0d3b8e' : '#5a6a82',
              boxShadow: postType === pt.id ? '0 1px 6px rgba(13,59,142,0.12)' : 'none',
              transition: 'all 0.15s',
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            {pt.label}
          </button>
        ))}
      </div>

      {/* ── Text area ── */}
      <div style={{
        background: '#fff', borderRadius: '14px',
        border: `1.5px solid ${isOverLimit ? '#e53935' : content.length > 0 ? '#0d3b8e44' : '#e2e8f0'}`,
        marginBottom: '14px', overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(13,59,142,0.05)',
        transition: 'border-color 0.2s',
      }}>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={
            postType === 'announcement'
              ? 'Write your announcement here...'
              : postType === 'memo'
              ? 'Write your memo here...'
              : 'Write your post description here...'
          }
          style={{
            width: '100%', minHeight: '140px', padding: '16px',
            border: 'none', outline: 'none', resize: 'vertical',
            fontSize: '14px', color: '#1e293b', lineHeight: 1.7,
            fontFamily: "'Nunito', sans-serif", background: 'transparent',
          }}
        />
        {/* Char counter */}
        <div style={{
          padding: '8px 16px', borderTop: '1px solid #f1f5f9',
          textAlign: 'right', fontSize: '12px',
          color: isOverLimit ? '#e53935' : charLeft < 50 ? '#f0a500' : '#94a3b8',
          fontWeight: 600,
        }}>
          {charLeft} characters remaining
        </div>
      </div>

      {/* ── Image upload ── */}
      {imagePreview ? (
        <div style={{
          position: 'relative', borderRadius: '14px', overflow: 'hidden',
          marginBottom: '14px', border: '1px solid #e2e8f0',
        }}>
          <img src={imagePreview} alt="preview" style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block' }} />
          <button
            onClick={removeImage}
            style={{
              position: 'absolute', top: '10px', right: '10px',
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)', border: 'none',
              color: '#fff', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            <CloseIcon />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragOver ? '#0d3b8e' : '#c8d6e8'}`,
            borderRadius: '14px', padding: '28px 20px',
            marginBottom: '14px', textAlign: 'center',
            cursor: 'pointer', background: dragOver ? '#e8f0fe' : '#f8faff',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#0d3b8e'; e.currentTarget.style.background = '#f0f5ff'; }}
          onMouseLeave={e => { if (!dragOver) { e.currentTarget.style.borderColor = '#c8d6e8'; e.currentTarget.style.background = '#f8faff'; }}}
        >
          <div style={{ color: '#94a3b8', marginBottom: '8px' }}><ImageIcon /></div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#5a6a82' }}>Add Image (Optional)</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Click to browse or drag & drop</div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />

      {/* ── Select Audience ── */}
      <div style={{
        background: '#fff', borderRadius: '14px', padding: '18px',
        marginBottom: '14px', border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(13,59,142,0.05)',
      }}>
        <div style={{
          fontSize: '15px', fontWeight: 800, color: '#0d3b8e',
          marginBottom: '14px', letterSpacing: '0.2px',
        }}>
          Select Audience
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {AUDIENCES.map(a => (
            <label
              key={a.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                background: audience === a.id ? '#e8f0fe' : 'transparent',
                border: `1px solid ${audience === a.id ? '#0d3b8e22' : 'transparent'}`,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (audience !== a.id) e.currentTarget.style.background = '#f4f6fb'; }}
              onMouseLeave={e => { if (audience !== a.id) e.currentTarget.style.background = 'transparent'; }}
            >
              {/* Custom radio */}
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${audience === a.id ? '#0d3b8e' : '#c8d6e8'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#fff', transition: 'all 0.15s',
              }}>
                {audience === a.id && (
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: '#0d3b8e',
                  }} />
                )}
              </div>

              <input
                type="radio"
                name="audience"
                value={a.id}
                checked={audience === a.id}
                onChange={() => setAudience(a.id)}
                style={{ display: 'none' }}
              />

              <div>
                <div style={{
                  fontSize: '14px', fontWeight: 700,
                  color: audience === a.id ? '#0d3b8e' : '#0f1923',
                }}>
                  {a.label}
                </div>
                <div style={{ fontSize: '12px', color: '#5a6a82', marginTop: '1px' }}>
                  {a.sub}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* ── Info notice ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '10px',
        background: '#f4f6fb', borderRadius: '10px', padding: '12px 14px',
        marginBottom: '20px', border: '1px solid #e2e8f0',
      }}>
        <span style={{ color: '#5a6a82', marginTop: '1px', flexShrink: 0 }}><InfoIcon /></span>
        <span style={{ fontSize: '13px', color: '#5a6a82', lineHeight: 1.6 }}>
          Your post will only be visible to the selected audience.
        </span>
      </div>

      {/* ── Post button ── */}
      <button
        onClick={handlePost}
        disabled={isPosting || isOverLimit || !content.trim()}
        style={{
          width: '100%', padding: '16px',
          borderRadius: '14px', border: 'none',
          background: isPosting || !content.trim() || isOverLimit
            ? '#c8d6e8'
            : 'linear-gradient(135deg, #0d3b8e, #1a4fa8)',
          color: isPosting || !content.trim() || isOverLimit ? '#94a3b8' : '#fff',
          fontSize: '16px', fontWeight: 800,
          cursor: isPosting || !content.trim() || isOverLimit ? 'not-allowed' : 'pointer',
          boxShadow: !isPosting && content.trim() && !isOverLimit
            ? '0 4px 16px rgba(13,59,142,0.3)'
            : 'none',
          transition: 'all 0.2s ease',
          letterSpacing: '0.5px',
          fontFamily: "'Nunito', sans-serif",
        }}
        onMouseEnter={e => {
          if (!isPosting && content.trim() && !isOverLimit)
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(13,59,142,0.4)';
        }}
        onMouseLeave={e => {
          if (!isPosting && content.trim() && !isOverLimit)
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(13,59,142,0.3)';
        }}
      >
        {isPosting ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <span style={{
              width: '18px', height: '18px', border: '2px solid #ffffff55',
              borderTop: '2px solid #fff', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', display: 'inline-block',
            }} />
            Posting...
          </span>
        ) : 'Post'}
      </button>

      {/* Spinner keyframe */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
}