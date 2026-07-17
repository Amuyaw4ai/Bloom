import React, { useState, useMemo, useEffect } from 'react';
import { X, History, Search, Plus, Edit2, Trash2, Calendar, Droplet, Thermometer, Info } from 'lucide-react';
import { parseDate, getDaysBetween, addDays } from '../utils/dateHelpers.js';
import { getDayClassification } from '../utils/cycleEngine.js';

export default function CycleHistoryModal({
  isOpen,
  onClose,
  periods,
  analyzedCycles,
  projectedCycles,
  dailySymptoms,
  averageCycleLength,
  onOpenAddPeriod,
  onOpenEditPeriod,
  onDeletePeriod,
  initialTab = 0,
  todayStr
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync tab when opening
  useEffect(() => {
    setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  // Combine cycles chronologically
  const allCyclesList = useMemo(() => {
    const list = [];
    if (analyzedCycles) {
      analyzedCycles.forEach((c, idx) => {
        list.push({
          id: c.id || `analyzed-${idx}`,
          startDate: c.startDate,
          endDate: c.endDate,
          isOngoing: c.isOngoing,
          isProjection: false,
          cycleLength: c.cycleLength || averageCycleLength || 28,
          index: idx + 1
        });
      });
    }
    if (projectedCycles) {
      projectedCycles.forEach((p, idx) => {
        list.push({
          id: `projected-${idx}`,
          startDate: p.startDate,
          endDate: p.endDate,
          isOngoing: false,
          isProjection: true,
          cycleLength: averageCycleLength || 28,
          index: (analyzedCycles?.length || 0) + idx + 1
        });
      });
    }
    // Reverse sort so newest cycles are first in the list
    return list.sort((a, b) => b.startDate.localeCompare(a.startDate));
  }, [analyzedCycles, projectedCycles, averageCycleLength]);

  // Search States
  const [selectedCycleId, setSelectedCycleId] = useState(allCyclesList[0]?.id || '');
  const [searchDate, setSearchDate] = useState('');

  // Find cycle currently active or containing date
  const selectedCycle = useMemo(() => {
    return allCyclesList.find(c => c.id === selectedCycleId) || allCyclesList[0];
  }, [selectedCycleId, allCyclesList]);

  // Search date trigger
  const handleSearchDateChange = (e) => {
    const dVal = e.target.value;
    setSearchDate(dVal);
    if (!dVal) return;

    // Find cycle containing searchDate
    const containing = allCyclesList.find(c => {
      if (searchDate >= c.startDate) {
        if (!c.endDate || dVal <= c.endDate) return true;
        // If it overlaps with next cycle start, it belongs to the next.
        // We find the cycle that fits chronologically.
      }
      return false;
    });

    // Let's refine the containment check:
    // A cycle starting at c.startDate contains dVal if dVal >= c.startDate and (no other cycle starts between c.startDate and dVal)
    const exactContaining = [...allCyclesList]
      .reverse() // sort oldest to newest for forward check
      .find((c, idx, arr) => {
        const nextC = arr[idx + 1];
        if (dVal >= c.startDate) {
          if (!nextC || dVal < nextC.startDate) return true;
        }
        return false;
      });

    if (exactContaining) {
      setSelectedCycleId(exactContaining.id);
    }
  };

  // Generate breakdown of days for the selected cycle
  const cycleDays = useMemo(() => {
    if (!selectedCycle) return [];
    
    const days = [];
    const len = selectedCycle.cycleLength;
    
    for (let i = 0; i < len; i++) {
      const dateStr = addDays(selectedCycle.startDate, i);
      const classification = getDayClassification(dateStr, analyzedCycles, projectedCycles, todayStr);
      const symptoms = dailySymptoms[dateStr] || {};
      
      days.push({
        dateStr,
        dayNumber: i + 1,
        classification,
        symptoms
      });
    }
    return days;
  }, [selectedCycle, analyzedCycles, projectedCycles, dailySymptoms, todayStr]);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full p-6 shadow-2xl flex flex-col gap-4 animate-scale-up max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-rose-500">
            <History className="h-5 w-5" />
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Cycle History & Search Center</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs navigation */}
        <div className="flex border-b border-slate-100 p-0.5 bg-slate-50 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab(0)}
            className={`px-4 py-1.5 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${
              activeTab === 0 
                ? 'bg-white text-slate-800 shadow-3xs border border-slate-200/50' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Logged Cycles ({periods.length})
          </button>
          <button
            onClick={() => setActiveTab(1)}
            className={`px-4 py-1.5 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${
              activeTab === 1 
                ? 'bg-white text-slate-800 shadow-3xs border border-slate-200/50' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Cycle Search & Details
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto min-h-[300px] pr-1">
          
          {/* TAB 1: Logged Cycles */}
          {activeTab === 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-550">
                  Review, edit, or delete your historical logged cycles.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAddPeriod();
                  }}
                  className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[11px] font-bold shadow-2xs cursor-pointer flex items-center gap-1 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Log Period Cycle
                </button>
              </div>

              <div className="flex flex-col gap-2.5">
                {periods.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 italic text-xs border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                    No period logs recorded yet. Click "Log Period Cycle" to get started.
                  </div>
                ) : (
                  [...periods].reverse().map((period, index) => {
                    const idx = periods.length - index;
                    const duration = period.isOngoing
                      ? getDaysBetween(period.startDate, todayStr) + 1
                      : getDaysBetween(period.startDate, period.endDate) + 1;
                    return (
                      <div 
                        key={period.id} 
                        className={`flex items-center justify-between p-4 border rounded-2xl text-xs hover:bg-slate-50/50 transition-colors ${
                          period.isOngoing 
                            ? 'bg-rose-50/40 border-rose-200 shadow-3xs' 
                            : 'bg-slate-50/60 border-slate-200/80'
                        }`}
                      >
                        <div>
                          <div className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                            <span>Cycle #{idx}</span>
                            {period.isOngoing && (
                              <span className="text-rose-500 font-bold animate-pulse text-[9px] uppercase tracking-wider bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 leading-none">
                                Active / Ongoing
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 mt-1 font-medium">
                            Starts: {parseDate(period.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div className="text-slate-400 mt-0.5 text-[11px]">
                            {period.isOngoing ? (
                              <>Ongoing bleeding for {duration} days</>
                            ) : (
                              <>Ends: {parseDate(period.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 font-bold border rounded-lg text-[10px] shadow-3xs ${
                            period.isOngoing 
                              ? 'bg-rose-500 text-white border-rose-600' 
                              : 'bg-rose-50 text-rose-600 border-rose-100'
                          }`}>
                            {duration} {period.isOngoing ? 'Days Active' : 'Days Period'}
                          </span>
                          <button
                            onClick={() => {
                              onClose();
                              onOpenEditPeriod(period);
                            }}
                            className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-colors cursor-pointer"
                            title="Edit dates"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onDeletePeriod(period.id)}
                            className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
                            title="Delete log"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Cycle Search */}
          {activeTab === 1 && (
            <div className="flex flex-col gap-4">
              {/* Search fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-200/50 rounded-2xl">
                {/* Select dropdown */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Cycle</label>
                  <select
                    value={selectedCycleId}
                    onChange={(e) => setSelectedCycleId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
                  >
                    {allCyclesList.map((c) => {
                      const date = parseDate(c.startDate);
                      const dateStr = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : c.startDate;
                      const badge = c.isOngoing ? ' (Active)' : c.isProjection ? ' (Predicted)' : ' (Completed)';
                      return (
                        <option key={c.id} value={c.id}>
                          Cycle #{c.index}: {dateStr}{badge}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Date lookup */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search Date</label>
                  <input
                    type="date"
                    value={searchDate}
                    onChange={handleSearchDateChange}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Cycle Card Detail Summary */}
              {selectedCycle ? (
                <div className="flex flex-col gap-4">
                  {/* Summary Card Header */}
                  <div className="bg-gradient-to-br from-indigo-50/60 to-purple-50/60 border border-indigo-100/50 p-4 rounded-2xl flex justify-between flex-wrap gap-4 items-center">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                        <Calendar className="h-4.5 w-4.5 text-indigo-500" />
                        Cycle starting {parseDate(selectedCycle.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </h4>
                      <p className="text-[11px] font-medium text-indigo-600 mt-1 uppercase tracking-wider">
                        {selectedCycle.isOngoing ? 'Ongoing active cycle' : selectedCycle.isProjection ? 'Predicted future cycle' : 'Completed historical cycle'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Cycle length</span>
                        <span className="text-sm font-extrabold text-slate-700">{selectedCycle.cycleLength} Days</span>
                      </div>
                    </div>
                  </div>

                  {/* Days Details Breakdown */}
                  <div>
                    <h5 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider mb-2">Cycle Days List</h5>
                    <div className="border border-slate-200/60 rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase border-b border-slate-200/60">
                            <th className="p-3 pl-4">Cycle Day</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Classification</th>
                            <th className="p-3 pr-4">Logs / Symptoms</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                          {cycleDays.map(({ dateStr, dayNumber, classification, symptoms }) => {
                            const isSearchTarget = searchDate === dateStr;
                            const hasTemp = symptoms.temp !== undefined;
                            const hasMucus = symptoms.mucusTexture;
                            const hasWarning = symptoms.vaginalItching || symptoms.soreness || symptoms.foulOdor;
                            
                            let classText = 'Safe Day';
                            let badgeStyle = 'bg-slate-50 text-slate-600 border-slate-200';
                            if (classification.type === 'PERIOD') {
                              classText = 'Period Bleeding';
                              badgeStyle = 'bg-rose-500 text-white border-rose-500';
                            } else if (classification.type === 'OVULATION') {
                              classText = 'Ovulation Day';
                              badgeStyle = 'bg-emerald-500 text-white border-emerald-500';
                            } else if (classification.type === 'UNSAFE') {
                              classText = 'Fertile Window (High)';
                              badgeStyle = 'bg-amber-100 text-amber-900 border-amber-300';
                            } else if (classification.type === 'PREDICTED_PERIOD') {
                              classText = 'Predicted Period';
                              badgeStyle = 'bg-rose-50 text-rose-800 border-rose-200 border-dashed';
                            } else if (classification.type === 'PREDICTED_OVULATION') {
                              classText = 'Predicted Ovulation';
                              badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200 border-dashed';
                            } else if (classification.type === 'PREDICTED_UNSAFE') {
                              classText = 'Predicted Fertile';
                              badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200 border-dashed';
                            }

                            return (
                              <tr 
                                key={dateStr}
                                className={`transition-colors ${
                                  isSearchTarget 
                                    ? 'bg-indigo-50/50 hover:bg-indigo-50/70 border-y border-indigo-200/50' 
                                    : 'hover:bg-slate-50/40'
                                }`}
                              >
                                <td className="p-3 pl-4 font-bold text-slate-800">
                                  Day {dayNumber}
                                  {isSearchTarget && (
                                    <span className="ml-1.5 text-[9px] font-extrabold uppercase tracking-wide bg-indigo-200 text-indigo-800 px-1 py-0.5 rounded leading-none">
                                      Searched
                                    </span>
                                  )}
                                </td>
                                <td className="p-3">
                                  {parseDate(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="p-3">
                                  <span className={`inline-block px-2 py-0.5 border text-[10px] font-bold rounded-md leading-none ${badgeStyle}`}>
                                    {classText}
                                  </span>
                                </td>
                                <td className="p-3 pr-4 text-slate-400">
                                  <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold">
                                    {hasTemp && (
                                      <span className="flex items-center gap-0.5 bg-rose-50 text-rose-700 px-1.5 py-0.5 border border-rose-100 rounded">
                                        <Thermometer className="h-3 w-3 shrink-0" /> {symptoms.temp}°C
                                      </span>
                                    )}
                                    {hasMucus && (
                                      <span className="flex items-center gap-0.5 bg-sky-50 text-sky-700 px-1.5 py-0.5 border border-sky-100 rounded">
                                        <Droplet className="h-3 w-3 shrink-0" /> {symptoms.mucusTexture}
                                      </span>
                                    )}
                                    {hasWarning && (
                                      <span className="bg-amber-50 text-amber-800 px-1.5 py-0.5 border border-amber-100 rounded font-bold">
                                        Symptom Alert
                                      </span>
                                    )}
                                    {!hasTemp && !hasMucus && !hasWarning && <span className="italic">No parameters logged</span>}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 italic text-xs border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                  Select a cycle above to see its detailed day list.
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 pt-3 mt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold select-none cursor-pointer"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
}
