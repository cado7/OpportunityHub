import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Linkedin, Facebook, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="bg-secondary p-1 rounded-lg">
                <div className="w-5 h-5 bg-white rounded-sm"></div>
              </div>
              <span className="font-display text-2xl font-bold tracking-tight">
                OppHub<span className="text-secondary">SA</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Empowering South Africa's youth by providing a transparent, accessible, and comprehensive platform for all types of opportunities.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-secondary transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-secondary transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-secondary transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-secondary transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">Explore</h3>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link to="/opportunities?filter=Bursaries" className="hover:text-white transition-colors">Bursaries</Link></li>
              <li><Link to="/opportunities?filter=Internships" className="hover:text-white transition-colors">Internships</Link></li>
              <li><Link to="/opportunities?filter=Graduate%20Programs" className="hover:text-white transition-colors">Graduate Programs</Link></li>
              <li><Link to="/news" className="hover:text-white transition-colors">Latest Trends</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">Resources</h3>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-6">Get in Touch</h3>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-secondary shrink-0" />
                <span>Sandton, Johannesburg, South Africa, 2196</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-secondary shrink-0" />
                <a href="mailto:info@opphubsa.co.za" className="hover:text-white transition-colors">info@opphubsa.co.za</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-slate-500 text-xs">
          <p>© {currentYear} OpportunityHub SA. All rights reserved. Crafted for the future leaders of South Africa.</p>
        </div>
      </div>
    </footer>
  );
}
