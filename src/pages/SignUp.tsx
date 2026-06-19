import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { authService } from '@/services/authService';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

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
    if (msg.includes('user already exists') || msg.includes('already registered')) {
      return 'An account with this email address already exists. Try signing in instead!';
    }
    if (msg.includes('password should be') || msg.includes('weak password') || msg.includes('at least 6 characters')) {
      return 'Password must be at least 6 characters long. Make it strong!';
    }
    if (msg.includes('invalid email')) {
      return 'Please enter a valid email address.';
    }
    if (msg.includes('failed to fetch') || msg.includes('network')) {
      return 'Network error. Please check your internet connection and try again.';
    }
    return errMessage;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.signUp(email, password);
      setSuccess(true);
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(getFriendlyError(err.message || 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#06080b] flex flex-col justify-center px-6 py-12 transition-colors duration-200">
        <div className="bg-white dark:bg-dark-card py-10 px-8 shadow-xl rounded-3xl border border-slate-100 dark:border-dark-border max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 font-display">
            Check your email
          </h2>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            We have sent a verification link to <span className="font-bold text-slate-700 dark:text-slate-350">{email}</span>. 
            Please check your inbox (and spam folder) and confirm your address to complete registration.
          </p>
          <div className="mt-8">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-2xl text-slate-900 bg-brand hover:bg-brand-light transition-all duration-200"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#06080b] flex flex-col justify-center px-6 py-12 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        {/* Logo */}
        <div className="w-14 h-14 bg-brand text-slate-900 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-md font-display">
          V
        </div>
        <h2 className="mt-5 text-center text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 font-display">
          Create account
        </h2>
        <p className="mt-1 text-center text-sm text-slate-400 dark:text-slate-500 font-medium">
          Start sharing vibes and chatting with friends
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

          <form onSubmit={handleSignUp} className="space-y-4">
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
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
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

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  <span>Create Account</span>
                  <Sparkles size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-slate-100 ml-0.5"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
