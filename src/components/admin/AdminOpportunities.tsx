import React from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  deleteDoc, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { isOpportunityClosed } from '../../lib/dateUtils';
import { 
  Pin, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  Eye,
  Briefcase,
  GraduationCap,
  Award,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Opportunity {
  id: string;
  title: string;
  organization: string;
  category: string;
  status: 'draft' | 'published';
  createdAt: any;
  closingDate?: string;
  logo?: string;
}

interface AdminOpportunitiesProps {
  onEdit: (id: string) => void;
  onNew: () => void;
}

export default function AdminOpportunities({ onEdit, onNew }: AdminOpportunitiesProps) {
  const [opportunities, setOpportunities] = React.useState<Opportunity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeFilter, setActiveFilter] = React.useState('all');

  React.useEffect(() => {
    const q = query(collection(db, 'opportunities'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Opportunity[];
      setOpportunities(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this opportunity?')) {
      try {
        await deleteDoc(doc(db, 'opportunities', id));
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const filtered = opportunities.filter(opp => {
    if (activeFilter === 'all') return true;
    return opp.status === activeFilter;
  });

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'bursary': return <GraduationCap className="w-5 h-5 text-blue-500" />;
      case 'internship': return <Briefcase className="w-5 h-5 text-emerald-500" />;
      case 'learnership': return <Award className="w-5 h-5 text-orange-500" />;
      default: return <Briefcase className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {['all', 'published', 'draft'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                activeFilter === filter
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {filter} ({opportunities.filter(o => filter === 'all' || o.status === filter).length})
            </button>
          ))}
        </div>

        <button 
          onClick={onNew}
          className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold flex items-center space-x-2 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-100"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Opportunity</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Title</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Closing Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((opp) => (
                <tr key={opp.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center p-2 group-hover:bg-white transition-colors">
                        {opp.logo ? <img src={opp.logo} alt="" className="w-full h-full object-contain" /> : getCategoryIcon(opp.category)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{opp.title}</p>
                        <p className="text-xs text-slate-500">{opp.organization}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      opp.category?.toLowerCase() === 'bursary' ? 'bg-blue-100 text-blue-700' :
                      opp.category?.toLowerCase() === 'internship' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {opp.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${opp.status === 'published' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                      <span className="text-xs font-medium text-slate-600 capitalize">{opp.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <p className={`text-xs font-medium ${!opp.closingDate ? 'text-slate-400 font-normal' : 'text-slate-600'}`}>
                        {opp.closingDate || 'Ongoing'}
                      </p>
                      {opp.closingDate && isOpportunityClosed(opp.closingDate) && (
                        <span className="text-[10px] text-red-650 font-bold bg-red-50/80 border border-red-200/50 px-1.5 py-0.5 rounded-full mt-1 w-fit select-none uppercase tracking-wider">
                          Expired
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                        <Pin className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onEdit(opp.id)}
                        className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(opp.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filtered.length === 0 && !loading && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Briefcase className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No opportunities found for this filter.</p>
          </div>
        )}

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">
            Showing <span className="text-slate-900">1 to {filtered.length}</span> of <span className="text-slate-900">{filtered.length}</span> results
          </p>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-white hover:text-slate-900 transition-all disabled:opacity-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-1">
              <button className="w-8 h-8 rounded-lg bg-slate-900 text-white text-xs font-bold">1</button>
              <button className="w-8 h-8 rounded-lg hover:bg-white text-slate-600 text-xs font-bold transition-all">2</button>
              <button className="w-8 h-8 rounded-lg hover:bg-white text-slate-600 text-xs font-bold transition-all">3</button>
            </div>
            <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-white hover:text-slate-900 transition-all disabled:opacity-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Total Active Views</p>
            <p className="text-3xl font-bold text-slate-900">12.4k</p>
            <p className="text-xs text-blue-600 font-medium mt-1">↗ +12% this week</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shadow-sm shadow-blue-200">
            <Eye className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Applications Rec.</p>
            <p className="text-3xl font-bold text-slate-900">842</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">Across all categories</p>
          </div>
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shadow-sm shadow-emerald-200">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl flex items-center justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Urgent Actions</p>
            <p className="text-3xl font-bold text-white">5 Expiring</p>
            <button className="text-sm text-slate-300 font-medium mt-2 hover:text-white transition-colors underline underline-offset-4">Review Postings</button>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
