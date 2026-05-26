import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Building2, ArrowRight, Bookmark } from 'lucide-react';
import { motion } from 'motion/react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  location: string;
  type: string;
  deadline: string;
  logo: string;
  description: string;
  tags: string[];
  createdAt?: any;
  closingDate?: string;
}

import { isOpportunityClosed, getRemainingDaysText } from '../lib/dateUtils';

export default function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const closed = isOpportunityClosed(opportunity.closingDate || opportunity.deadline);
  const remainingText = getRemainingDaysText(opportunity.closingDate || opportunity.deadline);

  return (
    <motion.div
      whileHover={closed ? { y: -1 } : { y: -4 }}
      className={`glass-card overflow-hidden group transition-all duration-300 hover:shadow-xl ${
        closed 
          ? 'opacity-85 border-slate-200/60 shadow-none hover:shadow-sm bg-slate-50/10' 
          : 'hover:border-secondary/20'
      }`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 bg-slate-50 border rounded-lg flex items-center justify-center p-2 group-hover:bg-white transition-colors ${
              closed ? 'filter grayscale opacity-60' : ''
            }`}>
              <img
                src={opportunity.logo}
                alt={opportunity.organization}
                className="max-w-full max-h-full object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(opportunity.organization)}&background=f1f5f9&color=64748b&bold=true`;
                }}
              />
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <span className="opportunity-badge">{opportunity.type}</span>
                {closed ? (
                  <span className="bg-rose-50 text-rose-600 border border-rose-200 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                    Expired
                  </span>
                ) : remainingText !== 'Ongoing' && remainingText !== opportunity.deadline ? (
                  <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    remainingText.includes('today') || remainingText.includes('tomorrow') || remainingText.includes('1 day')
                      ? 'bg-amber-50 text-amber-600 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  }`}>
                    {remainingText}
                  </span>
                ) : null}
              </div>
              <h3 className={`text-lg font-bold group-hover:text-secondary transition-colors line-clamp-1 ${
                closed ? 'text-slate-500 line-through' : ''
              }`}>
                {opportunity.title}
              </h3>
            </div>
          </div>
          <button className="p-2 text-slate-400 hover:text-secondary transition-colors">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>

        <div className={`text-muted text-sm line-clamp-2 mb-6 markdown-body !text-[13px] !leading-relaxed prose-p:my-0 ${
          closed ? 'opacity-70' : ''
        }`}>
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
            {opportunity.description?.replace(/<[^>]*>?/gm, '') || ''}
          </ReactMarkdown>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center text-xs text-muted">
            <Building2 className="w-3.5 h-3.5 mr-2" />
            <span>{opportunity.organization}</span>
          </div>
          <div className="flex items-center text-xs text-muted">
            <MapPin className="w-3.5 h-3.5 mr-2" />
            <span>{opportunity.location}</span>
          </div>
          <div className={`flex items-center text-xs font-semibold ${
            closed ? 'text-rose-600 font-bold' : 'text-slate-500'
          }`}>
            <Calendar className={`w-3.5 h-3.5 mr-2 ${closed ? 'text-rose-500' : 'text-secondary'}`} />
            <span>
              {closed 
                ? `Applications Closed (${opportunity.deadline || 'Expired'})` 
                : `Deadline: ${opportunity.deadline}`}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex flex-wrap gap-1">
            {(opportunity.tags || []).slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] text-slate-400">#{tag}</span>
            ))}
          </div>
          <Link
            to={`/opportunities/${opportunity.id}`}
            className="text-secondary text-sm font-semibold flex items-center group/link"
          >
            <span>{closed ? 'View Archive' : 'View Details'}</span>
            <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover/link:translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
