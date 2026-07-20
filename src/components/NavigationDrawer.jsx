import React from 'react';
import { X, User, History, Thermometer, Search, HelpCircle, AlertTriangle, Database, Trash2, ChevronRight } from 'lucide-react';

export default function NavigationDrawer({
  isOpen,
  onClose,
  userProfile,
  periods,
  onResetData,
  onOpenBbtModal,
  onOpenCycleHistoryModal,
  onOpenHelpPage
}) {
  if (!isOpen) return null;

  const handleClearData = () => {
    const confirmClear = window.confirm(
      "DANGER ZONE WARNING:\n\nIf you clear this data, there is no way to retrieve it. All your logged cycles and daily temperature/mucus history will be permanently deleted.\n\nDo you want to proceed with clearing all data?"
    );
    if (confirmClear) {
      onResetData(true);
      alert('All storage cleared. Relinking to onboarding.');
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Dark backdrop overlay. Clicking it closes the drawer */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-out Panel */}
      <div className="absolute inset-y-0 right-0 max-w-sm w-full bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full transform transition-transform duration-300 animate-slide-in">
        
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600 animate-pulse-slow" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Account & Settings</h3>
              <p className="text-[10px] text-slate-450 font-medium">Logged in locally: {userProfile?.name}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
          
          {/* User Profile Header Summary */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50 p-4 rounded-2xl flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-extrabold shadow-sm text-md">
              {userProfile?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">{userProfile?.name}</h4>
              <p className="text-[11px] text-slate-400 font-medium leading-none mt-0.5">{userProfile?.email}</p>
              <span className="inline-block mt-1.5 px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[9px] font-bold rounded-md leading-none">
                Typical Cycle: {userProfile?.typicalCycleLength} days
              </span>
            </div>
          </div>

          {/* Streamlined Menu Links */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">Application Navigation</h4>
            
            {/* BBT Trends Link */}
            <button
              onClick={() => {
                onClose();
                onOpenBbtModal();
              }}
              className="w-full text-left p-3 rounded-2xl border border-slate-200/80 hover:border-rose-250/60 bg-white hover:bg-rose-50/10 hover:shadow-2xs transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-50 text-rose-500 rounded-xl group-hover:bg-rose-100/70 transition-colors">
                  <Thermometer className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-xs">Basal Body Temperature Trends</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Waking temperature chart shifts</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-350 group-hover:text-slate-550 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* Cycle History Logs Link */}
            <button
              onClick={() => {
                onClose();
                onOpenCycleHistoryModal(0);
              }}
              className="w-full text-left p-3 rounded-2xl border border-slate-200/80 hover:border-indigo-250/60 bg-white hover:bg-indigo-50/10 hover:shadow-2xs transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-650 rounded-xl group-hover:bg-indigo-100/70 transition-colors">
                  <History className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-xs">Logged Cycle History</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Manage and review period dates</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-350 group-hover:text-slate-550 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* Cycle Search Tool Link */}
            <button
              onClick={() => {
                onClose();
                onOpenCycleHistoryModal(1);
              }}
              className="w-full text-left p-3 rounded-2xl border border-slate-200/80 hover:border-emerald-250/60 bg-white hover:bg-emerald-50/10 hover:shadow-2xs transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100/70 transition-colors">
                  <Search className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-xs">Cycle Search & Details</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Explore cycle parameters by date</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-350 group-hover:text-slate-550 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* Help Center & FAQ Link */}
            <button
              onClick={() => {
                onClose();
                onOpenHelpPage();
              }}
              className="w-full text-left p-3 rounded-2xl border border-slate-200/80 hover:border-indigo-250/60 bg-white hover:bg-indigo-50/10 hover:shadow-2xs transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-650 rounded-xl group-hover:bg-indigo-100/70 transition-colors">
                  <HelpCircle className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-xs">Help Center & FAQ</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">Calculations guides & answers</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-350 group-hover:text-slate-550 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>

          {/* Danger Zone & Admin Settings */}
          <div className="mt-auto border-t border-slate-100 pt-5">
            <h4 className="font-bold text-rose-500 text-[10px] uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              Danger Zone
            </h4>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => {
                  onResetData(false);
                  onClose();
                  alert('Loaded sample demonstration data. Refreshed cycles.');
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-200 transition-colors cursor-pointer select-none"
              >
                <Database className="h-3.5 w-3.5 text-slate-500" /> Load Demo Data
              </button>
              
              <button 
                onClick={handleClearData}
                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-rose-250 transition-colors cursor-pointer select-none"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear All Data
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
