import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EISENHOWER_BOARD, KANBAN_BOARD, filterTasksForPanel } from '../../domain/boards';
import { Task, BoardCfg, URGENT_TAG_ID, IMPORTANT_TAG_ID, IN_PROGRESS_TAG_ID } from '../../types';
import { Columns, Grid, CheckCircle2, Circle, Clock } from 'lucide-react';
import { formatDuration } from '../../domain/time-tracking';

export const BoardsView: React.FC = () => {
  const { state, setSelectedTaskId, toggleTaskDone, updateTask } = useApp();
  const [activeBoard, setActiveBoard] = useState<'EISENHOWER' | 'KANBAN'>('EISENHOWER');

  const currentBoardConfig: BoardCfg =
    activeBoard === 'EISENHOWER' ? EISENHOWER_BOARD : KANBAN_BOARD;

  const tasksList = Object.values(state.tasks);

  const handleMoveToKanbanColumn = (task: Task, targetColumnId: string) => {
    if (targetColumnId === 'DONE') {
      toggleTaskDone(task.id);
    } else if (targetColumnId === 'IN_PROGRESS') {
      const newTagIds = Array.from(new Set([...task.tagIds, IN_PROGRESS_TAG_ID]));
      updateTask({ ...task, tagIds: newTagIds, isDone: false });
    } else if (targetColumnId === 'TODO') {
      const newTagIds = task.tagIds.filter((id) => id !== IN_PROGRESS_TAG_ID);
      updateTask({ ...task, tagIds: newTagIds, isDone: false });
    }
  };

  return (
    <div className="scroll-area">
      {/* Header & Board Switcher Tabs */}
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
            Visual Boards
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Switch between the 4-Quadrant Eisenhower Priority Matrix and the 3-Column Kanban Board.
          </p>
        </div>

        {/* Board Toggle Buttons */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-subtle)',
            padding: 3,
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            onClick={() => setActiveBoard('EISENHOWER')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: activeBoard === 'EISENHOWER' ? 'var(--bg-card)' : 'transparent',
              color: activeBoard === 'EISENHOWER' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeBoard === 'EISENHOWER' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <Grid size={14} />
            <span>Eisenhower Matrix</span>
          </button>

          <button
            onClick={() => setActiveBoard('KANBAN')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: activeBoard === 'KANBAN' ? 'var(--bg-card)' : 'transparent',
              color: activeBoard === 'KANBAN' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeBoard === 'KANBAN' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <Columns size={14} />
            <span>Kanban Board</span>
          </button>
        </div>
      </div>

      {/* Grid Layout for Panels */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: activeBoard === 'EISENHOWER' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: 16,
          alignItems: 'start',
        }}
      >
        {currentBoardConfig.panels.map((panel) => {
          const panelTasks = filterTasksForPanel(tasksList, panel);
          return (
            <div
              key={panel.id}
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 280,
              }}
            >
              {/* Panel Header */}
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--bg-subtle)',
                  borderTopLeftRadius: 'var(--radius-md)',
                  borderTopRightRadius: 'var(--radius-md)',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
                  {panel.title}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {panelTasks.length}
                </span>
              </div>

              {/* Tasks in Panel */}
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {panelTasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-subtle)', fontSize: 12 }}>
                    No tasks in this quadrant
                  </div>
                ) : (
                  panelTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTaskId(t.id)}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskDone(t.id);
                          }}
                          style={{ color: t.isDone ? 'var(--success)' : 'var(--text-subtle)' }}
                        >
                          {t.isDone ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                        </button>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: t.isDone ? 'var(--text-muted)' : 'var(--text-main)',
                            textDecoration: t.isDone ? 'line-through' : 'none',
                            flex: 1,
                          }}
                        >
                          {t.title}
                        </span>
                      </div>

                      {/* Kanban Quick Movement Buttons */}
                      {activeBoard === 'KANBAN' && (
                        <div
                          style={{
                            display: 'flex',
                            gap: 6,
                            marginTop: 8,
                            paddingTop: 6,
                            borderTop: '1px solid var(--border-subtle)',
                            fontSize: 10,
                          }}
                        >
                          {panel.id !== 'TODO' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveToKanbanColumn(t, 'TODO');
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '2px 6px', fontSize: 10 }}
                            >
                              ← To Do
                            </button>
                          )}
                          {panel.id !== 'IN_PROGRESS' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveToKanbanColumn(t, 'IN_PROGRESS');
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '2px 6px', fontSize: 10 }}
                            >
                              In Progress
                            </button>
                          )}
                          {panel.id !== 'DONE' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveToKanbanColumn(t, 'DONE');
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '2px 6px', fontSize: 10 }}
                            >
                              Done →
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
