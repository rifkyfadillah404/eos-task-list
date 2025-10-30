import { createContext, useState, useContext } from 'react';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within TaskProvider');
  }
  return context;
};

const API_URL = 'http://localhost:5000/api';

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token, isAdmin } = useAuth();

  const fetchTasks = async () => {
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
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData, userId) => {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) throw new Error('Failed to add task');

      const data = await response.json();

      // Refresh tasks
      await fetchTasks();

      return data.task;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const updateTask = async (taskId, taskData) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) throw new Error('Failed to update task');

      // Refresh tasks
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (taskId) => {
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
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  const getUserTasks = (userId) => {
    if (isAdmin) {
      // Admin can see all tasks
      return tasks;
    }
    // Users can only see their own tasks
    return tasks.filter(t => t.user_id === userId);
  };

  const getTaskById = (taskId) => {
    return tasks.find(t => t.id === taskId);
  };

  const getAllTasks = () => {
    return tasks;
  };

  const moveTask = async (taskId, newStatus) => {
    try {
      const task = getTaskById(taskId);
      if (!task) return;

      await updateTask(taskId, { status: newStatus });
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  const value = {
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
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

