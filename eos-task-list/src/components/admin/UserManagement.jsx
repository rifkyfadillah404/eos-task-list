import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, X, Users, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

export const UserManagement = () => {
  const { users, addUser, updateUser, deleteUser } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    userId: '',
    password: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        userId: '',
        password: '',
        role: 'user',
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
      const result = await addUser(formData.name, formData.userId, formData.password, formData.role);
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

  return (
    <div>
      <div className="flex items-center justify-between mb-8 animate-slide-in-left stagger-1">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={28} className="text-indigo-600" />
            User Management
          </h2>
          <p className="text-gray-600 mt-1 text-sm">Manage team members and their roles</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
        >
          <Plus size={18} />
          Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden shadow-md hover:shadow-lg transition-shadow animate-slide-in-left stagger-2">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50">
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Name</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">User ID</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Shield size={16} />
                  Role
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-200 hover:bg-indigo-50 transition-all duration-200 group animate-slide-in-left"
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold transition-all duration-200 group-hover:scale-110 ${
                        user.role === 'admin'
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                          : 'bg-gradient-to-br from-indigo-500 to-blue-500'
                      }`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{user.userId}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1.5 rounded-full font-bold inline-flex items-center gap-1.5 transition-all duration-200 group-hover:scale-110 transform ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role === 'admin' ? <Shield size={14} /> : <Users size={14} />}
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenForm(user)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-all duration-200 text-blue-600 hover:scale-110 transform"
                        title="Edit user"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-all duration-200 text-red-600 hover:scale-110 transform"
                        title="Delete user"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No users yet</p>
              <p className="text-gray-400 text-sm">Add a new user to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
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
