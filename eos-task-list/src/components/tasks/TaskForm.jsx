import { useState, useEffect } from 'react';
import { X, Edit2, Plus, Circle, CheckCircle2, Zap, ListTodo } from 'lucide-react';

export const TaskForm = ({ isOpen, onClose, onSubmit, task, defaultStatus = 'plan' }) => {
  const [formData, setFormData] = useState(task || {
    title: '',
    description: '',
    priority: 'medium',
    category: 'General',
    due_date: '',
    status: defaultStatus,
  });

  useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'General',
        due_date: '',
        status: defaultStatus,
      });
    }
  }, [task, defaultStatus, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Task title is required');
      return;
    }
    onSubmit?.(formData);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      category: 'General',
      due_date: '',
      status: defaultStatus,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50">
          <div className="flex items-center gap-3">
            {task ? (
              <>
                <Edit2 size={24} className="text-indigo-600 animate-float float-delay-1" />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Edit Task</h2>
              </>
            ) : (
              <>
                <Plus size={24} className="text-indigo-600 animate-float float-delay-1" />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">New Task</h2>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900 hover:scale-110 transform"
            title="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div className="animate-slide-in-left stagger-1">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="What do you need to do?"
              maxLength="100"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all hover:border-indigo-300"
              required
            />
          </div>

          {/* Description */}
          <div className="animate-slide-in-left stagger-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add more details about this task..."
              rows="3"
              maxLength="500"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none hover:border-indigo-300"
            />
          </div>

          {/* Category */}
          <div className="animate-slide-in-left stagger-3">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Category
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g. Design, Backend, Bug Fix"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all hover:border-indigo-300"
            />
          </div>

          {/* Priority & Status Grid */}
          <div className="grid grid-cols-2 gap-4 animate-slide-in-left stagger-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Circle size={16} className="text-red-500" />
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium hover:border-indigo-300"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Zap size={16} className="text-blue-500" />
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium hover:border-indigo-300"
              >
                <option value="plan">Plan</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div className="animate-slide-in-left stagger-5">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Due Date
            </label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all hover:border-indigo-300"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 animate-slide-in-left stagger-5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              {task ? 'Update' : 'Create'} Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
