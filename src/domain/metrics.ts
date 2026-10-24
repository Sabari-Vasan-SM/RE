import { Task, Project } from '../types';

export interface WorklogEntry {
  date: string; // YYYY-MM-DD
  taskId: string;
  taskTitle: string;
  projectName: string;
  timeSpentMs: number;
}

export function generateWorklogEntries(
  tasks: Task[],
  projects: Record<string, Project>
): WorklogEntry[] {
  const entries: WorklogEntry[] = [];

  for (const t of tasks) {
    if (!t.timeSpentOnDay) continue;
    for (const [dateStr, timeSpentMs] of Object.entries(t.timeSpentOnDay)) {
      if (timeSpentMs > 0) {
        const proj = t.projectId ? projects[t.projectId] : null;
        entries.push({
          date: dateStr,
          taskId: t.id,
          taskTitle: t.title,
          projectName: proj ? proj.title : 'No Project',
          timeSpentMs,
        });
      }
    }
  }

  // Sort descending by date
  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

export function exportWorklogToCSV(entries: WorklogEntry[]): string {
  const headers = ['Date', 'Task ID', 'Task Title', 'Project', 'Time Spent (Hours)', 'Time Spent (Minutes)'];
  const rows = entries.map((e) => [
    `"${e.date}"`,
    `"${e.taskId}"`,
    `"${e.taskTitle.replace(/"/g, '""')}"`,
    `"${e.projectName.replace(/"/g, '""')}"`,
    (e.timeSpentMs / (1000 * 60 * 60)).toFixed(2),
    Math.round(e.timeSpentMs / (1000 * 60)).toString(),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function calculateDailyActivityHeatmap(
  tasks: Task[],
  daysBack: number = 30
): Record<string, number> {
  const map: Record<string, number> = {};
  const today = new Date();

  // Initialize with 0
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    map[dateStr] = 0;
  }

  for (const t of tasks) {
    if (!t.timeSpentOnDay) continue;
    for (const [dateStr, ms] of Object.entries(t.timeSpentOnDay)) {
      if (map[dateStr] !== undefined) {
        map[dateStr] += ms;
      }
    }
  }

  return map;
}
