import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function PageViewLayout({ title, icon, onBack, children }) {
  return (
    <div className="flex-1 max-w-4xl w-full mx-auto py-2 px-1 flex flex-col gap-6 animate-fade-in">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-250 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer select-none active:scale-95"
            title="Return to main dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
          
          <div className="flex items-center gap-2.5">
            {icon && <div className="text-slate-500 shrink-0">{icon}</div>}
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">{title}</h2>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-slate-200/85 p-6 shadow-3xs flex flex-col gap-4">
        {children}
      </div>
      
    </div>
  );
}
