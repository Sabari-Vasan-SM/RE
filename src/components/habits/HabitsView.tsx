import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Flame, Award, RefreshCw } from 'lucide-react';
import { getTodayDateString } from '../../domain/tasks';

export const HabitsView: React.FC = () => {
  const { state, incrementHabit } = useApp();
  const counters = Object.values(state.counters);
  const today = getTodayDateString();

  return (
    <div className="scroll-area">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--text-main)',
            letterSpacing: '-0.02em',
          }}
        >
          Habits & Daily Counters
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
          Track daily repetitions, deep work blocks, and maintain your streak.
        </p>
      </div>

      {/* Counters Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {counters.map((c) => {
          const isDoneToday = c.lastUpdatedDay === today && c.count > 0;
          return (
            <div
              key={c.id}
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                padding: 20,
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-main)' }}>
                    {c.title}
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      color: 'var(--warning)',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                    title="Current daily streak"
                  >
                    <Flame size={15} />
                    <span>{c.streak} days</span>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    color: c.color || 'var(--primary)',
                    marginBottom: 16,
                  }}
                >
                  {c.count}
                </div>
              </div>

              {/* Increment Button */}
              <button
                onClick={() => incrementHabit(c.id)}
                className="btn btn-primary"
                style={{ width: '100%', padding: '10px 0', gap: 8, fontSize: 14 }}
              >
                <Plus size={16} />
                <span>Increment Count (+1)</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
