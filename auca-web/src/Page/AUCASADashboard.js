import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/aucasaDashboard.css';
import { HiOutlineChatAlt2, HiOutlineDocumentReport } from 'react-icons/hi';
import { MdOutlinePublic, MdLockOutline } from 'react-icons/md';

const MOCK_POSTS = [
  {
    id: 1,
    title: 'Tuition Fee Increase - Semester 2',
    description: 'Administrative notice regarding the 5% adjustment in laboratory and facility fees for upcoming engineering students.',
    time: '2 hours ago',
    claimsCount: 24,
    category: 'Finance'
  },
  {
    id: 2,
    title: 'Campus Internet Infrastructure Upgrade',
    description: 'Updates on the fiber optic rollout across the south wing dormitories and central library.',
    time: 'Yesterday',
    claimsCount: 12,
    category: 'IT Infrastructure'
  },
  {
    id: 3,
    title: 'Graduation Gown Rental Policy',
    description: 'Revised timeline for gown collection and security deposit refunds for the Class of 2024.',
    time: '3 days ago',
    claimsCount: 8,
    category: 'Policy'
  },
  {
    id: 4,
    title: 'New Library Extended Hours',
    description: 'The main library will now remain open until midnight during the mid-semester examination period.',
    time: '1 week ago',
    claimsCount: 3,
    category: 'Campus Life'
  }
].sort((a, b) => b.claimsCount - a.claimsCount);

const MOCK_CLAIMS = {
  1: [
    { id: 101, category: 'Finance', text: 'Claim regarding the lack of transparency in the breakdown of lab equipment maintenance fees for IT students.', isPrivate: true, supportCount: 142, commentCount: 45 },
    { id: 102, category: 'Policy', text: 'Inquiry about student discount eligibility for international certification exams coordinated by the university.', isPrivate: false, supportCount: 89, commentCount: 12 },
  ]
};

export default function AUCASADashboard({ onNavigate }) {
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState(MOCK_POSTS[0]);
  const [activeTab, setActiveTab] = useState('All Categories');

  const claims = MOCK_CLAIMS[selectedPost?.id] || [];
  const categories = ['All Categories'];

  const filteredClaims = claims.filter(c => {
    if (activeTab === 'All Categories') return true;
    return c.category === activeTab;
  });

  return (
    <div className="aucasa-dashboard">
      <div className="aucasa-header">
        <h1 className="aucasa-title">Manage university claims and escalations</h1>
        <p className="aucasa-subtitle">Minister of Communication Dashboard</p>
      </div>

      <div className="aucasa-metrics">
        <div className="aucasa-metric-card">
          <span className="aucasa-metric-title">Total Posts</span>
          <span className="aucasa-metric-value">48</span>
        </div>
        <div className="aucasa-metric-card">
          <span className="aucasa-metric-title">Total Claims</span>
          <span className="aucasa-metric-value">312</span>
        </div>
        <div className="aucasa-metric-card" style={{ borderColor: 'var(--danger)' }}>
          <span className="aucasa-metric-title" style={{ color: 'var(--danger)' }}>Unreviewed Claims</span>
          <span className="aucasa-metric-value">14</span>
        </div>
        <div className="aucasa-metric-card">
          <span className="aucasa-metric-title">Escalated Reports</span>
          <span className="aucasa-metric-value">8</span>
        </div>
      </div>

      <div className="aucasa-content">
        
        {/* LEFT FEED */}
        <div className="aucasa-feed">
          <div className="aucasa-feed-header">
            <h2 className="aucasa-feed-title">Posts With Claims</h2>
            <button className="aucasa-btn outline" style={{ padding: '6px 12px', fontSize: '12px' }}>ALL TRACKS</button>
          </div>
          
          {MOCK_POSTS.map(post => (
            <div 
              key={post.id} 
              className={`aucasa-card ${selectedPost?.id === post.id ? 'selected' : ''}`}
              onClick={() => {
                setSelectedPost(post);
                setActiveTab('All Categories');
              }}
            >
              <div className="aucasa-card-top">
                <div className="aucasa-card-tag">
                  {post.category}
                </div>
                <span className="aucasa-card-time">{post.time}</span>
              </div>
              <h3 className="aucasa-card-title">{post.title}</h3>
              <p className="aucasa-card-body">{post.description}</p>
              <div className="aucasa-card-bottom">
                <div className="aucasa-card-concerns">
                  <HiOutlineChatAlt2 size={16} />
                  {post.claimsCount} Claims
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT PANEL */}
        <div className="aucasa-panel">
          <div className="aucasa-panel-tabs">
            {categories.map(tab => (
              <button 
                key={tab}
                className={`aucasa-panel-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="aucasa-panel-content">
            <div className="aucasa-panel-header">
              <span>Viewing {activeTab === 'All Categories' ? 'all categories' : activeTab}</span>
            </div>
            
            {filteredClaims.length > 0 ? filteredClaims.map(c => (
              <div key={c.id} className={`aucasa-concern ${c.isPrivate ? 'private' : ''}`}>
                <div className="aucasa-concern-top">
                  <div className="aucasa-badges">
                    <span className="aucasa-badge category">{c.category}</span>
                  </div>
                </div>
                
                <div className="aucasa-progress-container" title={`${c.supportCount} students supporting`}>
                  <div className="aucasa-progress-fill" style={{ width: `${Math.min(100, Math.round((c.supportCount / 150) * 100))}%` }}></div>
                  <div className="aucasa-progress-text">{Math.min(100, Math.round((c.supportCount / 150) * 100))}%</div>
                </div>

                <div className="aucasa-concern-actions" style={{ marginTop: '12px' }}>
                  <button className="aucasa-btn primary" onClick={() => onNavigate({ page: 'claimDetails', post: selectedPost })}>
                    <HiOutlineDocumentReport size={16} /> View Claims
                  </button>
                  <button className="aucasa-btn outline">Mark Reviewed</button>
                </div>
              </div>
            )) : (
              <div className="aucasa-empty">No claims to display for this filter.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
