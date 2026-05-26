import React from 'react';
import { motion } from 'motion/react';
import { Gavel, CheckCircle, AlertCircle, FileText, ShieldAlert } from 'lucide-react';
import SEO from '../components/SEO';

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <SEO 
        title="Terms & Conditions"
        description="Read the terms and conditions for using the OpportunityHub SA platform."
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl shadow-shadow-slate-200/50 overflow-hidden"
        >
          <div className="bg-primary p-8 md:p-12 text-white">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-secondary/20 p-3 rounded-2xl">
                <Gavel className="w-8 h-8 text-secondary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold">Terms & Conditions</h1>
            </div>
            <p className="text-slate-300 text-lg max-w-2xl">
              Please read these terms and conditions carefully before using our platform. By accessing OpportunityHub SA, you agree to be bound by these terms.
            </p>
          </div>

          <div className="p-8 md:p-12 space-y-12">
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                <h2 className="text-xl font-bold text-slate-900">Acceptance of Terms</h2>
              </div>
              <p className="text-slate-600">
                By using OpportunityHub SA, you represent that you are at least 13 years of age and have the legal authority to enter into this agreement. If you do not agree to these terms, you must not access or use the platform.
              </p>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="w-6 h-6 text-emerald-500" />
                <h2 className="text-xl font-bold text-slate-900">Use of Service</h2>
              </div>
              <div className="prose prose-slate max-w-none text-slate-600">
                <p>
                  You agree to use the service only for lawful purposes and in a way that does not infringe the rights of others. Prohibited activities include:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Posting false or misleading opportunity information</li>
                  <li>Attempting to gain unauthorized access to our systems</li>
                  <li>Using the platform for any fraudulent or illegal activity</li>
                  <li>Harassing or harming other users</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="w-6 h-6 text-emerald-500" />
                <h2 className="text-xl font-bold text-slate-900">Intellectual Property</h2>
              </div>
              <p className="text-slate-600">
                All content on this platform, including text, graphics, logos, and software, is the property of OpportunityHub SA or its content suppliers and is protected by international copyright laws.
              </p>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <ShieldAlert className="w-6 h-6 text-emerald-500" />
                <h2 className="text-xl font-bold text-slate-900">Limitation of Liability</h2>
              </div>
              <p className="text-slate-600">
                OpportunityHub SA is provided "as is" without any warranties. We are not liable for any direct, indirect, or incidental damages arising out of your use of the platform or the accuracy of the opportunities posted by third parties.
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
