// @ts-nocheck
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
              At OpportunityHub SA, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit and use our website and services.
              By accessing or using OpportunityHub SA, you agree to the collection and use of information in accordance with this Privacy Policy.
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
                  We collect information that you provide directly to us, such as when you subscribe to our newsletter, or contact us for support. This may include:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Name and contact information</li>
                  <li>Subscribe to newsletters or notifications</li>
                  <li>Contact us through forms or email</li>
                  <li>Communication preferences</li>
                  <li>Participate in surveys or feedback requests</li>
                  <li>Any other information you choose to provide</li>
                </ul>
              </div>
              <div className="prose prose-slate max-w-none text-slate-600">
              <p>
                We may also automatically collect certain technical information, including:
              </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>IP address</li>
                  <li>Browser type and version</li>
                  <li>Device information</li>
                  <li>Geolocation data</li>
                  <li>Operating system</li>
                  <li>Pages visited and time spent on each page</li>
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
                  <li>Provide and maintain our services</li>
                  <li>Respond to inquiries and support requestsPersonalize your experience on the platform</li>
                  <li>Send newsletters and notifications you have subscribed to</li>
                  <li>Improve website functionality and user experience</li>
                  <li>Monitor and analyze website performance</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </section>

                        <section>
              <div className="flex items-center space-x-3 mb-4">
                <Lock className="w-6 h-6 text-emerald-500" />
                <h2 className="text-xl font-bold text-slate-900">Cookies and Tracking Technologies</h2>
              </div>
              <div className="prose prose-slate max-w-none text-slate-600">
                <p>
                  OpportunityHub SA uses cookies and similar technologies to improve website performance and user experience.
                </p>
                <p>
                  Cookies may be used to:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Remember user preferences</li>
                  <li>Analyze website traffic</li>
                  <li>Improve website functionality</li>
                  <li>Deliver relevant content and advertisements</li>
                </ul>
                <p>
                  You may disable cookies through your browser settings. However, certain features of the website may not function properly if cookies are disabled.
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="w-6 h-6 text-emerald-500" />
                <h2 className="text-xl font-bold text-slate-900">Advertising Partners</h2>
              </div>
              <p className="text-slate-600">
                OpportunityHub SA may display advertisements provided by third-party advertising partners, including Google AdSense and other advertising networks.

              These advertising partners may use cookies, web beacons, and similar technologies to collect information about your visits to this and other websites in order to provide personalized advertisements.

              Users can learn more about Google's advertising practices through Google's Privacy and Terms policies.
              </p>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="w-6 h-6 text-emerald-500" />
                <h2 className="text-xl font-bold text-slate-900">Data Sharing and Disclosure</h2>
              </div>
              <p className="text-slate-600">
                We do not sell your personal data to third parties. We may share information with service providers who help us operate the platform, or when required by law to comply with legal obligations.
                We do not sell, rent, or trade your personal information to third parties.

                We may share information with:
              </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Service providers who assist in operating the website</li>
                  <li>Analytics providers</li>
                  <li>Email communication platforms</li>
                  <li>Legal authorities when required by law</li>
                  <li>Government agencies when legally obligated</li>
                </ul>
                <p>
                  All third-party service providers are required to protect your information and use it only for authorized purposes.
                </p>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="w-6 h-6 text-emerald-500" />
                <h2 className="text-xl font-bold text-slate-900">Data Security</h2>
              </div>
              <p className="text-slate-600">
                We implement reasonable technical, administrative, and organizational measures to protect personal information against unauthorized access, alteration, disclosure, or destruction.

                While we strive to protect your information, no method of electronic transmission or storage is completely secure. Therefore, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="w-6 h-6 text-emerald-500" />
                <h2 className="text-xl font-bold text-slate-900">Data Security</h2>
              </div>
              <p className="text-slate-600">
                OpportunityHub SA may contain links to external websites, employers, educational institutions, government departments, and other third-party resources.

                We are not responsible for the privacy practices, content, or policies of external websites. Users are encouraged to review the privacy policies of any third-party sites they visit.
              </p>
            </section>

                        <section>
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="w-6 h-6 text-emerald-500" />
                <h2 className="text-xl font-bold text-slate-900">Your Rights</h2>
              </div>
              <p className="text-slate-600">
                In accordance with applicable laws, including the Protection of Personal Information Act (POPIA), you may have the right to:
              </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Request access to your personal information</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of personal information where legally permitted</li>
                  <li>Object to certain processing activities</li>
                  <li>Withdraw consent where applicable</li>
                </ul>
                <p>
                  Requests may be submitted through our Contact Us page or official support email.
                </p>
            </section>
            
            <section>
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="w-6 h-6 text-emerald-500" />
                <h2 className="text-xl font-bold text-slate-900">Children's Privacy</h2>
              </div>
              <p className="text-slate-600">
                OpportunityHub SA is intended for users who are at least 13 years of age. We do not knowingly collect personal information from children under 13 years old.

                If we become aware that information has been collected from a child under 13 without appropriate consent, we will take reasonable steps to remove such information. </p>
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

                        <section>
              <div className="flex items-center space-x-3 mb-4">
                <Bell className="w-6 h-6 text-emerald-500" />
                <h2 className="text-xl font-bold text-slate-900">Contact Us</h2>
              </div>
              <p className="text-slate-600">
                If you have any questions regarding this Privacy Policy or our data practices, please contact us through the Contact Us page on OpportunityHub SA.

By using OpportunityHub SA, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </section>

            <div className="pt-8 border-t border-slate-100 italic text-sm text-slate-400 text-center">
              Last Updated: June 09, 2026
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
