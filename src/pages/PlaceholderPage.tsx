import React from 'react';

export default function PlaceholderPage({ name }: { name: string }) {
  return (
    <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-3xl p-12 border text-center space-y-6">
        <h1 className="text-4xl font-display font-bold text-primary">{name}</h1>
        <p className="text-muted text-lg max-w-lg mx-auto">
          We are currently working on this page to provide you with the best experience. Check back soon!
        </p>
        <div className="py-12 flex justify-center">
          <div className="w-16 h-1 w-24 bg-slate-100 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
