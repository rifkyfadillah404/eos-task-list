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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {job ? 'Edit ' : 'Add New '}
              {type === 'category' ? 'Category' : type === 'parent' ? 'Parent Category' : 'Sub Parent Category'}
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {type === 'category' && (
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.category ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                    placeholder="Enter category name (e.g. Development)"
                    required
                  />
                  {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                </div>
              )}

              {/* Department field for all types */}
              <div>
                <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <select
                  id="department_id"
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.department_id ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                  }`}
                  required
                >
                  <option value="">Select department</option>
                  {departments?.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                {errors.department_id && <p className="mt-1 text-sm text-red-600">{errors.department_id}</p>}
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

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                {job ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
