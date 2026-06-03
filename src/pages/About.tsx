import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Target, 
  Eye, 
  Briefcase, 
  GraduationCap, 
  Lightbulb, 
  ShieldCheck, 
  Mail, 
  ArrowRight,
  Globe,
  MapPin,
  Newspaper,
  Megaphone,
  CheckCircle2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';

const aboutContent = `
# About Us

## Welcome to OpportunityHub SA

**OpportunityHub SA** is a South African digital platform dedicated to connecting people with life-changing opportunities. Our mission is to make access to employment, education, and career development information easier for everyone across South Africa.

We provide the latest:

* Job vacancies
* Internships
* Learnerships
* Scholarships and bursaries
* Government opportunities
* Graduate programmes
* Career development news
* Classified opportunity updates

Our platform was created to help bridge the gap between opportunity providers and job seekers by offering a centralized place where users can discover reliable and up-to-date information.
`;

const sections = [
  {
    title: "Our Mission",
    icon: Target,
    content: "To empower South Africans by providing free, accessible, and reliable career and educational opportunities that help individuals grow professionally and economically.",
    color: "bg-blue-50 text-blue-600"
  },
  {
    title: "Our Vision",
    icon: Eye,
    content: "To become one of South Africa’s leading online platforms for opportunities, career growth, and employment information.",
    color: "bg-emerald-50 text-emerald-600"
  }
];

const offerings = [
  {
    title: "Jobs",
    description: "We publish vacancies from companies, municipalities, government departments, and private organizations across South Africa.",
    icon: Briefcase
  },
  {
    title: "Learnerships & Internships",
    description: "We help students and unemployed youth access workplace training and career development programmes.",
    icon: Lightbulb
  },
  {
    title: "Scholarships & Bursaries",
    description: "We share funding opportunities from universities, government institutions, and private sponsors.",
    icon: GraduationCap
  },
  {
    title: "Career News",
    description: "Stay updated with the latest employment trends, industry news, recruitment updates, and career advice.",
    icon: Newspaper
  },
  {
    title: "Classified Opportunities",
    description: "Discover community opportunities, tenders, skills programmes, training, and development initiatives.",
    icon: Megaphone
  }
];

const commitments = [
  "Providing accurate and timely information",
  "Supporting youth employment and education",
  "Promoting equal access to opportunities",
  "Continuously improving our platform for users"
];

export default function About() {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Header */}
      <section className="relative py-20 overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <span className="inline-block px-4 py-1.5 bg-secondary/20 text-secondary rounded-full text-xs font-bold uppercase tracking-widest">
              Our Story
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight">
              Empowering South Africans <br /> Through Opportunity
            </h1>
          </motion.div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 -mt-12 pb-24">
        {/* Main Intro Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-xl shadow-slate-200/50 border border-slate-100 mb-16"
        >
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} rehypePlugins={[rehypeRaw]}>
              {aboutContent}
            </ReactMarkdown>
          </div>
        </motion.div>

        {/* Mission & Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {sections.map((section, idx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-4"
            >
              <div className={`w-14 h-14 rounded-2xl ${section.color} flex items-center justify-center`}>
                <section.icon className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-primary">{section.title}</h2>
              <p className="text-slate-500 leading-relaxed">{section.content}</p>
            </motion.div>
          ))}
        </div>

        {/* Offerings Section */}
        <div className="space-y-12 mb-16">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-display font-bold text-primary">What We Offer</h2>
            <div className="w-20 h-1.5 bg-secondary mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offerings.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-3">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-primary rounded-[3rem] p-8 md:p-16 text-white mb-16 relative overflow-hidden"
        >
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-display font-bold">Why Choose OpportunityHub SA?</h2>
              <ul className="space-y-4">
                {[
                  "Easy-to-use platform",
                  "Regularly updated opportunities",
                  "Focused on South African content",
                  "Mobile-friendly experience",
                  "Free access to opportunity listings",
                  "Reliable and organized information"
                ].map((point) => (
                  <li key={point} className="flex items-center space-x-3 text-white/80">
                    <ShieldCheck className="w-5 h-5 text-secondary shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center">
                <p className="text-3xl font-bold text-secondary">Free</p>
                <p className="text-xs text-white/60">Access for everyone</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center">
                <p className="text-3xl font-bold text-secondary">Daily</p>
                <p className="text-xs text-white/60">Content updates</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center">
                <p className="text-3xl font-bold text-secondary">RSA</p>
                <p className="text-xs text-white/60">Focused platform</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center">
                <p className="text-3xl font-bold text-secondary">92%</p>
                <p className="text-xs text-white/60">Success rate</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Our Commitment */}
        <section className="mb-16">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-sm">
            <h2 className="text-2xl font-bold text-primary mb-8 text-center">Our Commitment</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {commitments.map((item) => (
                <div key={item} className="flex items-start space-x-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                  <p className="text-slate-600 font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact info card */}
        <section className="bg-white rounded-[2.5rem] p-10 md:p-16 border border-slate-100 shadow-sm text-center space-y-10">
          <div className="space-y-4">
            <h2 className="text-3xl font-display font-bold text-primary">Connect With Us</h2>
            <p className="text-slate-500 max-w-lg mx-auto leading-relaxed">
              OpportunityHub SA is more than just a website — it is a growing community focused on empowerment, growth, and success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-5 h-5 text-secondary" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Email</p>
              <a href="mailto:forescent07@gmail.com" className="text-primary font-bold hover:text-secondary transition-colors">
                forescent07@gmail.com
              </a>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                <Globe className="w-5 h-5 text-secondary" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Website</p>
              <a href="http://www.opportunityhubsa.co.za" target="_blank" rel="noreferrer" className="text-primary font-bold hover:text-secondary transition-colors">
                www.opportunityhub-sa.co.za
              </a>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="w-5 h-5 text-secondary" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Location</p>
              <p className="text-primary font-bold">South Africa</p>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-50">
            <p className="text-primary font-bold text-lg mb-6">Your future starts with the right opportunity.</p>
            <Link to="/opportunities" className="inline-block">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-secondary text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-secondary/30 flex items-center space-x-2 mx-auto"
              >
                <span>Explore Opportunities</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
