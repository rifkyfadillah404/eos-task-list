import { useMemo } from 'react';

export const useTaskStats = (tasks) => {
  return useMemo(() => {
    const stats = {
      total: tasks.length,
      plan: 0,
      inProgress: 0,
      completed: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    tasks.forEach((task) => {
      // Count by status
      if (task.status === 'plan') stats.plan++;
      else if (task.status === 'in_progress') stats.inProgress++;
      else if (task.status === 'completed') stats.completed++;

      // Count by priority
      if (task.priority === 'high') stats.high++;
      else if (task.priority === 'medium') stats.medium++;
      else if (task.priority === 'low') stats.low++;
    });

    const completionRate = stats.total > 0
      ? Math.round((stats.completed / stats.total) * 100)
      : 0;

    return { ...stats, completionRate };
  }, [tasks]);
};
