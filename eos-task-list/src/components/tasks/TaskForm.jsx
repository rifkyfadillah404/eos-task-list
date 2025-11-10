import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Edit2, Plus, Circle, CheckCircle2, Zap, ListTodo } from 'lucide-react';

export const TaskForm = ({ isOpen, onClose, onSubmit, task, defaultStatus = 'plan' }) => {
  const { token, user, isAdmin } = useAuth();
  const [formData, setFormData] = useState(task || {
    title: '',
    description: '',
    priority: 'medium',
    category: 'General',
    due_date: '',
    status: defaultStatus,
    job_id: null, // Add job_id field
  });
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const API_URL = 'http://localhost:3000/api';

  // Fetch jobs filtered by user's department (non-admin only)
  useEffect(() => {
    const fetchJobs = async () => {
      if (!isOpen) return; // Only fetch when form is open

      try {
        setLoadingJobs(true);
        
        // Build URL with department filter for non-admin users
        let url = `${API_URL}/jobs`;
        if (!isAdmin && user?.department_id) {
          url += `?department_id=${user.department_id}`;
        }
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (response.ok) {
          const data = await response.json();
          setJobs(data.jobs || []);
        } else {
          setJobs([]);
        }
      } catch (error) {
        setJobs([]);
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();
  }, [isOpen, token, user, isAdmin]);

  useEffect(() => {
    if (task) {
      // Format due_date for datetime-local input (YYYY-MM-DDTHH:mm)
      let formattedDueDate = '';
      if (task.due_date) {
        const date = new Date(task.due_date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        formattedDueDate = `${year}-${month}-${day}T${hours}:${minutes}`;
      }
      
      setFormData({
        ...task,
        due_date: formattedDueDate,
        job_id: task.job_id || null, // Ensure job_id is set for existing tasks
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'General',
        due_date: '',
        status: defaultStatus,
        job_id: null, // Initialize job_id as null for new tasks
      });
    }
  }, [task, defaultStatus, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updatedData = {
        ...prev,
        [name]: name === 'job_id' ? (value === '' ? null : parseInt(value)) : value
      };
      
      // Jika job_id berubah, update category juga
      if (name === 'job_id') {
        if (value === '') {
          // Jika tidak ada job dipilih, kembalikan ke default
          updatedData.category = 'General';
        } else {
          // Cari job yang dipilih dan gunakan category nya
          const selectedJob = jobs.find(job => job.id === parseInt(value));
          if (selectedJob) {
            updatedData.category = selectedJob.category;
          }
        }
      }
      
      return updatedData;
    });
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl p-2.5 shadow-md">
              {task ? <Edit2 size={20} /> : <Plus size={20} />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {task ? 'Edit Task' : 'Create New Task'}
              </h2>
              <p className="text-xs text-gray-600">
                {task ? 'Update task details' : 'Fill in the details below'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-gray-900"
            title="Close (Esc)"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto bg-gradient-to-b from-white to-gray-50">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center justify-between">
              <span>
                Task Title <span className="text-red-500">*</span>
              </span>
              <span className={`text-xs font-medium ${formData.title.length > 80 ? 'text-red-600' : 'text-gray-500'}`}>
                {formData.title.length}/100
              </span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Design landing page mockup"
              maxLength="100"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm shadow-sm"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Be specific and clear about what needs to be done</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center justify-between">
              <span>Description (Optional)</span>
              <span className={`text-xs font-medium ${formData.description.length > 450 ? 'text-red-600' : 'text-gray-500'}`}>
                {formData.description.length}/500
              </span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add more details, requirements, or context..."
              rows="3"
              maxLength="500"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all resize-none text-sm shadow-sm"
            />
          </div>

          {/* Job Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Job / Work Category (Optional)
            </label>
            {!isAdmin && user?.department_id ? (
              <div className="text-xs text-blue-700 bg-blue-50 px-3 py-2 rounded-lg mb-2 border border-blue-200 flex items-center gap-2">
                <span>💼</span>
                <span>Showing jobs from your department only</span>
              </div>
            ) : (
              <p className="text-xs text-gray-600 mb-2">Link this task to a specific job category for better organization</p>
            )}
            {loadingJobs ? (
              <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 animate-pulse">
                Loading jobs...
              </div>
            ) : (
              <>
                <select
                  name="job_id"
                  value={formData.job_id || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all bg-white text-sm shadow-sm"
                >
                  <option value="">No specific job (General task)</option>
                  {jobs.length === 0 ? (
                    <option disabled>
                      {!isAdmin && user?.department_id 
                        ? 'No jobs available in your department' 
                        : !isAdmin && !user?.department_id
                        ? 'You need to be assigned to a department first'
                        : 'No jobs available'}
                    </option>
                  ) : (
                  (() => {
                    // Helper function to sort jobs hierarchically
                    const sortJobsHierarchically = (jobsList) => {
                      const sorted = [];
                      
                      // Level 0: Categories (no parent)
                      const categories = jobsList.filter(j => !j.parent);
                      
                      categories.forEach(category => {
                        sorted.push({ ...category, level: 0 });
                        
                        // Level 1: Parents (direct children of category)
                        const parents = jobsList.filter(j => {
                          return j.parent && String(j.parent) === String(category.id);
                        });
                        
                        parents.forEach(parent => {
                          sorted.push({ ...parent, level: 1 });
                          
                          // Level 2: Sub-parents (children of parent)
                          const subParents = jobsList.filter(j => {
                            return j.parent && String(j.parent) === String(parent.id);
                          });
                          
                          subParents.forEach(subParent => {
                            sorted.push({ ...subParent, level: 2 });
                          });
                        });
                      });
                      
                      return sorted;
                    };

                    // Group jobs by department
                    const grouped = jobs.reduce((acc, job) => {
                      const dept = job.department_name || 'No Department';
                      if (!acc[dept]) acc[dept] = [];
                      acc[dept].push(job);
                      return acc;
                    }, {});

                    const departmentCount = Object.keys(grouped).length;

                    // If only 1 department, don't show optgroup (simpler UI)
                    if (departmentCount === 1) {
                      const sortedJobs = sortJobsHierarchically(jobs);
                      return sortedJobs.map(job => {
                        let label = '';
                        
                        // Level 0: Category (no indent, no symbol)
                        if (job.level === 0) {
                          label = job.category;
                          if (job.sub_parent) {
                            label += ` (${job.sub_parent})`;
                          }
                        }
                        // Level 1: Parent (├─ symbol)
                        else if (job.level === 1) {
                          label = `├─ ${job.category}`;
                          if (job.sub_parent) {
                            label += ` (${job.sub_parent})`;
                          }
                        }
                        // Level 2: Sub-parent (└─ symbol with more indent)
                        else if (job.level === 2) {
                          label = `  └─ ${job.category}`;
                          if (job.sub_parent) {
                            label += ` (${job.sub_parent})`;
                          }
                        }
                        
                        return (
                          <option key={job.id} value={job.id}>
                            {label}
                          </option>
                        );
                      });
                    }

                    // Multiple departments: show grouped
                    return Object.entries(grouped).map(([dept, deptJobs]) => {
                      const sortedDeptJobs = sortJobsHierarchically(deptJobs);
                      return (
                        <optgroup key={dept} label={`📁 ${dept}`}>
                          {sortedDeptJobs.map(job => {
                            let label = '';
                            
                            // Level 0: Category (no indent in optgroup)
                            if (job.level === 0) {
                              label = job.category;
                              if (job.sub_parent) {
                                label += ` (${job.sub_parent})`;
                              }
                            }
                            // Level 1: Parent (├─ symbol with indent)
                            else if (job.level === 1) {
                              label = `  ├─ ${job.category}`;
                              if (job.sub_parent) {
                                label += ` (${job.sub_parent})`;
                              }
                            }
                            // Level 2: Sub-parent (└─ symbol with more indent)
                            else if (job.level === 2) {
                              label = `    └─ ${job.category}`;
                              if (job.sub_parent) {
                                label += ` (${job.sub_parent})`;
                              }
                            }
                            
                            return (
                              <option key={job.id} value={job.id}>
                                {label}
                              </option>
                            );
                          })}
                        </optgroup>
                      );
                    });
                  })()
                )}
                </select>
                
                {/* Show message if user has no department */}
                {!isAdmin && !user?.department_id && (
                  <p className="mt-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                    ⚠️ Contact admin to assign you to a department to see available jobs
                  </p>
                )}
              </>
            )}
          </div>

          {/* Display Selected Job Info */}
          {formData.job_id && (() => {
            const selectedJob = jobs.find(job => job.id === formData.job_id);
            if (!selectedJob) return null;
            
            return (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-3 rounded-xl border border-indigo-200">
                <div className="flex items-center gap-2">
                  <ListTodo size={16} className="text-indigo-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-indigo-900 truncate">{selectedJob.category}</p>
                    {selectedJob.department_name && (
                      <p className="text-xs text-indigo-700">📁 {selectedJob.department_name}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}





          {/* Priority & Status Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Circle size={14} className="text-red-500" />
                Priority Level
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium text-sm shadow-sm"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Zap size={14} className="text-blue-500" />
                Task Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium text-sm shadow-sm"
              >
                <option value="plan">📝 Plan</option>
                <option value="in_progress">🔄 In Progress</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Due Date & Time (Optional)
            </label>
            <input
              type="datetime-local"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm shadow-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Set a deadline to track task completion</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-5 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all border-2 border-gray-300 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim()}
              className="flex-1 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed text-sm"
            >
              {task ? '💾 Update Task' : '✨ Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
