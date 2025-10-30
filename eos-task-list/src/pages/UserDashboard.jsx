import { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { BoardView } from '../components/board/BoardView';
import { TaskForm } from '../components/tasks/TaskForm';
import { useAuth } from '../context/AuthContext';
import { useTask } from '../context/TaskContext';
import { Plus, ListTodo, CheckCircle2, AlertCircle, TrendingUp, Zap, FolderOpen, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formatDate = (dateString) => {
  if (!dateString) return 'No due date';

  try {
    const date = new Date(dateString);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const year = date.getFullYear();
    const month = monthNames[date.getMonth()];
    const day = date.getDate();

    return `${year} ${month} ${day}`;
  } catch (error) {
    return dateString;
  }
};

export const UserDashboard = () => {
  const { user, logout } = useAuth();
  const { getUserTasks, addTask, updateTask, moveTask, fetchTasks } = useTask();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTaskStatus, setNewTaskStatus] = useState('plan');

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const userTasks = getUserTasks(user.id);

  const handleAddTask = (status) => {
    setNewTaskStatus(status || 'plan');
    setSelectedTask(null);
    setIsTaskFormOpen(true);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskFormOpen(true);
  };

  const handleSubmitTask = (formData) => {
    if (selectedTask) {
      updateTask(selectedTask.id, formData);
    } else {
      addTask(formData, user.id);
    }
    setIsTaskFormOpen(false);
    setSelectedTask(null);
  };

  const handleTaskMove = (taskId, newStatus) => {
    moveTask(taskId, newStatus);
  };

  const completionRate = userTasks.length > 0
    ? Math.round((userTasks.filter(t => t.status === 'completed').length / userTasks.length) * 100)
    : 0;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        userName={user?.name}
        onLogout={logout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName={user?.name} onLogout={logout} />

        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">
            {/* Dashboard View */}
            {activeMenu === 'dashboard' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-4xl font-bold text-gray-900 mb-2">
                    Welcome back, {user?.name}!
                  </h2>
                  <p className="text-gray-600">Here's your task summary for today</p>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {/* Total Tasks Card */}
                  <div className="card p-5 bg-gradient-to-br from-indigo-50 to-indigo-100 border-l-4 border-indigo-500 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-indigo-700 font-bold mb-2">TOTAL TASKS</p>
                        <p className="text-3xl font-bold text-indigo-900">{userTasks.length}</p>
                        <p className="text-xs text-indigo-600 mt-2">Your workload</p>
                      </div>
                      <div className="p-3 bg-indigo-200 rounded-lg">
                        <ListTodo size={20} className="text-indigo-600" />
                      </div>
                    </div>
                  </div>

                  {/* In Progress Card */}
                  <div className="card p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-blue-700 font-bold mb-2">IN PROGRESS</p>
                        <p className="text-3xl font-bold text-blue-900">{userTasks.filter(t => t.status === 'in_progress').length}</p>
                        <p className="text-xs text-blue-600 mt-2">{userTasks.length > 0 ? ((userTasks.filter(t => t.status === 'in_progress').length / userTasks.length) * 100).toFixed(0) : 0}% of total</p>
                      </div>
                      <div className="p-3 bg-blue-200 rounded-lg">
                        <Zap size={20} className="text-blue-600" />
                      </div>
                    </div>
                  </div>

                  {/* Completed Card */}
                  <div className="card p-5 bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-green-700 font-bold mb-2">COMPLETION RATE</p>
                        <p className="text-3xl font-bold text-green-900">{completionRate}%</p>
                        <p className="text-xs text-green-600 mt-2">{userTasks.filter(t => t.status === 'completed').length} completed</p>
                      </div>
                      <div className="p-3 bg-green-200 rounded-lg">
                        <CheckCircle2 size={20} className="text-green-600" />
                      </div>
                    </div>
                  </div>

                  {/* High Priority Card */}
                  <div className="card p-5 bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-red-700 font-bold mb-2">HIGH PRIORITY</p>
                        <p className="text-3xl font-bold text-red-900">{userTasks.filter(t => t.priority === 'high').length}</p>
                        <p className="text-xs text-red-600 mt-2">{userTasks.length > 0 ? ((userTasks.filter(t => t.priority === 'high').length / userTasks.length) * 100).toFixed(0) : 0}% urgent</p>
                      </div>
                      <div className="p-3 bg-red-200 rounded-lg">
                        <AlertCircle size={20} className="text-red-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Task Status Pie Chart */}
                  <div className="card p-6 bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <BarChart3 size={18} className="text-indigo-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Task Distribution</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      {userTasks.length > 0 ? (
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Plan', value: userTasks.filter(t => t.status === 'plan').length },
                              { name: 'In Progress', value: userTasks.filter(t => t.status === 'in_progress').length },
                              { name: 'Completed', value: userTasks.filter(t => t.status === 'completed').length }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={90}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            <Cell fill="#6B7280" />
                            <Cell fill="#3B82F6" />
                            <Cell fill="#10B981" />
                          </Pie>
                          <Tooltip
                            formatter={(value) => `${value} tasks`}
                            contentStyle={{
                              borderRadius: '8px',
                              border: '2px solid #e5e7eb',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              backgroundColor: '#ffffff'
                            }}
                          />
                        </PieChart>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          No tasks yet
                        </div>
                      )}
                    </ResponsiveContainer>
                  </div>

                  {/* Priority Bar Chart */}
                  <div className="card p-6 bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <TrendingUp size={18} className="text-red-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Priority Breakdown</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      {userTasks.length > 0 ? (
                        <BarChart
                          data={[
                            { name: 'High', value: userTasks.filter(t => t.priority === 'high').length },
                            { name: 'Medium', value: userTasks.filter(t => t.priority === 'medium').length },
                            { name: 'Low', value: userTasks.filter(t => t.priority === 'low').length }
                          ]}
                          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" style={{ fontSize: '12px', fill: '#6b7280' }} />
                          <YAxis style={{ fontSize: '12px', fill: '#6b7280' }} />
                          <Tooltip
                            contentStyle={{
                              borderRadius: '8px',
                              border: '2px solid #e5e7eb',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              backgroundColor: '#ffffff'
                            }}
                            formatter={(value) => `${value} tasks`}
                          />
                          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                            <Cell fill="#EF4444" />
                            <Cell fill="#FBBF24" />
                            <Cell fill="#10B981" />
                          </Bar>
                        </BarChart>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          No tasks yet
                        </div>
                      )}
                    </ResponsiveContainer>
                  </div>

                  {/* Completion Rate Card */}
                  <div className="card p-6 bg-gradient-to-br from-green-50 to-emerald-100 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-green-200 rounded-lg">
                        <TrendingUp size={18} className="text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Completion Rate</h3>
                    </div>
                    <div className="flex items-end gap-6">
                      <div>
                        <p className="text-5xl font-bold text-green-600 mb-2">{completionRate}%</p>
                        <p className="text-sm text-green-700">{userTasks.filter(t => t.status === 'completed').length} of {userTasks.length} done</p>
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-green-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${completionRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Categories Card */}
                  <div className="card p-6 bg-gradient-to-br from-purple-50 to-pink-100 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-purple-200 rounded-lg">
                        <FolderOpen size={18} className="text-purple-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Categories</h3>
                    </div>
                    <div className="space-y-3">
                      {userTasks.length > 0 ? (
                        [...new Set(userTasks.map(t => t.category))].map((category, idx) => {
                          const colors = ['from-purple-400 to-pink-400', 'from-blue-400 to-cyan-400', 'from-orange-400 to-red-400'];
                          return (
                            <div key={category} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors[idx % colors.length]}`}></div>
                                <span className="text-sm font-medium text-gray-700">{category}</span>
                              </div>
                              <span className="text-sm font-bold text-gray-900 bg-white px-3 py-1 rounded-full">{userTasks.filter(t => t.category === category).length}</span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No tasks yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Board View */}
            {activeMenu === 'boards' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Your Tasks</h2>
                    <p className="text-gray-600 mt-1">Drag and drop to manage your workflow</p>
                  </div>
                  <button
                    onClick={() => handleAddTask('plan')}
                    className="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <Plus size={18} />
                    New Task
                  </button>
                </div>
                <BoardView
                  tasks={userTasks}
                  onTaskClick={handleTaskClick}
                  onAddTask={handleAddTask}
                  onTaskMove={handleTaskMove}
                />
              </div>
            )}

            {/* Tasks List View */}
            {activeMenu === 'tasks' && (
              <div>
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    <div className="animate-slide-in-left stagger-1">
                      <h2 className="text-3xl font-bold text-gray-900">All Tasks</h2>
                      <p className="text-gray-600 mt-1 text-sm">Manage all your tasks in one place</p>
                    </div>
                    <button
                      onClick={() => handleAddTask('plan')}
                      className="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 animate-slide-in-right stagger-1"
                    >
                      <Plus size={18} />
                      New Task
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {userTasks.length > 0 ? (
                    userTasks.map((task, index) => (
                      <div
                        key={task.id}
                        className="card p-4 hover:shadow-md hover:border-indigo-200 hover:scale-102 transition-all cursor-pointer border border-gray-200 bg-white animate-slide-in-left transform"
                        onClick={() => handleTaskClick(task)}
                        style={{
                          animationDelay: `${index * 50}ms`
                        }}
                      >
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-5">
                            <h3 className={`font-semibold text-gray-900 truncate ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                              {task.title}
                            </h3>
                            <p className="text-xs text-gray-500 truncate">{task.description}</p>
                          </div>
                          <div className="col-span-3 flex items-center gap-2">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-all duration-200 inline-flex items-center gap-1 ${
                              task.priority === 'high' ? 'bg-red-100 text-red-700' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {task.priority === 'high' ? <AlertCircle size={14} /> : task.priority === 'medium' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-all duration-200 inline-flex items-center gap-1 ${
                              task.status === 'completed' ? 'bg-green-100 text-green-700' :
                              task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {task.status === 'completed' ? <CheckCircle2 size={14} /> : task.status === 'in_progress' ? <Zap size={14} /> : <ListTodo size={14} />}
                              {task.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="col-span-4 text-right">
                            <span className="text-xs text-gray-500 font-medium">{formatDate(task.due_date)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 animate-fade-in">
                      <ListTodo size={48} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No tasks yet</p>
                      <p className="text-gray-400 text-sm">Create one to get started</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analytics View */}
            {activeMenu === 'analytics' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">Analytics & Insights</h2>
                  <p className="text-gray-600 mt-1">Track your productivity metrics</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Completion Rate */}
                  <div className="card p-6 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-green-200 rounded-lg">
                        <TrendingUp size={18} className="text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Completion Rate</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-4xl font-bold text-green-600">{completionRate}%</p>
                      </div>
                      <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden shadow-inner">
                        <div
                          className="bg-gradient-to-r from-green-400 to-emerald-500 h-4 rounded-full transition-all duration-500"
                          style={{ width: `${completionRate}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 text-center">
                        {userTasks.filter(t => t.status === 'completed').length} of {userTasks.length} tasks completed
                      </p>
                    </div>
                  </div>

                  {/* Priority Distribution */}
                  <div className="card p-6 bg-gradient-to-br from-orange-50 to-red-50 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-red-200 rounded-lg">
                        <AlertCircle size={18} className="text-red-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Priority Distribution</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">High Priority</span>
                          <span className="text-lg font-bold text-red-600">{userTasks.filter(t => t.priority === 'high').length}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-red-500 h-2 rounded-full transition-all"
                            style={{
                              width: userTasks.length > 0
                                ? `${(userTasks.filter(t => t.priority === 'high').length / userTasks.length) * 100}%`
                                : '0%'
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Medium Priority</span>
                          <span className="text-lg font-bold text-yellow-600">{userTasks.filter(t => t.priority === 'medium').length}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-yellow-500 h-2 rounded-full transition-all"
                            style={{
                              width: userTasks.length > 0
                                ? `${(userTasks.filter(t => t.priority === 'medium').length / userTasks.length) * 100}%`
                                : '0%'
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Low Priority</span>
                          <span className="text-lg font-bold text-green-600">{userTasks.filter(t => t.priority === 'low').length}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{
                              width: userTasks.length > 0
                                ? `${(userTasks.filter(t => t.priority === 'low').length / userTasks.length) * 100}%`
                                : '0%'
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Breakdown */}
                  <div className="card p-6 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-blue-200 rounded-lg">
                        <ListTodo size={18} className="text-blue-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Status Breakdown</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                        <span className="text-sm font-medium text-gray-700">Planning</span>
                        <span className="text-lg font-bold text-gray-900">{userTasks.filter(t => t.status === 'plan').length}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                        <span className="text-sm font-medium text-gray-700">In Progress</span>
                        <span className="text-lg font-bold text-blue-600">{userTasks.filter(t => t.status === 'in_progress').length}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                        <span className="text-sm font-medium text-gray-700">Completed</span>
                        <span className="text-lg font-bold text-green-600">{userTasks.filter(t => t.status === 'completed').length}</span>
                      </div>
                    </div>
                  </div>

                  {/* By Category */}
                  <div className="card p-6 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-purple-200 rounded-lg">
                        <FolderOpen size={18} className="text-purple-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">By Category</h3>
                    </div>
                    <div className="space-y-3">
                      {userTasks.length > 0 ? (
                        [...new Set(userTasks.map(t => t.category))].map(category => (
                          <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                            <span className="text-sm font-medium text-gray-700">{category}</span>
                            <span className="text-lg font-bold text-gray-900">{userTasks.filter(t => t.category === category).length}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No tasks yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={handleSubmitTask}
        task={selectedTask}
        defaultStatus={newTaskStatus}
      />
    </div>
  );
};
