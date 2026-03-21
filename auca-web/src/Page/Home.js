import React, { useState } from 'react';
import PostCard from '../component/PostCard';

const MOCK_POSTS = [
  {
    id: '1',
    author: 'Rutanga Claude',
    role: 'Accountant',
    department: 'Finance',
    timestamp: 'Mar 9 at 10:52 AM',
    content: 'Creativity has no language 🙏😂 — Check out this amazing water flow experiment!',
    image: 'https://picsum.photos/seed/science/800/500',
    type: 'post',
    commentCount: 3,
    reactions: { '😄': 2, '❤️': 1 },
    isOwner: false,
  },
  {
    id: '2',
    author: 'Mugisha Leopold',
    role: 'Lecturer',
    department: 'Accounting',
    timestamp: 'Mar 3 at 6:18 PM',
    type: 'announcement',
    content: `Subject: Invitation for today's General Assembly\n\nGreetings dear students.\nThis reminder goes to all Gishushu Students to invite them in today's General Assembly, your presence will be highly valued.\nDo not plan to miss and be there on time.\n\nYou are amazing!\n\nYedidia KWAME`,
    commentCount: 0,
    reactions: { '❤️': 2, '😮': 1 },
    isOwner: true,
  },
  {
    id: '3',
    author: 'Mugisha Leopold',
    role: 'Lecturer',
    department: 'Accounting',
    timestamp: 'Mar 3 at 6:16 PM',
    type: 'memo',
    content: `TO: All students,\nSubject: Announcing enhanced new communication channel.\n\nDear Students,\n\nOn behalf of AUCA-SA, we are pleased to introduce a new and improved communication channel for all students.\n\nThis platform has been designed as a one-way communication channel to ensure clear delivery of official information while enhancing individual privacy.\n\nThe link to join will be shared in the general groups.`,
    commentCount: 0,
    reactions: { '❤️': 2, '💀': 1 },
    isOwner: true,
  },
  {
    id: '4',
    author: 'Uwase Aline',
    role: 'Student',
    department: 'IT',
    timestamp: 'Mar 2 at 9:00 AM',
    content: 'Great lecture today on Database Design! Anyone who missed it, check the class resources 📚',
    type: 'post',
    commentCount: 4,
    reactions: { '👍': 6, '❤️': 3 },
    isOwner: false,
  },
  {
    id: '5',
    author: 'Rutanga Claude',
    role: 'Accountant',
    department: 'Finance',
    timestamp: 'Mar 2 at 5:55 PM',
    content: 'Beautiful sunrise on campus today 🌅 What a great way to start the week!',
    image: 'https://picsum.photos/seed/campus/800/500',
    type: 'post',
    commentCount: 0,
    reactions: { '👍': 1 },
    isOwner: true,
  },
];

const TABS = ['All', 'Announcements', 'Posts'];

export default function Home({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('All');
  const [posts,     setPosts]     = useState(MOCK_POSTS);

  const filtered = posts.filter(p => {
    if (activeTab === 'Announcements') return p.type === 'announcement' || p.type === 'memo';
    if (activeTab === 'Posts')         return p.type === 'post';
    return true;
  });

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', fontFamily: "'Nunito', sans-serif" }}>

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>Home Feed</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>AUCA Social Hub</div>
        </div>
      </div>

      {/* ── Quick create ── */}
      <div style={{
        background: 'var(--surface)', borderRadius: '14px', padding: '14px 16px',
        marginBottom: '16px', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: '12px',
        boxShadow: 'var(--shadow)',
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #0d3b8e, #f0a500)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: '14px', flexShrink: 0,
        }}>RC</div>
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
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>No posts yet</div>
            <div style={{ fontSize: '13px', marginTop: '6px', color: 'var(--text-muted)' }}>Be the first to share something!</div>
          </div>
        ) : (
          filtered.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={id => setPosts(prev => prev.filter(p => p.id !== id))}
              // ← ONLY CHANGE FROM ORIGINAL: navigate to Comment page with post data
              onComment={id => onNavigate({ page: 'comments', post: posts.find(p => p.id === id) })}
            />
          ))
        )}
      </div>

    </div>
  );
}