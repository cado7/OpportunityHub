import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import AdminOpportunities from '../components/admin/AdminOpportunities';
import AdminAnalytics from '../components/admin/AdminAnalytics';
import AdminPostForm from '../components/admin/AdminPostForm';
import AdminNews from '../components/admin/AdminNews';
import AdminNewsForm from '../components/admin/AdminNewsForm';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Newspaper } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingNewsId, setEditingNewsId] = React.useState<string | null>(null);
  const [isFetchingNews, setIsFetchingNews] = React.useState(false);
  const navigate = useNavigate();
  const [user, setUser] = React.useState(auth.currentUser);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (!u) {
        navigate('/login');
      } else {
        setUser(u);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleEdit = (id: string) => {
    setEditingId(id);
    setActiveTab('edit-post');
  };

  const handleEditNews = (id: string) => {
    setEditingNewsId(id);
    setActiveTab('edit-news');
  };

  const handleAutoFetchItems = async () => {
    setIsFetchingNews(true);
    try {
      const response = await fetch('/api/news/fetch');
      const data = await response.json();
      
      const user = auth.currentUser;
      if (!user || !data.length) {
        setIsFetchingNews(false);
        return;
      }

      // Save to firebase as drafts
      for (const item of data) {
        await addDoc(collection(db, 'news'), {
          ...item,
          authorId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      setActiveTab('view-news');
      alert(`Successfully fetched and drafted ${data.length} news items!`);
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Failed to fetch news. Check console for details.');
    } finally {
      setIsFetchingNews(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
      case 'view-all':
        return <AdminOpportunities onEdit={handleEdit} onNew={() => setActiveTab('new-post')} />;
      case 'view-news':
        return <AdminNews onEdit={handleEditNews} onNew={() => setActiveTab('new-news')} onAutoFetch={handleAutoFetchItems} />;
      case 'new-news':
        return <AdminNewsForm onSuccess={() => setActiveTab('view-news')} onCancel={() => setActiveTab('view-news')} />;
      case 'edit-news':
        return <AdminNewsForm newsId={editingNewsId} onSuccess={() => setActiveTab('view-news')} onCancel={() => setActiveTab('view-news')} />;
      case 'auto-news':
        return (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-6">
            <h3 className="text-2xl font-bold text-slate-900">Automated Trend Fetching</h3>
            <p className="text-slate-500 max-w-lg mx-auto">
              Our AI service will fetch the latest career trends, job market news, and bursary updates from SA Government news portals and NewsData.io.
            </p>
            <button 
              onClick={handleAutoFetchItems}
              disabled={isFetchingNews}
              className="bg-emerald-500 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-600 disabled:opacity-50 flex items-center space-x-2 mx-auto"
            >
              <RefreshCw className={`w-5 h-5 ${isFetchingNews ? 'animate-spin' : ''}`} />
              <span>{isFetchingNews ? 'Fetching Now...' : 'Fetch & Draft Latest Trends'}</span>
            </button>
          </div>
        );
      case 'analytics':
        return <AdminAnalytics />;
      case 'new-post':
        return <AdminPostForm onSuccess={() => setActiveTab('view-all')} onCancel={() => setActiveTab('view-all')} />;
      case 'edit-post':
        return <AdminPostForm opportunityId={editingId} onSuccess={() => setActiveTab('view-all')} onCancel={() => setActiveTab('view-all')} />;
      case 'settings':
        return <div className="p-12 text-center text-slate-500 font-medium bg-white rounded-3xl border border-slate-200">Settings panel coming soon...</div>;
      default:
        return <AdminOpportunities onEdit={handleEdit} onNew={() => setActiveTab('new-post')} />;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'view-all': return 'Manage Opportunities';
      case 'view-news': return 'Manage Trends';
      case 'new-news': return 'Post Trend Manually';
      case 'edit-news': return 'Edit Trend Item';
      case 'auto-news': return 'AI Trend Fetching';
      case 'analytics': return 'Performance Analytics';
      case 'new-post': return 'Create New Opportunity';
      case 'edit-post': return 'Edit Opportunity';
      case 'settings': return 'System Settings';
      default: return 'Admin Portal';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="pl-64 min-h-screen">
        <AdminHeader title={getTitle()} />
        
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="min-h-[calc(100vh-200px)]"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>

          <footer className="mt-12 py-12 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900">SA Opportunities</h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                © 2024 SA Opportunities. Empowering Growth through digital connection.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Internal Management</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="hover:text-emerald-500 cursor-pointer">Staff Portal</li>
                <li className="hover:text-emerald-500 cursor-pointer">Activity Logs</li>
                <li className="hover:text-emerald-500 cursor-pointer">API Keys</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compliance</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="hover:text-emerald-500 cursor-pointer">POPIA Policy</li>
                <li className="hover:text-emerald-500 cursor-pointer">Terms of Service</li>
                <li className="hover:text-emerald-500 cursor-pointer">Security Settings</li>
              </ul>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
