import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  LayoutDashboard, 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  PlusCircle, 
  Bold, 
  Italic, 
  List, 
  Link as LinkIcon,
  Calendar,
  MapPin,
  Clock,
  Mail,
  ExternalLink,
  ChevronDown,
  Save,
  Send
} from 'lucide-react';
import { motion } from 'motion/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

export default function AdminPost() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [currentUser, setCurrentUser] = React.useState(auth.currentUser);
  
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);
  
  const [showPreview, setShowPreview] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<{ type: 'error' | 'success', message: string } | null>(null);
  const [formData, setFormData] = React.useState({
    title: '',
    category: 'Learnerships',
    organization: '',
    description: '',
    keyRequirements: '',
    duration: '',
    region: 'Gauteng',
    city: '',
    closingDate: '',
    expectedStartDate: '',
    howToApply: '',
    applicationLink: '',
    contactEmail: '',
    logo: '',
    status: 'draft'
  });

  const categories = ['Learnerships', 'Bursaries', 'Internships', 'Graduate Programs', 'Jobs', 'Courses'];
  const regions = ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'National (Remote)'];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.organization.trim()) newErrors.organization = 'Company name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.howToApply.trim() && !formData.applicationLink.trim()) {
      newErrors.howToApply = 'Application instructions or a link is required';
    }
    if (formData.applicationLink && !formData.applicationLink.startsWith('http')) {
      newErrors.applicationLink = 'Must be a valid URL starting with http:// or https://';
    }
    
    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, newErrors };
  };

  const insertMarkdown = (tag: string, field: keyof typeof formData) => {
    const textarea = document.querySelector(`textarea[name="${field}"]`) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData[field];
    const selected = text.substring(start, end);
    
    let replacement = '';
    let cursorOffset = 0;

    if (tag === 'bold') {
      replacement = `**${selected}**`;
      cursorOffset = 2;
    } else if (tag === 'italic') {
      replacement = `*${selected}*`;
      cursorOffset = 1;
    } else if (tag === 'list') {
      replacement = `\n- ${selected}`;
      cursorOffset = 3;
    } else if (tag === 'link') {
      replacement = `[${selected}](https://)`;
      cursorOffset = 1;
    }

    const newText = text.substring(0, start) + replacement + text.substring(end);
    setFormData(prev => ({ ...prev, [field]: newText }));

    // Refocus with proper range
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + cursorOffset, 
        start + replacement.length - cursorOffset
      );
    }, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleFirestoreError = (error: any, operation: string) => {
    const errInfo = {
      error: error?.message || String(error),
      code: error?.code,
      name: error?.name,
      operation,
      path: 'opportunities',
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous
      }
    };
    console.error('Full Firestore Error Object:', error);
    console.error('Firestore Error Summary:', JSON.stringify(errInfo));
    return new Error(JSON.stringify(errInfo));
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    setSubmitStatus(null);
    if (!currentUser) {
      setSubmitStatus({ type: 'error', message: 'You must be signed in to perform this action.' });
      return;
    }

    const { isValid, newErrors } = validateForm();
    if (status === 'published' && !isValid) {
      const firstError = Object.values(newErrors)[0];
      setSubmitStatus({ type: 'error', message: `Validation Error: ${firstError}` });
      return;
    }

    if (status === 'draft' && !formData.title.trim()) {
      setSubmitStatus({ type: 'error', message: 'Title is required even for drafts.' });
      return;
    }

    setIsSubmitting(true);
    
    // Add a timeout to prevent absolute forever hangs
    const timeoutId = setTimeout(() => {
      if (isSubmitting) {
        setIsSubmitting(false);
        setSubmitStatus({ 
          type: 'error', 
          message: 'Submission is taking longer than expected. Please check your internet connection and try again.' 
        });
      }
    }, 15000);

    const payload = {
      ...formData,
      status,
      authorId: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      logo: formData.logo || `https://logo.clearbit.com/${formData.organization.toLowerCase().replace(/\s+/g, '')}.co.za`
    };
    
    try {
      const docRef = await addDoc(collection(db, 'opportunities'), payload);
      clearTimeout(timeoutId);
      
      setSubmitStatus({ 
        type: 'success', 
        message: `Opportunity ${status === 'published' ? 'published' : 'saved as draft'} successfully! Redirecting...` 
      });
      
      setTimeout(() => {
        navigate('/opportunities');
      }, 1500);
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('Submission failed:', error);
      setSubmitStatus({ 
        type: 'error', 
        message: `Submission failed: ${error.message || 'Unknown error'}. Please ensure you have permission to post.` 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-100 border-r border-slate-200 hidden lg:flex flex-col">
        <div className="p-6">
          <h2 className="font-display font-bold text-xl text-primary">Admin Portal</h2>
          <p className="text-[10px] text-muted uppercase tracking-widest font-bold">Management Console</p>
        </div>

        <nav className="flex-grow px-4 space-y-2">
          {[
            { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
            { icon: FileText, label: 'Postings', path: '/admin/postings', active: true },
            { icon: Users, label: 'Applications', path: '/admin/applications' },
            { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
            { icon: Settings, label: 'Settings', path: '/admin/settings' },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                item.active 
                ? 'bg-accent/10 text-accent' 
                : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-200">
          <button className="flex items-center space-x-3 w-full p-2 hover:bg-slate-200/50 rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden">
              <img src="https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff" alt="User" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-primary">Admin User</p>
              <p className="text-[10px] text-muted">Systems Lead</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-primary" />
              </button>
              <h1 className="text-lg font-bold text-primary font-display">Post New Opportunity</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowPreview(true)}
                className="px-4 py-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Preview
              </button>
              <button 
                onClick={() => handleSubmit('published')}
                disabled={isSubmitting}
                className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>Publish Opportunity</span>
                )}
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto p-8 space-y-8">
          {submitStatus && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`p-4 rounded-xl border ${
                submitStatus.type === 'success' 
                ? 'bg-green-50 border-green-100 text-green-700' 
                : 'bg-red-50 border-red-100 text-red-700'
              } text-sm font-bold flex items-center space-x-3`}
            >
              <div className={`w-2 h-2 rounded-full ${submitStatus.type === 'success' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <span>{submitStatus.message}</span>
            </motion.div>
          )}

          {/* Basic Information */}
          <section className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 shadow-sm">
            <div className="flex items-center space-x-3 text-primary border-b border-slate-50 pb-4">
              <PlusCircle className="w-5 h-5 text-secondary" />
              <h2 className="font-bold">Basic Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Opportunity Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., Graduate Engineering Learnership 2024"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full bg-slate-50 border ${errors.title ? 'border-red-300 bg-red-50' : 'border-slate-100'} rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-medium`}
                />
                {errors.title && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Category</label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-medium"
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Company / Organization</label>
                  <input
                    type="text"
                    name="organization"
                    placeholder="Company Name"
                    value={formData.organization}
                    onChange={handleInputChange}
                    className={`w-full bg-slate-50 border ${errors.organization ? 'border-red-300 bg-red-50' : 'border-slate-100'} rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-medium`}
                  />
                  {errors.organization && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.organization}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Logo URL (Optional)</label>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    name="logo"
                    placeholder="https://example.com/logo.png"
                    value={formData.logo}
                    onChange={handleInputChange}
                    className="flex-grow bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-medium"
                  />
                  {formData.logo && (
                    <div className="w-14 h-14 bg-white border border-slate-100 rounded-xl flex items-center justify-center p-1 shrink-0">
                      <img src={formData.logo} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Opportunity Details */}
          <section className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 shadow-sm">
            <div className="flex items-center space-x-3 text-primary border-b border-slate-50 pb-4">
              <FileText className="w-5 h-5 text-secondary" />
              <h2 className="font-bold">Opportunity Details</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Description</label>
                  <div className={`border ${errors.description ? 'border-red-300' : 'border-slate-100'} rounded-xl overflow-hidden`}>
                    <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center space-x-4">
                      <button type="button" onClick={() => insertMarkdown('bold', 'description')} className="p-1 hover:bg-slate-200 rounded transition-colors group">
                        <Bold className="w-4 h-4 text-slate-500 group-hover:text-secondary" />
                      </button>
                      <button type="button" onClick={() => insertMarkdown('italic', 'description')} className="p-1 hover:bg-slate-200 rounded transition-colors group">
                        <Italic className="w-4 h-4 text-slate-500 group-hover:text-secondary" />
                      </button>
                      <button type="button" onClick={() => insertMarkdown('list', 'description')} className="p-1 hover:bg-slate-200 rounded transition-colors group">
                        <List className="w-4 h-4 text-slate-500 group-hover:text-secondary" />
                      </button>
                      <button type="button" onClick={() => insertMarkdown('link', 'description')} className="p-1 hover:bg-slate-200 rounded transition-colors group">
                        <LinkIcon className="w-4 h-4 text-slate-500 group-hover:text-secondary" />
                      </button>
                    </div>
                    <textarea
                      name="description"
                      rows={10}
                      placeholder="Detailed opportunity description. You can use Markdown for formatting..."
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 focus:outline-none bg-white text-sm leading-relaxed"
                    ></textarea>
                  </div>
                  {errors.description && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.description}</p>}
                </div>

                <div className="hidden lg:block">
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Live Preview (Description)</label>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 h-[290px] overflow-y-auto markdown-body shadow-inner">
                    {formData.description ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                        {formData.description}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-slate-300 italic text-sm">Preview will appear here as you type...</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Key Requirements</label>
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center space-x-4">
                      <Bold 
                        className="w-4 h-4 text-slate-500 cursor-pointer hover:text-secondary transition-colors" 
                        onClick={() => insertMarkdown('bold', 'keyRequirements')}
                      />
                      <Italic 
                        className="w-4 h-4 text-slate-500 cursor-pointer hover:text-secondary transition-colors" 
                        onClick={() => insertMarkdown('italic', 'keyRequirements')}
                      />
                      <List 
                        className="w-4 h-4 text-slate-500 cursor-pointer hover:text-secondary transition-colors" 
                        onClick={() => insertMarkdown('list', 'keyRequirements')}
                      />
                      <LinkIcon 
                        className="w-4 h-4 text-slate-500 cursor-pointer hover:text-secondary transition-colors" 
                        onClick={() => insertMarkdown('link', 'keyRequirements')}
                      />
                    </div>
                    <textarea
                      name="keyRequirements"
                      rows={6}
                      placeholder="Enter list of requirements (Qualifications, Skills, Experience)..."
                      value={formData.keyRequirements}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 focus:outline-none bg-white text-sm"
                    ></textarea>
                  </div>
                </div>

                <div className="hidden lg:block">
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Live Preview (Requirements)</label>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 h-[190px] overflow-y-auto markdown-body shadow-inner">
                    {formData.keyRequirements ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                        {formData.keyRequirements}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-slate-300 italic text-sm">Preview will appear here...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Location & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 shadow-sm">
              <div className="flex items-center space-x-3 text-primary border-b border-slate-50 pb-4">
                <MapPin className="w-5 h-5 text-secondary" />
                <h2 className="font-bold">Location</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Region / Province</label>
                  <div className="relative">
                    <select
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none"
                    >
                      {regions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Specific City (Optional)</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="e.g., Vryheid, KwaZulu-Natal"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none"
                  />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 shadow-sm">
              <div className="flex items-center space-x-3 text-primary border-b border-slate-50 pb-4">
                <Calendar className="w-5 h-5 text-secondary" />
                <h2 className="font-bold">Key Date</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">Closing Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      name="closingDate"
                      value={formData.closingDate}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Application Instructions */}
          <section className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 shadow-sm">
            <div className="flex items-center space-x-3 text-primary border-b border-slate-50 pb-4">
              <ExternalLink className="w-5 h-5 text-secondary" />
              <h2 className="font-bold">Application Instructions</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">How to Apply</label>
                <div className={`border ${errors.howToApply ? 'border-red-300' : 'border-slate-100'} rounded-xl overflow-hidden`}>
                  <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center space-x-4">
                    <button type="button" onClick={() => insertMarkdown('bold', 'howToApply')} className="p-1 hover:bg-slate-200 rounded transition-colors group">
                      <Bold className="w-4 h-4 text-slate-500 group-hover:text-secondary" />
                    </button>
                    <button type="button" onClick={() => insertMarkdown('italic', 'howToApply')} className="p-1 hover:bg-slate-200 rounded transition-colors group">
                      <Italic className="w-4 h-4 text-slate-500 group-hover:text-secondary" />
                    </button>
                    <button type="button" onClick={() => insertMarkdown('list', 'howToApply')} className="p-1 hover:bg-slate-200 rounded transition-colors group">
                      <List className="w-4 h-4 text-slate-500 group-hover:text-secondary" />
                    </button>
                    <button type="button" onClick={() => insertMarkdown('link', 'howToApply')} className="p-1 hover:bg-slate-200 rounded transition-colors group">
                      <LinkIcon className="w-4 h-4 text-slate-500 group-hover:text-secondary" />
                    </button>
                  </div>
                  <textarea
                    name="howToApply"
                    rows={4}
                    placeholder="Provide step-by-step instructions for the applicant..."
                    value={formData.howToApply}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 focus:outline-none bg-white text-sm"
                  ></textarea>
                </div>
                {errors.howToApply && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.howToApply}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Application Link / URL</label>
                  <input
                    type="url"
                    name="applicationLink"
                    placeholder="https://company.portal/apply"
                    value={formData.applicationLink}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Contact Email (Optional)</label>
                  <input
                    type="email"
                    name="contactEmail"
                    placeholder="recruitment@company.co.za"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3.5 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <div className="flex items-center space-x-2 text-accent">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Draft automatically saved at 14:32 PM</span>
            </div>
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <button 
                onClick={() => handleSubmit('draft')}
                disabled={isSubmitting}
                className="flex-grow sm:flex-grow-0 px-8 py-3.5 bg-white border border-slate-200 rounded-xl font-bold text-primary hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Draft'}
              </button>
              <button 
                onClick={() => handleSubmit('published')}
                disabled={isSubmitting}
                className="flex-grow sm:flex-grow-0 px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>Publish Opportunity</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Admin Footer */}
        <footer className="bg-primary text-white py-12 px-8 mt-12">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg">SA Opportunities</h3>
              <p className="text-white/60 text-xs leading-relaxed">
                © 2024 SA Opportunities. Empowering Growth through digital career pathways.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-display font-bold text-sm tracking-widest uppercase">Admin Quick Links</h3>
              <ul className="space-y-2 text-xs text-white/60">
                <li>Documentation</li>
                <li>Support Ticket</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-display font-bold text-sm tracking-widest uppercase">Compliance</h3>
              <ul className="space-y-2 text-xs text-white/60">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
        </footer>
      </main>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 lg:p-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full h-full max-w-6xl rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-primary font-display flex items-center space-x-2">
                <FileText className="w-4 h-4 text-secondary" />
                <span>Opportunity Preview</span>
              </h3>
              <button 
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                id="close-preview"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto bg-slate-50">
              <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
                {/* Simulated Detail Page Content */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                  <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-100 overflow-hidden shrink-0">
                    <img 
                      src={`https://logo.clearbit.com/${formData.organization.toLowerCase().replace(/\s+/g, '')}.co.za`} 
                      alt="Logo" 
                      className="w-16 h-16 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=' + formData.organization.charAt(0);
                      }}
                    />
                  </div>
                  <div className="flex-grow text-center md:text-left space-y-2">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[10px] font-bold uppercase tracking-widest mb-2">
                      <span>{formData.category}</span>
                    </div>
                    <h1 className="text-3xl font-display font-bold text-primary">{formData.title || 'Untitled Opportunity'}</h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>{formData.city ? `${formData.city}, ${formData.region}` : formData.region}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>Created moments ago</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-4">
                      <h2 className="text-xl font-display font-bold text-primary">Overview</h2>
                      <div className="markdown-body">
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                          {formData.description || 'No description provided.'}
                        </ReactMarkdown>
                      </div>
                    </section>

                    <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-4">
                      <h2 className="text-xl font-display font-bold text-primary">Requirements</h2>
                      <div className="markdown-body">
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                          {formData.keyRequirements || 'No requirements listed.'}
                        </ReactMarkdown>
                      </div>
                    </section>
                  </div>

                  <div className="space-y-8">
                    <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6 sticky top-8">
                      <h3 className="font-bold text-primary flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-secondary" />
                        <span>Key Information</span>
                      </h3>
                      <div className="space-y-4">
                        {[
                          { label: 'Closing Date', value: formData.closingDate || 'Ongoing' }
                        ].map(item => (
                          <div key={item.label} className="flex justify-between items-center text-sm">
                            <span className="text-muted">{item.label}</span>
                            <span className="font-bold text-primary">{item.value}</span>
                          </div>
                        ))}
                      </div>
                      <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-amber-500/20">
                        Apply Now (Preview)
                      </button>
                    </section>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border-t flex space-x-4 justify-end">
              <button 
                onClick={() => setShowPreview(false)}
                className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Back to Editor
              </button>
              <button 
                onClick={() => {
                  setShowPreview(false);
                  handleSubmit('published');
                }}
                className="px-6 py-2.5 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/10"
              >
                Publish Now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
