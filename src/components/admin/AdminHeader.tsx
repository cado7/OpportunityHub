import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
}

export default function AdminHeader({ title }: HeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-slate-200 sticky top-0 z-30">
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      
      <div className="flex items-center space-x-6">
        <div className="relative group">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search opportunities..." 
            className="pl-10 pr-4 py-2 bg-slate-100 border-transparent border focus:border-emerald-500 focus:bg-white rounded-xl text-sm w-64 transition-all outline-none"
          />
        </div>
        
        <button className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors">
          <Bell className="w-6 h-6" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </header>
  );
}
