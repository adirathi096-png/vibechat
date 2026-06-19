import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Splash: React.FC = () => {
  const { user, profile, initialized, initAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize session check
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (initialized) {
      const timer = setTimeout(() => {
        if (user) {
          if (profile?.profile_completed) {
            navigate('/app/home', { replace: true });
          } else {
            navigate('/complete-profile', { replace: true });
          }
        } else {
          navigate('/login', { replace: true });
        }
      }, 1000); // 1-second delay for smooth branding entrance

      return () => clearTimeout(timer);
    }
  }, [initialized, user, profile, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#06080b] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="flex flex-col items-center text-center animate-bounce mt-[-40px]">
        {/* VibeChat Icon/Logo */}
        <div className="w-20 h-20 bg-brand text-slate-900 rounded-3xl flex items-center justify-center font-bold text-4xl shadow-xl font-display relative">
          V
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-500 rounded-full border-2 border-slate-50 dark:border-dark-bg flex items-center justify-center text-[10px] text-white">
            ⚡
          </div>
        </div>
        
        {/* Title */}
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight font-display">
          VibeChat
        </h1>
        
        {/* Subtitle */}
        <p className="mt-2 text-slate-400 dark:text-slate-500 text-sm font-medium tracking-wide">
          Snap the vibe. Chat & listen together.
        </p>
      </div>

      {/* Spinner */}
      <div className="absolute bottom-16 flex flex-col items-center gap-2">
        <div className="w-5 h-5 rounded-full border-2 border-brand/20 border-t-brand animate-spin"></div>
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-600 tracking-wider uppercase">
          Verifying session
        </span>
      </div>
    </div>
  );
};

export default Splash;
