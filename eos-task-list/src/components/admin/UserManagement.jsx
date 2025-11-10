import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, X, Users, Shield, AlertCircle, CheckCircle2, Search, Filter, UserPlus, UserCheck, UserCircle, Building2 } from 'lucide-react';
import { DepartmentManagement } from './DepartmentManagement';

export const UserManagement = () => {
  const { users, departments, addUser, updateUser, deleteUser } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    userId: '',
    password: '',
    role: 'user',
    department_id: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const handleOpenForm = (user = null) => {
    setError('');
    setSuccess('');
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        userId: user.userId,
        password: user.password,
        role: user.role,
        department_id: user.department_id || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        userId: '',
        password: '',
        role: 'user',
        department_id: ''
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
    setFormData({
      name: '',
      userId: '',
      password: '',
      role: 'user',
      department_id: ''
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.userId || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (editingUser) {
      // Update user
      const success = await updateUser(editingUser.id, formData);
      if (success) {
        setSuccess('User updated successfully!');
        setTimeout(() => {
          handleCloseForm();
        }, 1500);
      } else {
        setError('Failed to update user');
      }
    } else {
      // Add new user
      const deptId = formData.department_id ? parseInt(formData.department_id) : null;
      const result = await addUser(formData.name, formData.userId, formData.password, formData.role, deptId);
      if (result.success) {
        setSuccess('User added successfully!');
        setTimeout(() => {
          handleCloseForm();
        }, 1500);
      } else {
        setError(result.message);
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const success = await deleteUser(userId);
      if (success) {
        setSuccess('User deleted successfully!');
      } else {
        setError('Failed to delete user');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const totalUsers = users.length;
  const adminCount = users.filter(user => user.role === 'admin').length;
  const memberCount = totalUsers - adminCount;

  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'all' ? true : user.role === roleFilter;
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch =
      query.length === 0 ||
      user.name.toLowerCase().includes(query) ||
      user.userId.toLowerCase().includes(query);
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-10">
      {/* Department Management Section */}
      <DepartmentManagement />

      {/* Hero */}
      <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8 shadow-sm animate-slide-in-left stagger-1">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-700">
              <Users size={16} />
              team roster
            </span>
            <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Shape your workspace access with confidence.</h2>
            <p className="text-sm text-slate-600">
              Invite collaborators, promote leaders, and keep everyone aligned. Fine-tune roles in seconds.
            </p>
          </div>
          <button
            onClick={() => handleOpenForm()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl hover:bg-indigo-500"
          >
            <Plus size={18} />
            Add teammate
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 animate-slide-in-left stagger-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">Total members</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{totalUsers}</p>
            </div>
            <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600">
              <UserPlus size={22} />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-500">Administrators</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{adminCount}</p>
            </div>
            <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
              <Shield size={22} />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-500">Members</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{memberCount}</p>
            </div>
            <div className="rounded-xl bg-sky-100 p-3 text-sky-600">
              <UserCheck size={22} />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">Access health</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {totalUsers > 0 ? Math.round((adminCount / totalUsers) * 100) : 0}%
              </p>
              <p className="text-xs text-slate-500">Admin coverage</p>
            </div>
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
              <UserCircle size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-slide-in-left stagger-3">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or ID"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-700 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              <Filter size={14} />
              Roles
            </span>
            {[
              { id: 'all', label: 'All' },
              { id: 'admin', label: 'Admins' },
              { id: 'user', label: 'Members' },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setRoleFilter(option.id)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                  roleFilter === option.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 animate-slide-in-left stagger-4">
        {filteredUsers.map((user, index) => (
          <div
            key={user.id}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-2xl"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 via-purple-50/0 to-indigo-100/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white text-lg font-semibold shadow-sm transition-all duration-300 group-hover:scale-110 ${
                    user.role === 'admin'
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                      : 'bg-gradient-to-br from-indigo-500 to-blue-500'
                  }`}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400">ID · {user.userId}</p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] shadow-sm ${
                  user.role === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {user.role === 'admin' ? <Shield size={14} /> : <Users size={14} />}
                {user.role}
              </span>
            </div>

            <div className="relative mt-5 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Credential ID</span>
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {user.userId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Account Status</span>
                <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  Active
                </span>
              </div>
            </div>

            <div className="relative mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
              <button
                onClick={() => handleOpenForm(user)}
                className="flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 transition hover:-translate-y-0.5 hover:bg-indigo-100"
              >
                <Edit2 size={16} />
                Edit
              </button>
              <button
                onClick={() => handleDeleteUser(user.id)}
                className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:-translate-y-0.5 hover:bg-rose-100"
              >
                <Trash2 size={16} />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="animate-slide-in-left stagger-5">
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-8 py-16 text-center shadow-sm">
            <Users size={48} className="mx-auto text-slate-300" />
            <p className="mt-4 text-sm font-semibold text-slate-600">No users match the current filters</p>
            <p className="text-xs text-slate-400">Try adjusting your search or role filter.</p>
          </div>
        </div>
      )}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50">
              <div className="flex items-center gap-3">
                {editingUser ? (
                  <>
                    <Edit2 size={24} className="text-indigo-600 animate-float float-delay-1" />
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Edit User
                    </h3>
                  </>
                ) : (
                  <>
                    <Plus size={24} className="text-indigo-600 animate-float float-delay-1" />
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Add User
                    </h3>
                  </>
                )}
              </div>
              <button
                onClick={handleCloseForm}
                className="p-2 hover:bg-white rounded-lg transition-all duration-200 text-gray-600 hover:text-gray-900 hover:scale-110 transform"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm font-medium border-2 border-red-200 flex items-center gap-2 animate-slide-in-left stagger-1">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 text-green-700 rounded-lg text-sm font-medium border-2 border-green-200 flex items-center gap-2 animate-slide-in-left stagger-1">
                  <CheckCircle2 size={18} className="flex-shrink-0" />
                  {success}
                </div>
              )}

              <div className="animate-slide-in-left stagger-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all hover:border-indigo-300"
                  required
                />
              </div>

              <div className="animate-slide-in-left stagger-3">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  placeholder="Enter user ID"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all hover:border-indigo-300"
                  required
                />
              </div>

              <div className="animate-slide-in-left stagger-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all hover:border-indigo-300"
                  required
                />
              </div>

              <div className="animate-slide-in-left stagger-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Department
                </label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all hover:border-indigo-300"
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="animate-slide-in-left stagger-5">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Shield size={16} className="text-indigo-600" />
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium hover:border-indigo-300"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 animate-slide-in-left stagger-5">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                >
                  {editingUser ? 'Update' : 'Add'} User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
