import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, GraduationCap, Briefcase, TrendingUp, ArrowRight, ShieldCheck, Zap, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import OpportunityCard, { Opportunity } from '../components/OpportunityCard';
import CareerNews from '../components/CareerNews';
import SEO from '../components/SEO';
import { getClosingDateTimestamp } from '../lib/dateUtils';

export default function Home() {
  const navigate = useNavigate();
  const [featuredOpportunities, setFeaturedOpportunities] = React.useState<Opportunity[]>([]);
  const [heroTrend, setHeroTrend] = React.useState<{ title: string; id: string | null }>({ 
    title: "New: NSFAS 2025 Applications Are Now Open", 
    id: null 
  });
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeOppsCount, setActiveOppsCount] = React.useState<number>(0);
  const [bursariesCount, setBursariesCount] = React.useState<number>(0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/opportunities?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/opportunities');
    }
  };

  React.useEffect(() => {
    // Fetch Hero Banner Trend without triggering manual composite index requirement
    const bannerQuery = query(
      collection(db, 'news'),
      where('isHeroBanner', '==', true),
      limit(10)
    );

    const unsubscribeBanner = onSnapshot(bannerQuery, (snapshot) => {
      if (!snapshot.empty) {
        const sortedDocs = [...snapshot.docs].sort((a, b) => {
          const timeA = a.data().updatedAt?.seconds || 0;
          const timeB = b.data().updatedAt?.seconds || 0;
          return timeB - timeA;
        });
        const doc = sortedDocs[0];
        setHeroTrend({ 
          title: doc.data().title, 
          id: doc.id 
        });
      }
    });

    const q = query(
      collection(db, 'opportunities'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      const publishedData = data.filter(item => item.status === 'published');
      const featuredData = publishedData.length > 0 ? publishedData : data;
      
      const MOCK_OPPS: Opportunity[] = [
        {
          id: 'mock-1',
          title: 'Graduate Internship Programme 2025',
          organization: 'Standard Bank',
          location: 'Vryheid, KwaZulu-Natal',
          type: 'Internships',
          deadline: '30 June 2025',
          logo: 'https://ui-avatars.com/api/?name=Standard+Bank&background=0033aa&color=fff',
          description: 'A comprehensive 12-month internship for graduates in Finance, IT, and Engineering.',
          tags: ['Banking', 'Gauteng']
        },
        {
          id: 'mock-2',
          title: 'NSFAS Bursary Application',
          organization: 'NSFAS',
          location: 'Nationwide',
          type: 'Bursaries',
          deadline: '31 Oct 2025',
          logo: 'https://ui-avatars.com/api/?name=NSFAS&background=dd0000&color=fff',
          description: 'Financial aid for eligible South African students at public universities and TVET colleges.',
          tags: ['Education', 'Funding']
        }
      ];

      const mappedData: Opportunity[] = (featuredData.length > 0 ? featuredData : MOCK_OPPS).map(item => ({
        id: item.id,
        title: item.title,
        organization: item.organization,
        location: item.location || item.region || 'South Africa',
        type: item.type || item.category || 'Opportunity',
        deadline: item.deadline || item.closingDate || 'Ongoing',
        closingDate: item.closingDate || item.deadline || 'Ongoing',
        logo: item.logo || item.organizationImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.organization || 'Org')}&background=random`,
        description: item.description,
        tags: item.tags || [item.category, item.region].filter(Boolean)
      }));

      // Sort by furthest closing date (descending order of score/timestamp)
      mappedData.sort((a, b) => {
        return getClosingDateTimestamp(b.closingDate || b.deadline) - getClosingDateTimestamp(a.closingDate || a.deadline);
      });

      // Calculate dynamic counts for statistics from Firestore
      const liveActiveCount = publishedData.length;
      const liveBursariesCount = publishedData.filter(item => 
        (item.category || item.type || '').toLowerCase() === 'bursaries'
      ).length;

      setActiveOppsCount(liveActiveCount);
      setBursariesCount(liveBursariesCount);

      // Display exactly 4 featured opportunities (closing date is furthest)
      setFeaturedOpportunities(mappedData.slice(0, 4));
      setLoading(false);
    }, (error) => {
      console.error("Firestore error in Home:", error);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      unsubscribeBanner();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted font-medium">Loading OppHub SA...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      label: 'Active Opportunities', 
      value: activeOppsCount > 0 ? `${activeOppsCount}` : '0', 
      icon: Briefcase,
      isLive: true 
    },
    { 
      label: 'Educational Grants', 
      value: bursariesCount > 0 ? `${bursariesCount}` : '0', 
      icon: GraduationCap,
      isLive: true 
    },
    { 
      label: 'Monthly Users', 
      value: '45k+', 
      icon: Users 
    },
    { 
      label: 'Updated Daily',
      value: '24/7',
      icon: RefreshCw 
    },
  ];

  return (
    <div className="space-y-0" id="home-page">
      <SEO 
        title="Bursaries, Internships & Jobs in South Africa"
        description="The most comprehensive database for bursaries, internships, and career opportunities tailored for South African youth. Bridge the gap between today and your professional tomorrow."
        googleVerification="gUiCfUmwysKdUQrurqKDwfKeabo6CdaSgOBN6y6ILps"
      />
      {/* Hero Section */}
      <section className="relative bg-primary pt-24 pb-32 overflow-hidden">
        {/* Abstract Background Accents */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-secondary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-full bg-accent/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-8">
            <Link to={heroTrend.id ? `/news/${heroTrend.id}` : '/news'}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-white/80 text-xs font-medium hover:bg-white/20 transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-secondary" />
                <span>{heroTrend.title}</span>
                <ArrowRight className="w-3 h-3" />
              </motion.div>
            </Link>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-6xl font-display font-bold text-white leading-tight"
            >
              Your Gateway to <span className="text-secondary italic">Future</span> Success.
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-300 leading-relaxed"
            >
              The most comprehensive database for bursaries, internships, and career opportunities tailored for South African youth. Bridge the gap between today and your professional tomorrow.
            </motion.p>
            
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4"
            >
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search and find your future..."
                  className="w-full bg-white text-primary rounded-xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-secondary focus:outline-none shadow-xl"
                />
              </div>
              <button type="submit" className="btn-secondary w-full sm:w-auto !py-4 px-8 text-lg flex items-center justify-center space-x-2">
                <span>Find Opportunities</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.form>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-20">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="w-8 h-8 text-secondary" />
                  {('isLive' in stat && stat.isLive) && (
                    <span className="inline-flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>Live</span>
                    </span>
                  )}
                </div>
                <div className="text-3xl font-display font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-4">
              <span className="text-secondary font-bold tracking-widest text-xs uppercase">Trending Now</span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-primary">Featured Opportunities</h2>
              <p className="text-muted max-w-xl">Curated list of high-impact opportunities with upcoming deadlines. Don't miss your chance to apply.</p>
            </div>
            <Link to="/opportunities" className="text-secondary font-bold flex items-center hover:underline group">
              View All Open Opportunities
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredOpportunities.map((opp) => (
              <div key={opp.id}>
                <OpportunityCard opportunity={opp} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <CareerNews />

      {/* Trust & Verification Section */}
      {/* <section className="py-24 border-y border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-square bg-slate-50 rounded-3xl overflow-hidden shadow-2xl relative">
                <img
                  src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"
                  alt="Students collaborating"
                  className="w-full h-full object-cover grayscale-[0.2] hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523240715632-d984bc4b7906?auto=format&fit=crop&q=80&w=800";
                  }}
                />
                <div className="absolute inset-0 bg-secondary/10"></div>
              </div>
              <div className="absolute -bottom-8 -right-8 glass-card p-8 max-w-xs shadow-2xl">
                <div className="flex items-center space-x-3 mb-4 text-secondary">
                  <ShieldCheck className="w-8 h-8" />
                  <span className="font-bold">Verified Partners</span>
                </div>
                <p className="text-sm text-muted">Each listing is manually verified by our team to ensure legitimacy and prevent scams.</p>
              </div>
            </div>

          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      {/* <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto bg-secondary rounded-[2.5rem] py-16 px-8 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10 space-y-8">
            <h2 className="text-3xl sm:text-5xl font-display font-bold">Ready to Start Your Journey?</h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">Join the 45,000+ South African students who have already found their next step through OppHubSA.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/login" className="w-full sm:w-auto bg-white text-secondary px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-lg">
                Enter Portal
              </Link>
              <Link to="/about" className="w-full sm:w-auto border border-white/30 px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors">
                How it Works
              </Link>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
}
