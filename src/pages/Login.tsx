import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { authService } from '@/services/authService';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map database errors to friendly user alerts
  const getFriendlyError = (errMessage: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (
      !supabaseUrl ||
      !supabaseKey ||
      supabaseUrl.includes('placeholder') ||
      supabaseKey.includes('placeholder') ||
      !supabaseUrl.trim() ||
      !supabaseKey.trim()
    ) {
      return 'Supabase keys are not configured yet. Please copy .env.example to .env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY with your project credentials.';
    }

    const msg = errMessage.toLowerCase();
    if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
      return 'Hmm, that password or email doesn\'t look right. Please try again.';
    }
    if (msg.includes('email not confirmed')) {
      return 'Your email address is not verified yet. Please check your inbox for the confirmation link!';
    }
    if (msg.includes('invalid email')) {
      return 'Please enter a valid email address (e.g., name@example.com).';
    }
    if (msg.includes('failed to fetch') || msg.includes('network')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    return errMessage; // Fallback
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.signIn(email, password);
      // ProtectedRoute will automatically catch the state change and route to /app/home or /complete-profile
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(getFriendlyError(err.message || 'Login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#06080b] flex flex-col justify-center px-6 py-12 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        {/* Logo */}
        <div className="w-14 h-14 bg-brand text-slate-900 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-md font-display">
          V
        </div>
        <h2 className="mt-5 text-center text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 font-display">
          Welcome back
        </h2>
        <p className="mt-1 text-center text-sm text-slate-400 dark:text-slate-500 font-medium">
          Sign in to connect with your vibes
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-dark-card py-8 px-6 shadow-xl rounded-3xl border border-slate-100 dark:border-dark-border">
          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 flex items-start gap-2.5 text-red-600 dark:text-red-400 text-xs leading-relaxed animate-shake">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg text-slate-800 dark:text-slate-100 placeholder-slate-400 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg text-slate-800 dark:text-slate-100 placeholder-slate-400 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-slate-900 bg-brand hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-bold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-slate-100 ml-0.5"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
