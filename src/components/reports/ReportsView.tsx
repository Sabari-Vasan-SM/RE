import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  generateWorklogEntries,
  exportWorklogToCSV,
  calculateDailyActivityHeatmap,
} from '../../domain/metrics';
import { formatDuration } from '../../domain/time-tracking';
import { Download, FileText, Calendar, BarChart2 } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { state } = useApp();

  const tasksList = Object.values(state.tasks);
  const worklogEntries = generateWorklogEntries(tasksList, state.projects);
  const heatmap = calculateDailyActivityHeatmap(tasksList, 30);

  const totalTimeSpentMs = tasksList.reduce((acc, t) => acc + (t.timeSpent || 0), 0);

  const handleDownloadCSV = () => {
    const csvContent = exportWorklogToCSV(worklogEntries);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusflow-timesheet-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="scroll-area">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 26,
              fontWeight: 700,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
            }}
          >
            Worklog & Time Analytics
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Aggregated time records, productivity heatmaps, and exportable reports.
          </p>
        </div>

        {/* CSV Export Button */}
        <button onClick={handleDownloadCSV} className="btn btn-primary" style={{ gap: 6 }}>
          <Download size={15} />
          <span>Export Timesheet (CSV)</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            padding: 20,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-subtle)' }}>Total Time Logged</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)', marginTop: 4 }}>
            {formatDuration(totalTimeSpentMs)}
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            padding: 20,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-subtle)' }}>Total Tasks Tracked</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
            {tasksList.filter((t) => t.timeSpent > 0).length}
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            padding: 20,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-subtle)' }}>Active Projects</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-main)', marginTop: 4 }}>
            {Object.keys(state.projects).length}
          </div>
        </div>
      </div>

      {/* 30-Day Activity Heatmap */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          padding: 20,
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          marginBottom: 24,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={16} />
          <span>Last 30 Days Activity Heatmap</span>
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {Object.entries(heatmap).map(([day, ms]) => {
            const hours = ms / (1000 * 3600);
            let bg = 'var(--bg-subtle)';
            if (hours > 4) bg = 'var(--primary)';
            else if (hours > 2) bg = '#60a5fa';
            else if (hours > 0) bg = '#93c5fd';

            return (
              <div
                key={day}
                title={`${day}: ${formatDuration(ms)} logged`}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 4,
                  backgroundColor: bg,
                  cursor: 'pointer',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Worklog Table */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600, fontSize: 14 }}>
          Detailed Worklog Entries
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-subtle)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
              <th style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Date</th>
              <th style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Task</th>
              <th style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Project</th>
              <th style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Time Spent</th>
            </tr>
          </thead>
          <tbody>
            {worklogEntries.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 24, textAlign: 'center', color: 'var(--text-subtle)' }}>
                  No time tracked yet. Start a timer on any task to populate the worklog.
                </td>
              </tr>
            ) : (
              worklogEntries.map((e, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 16px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>{e.date}</td>
                  <td style={{ padding: '10px 16px', fontWeight: 500 }}>{e.taskTitle}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>{e.projectName}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--primary)' }}>
                    {formatDuration(e.timeSpentMs)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
