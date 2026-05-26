import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Briefcase, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = React.useState('');

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/admin/post');
    } catch (err: any) {
      console.error(err);
      setError('Failed to sign in. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card !bg-white max-w-md w-full p-10 text-center space-y-8"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-secondary p-3 rounded-2xl">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-primary">Admin Access</h1>
          <p className="text-muted text-sm">Sign in to manage and post new opportunities to the platform.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-xs py-3 px-4 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <button 
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center space-x-3 bg-white border border-slate-200 py-4 rounded-xl font-bold text-primary hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98]"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          <span>Continue with Google</span>
        </button>

        <div className="pt-4">
          <button 
            onClick={() => navigate('/')}
            className="text-xs text-muted hover:text-secondary flex items-center justify-center mx-auto transition-colors"
          >
            <ArrowRight className="w-3 h-3 mr-1 rotate-180" />
            Back to Public Site
          </button>
        </div>
      </motion.div>
    </div>
  );
}
