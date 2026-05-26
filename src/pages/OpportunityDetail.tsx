import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Building2, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Share2, 
  Bookmark, 
  ArrowRight, 
  ExternalLink,
  ShieldAlert,
  Loader2,
  Share,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import SEO from '../components/SEO';
import { trackEvent } from '../lib/analytics';
import { isOpportunityClosed, getRemainingDaysText } from '../lib/dateUtils';

// Enhanced detail interface
interface OpportunityDetailData {
  title: string;
  organization: string;
  location: string;
  type: string;
  category: string;
  deadline: string;
  logo: string;
  fullDescription: string;
  duration: string;
  closingDate: string;
  startDate: string;
  responsibilities: string[];
  requirements: { label: string; value: string }[];
  howToApply: string[];
  organizationDescription: string;
  organizationImage: string;
  tags: string[];
  applicationLink: string;
  description: string;
  keyRequirements: string;
  region: string;
  city: string;
  expectedStartDate: string;
  contactEmail: string;
  duties?: string;
  requirementsText?: string;
}

export default function OpportunityDetail() {
  const { id } = useParams();
  const [opp, setOpp] = React.useState<OpportunityDetailData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [shareStatus, setShareStatus] = React.useState<'idle' | 'copied' | 'shared'>('idle');
  const [isSaved, setIsSaved] = React.useState(false);
  const [similarOpps, setSimilarOpps] = React.useState<any[]>([]);

  const handleShare = async () => {
    const shareData = {
      title: opp?.title || 'Check out this opportunity',
      text: `Check out this ${opp?.type} at ${opp?.organization} on SA Opportunities`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus('shared');
        setTimeout(() => setShareStatus('idle'), 2000);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareStatus('copied');
        setTimeout(() => setShareStatus('idle'), 2000);
      }
    } catch (err) {
      // If user cancels social share, don't show error
      if ((err as Error).name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    // In a real app, this would persist to Firestore
  };

  React.useEffect(() => {
    const fetchOpp = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const docRef = doc(db, 'opportunities', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Transform if needed
          setOpp({
            ...data,
            title: data.title,
            organization: data.organization,
            location: data.city ? 
              (data.city.includes(data.region) ? data.city : `${data.city}, ${data.region || ''}`).replace(/, $/, '') : 
              (data.region || 'South Africa'),
            type: data.category,
            category: data.category,
            deadline: data.closingDate ? `Closing on ${data.closingDate}` : 'Ongoing',
            logo: data.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.organization)}&background=f1f5f9&color=64748b&bold=true`,
            fullDescription: data.description,
            duration: data.duration || 'N/A',
            closingDate: data.closingDate || 'Ongoing',
            startDate: data.expectedStartDate || 'N/A',
            // Default sub-arrays if they don't exist in document
            responsibilities: data.responsibilities || [
              'Perform duties as assigned by the supervisor.',
              'Collaborate with team members on key projects.',
              'Ensure all tasks are completed within specified timelines.'
            ],
            requirements: data.requirements && Array.isArray(data.requirements) ? data.requirements : [
              { label: 'Education', value: data.keyRequirements?.slice(0, 50) || 'Relevant Qualification' },
              { label: 'Residency', value: 'South African Citizen' }
            ],
            duties: data.duties,
            requirementsText: typeof data.requirements === 'string' ? data.requirements : null,
            howToApply: data.howToApply ? [data.howToApply] : ['Follow the instructions on the company careers portal.'],
            organizationDescription: data.organizationDescription || `${data.organization} is a leading entity in its sector, committed to developing South African talent.`,
            organizationImage: data.organizationImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
            tags: data.tags || [data.category],
            keyRequirements: data.keyRequirements || null
          } as any);

          // Track specific detailed view
          trackEvent('view_opportunity', {
            opportunityId: id,
            category: data.category
          });

          // Fetch similar opportunities (from same category) to avoid hardcoded mock listings
          if (data.category) {
            try {
              const simQuery = query(
                collection(db, 'opportunities'),
                where('category', '==', data.category),
                limit(12)
              );
              const simSnap = await getDocs(simQuery);
              const simList: any[] = [];
              simSnap.forEach((docSnap) => {
                const simDocData = docSnap.data();
                if (docSnap.id !== id && simDocData.status === 'published') {
                  simList.push({
                    id: docSnap.id,
                    title: simDocData.title,
                    organization: simDocData.organization,
                    location: simDocData.city ? 
                      (simDocData.city.includes(simDocData.region) ? simDocData.city : `${simDocData.city}, ${simDocData.region || ''}`).replace(/, $/, '') : 
                      (simDocData.region || 'South Africa'),
                    deadline: simDocData.closingDate || 'Ongoing',
                  });
                }
              });

              // If we do not have enough from the identical category, fetch other active opportunities as a secondary fallback
              if (simList.length < 3) {
                const backupQuery = query(
                  collection(db, 'opportunities'),
                  limit(12)
                );
                const backupSnap = await getDocs(backupQuery);
                backupSnap.forEach((docSnap) => {
                  const simDocData = docSnap.data();
                  if (
                    docSnap.id !== id && 
                    simDocData.status === 'published' && 
                    !simList.some(item => item.id === docSnap.id)
                  ) {
                    simList.push({
                      id: docSnap.id,
                      title: simDocData.title,
                      organization: simDocData.organization,
                      location: simDocData.city ? 
                        (simDocData.city.includes(simDocData.region) ? simDocData.city : `${simDocData.city}, ${simDocData.region || ''}`).replace(/, $/, '') : 
                        (simDocData.region || 'South Africa'),
                      deadline: simDocData.closingDate || 'Ongoing',
                    });
                  }
                });
              }

              setSimilarOpps(simList.slice(0, 3));
            } catch (simError) {
              console.error('Error fetching similar opportunities:', simError);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching opportunity:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpp();
  }, [id]);

  const unescapeHtml = (text: string) => {
    if (typeof text !== 'string') return text;
    return text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-secondary animate-spin mx-auto" />
          <p className="text-muted font-medium">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!opp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="glass-card !bg-white p-12 text-center max-w-md w-full space-y-6">
          <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-primary">Opportunity Not Found</h1>
          <p className="text-muted">The opportunity you are looking for might have been removed or the link is incorrect.</p>
          <Link to="/opportunities" className="btn-primary inline-block">
            Browse Other Opportunities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <SEO 
        title={opp.title}
        description={opp.fullDescription?.slice(0, 160).replace(/<[^>]*>?/gm, '')}
        ogType="article"
      />
      
      {/* Structured Data (JSON-LD) for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org/",
          "@type": opp.type === "Jobs" ? "JobPosting" : "EducationalOccupationalProgram",
          "title": opp.title,
          "description": opp.fullDescription?.replace(/<[^>]*>?/gm, ''),
          "datePosted": new Date().toISOString(),
          "validThrough": opp.closingDate,
          "hiringOrganization": {
            "@type": "Organization",
            "name": opp.organization,
            "logo": opp.logo
          },
          "jobLocation": {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": opp.city || "Various",
              "addressRegion": opp.region || "South Africa",
              "addressCountry": "ZA"
            }
          }
        })}
      </script>

      {/* Breadcrumbs & Simple Actions */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-muted">
            <Link to="/opportunities" className="hover:text-secondary transition-colors">Opportunities</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-400 truncate max-w-[150px] sm:max-w-none">{opp.title}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleSave}
              className={`flex items-center space-x-2 px-3 py-1.5 border rounded-lg text-xs font-semibold transition-all ${
                isSaved 
                  ? 'bg-secondary/10 text-secondary border-secondary/20' 
                  : 'border-slate-200 text-primary hover:bg-slate-50'
              }`}
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save Opportunity'}</span>
            </button>
            <button 
              onClick={handleShare}
              className={`flex items-center space-x-2 px-3 py-1.5 border rounded-lg text-xs font-semibold transition-all ${
                shareStatus !== 'idle'
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : 'border-slate-200 text-primary hover:bg-slate-50'
              }`}
            >
              {shareStatus === 'copied' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Link Copied!</span>
                </>
              ) : shareStatus === 'shared' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Shared!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {(() => {
          const closed = isOpportunityClosed(opp.closingDate || opp.deadline);
          const remainingText = getRemainingDaysText(opp.closingDate || opp.deadline);

          return (
            <>
              {closed && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-6 flex items-start space-x-3 text-rose-800 animate-slide-in">
                  <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-rose-900">Applications Closed</h4>
                    <p className="text-xs text-rose-700 font-medium mt-1">
                      This opportunity passed its closing date of <span className="font-bold">{opp.closingDate}</span> and is now closed. We keep this page active as an archive for reference, but new submissions are unlikely to be accepted.
                    </p>
                  </div>
                </div>
              )}

              {/* Header Hero Card */}
              <div className={`glass-card !bg-white p-6 sm:p-8 mb-8 ${closed ? 'opacity-90 border-rose-100/50 bg-slate-50/5' : ''}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-start space-x-6">
                    <div className={`w-20 h-20 bg-slate-50 border rounded-2xl flex items-center justify-center p-4 ${closed ? 'filter grayscale opacity-60' : ''}`}>
                      <img 
                        src={opp.logo} 
                        alt={opp.organization} 
                        className="max-w-full max-h-full object-contain" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(opp.organization)}&background=f1f5f9&color=64748b&bold=true`;
                        }}
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-accent/10 text-accent text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md">
                          {opp.type}
                        </span>
                        <span className="bg-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md">
                          {opp.category}
                        </span>
                        {closed && (
                          <span className="bg-rose-100 text-rose-700 border border-rose-100 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md">
                            Archived / Closed
                          </span>
                        )}
                      </div>
                      <h1 className={`text-2xl sm:text-3xl font-display font-bold text-primary leading-tight ${closed ? 'text-slate-500 line-through' : ''}`}>
                        {opp.title}
                      </h1>
                      <div className="flex items-center text-muted font-medium">
                        <span className="hover:text-secondary cursor-pointer transition-colors">{opp.organization}</span>
                        <span className="mx-2">•</span>
                        <span>{opp.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center md:items-end space-y-3">
                    <div className={`flex items-center text-sm font-semibold space-x-2 ${closed ? 'text-rose-500' : 'text-amber-600'}`}>
                      <Clock className="w-4 h-4" />
                      <span>
                        {closed 
                          ? `Closed on ${opp.closingDate}` 
                          : remainingText !== 'Ongoing' && remainingText !== opp.deadline 
                            ? `${opp.deadline} (${remainingText})` 
                            : opp.deadline}
                      </span>
                    </div>
                    {closed ? (
                      <button 
                        disabled
                        className="w-full md:w-auto bg-slate-100 border border-slate-200 text-slate-400 font-bold px-8 py-3.5 rounded-xl text-center cursor-not-allowed select-none"
                      >
                        Applications Closed
                      </button>
                    ) : (
                      <a 
                        href={opp.applicationLink || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={() => {
                          trackEvent('click_apply', {
                            opportunityId: id,
                            category: opp.category
                          });
                        }}
                        className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3.5 rounded-xl text-center shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
                      >
                        Apply Now
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-100">
                  {[
                    { icon: MapPin, label: 'Location', value: opp.location },
                    { icon: Calendar, label: 'Closing Date', value: opp.closingDate }
                  ].map((item, idx) => (
                    <div key={idx} className={`bg-slate-50 p-4 rounded-xl border ${closed && item.label === 'Closing Date' ? 'bg-rose-50/20 border-rose-100/50' : 'border-slate-100/50'}`}>
                      <div className="flex items-center space-x-3 mb-1">
                        <item.icon className={`w-4 h-4 ${closed && item.label === 'Closing Date' ? 'text-rose-400' : 'text-slate-400'}`} />
                        <span className="text-xs text-muted font-medium">{item.label}</span>
                      </div>
                      <div className={`text-sm font-bold pl-7 ${closed && item.label === 'Closing Date' ? 'text-rose-600' : 'text-primary'}`}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          );
        })()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            <section className="glass-card !bg-white p-8 space-y-6">
              <h2 className="text-xl font-display font-bold text-primary">Opportunity Overview</h2>
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>
                  {unescapeHtml(opp.fullDescription || '')}
                </ReactMarkdown>
              </div>
            </section>

            <section className="glass-card !bg-white p-8 space-y-6">
              <h2 className="text-xl font-display font-bold text-primary">Key Responsibilities / Duties</h2>
              {opp.duties ? (
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>
                    {unescapeHtml(opp.duties)}
                  </ReactMarkdown>
                </div>
              ) : (
                <ul className="space-y-4">
                  {opp.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex items-start space-x-4">
                      <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                      <span className="text-muted text-sm leading-relaxed">{resp}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="glass-card !bg-white p-8 space-y-6">
              <h2 className="text-xl font-display font-bold text-primary">Minimum Requirements</h2>
              {opp.requirementsText ? (
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>
                    {unescapeHtml(opp.requirementsText)}
                  </ReactMarkdown>
                </div>
              ) : opp.keyRequirements ? (
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>
                    {unescapeHtml(opp.keyRequirements)}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {opp.requirements.map((req, idx) => (
                    <div key={idx} className="bg-slate-50 p-6 rounded-xl border border-slate-200/50">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 block">{req.label}</span>
                      <p className="text-sm font-bold text-primary leading-tight">{req.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="glass-card !bg-white p-8 space-y-6">
              <h2 className="text-xl font-display font-bold text-primary">How to Apply</h2>
              <div className="space-y-6">
                {opp.howToApply.map((step, idx) => (
                  <div key={idx} className="flex space-x-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {idx + 1}
                    </div>
                    <div className="markdown-body pt-1">
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>
                        {unescapeHtml(step || '')}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-6">
                <a 
                  href={opp.applicationLink || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-5 rounded-2xl flex items-center justify-center space-x-3 shadow-xl shadow-amber-500/20 active:scale-[0.99] transition-all"
                >
                  <span className="text-lg">Proceed to External Application</span>
                  <ExternalLink className="w-5 h-5" />
                </a>
                <p className="text-center text-[10px] text-slate-400 mt-4">
                  You will be redirected to the official employer's website.
                </p>
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            <section className="glass-card !bg-white p-6">
              <h3 className="font-display font-bold text-lg mb-6">About {opp.organization}</h3>
              <div className="rounded-xl overflow-hidden mb-4 border h-40">
                <img 
                  src={opp.organizationImage} 
                  alt={opp.organization} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800";
                  }}
                />
              </div>
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>
                  {unescapeHtml(opp.organizationDescription)}
                </ReactMarkdown>
              </div>
              <button className="text-secondary font-bold text-sm flex items-center hover:underline group">
                <span>View all {opp.organization} opportunities</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </section>

            <section className="glass-card !bg-white p-6">
              <h3 className="font-display font-bold text-lg mb-6">Similar Opportunities</h3>
              <div className="space-y-6">
                {similarOpps.length > 0 ? (
                  similarOpps.map((item, idx) => (
                    <Link key={item.id || idx} to={`/opportunities/${item.id}`} className="group block">
                      <span className="text-[10px] font-bold text-secondary mb-1 block">{item.organization}</span>
                      <h4 className="text-sm font-bold text-primary group-hover:text-secondary transition-colors line-clamp-1">{item.title}</h4>
                      <p className="text-[10px] text-slate-400">{item.location} • {item.deadline}</p>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 font-medium">No matching opportunities found at this time.</p>
                )}
              </div>
            </section>

            <section className="bg-primary rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-display font-bold text-lg">Need Help?</h3>
                <p className="text-xs text-white/60 leading-relaxed mb-2">
                  Experiencing issues with this listing or have a question about the application process?
                </p>
                <button className="w-full bg-white text-primary font-bold py-3 rounded-xl hover:bg-slate-100 transition-colors">
                  Contact Support
                </button>
                <button className="text-[10px] text-white/40 hover:text-white transition-colors flex items-center space-x-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>Report this listing</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
