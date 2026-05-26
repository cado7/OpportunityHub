import React from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Newspaper, Globe, Calendar, ArrowRight, Search } from 'lucide-react';
import { motion } from 'motion/react';
import SEO from '../components/SEO';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  imageUrl?: string;
  createdAt: any;
  category?: string;
  status: string;
}

export default function News() {
  const [news, setNews] = React.useState<NewsItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const q = query(
      collection(db, 'news'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NewsItem[];
      
      const published = data.filter(item => item.status === 'published');
      setNews(published.length > 0 ? published : data);
      setLoading(false);
    }, (error) => {
      console.error("News snapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">
      <SEO 
        title="Career News & Insights"
        description="Stay updated with the latest news, market trends, and success stories from the South African job and education landscape."
      />
      {/* Header */}
      <section className="bg-white border-b border-slate-100 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 text-center md:text-left">
            <div className="space-y-4">
              <span className="text-secondary font-bold tracking-widest text-xs uppercase flex items-center justify-center md:justify-start">
                <Newspaper className="w-4 h-4 mr-2" />
                Latest Updates
              </span>
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-primary">Market Trends & Insights</h1>
              <p className="text-muted max-w-xl mx-auto md:mx-0">
                Insights, market reports, and success stories from the South African job landscape.
              </p>
            </div>
            <div className="relative group max-w-sm w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted group-focus-within:text-secondary transition-colors" />
              <input 
                type="text" 
                placeholder="Search trends..." 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-secondary/20 outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
             <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full"
                >
                  <div className="aspect-[16/9] overflow-hidden relative">
                    <img 
                      src={item.imageUrl || `https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&q=80&w=800`} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&q=80&w=800`;
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold text-slate-900 uppercase tracking-widest border border-slate-100">
                        Trend
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
                    
                    <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-secondary transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    
                    <p className="text-sm text-muted line-clamp-3 leading-relaxed">
                      {item.summary?.replace(/<[^>]*>?/gm, '')}
                    </p>
                    
                    <div className="pt-4 mt-auto">
                      <Link to={`/news/${item.id}`} className="flex items-center text-sm font-bold text-primary group/btn">
                        Read Full Story
                        <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform text-secondary" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
              <Newspaper className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-primary">No trends items yet</h3>
              <p className="text-muted">Check back later for the latest career updates.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
