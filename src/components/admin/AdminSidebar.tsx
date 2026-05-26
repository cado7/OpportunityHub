import React from 'react';
import { 
  LayoutGrid, 
  Briefcase, 
  BarChart3, 
  Settings, 
  PlusCircle, 
  ChevronDown, 
  ChevronRight,
  LogOut,
  Newspaper,
  Bell
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AdminSidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [postingsOpen, setPostingsOpen] = React.useState(true);
  const [newsOpen, setNewsOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutGrid },
    { 
      id: 'postings', 
      name: 'Opportunities', 
      icon: Briefcase,
      hasSubmenu: true,
      submenu: [
        { id: 'view-all', name: 'Manage Postings' },
        { id: 'new-post', name: 'Create New' }
      ]
    },
    { 
      id: 'news', 
      name: 'Trend', 
      icon: Newspaper,
      hasSubmenu: true,
      submenu: [
        { id: 'view-news', name: 'Manage Trends' },
        { id: 'new-news', name: 'Add Manual' },
        { id: 'auto-news', name: 'AI Fetch' }
      ]
    },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 h-screen bg-slate-50 border-r border-slate-200 flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6">
        <h1 className="text-xl font-bold text-slate-900">Admin Portal</h1>
        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Management Console</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <div key={item.id} className="space-y-1">
            <button
              onClick={() => {
                if (item.id === 'postings') {
                  setPostingsOpen(!postingsOpen);
                } else if (item.id === 'news') {
                  setNewsOpen(!newsOpen);
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                activeTab === item.id || 
                (item.id === 'postings' && (activeTab === 'view-all' || activeTab === 'new-post')) ||
                (item.id === 'news' && (activeTab === 'view-news' || activeTab === 'new-news' || activeTab === 'auto-news'))
                  ? 'bg-emerald-100 text-emerald-900 border-l-4 border-emerald-500 font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </div>
              {item.hasSubmenu && (
                (item.id === 'postings' ? postingsOpen : newsOpen) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
              )}
            </button>

            <AnimatePresence>
              {item.hasSubmenu && (item.id === 'postings' ? postingsOpen : newsOpen) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-slate-100/50 rounded-xl ml-4"
                >
                  {item.submenu?.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setActiveTab(sub.id)}
                      className={`w-full text-left px-4 py-2 text-sm transition-all ${
                        activeTab === sub.id
                          ? 'text-emerald-700 font-bold'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-200">
        <div className="flex items-center space-x-3 mb-6 p-2">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-slate-900 truncate">Admin User</p>
            <p className="text-xs text-slate-500 truncate">{user?.email || 'admin@saopps.co.za'}</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 p-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all mb-4"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('new-post')}
          className="w-full bg-slate-900 text-white p-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="font-bold">Post Opportunity</span>
        </button>
      </div>
    </div>
  );
}
