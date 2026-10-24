import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, CheckCircle, AlertCircle, RefreshCw, GitBranch, Calendar, Layers, Link2 } from 'lucide-react';
import { testProviderConnection, importIssuesAsTasks, RemoteIssue } from '../../domain/integrations';
import { IntegrationConfig } from '../../types';

export const IntegrationsModal: React.FC = () => {
  const { isIntegrationsModalOpen, setIsIntegrationsModalOpen, state, addTask } = useApp();

  const [activeTab, setActiveTab] = useState<'GITHUB' | 'JIRA' | 'GITLAB' | 'CALDAV'>('GITHUB');
  const [token, setToken] = useState('');
  const [host, setHost] = useState('');
  const [queryUrl, setQueryUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isIntegrationsModalOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setStatusMessage(null);

    const cfg: IntegrationConfig = {
      provider: activeTab,
      isEnabled: true,
      token,
      host,
      queryOrCalendarUrl: queryUrl,
    };

    const result = await testProviderConnection(cfg);
    setIsTesting(false);
    if (result.success) {
      setStatusMessage({
        type: 'success',
        text: `${result.message} ${result.discoveredCount ? `(${result.discoveredCount} items available)` : ''}`,
      });
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  const handleImportSampleIssues = () => {
    const mockIssues: RemoteIssue[] = [
      {
        id: 'issue-101',
        key: `${activeTab}-101`,
        title: 'Implement database connection pooling & retry logic',
        url: 'https://github.com/example/repo/issues/101',
        isDone: false,
        timeEstimateMs: 45 * 60 * 1000,
      },
      {
        id: 'issue-102',
        key: `${activeTab}-102`,
        title: 'Review pull request: optimize vector clock conflict resolution',
        url: 'https://github.com/example/repo/pull/102',
        isDone: false,
        timeEstimateMs: 30 * 60 * 1000,
      },
    ];

    const newTasks = importIssuesAsTasks(mockIssues);
    newTasks.forEach((t) => addTask(t));
    alert(`Successfully imported ${newTasks.length} issues into your FocusFlow tasks!`);
    setIsIntegrationsModalOpen(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 400,
      }}
    >
      <div
        style={{
          width: 560,
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link2 size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 16, fontWeight: 700 }}>Work Management & Integrations</span>
          </div>
          <button onClick={() => setIsIntegrationsModalOpen(false)} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Tab buttons */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-subtle)',
          }}
        >
          {[
            { id: 'GITHUB', label: 'GitHub' },
            { id: 'JIRA', label: 'Jira' },
            { id: 'GITLAB', label: 'GitLab' },
            { id: 'CALDAV', label: 'CalDAV / iCal' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setStatusMessage(null);
              }}
              style={{
                flex: 1,
                padding: '10px 0',
                fontSize: 13,
                fontWeight: 600,
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                backgroundColor: activeTab === tab.id ? 'var(--bg-card)' : 'transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <div style={{ padding: 24 }}>
          {activeTab === 'GITHUB' && (
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                Connect your GitHub repository to search issues, pull requests, and import them directly into FocusFlow.
              </p>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Personal Access Token (PAT)
                </label>
                <input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: 13,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === 'JIRA' && (
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                Connect your Jira Cloud instance using an API token to import sprint tasks and log work hours.
              </p>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Jira Host URL
                </label>
                <input
                  type="text"
                  placeholder="https://yourcompany.atlassian.net"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: 13,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  API Token
                </label>
                <input
                  type="password"
                  placeholder="Jira API Token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: 13,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === 'GITLAB' && (
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                Connect to GitLab.com or self-hosted GitLab instances.
              </p>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  GitLab Personal Access Token
                </label>
                <input
                  type="password"
                  placeholder="glpat-xxxxxxxxxxxxxxxxxxxx"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: 13,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === 'CALDAV' && (
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                Synchronize external calendar events (Google Calendar, Nextcloud, iCloud) onto your Schedule timeline.
              </p>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  iCal / .ics Feed URL or CalDAV Endpoint
                </label>
                <input
                  type="text"
                  placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
                  value={queryUrl}
                  onChange={(e) => setQueryUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: 13,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>
            </div>
          )}

          {/* Status Message Alert */}
          {statusMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: statusMessage.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
                border: `1px solid ${statusMessage.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
                color: statusMessage.type === 'success' ? 'var(--success)' : 'var(--danger)',
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {statusMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              {isTesting ? <RefreshCw size={14} className="animate-spin" /> : null}
              <span>{isTesting ? 'Verifying...' : 'Test Connection'}</span>
            </button>

            <button
              onClick={handleImportSampleIssues}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              <span>Import Assigned Issues</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
