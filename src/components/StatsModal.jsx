import React, { useState, useMemo } from 'react';
import { X, Activity, BarChart2, Calendar, Thermometer, Droplet, Clock, ShieldAlert, ChevronRight } from 'lucide-react';
import { parseDate, getDaysBetween } from '../utils/dateHelpers.js';

export default function StatsModal({
  isOpen,
  onClose,
  periods,
  analyzedCycles,
  projectedCycles,
  dailySymptoms,
  averageCycleLength,
  todayStr
}) {
  if (!isOpen) return null;

  // Selected details section (null, 0, 1, 2)
  const [selectedSection, setSelectedSection] = useState(null);

  // 1. Calculate Period Bleeding Statistics
  const periodStats = useMemo(() => {
    const completed = periods.filter(p => !p.isOngoing && p.endDate);
    const durations = completed.map(p => getDaysBetween(p.startDate, p.endDate) + 1);
    
    // Include ongoing period count if it exists
    const ongoing = periods.find(p => p.isOngoing);
    const totalPeriodsCount = periods.length;
    
    if (durations.length === 0) {
      return {
        avg: 5,
        lowest: 5,
        highest: 5,
        totalBleedingDays: ongoing ? getDaysBetween(ongoing.startDate, todayStr) + 1 : 0,
        completedCount: 0,
        totalPeriodsCount
      };
    }

    const sum = durations.reduce((acc, d) => acc + d, 0);
    const avg = Math.round((sum / durations.length) * 10) / 10;
    const lowest = Math.min(...durations);
    const highest = Math.max(...durations);
    
    // Total bleeding days logged overall
    let totalBleedingDays = durations.reduce((acc, d) => acc + d, 0);
    if (ongoing) {
      totalBleedingDays += getDaysBetween(ongoing.startDate, todayStr) + 1;
    }

    return {
      avg,
      lowest,
      highest,
      totalBleedingDays,
      completedCount: completed.length,
      totalPeriodsCount
    };
  }, [periods, todayStr]);

  // 2. Calculate Cycle Length Statistics
  const cycleStats = useMemo(() => {
    const completedCycles = analyzedCycles.filter(c => c.cycleLength !== null);
    const lengths = completedCycles.map(c => c.cycleLength);

    if (lengths.length === 0) {
      return {
        avg: averageCycleLength || 28,
        shortest: averageCycleLength || 28,
        longest: averageCycleLength || 28,
        variation: 0,
        completedCount: 0,
        regularityStatus: 'Awaiting logs'
      };
    }

    const sum = lengths.reduce((acc, l) => acc + l, 0);
    const avg = Math.round((sum / lengths.length) * 10) / 10;
    const shortest = Math.min(...lengths);
    const longest = Math.max(...lengths);
    const variation = longest - shortest;

    let regularityStatus = 'Highly Regular';
    if (variation > 7) {
      regularityStatus = 'Irregular (>7d var)';
    } else if (variation > 3) {
      regularityStatus = 'Moderately Regular';
    }

    return {
      avg,
      shortest,
      longest,
      variation,
      completedCount: completedCycles.length,
      regularityStatus
    };
  }, [analyzedCycles, averageCycleLength]);

  // 3. Calculate Symptothermal Log Statistics
  const symptomStats = useMemo(() => {
    const logs = Object.values(dailySymptoms);
    const totalLogs = logs.length;
    
    // Temperature stats
    const tempLogs = logs.filter(l => l.temp !== undefined);
    const temps = tempLogs.map(l => parseFloat(l.temp));
    const avgTemp = temps.length > 0 
      ? (temps.reduce((sum, t) => sum + t, 0) / temps.length).toFixed(2) 
      : null;
      
    // Mucus stats
    const mucusLogs = logs.filter(l => l.mucusTexture);
    const mucusCounts = {};
    mucusLogs.forEach(l => {
      mucusCounts[l.mucusTexture] = (mucusCounts[l.mucusTexture] || 0) + 1;
    });
    
    let topMucus = 'None';
    let maxMucusCount = 0;
    Object.entries(mucusCounts).forEach(([type, count]) => {
      if (count > maxMucusCount) {
        maxMucusCount = count;
        topMucus = type;
      }
    });

    // Alert symptoms logged
    const alertCount = logs.filter(l => l.vaginalItching || l.soreness || l.foulOdor).length;

    return {
      totalLogs,
      tempLogsCount: tempLogs.length,
      avgTemp,
      mucusLogsCount: mucusLogs.length,
      topMucus,
      alertCount
    };
  }, [dailySymptoms]);

  // Sections configuration
  const sections = [
    {
      title: '🩸 Period & Bleeding Metrics',
      description: 'Logged duration limits and menstruation records.',
      icon: <Droplet className="h-5 w-5 text-rose-500" />,
      content: (
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-450 font-extrabold block uppercase tracking-wider">Average Period</span>
            <span className="text-lg font-extrabold text-slate-800 mt-0.5 block">{periodStats.avg} Days</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-455 font-extrabold block uppercase tracking-wider">Total Logs</span>
            <span className="text-lg font-extrabold text-slate-800 mt-0.5 block">{periodStats.totalPeriodsCount} Logs</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-455 font-extrabold block uppercase tracking-wider">Shortest Period</span>
            <span className="text-lg font-extrabold text-slate-800 mt-0.5 block">{periodStats.lowest} Days</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-455 font-extrabold block uppercase tracking-wider">Longest Period</span>
            <span className="text-lg font-extrabold text-slate-800 mt-0.5 block">{periodStats.highest} Days</span>
          </div>
          <div className="col-span-2 bg-rose-50/50 p-3 rounded-xl border border-rose-100 flex items-center justify-between text-rose-700">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Total bleeding logged:</span>
            <span className="text-sm font-extrabold">{periodStats.totalBleedingDays} Days</span>
          </div>
        </div>
      )
    },
    {
      title: '🔄 Cycle Length & Regularity',
      description: 'Variation bounds and regularity evaluations.',
      icon: <Clock className="h-5 w-5 text-purple-500" />,
      content: (
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-455 font-extrabold block uppercase tracking-wider">Average Cycle</span>
            <span className="text-lg font-extrabold text-slate-800 mt-0.5 block">{cycleStats.avg} Days</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-455 font-extrabold block uppercase tracking-wider">Completed</span>
            <span className="text-lg font-extrabold text-slate-800 mt-0.5 block">{cycleStats.completedCount} Cycles</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-455 font-extrabold block uppercase tracking-wider">Shortest Cycle</span>
            <span className="text-lg font-extrabold text-slate-800 mt-0.5 block">{cycleStats.shortest} Days</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-455 font-extrabold block uppercase tracking-wider">Longest Cycle</span>
            <span className="text-lg font-extrabold text-slate-800 mt-0.5 block">{cycleStats.longest} Days</span>
          </div>
          <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100 flex justify-between items-center text-purple-700 col-span-2">
            <div>
              <span className="text-[10px] font-extrabold block uppercase tracking-wider">Cycle Variation</span>
              <span className="text-[10px] font-medium leading-none">Difference between max & min length</span>
            </div>
            <span className="text-sm font-extrabold">{cycleStats.variation} Days</span>
          </div>
          <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 flex justify-between items-center text-indigo-700 col-span-2">
            <div>
              <span className="text-[10px] font-extrabold block uppercase tracking-wider">Regularity Status</span>
              <span className="text-[10px] font-medium leading-none">Historical predictability index</span>
            </div>
            <span className="text-xs font-extrabold uppercase bg-white border border-indigo-200 px-2 py-0.5 rounded-md leading-none shadow-3xs">{cycleStats.regularityStatus}</span>
          </div>
        </div>
      )
    },
    {
      title: '📈 Symptothermal Biomarkers',
      description: 'Summaries of temperatures and mucus patterns.',
      icon: <Thermometer className="h-5 w-5 text-indigo-500" />,
      content: (
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-455 font-extrabold block uppercase tracking-wider">Daily Logs</span>
            <span className="text-lg font-extrabold text-slate-800 mt-0.5 block">{symptomStats.totalLogs} Days</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-455 font-extrabold block uppercase tracking-wider">Temp Logs</span>
            <span className="text-lg font-extrabold text-slate-800 mt-0.5 block">{symptomStats.tempLogsCount} Days</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-455 font-extrabold block uppercase tracking-wider">Avg waking temp</span>
            <span className="text-lg font-extrabold text-slate-800 mt-0.5 block">{symptomStats.avgTemp ? `${symptomStats.avgTemp}°C` : 'N/A'}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-455 font-extrabold block uppercase tracking-wider">Top mucus texture</span>
            <span className="text-sm font-extrabold text-slate-800 mt-0.5 truncate block" title={symptomStats.topMucus}>{symptomStats.topMucus}</span>
          </div>
          {symptomStats.alertCount > 0 && (
            <div className="col-span-2 bg-amber-50 p-3 rounded-xl border border-amber-250 flex items-center gap-2 text-amber-800">
              <ShieldAlert className="h-4.5 w-4.5 text-amber-600 shrink-0" />
              <div className="text-[10px] font-semibold">
                You logged localized vaginal alerts (itching, soreness, or odor) on **{symptomStats.alertCount}** tracking days.
              </div>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      {/* Click backdrop to close entire modal */}
      <div 
        onClick={onClose}
        className="absolute inset-0 z-0 cursor-pointer"
      />

      {/* Invisible overlay click shield: clicking here closes the details modal popup */}
      {selectedSection !== null && (
        <div 
          onClick={() => setSelectedSection(null)}
          className="absolute inset-0 z-10 cursor-default"
        />
      )}

      {/* Side-by-Side Flex Container */}
      <div className="relative z-20 flex flex-col md:flex-row items-center md:items-stretch justify-center gap-4 max-w-4xl w-full">
        
        {/* Box 1: Analytics Category Menu Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl flex flex-col gap-4 w-full max-w-sm shrink-0">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-indigo-650">
              <BarChart2 className="h-5 w-5 text-indigo-500 animate-pulse-slow" />
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Analytics Insights</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Select a category below to explore details. Click anywhere outside the details card to return.
          </p>

          {/* Menu Options */}
          <div className="flex flex-col gap-3 my-1">
            {sections.map((sec, idx) => {
              const isSelected = selectedSection === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedSection(isSelected ? null : idx)}
                  className={`w-full text-left p-3.5 flex items-center justify-between rounded-2xl border transition-all duration-200 cursor-pointer select-none group ${
                    isSelected 
                      ? 'bg-indigo-50/40 border-indigo-500 shadow-xs' 
                      : 'bg-white border-slate-200/80 hover:border-slate-350 hover:bg-slate-50/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl transition-colors ${
                      isSelected ? 'bg-indigo-100/50' : 'bg-slate-50'
                    }`}>
                      {sec.icon}
                    </div>
                    <div>
                      <div className={`font-bold text-xs ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                        {sec.title}
                      </div>
                      <div className="text-[9px] text-slate-400 font-medium mt-0.5">
                        {sec.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-all ${
                    isSelected 
                      ? 'text-indigo-600 translate-x-0.5' 
                      : 'text-slate-350 group-hover:text-slate-500 group-hover:translate-x-0.5'
                  }`} />
                </button>
              );
            })}
          </div>

          {/* Footer close button */}
          <div className="flex justify-end border-t border-slate-100 pt-3 mt-1">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold select-none cursor-pointer"
            >
              Close Analytics
            </button>
          </div>
        </div>

        {/* Box 2: Detail Popup (on the Right) */}
        {selectedSection !== null && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl flex flex-col gap-4 w-full max-w-sm animate-scale-up z-20">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {sections[selectedSection].icon}
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  {sections[selectedSection].title.split(' ').slice(1).join(' ')}
                </h4>
              </div>
              <button 
                onClick={() => setSelectedSection(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Details */}
            <div className="flex-1">
              {sections[selectedSection].content}
            </div>

            {/* Footer close details */}
            <div className="flex justify-end border-t border-slate-100 pt-3 mt-auto">
              <button
                onClick={() => setSelectedSection(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold select-none cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
