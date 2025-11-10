import { useState, useEffect } from 'react';
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

  const handleSubmit = (e) => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {job ? `Edit ${typeLabel}` : `Create New ${typeLabel}`}
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                {type === 'category' ? 'Top-level work category' : type === 'parent' ? 'Sub-category under main category' : 'Sub-division of parent category'}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-white rounded-lg transition-colors"
              title="Close (Esc)"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 bg-gradient-to-b from-white to-gray-50">
          <div className="space-y-4">
              {type === 'category' && (
                <div>
                  <label htmlFor="category" className="block text-xs font-semibold text-gray-700 mb-2">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 text-sm shadow-sm transition-all ${
                      errors.category ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-500'
                    }`}
                    placeholder="e.g., Web Development, Marketing, Design"
                    required
                    maxLength={100}
                  />
                  {errors.category ? (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">⚠️ {errors.category}</p>
                  ) : (
                    <p className="mt-1.5 text-xs text-gray-500">Main category for organizing work</p>
                  )}
                </div>
              )}

              {/* Department field for all types */}
              <div>
                <label htmlFor="department_id" className="block text-xs font-semibold text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  id="department_id"
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 text-sm shadow-sm transition-all ${
                    errors.department_id ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-500'
                  }`}
                  required
                >
                  <option value="">Choose a department</option>
                  {departments?.map(d => (
                    <option key={d.id} value={d.id}>📁 {d.name}</option>
                  ))}
                </select>
                {errors.department_id ? (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">⚠️ {errors.department_id}</p>
                ) : (
                  <p className="mt-1.5 text-xs text-gray-500">Assign this to a specific department</p>
                )}
              </div>

              {type === 'parent' && (
                <>
                  <div>
                    <label htmlFor="parent" className="block text-sm font-medium text-gray-700 mb-1">
                      Select Category *
                    </label>
                    {(!formData.department_id) ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                        Enter department first
                      </div>
                    ) : loadingJobs ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 animate-pulse">
                        Loading...
                      </div>
                    ) : (
                      <select
                        id="parent"
                        name="parent"
                        value={formData.parent || ''}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.parent ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
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
                    {errors.parent && <p className="mt-1 text-sm text-red-600">{errors.parent}</p>}
                  </div>

                  <div>
                    <label htmlFor="sub_parent" className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Name *
                    </label>
                    <input
                      type="text"
                      id="sub_parent"
                      name="sub_parent"
                      value={formData.sub_parent}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.sub_parent ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                      }`}
                      placeholder="Enter parent name (e.g. Backend)"
                      required
                    />
                    {errors.sub_parent && <p className="mt-1 text-sm text-red-600">{errors.sub_parent}</p>}
                  </div>
                </>
              )}

              {type === 'sub_parent' && (
                <>
                  <div>
                    <label htmlFor="parent" className="block text-sm font-medium text-gray-700 mb-1">
                      Select Parent *
                    </label>
                    {(!formData.department_id) ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                        Enter department first
                      </div>
                    ) : loadingJobs ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 animate-pulse">
                        Loading...
                      </div>
                    ) : (
                      <select
                        id="parent"
                        name="parent"
                        value={formData.parent || ''}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.parent ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                        }`}
                        required
                      >
                        <option value="">Select a parent</option>
                        {jobs
                          .filter(job => job.parent !== null && job.sub_parent === null && Number(job.department_id) === Number(formData.department_id))
                          .map(job => (
                            <option key={job.id} value={job.id}>
                              {job.category}
                            </option>
                          ))}
                      </select>
                    )}
                    {errors.parent && <p className="mt-1 text-sm text-red-600">{errors.parent}</p>}
                  </div>

                  <div>
                    <label htmlFor="sub_parent" className="block text-sm font-medium text-gray-700 mb-1">
                      Sub Parent Name *
                    </label>
                    <input
                      type="text"
                      id="sub_parent"
                      name="sub_parent"
                      value={formData.sub_parent}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.sub_parent ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                      }`}
                      placeholder="Enter sub parent name (e.g. API Development)"
                      required
                    />
                    {errors.sub_parent && <p className="mt-1 text-sm text-red-600">{errors.sub_parent}</p>}
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex gap-3 pt-5 border-t-2 border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-5 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-5 py-3 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
              >
                {job ? '💾 Update' : '✨ Create'} {typeLabel}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
};
