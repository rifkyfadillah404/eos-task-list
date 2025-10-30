import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, User, ArrowRight, Eye, EyeOff, AlertTriangle, CheckCircle2, CalendarClock } from 'lucide-react';

export const Login = ({ onLoginSuccess }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userId || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(userId, password);
      if (success) {
        onLoginSuccess?.();
      } else {
        setError('Invalid user ID or password');
      }
    } catch (err) {
      setError(err?.message || 'Unable to sign in right now');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f7f6f4]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_1.35fr]">
        <section className="relative overflow-hidden bg-slate-900 px-8 py-12 text-slate-100 sm:px-12 lg:px-16">
          <img
            src="assets/gedung.jpg"
            alt="City skyline"
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-950/65 to-slate-950/80" />

          <div className="relative z-10 flex h-full items-center justify-center">
            <div className="flex max-w-xl flex-col gap-6 text-center">
              <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-200">
                <CalendarClock size={14} />
                Daily Control
              </span>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold leading-tight text-white drop-shadow-[0_6px_25px_rgba(15,23,42,0.45)] sm:text-5xl">
                  Shape a calmer workday with <span className="text-transparent bg-gradient-to-r from-indigo-300 via-sky-300 to-emerald-200 bg-clip-text">precise task control</span>.
                </h1>
                <p className="text-sm text-slate-50 drop-shadow-[0_4px_18px_rgba(15,23,42,0.6)]">
                  EOS Task Management surfaces priorities, unlocks focus, and gives everyone the same confident view of progress.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center border-t border-[#f0eee8] bg-white px-8 py-12 sm:px-12 lg:border-l lg:border-t-0 lg:px-16">
          <div className="w-full max-w-md">
            <div className="mb-10 flex flex-col items-center gap-4 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-50 shadow-sm">
                <img src="assets/eos-logo.png" alt="EOS" className="h-16 w-auto" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Sign In</h2>
                <p className="mt-1 text-sm text-slate-500">Manage tasks, stay aligned, and keep momentum strong.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3 text-sm text-red-600 shadow-sm">
                  <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">User ID</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" />
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter your user ID"
                    disabled={isLoading}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-14 py-4 text-base text-slate-900 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={isLoading}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-14 py-4 text-base text-slate-900 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-700 hover:shadow-xl disabled:scale-100 disabled:bg-slate-300 disabled:text-slate-500"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-10 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} EOS Task Management. All rights reserved.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
