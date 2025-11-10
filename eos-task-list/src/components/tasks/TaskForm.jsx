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

          {/* Job Selection */}
          <div className="animate-slide-in-left stagger-3.5">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Job / Work Category
            </label>
            {!isAdmin && user?.department_id ? (
              <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-2 border border-blue-200">
                📌 Showing jobs from your department only
              </p>
            ) : (
              <p className="text-xs text-gray-500 mb-2">
                Select the job category this task belongs to (optional)
              </p>
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all hover:border-indigo-300 bg-white"
                >
                  <option value="">-- Select Job (Optional) --</option>
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
              <div className="animate-slide-in-left stagger-4 bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border-2 border-indigo-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-indigo-600 text-white rounded-lg p-2">
                    <ListTodo size={16} />
                  </div>
                  <h3 className="font-bold text-indigo-900">Selected Job Category</h3>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📋</span>
                    <div>
                      <p className="text-lg font-bold text-gray-900">{selectedJob.category}</p>
                      {selectedJob.department_name && (
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <span>📁</span>
                          <span>{selectedJob.department_name}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}





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
              Due Date & Time
            </label>
            <input
              type="datetime-local"
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
