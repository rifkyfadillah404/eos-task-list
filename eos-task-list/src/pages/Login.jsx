import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, User, ArrowRight, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export const Login = ({ onLoginSuccess }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!userId || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      if (login(userId, password)) {
        onLoginSuccess?.();
      } else {
        setError('Invalid user ID or password');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Image Section */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-black">
        {/* Background Image */}
        <img
          src="assets/gedung.jpg"
          alt="Building"
          className="absolute inset-0 w-full h-full object-cover filter blur-sm opacity-40"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>

        {/* Decorative Animated Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000"></div>

        {/* Floating Decorative Circles */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400 rounded-full opacity-10 animate-float float-delay-1"></div>
        <div className="absolute bottom-32 right-20 w-32 h-32 bg-cyan-300 rounded-full opacity-10 animate-float float-delay-2"></div>
        <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-purple-300 rounded-full opacity-10 animate-float float-delay-3"></div>

        {/* Animated Software GIF */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <img
            src="/assets/login/Software.gif"
            alt="Software Development"
            className="h-80 w-auto filter drop-shadow-2xl animate-float float-delay-1 hover:scale-110 transition-transform duration-300"
          />
        </div>

        {/* Overlay Text with Animations */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-12 text-white z-20">
          <h2 className="text-4xl font-bold mb-3 animate-slide-in-left stagger-1">
            Manage Your Tasks <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Efficiently</span>
          </h2>
          <p className="text-blue-100 text-lg animate-slide-in-left stagger-2">
            Build your dreams with organized task management
          </p>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full lg:w-3/5 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-10 right-10 w-40 h-40 bg-blue-100 rounded-full opacity-10 animate-float float-delay-1"></div>
        <div className="absolute bottom-20 left-10 w-56 h-56 bg-cyan-100 rounded-full opacity-10 animate-float float-delay-2"></div>

        <div className="w-full max-w-md relative z-10">
          {/* Logo & Title */}
          <div className="mb-8 text-center animate-slide-in-top stagger-1">
            <div className="flex justify-center mb-4 transform transition-transform duration-500 hover:scale-110">
              <img
                src="assets/eos-logo.png"
                alt="EOS Logo"
                className="h-32 w-auto drop-shadow-lg hover:drop-shadow-2xl transition-all duration-300 animate-float float-delay-1"
              />
            </div>
            <p className="text-gray-600 font-medium text-lg bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Task Management System
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium border-2 border-red-200 flex items-center gap-2 animate-slide-in-left stagger-1 shadow-lg">
                <AlertTriangle size={18} className="flex-shrink-0 animate-pulse" />
                {error}
              </div>
            )}

            {/* User ID Input */}
            <div className="animate-slide-in-left stagger-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                User ID
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 group-focus-within:text-blue-700 transition-colors" size={20} />
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter your user ID"
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:opacity-50 hover:border-blue-300"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="animate-slide-in-left stagger-3">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500 group-focus-within:text-blue-700 transition-colors" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:opacity-50 hover:border-blue-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:scale-125"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 rounded-xl mt-6 transition-all transform hover:scale-105 active:scale-95 disabled:scale-100 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl animate-slide-in-left stagger-4"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="animate-pulse">Signing in...</span>
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-gray-500 text-xs mt-8 animate-slide-in-left stagger-5">
            © 2025 EOS Task Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
