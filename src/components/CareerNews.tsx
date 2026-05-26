import React from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Newspaper, ArrowRight, Globe, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  imageUrl?: string;
  createdAt: any;
  status?: string;
}

export default function CareerNews() {
  const [news, setNews] = React.useState<NewsItem[]>([]);

  React.useEffect(() => {
    const q = query(
      collection(db, 'news'),
      limit(3)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NewsItem[];
      
      // Filter published items in-memory to avoid index issues during early dev
      const published = data.filter(item => item.status === 'published');
      setNews(published.length > 0 ? published : data);
    }, (error) => {
      console.error("Firestore error in CareerNews:", error);
    });

    return () => unsubscribe();
  }, []);

  if (news.length === 0) return null;

  return (
    <section className="py-24 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-4">
            <span className="text-emerald-600 font-bold tracking-widest text-xs uppercase flex items-center">
              <Newspaper className="w-4 h-4 mr-2" />
              Trending Insights
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900">Market Trends & Insights</h2>
            <p className="text-slate-500 max-w-xl">Stay ahead with the latest updates on the South African job market, funding opportunities, and career advice.</p>
          </div>
          <Link to="/news" className="hidden sm:flex items-center text-slate-900 font-bold hover:text-emerald-600 transition-colors group">
            View All Trends
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full"
            >
              <div className="aspect-[16/9] overflow-hidden relative">
                <img 
                  src={item.imageUrl || `https://images.unsplash.com/photo-1504711432869-efd597cdd045?auto=format&fit=crop&q=80&w=800`} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1504711432869-efd597cdd045?auto=format&fit=crop&q=80&w=800`;
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-slate-900 uppercase tracking-widest border border-slate-100">
                    News
                  </span>
                </div>
              </div>
              
              <div className="p-8 space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-3.5 h-3.5" />
                    <span>{item.source}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">
                  {item.summary?.replace(/<[^>]*>?/gm, '')}
                </p>
                
                <div className="pt-4 mt-auto">
                  <Link to={`/news/${item.id}`} className="flex items-center text-sm font-bold text-slate-900 group/btn">
                    Read Story
                    <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform text-emerald-600" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
