import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Bell, Shield, Trash2, LogOut, Info, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ThemeContextType {
  darkMode: boolean;
  toggleTheme: () => void;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { darkMode, toggleTheme } = useOutletContext<ThemeContextType>();

  // Local preferences
  const [notifyVibes, setNotifyVibes] = useState(true);
  const [notifyChats, setNotifyChats] = useState(true);
  const [notifyVoice, setNotifyVoice] = useState(false);
  const [privateAccount, setPrivateAccount] = useState(false);
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-dark-bg page-transition h-full min-h-0">
      
      {/* Top Header */}
      <header className="px-4 py-3 bg-white dark:bg-dark-bg border-b border-slate-100 dark:border-dark-border flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate('/app/profile')}
          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-sm font-bold text-slate-850 dark:text-slate-200 font-display">
          Settings
        </h2>
      </header>

      {/* Settings list container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 min-h-0 scrollbar-thin">
        
        {/* Theme Settings */}
        <div className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-3xl p-4 shadow-sm space-y-3.5">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Appearance
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200 font-medium">
              {darkMode ? <Moon size={16} className="text-yellow-400" /> : <Sun size={16} />}
              <span>Dark Theme</span>
            </div>
            
            <button
              onClick={toggleTheme}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                darkMode ? 'bg-brand' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white dark:bg-dark-bg absolute top-0.5 transition-transform shadow-sm ${
                  darkMode ? 'translate-x-5.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-3xl p-4 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Notifications
          </h3>

          {/* Today's Vibes Notify */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-700 dark:text-slate-200 font-medium">
              <span className="block font-bold">New Vibes Shared</span>
              <span className="block text-[10px] text-slate-400 font-medium mt-0.5">Receive alert when friends post songs</span>
            </div>
            <button
              onClick={() => setNotifyVibes(!notifyVibes)}
              className={`w-10 h-5.5 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                notifyVibes ? 'bg-brand' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  notifyVibes ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Chats Notify */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-dark-border/40">
            <div className="text-xs text-slate-700 dark:text-slate-200 font-medium">
              <span className="block font-bold">Direct Messages</span>
              <span className="block text-[10px] text-slate-400 font-medium mt-0.5">Receive notifications for incoming chat texts</span>
            </div>
            <button
              onClick={() => setNotifyChats(!notifyChats)}
              className={`w-10 h-5.5 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                notifyChats ? 'bg-brand' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  notifyChats ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Voice Lounge Notify */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-dark-border/40">
            <div className="text-xs text-slate-700 dark:text-slate-200 font-medium">
              <span className="block font-bold">Voice lounges updates</span>
              <span className="block text-[10px] text-slate-400 font-medium mt-0.5">Receive updates when friends go live</span>
            </div>
            <button
              onClick={() => setNotifyVoice(!notifyVoice)}
              className={`w-10 h-5.5 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                notifyVoice ? 'bg-brand' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  notifyVoice ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Privacy settings */}
        <div className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-3xl p-4 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Privacy & Security
          </h3>

          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-700 dark:text-slate-200 font-medium">
              <span className="block font-bold">Private Account</span>
              <span className="block text-[10px] text-slate-400 font-medium mt-0.5">Only accepted friends can see your profile feed</span>
            </div>
            <button
              onClick={() => setPrivateAccount(!privateAccount)}
              className={`w-10 h-5.5 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                privateAccount ? 'bg-brand' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  privateAccount ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Account management and actions */}
        <div className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-3xl p-4 shadow-sm space-y-3.5">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Account Management
          </h3>

          {/* Logout shortcut */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-250 py-1 transition-colors hover:text-red-500 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <LogOut size={16} />
              <span>Log out from account</span>
            </div>
          </button>

          {/* Delete Account */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center justify-between text-xs font-medium text-red-500 py-1.5 border-t border-slate-50 dark:border-dark-border/40 transition-colors hover:text-red-655 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Trash2 size={16} />
              <span>Request Account Deletion</span>
            </div>
          </button>
        </div>

        {/* About App details */}
        <div className="text-center pt-2 text-[10px] text-slate-455 font-medium space-y-1">
          <div className="flex items-center justify-center gap-1">
            <Info size={12} />
            <span>VibeChat MVP v1.0.0</span>
          </div>
          <p>© 2026 VibeChat Inc. All rights reserved.</p>
        </div>

      </div>

      {/* Delete Account Placeholder Modal */}
      {showDeleteModal && (
        <div className="absolute inset-0 bg-slate-900/70 dark:bg-black/85 backdrop-blur-sm z-30 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-dark-card border border-slate-150 dark:border-dark-border rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-scaleIn">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-display">
              Delete Account Request
            </h3>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              This action is destructive and cannot be undone. All your chat threads, shared vibes, and account profiles will be erased.
            </p>

            <div className="p-3 bg-slate-50 dark:bg-dark-bg/60 border border-slate-100 dark:border-dark-border rounded-2xl text-[10px] text-slate-450 leading-relaxed text-left font-medium">
              <strong>Notice:</strong> This is a placeholder action. In a live production deploy, this will delete the record from auth.users cascading references.
            </div>

            <div className="flex gap-3.5 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-dark-border/40 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Deletion request sent! (Placeholder logic execution)');
                  setShowDeleteModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Settings;
