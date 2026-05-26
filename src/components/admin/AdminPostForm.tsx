import React from 'react';
import { 
  ArrowLeft, 
  FileText, 
  PlusCircle, 
  Bold, 
  Italic, 
  List, 
  Link as LinkIcon,
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  ChevronDown,
  Briefcase
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';

interface AdminPostFormProps {
  opportunityId?: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AdminPostForm({ opportunityId, onSuccess, onCancel }: AdminPostFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [loading, setLoading] = React.useState(!!opportunityId);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<{ type: 'error' | 'success', message: string } | null>(null);
  
  const [formData, setFormData] = React.useState({
    title: '',
    category: 'Learnerships',
    organization: '',
    logo: '',
    description: '',
    requirements: '',
    duties: '',
    keyRequirements: '',
    duration: '',
    region: 'Gauteng',
    city: '',
    closingDate: '',
    expectedStartDate: '',
    howToApply: '',
    applicationLink: '',
    contactEmail: '',
    status: 'draft'
  });

  const categories = ['Learnerships', 'Bursaries', 'Internships', 'Graduate Programs', 'Jobs', 'Courses'];
  const regions = ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'National (Remote)'];

  React.useEffect(() => {
    if (opportunityId) {
      const fetchOpp = async () => {
        try {
          const docRef = doc(db, 'opportunities', opportunityId);
          const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              setFormData(prev => ({ ...prev, ...docSnap.data() }));
            }
        } catch (error) {
          console.error('Error fetching:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchOpp();
    }
  }, [opportunityId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.organization.trim()) newErrors.organization = 'Company name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, newErrors };
  };

  const insertMarkdown = (tag: string, field: keyof typeof formData) => {
    const textarea = document.querySelector(`textarea[name="${field}"]`) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData[field] as string;
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
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    setSubmitStatus(null);
    const user = auth.currentUser;
    if (!user) {
      setSubmitStatus({ type: 'error', message: 'You must be signed in.' });
      return;
    }

    const { isValid } = validateForm();
    if (status === 'published' && !isValid) {
      setSubmitStatus({ type: 'error', message: 'Please fix validation errors.' });
      return;
    }

    setIsSubmitting(true);
    
    const timeoutId = setTimeout(() => {
      if (isSubmitting) {
        setIsSubmitting(false);
        setSubmitStatus({ 
          type: 'error', 
          message: 'Submission is taking too long. Please check your connection.' 
        });
      }
    }, 15000);

    const payload = {
      ...formData,
      status,
      authorId: user.uid,
      updatedAt: serverTimestamp(),
      logo: formData.logo || `https://logo.clearbit.com/${formData.organization.toLowerCase().replace(/\s+/g, '')}.co.za`
    };
    
    try {
      if (opportunityId) {
        await updateDoc(doc(db, 'opportunities', opportunityId), payload);
      } else {
        await addDoc(collection(db, 'opportunities'), {
          ...payload,
          createdAt: serverTimestamp()
        });
      }
      clearTimeout(timeoutId);
      
      setSubmitStatus({ 
        type: 'success', 
        message: `Opportunity ${opportunityId ? 'updated' : 'created'} successfully!` 
      });
      
      setTimeout(onSuccess, 1000);
    } catch (error: any) {
      clearTimeout(timeoutId);
      setSubmitStatus({ 
        type: 'error', 
        message: `Failed: ${error.message}` 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between mb-8 group">
        <button onClick={onCancel} className="flex items-center space-x-2 text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold">Back to Postings</span>
        </button>
        <div className="flex space-x-3">
          <button onClick={() => setShowPreview(true)} className="px-6 py-2 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all">
            Preview
          </button>
          <button 
            onClick={() => handleSubmit('published')}
            disabled={isSubmitting}
            className="bg-emerald-500 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Working...</span>
              </>
            ) : (
              <span>{opportunityId ? 'Update & Publish' : 'Publish Opportunity'}</span>
            )}
          </button>
        </div>
      </div>

      {submitStatus && (
        <div className={`p-4 rounded-xl border ${submitStatus.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'} text-sm font-bold`}>
          {submitStatus.message}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-8">
        <section className="space-y-6">
          <div className="flex items-center space-x-3 text-slate-900 pb-4 border-b border-slate-50">
            <PlusCircle className="w-5 h-5 text-emerald-500" />
            <h2 className="font-bold">Opportunity Information</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Opportunity Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="e.g. Software Development Internship"
              />
              {errors.title && <p className="text-red-500 text-[10px] mt-1">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Organization</label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none"
                  placeholder="e.g. Standard Bank"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Logo URL (Optional)</label>
              <div className="flex space-x-4">
                <input
                  type="text"
                  name="logo"
                  value={formData.logo}
                  onChange={handleInputChange}
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none"
                  placeholder="https://example.com/logo.png"
                />
                {formData.logo && (
                  <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center p-1">
                    <img src={formData.logo} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center space-x-3 text-slate-900 pb-4 border-b border-slate-50">
            <FileText className="w-5 h-5 text-emerald-500" />
            <h2 className="font-bold">Detailed Description</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="bg-slate-50 border border-slate-100 rounded-t-xl px-4 py-2 flex space-x-4 border-b-0">
                <Bold className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => insertMarkdown('bold', 'description')} />
                <Italic className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => insertMarkdown('italic', 'description')} />
                <List className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => insertMarkdown('list', 'description')} />
                <LinkIcon className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => insertMarkdown('link', 'description')} />
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={10}
                className="w-full border border-slate-100 rounded-b-xl px-4 py-4 focus:outline-none resize-none text-sm leading-relaxed"
                placeholder="Core description of the opportunity..."
              ></textarea>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center space-x-3 text-slate-900 pb-4 border-b border-slate-50">
            <List className="w-5 h-5 text-emerald-500" />
            <h2 className="font-bold">Requirements</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="bg-slate-50 border border-slate-100 rounded-t-xl px-4 py-2 flex space-x-4 border-b-0">
                <Bold className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => insertMarkdown('bold', 'requirements')} />
                <Italic className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => insertMarkdown('italic', 'requirements')} />
                <List className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => insertMarkdown('list', 'requirements')} />
                <LinkIcon className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => insertMarkdown('link', 'requirements')} />
              </div>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                rows={6}
                className="w-full border border-slate-100 rounded-b-xl px-4 py-4 focus:outline-none resize-none text-sm leading-relaxed"
                placeholder="List the key requirements..."
              ></textarea>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center space-x-3 text-slate-900 pb-4 border-b border-slate-50">
            <FileText className="w-5 h-5 text-emerald-500" />
            <h2 className="font-bold">Duties & Responsibilities</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="bg-slate-50 border border-slate-100 rounded-t-xl px-4 py-2 flex space-x-4 border-b-0">
                <Bold className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => insertMarkdown('bold', 'duties')} />
                <Italic className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => insertMarkdown('italic', 'duties')} />
                <List className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => insertMarkdown('list', 'duties')} />
                <LinkIcon className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => insertMarkdown('link', 'duties')} />
              </div>
              <textarea
                name="duties"
                value={formData.duties}
                onChange={handleInputChange}
                rows={6}
                className="w-full border border-slate-100 rounded-b-xl px-4 py-4 focus:outline-none resize-none text-sm leading-relaxed"
                placeholder="What will the successful candidate do daily?..."
              ></textarea>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="space-y-6">
            <div className="flex items-center space-x-3 text-slate-900 pb-4 border-b border-slate-50">
              <MapPin className="w-5 h-5 text-emerald-500" />
              <h2 className="font-bold">Location</h2>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none"
                >
                  {regions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none"
                placeholder="e.g., Vryheid, KwaZulu-Natal"
              />
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center space-x-3 text-slate-900 pb-4 border-b border-slate-50">
              <Calendar className="w-5 h-5 text-emerald-500" />
              <h2 className="font-bold">Date</h2>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Closing Date</label>
                <input
                  type="date"
                  name="closingDate"
                  value={formData.closingDate}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none"
                />
              </div>
            </div>
          </section>
        </div>

        <section className="space-y-6">
          <div className="flex items-center space-x-3 text-slate-900 pb-4 border-b border-slate-50">
            <ExternalLink className="w-5 h-5 text-emerald-500" />
            <h2 className="font-bold">Application</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="applicationLink"
              value={formData.applicationLink}
              onChange={handleInputChange}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none"
              placeholder="Application URL"
            />
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleInputChange}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:outline-none"
              placeholder="Contact Email"
            />
          </div>
        </section>

        <div className="flex justify-end space-x-4 pt-8">
          <button 
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
            className="px-8 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Save as Draft
          </button>
          <button 
            onClick={() => handleSubmit('published')}
            disabled={isSubmitting}
            className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 disabled:opacity-50"
          >
            {opportunityId ? 'Update Posting' : 'Publish Opportunity'}
          </button>
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-50 w-full max-w-5xl h-full rounded-[40px] shadow-2xl flex flex-col overflow-hidden relative border border-white"
          >
            <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Live Preview</h3>
              <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-12">
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm flex items-start space-x-8">
                  <div className="w-24 h-24 bg-slate-50 rounded-2xl border border-slate-50 flex items-center justify-center">
                    <Briefcase className="w-12 h-12 text-slate-300" />
                  </div>
                  <div className="space-y-4">
                    <span className="px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest">{formData.category}</span>
                    <h1 className="text-4xl font-bold text-slate-900">{formData.title || 'Untitled'}</h1>
                    <p className="text-slate-500 font-medium">{formData.organization}</p>
                  </div>
                </div>
                <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm markdown-body space-y-8">
                   <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b">Description</h2>
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>
                      {formData.description || 'No description yet...'}
                    </ReactMarkdown>
                  </div>
 
                   {formData.requirements && (
                     <div>
                       <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b">Requirements</h2>
                       <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>
                         {formData.requirements}
                       </ReactMarkdown>
                     </div>
                   )}
 
                   {formData.duties && (
                     <div>
                       <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b">Duties & Responsibilities</h2>
                       <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>
                         {formData.duties}
                       </ReactMarkdown>
                     </div>
                   )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
