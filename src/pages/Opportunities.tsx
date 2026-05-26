import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, ChevronDown, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, getDocs, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import OpportunityCard, { Opportunity } from '../components/OpportunityCard';
import SEO from '../components/SEO';

export default function Opportunities() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('q') || '';
  const initialFilter = searchParams.get('filter') || 'All';
  const [searchTerm, setSearchTerm] = React.useState(initialSearch);
  const [activeFilter, setActiveFilter] = React.useState(initialFilter);
  const [opportunities, setOpportunities] = React.useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [subscribeEmail, setSubscribeEmail] = React.useState('');
  const [isSubscribing, setIsSubscribing] = React.useState(false);
  const [subscribeStatus, setSubscribeStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
  
  const filters = ['All', 'Learnerships', 'Bursaries', 'Internships', 'Graduate Programs', 'Jobs', 'Courses'];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail) return;

    setIsSubscribing(true);
    setSubscribeStatus('idle');
    try {
      await addDoc(collection(db, 'subscriptions'), {
        email: subscribeEmail,
        createdAt: serverTimestamp(),
        status: 'active'
      });
      setSubscribeStatus('success');
      setSubscribeEmail('');
      setTimeout(() => setSubscribeStatus('idle'), 5000);
    } catch (err) {
      console.error('Subscription error:', err);
      setSubscribeStatus('error');
    } finally {
      setIsSubscribing(false);
    }
  };

  React.useEffect(() => {
    const fetchOpportunities = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const q = query(
          collection(db, 'opportunities'),
          where('status', '==', 'published')
        );
        const querySnapshot = await getDocs(q);
        const fetchedOpps = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            location: data.city ? 
              (data.city.includes(data.region) ? data.city : `${data.city}, ${data.region || ''}`).replace(/, $/, '') : 
              (data.region || 'South Africa'),
            type: data.category,
            deadline: data.closingDate || 'Ongoing'
          };
        }) as Opportunity[];
        
        // Sort in memory to avoid Firestore requiring a composite index
        fetchedOpps.sort((a, b) => {
          const timeA = a.createdAt?.seconds || (a.createdAt instanceof Date ? a.createdAt.getTime() / 1000 : 0);
          const timeB = b.createdAt?.seconds || (b.createdAt instanceof Date ? b.createdAt.getTime() / 1000 : 0);
          return timeB - timeA;
        });
        
        setOpportunities(fetchedOpps);
      } catch (err: any) {
        const errInfo = {
          error: err?.message || String(err),
          code: err?.code,
          operation: 'list',
          path: 'opportunities',
          authInfo: {
            userId: auth.currentUser?.uid,
            email: auth.currentUser?.email,
          }
        };
        console.error('Error fetching opportunities:', err);
        console.error('Detailed fetch error:', JSON.stringify(errInfo));
        setError(err.message || 'Failed to fetch opportunities');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  React.useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter) {
      setActiveFilter(filter);
    }
    const query = searchParams.get('q');
    if (query) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch = opp.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         opp.organization?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All' || opp.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-background min-h-screen">
      <SEO 
        title="Find Bursaries & Internships"
        description="Browse our verified database of the latest bursaries, internships, and learnerships across South Africa. Filter by category to find your perfect match."
      />
      {/* Header Area */}
      <section className="bg-white border-b border-slate-100 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-display font-bold text-primary">Browse Opportunities</h1>
              <p className="text-muted">Discover and apply to the latest listings nationwide.</p>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-accent font-medium bg-accent/5 px-4 py-2 rounded-full border border-accent/10">
              <CheckCircle2 className="w-4 h-4" />
              <span>{filteredOpportunities.length} Verified Listings Found</span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-12 flex flex-col lg:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                placeholder="Search by title, company, or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-secondary focus:outline-none transition-shadow hover:shadow-sm"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-6 py-4 rounded-xl font-medium transition-all whitespace-nowrap ${
                    activeFilter === f 
                    ? 'bg-secondary text-white shadow-lg shadow-secondary/20' 
                    : 'bg-white border border-slate-200 text-muted hover:border-secondary/30 hover:text-secondary'
                  }`}
                >
                  {f}
                </button>
              ))}
              <button className="px-5 py-4 rounded-xl border border-slate-200 text-muted hover:bg-slate-50 transition-colors">
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Results Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-10 h-10 text-secondary animate-spin" />
                <p className="text-muted font-medium">Loading opportunities...</p>
              </div>
            ) : error ? (
              <div className="py-20 text-center space-y-6">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 max-w-lg mx-auto">
                  <h3 className="font-bold text-lg mb-2">Connection Error</h3>
                  <p className="text-sm opacity-90">{error}</p>
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all"
                >
                  Retry Connection
                </button>
              </div>
            ) : filteredOpportunities.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredOpportunities.map((opp) => (
                  <motion.div
                    key={opp.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <OpportunityCard opportunity={opp} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-24 text-center space-y-4"
              >
                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-primary">No matching opportunities found</h3>
                <p className="text-muted max-w-xs mx-auto text-sm">
                  Try adjusting your search or filters to find what you are looking for.
                </p>
                <button 
                  onClick={() => {setSearchTerm(''); setActiveFilter('All');}}
                  className="text-secondary font-bold hover:underline pt-4"
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Newsletter / Alert Section */}
      <section className="py-20 bg-primary text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.15),transparent)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-display font-bold mb-4">Never Miss an Opportunity Again.</h2>
            <p className="text-slate-400 mb-8">Sign up for personalized alerts and we'll notify you as soon as opportunities matching your profile are listed.</p>
            <form className="flex flex-col sm:flex-row gap-4" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter your email address..."
                required
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                disabled={isSubscribing || subscribeStatus === 'success'}
                className="flex-grow bg-white/10 border border-white/20 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={isSubscribing || subscribeStatus === 'success'}
                className="btn-secondary !py-4 whitespace-nowrap flex items-center justify-center min-w-[160px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubscribing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : subscribeStatus === 'success' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  'Subscribe to Alerts'
                )}
              </button>
            </form>
            {subscribeStatus === 'success' && (
              <p className="text-emerald-400 text-sm mt-4 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                You've successfully subscribed to alerts!
              </p>
            )}
            {subscribeStatus === 'error' && (
              <p className="text-red-400 text-sm mt-4 font-medium">
                Something went wrong. Please try again.
              </p>
            )}
            <p className="text-[10px] text-slate-500 mt-4">
              By subscribing, you agree to receive email notifications. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
