import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { X } from 'lucide-react';

export const JobForm = ({ isOpen, onClose, onSubmit, job, type = 'category' }) => {
  const { token, departments } = useAuth();
  const [formData, setFormData] = useState({
    category: '',
    parent: null,
    sub_parent: '',
    department_id: ''
  });
  
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [errors, setErrors] = useState({});

  const API_URL = 'http://localhost:3000/api';

  // Fetch jobs for dropdowns based on type + department filter
  useEffect(() => {
    if (!isOpen || type === 'category') return;
    if (!formData.department_id) { setJobs([]); return; }

    const fetchJobs = async () => {
      try {
        setLoadingJobs(true);
        const url = `${API_URL}/jobs?department_id=${encodeURIComponent(formData.department_id)}`;
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
  }, [isOpen, token, type, formData.department_id]);

  useEffect(() => {
    if (job) {
      // Determine the type of existing job to prefill the form correctly
      let jobType = 'category';
      if (job.parent !== null && job.sub_parent === null) {
        jobType = 'parent';
      } else if (job.sub_parent !== null) {
        jobType = 'sub_parent';
      }
      
      setFormData({
        category: jobType === 'category' ? job.category : '',
        parent: job.parent || null,
        sub_parent: jobType !== 'category' ? job.category : job.sub_parent || '',
        department_id: job.department_id ? String(job.department_id) : ''
      });
    } else {
      // For new forms, initialize based on type
      if (type === 'category') {
        setFormData({
          category: '',
          parent: null,
          sub_parent: '',
          department_id: ''
        });
      } else if (type === 'parent') {
        setFormData({
          category: '', // This will be set to the parent name in handleSubmit
          parent: null,
          sub_parent: '',
          department_id: ''
        });
      } else { // sub_parent
        setFormData({
          category: '', // This will be set to the sub parent name in handleSubmit
          parent: null,
          sub_parent: '',
          department_id: ''
        });
      }
    }
  }, [job, type]);

  useEffect(() => {
    if (!isOpen) {
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'parent' ? (value === '' ? null : value) : value,
      ...(name === 'department_id' ? { parent: null } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    if (type === 'category') {
      // Category hanya perlu category
      if (!formData.category.trim()) {
        newErrors.category = 'Category is required';
      }
      if (!formData.department_id) {
        newErrors.department_id = 'Department is required';
      }
    } else if (type === 'parent') {
      // Parent harus memilih dari category dan mengisi sub_parent sebagai nama parent
      if (!formData.parent) {
        newErrors.parent = 'Category is required';
      }
      if (!formData.sub_parent.trim()) {
        newErrors.sub_parent = 'Parent name is required';
      }
      if (!formData.department_id) {
        newErrors.department_id = 'Department is required';
      }
    } else if (type === 'sub_parent') {
      // Sub parent harus memilih dari parent dan mengisi nama sub parent
      if (!formData.parent) {
        newErrors.parent = 'Parent is required';
      }
      if (!formData.sub_parent.trim()) {
        newErrors.sub_parent = 'Sub parent name is required';
      }
      if (!formData.department_id) {
        newErrors.department_id = 'Department is required';
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Untuk tipe parent, kita atur parent ke ID category sebelumnya dan category ke nama parent
    if (type === 'parent') {
      onSubmit({
        category: formData.sub_parent, // isi category dengan nama parent
        parent: parseInt(formData.parent),    // parent mengacu ke ID category sebelumnya
        sub_parent: null,              // sub_parent kita set null untuk parent
        department_id: parseInt(formData.department_id)
      });
    } else if (type === 'sub_parent') {
      onSubmit({
        category: formData.sub_parent, // isi category dengan nama sub parent
        parent: parseInt(formData.parent),    // parent mengacu ke ID parent
        sub_parent: null,              // sub_parent harus null untuk sub-parent
        department_id: parseInt(formData.department_id)
      });
    } else {
      // type === 'category'
      onSubmit({
        category: formData.category,
        parent: null,
        sub_parent: null,
        department_id: parseInt(formData.department_id)
      });
    }
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

  const typeLabel = type === 'category' ? 'Category' : type === 'parent' ? 'Parent' : 'Sub-Parent';

  // Helper function to get job level/depth in hierarchy
  const getJobLevel = (job) => {
    if (!job.parent) return 0; // Category level
    
    // Find parent job
    const parentJob = jobs.find(j => j.id === parseInt(job.parent));
    if (!parentJob) return 0;
    
    if (!parentJob.parent) {
      // Parent's parent is null, so this job is level 1 (Parent)
      return 1;
    } else {
      // Parent's parent exists, so this job is level 2+ (Sub-parent or deeper)
      return 2;
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">
                {job ? `Edit ${typeLabel}` : `Create New ${typeLabel}`}
              </h3>
              <p className="text-xs text-indigo-100 mt-0.5">
                {type === 'category' ? 'Top-level work category' : type === 'parent' ? 'Sub-category under main category' : 'Sub-division of parent category'}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-indigo-100 p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Close (Esc)"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          <div className="space-y-4">
              {type === 'category' && (
                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-2">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all ${
                      errors.category ? 'border-red-500 focus:ring-red-100' : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-500'
                    }`}
                    placeholder="e.g., Web Development, Marketing, Design"
                    required
                    maxLength={100}
                  />
                  {errors.category && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.category}</p>
                  )}
                </div>
              )}

              {/* Department field for all types */}
              <div>
                <label htmlFor="department_id" className="block text-sm font-semibold text-slate-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  id="department_id"
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all bg-white ${
                    errors.department_id ? 'border-red-500 focus:ring-red-100' : 'border-slate-300 focus:ring-indigo-100 focus:border-indigo-500'
                  }`}
                  required
                >
                  <option value="">Choose a department</option>
                  {departments?.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                {errors.department_id && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.department_id}</p>
                )}
              </div>

              {type === 'parent' && (
                <>
                  <div>
                    <label htmlFor="parent" className="block text-sm font-semibold text-slate-700 mb-2">
                      Select Category <span className="text-red-500">*</span>
                    </label>
                    {(!formData.department_id) ? (
                      <div className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50">
                        Enter department first
                      </div>
                    ) : loadingJobs ? (
                      <div className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 animate-pulse">
                        Loading...
                      </div>
                    ) : (
                      <select
                        id="parent"
                        name="parent"
                        value={formData.parent || ''}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 bg-white ${
                          errors.parent ? 'border-red-500 focus:ring-red-100' : 'border-slate-300 focus:ring-indigo-100'
                        }`}
                        required
                      >
                        <option value="">Select a category</option>
                        {jobs
                          .filter(job => job.parent === null && job.sub_parent === null && Number(job.department_id) === Number(formData.department_id))
                          .map(job => (
                            <option key={job.id} value={job.id}>
                              {job.category}
                            </option>
                          ))}
                      </select>
                    )}
                    {errors.parent && <p className="mt-1.5 text-xs text-red-600">{errors.parent}</p>}
                  </div>

                  <div>
                    <label htmlFor="sub_parent" className="block text-sm font-semibold text-slate-700 mb-2">
                      Parent Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="sub_parent"
                      name="sub_parent"
                      value={formData.sub_parent}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.sub_parent ? 'border-red-500 focus:ring-red-100' : 'border-slate-300 focus:ring-indigo-100'
                      }`}
                      placeholder="Enter parent name (e.g. Backend)"
                      required
                    />
                    {errors.sub_parent && <p className="mt-1.5 text-xs text-red-600">{errors.sub_parent}</p>}
                  </div>
                </>
              )}

              {type === 'sub_parent' && (
                <>
                  <div>
                    <label htmlFor="parent" className="block text-sm font-semibold text-slate-700 mb-2">
                      Select Parent <span className="text-red-500">*</span>
                    </label>
                    {(!formData.department_id) ? (
                      <div className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50">
                        Enter department first
                      </div>
                    ) : loadingJobs ? (
                      <div className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 animate-pulse">
                        Loading...
                      </div>
                    ) : (
                      <select
                        id="parent"
                        name="parent"
                        value={formData.parent || ''}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 bg-white ${
                          errors.parent ? 'border-red-500 focus:ring-red-100' : 'border-slate-300 focus:ring-indigo-100'
                        }`}
                        required
                      >
                        <option value="">Select a parent</option>
                        {jobs
                          .filter(job => {
                            // Only show Parent level jobs (level 1)
                            const level = getJobLevel(job);
                            return level === 1 && Number(job.department_id) === Number(formData.department_id);
                          })
                          .map(job => (
                            <option key={job.id} value={job.id}>
                              {job.category}
                            </option>
                          ))}
                      </select>
                    )}
                    {errors.parent && <p className="mt-1.5 text-xs text-red-600">{errors.parent}</p>}
                  </div>

                  <div>
                    <label htmlFor="sub_parent" className="block text-sm font-semibold text-slate-700 mb-2">
                      Sub Parent Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="sub_parent"
                      name="sub_parent"
                      value={formData.sub_parent}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.sub_parent ? 'border-red-500 focus:ring-red-100' : 'border-slate-300 focus:ring-indigo-100'
                      }`}
                      placeholder="Enter sub parent name (e.g. API Development)"
                      required
                    />
                    {errors.sub_parent && <p className="mt-1.5 text-xs text-red-600">{errors.sub_parent}</p>}
                  </div>
                </>
              )}
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
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            {job ? 'Update' : 'Create'} {typeLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
