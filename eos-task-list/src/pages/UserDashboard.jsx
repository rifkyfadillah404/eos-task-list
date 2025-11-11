import { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { BoardView } from '../components/board/BoardView';
import { TaskForm, TaskTable } from '../components/tasks';
import { useAuth } from '../context/AuthContext';
import { useTask } from '../context/TaskContext';
import { useTaskStats } from '../hooks/useTaskStats';
import { StatCard, CompletionRadial } from '../components/dashboard';
import { Plus, ListTodo, CheckCircle2, AlertCircle, TrendingUp, FolderOpen, BarChart3, Sparkles, Search, Users } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

const formatDate = (dateString) => {
  if (!dateString) return 'No due date';

  try {
    const date = new Date(dateString);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Convert to WIB (UTC+7)
    const wibDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    
    const year = wibDate.getFullYear();
    const month = monthNames[wibDate.getMonth()];
    const day = wibDate.getDate();

    return `${year} ${month} ${day}`;
  } catch {
    return dateString;
  }
};

export const UserDashboard = () => {
  const { user, logout, users } = useAuth();
  const { getUserTasks, addTask, updateTask, moveTask, fetchTasks } = useTask();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTaskStatus, setNewTaskStatus] = useState('plan');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [taskSearch, setTaskSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const userTasks = getUserTasks(user.id);
  
  // Get department teammates count
  const departmentTeammates = users.filter(u => 
    u.department_id && u.department_id === user.department_id
  );

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

  // Use custom hook for statistics
  const stats = useTaskStats(userTasks);

  // Category breakdown for charts
  const categoriesMap = new Map();
  userTasks.forEach((task) => {
    if (task.category) {
      categoriesMap.set(task.category, (categoriesMap.get(task.category) || 0) + 1);
    }
  });

  const filteredTasks = userTasks.filter(task => {
    const matchesStatus = statusFilter === 'all' ? true : task.status === statusFilter;
    const matchesSearch = taskSearch.trim().length === 0
      ? true
      : [task.title, task.description]
          .filter(Boolean)
          .some(field => field.toLowerCase().includes(taskSearch.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const statusChartData = [
    { name: 'Plan', value: stats.plan, fill: '#c084fc' },
    { name: 'In Progress', value: stats.inProgress, fill: '#60a5fa' },
    { name: 'Completed', value: stats.completed, fill: '#34d399' }
  ];

  const priorityChartData = [
    { name: 'High', value: stats.high, fill: '#f97316' },
    { name: 'Medium', value: stats.medium, fill: '#facc15' },
    { name: 'Low', value: stats.low, fill: '#10b981' }
  ];

  const completionRadialData = [
    {
      name: 'Completion',
      value: stats.completionRate,
      fill: '#34d399'
    }
  ];

  const categoryBreakdown = Array.from(categoriesMap, ([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const toValidDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const upcomingTasks = userTasks
    .map(task => ({ task, due: toValidDate(task.due_date) }))
    .filter(({ task, due }) => due && task.status !== 'completed' && due >= startOfToday)
    .sort((a, b) => a.due - b.due)
    .slice(0, 4)
    .map(({ task }) => task);

  const focusTasks = userTasks
    .filter(task => task.priority === 'high' && task.status !== 'completed')
    .sort((a, b) => {
      const dueA = toValidDate(a.due_date) || new Date(8640000000000000);
      const dueB = toValidDate(b.due_date) || new Date(8640000000000000);
      return dueA - dueB;
    })
    .slice(0, 4);

  const nextDeadline = upcomingTasks[0];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        userName={user?.name}
        onLogout={logout}
        isMobileOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
      />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          userName={user?.name}
          onLogout={logout}
          onToggleSidebar={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">
            {/* Dashboard View */}
            {activeMenu === 'dashboard' && (
              <div className="space-y-12">
                <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-lg xl:col-span-2">
                    <div className="p-8 sm:p-10">
                      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-xl">
                          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-slate-500">
                            <Sparkles size={18} className="text-indigo-500" />
                            Daily Snapshot
                          </div>
                          <h2 className="mt-4 text-4xl font-semibold leading-tight text-slate-900">
                            Welcome back, {user?.name || 'Teammate'}.
                          </h2>
                          <p className="mt-3 text-sm leading-relaxed text-slate-500">
                            Review your current focus, upcoming deadlines, and overall momentum in one clean view.
                          </p>
                          {user?.department_id && departmentTeammates.length > 1 && (
                            <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 border border-blue-200">
                              <Users size={14} />
                              <span>Viewing {departmentTeammates.length} teammates from your department</span>
                            </div>
                          )}
                          <div className="mt-6 flex flex-wrap gap-3">
                            <button
                              onClick={() => handleAddTask('plan')}
                              className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                            >
                              <Plus size={16} />
                              New Task
                            </button>
                            <button
                              onClick={() => setActiveMenu('boards')}
                              className="flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              View Board
                            </button>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Next deadline</p>
                          <p className="mt-3 text-lg font-semibold text-slate-900 line-clamp-2">
                            {nextDeadline ? nextDeadline.title : 'All clear for now'}
                          </p>
                          <div className="mt-4 flex flex-col gap-2 text-xs text-slate-500">
                            <div className="flex items-center justify-between gap-4">
                              <span>{nextDeadline ? formatDate(nextDeadline.due_date) : 'No upcoming date'}</span>
                              <span className="rounded-full bg-white px-2.5 py-1 font-semibold capitalize text-slate-700">
                                {nextDeadline ? nextDeadline.priority : 'Relax'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span>Status</span>
                              <span className="rounded-full bg-white px-2.5 py-1 font-semibold capitalize text-slate-700">
                                {nextDeadline ? nextDeadline.status.replace('_', ' ') : '—'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CompletionRadial
                    completionRate={stats.completionRate}
                    completed={stats.completed}
                    remaining={stats.total - stats.completed}
                  />
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <StatCard
                    title={user?.department_id && departmentTeammates.length > 1 ? 'Department Tasks' : 'Total Tasks'}
                    value={stats.total}
                    subtitle={user?.department_id && departmentTeammates.length > 1 ? `${departmentTeammates.length} teammates` : `${stats.plan} in planning`}
                    icon={ListTodo}
                    color="indigo"
                  />
                  <StatCard
                    title="In Progress"
                    value={stats.inProgress}
                    subtitle={`${stats.total > 0 ? ((stats.inProgress / stats.total) * 100).toFixed(0) : 0}% of workload`}
                    icon={TrendingUp}
                    color="sky"
                  />
                  <StatCard
                    title="Completed"
                    value={stats.completed}
                    subtitle={`${stats.completionRate}% success`}
                    icon={CheckCircle2}
                    color="emerald"
                  />
                  <StatCard
                    title="High Priority"
                    value={stats.high}
                    subtitle={`${stats.total > 0 ? ((stats.high / stats.total) * 100).toFixed(0) : 0}% urgent`}
                    icon={AlertCircle}
                    color="rose"
                  />
                </section>

                <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600">
                            <BarChart3 size={20} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">Task Distribution</h3>
                            <p className="text-xs text-slate-500">Balance of planning, execution, and delivery.</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 h-72">
                        {stats.total > 0 ? (
                          <ResponsiveContainer>
                            <PieChart>
                              <Pie
                                data={statusChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={8}
                                dataKey="value"
                              >
                                {statusChartData.map((entry) => (
                                  <Cell key={entry.name} fill={entry.fill} />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value, name) => [`${value} tasks`, name]}
                                contentStyle={{
                                  borderRadius: 12,
                                  border: '1px solid #e2e8f0',
                                  boxShadow: '0 18px 40px rgba(15,23,42,0.12)',
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-slate-400">
                            No tasks yet
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-amber-100 p-3 text-amber-600">
                          <TrendingUp size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">Priority Breakdown</h3>
                          <p className="text-xs text-slate-500">Where to focus attention first.</p>
                        </div>
                      </div>
                      <div className="mt-6 h-72">
                        {stats.total > 0 ? (
                          <ResponsiveContainer>
                            <BarChart data={priorityChartData} margin={{ top: 16, right: 20, bottom: 8, left: 0 }}>
                              <CartesianGrid strokeDasharray="4 8" stroke="#e2e8f0" horizontal={false} />
                              <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} />
                              <YAxis allowDecimals={false} tick={{ fill: '#475569', fontSize: 12 }} />
                              <Tooltip
                                formatter={(value) => [`${value} tasks`, 'Priority']}
                                contentStyle={{
                                  borderRadius: 12,
                                  border: '1px solid #e2e8f0',
                                  boxShadow: '0 18px 40px rgba(15,23,42,0.12)',
                                }}
                              />
                              <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={28}>
                                {priorityChartData.map((entry) => (
                                  <Cell key={entry.name} fill={entry.fill} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-slate-400">
                            No tasks yet
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-purple-100 p-3 text-purple-600">
                        <FolderOpen size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Categories</h3>
                        <p className="text-xs text-slate-500">Your work streams at a glance.</p>
                      </div>
                    </div>
                    <div className="mt-6 space-y-3">
                      {categoryBreakdown.length > 0 ? (
                        categoryBreakdown.map((item, index) => (
                          <div
                            key={item.name}
                            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ background: ['#a855f7', '#6366f1', '#06b6d4', '#f97316', '#22c55e', '#ec4899'][index % 6] }}
                              ></span>
                              <span className="text-sm font-medium text-slate-700">{item.name}</span>
                            </div>
                            <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
                          Add tasks to populate categories
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Upcoming deadlines</h3>
                        <p className="text-xs text-slate-500">Stay ahead by tackling the next due items.</p>
                      </div>
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                        {upcomingTasks.length} due soon
                      </span>
                    </div>
                    <div className="mt-6 space-y-4">
                      {upcomingTasks.length > 0 ? (
                        upcomingTasks.map(task => (
                          <button
                            key={task.id}
                            onClick={() => handleTaskClick(task)}
                            className="w-full text-left transition hover:-translate-y-0.5 hover:shadow-md"
                          >
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <p className="text-sm font-semibold text-slate-900 line-clamp-1">{task.title}</p>
                                  <p className="text-xs text-slate-500 line-clamp-2">{task.description || 'No description'}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <span className="text-xs font-semibold text-slate-500">{formatDate(task.due_date)}</span>
                                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold capitalize text-slate-600">
                                    {task.status.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-400">
                          Nothing urgent coming up. Keep the momentum!
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Focus zone</h3>
                        <p className="text-xs text-slate-500">High-priority work that needs your attention.</p>
                      </div>
                      <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                        {focusTasks.length} critical
                      </span>
                    </div>
                    <div className="mt-6 space-y-4">
                      {focusTasks.length > 0 ? (
                        focusTasks.map(task => (
                          <button
                            key={task.id}
                            onClick={() => handleTaskClick(task)}
                            className="w-full text-left transition hover:-translate-y-0.5 hover:shadow-md"
                          >
                            <div className="rounded-2xl border border-rose-100 bg-rose-50/80 px-4 py-3">
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <p className="text-sm font-semibold text-rose-700 line-clamp-1">{task.title}</p>
                                  <p className="text-xs text-rose-500 line-clamp-2">{task.description || 'No description'}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <span className="text-xs font-semibold text-rose-500">{formatDate(task.due_date)}</span>
                                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold capitalize text-rose-600">
                                    {task.status.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/80 px-4 py-10 text-center text-xs font-semibold text-rose-400">
                          No critical tasks pending. Great job!
                        </div>
                      )}
                    </div>
                  </div>
                </section>
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
                  onRefreshTasks={fetchTasks}
                  onTaskMove={handleTaskMove}
                />
              </div>
            )}

            {/* Tasks List View */}
            {activeMenu === 'tasks' && (
              <div className="space-y-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 className="text-3xl font-semibold text-slate-900">All Tasks</h2>
                    <p className="text-sm text-slate-500">Search, filter, and manage everything assigned to you.</p>
                  </div>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="relative w-full md:w-72">
                      <input
                        type="text"
                        placeholder="Search by title or description"
                        value={taskSearch}
                        onChange={(e) => setTaskSearch(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                      />
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['all', 'plan', 'in_progress', 'completed'].map(option => (
                        <button
                          key={option}
                          onClick={() => setStatusFilter(option)}
                          className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                            statusFilter === option
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {option === 'all' ? 'All Statuses' : option.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => handleAddTask('plan')}
                      className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                    >
                      <Plus size={16} />
                      New Task
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <TaskTable 
                    tasks={filteredTasks} 
                    onTaskClick={handleTaskClick}
                  />
                </div>
              </div>
            )}

            {/* Jobs are admin-only; no jobs view here */}
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
