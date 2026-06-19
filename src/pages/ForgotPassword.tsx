import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { authService } from '@/services/authService';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError(null);

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
      setError('Supabase keys are not configured yet. Please copy .env.example to .env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY with your project credentials.');
      setLoading(false);
      return;
    }

    try {
      await authService.resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Something went wrong. Please check your connection.');
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
          Reset password
        </h2>
        <p className="mt-1 text-center text-sm text-slate-400 dark:text-slate-500 font-medium">
          Get a recovery link sent straight to your email
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-dark-card py-8 px-6 shadow-xl rounded-3xl border border-slate-100 dark:border-dark-border">
          {success ? (
            <div className="text-center py-4 animate-fadeIn">
              <div className="w-12 h-12 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-display">
                Check your inbox
              </h3>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                We've sent a password reset link to <span className="font-bold text-slate-700 dark:text-slate-350">{email}</span>. 
                Please click the link in the email to define a new password.
              </p>
              <div className="mt-6 pt-2 border-t border-slate-100 dark:border-dark-border">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-brand-dark dark:hover:text-brand"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 p-3 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 flex items-start gap-2.5 text-red-600 dark:text-red-400 text-xs leading-relaxed">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-4">
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-slate-900 bg-brand hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center pt-2 border-t border-slate-100 dark:border-dark-border">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
