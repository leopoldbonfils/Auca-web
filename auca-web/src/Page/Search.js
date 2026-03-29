import React, { useState } from 'react';
import { RiSearchLine } from 'react-icons/ri';
import { IoClose } from 'react-icons/io5';

const MOCK_USERS = [
  { id: '1', name: 'Rutanga Claude',   role: 'Accountant', department: 'Finance',    initials: 'RC', color: 'linear-gradient(135deg,#0d3b8e,#1a4fa8)' },
  { id: '2', name: 'Mugisha Leopold',  role: 'Lecturer',   department: 'Accounting', initials: 'ML', color: 'linear-gradient(135deg,#7c3aed,#a855f7)' },
  { id: '3', name: 'Uwase Aline',      role: 'Student',    department: 'IT',         initials: 'UA', color: 'linear-gradient(135deg,#059669,#34d399)' },
  { id: '4', name: 'Habimana Eric',    role: 'Student',    department: 'Finance',    initials: 'HE', color: 'linear-gradient(135deg,#dc2626,#f87171)' },
  { id: '5', name: 'Niyonzima Grace',  role: 'Staff',      department: 'HR',         initials: 'NG', color: 'linear-gradient(135deg,#d97706,#fbbf24)' },
  { id: '6', name: 'Cyiza Patrick',    role: 'Lecturer',   department: 'Math',       initials: 'CP', color: 'linear-gradient(135deg,#0891b2,#22d3ee)' },
  { id: '7', name: 'Iradukunda Sara',  role: 'Student',    department: 'Law',        initials: 'IS', color: 'linear-gradient(135deg,#be185d,#f472b6)' },
  { id: '8', name: 'Nkurunziza Joel',  role: 'Student',    department: 'IT',         initials: 'NJ', color: 'linear-gradient(135deg,#0d3b8e,#f0a500)' },
];

const MOCK_POSTS = [
  { id: 'p1', author: 'Rutanga Claude',  content: 'Morning AUCA 😄',                             type: 'post',         timestamp: 'Mar 9' },
  { id: 'p2', author: 'Mugisha Leopold', content: "Invitation for today's General Assembly...",  type: 'announcement', timestamp: 'Mar 3' },
  { id: 'p3', author: 'Uwase Aline',     content: 'Great lecture today on Database Design! 📚',  type: 'post',         timestamp: 'Mar 2' },
  { id: 'p4', author: 'Habimana Eric',   content: "Anyone has notes from yesterday's class?",    type: 'post',         timestamp: 'Mar 1' },
];

const TABS = ['All', 'People', 'Posts'];

export default function Search() {
  const [query,     setQuery]     = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const q = query.toLowerCase().trim();

  const filteredUsers = MOCK_USERS.filter(u =>
    u.name.toLowerCase().includes(q) ||
    u.department.toLowerCase().includes(q) ||
    u.role.toLowerCase().includes(q)
  );

  const filteredPosts = MOCK_POSTS.filter(p =>
    p.content.toLowerCase().includes(q) ||
    p.author.toLowerCase().includes(q)
  );

  const showUsers = activeTab === 'All' || activeTab === 'People';
  const showPosts = activeTab === 'All' || activeTab === 'Posts';

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', fontFamily: "'Nunito', sans-serif" }}>

      {/* Heading */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>Search</div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Find people and posts across AUCA</div>
      </div>

      {/* ── Search input — RiSearchLine + IoClose from react-icons ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'var(--surface)', borderRadius: '12px', padding: '0 16px',
        border: `1.5px solid ${q ? 'var(--primary)' : 'var(--border)'}`,
        marginBottom: '16px', boxShadow: 'var(--shadow)',
        transition: 'border-color 0.2s',
      }}>
        <span style={{ color: 'var(--text-muted)', flexShrink: 0, display: 'flex' }}>
          <RiSearchLine size={18} />
        </span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search people, posts, departments..."
          style={{
            flex: 1, padding: '14px 0', border: 'none', outline: 'none',
            fontSize: '14px', color: 'var(--text-primary)', background: 'transparent',
            fontFamily: "'Nunito', sans-serif",
          }}
        />
        {q && (
          <button
            onClick={() => setQuery('')}
            style={{
              color: 'var(--text-muted)', background: 'none', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
            }}
          >
            <IoClose size={18} />
          </button>
        )}
      </div>

      {/* Tabs */}
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
              fontFamily: "'Nunito', sans-serif",
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Empty state when no query */}
      {!q && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}></div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>Search AUCA</div>
          <div style={{ fontSize: '13px', marginTop: '6px' }}>Type a name, department, or keyword</div>
        </div>
      )}

      {/* Results */}
      {q && (
        <>
          {/* People */}
          {showUsers && (
            <div style={{ marginBottom: '24px' }}>
              {activeTab === 'All' && (
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  People
                </div>
              )}
              {filteredUsers.length === 0 && activeTab === 'People' ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}></div>
                  <div style={{ fontSize: '14px' }}>No people found</div>
                </div>
              ) : (
                filteredUsers.map(u => (
                  <div key={u.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px', background: 'var(--surface)', borderRadius: '12px',
                    marginBottom: '8px', border: '1px solid var(--border)', cursor: 'pointer',
                    transition: 'all 0.15s', boxShadow: 'var(--shadow)',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; e.currentTarget.style.borderColor = '#0d3b8e22'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      background: u.color, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '15px', flexShrink: 0,
                    }}>{u.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{u.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{u.role} · {u.department}</div>
                    </div>
                    <div style={{
                      padding: '5px 12px', borderRadius: '20px', fontSize: '12px',
                      fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-pale)',
                      border: '1px solid #0d3b8e22',
                    }}>View</div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Posts */}
          {showPosts && (
            <div>
              {activeTab === 'All' && (
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Posts
                </div>
              )}
              {filteredPosts.length === 0 && activeTab === 'Posts' ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}></div>
                  <div style={{ fontSize: '14px' }}>No posts found</div>
                </div>
              ) : (
                filteredPosts.map(p => (
                  <div key={p.id} style={{
                    padding: '14px 16px', background: 'var(--surface)', borderRadius: '12px',
                    marginBottom: '8px', border: '1px solid var(--border)', cursor: 'pointer',
                    transition: 'all 0.15s', boxShadow: 'var(--shadow)',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; e.currentTarget.style.borderColor = '#0d3b8e22'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>{p.author}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>· {p.timestamp}</span>
                      {p.type !== 'post' && (
                        <span style={{
                          fontSize: '10px', fontWeight: 700, padding: '2px 8px',
                          borderRadius: '20px', background: 'var(--primary-pale)', color: 'var(--primary)',
                          textTransform: 'uppercase', letterSpacing: '0.5px',
                        }}>{p.type}</span>
                      )}
                    </div>
                    <div style={{
                      fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {p.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* No results at all */}
          {filteredUsers.length === 0 && filteredPosts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}></div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>No results for "{query}"</div>
              <div style={{ fontSize: '13px', marginTop: '6px' }}>Try a different keyword</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}