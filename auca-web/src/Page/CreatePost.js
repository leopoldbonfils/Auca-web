import React, { useState, useRef } from 'react';
import { BsImage }        from 'react-icons/bs';
import { IoClose }        from 'react-icons/io5';
import { BsInfoCircle }   from 'react-icons/bs';

//  Audience options 
const AUDIENCES = [
  { id: 'everyone',      label: 'Everyone',      sub: 'Students, Staff and Faculty' },
  { id: 'students_only', label: 'Students Only', sub: 'From all faculties' },
  { id: 'staff_only',    label: 'Staff Only',    sub: 'Including lecturers' },
];

//  Post types 
const POST_TYPES = [
  { id: 'post',         label: 'Post' },
  { id: 'announcement', label: 'Announcement' },
  { id: 'memo',         label: 'Memo' },
];

//  CreatePost component 
export default function CreatePost({ onNavigate, onPostCreated }) {
  const [postType,     setPostType]     = useState('post');
  const [content,      setContent]      = useState('');
  const [audience,     setAudience]     = useState('everyone');
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isPosting,    setIsPosting]    = useState(false);
  const [dragOver,     setDragOver]     = useState(false);

  const fileInputRef = useRef(null);

  //  Handle image select 
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

  //  Submit 
  const handlePost = async () => {
    if (!content.trim()) return alert('Please write something before posting.');
    setIsPosting(true);

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

  const charLimit   = 500;
  const charLeft    = charLimit - content.length;
  const isOverLimit = charLeft < 0;

  return (
    <div style={{
      maxWidth: '640px',
      margin: '0 auto',
      fontFamily: "'Nunito', sans-serif",
    }}>

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>Create Post</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Share something with AUCA</div>
        </div>
      </div>

      {/* ── Post type tabs ── */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '20px',
        background: 'var(--surface-2)', padding: '4px', borderRadius: '12px',
      }}>
        {POST_TYPES.map(pt => (
          <button
            key={pt.id}
            onClick={() => setPostType(pt.id)}
            style={{
              flex: 1, padding: '8px 0', borderRadius: '9px',
              border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700,
              background: postType === pt.id ? 'var(--surface)' : 'transparent',
              color: postType === pt.id ? 'var(--primary)' : 'var(--text-secondary)',
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
        background: 'var(--surface)', borderRadius: '14px',
        border: `1.5px solid ${isOverLimit ? '#e53935' : content.length > 0 ? '#0d3b8e44' : 'var(--border)'}`,
        marginBottom: '14px', overflow: 'hidden',
        boxShadow: 'var(--shadow)',
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
            fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.7,
            fontFamily: "'Nunito', sans-serif", background: 'transparent',
          }}
        />
        {/* Char counter */}
        <div style={{
          padding: '8px 16px', borderTop: '1px solid var(--border)',
          textAlign: 'right', fontSize: '12px',
          color: isOverLimit ? '#e53935' : charLeft < 50 ? '#f0a500' : 'var(--text-muted)',
          fontWeight: 600,
        }}>
          {charLeft} characters remaining
        </div>
      </div>

      {/* ── Image upload ── */}
      {imagePreview ? (
        <div style={{
          position: 'relative', borderRadius: '14px', overflow: 'hidden',
          marginBottom: '14px', border: '1px solid var(--border)',
        }}>
          <img src={imagePreview} alt="preview"
            style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', display: 'block' }} />
          {/* ── Close: IoClose from react-icons/io5 ── */}
          <button
            onClick={removeImage}
            style={{
              position: 'absolute', top: '10px', right: '10px',
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)', border: 'none',
              color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            <IoClose size={18} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: '14px', padding: '28px 20px',
            marginBottom: '14px', textAlign: 'center',
            cursor: 'pointer', background: dragOver ? 'var(--primary-pale)' : 'var(--surface-2)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-pale)'; }}
          onMouseLeave={e => { if (!dragOver) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface-2)'; }}}
        >
          {/* ── Image: BsImage from react-icons/bs ── */}
          <div style={{ color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
            <BsImage size={32} />
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)' }}>Add Image (Optional)</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Click to browse or drag & drop</div>
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
        background: 'var(--surface)', borderRadius: '14px', padding: '18px',
        marginBottom: '14px', border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
      }}>
        <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)', marginBottom: '14px', letterSpacing: '0.2px' }}>
          Select Audience
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {AUDIENCES.map(a => (
            <label
              key={a.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                background: audience === a.id ? 'var(--primary-pale)' : 'transparent',
                border: `1px solid ${audience === a.id ? '#0d3b8e22' : 'transparent'}`,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (audience !== a.id) e.currentTarget.style.background = 'var(--surface-2)'; }}
              onMouseLeave={e => { if (audience !== a.id) e.currentTarget.style.background = 'transparent'; }}
            >
              {/* Custom radio */}
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${audience === a.id ? 'var(--primary)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--surface)', transition: 'all 0.15s',
              }}>
                {audience === a.id && (
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }} />
                )}
              </div>

              <input
                type="radio" name="audience" value={a.id}
                checked={audience === a.id}
                onChange={() => setAudience(a.id)}
                style={{ display: 'none' }}
              />

              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: audience === a.id ? 'var(--primary)' : 'var(--text-primary)' }}>
                  {a.label}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' }}>
                  {a.sub}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* ── Info notice — BsInfoCircle from react-icons/bs ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '10px',
        background: 'var(--surface-2)', borderRadius: '10px', padding: '12px 14px',
        marginBottom: '20px', border: '1px solid var(--border)',
      }}>
        <BsInfoCircle size={18} style={{ color: 'var(--text-secondary)', marginTop: '1px', flexShrink: 0 }} />
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
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
            ? 'var(--border)'
            : 'linear-gradient(135deg, #0d3b8e, #1a4fa8)',
          color: isPosting || !content.trim() || isOverLimit ? 'var(--text-muted)' : '#fff',
          fontSize: '16px', fontWeight: 800,
          cursor: isPosting || !content.trim() || isOverLimit ? 'not-allowed' : 'pointer',
          boxShadow: !isPosting && content.trim() && !isOverLimit ? '0 4px 16px rgba(13,59,142,0.3)' : 'none',
          transition: 'all 0.2s ease',
          letterSpacing: '0.5px',
          fontFamily: "'Nunito', sans-serif",
        }}
        onMouseEnter={e => { if (!isPosting && content.trim() && !isOverLimit) e.currentTarget.style.boxShadow = '0 6px 24px rgba(13,59,142,0.4)'; }}
        onMouseLeave={e => { if (!isPosting && content.trim() && !isOverLimit) e.currentTarget.style.boxShadow = '0 4px 16px rgba(13,59,142,0.3)'; }}
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

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
}