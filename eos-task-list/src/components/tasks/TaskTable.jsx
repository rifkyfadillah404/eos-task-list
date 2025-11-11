import { Calendar, Users, AlertCircle, CheckCircle2, Clock, MessageCircle, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CommentModal } from '../comments';
import { useAuth } from '../../context/AuthContext';
import { useTask } from '../../context/TaskContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const formatDate = (dateString) => {
  if (!dateString) return '-';

  try {
    const date = new Date(dateString);
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const year = date.getFullYear();
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day} ${month} ${year} ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
};

export const TaskTable = ({ tasks, onTaskClick, onTaskMove, users }) => {
  const [jobs, setJobs] = useState([]);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedTaskForComment, setSelectedTaskForComment] = useState(null);
  const [taskCommentCounts, setTaskCommentCounts] = useState({});
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const { user } = useAuth();
  const { deleteTask } = useTask();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/jobs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setJobs(data.jobs || []);
        } else {
        }
      } catch (err) {
      }
    };
    fetchJobs();
  }, []);

  // Initialize comment counts from tasks
  useEffect(() => {
    const counts = {};
    tasks.forEach(task => {
      counts[task.id] = task.comment_count || 0;
    });
    setTaskCommentCounts(counts);
  }, [tasks]);

  const handleOpenComments = (e, task) => {
    e.stopPropagation();
    setSelectedTaskForComment(task);
    setCommentModalOpen(true);
  };

  const handleCommentAdded = () => {
    // Update comment count for the task
    if (selectedTaskForComment) {
      setTaskCommentCounts(prev => ({
        ...prev,
        [selectedTaskForComment.id]: (prev[selectedTaskForComment.id] || 0) + 1
      }));
    }
  };

  const handleDeleteTask = async (e, task) => {
    e.stopPropagation();
    
    if (deletingTaskId === task.id) return;
    
    if (!confirm(`Yakin mau hapus task "${task.title}"?`)) return;
    
    setDeletingTaskId(task.id);
    try {
      await deleteTask(task.id);
    } catch (error) {
      alert('Gagal hapus task: ' + error.message);
    } finally {
      setDeletingTaskId(null);
    }
  };

  const processJobHierarchy = (job) => {
    // Struktur database jobs sebenarnya:
    // - Level 0 (Category): parent=null, category="Category Name"
    // - Level 1 (Parent): parent=<category_id>, category="Parent Name"
    // - Level 2 (Sub-parent): parent=<parent_id>, category="Sub-parent Name"
    // Field sub_parent di database selalu null, tidak dipakai!
    
    // Current job name
    const category = job.category || '-';
    
    // Jika job.parent tidak ada, berarti ini adalah root category
    if (!job.parent) {
      return { 
        category: category,  // Category name
        parent: '-',         // No parent (ini root)
        subParent: '-'       // No sub-parent
      };
    }
    
    // Lookup parent job
    const parentJob = jobs.find(j => j.id === parseInt(job.parent));
    
    if (!parentJob) {
      return { 
        category: category, 
        parent: '-', 
        subParent: '-' 
      };
    }
    
    // Jika parent job tidak punya parent, berarti:
    // - parentJob adalah Category (level 0)
    // - job ini adalah Parent (level 1)
    if (!parentJob.parent) {
      return {
        category: parentJob.category,  // Category name (dari parent)
        parent: category,               // Parent name (job ini)
        subParent: '-'                  // Belum ada sub-parent
      };
    }
    
    // Jika parent job punya parent, berarti:
    // - grandparent adalah Category (level 0)
    // - parentJob adalah Parent (level 1)  
    // - job ini adalah Sub-parent (level 2)
    const grandparentJob = jobs.find(j => j.id === parseInt(parentJob.parent));
    
    return {
      category: grandparentJob ? grandparentJob.category : '-',  // Category name
      parent: parentJob.category,                                 // Parent name
      subParent: category                                         // Sub-parent name (job ini)
    };
  };

  const getJobHierarchy = (jobId) => {
    if (!jobId) {
      return { category: '-', parent: '-', subParent: '-' };
    }
    
    if (!jobs.length) {
      return { category: '-', parent: '-', subParent: '-' };
    }
    
    
    const job = jobs.find(j => j.id === jobId);
    if (!job) {
      const jobParsed = jobs.find(j => j.id === parseInt(jobId));
      if (jobParsed) {
        return processJobHierarchy(jobParsed);
      }
      return { category: '-', parent: '-', subParent: '-' };
    }

    return processJobHierarchy(job);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'plan':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={16} className="text-green-600" />;
      case 'in_progress':
        return <Clock size={16} className="text-blue-600" />;
      case 'plan':
        return <AlertCircle size={16} className="text-orange-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Category
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Parent
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Sub-parent
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Task
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Priority
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Plan By
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Due Date
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Completed By
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Completed Date
            </th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
              Comments
            </th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks && tasks.length > 0 ? (
            tasks.map((task) => {
              const hierarchy = getJobHierarchy(task.job_id);
              const isClickable = onTaskClick !== null && onTaskClick !== undefined;
              return (
                <tr 
                  key={task.id} 
                  className={`transition-colors ${isClickable ? 'hover:bg-slate-50 cursor-pointer' : 'cursor-default'}`}
                  onClick={() => isClickable && onTaskClick(task)}
                >
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700">
                    {hierarchy.category}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700">
                    {hierarchy.parent}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700">
                    {hierarchy.subParent}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">{task.title}</div>
                    <div className="text-xs text-slate-500 mt-1" title={task.description}>
                      {task.description ? (task.description.length > 50 ? task.description.substring(0, 50) + '...' : task.description) : 'No description'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{getStatusIcon(task.status)}</span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status || 'plan')}`}>
                        {task.status === 'in_progress' ? 'In Progress' : (task.status || 'plan').charAt(0).toUpperCase() + (task.status || 'plan').slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority || 'low')}`}>
                      {(task.priority || 'low').charAt(0).toUpperCase() + (task.priority || 'low').slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {task.plan_by_name ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-xs font-bold">
                          {task.plan_by_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-slate-600">{task.plan_by_name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1 text-slate-400" />
                      {formatDate(task.due_date)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {task.completed_by_name ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                          {task.completed_by_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-green-600 font-medium">{task.completed_by_name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {task.completed_date ? (
                      <div className="flex items-center text-green-600">
                        <Calendar size={14} className="mr-1" />
                        <span className="font-medium">{formatDate(task.completed_date)}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={(e) => handleOpenComments(e, task)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      <MessageCircle size={14} />
                      <span>{taskCommentCounts[task.id] || 0}</span>
                    </button>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    {user && task.plan_by === user.id && (
                      <button
                        onClick={(e) => handleDeleteTask(e, task)}
                        disabled={deletingTaskId === task.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={14} />
                        <span>{deletingTaskId === task.id ? 'Deleting...' : 'Delete'}</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="12" className="px-6 py-12 text-center text-slate-500">
                <div className="flex flex-col items-center">
                  <AlertCircle size={48} className="text-slate-300 mb-4" />
                  <p className="text-lg font-semibold">No tasks found</p>
                  <p className="text-sm">Try changing your filters or create a new task</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Comment Modal */}
      <CommentModal
        isOpen={commentModalOpen}
        onClose={() => {
          setCommentModalOpen(false);
          setSelectedTaskForComment(null);
        }}
        task={selectedTaskForComment}
        onCommentAdded={handleCommentAdded}
      />
    </div>
  );
};