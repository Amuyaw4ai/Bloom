import React, { useState, useMemo } from 'react';
import { Thermometer, Calendar } from 'lucide-react';
import BbtChart from './BbtChart.jsx';
import PageViewLayout from './PageViewLayout.jsx';
import { parseDate } from '../utils/dateHelpers.js';

export default function BbtModal({
  onClose,
  periods,
  dailySymptoms,
  averageCycleLength
}) {
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
    <PageViewLayout
      title="Waking Temperature Trends"
      icon={<Thermometer className="h-5 w-5 text-rose-500" />}
      onBack={onClose}
    >
      <div className="flex flex-col gap-5">
        
        {/* Description */}
        <p className="text-xs text-slate-500 font-medium">
          Visualize your basal body temperature (BBT) logs per cycle to verify thermal shifts confirming ovulation.
        </p>

        {/* Cycle Selector */}
        {cycles.length > 1 && (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 w-fit shadow-3xs">
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
        <div className="mt-2 border border-slate-100/50 p-2 rounded-2xl">
          {selectedCycle ? (
            <BbtChart 
              latestPeriod={selectedCycle} 
              dailySymptoms={dailySymptoms} 
              averageCycleLength={averageCycleLength} 
            />
          ) : (
            <div className="text-center py-12 text-slate-400 italic text-xs">
              No cycle logs available to display charts.
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-end border-t border-slate-100 pt-4 mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold select-none cursor-pointer active:scale-95 transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </PageViewLayout>
  );
}
