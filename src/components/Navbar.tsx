import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, Bell, User, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Opportunities', path: '/opportunities' },
    { name: 'About', path: '/about' },
    { name: 'News', path: '/news' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glass-card !rounded-none border-b shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-secondary p-1.5 rounded-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-primary">
              OppHub<span className="text-secondary">SA</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-secondary ${
                  location.pathname === link.path ? 'text-secondary' : 'text-muted'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/dashboard" className="btn-primary flex items-center space-x-2 text-sm !py-1.5">
              <User className="w-4 h-4" />
              <span>Portal</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-primary focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-3 text-base font-medium text-muted hover:text-secondary hover:bg-slate-50 rounded-lg"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t flex flex-col space-y-3">
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="btn-primary w-full text-center"
                >
                  Portal Access
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
