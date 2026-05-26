import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Eye, FileText, Bell } from 'lucide-react';
import SEO from '../components/SEO';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <SEO 
        title="Privacy Policy"
        description="Learn how we collect, use, and protect your personal information on OpportunityHub SA."
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden"
        >
          <div className="bg-primary p-8 md:p-12 text-white">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-secondary/20 p-3 rounded-2xl">
                <Shield className="w-8 h-8 text-secondary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold">Privacy Policy</h1>
            </div>
            <p className="text-slate-300 text-lg max-w-2xl">
              Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information when you use OpportunityHub SA.
            </p>
          </div>

          <div className="p-8 md:p-12 space-y-12">
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Eye className="w-6 h-6 text-emerald-500" />
                <h2 className="text-xl font-bold text-slate-900">Information We Collect</h2>
              </div>
              <div className="prose prose-slate max-w-none text-slate-600">
                <p>
                  We collect information that you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact us for support. This may include:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Name and contact information</li>
                  <li>Account credentials</li>
                  <li>Profile information (career interests, education level)</li>
                  <li>Communication preferences</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Lock className="w-6 h-6 text-emerald-500" />
                <h2 className="text-xl font-bold text-slate-900">How We Use Your Data</h2>
              </div>
              <div className="prose prose-slate max-w-none text-slate-600">
                <p>
                  Your information is used to provide and improve our services, including:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Personalizing your opportunity feed</li>
                  <li>Sending relevant notifications about new bursaries or jobs</li>
                  <li>Responding to your inquiries and providing support</li>
                  <li>Analyzing platform usage to improve user experience</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="w-6 h-6 text-emerald-500" />
                <h2 className="text-xl font-bold text-slate-900">Data Sharing</h2>
              </div>
              <p className="text-slate-600">
                We do not sell your personal data to third parties. We may share information with service providers who help us operate the platform, or when required by law to comply with legal obligations.
              </p>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <Bell className="w-6 h-6 text-emerald-500" />
                <h2 className="text-xl font-bold text-slate-900">Updates to This Policy</h2>
              </div>
              <p className="text-slate-600">
                We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <div className="pt-8 border-t border-slate-100 italic text-sm text-slate-400 text-center">
              Last Updated: May 19, 2024
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
