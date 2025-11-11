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
        // Convert to WIB (UTC+7) for display in form
        const wibDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
        const year = wibDate.getFullYear();
        const month = String(wibDate.getMonth() + 1).padStart(2, '0');
        const day = String(wibDate.getDate()).padStart(2, '0');
        const hours = String(wibDate.getHours()).padStart(2, '0');
        const minutes = String(wibDate.getMinutes()).padStart(2, '0');
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
    
    // Convert due_date from WIB to UTC for backend
    let submittedData = { ...formData };
    if (formData.due_date) {
      try {
        // datetime-local format: YYYY-MM-DDTHH:mm
        // We treat this as WIB time (UTC+7) and convert to UTC
        const [datePart, timePart] = formData.due_date.split('T');
        const [year, month, day] = datePart.split('-');
        const [hours, minutes] = timePart.split(':');
        
        // Create UTC date by treating input as WIB (subtract 7 hours)
        const utcDate = new Date(Date.UTC(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hours) - 7,  // WIB is UTC+7, so subtract 7
          parseInt(minutes),
          0
        ));
        
        submittedData.due_date = utcDate.toISOString();
      } catch (err) {
        // Keep original value if parsing fails
      }
    }
    
    onSubmit?.(submittedData);
    
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-xl">
          <div>
            <h2 className="text-lg font-bold text-white">
              {task ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-xs text-indigo-100 mt-0.5">
              {task ? 'Update task details' : 'Fill in the details below'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white hover:text-indigo-100"
            title="Close (Esc)"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center justify-between">
              <span>
                Task Title <span className="text-red-500">*</span>
              </span>
              <span className={`text-xs font-medium ${formData.title.length > 80 ? 'text-red-600' : 'text-slate-500'}`}>
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
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center justify-between">
              <span>Description</span>
              <span className={`text-xs font-medium ${formData.description.length > 450 ? 'text-red-600' : 'text-slate-500'}`}>
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
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none text-sm"
            />
          </div>

          {/* Job Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Job / Work Category
            </label>
            {!isAdmin && user?.department_id && (
              <div className="text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg mb-2 border border-blue-200 flex items-center gap-2">
                <span>💼</span>
                <span>Showing jobs from your department only</span>
              </div>
            )}
            {loadingJobs ? (
              <div className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 animate-pulse text-sm">
                Loading jobs...
              </div>
            ) : (
              <>
                <select
                  name="job_id"
                  value={formData.job_id || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-white text-sm"
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
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <Circle size={14} className="text-red-500" />
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-sm bg-white"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <Zap size={14} className="text-blue-500" />
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-sm bg-white"
              >
                <option value="plan">📝 Plan</option>
                <option value="in_progress">🔄 In Progress</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Due Date & Time
            </label>
            <input
              type="datetime-local"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.title.trim()}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
          >
            {task ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
};
