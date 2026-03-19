import React, { useState } from 'react';
import PostCard from '../component/PostCard';

const MOCK_POSTS = [
  {
    id: '1', author: 'Rutanga Claude', role: 'Accountant', department: 'Finance',
    timestamp: 'Mar 9 at 10:52 AM', content: 'Morning auca 😄',
    type: 'post', commentCount: 0, reactions: { '😄': 1 }, isOwner: false,
  },
  {
    id: '2', author: 'Mugisha Leopold', role: 'Lecturer', department: 'Accounting',
    timestamp: 'Mar 3 at 6:18 PM', type: 'announcement',
    content: `Subject: Invitation for today's General Assembly\n\nGreetings dear students.\nThis reminder goes to all Gishushu Students to invite them in today's General Assembly, your presence will be highly valued.\nDo not plan to miss and be there on time.\n\nYou are amazing!\n\nYedidia KWAME`,
    commentCount: 0, reactions: { '❤️': 2, '😮': 1 }, isOwner: true,
  },
  {
    id: '3', author: 'Mugisha Leopold', role: 'Lecturer', department: 'Accounting',
    timestamp: 'Mar 3 at 6:16 PM', type: 'memo',
    content: `TO: All students,\nSubject: Announcing enhanced new communication channel.\n\nDear Students,\n\nOn behalf of AUCA-SA, we are pleased to introduce a new and improved communication channel for all students.\n\nThis platform has been designed as a one-way communication channel to ensure clear delivery of official information while enhancing individual privacy.\n\nThe link to join will be shared in the general groups.`,
    commentCount: 0, reactions: { '❤️': 2, '💀': 1 }, isOwner: true,
  },
  {
    id: '4', author: 'Rutanga Claude', role: 'Accountant', department: 'Finance',
    timestamp: 'Mar 2 at 5:55 PM', content: 'link ya course registration: https://registration-42io.onrender.com/',
    type: 'post', commentCount: 0, reactions: { '👍': 1 }, isOwner: true,
  },
  {
    id: '5', author: 'Uwase Aline', role: 'Student', department: 'IT',
    timestamp: 'Mar 2 at 9:00 AM',
    content: 'Great lecture today on Database Design! Anyone who missed it, check the class resources 📚',
    type: 'post', commentCount: 4, reactions: { '👍': 6, '❤️': 3 }, isOwner: false,
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

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f1923' }}>Home Feed</div>
          <div style={{ fontSize: '13px', color: '#5a6a82' }}>AUCA Social Hub</div>
        </div>
        <button onClick={() => onNavigate && onNavigate('create')}
          style={{
            padding: '10px 18px', background: 'linear-gradient(135deg, #0d3b8e, #1a4fa8)',
            color: '#fff', borderRadius: '10px', fontWeight: 700, fontSize: '13px',
            cursor: 'pointer', border: 'none', boxShadow: '0 4px 12px rgba(13,59,142,0.25)',
            fontFamily: "'Nunito', sans-serif",
          }}>
          + New Post
        </button>
      </div>

      {/* Quick create */}
      <div style={{
        background: '#fff', borderRadius: '14px', padding: '14px 16px',
        marginBottom: '16px', border: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', gap: '12px',
        boxShadow: '0 2px 8px rgba(13,59,142,0.05)',
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #0d3b8e, #f0a500)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: '14px', flexShrink: 0,
        }}>RC</div>
        <input
          readOnly onClick={() => onNavigate && onNavigate('create')}
          placeholder="Share something with AUCA..."
          style={{
            flex: 1, padding: '10px 14px', borderRadius: '22px',
            border: '1px solid #e2e8f0', background: '#f4f6fb',
            fontSize: '13px', color: '#5a6a82', cursor: 'pointer',
            outline: 'none', fontFamily: "'Nunito', sans-serif",
          }}
        />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{
              padding: '8px 16px', fontSize: '13px',
              fontWeight: activeTab === t ? 700 : 500,
              color: activeTab === t ? '#0d3b8e' : '#5a6a82',
              background: 'none', border: 'none',
              borderBottom: activeTab === t ? '2px solid #0d3b8e' : '2px solid transparent',
              marginBottom: '-1px', cursor: 'pointer',
              fontFamily: "'Nunito', sans-serif",
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div style={{ paddingBottom: '40px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#5a6a82' }}>No posts yet</div>
          </div>
        ) : (
          filtered.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={id => setPosts(prev => prev.filter(p => p.id !== id))}
              onComment={id => console.log('comment:', id)}
            />
          ))
        )}
      </div>
    </div>
  );
}