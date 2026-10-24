import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Download, Upload, Moon, Sun, Keyboard, ShieldCheck, Database } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { state, toggleTheme, exportBackup, importBackup } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importBackup(content);
        if (ok) {
          alert('Backup restored successfully!');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="scroll-area" style={{ maxWidth: 760 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--text-main)',
            letterSpacing: '-0.02em',
          }}
        >
          Settings & Preferences
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
          Customize your workspace, Pomodoro cycles, and manage offline data backups.
        </p>
      </div>

      {/* Appearance Section */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          padding: 20,
          marginBottom: 20,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Appearance & Theme</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-main)' }}>Dark Mode</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Currently active: <strong style={{ textTransform: 'capitalize' }}>{state.theme}</strong>
            </div>
          </div>
          <button onClick={toggleTheme} className="btn btn-secondary">
            {state.theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            <span>Switch to {state.theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </div>

      {/* Pomodoro Timer Configuration */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          padding: 20,
          marginBottom: 20,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Focus Mode & Pomodoro Defaults</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>
              Work Duration (Minutes)
            </label>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>
              {Math.round(state.focusConfig.workDurationMs / 60000)} mins
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>
              Short Break (Minutes)
            </label>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>
              {Math.round(state.focusConfig.shortBreakDurationMs / 60000)} mins
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>
              Long Break (Minutes)
            </label>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>
              {Math.round(state.focusConfig.longBreakDurationMs / 60000)} mins
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>
              Cycles Before Long Break
            </label>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 4 }}>
              {state.focusConfig.cyclesBeforeLongBreak} cycles
            </div>
          </div>
        </div>
      </div>

      {/* Data Management & Backup Recovery */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          padding: 20,
          marginBottom: 20,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Database size={16} />
          <span>Data Management & Backup Recovery</span>
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          FocusFlow is local-first. Your data is stored on this device. You can download a complete backup
          or restore your workspace anytime.
        </p>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={exportBackup} className="btn btn-secondary">
            <Download size={15} />
            <span>Export Backup (JSON)</span>
          </button>

          <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary">
            <Upload size={15} />
            <span>Restore from Backup</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Keyboard Shortcuts Reference */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          padding: 20,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Keyboard size={16} />
          <span>Keyboard Shortcuts Reference</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span>Quick Add Task</span>
            <kbd style={{ padding: '2px 6px', backgroundColor: 'var(--bg-subtle)', borderRadius: 4, fontFamily: 'monospace', fontSize: 11 }}>Shift + A</kbd>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span>Toggle Focus Mode</span>
            <kbd style={{ padding: '2px 6px', backgroundColor: 'var(--bg-subtle)', borderRadius: 4, fontFamily: 'monospace', fontSize: 11 }}>Shift + F</kbd>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span>Today View</span>
            <kbd style={{ padding: '2px 6px', backgroundColor: 'var(--bg-subtle)', borderRadius: 4, fontFamily: 'monospace', fontSize: 11 }}>1</kbd>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span>Boards View</span>
            <kbd style={{ padding: '2px 6px', backgroundColor: 'var(--bg-subtle)', borderRadius: 4, fontFamily: 'monospace', fontSize: 11 }}>3</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
