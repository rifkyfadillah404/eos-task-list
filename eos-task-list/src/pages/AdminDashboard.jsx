import { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { BoardView } from '../components/board/BoardView';
import { TaskTable } from '../components/tasks';
import { UserManagement } from '../components/admin/UserManagement';
import { useAuth } from '../context/AuthContext';
import { useTask } from '../context/TaskContext';
import { TaskForm } from '../components/tasks';
import { useTaskStats } from '../hooks/useTaskStats';
import { StatCard, FilterButtons, CompletionRadial } from '../components/dashboard';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, ListTodo, CheckCircle2, AlertCircle, Users, Search } from 'lucide-react';
import { JobManagement } from '../components/jobs';

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

export const AdminDashboard = () => {
  const { user, logout, users } = useAuth();
  const { getAllTasks, moveTask, fetchTasks } = useTask();
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [taskSearch, setTaskSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [jobs, setJobs] = useState([]);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Fetch jobs for category filter
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/jobs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setJobs(data.jobs || []);
        }
      } catch (err) {
      }
    };
    fetchJobs();
  }, []);

  const allTasks = getAllTasks();

  // Get unique departments from users
  const departments = [...new Set(users?.filter(u => u.department_name).map(u => ({
    id: u.department_id,
    name: u.department_name
  })).map(d => JSON.stringify(d)))].map(d => JSON.parse(d));

  // Get unique categories from jobs (level 0 only - no parent)
  const categories = [...new Set(jobs.filter(j => !j.parent).map(j => j.category))].filter(Boolean).sort();

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskFormOpen(true);
  };

  const handleSubmitTask = (formData) => {
    // In admin view, we might want to handle updates differently
    // For now, just close the form
    setIsTaskFormOpen(false);
    setSelectedTask(null);
  };

  const displayTasks = allTasks;

  const filteredTasks = displayTasks.filter(task => {
    const matchesStatus =
      statusFilter === 'all' ? true : task.status === statusFilter;
    
    const matchesDepartment = departmentFilter === 'all' ? true : 
      users?.find(u => u.id === task.user_id)?.department_id === parseInt(departmentFilter);
    
    const matchesCategory = categoryFilter === 'all' ? true : (() => {
      // Find the job associated with this task
      const taskJob = jobs.find(j => j.id === task.job_id);
      if (!taskJob) return false;
      
      // If job has no parent, it's a category - match directly
      if (!taskJob.parent) {
        return taskJob.category === categoryFilter;
      }
      
      // If job has parent, trace back to find the root category
      let currentJob = taskJob;
      while (currentJob.parent) {
        const parentJob = jobs.find(j => j.id === parseInt(currentJob.parent));
        if (!parentJob) break;
        currentJob = parentJob;
      }
      
      // currentJob is now the root category
      return currentJob.category === categoryFilter;
    })();
    
    const matchesSearch = taskSearch.trim().length === 0
      ? true
      : [task.title, task.description]
          .filter(Boolean)
          .some(field => field.toLowerCase().includes(taskSearch.toLowerCase()));
    
    return matchesStatus && matchesDepartment && matchesCategory && matchesSearch;
  });

  const getUserName = (userId) => {
    return users?.find(u => u.id === userId)?.name || 'Unknown';
  };

  const handleTaskMove = (taskId, newStatus) => {
    moveTask(taskId, newStatus);
  };

  // Use custom hook for statistics
  const stats = useTaskStats(allTasks);

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

  const statusRadarData = statusChartData.map(item => ({
    ...item,
    fullMark: stats.total || 1
  }));

  const workloadChartData = userTasksChartData.map(item => ({
    name: item.name,
    total: item.tasks,
    completed: item.completed,
    remaining: Math.max(item.tasks - item.completed, 0)
  }));

  const priorityBarData = priorityChartData.map(item => ({
    ...item,
    percentage: stats.total > 0 ? Number(((item.value / stats.total) * 100).toFixed(1)) : 0
  }));

  const topContributors = [...userTasksChartData]
    .sort((a, b) => b.completed - a.completed)
    .slice(0, 4);

  const completionRadialData = [
    {
      name: 'Completion',
      value: stats.completionRate,
      fill: '#34d399'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        userName={user?.name}
        isAdmin={true}
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
              <div className="space-y-10">
                <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-slide-in-left stagger-1">
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-lg xl:col-span-2">
                    <div className="p-8">
                      <div className="flex flex-wrap items-start justify-between gap-6">
                        <div>
                          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-slate-500">
                            <BarChart3 size={20} className="text-indigo-600" />
                            Control Center
                          </div>
                          <h2 className="mt-4 text-4xl font-bold text-slate-900">Admin Performance Dashboard</h2>
                          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-500">
                            Monitor workload, delivery velocity, and team health in a single view tailored for fast decisions.
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 text-right">
                          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Active Admin</span>
                          <span className="text-lg font-semibold text-slate-900">{user?.name || 'Administrator'}</span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{stats.total} total tasks</span>
                        </div>
                      </div>

                      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                          title="Total Tasks"
                          value={stats.total}
                          subtitle="Full queue assigned across your team."
                          icon={ListTodo}
                          color="indigo"
                        />
                        <StatCard
                          title="In Progress"
                          value={stats.inProgress}
                          subtitle={`${stats.total > 0 ? ((stats.inProgress / stats.total) * 100).toFixed(0) : 0}% of all tasks currently moving.`}
                          icon={TrendingUp}
                          color="sky"
                        />
                        <StatCard
                          title="Completed"
                          value={stats.completed}
                          subtitle={`Achievement rate at ${stats.completionRate}% this cycle.`}
                          icon={CheckCircle2}
                          color="emerald"
                        />
                        <StatCard
                          title="High Priority"
                          value={stats.high}
                          subtitle={`${stats.total > 0 ? ((stats.high / stats.total) * 100).toFixed(0) : 0}% of items require fast attention.`}
                          icon={AlertCircle}
                          color="rose"
                        />
                      </div>
                    </div>
                  </div>

                  <CompletionRadial
                    completionRate={stats.completionRate}
                    completed={stats.completed}
                    remaining={stats.total - stats.completed}
                  />
                </section>

                <section className="grid grid-cols-1 gap-4 lg:grid-cols-3 animate-slide-in-left stagger-2">
                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-indigo-100 p-3">
                        <BarChart3 size={20} className="text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Task Status Spectrum</h3>
                        <p className="text-xs text-slate-500">Visual balance of planning, execution, and delivery.</p>
                      </div>
                    </div>
                    <div className="mt-4 h-48">
                      <ResponsiveContainer>
                        <RadarChart data={statusRadarData} outerRadius="85%">
                          <defs>
                            <linearGradient id="statusGradient" x1="0" x2="1" y1="0" y2="1">
                              <stop offset="0%" stopColor="#6366f1" />
                              <stop offset="100%" stopColor="#22d3ee" />
                            </linearGradient>
                          </defs>
                          <PolarGrid radialLines={false} stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} />
                          <PolarRadiusAxis angle={30} domain={[0, stats.total || 1]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <Radar
                            name="Tasks"
                            dataKey="value"
                            stroke="#6366f1"
                            fill="url(#statusGradient)"
                            fillOpacity={0.6}
                          />
                          <Tooltip
                            formatter={(value) => [`${value} tasks`, 'Status']}
                            contentStyle={{
                              borderRadius: 12,
                              border: '1px solid #e2e8f0',
                              boxShadow: '0 20px 45px rgba(15, 23, 42, 0.12)'
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-sky-100 p-3">
                        <Users size={20} className="text-sky-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Team Workload Pulse</h3>
                        <p className="text-xs text-slate-500">Compare throughput and delivery across members.</p>
                      </div>
                    </div>
                    <div className="mt-4 h-48">
                      <ResponsiveContainer>
                        <ComposedChart data={workloadChartData} margin={{ top: 12, right: 8, bottom: 0, left: 0 }}>
                          <defs>
                            <linearGradient id="workloadGradient" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="#c7d2fe" />
                              <stop offset="100%" stopColor="#eef2ff" />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="4 8" stroke="#e2e8f0" />
                          <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} interval={0} angle={-25} textAnchor="end" height={60} />
                          <YAxis allowDecimals={false} tick={{ fill: '#475569', fontSize: 11 }} />
                          <Tooltip
                            formatter={(value, name) => [`${value} tasks`, name === 'total' ? 'Assigned' : name === 'completed' ? 'Completed' : 'Remaining']}
                            contentStyle={{
                              borderRadius: 12,
                              border: '1px solid #e2e8f0',
                              boxShadow: '0 20px 45px rgba(15, 23, 42, 0.12)'
                            }}
                          />
                          <Legend formatter={(value) => value === 'total' ? 'Assigned' : value === 'completed' ? 'Completed' : 'Remaining'} />
                          <Area type="monotone" dataKey="total" stroke="#818cf8" fill="url(#workloadGradient)" fillOpacity={1} strokeWidth={2} />
                          <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          <Bar dataKey="remaining" fill="#facc15" radius={[8, 8, 0, 0]} maxBarSize={28} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-rose-100 p-3">
                        <AlertCircle size={20} className="text-rose-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Priority Pressure</h3>
                        <p className="text-xs text-slate-500">Balance of urgency across the queue.</p>
                      </div>
                    </div>
                    <div className="mt-4 h-48">
                      <ResponsiveContainer>
                        <BarChart data={priorityBarData} layout="vertical" margin={{ top: 8, right: 16, bottom: 8, left: 36 }}>
                          <CartesianGrid strokeDasharray="4 8" stroke="#e2e8f0" horizontal={false} />
                          <XAxis type="number" hide domain={[0, stats.total || 1]} />
                          <YAxis dataKey="name" type="category" tick={{ fill: '#475569', fontSize: 12 }} />
                          <Tooltip
                            formatter={(value, name, props) => [`${value} tasks (${props.payload.percentage}%)`, 'Priority']}
                            contentStyle={{
                              borderRadius: 12,
                              border: '1px solid #e2e8f0',
                              boxShadow: '0 20px 45px rgba(15, 23, 42, 0.12)'
                            }}
                          />
                          <Bar dataKey="value" radius={12}>
                            {priorityBarData.map((entry, index) => (
                              <Cell key={`bar-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-1 gap-6 lg:grid-cols-3 animate-slide-in-left stagger-3">
                  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg lg:col-span-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Top Contributors</h3>
                        <p className="text-xs text-slate-500">Celebrating the teammates shipping the most impact.</p>
                      </div>
                      <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">Live sync</div>
                    </div>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      {topContributors.length > 0 ? (
                        topContributors.map(member => {
                          const total = member.tasks || 0;
                          const completed = member.completed || 0;
                          const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
                          return (
                            <div key={member.name} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-semibold text-white">
                                    {member.name?.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                                    <p className="text-xs text-slate-500">{completed}/{total} completed</p>
                                  </div>
                                </div>
                                <span className="text-sm font-semibold text-slate-700">{rate}%</span>
                              </div>
                              <div className="mt-4 h-2 w-full rounded-full bg-slate-200">
                                <div
                                  className="h-2 rounded-full bg-slate-900"
                                  style={{ width: `${rate}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                          No contributors yet.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-slate-900">High Priority Focus</h3>
                    <p className="mt-1 text-xs text-slate-500">Keep an eye on what needs immediate action.</p>
                    <div className="mt-5 space-y-3">
                      {allTasks.filter(t => t.priority === 'high').slice(0, 5).map(task => (
                        <div key={task.id} className="rounded-2xl border border-rose-100 bg-rose-50/60 px-4 py-3">
                          <p className="text-sm font-semibold text-rose-700">{task.title}</p>
                          <div className="mt-2 flex items-center justify-between text-xs text-rose-500">
                            <span>{getUserName(task.user_id)}</span>
                            <span>{formatDate(task.due_date)}</span>
                          </div>
                        </div>
                      ))}
                      {allTasks.filter(t => t.priority === 'high').length === 0 && (
                        <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/60 px-4 py-6 text-center text-xs text-rose-400">
                          No urgent tasks right now. Enjoy the calm.
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Board View - All Tasks */}
            {activeMenu === 'boards' && (
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Monitor All Tasks</h2>
                  <p className="text-gray-600 mb-6">View and manage team tasks</p>
                </div>

                <BoardView
                  tasks={displayTasks}
                  onTaskClick={null}
                  onAddTask={null}
                  onTaskMove={handleTaskMove}
                  enableDrag={false}
                  onRefreshTasks={fetchTasks}
                />
              </div>
            )}

            {/* Tasks List View */}
            {activeMenu === 'tasks' && (
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Task Management</h2>
                  <p className="text-sm text-slate-500 mt-1">View and manage all team tasks in one place</p>
                </div>

                {/* Filters Card */}
                <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 shadow-md p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Search size={18} className="text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Search & Filters</h3>
                  </div>

                  <div className="space-y-4">
                    {/* Search Bar */}
                    <div>
                      <label className="text-xs font-medium text-slate-700 mb-2 block">Search Tasks</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Type task title or description..."
                          value={taskSearch}
                          onChange={(e) => setTaskSearch(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        {taskSearch && (
                          <button
                            onClick={() => setTaskSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="text-xs font-medium text-slate-700 mb-2 block">Filter by Status</label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setStatusFilter('all')}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                            statusFilter === 'all'
                              ? 'bg-indigo-600 text-white shadow-md'
                              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <ListTodo size={14} />
                          All Tasks ({allTasks.length})
                        </button>
                        <button
                          onClick={() => setStatusFilter('plan')}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                            statusFilter === 'plan'
                              ? 'bg-orange-500 text-white shadow-md'
                              : 'bg-white text-slate-700 border border-slate-300 hover:bg-orange-50'
                          }`}
                        >
                          <AlertCircle size={14} />
                          Plan ({stats.plan})
                        </button>
                        <button
                          onClick={() => setStatusFilter('in_progress')}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                            statusFilter === 'in_progress'
                              ? 'bg-blue-500 text-white shadow-md'
                              : 'bg-white text-slate-700 border border-slate-300 hover:bg-blue-50'
                          }`}
                        >
                          <TrendingUp size={14} />
                          In Progress ({stats.inProgress})
                        </button>
                        <button
                          onClick={() => setStatusFilter('completed')}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                            statusFilter === 'completed'
                              ? 'bg-green-500 text-white shadow-md'
                              : 'bg-white text-slate-700 border border-slate-300 hover:bg-green-50'
                          }`}
                        >
                          <CheckCircle2 size={14} />
                          Completed ({stats.completed})
                        </button>
                      </div>
                    </div>

                    {/* Department & Category Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                      {/* Department Filter */}
                      <div>
                        <label className="text-xs font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                          <Users size={14} className="text-purple-600" />
                          Filter by Department
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setDepartmentFilter('all')}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                              departmentFilter === 'all'
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'bg-white text-slate-600 border border-slate-300 hover:bg-purple-50'
                            }`}
                          >
                            All Departments
                          </button>
                          {departments.map(dept => (
                            <button
                              key={dept.id}
                              onClick={() => setDepartmentFilter(String(dept.id))}
                              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                                departmentFilter === String(dept.id)
                                  ? 'bg-purple-600 text-white shadow-sm'
                                  : 'bg-white text-slate-600 border border-slate-300 hover:bg-purple-50'
                              }`}
                            >
                              {dept.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Category Filter */}
                      <div>
                        <label className="text-xs font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                          <BarChart3 size={14} className="text-cyan-600" />
                          Filter by Category
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setCategoryFilter('all')}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                              categoryFilter === 'all'
                                ? 'bg-cyan-600 text-white shadow-sm'
                                : 'bg-white text-slate-600 border border-slate-300 hover:bg-cyan-50'
                            }`}
                          >
                            All Categories
                          </button>
                          {categories.map(category => (
                            <button
                              key={category}
                              onClick={() => setCategoryFilter(category)}
                              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                                categoryFilter === category
                                  ? 'bg-cyan-600 text-white shadow-sm'
                                  : 'bg-white text-slate-600 border border-slate-300 hover:bg-cyan-50'
                              }`}
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Active Filters Summary */}
                    {(statusFilter !== 'all' || departmentFilter !== 'all' || categoryFilter !== 'all' || taskSearch) && (
                      <div className="pt-4 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <span className="font-medium">Active filters:</span>
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md font-medium">
                              {filteredTasks.length} tasks found
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setStatusFilter('all');
                              setDepartmentFilter('all');
                              setCategoryFilter('all');
                              setTaskSearch('');
                            }}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                          >
                            Clear all filters
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-900">Task List</h3>
                      <span className="text-xs text-slate-500">{filteredTasks.length} of {allTasks.length} tasks</span>
                    </div>
                  </div>
                  <TaskTable 
                    tasks={filteredTasks} 
                    onTaskClick={null}
                    users={users}
                  />
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
                    <p className="text-2xl font-bold text-green-900">{stats.completionRate}%</p>
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
                        <p className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.completionRate}%</p>
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

            {/* Job Management View (Admin Only) */}
            {activeMenu === 'jobs' && (
              <JobManagement />
            )}

            {/* Users Management View */}
            {activeMenu === 'users' && (
              <UserManagement />
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
      />
    </div>
  );
};
