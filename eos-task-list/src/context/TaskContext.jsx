/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within TaskProvider');
  }
  return context;
};

const API_URL = 'http://localhost:3000/api';

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token, isAdmin, user, users } = useAuth();

  const fetchTasks = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });


      if (!response.ok) throw new Error('Failed to fetch tasks');

      const data = await response.json();
      setTasks(data.tasks);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [token]);

  const addTask = useCallback(async (taskData, userId) => {
    const payload = isAdmin ? taskData : { ...taskData, user_id: userId };
    
    
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add task');
      }

      const data = await response.json();

      // Refresh tasks
      await fetchTasks();

      return data.task;
    } catch (error) {
      throw error;
    }
  }, [isAdmin, token, fetchTasks]);

  const updateTask = useCallback(async (taskId, taskData) => {
    let previousTasks = [];

    setTasks(prev => {
      previousTasks = prev.map(task => ({ ...task }));
      return prev.map(task =>
        task.id === taskId ? { ...task, ...taskData } : task
      );
    });

    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      let parsed;
      try {
        parsed = await response.json();
      } catch {
        parsed = null;
      }

      if (parsed?.task) {
        setTasks(prev => prev.map(task =>
          task.id === taskId ? { ...task, ...parsed.task } : task
        ));
      }
    } catch (error) {
      setTasks(previousTasks);
      throw error;
    }
  }, [token]);

  const deleteTask = useCallback(async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete task');

      // Refresh tasks
      await fetchTasks();
    } catch (error) {
      throw error;
    }
  }, [token, fetchTasks]);

  const getUserTasks = useCallback((userId) => {
    
    if (isAdmin) {
      // Admin can see all tasks
      return tasks;
    }
    
    // Users can see tasks from their department
    const currentUser = user || users.find(u => u.id === userId);
    
    if (!currentUser || !currentUser.department_id) {
      // If no department, only show own tasks
      const ownTasks = tasks.filter(t => t.user_id === userId);
      return ownTasks;
    }
    
    // Get all user IDs from same department
    const departmentUserIds = users
      .filter(u => u.department_id === currentUser.department_id)
      .map(u => u.id);
    
    
    // Return tasks from all users in same department
    const deptTasks = tasks.filter(t => departmentUserIds.includes(t.user_id));
    return deptTasks;
  }, [isAdmin, tasks, user, users]);

  const getTaskById = useCallback((taskId) => {
    return tasks.find(t => t.id === taskId);
  }, [tasks]);

  const getAllTasks = useCallback(() => {
    return tasks;
  }, [tasks]);

  const moveTask = useCallback(async (taskId, newStatus) => {
    try {
      const task = getTaskById(taskId);
      if (!task) return;

      await updateTask(taskId, { status: newStatus });
      
      // Refresh tasks to get updated data (completed_by, completed_date, etc.)
      await fetchTasks();
    } catch (error) {
      // Error silently handled
    }
  }, [getTaskById, updateTask, fetchTasks]);

  const value = useMemo(() => ({
    tasks,
    loading,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    getUserTasks,
    getTaskById,
    getAllTasks,
    moveTask,
  }), [
    tasks,
    loading,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    getUserTasks,
    getTaskById,
    getAllTasks,
    moveTask,
  ]);

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

