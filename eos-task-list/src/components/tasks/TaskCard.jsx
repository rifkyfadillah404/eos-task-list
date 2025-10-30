import { Calendar, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

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

const isOverdue = (dateString) => {
  if (!dateString) return false;
  const due = new Date(dateString);
  return due < new Date() && due > new Date(new Date().setDate(new Date().getDate() - 1));
};

export const TaskCard = ({ task, onTaskClick, isDragging }) => {
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

  const colors = priorityColors[task.priority] || priorityColors.low;

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={`card p-4 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-grab active:cursor-grabbing group relative overflow-hidden ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${colors.border} hover:border-l-[6px]`}
    >
      {/* Animated Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

      {/* Completed State Shine Effect */}
      {task.status === 'completed' && (
        <div className="absolute inset-0 bg-gradient-to-r from-green-50/0 via-white/10 to-green-50/0 animate-pulse"></div>
      )}
      {/* Header with Title & Actions */}
      <div className="flex items-start justify-between mb-3 relative z-10">
        <div className="flex-1 pr-2">
          <h3 className={`font-bold text-gray-900 text-sm mb-1 line-clamp-2 ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
            {task.title}
          </h3>
          <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
        </div>
      </div>

      {/* Priority & Category Badges */}
      <div className="flex flex-wrap gap-2 mb-3 relative z-10">
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-200 ${colors.badge} group-hover:scale-110 transform`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-medium transition-all duration-200 group-hover:scale-110 transform">
          {task.category}
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

        {/* Assignee */}
        {task.user_name && (
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100">
            <span className="text-xs text-gray-600 font-medium">{task.user_name}</span>
            <div className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-200 group-hover:scale-125 transform group-hover:shadow-md" title={task.user_name}>
              {task.user_name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
