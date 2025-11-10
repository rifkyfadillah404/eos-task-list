import { Calendar, AlertCircle, Clock, CheckCircle2, FolderTree, MessageCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const formatDate = (dateString) => {
  if (!dateString) return 'No due date';

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

const isOverdue = (dateString) => {
  if (!dateString) return false;
  const due = new Date(dateString);
  return due < new Date() && due > new Date(new Date().setDate(new Date().getDate() - 1));
};

const getJobHierarchy = (jobId, jobs) => {
  if (!jobId || !jobs || !jobs.length) {
    return { category: '-', parent: '-', subParent: '-' };
  }
  
  const job = jobs.find(j => j.id === jobId || j.id === parseInt(jobId));
  if (!job) {
    return { category: '-', parent: '-', subParent: '-' };
  }

  const category = job.category || '-';
  const parent = job.parent || '-';
  const subParent = job.sub_parent || '-';

  return { category, parent, subParent };
};

export const TaskCard = ({ task, onTaskClick, isDragging, statusVariant, jobs = [], onOpenComments, dragListeners }) => {
  const [localCommentCount, setLocalCommentCount] = useState(task.comment_count || 0);
  const taskIdRef = useRef(task.id);

  // Only update count when viewing a DIFFERENT task or when server data is higher
  useEffect(() => {
    const serverCount = task.comment_count || 0;
    
    // If different task, reset count
    if (taskIdRef.current !== task.id) {
      taskIdRef.current = task.id;
      setLocalCommentCount(serverCount);
    } 
    // If same task, only update if server has MORE comments (fresh data from fetch)
    else if (serverCount > localCommentCount) {
      setLocalCommentCount(serverCount);
    }
  }, [task.id, task.comment_count, localCommentCount]);
  const statusIcons = {
    completed: <CheckCircle2 size={18} className="text-green-600" />,
    in_progress: <Clock size={18} className="text-blue-600 animate-pulse" />,
    plan: <AlertCircle size={18} className="text-gray-400" />,
  };

  const priorityColors = {
    high: { bg: 'bg-red-50', badge: 'bg-red-100 text-red-700', border: 'border-l-4 border-l-red-500' },
    medium: { bg: 'bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700', border: 'border-l-4 border-l-yellow-500' },
    low: { bg: 'bg-green-50', badge: 'bg-green-100 text-green-700', border: 'border-l-4 border-l-green-500' },
  };

  const statusBadge = {
    plan: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  };

  const handleDoubleClick = () => {
    if (!isDragging) {
      onTaskClick?.(task);
    }
  };

  const handleCommentClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isDragging && onOpenComments) {
      // Pass callback to update local count
      onOpenComments(task, (newCount) => {
        setLocalCommentCount(newCount);
      });
    } else {
    }
  };

  const colors = priorityColors[task.priority] || priorityColors.low;

  const statusStyles = {
    plan: 'bg-orange-200 border border-orange-300 text-orange-900',
    in_progress: 'bg-blue-200 border border-blue-300 text-blue-900',
    completed: 'bg-emerald-200 border border-emerald-300 text-emerald-900',
  };

  const overlayGradients = {
    plan: 'from-orange-300/40 via-orange-200/30 to-orange-400/40',
    in_progress: 'from-blue-300/40 via-blue-200/30 to-blue-400/40',
    completed: 'from-emerald-300/40 via-emerald-200/30 to-emerald-400/40',
  };

  const variantClasses = statusVariant
    ? statusStyles[statusVariant] ?? 'bg-white border border-slate-100'
    : 'bg-white border border-slate-100';

  const overlayClass = overlayGradients[statusVariant] ?? 'from-transparent via-transparent to-transparent';

  const hierarchy = getJobHierarchy(task.job_id, jobs);

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={`rounded-2xl shadow-sm ${variantClasses} p-4 hover:shadow-xl hover:scale-105 transition-all duration-300 group relative overflow-hidden ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${colors.border} hover:border-l-[6px] text-current`}
    >
      {/* Animated Background Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r ${overlayClass} opacity-40 transition-opacity duration-300 group-hover:opacity-60`}></div>

      {/* Header with Title & Actions - DRAG HANDLE */}
      <div 
        {...(dragListeners || {})}
        className="flex items-start justify-between mb-3 relative z-10 cursor-grab active:cursor-grabbing"
      >
        <div className="flex-1 pr-2">
          <h3 className={`font-bold text-gray-900 text-sm mb-1 line-clamp-2 ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
            {task.title}
          </h3>
          <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
        </div>
      </div>

      {/* Job Hierarchy - Compact */}
      <div className="mb-3 relative z-10">
        <div className="flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg px-3 py-2">
          <FolderTree size={14} className="text-indigo-600 flex-shrink-0" />
          <div className="flex items-center gap-1 text-xs font-medium text-gray-700 overflow-hidden">
            {hierarchy.category !== '-' && <span className="text-indigo-700">{hierarchy.category}</span>}
            {hierarchy.parent !== '-' && (
              <>
                <span className="text-gray-400">›</span>
                <span className="text-purple-700">{hierarchy.parent}</span>
              </>
            )}
            {hierarchy.subParent !== '-' && (
              <>
                <span className="text-gray-400">›</span>
                <span className="text-pink-700">{hierarchy.subParent}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Priority Badge Only */}
      <div className="flex items-center gap-2 mb-3 relative z-10">
        <span className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all duration-200 ${colors.badge} group-hover:scale-105 transform shadow-sm`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
        </span>
      </div>

      {/* Footer with Meta Info */}
      <div className="border-t border-gray-200 pt-3 space-y-2 relative z-10">
        {/* Due Date & Status */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 text-xs ${isOverdue(task.due_date) ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
            <Calendar size={13} />
            <span>{formatDate(task.due_date)}</span>
          </div>
          <div className="flex items-center gap-1">
            {statusIcons[task.status]}
            <span className={`text-xs px-2 py-1 rounded-full font-medium transition-all duration-200 ${statusBadge[task.status]}`}>
              {task.status === 'in_progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Plan By & Completed By */}
        <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100 text-xs text-gray-600">
          {task.plan_by_name && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Plan by:</span>
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-xs font-bold">
                  {task.plan_by_name.charAt(0).toUpperCase()}
                </div>
                <span>{task.plan_by_name}</span>
              </div>
            </div>
          )}
          {task.completed_by_name && task.status === 'completed' && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-green-600">Completed by:</span>
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                  {task.completed_by_name.charAt(0).toUpperCase()}
                </div>
                <span className="text-green-600">{task.completed_by_name}</span>
              </div>
            </div>
          )}
        </div>

        {/* Completed Date - Separate Row */}
        {task.completed_date && task.status === 'completed' && (
          <div className="flex items-center gap-1 text-xs text-green-600 pt-1">
            <Calendar size={12} className="text-green-500" />
            <span className="font-medium">Completed:</span>
            <span>{formatDate(task.completed_date)}</span>
          </div>
        )}

        {/* Comment Button */}
        {onOpenComments && (
          <div className="mt-3 pt-3 border-t border-gray-100 relative z-20">
            <button
              type="button"
              onClick={handleCommentClick}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-all duration-200 font-medium text-sm group/comment pointer-events-auto cursor-pointer relative"
              style={{ pointerEvents: 'auto' }}
            >
              <MessageCircle size={16} className="group-hover/comment:scale-110 transition-transform" />
              <span>View Comments</span>
              {localCommentCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                  {localCommentCount}
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
