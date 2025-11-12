import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, X, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

export const DepartmentManagement = () => {
  const { departments, token, fetchDepartments } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState(null);

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

  const handleDelete = (dept) => {
    setDeptToDelete(dept);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deptToDelete) return;

    try {
      const response = await fetch(`${API_URL}/departments/${deptToDelete.id}`, {
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
      setDeptToDelete(null);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFormOpen) {
        handleCloseForm();
      }
    };

    if (isFormOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isFormOpen]);

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
                onClick={() => handleDelete(dept)}
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
      {isFormOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white shadow-2xl rounded-xl flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 rounded-t-xl">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingDept ? 'Edit Department' : 'Create New Department'}
                </h3>
                <p className="text-xs text-indigo-100 mt-0.5">
                  {editingDept ? 'Update department information' : 'Add a new organizational unit'}
                </p>
              </div>
              <button
                onClick={handleCloseForm}
                className="rounded-lg p-2 text-white hover:text-indigo-100 transition-colors hover:bg-white/10"
                title="Close (Esc)"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6 overflow-y-auto flex-1">
              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-xs font-medium text-green-700">
                  <CheckCircle2 size={16} className="flex-shrink-0" />
                  {success}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Department Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Engineering, Marketing, Finance"
                  maxLength={50}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Department Code
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g., ENG, MKT, FIN"
                  maxLength={10}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </form>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={handleCloseForm}
                className="flex-1 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.name.trim()}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed"
              >
                {editingDept ? 'Update' : 'Create'} Department
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeptToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Department"
        message={`Are you sure you want to delete department "${deptToDelete?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};
