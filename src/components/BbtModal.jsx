import React, { useState, useMemo } from 'react';
import { X, Thermometer, Calendar } from 'lucide-react';
import BbtChart from './BbtChart.jsx';
import { parseDate } from '../utils/dateHelpers.js';

export default function BbtModal({
  isOpen,
  onClose,
  periods,
  dailySymptoms,
  averageCycleLength
}) {
  if (!isOpen) return null;

  // List of all cycles with temperature logs
  const cycles = useMemo(() => {
    return [...periods].reverse();
  }, [periods]);

  // Selected cycle to display on the chart
  const [selectedCycleId, setSelectedCycleId] = useState(cycles[0]?.id || '');

  const selectedCycle = useMemo(() => {
    return cycles.find(c => c.id === selectedCycleId) || cycles[0];
  }, [selectedCycleId, cycles]);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-4 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-rose-500">
            <Thermometer className="h-5 w-5" />
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Waking Temperature Trends</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Cycle Selector */}
        {cycles.length > 1 && (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-150 w-fit">
            <Calendar className="h-4 w-4 text-indigo-500" />
            <span>Select Cycle:</span>
            <select
              value={selectedCycleId}
              onChange={(e) => setSelectedCycleId(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              {cycles.map((c) => {
                const start = parseDate(c.startDate)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) || c.startDate;
                return (
                  <option key={c.id} value={c.id}>
                    Cycle starting {start} {c.isOngoing ? '(Ongoing)' : ''}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Chart View */}
        <div className="mt-2">
          {selectedCycle ? (
            <BbtChart 
              latestPeriod={selectedCycle} 
              dailySymptoms={dailySymptoms} 
              averageCycleLength={averageCycleLength} 
            />
          ) : (
            <div className="text-center py-8 text-slate-400 italic text-xs">
              No cycle logs available to display charts.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 pt-3 mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold select-none cursor-pointer"
          >
            Close Trends
          </button>
        </div>
      </div>
    </div>
  );
}
