import { useState, useEffect } from 'react';
import { JobTable, JobForm } from './';
import { Search, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const JobManagement = () => {
  const { token, user, departments, fetchDepartments } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formType, setFormType] = useState('category'); // 'category', 'parent', or 'sub_parent'

  const API_URL = 'http://localhost:3000/api';

  const [departmentFilter, setDepartmentFilter] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const url = departmentFilter ? `${API_URL}/jobs?department_id=${encodeURIComponent(departmentFilter)}` : `${API_URL}/jobs`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch jobs');
      
      const data = await response.json();
      setJobs(data.jobs || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [departmentFilter]);

  useEffect(() => {
    if (fetchDepartments) {
      fetchDepartments();
    }
  }, []);

  const handleAddJob = (type = 'category') => {
    if (user?.role !== 'admin') {
      alert('Only admin can create jobs.');
      return;
    }
    setSelectedJob(null);
    setFormType(type);
    setIsFormOpen(true);
  };

  const handleEditJob = (job) => {
    if (user?.role !== 'admin') {
      alert('Only admin can edit jobs.');
      return;
    }
    setSelectedJob(job);
    setIsFormOpen(true);
  };

  const handleDeleteJob = async (id) => {
    if (user?.role !== 'admin') {
      alert('Only admin can delete jobs.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/jobs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete job');
      
      fetchJobs(); // Refresh the list
    } catch (err) {
      alert('Failed to delete job');
    }
  };

  const handleSubmitJob = async (jobData) => {
    try {
      let response;
      if (selectedJob) {
        // Update existing job
        response = await fetch(`${API_URL}/jobs/${selectedJob.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(jobData),
        });
      } else {
        // Create new job
        response = await fetch(`${API_URL}/jobs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(jobData),
        });
      }
      
      if (!response.ok) throw new Error('Failed to save job');
      
      setIsFormOpen(false);
      setSelectedJob(null);
      fetchJobs(); // Refresh the list
    } catch (err) {
      alert('Failed to save job');
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.sub_parent && job.sub_parent.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (job.parent && job.parent.toString().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900">Job Management</h2>
          <p className="text-sm text-slate-500">Manage job codes, categories, and hierarchies</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleAddJob('category')}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
          >
            <Plus size={16} />
            New Category
          </button>
          <button
            onClick={() => handleAddJob('parent')}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-500"
          >
            <Plus size={16} />
            New Parent
          </button>
          <button
            onClick={() => handleAddJob('sub_parent')}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-500"
          >
            <Plus size={16} />
            New Sub-Parent
          </button>
          <div className="flex items-center gap-2">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">All Departments</option>
              {departments?.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search jobs by code, name, or category"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <JobTable 
          jobs={filteredJobs} 
          onJobClick={handleEditJob}
          onDeleteJob={handleDeleteJob}
        />
      </div>

      <JobForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedJob(null);
        }}
        onSubmit={handleSubmitJob}
        job={selectedJob}
        type={formType}
      />
    </div>
  );
};
