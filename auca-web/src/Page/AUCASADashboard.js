import React, { useState } from 'react';
import '../Styles/aucasaDashboard.css';
import { HiOutlineChatAlt2, HiOutlineDocumentReport, HiOutlineCheckCircle, HiOutlineClock } from 'react-icons/hi';
import { MdOutlinePublic, MdLockOutline } from 'react-icons/md';

const MOCK_ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Tuition Fee Increase - Semester 2',
    department: 'Administrative notice regarding the 5% adjustment in laboratory and facility fees for upcoming engineering students.',
    status: 'red',
    time: '2 hours ago',
    totalConcerns: 24,
    newConcerns: 5,
    engagement: 'High Engagement'
  },
  {
    id: 2,
    title: 'Campus Internet Infrastructure Upgrade',
    department: 'Updates on the fiber optic rollout across the south wing dormitories and central library.',
    status: 'amber',
    time: 'Yesterday',
    totalConcerns: 12,
    newConcerns: 0,
    engagement: 'Medium Engagement'
  },
  {
    id: 3,
    title: 'Graduation Gown Rental Policy',
    department: 'Revised timeline for gown collection and security deposit refunds for the Class of 2024.',
    status: 'green',
    time: '3 days ago',
    totalConcerns: 8,
    newConcerns: 0,
    engagement: 'Low Engagement'
  },
  {
    id: 4,
    title: 'New Library Extended Hours',
    department: 'The main library will now remain open until midnight during the mid-semester examination period.',
    status: 'gray',
    time: '1 week ago',
    totalConcerns: 3,
    newConcerns: 0,
    engagement: 'Low Engagement'
  }
];

const MOCK_CONCERNS = {
  1: [
    { id: 101, category: 'Finance', text: 'Concern regarding the lack of transparency in the breakdown of lab equipment maintenance fees for IT students.', isPrivate: true, supportCount: 142 },
    { id: 102, category: 'Policy', text: 'Inquiry about student discount eligibility for international certification exams coordinated by the university.', isPrivate: false, supportCount: 89 },
  ]
};

export default function AUCASADashboard() {
  const [selectedAnn, setSelectedAnn] = useState(MOCK_ANNOUNCEMENTS[0]);
  const [activeTab, setActiveTab] = useState('claims'); // 'claims' or 'escalation'

  const concerns = MOCK_CONCERNS[selectedAnn?.id] || [];

  return (
    <div className="aucasa-dashboard">
      <div className="aucasa-header">
        <h1 className="aucasa-title">Manage university claims and escalations</h1>
        <p className="aucasa-subtitle">Minister of Communication Dashboard</p>
      </div>

      <div className="aucasa-metrics">
        <div className="aucasa-metric-card">
          <span className="aucasa-metric-title">Total Announcements</span>
          <span className="aucasa-metric-value">48</span>
        </div>
        <div className="aucasa-metric-card">
          <span className="aucasa-metric-title">Total Concerns</span>
          <span className="aucasa-metric-value">312</span>
        </div>
        <div className="aucasa-metric-card" style={{ borderColor: 'var(--danger)' }}>
          <span className="aucasa-metric-title" style={{ color: 'var(--danger)' }}>Unreviewed Concerns</span>
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
            <h2 className="aucasa-feed-title">Announcements</h2>
            <button className="aucasa-btn outline" style={{ padding: '6px 12px', fontSize: '12px' }}>ALL TRACKS</button>
          </div>
          
          {MOCK_ANNOUNCEMENTS.map(ann => (
            <div 
              key={ann.id} 
              className={`aucasa-card ${selectedAnn?.id === ann.id ? 'selected' : ''}`}
              onClick={() => setSelectedAnn(ann)}
            >
              <div className="aucasa-card-top">
                <div className={`aucasa-card-status-label ${ann.status}`}>
                  <div className={`aucasa-status-dot status-${ann.status}`} />
                  {ann.status === 'red' ? 'NEW CONCERNS' : 
                   ann.status === 'amber' ? 'UNDER REVIEW' : 
                   ann.status === 'green' ? 'ESCALATED' : 'RESOLVED'}
                </div>
                <span className="aucasa-card-time">{ann.time}</span>
              </div>
              <h3 className="aucasa-card-title">{ann.title}</h3>
              <p className="aucasa-card-body">{ann.department}</p>
              <div className="aucasa-card-bottom">
                <div className="aucasa-card-concerns">
                  <HiOutlineChatAlt2 size={16} />
                  {ann.totalConcerns} Concerns
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {ann.engagement}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT PANEL */}
        <div className="aucasa-panel">
          <div className="aucasa-panel-tabs">
            <button 
              className={`aucasa-panel-tab ${activeTab === 'claims' ? 'active' : ''}`}
              onClick={() => setActiveTab('claims')}
            >
              Claims Feed
            </button>
            <button 
              className={`aucasa-panel-tab ${activeTab === 'escalation' ? 'active' : ''}`}
              onClick={() => setActiveTab('escalation')}
            >
              Escalation Hub
            </button>
          </div>

          <div className="aucasa-panel-content">
            {activeTab === 'claims' ? (
              <>
                <div className="aucasa-panel-header">
                  <span>Filter by Priority</span>
                  <span>Viewing all Public & Private concerns</span>
                </div>
                
                {concerns.length > 0 ? concerns.map(c => (
                  <div key={c.id} className={`aucasa-concern ${c.isPrivate ? 'private' : ''}`}>
                    <div className="aucasa-concern-top">
                      <div className="aucasa-badges">
                        <span className="aucasa-badge category">{c.category}</span>
                        {c.isPrivate ? (
                          <span className="aucasa-badge private"><MdLockOutline style={{ marginRight: 2 }} /> PRIVATE</span>
                        ) : (
                          <span className="aucasa-badge public"><MdOutlinePublic style={{ marginRight: 2 }} /> PUBLIC</span>
                        )}
                      </div>
                      <div className="aucasa-concern-stats">
                        <HiOutlineChatAlt2 size={14} /> {c.supportCount}
                      </div>
                    </div>
                    <p className="aucasa-concern-text">{c.text}</p>
                    <div className="aucasa-concern-actions">
                      <button className="aucasa-btn primary">
                        <HiOutlineDocumentReport size={16} /> Attach to Escalation
                      </button>
                      <button className="aucasa-btn outline">Mark Reviewed</button>
                    </div>
                  </div>
                )) : (
                  <div className="aucasa-empty">No concerns to display for this announcement.</div>
                )}
              </>
            ) : (
              <div className="aucasa-empty">
                <HiOutlineDocumentReport size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                <p>Select concerns from the Claims Feed to begin building an escalation report.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
