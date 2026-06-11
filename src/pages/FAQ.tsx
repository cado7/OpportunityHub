import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Link as LinkIcon, BookOpen, GraduationCap, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SEO from '../components/SEO';

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'bursaries' | 'careers';
}

const faqs: FAQItem[] = [
  {
    category: 'general',
    question: "What is OpportunityHub SA?",
    answer: "OpportunityHub SA is South Africa's premier transparent digital directory offering curated, verified opportunities including jobs, government bursaries, learnerships, graduate programs, and career trends tailored for South African youth."
  },
  {
    category: 'general',
    question: "Are the opportunity listings on your site verified?",
    answer: "Yes, 100%. Every bursary, internship, learnership, and job posting listed on our platform is thoroughly verified by our content review team to ensure legitimacy. We strictly reference official organization portals to protect you from online and social media employment scams."
  },
  {
    category: 'general',
    question: "Do you charge any fees for applications?",
    answer: "Absolutely not. OpportunityHub SA is completely free to use. We will never ask you for money, bank details, or processing fees. Be extremely cautious of any recruiter asking for application or administration fees."
  },
  {
    category: 'bursaries',
    question: "How do I apply for the bursaries listed here?",
    answer: "Each bursary listing on our platform includes detailed, step-by-step application instructions under the 'How to Apply' section, as well as an official application link leading directly to the donor organization's web portal (e.g., NSFAS, corporate funds, or university portals)."
  },
  {
    category: 'bursaries',
    question: "What documents are commonly required for South African bursaries?",
    answer: "Typically, you'll need certified copies of: (1) Your South African ID, (2) Guardian/Parent IDs, (3) Proof of income or SASSA grant status, (4) Most recent academic record/Matric certificate, and (5) Proof of registration or acceptance at an accredited public university or TVET college."
  },
  {
    category: 'careers',
    question: "What is the difference between an Internship and a Learnership?",
    answer: "An Internship is generally aimed at graduates needing practical experience to supplement an obtained diploma or degree. A Learnership is a highly structured vocational learning program that combines workplace practical experience with theoretical learning, leading to a registered qualification with a SETA (Sector Education and Training Authority)."
  },
  {
    category: 'careers',
    question: "Can OpportunityHub SA influence the outcome of my applications?",
    answer: "No, we cannot influence application outcomes. OpportunityHub SA is an independent information service. We are not corporate or government employers unless explicitly stated, and our role is strictly to organize and present legitimate directory info."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'general' | 'bursaries' | 'careers'>('all');

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFaqs = faqs.filter(
    (faq) => filter === 'all' || faq.category === filter
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <SEO 
        title="Frequently Asked Questions (FAQ)"
        description="Find clear answers to questions regarding South African bursaries, learnerships, internships, application guidelines, and platform verification."
      />

      {/* Hero Header */}
      <section className="relative py-20 bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-flex items-center px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
            FAQ Hub
          </span>
          <h1 className="text-4xl sm:text-6xl font-display font-bold text-white mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Got questions? We've got answers. Find guidelines about applications, bursaries, learnerships, and how our support system operates.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-20 relative z-20">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-10 bg-white p-2.5 rounded-2xl border border-slate-100 shadow-md">
          <button
            onClick={() => { setFilter('all'); setOpenIndex(null); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Questions
          </button>
          <button
            onClick={() => { setFilter('general'); setOpenIndex(null); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              filter === 'general'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>General Platform</span>
          </button>
          <button
            onClick={() => { setFilter('bursaries'); setOpenIndex(null); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              filter === 'bursaries'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Bursaries & Funding</span>
          </button>
          <button
            onClick={() => { setFilter('careers'); setOpenIndex(null); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              filter === 'careers'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Internships & Careers</span>
          </button>
        </div>

        {/* FAQs list */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx} 
                className={`bg-white rounded-2xl border transition-all duration-300 ${
                  isOpen ? 'border-emerald-500 shadow-lg shadow-emerald-500/5' : 'border-slate-100 shadow-sm'
                }`}
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full text-left px-6 py-5 sm:px-8 flex items-center justify-between"
                >
                  <span className="font-bold text-slate-900 pr-4">{faq.question}</span>
                  <div className={`p-1 rounded-lg shrink-0 ${isOpen ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'}`}>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-1 sm:px-8 text-sm text-slate-500 leading-relaxed border-t border-slate-50">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Disclaimer Notice */}
        <div className="mt-12 bg-slate-900 text-slate-400 p-8 rounded-3xl border border-slate-800 text-center relative overflow-hidden">
          <BookOpen className="w-8 h-8 text-emerald-400 mx-auto mb-4" />
          <p className="text-xs uppercase tracking-wider text-emerald-400 font-bold mb-2">Disclaimer</p>
          <p className="text-xs leading-relaxed max-w-xl mx-auto">
            OpportunityHub SA provides information about jobs, bursaries, internships, and learnerships. We are not affiliated with employers unless explicitly stated and cannot influence application outcomes.
          </p>
        </div>
      </section>
    </div>
  );
}
