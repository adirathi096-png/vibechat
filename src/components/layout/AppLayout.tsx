import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageCircle, Search, Music2, Radio, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  // Apply dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  // Hide navigation on active chat screen
  const isChatRoom = location.pathname.startsWith('/app/chats/') && location.pathname !== '/app/chats';

  const navItems = [
    { label: 'Home', path: '/app/home', icon: Home },
    { label: 'Chats', path: '/app/chats', icon: MessageCircle },
    { label: 'Discover', path: '/app/discover', icon: Search },
    { label: 'Music', path: '/app/music', icon: Music2 },
    { label: 'Voice', path: '/app/voice', icon: Radio },
    { label: 'Profile', path: '/app/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#06080b] flex items-center justify-center transition-colors duration-200">
      {/* Premium Desktop Centering Shell */}
      <div className="w-full h-screen max-w-md bg-white dark:bg-dark-bg border-x border-slate-200 dark:border-dark-border flex flex-col relative overflow-hidden shadow-2xl">
        
        {/* Conditional Header (hidden inside chat rooms to let pages render custom headers) */}
        {!isChatRoom && (
          <header className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-dark-border bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md z-10 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center font-bold text-slate-900 font-display text-lg shadow-sm">
                V
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-slate-100 font-display">
                VibeChat
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-dark-card dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                aria-label="Toggle Theme"
              >
                {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
              </button>

              {/* Profile Avatar Shortcut */}
              <button
                onClick={() => navigate('/app/profile')}
                className="w-8 h-8 rounded-xl overflow-hidden bg-slate-200 border-2 border-brand/50 flex items-center justify-center shrink-0"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-semibold text-slate-700">
                    {profile?.display_name?.slice(0, 2).toUpperCase() || 'VC'}
                  </span>
                )}
              </button>
            </div>
          </header>
        )}

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto relative flex flex-col min-h-0">
          <Outlet context={{ darkMode, toggleTheme }} />
        </main>

        {/* Bottom Navigation */}
        {!isChatRoom && (
          <nav className="h-16 border-t border-slate-100 dark:border-dark-border bg-white dark:bg-dark-bg px-2 flex items-center justify-around shrink-0 z-10">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'text-brand-dark bg-yellow-400/10 dark:text-brand dark:bg-brand/5 scale-105'
                      : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] mt-0.5 font-medium tracking-tight">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        )}

      </div>
    </div>
  );
};

export default AppLayout;
export { AppLayout };
