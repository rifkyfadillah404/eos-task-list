import { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { BoardView } from '../components/board/BoardView';
import { TaskForm } from '../components/tasks/TaskForm';
import { useAuth } from '../context/AuthContext';
import { useTask } from '../context/TaskContext';
import { Plus, ListTodo, CheckCircle2, AlertCircle, TrendingUp, FolderOpen, BarChart3, Sparkles, Search, Calendar, Users } from 'lucide-react';
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
  Tooltip,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis
} from 'recharts';

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
  } catch {
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [taskSearch, setTaskSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const stats = {
    total: userTasks.length,
    plan: 0,
    inProgress: 0,
    completed: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  const categoriesMap = new Map();

  userTasks.forEach((task) => {
    if (task.status === 'plan') stats.plan += 1;
    else if (task.status === 'in_progress') stats.inProgress += 1;
    else if (task.status === 'completed') stats.completed += 1;

    if (task.priority === 'high') stats.high += 1;
    else if (task.priority === 'medium') stats.medium += 1;
    else if (task.priority === 'low') stats.low += 1;

    if (task.category) {
      categoriesMap.set(task.category, (categoriesMap.get(task.category) || 0) + 1);
    }
  });

  const completionRate = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

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
      value: completionRate,
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
                  <div className="rounded-2xl border border-slate-100 bg-white shadow-lg">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Completion</p>
                          <h3 className="mt-3 text-2xl font-semibold text-slate-900">{completionRate}%</h3>
                          <p className="text-xs text-slate-500">{stats.completed} done · {stats.total - stats.completed} remaining</p>
                        </div>
                        <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                          Updated live
                        </div>
                      </div>
                    </div>
                    <div className="relative -mt-4 h-64 pb-6">
                      {stats.total > 0 ? (
                        <>
                          <ResponsiveContainer>
                            <RadialBarChart
                              innerRadius="60%"
                              outerRadius="100%"
                              data={completionRadialData}
                              startAngle={90}
                              endAngle={-270}
                            >
                              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                              <RadialBar
                                minAngle={12}
                                dataKey="value"
                                cornerRadius={24}
                                clockWise
                                fill="#34d399"
                              />
                              <Tooltip
                                formatter={(value) => [`${value}%`, 'Completion']}
                                contentStyle={{
                                  borderRadius: 12,
                                  border: '1px solid #e2e8f0',
                                  boxShadow: '0 18px 40px rgba(15,23,42,0.12)',
                                }}
                              />
                            </RadialBarChart>
                          </ResponsiveContainer>
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <p className="text-4xl font-semibold text-slate-900">{completionRate}%</p>
                              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Success rate</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-400">
                          Add your first task to see progress
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">Total Tasks</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</p>
                        <p className="mt-2 text-xs text-slate-500">{stats.plan} in planning</p>
                      </div>
                      <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
                        <ListTodo size={22} />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-500">In Progress</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{stats.inProgress}</p>
                        <p className="mt-2 text-xs text-slate-500">{stats.total > 0 ? ((stats.inProgress / stats.total) * 100).toFixed(0) : 0}% of workload</p>
                      </div>
                      <div className="rounded-xl bg-sky-100 p-3 text-sky-600">
                        <TrendingUp size={22} />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-500">Completed</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{stats.completed}</p>
                        <p className="mt-2 text-xs text-slate-500">{completionRate}% success</p>
                      </div>
                      <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                        <CheckCircle2 size={22} />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-500">High Priority</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{stats.high}</p>
                        <p className="mt-2 text-xs text-slate-500">{stats.total > 0 ? ((stats.high / stats.total) * 100).toFixed(0) : 0}% urgent</p>
                      </div>
                      <div className="rounded-xl bg-rose-100 p-3 text-rose-600">
                        <AlertCircle size={22} />
                      </div>
                    </div>
                  </div>
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
                  onTaskMove={handleTaskMove}
                />
              </div>
            )}

            {/* Tasks List View */}
            {activeMenu === 'tasks' && (
              <div className="space-y-10">
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

                <div className="space-y-3">
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => (
                      <button
                        key={task.id}
                        onClick={() => handleTaskClick(task)}
                        className="w-full text-left"
                      >
                        <div className="group rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-xl">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">
                                  {task.status.replace('_', ' ')}
                                </span>
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${
                                    task.priority === 'high'
                                      ? 'bg-rose-50 text-rose-600'
                                      : task.priority === 'medium'
                                      ? 'bg-amber-50 text-amber-600'
                                      : 'bg-emerald-50 text-emerald-600'
                                  }`}
                                >
                                  {task.priority} priority
                                </span>
                              </div>
                              <h3 className="mt-3 text-lg font-semibold text-slate-900">
                                {task.title}
                              </h3>
                              <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                                {task.description || 'No description provided'}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                              <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
                                <Calendar size={16} className="text-indigo-500" />
                                <span className="font-semibold text-slate-700">{formatDate(task.due_date)}</span>
                              </div>
                              <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
                                <Users size={16} className="text-indigo-500" />
                                <span className="font-semibold text-slate-700">You</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                                ID-{task.id}
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white/60 py-16 text-center text-slate-500 shadow-sm">
                      <ListTodo size={48} className="mx-auto text-slate-300" />
                      <p className="mt-4 text-sm font-semibold">No tasks found</p>
                      <p className="text-xs text-slate-400">Try a different status or clear your search.</p>
                    </div>
                  )}
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
