import { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { BoardView } from '../components/board/BoardView';
import { UserManagement } from '../components/admin/UserManagement';
import { useAuth } from '../context/AuthContext';
import { useTask } from '../context/TaskContext';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, TrendingUp, ListTodo, CheckCircle2, AlertCircle, Users } from 'lucide-react';

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

export const AdminDashboard = () => {
  const { user, logout, users } = useAuth();
  const { getAllTasks, moveTask, fetchTasks } = useTask();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const allTasks = getAllTasks();

  const displayTasks = selectedUserId
    ? allTasks.filter(t => t.user_id === selectedUserId)
    : allTasks;

  const getUserName = (userId) => {
    return users?.find(u => u.id === userId)?.name || 'Unknown';
  };

  const handleTaskMove = (taskId, newStatus) => {
    moveTask(taskId, newStatus);
  };

  // Get task statistics
  const stats = {
    total: allTasks.length,
    plan: allTasks.filter(t => t.status === 'plan').length,
    inProgress: allTasks.filter(t => t.status === 'in_progress').length,
    completed: allTasks.filter(t => t.status === 'completed').length,
    high: allTasks.filter(t => t.priority === 'high').length,
  };

  // Chart data for status distribution
  const statusChartData = [
    { name: 'Plan', value: stats.plan, fill: '#6B7280' },
    { name: 'In Progress', value: stats.inProgress, fill: '#3B82F6' },
    { name: 'Completed', value: stats.completed, fill: '#10B981' }
  ];

  // Chart data for priority distribution
  const priorityChartData = [
    { name: 'High', value: allTasks.filter(t => t.priority === 'high').length, fill: '#EF4444' },
    { name: 'Medium', value: allTasks.filter(t => t.priority === 'medium').length, fill: '#FBBF24' },
    { name: 'Low', value: allTasks.filter(t => t.priority === 'low').length, fill: '#10B981' }
  ];

  // Chart data for user tasks
  const userTasksChartData = users?.filter(u => u.role === 'user').map(u => ({
    name: u.name,
    tasks: allTasks.filter(t => t.user_id === u.id).length,
    completed: allTasks.filter(t => t.user_id === u.id && t.status === 'completed').length
  })) || [];

  const completionRate = allTasks.length > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        userName={user?.name}
        isAdmin={true}
        onLogout={logout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName={user?.name} onLogout={logout} />

        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">
            {/* Dashboard View */}
            {activeMenu === 'dashboard' && (
              <div>
                <div className="mb-8 animate-slide-in-left stagger-1">
                  <h2 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <BarChart3 size={36} className="text-indigo-600" />
                    Admin Dashboard
                  </h2>
                  <p className="text-gray-600">Team overview and task management</p>
                </div>

                {/* Key Metrics Summary - Similar to Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-in-left stagger-2">
                  <div className="card p-5 bg-gradient-to-br from-indigo-50 to-indigo-100 border-l-4 border-indigo-500 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-indigo-700 font-bold mb-2">TOTAL TASKS</p>
                        <p className="text-3xl font-bold text-indigo-900">{stats.total}</p>
                        <p className="text-xs text-indigo-600 mt-2">Team workload</p>
                      </div>
                      <div className="p-3 bg-indigo-200 rounded-lg">
                        <ListTodo size={20} className="text-indigo-600" />
                      </div>
                    </div>
                  </div>

                  <div className="card p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-blue-700 font-bold mb-2">IN PROGRESS</p>
                        <p className="text-3xl font-bold text-blue-900">{stats.inProgress}</p>
                        <p className="text-xs text-blue-600 mt-2">{((stats.inProgress / stats.total) * 100).toFixed(0)}% of total</p>
                      </div>
                      <div className="p-3 bg-blue-200 rounded-lg">
                        <TrendingUp size={20} className="text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="card p-5 bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-green-700 font-bold mb-2">COMPLETION RATE</p>
                        <p className="text-3xl font-bold text-green-900">{completionRate}%</p>
                        <p className="text-xs text-green-600 mt-2">{stats.completed} completed</p>
                      </div>
                      <div className="p-3 bg-green-200 rounded-lg">
                        <CheckCircle2 size={20} className="text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="card p-5 bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-red-700 font-bold mb-2">HIGH PRIORITY</p>
                        <p className="text-3xl font-bold text-red-900">{stats.high}</p>
                        <p className="text-xs text-red-600 mt-2">{((stats.high / stats.total) * 100).toFixed(0)}% urgent</p>
                      </div>
                      <div className="p-3 bg-red-200 rounded-lg">
                        <AlertCircle size={20} className="text-red-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Status Distribution - Pie Chart */}
                  <div className="card p-6 bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-lg transition-shadow animate-slide-in-left stagger-3">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <BarChart3 size={18} className="text-indigo-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Task Status Overview</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statusChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
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
                    </ResponsiveContainer>
                  </div>

                  {/* Team Workload - Bar Chart */}
                  <div className="card p-6 bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-lg transition-shadow animate-slide-in-left stagger-4">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users size={18} className="text-blue-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Team Workload</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={userTasksChartData} margin={{ top: 20, right: 30, left: 0, bottom: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          style={{ fontSize: '12px', fill: '#6b7280' }}
                        />
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
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="tasks" fill="#6366f1" name="Total Tasks" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Completion Rate */}
                  <div className="card p-6 bg-gradient-to-br from-green-50 to-emerald-100 shadow-md hover:shadow-lg transition-shadow animate-slide-in-left stagger-5">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-green-200 rounded-lg">
                        <TrendingUp size={18} className="text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Team Completion Rate</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{completionRate}%</p>
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-4 overflow-hidden shadow-inner">
                        <div
                          className="bg-gradient-to-r from-green-400 to-emerald-500 h-4 rounded-full transition-all duration-500"
                          style={{ width: `${completionRate}%` }}
                        ></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                          <p className="text-xs text-green-700">Completed</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-600">{stats.total - stats.completed}</p>
                          <p className="text-xs text-gray-600">Remaining</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Priority Distribution - Better Chart */}
                  <div className="card p-6 bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-lg transition-shadow animate-slide-in-left stagger-5">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-red-200 rounded-lg">
                        <AlertCircle size={18} className="text-red-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Priority Distribution</h3>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: 'High Priority', color: '#ef4444', key: 'high', textColor: 'text-red-600' },
                        { label: 'Medium Priority', color: '#eab308', key: 'medium', textColor: 'text-yellow-600' },
                        { label: 'Low Priority', color: '#10b981', key: 'low', textColor: 'text-green-600' }
                      ].map((item, idx) => {
                        const count = allTasks.filter(t => t.priority === item.key).length;
                        const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(0) : 0;
                        return (
                          <div key={idx} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-gray-700">{item.label}</span>
                              <span className={`text-sm font-bold ${item.textColor}`}>{count} ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                              <div
                                className="h-3 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%`, backgroundColor: item.color }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Board View - All Tasks */}
            {activeMenu === 'boards' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Monitor All Tasks</h2>
                  <p className="text-gray-600 mb-6">View and manage team tasks</p>

                  {/* User Filter */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Filter by User:</p>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setSelectedUserId(null)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedUserId === null
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        All Users
                      </button>
                      {users?.filter(u => u.role === 'user').map(user => (
                        <button
                          key={user.id}
                          onClick={() => setSelectedUserId(user.id)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            selectedUserId === user.id
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {user.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <BoardView
                  tasks={displayTasks}
                  onTaskClick={() => {}}
                  onAddTask={null}
                  onTaskMove={handleTaskMove}
                />
              </div>
            )}

            {/* Tasks List View */}
            {activeMenu === 'tasks' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">All Tasks</h2>

                  {/* User Filter */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-6">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Filter by User:</p>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setSelectedUserId(null)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedUserId === null
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        All Users
                      </button>
                      {users?.filter(u => u.role === 'user').map(user => (
                        <button
                          key={user.id}
                          onClick={() => setSelectedUserId(user.id)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            selectedUserId === user.id
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {user.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {displayTasks.length > 0 ? (
                    displayTasks.map(task => (
                      <div key={task.id} className="card p-4 hover:shadow-md hover:border-indigo-200 transition-all border border-gray-200 bg-white">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-4">
                            <h3 className="font-semibold text-gray-900 truncate">{task.title}</h3>
                            <p className="text-xs text-gray-500 truncate">{task.description}</p>
                          </div>
                          <div className="col-span-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium whitespace-nowrap">
                              {getUserName(task.user_id)}
                            </span>
                          </div>
                          <div className="col-span-3 flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded font-medium whitespace-nowrap ${
                              task.priority === 'high' ? 'bg-red-100 text-red-700' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {task.priority}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded font-medium whitespace-nowrap ${
                              task.status === 'completed' ? 'bg-green-100 text-green-700' :
                              task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {task.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="col-span-3 text-right">
                            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{formatDate(task.due_date)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <ListTodo size={48} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No tasks found</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analytics View */}
            {activeMenu === 'analytics' && (
              <div>
                <div className="mb-8 animate-slide-in-left stagger-1">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <BarChart3 size={32} className="text-indigo-600" />
                    Team Analytics
                  </h2>
                  <p className="text-gray-600">Detailed team performance metrics & insights</p>
                </div>

                {/* Key Metrics Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-slide-in-left stagger-2">
                  <div className="card p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 border-l-4 border-indigo-500">
                    <p className="text-xs text-indigo-700 font-semibold mb-1">Total Tasks</p>
                    <p className="text-2xl font-bold text-indigo-900">{stats.total}</p>
                    <p className="text-xs text-indigo-600 mt-2">Team workload</p>
                  </div>
                  <div className="card p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
                    <p className="text-xs text-blue-700 font-semibold mb-1">In Progress</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.inProgress}</p>
                    <p className="text-xs text-blue-600 mt-2">{((stats.inProgress / stats.total) * 100).toFixed(0)}% of total</p>
                  </div>
                  <div className="card p-4 bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500">
                    <p className="text-xs text-green-700 font-semibold mb-1">Completion Rate</p>
                    <p className="text-2xl font-bold text-green-900">{completionRate}%</p>
                    <p className="text-xs text-green-600 mt-2">{stats.completed} completed</p>
                  </div>
                  <div className="card p-4 bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500">
                    <p className="text-xs text-red-700 font-semibold mb-1">High Priority</p>
                    <p className="text-2xl font-bold text-red-900">{stats.high}</p>
                    <p className="text-xs text-red-600 mt-2">{((stats.high / stats.total) * 100).toFixed(0)}% urgent</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Overall Completion Rate */}
                  <div className="card p-6 bg-gradient-to-br from-green-50 to-emerald-100 shadow-md hover:shadow-lg transition-shadow animate-slide-in-left stagger-3">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-green-200 rounded-lg">
                        <TrendingUp size={18} className="text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Overall Completion Rate</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{completionRate}%</p>
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-4 overflow-hidden shadow-inner">
                        <div
                          className="bg-gradient-to-r from-green-400 to-emerald-500 h-4 rounded-full transition-all duration-500"
                          style={{
                            width: allTasks.length > 0
                              ? `${(stats.completed / stats.total) * 100}%`
                              : '0%'
                          }}
                        ></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                          <p className="text-xs text-gray-600">Completed</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-600">{stats.total - stats.completed}</p>
                          <p className="text-xs text-gray-600">Remaining</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Distribution */}
                  <div className="card p-6 bg-gradient-to-br from-blue-50 to-cyan-100 shadow-md hover:shadow-lg transition-shadow animate-slide-in-left stagger-4">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-blue-200 rounded-lg">
                        <ListTodo size={18} className="text-blue-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Status Distribution</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gray-400 group-hover:scale-150 transition-transform"></div>
                          <span className="text-sm text-gray-600 font-medium">Planning</span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{stats.plan}</p>
                          <p className="text-xs text-gray-500">{((stats.plan / stats.total) * 100).toFixed(0)}%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500 group-hover:scale-150 transition-transform"></div>
                          <span className="text-sm text-gray-600 font-medium">In Progress</span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">{stats.inProgress}</p>
                          <p className="text-xs text-gray-500">{((stats.inProgress / stats.total) * 100).toFixed(0)}%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-white hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500 group-hover:scale-150 transition-transform"></div>
                          <span className="text-sm text-gray-600 font-medium">Completed</span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">{stats.completed}</p>
                          <p className="text-xs text-gray-500">{((stats.completed / stats.total) * 100).toFixed(0)}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Priority Distribution */}
                  <div className="card p-6 bg-gradient-to-br from-orange-50 to-red-100 shadow-md hover:shadow-lg transition-shadow animate-slide-in-left stagger-5">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-red-200 rounded-lg">
                        <AlertCircle size={18} className="text-red-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Priority Distribution</h3>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: 'High Priority', color: 'red', key: 'high' },
                        { label: 'Medium Priority', color: 'yellow', key: 'medium' },
                        { label: 'Low Priority', color: 'green', key: 'low' }
                      ].map((item, idx) => {
                        const count = allTasks.filter(t => t.priority === item.key).length;
                        const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(0) : 0;
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">{item.label}</span>
                              <span className="text-sm font-bold text-gray-900">{count} ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`bg-${item.color}-500 h-2 rounded-full transition-all duration-300`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Team Member Performance */}
                  <div className="card p-6 bg-gradient-to-br from-purple-50 to-pink-100 shadow-md hover:shadow-lg transition-shadow animate-slide-in-left stagger-5">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="p-2 bg-purple-200 rounded-lg">
                        <Users size={18} className="text-purple-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Team Members</h3>
                    </div>
                    <div className="space-y-4">
                      {users?.filter(u => u.role === 'user').map((u, idx) => {
                        const userTasks = allTasks.filter(t => t.user_id === u.id);
                        const userCompleted = userTasks.filter(t => t.status === 'completed').length;
                        const userRate = userTasks.length > 0 ? ((userCompleted / userTasks.length) * 100).toFixed(0) : 0;
                        return (
                          <div key={u.id} className="p-3 rounded-lg bg-white hover:bg-gray-50 transition-colors animate-slide-in-left" style={{ animationDelay: `${idx * 50}ms` }}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-semibold text-gray-900">{u.name}</span>
                              </div>
                              <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">{userTasks.length} tasks</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${userRate}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{userCompleted}/{userTasks.length} completed ({userRate}%)</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Detailed Performance Table */}
                <div className="card p-6 bg-white shadow-md hover:shadow-lg transition-shadow animate-slide-in-left stagger-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 size={20} className="text-indigo-600" />
                    Detailed Performance Breakdown
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200 bg-gray-50">
                          <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Member</th>
                          <th className="px-4 py-3 text-center text-sm font-bold text-gray-900">Total</th>
                          <th className="px-4 py-3 text-center text-sm font-bold text-gray-900">Planning</th>
                          <th className="px-4 py-3 text-center text-sm font-bold text-gray-900">In Progress</th>
                          <th className="px-4 py-3 text-center text-sm font-bold text-gray-900">Completed</th>
                          <th className="px-4 py-3 text-center text-sm font-bold text-gray-900">Completion %</th>
                          <th className="px-4 py-3 text-center text-sm font-bold text-gray-900">High Priority</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users?.filter(u => u.role === 'user').map((u, idx) => {
                          const userTasks = allTasks.filter(t => t.user_id === u.id);
                          const userCompleted = userTasks.filter(t => t.status === 'completed').length;
                          const userPlan = userTasks.filter(t => t.status === 'plan').length;
                          const userInProgress = userTasks.filter(t => t.status === 'in_progress').length;
                          const userHigh = userTasks.filter(t => t.priority === 'high').length;
                          const userRate = userTasks.length > 0 ? ((userCompleted / userTasks.length) * 100).toFixed(0) : 0;
                          return (
                            <tr key={u.id} className="border-b border-gray-200 hover:bg-indigo-50 transition-colors group animate-slide-in-left" style={{ animationDelay: `${idx * 50}ms` }}>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold group-hover:scale-110 transition-transform">
                                    {u.name.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-sm font-semibold text-gray-900">{u.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-full inline-block">{userTasks.length}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-sm font-medium text-gray-600">{userPlan}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-sm font-medium text-blue-600">{userInProgress}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-sm font-bold text-green-600">{userCompleted}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`text-sm font-bold px-2 py-1 rounded-full inline-block ${
                                  userRate >= 75 ? 'bg-green-100 text-green-700' :
                                  userRate >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-orange-100 text-orange-700'
                                }`}>
                                  {userRate}%
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`text-sm font-bold px-2 py-1 rounded-full inline-block ${
                                  userHigh > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {userHigh}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Users Management View */}
            {activeMenu === 'users' && (
              <UserManagement />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
