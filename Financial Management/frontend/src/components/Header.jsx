import React from 'react';
import { LogOut, User, Bell } from 'lucide-react';

const Header = ({ title, user }) => {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
      <h1 className="text-xl font-bold bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
        {title}
      </h1>
      
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-500 hover:text-brand-600 transition-colors">
          <Bell size={20} />
        </button>
        <div className="flex items-center gap-3 border-l pl-4 border-slate-200 dark:border-slate-700">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role || 'Guest'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
            {user?.name?.charAt(0) || <User size={20} />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
