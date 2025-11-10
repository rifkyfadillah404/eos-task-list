import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, X, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const DepartmentManagement = () => {
  const { departments, token, fetchDepartments } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_URL = 'http://localhost:3000/api';

  const handleOpenForm = (dept = null) => {
    setError('');
    setSuccess('');
    if (dept) {
      setEditingDept(dept);
      setFormData({ name: dept.name, code: dept.code || '' });
    } else {
      setEditingDept(null);
      setFormData({ name: '', code: '' });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingDept(null);
    setFormData({ name: '', code: '' });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Department name is required');
      return;
    }

    try {
      let response;
      if (editingDept) {
        // Update department
        response = await fetch(`${API_URL}/departments/${editingDept.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      } else {
        // Create department
        response = await fetch(`${API_URL}/departments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save department');
      }

      setSuccess(editingDept ? 'Department updated successfully!' : 'Department added successfully!');
      await fetchDepartments(token);
      
      setTimeout(() => {
        handleCloseForm();
      }, 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/departments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete department');
      }

      setSuccess('Department deleted successfully!');
      await fetchDepartments(token);

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
              <Building2 size={24} className="text-indigo-600" />
              Department Management
            </h3>
            <p className="mt-1 text-sm text-slate-500">Manage organizational departments and units</p>
          </div>
          <button
            onClick={() => handleOpenForm()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
          >
            <Plus size={18} />
            Add Department
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && !isFormOpen && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700 flex items-center gap-2 animate-slide-in-left">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}
      {error && !isFormOpen && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 flex items-center gap-2 animate-slide-in-left">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Departments Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-slate-900">{dept.name}</h4>
                    {dept.code && (
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        {dept.code}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-slate-200 pt-4">
              <button
                onClick={() => handleOpenForm(dept)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
              >
                <Edit2 size={14} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(dept.id)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {departments.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-8 py-16 text-center">
          <Building2 size={48} className="mx-auto text-slate-300" />
          <p className="mt-4 text-sm font-semibold text-slate-600">No departments yet</p>
          <p className="text-xs text-slate-400">Click "Add Department" to create your first department.</p>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 p-6">
              <div className="flex items-center gap-3">
                {editingDept ? (
                  <>
                    <Edit2 size={24} className="text-indigo-600" />
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Edit Department
                    </h3>
                  </>
                ) : (
                  <>
                    <Plus size={24} className="text-indigo-600" />
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Add Department
                    </h3>
                  </>
                )}
              </div>
              <button
                onClick={handleCloseForm}
                className="rounded-lg p-2 text-gray-600 transition-all duration-200 hover:scale-110 hover:bg-white hover:text-gray-900"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {error && (
                <div className="flex items-center gap-2 rounded-lg border-2 border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 rounded-lg border-2 border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
                  <CheckCircle2 size={18} className="flex-shrink-0" />
                  {success}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Department Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Engineering, Marketing"
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 transition-all hover:border-indigo-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-700">
                  Department Code (Optional)
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g., ENG, MKT"
                  maxLength={10}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 transition-all hover:border-indigo-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <p className="mt-1 text-xs text-slate-500">Short code for quick reference</p>
              </div>

              <div className="flex gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 transform rounded-lg bg-gray-100 px-4 py-3 font-bold text-gray-900 transition-all duration-200 hover:scale-105 hover:bg-gray-200 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 transform rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl active:scale-95"
                >
                  {editingDept ? 'Update' : 'Add'} Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
