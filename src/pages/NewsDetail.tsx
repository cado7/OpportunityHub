import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Globe, 
  Calendar, 
  Share2, 
  Bookmark, 
  Clock, 
  ChevronRight,
  Newspaper,
  ExternalLink,
  Loader2,
  Check,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';

interface NewsDetailData {
  id: string;
  title: string;
  content: string;
  summary: string;
  source: string;
  url?: string;
  imageUrl?: string;
  category: string;
  createdAt: any;
}

export default function NewsDetail() {
  const { id } = useParams();
  const [article, setArticle] = React.useState<NewsDetailData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [shareStatus, setShareStatus] = React.useState<'idle' | 'copied'>('idle');
  const [isSaved, setIsSaved] = React.useState(false);

  React.useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'news', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setArticle({
            id: docSnap.id,
            ...data
          } as NewsDetailData);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
    window.scrollTo(0, 0);
  }, [id]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article?.title,
          text: article?.summary,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareStatus('copied');
        setTimeout(() => setShareStatus('idle'), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const unescapeHtml = (text: string) => {
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
          <p className="text-slate-500 font-medium animate-pulse">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto border border-slate-100">
            <Newspaper className="w-10 h-10 text-slate-300" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-primary">Article Not Found</h1>
            <p className="text-muted">The news story you are looking for might have been removed or moved.</p>
          </div>
          <Link 
            to="/news" 
            className="inline-flex items-center space-x-2 text-secondary font-bold hover:translate-x-1 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Career News</span>
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = article.createdAt?.toDate 
    ? article.createdAt.toDate().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Recent';

  // Estimate reading time
  const wordsPerMinute = 200;
  const noOfWords = article.content.split(/\s/g).length;
  const minutes = Math.ceil(noOfWords / wordsPerMinute);
  const readTime = `${minutes} min read`;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Sticky Header Actions */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/news" className="flex items-center space-x-2 text-slate-500 hover:text-primary transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">Back to News</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsSaved(!isSaved)}
              className={`p-2 rounded-xl border transition-all ${
                isSaved ? 'bg-secondary/10 border-secondary/20 text-secondary' : 'border-slate-200 text-slate-400 hover:text-primary hover:border-slate-300'
              }`}
            >
              <Bookmark className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} />
            </button>
            <button 
              onClick={handleShare}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all ${
                shareStatus === 'copied' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'border-slate-200 text-slate-600 hover:text-primary hover:border-slate-300'
              }`}
            >
              {shareStatus === 'copied' ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              <span className="text-xs font-bold uppercase tracking-wider">
                {shareStatus === 'copied' ? 'Copied' : 'Share'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 pt-12">
        {/* Header Section */}
        <header className="space-y-8 mb-12">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[10px] font-bold uppercase tracking-widest">
                {article.category || 'Career News'}
              </span>
              <span className="flex items-center text-slate-400 text-xs font-medium">
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                {readTime}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-primary leading-[1.15]">
              {article.title}
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed italic">
              {article.summary}
            </p>
          </div>

          <div className="flex items-center justify-between py-6 border-y border-slate-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center p-2.5">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(article.source)}&background=random&color=fff`} 
                  alt={article.source}
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wider">{article.source}</p>
                <div className="flex items-center text-slate-400 text-[10px] font-bold uppercase tracking-tighter mt-0.5">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  {formattedDate}
                </div>
              </div>
            </div>
            
            {article.url && (
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-xs font-bold text-secondary hover:underline group"
              >
                <span>Original Source</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {article.imageUrl && (
          <div className="aspect-[21/9] rounded-[2.5rem] overflow-hidden shadow-2xl mb-16 ring-8 ring-white">
            <img 
              src={article.imageUrl} 
              alt={article.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Article Body */}
        <div className="bg-white rounded-[2rem] p-8 sm:p-12 border border-slate-100 shadow-sm">
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>
              {unescapeHtml(article.content)}
            </ReactMarkdown>
          </div>
          
          <div className="mt-16 pt-12 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50 -mx-8 -mb-12 sm:-mx-12 p-8 rounded-b-[2rem]">
            <div className="text-center sm:text-left space-y-1">
              <h4 className="font-bold text-primary">Found this helpful?</h4>
              <p className="text-sm text-slate-500">Share it with your colleagues and peers.</p>
            </div>
            <div className="flex items-center space-x-3">
               <button 
                onClick={handleShare}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center space-x-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
               >
                 <Share2 className="w-4 h-4" />
                 <span>Share Now</span>
               </button>
            </div>
          </div>
        </div>

        {/* Related Navigation */}
        <section className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-primary">Explore More</h2>
            <Link to="/news" className="text-sm font-bold text-secondary flex items-center group">
              View all news
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <Link to="/opportunities" className="glass-card !bg-white p-6 hover:shadow-xl transition-all group border border-slate-100">
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Opportunities</p>
                    <h3 className="font-bold text-primary">Find your next role</h3>
                  </div>
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-colors">
                    <ArrowRight className="w-5 h-5" />
                  </div>
               </div>
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
}
