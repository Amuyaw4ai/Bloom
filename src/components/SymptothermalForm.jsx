import React, { useState, useEffect } from 'react';
import { Thermometer, Droplet, Check, RefreshCw, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';

const TEXTURES = [
  { value: '', label: 'None' },
  { value: 'sticky', label: 'Sticky / Pasty' },
  { value: 'creamy', label: 'Creamy' },
  { value: 'watery', label: 'Wet / Watery' },
  { value: 'egg_white', label: 'Egg-White / Stretchy' }
];

const SENSATIONS = [
  { value: '', label: 'Dry / None' },
  { value: 'damp', label: 'Damp' },
  { value: 'wet', label: 'Wet' },
  { value: 'slippery', label: 'Slippery' }
];

const COLORS = [
  { value: '', label: 'None' },
  { value: 'clear', label: 'Clear' },
  { value: 'cloudy', label: 'Cloudy' },
  { value: 'white', label: 'White' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'tinged', label: 'Pink / Brown-Tinged' }
];

export default function SymptothermalForm({ selectedDate, symptoms = {}, onSave }) {
  const [bbt, setBbt] = useState('');
  const [mucusTexture, setMucusTexture] = useState('');
  const [mucusSensation, setMucusSensation] = useState('');
  const [mucusColor, setMucusColor] = useState('');
  const [hasOdorDiscomfort, setHasOdorDiscomfort] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Accordion state - only one section expanded at a time: 'bbt' | 'mucus' | 'warnings' | null
  const [expandedSection, setExpandedSection] = useState('bbt');

  // Destructure primitive properties of symptoms so we don't depend on the object reference (which recreates default {} on every render)
  const {
    bbt: propBbt,
    mucusTexture: propTexture,
    mucusSensation: propSensation,
    mucusColor: propColor,
    hasOdorDiscomfort: propOdor
  } = symptoms || {};

  // Sync state when selected date or logged symptoms change
  useEffect(() => {
    setBbt(propBbt !== undefined && propBbt !== null ? propBbt.toString() : '');
    setMucusTexture(propTexture || '');
    setMucusSensation(propSensation || '');
    setMucusColor(propColor || '');
    setHasOdorDiscomfort(propOdor || false);
    setSaveSuccess(false);
    
    // Automatically reset focus to first section on date switch
    setExpandedSection('bbt');
  }, [selectedDate, propBbt, propTexture, propSensation, propColor, propOdor]);

  const toggleSection = (sectionName) => {
    setExpandedSection(prev => (prev === sectionName ? null : sectionName));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const parsedBbt = bbt.trim() === '' ? null : parseFloat(bbt);
    
    if (parsedBbt !== null && (parsedBbt < 35.0 || parsedBbt > 38.5)) {
      alert('Please enter a valid basal body temperature between 35.00°C and 38.50°C.');
      return;
    }

    const symptomsData = {
      bbt: parsedBbt,
      mucus: mucusTexture || mucusSensation ? true : false,
      mucusTexture,
      mucusSensation,
      mucusColor,
      hasOdorDiscomfort
    };

    onSave(selectedDate, symptomsData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleClear = () => {
    if (window.confirm('Clear all symptoms for this day?')) {
      onSave(selectedDate, {
        bbt: null,
        mucus: false,
        mucusTexture: '',
        mucusSensation: '',
        mucusColor: '',
        hasOdorDiscomfort: false
      });
      setBbt('');
      setMucusTexture('');
      setMucusSensation('');
      setMucusColor('');
      setHasOdorDiscomfort(false);
      setExpandedSection('bbt');
    }
  };

  // Helper to format values for collapsed summaries
  const getBbtSummary = () => {
    if (bbt.trim() === '') return 'Not set';
    return `${parseFloat(bbt).toFixed(2)}°C`;
  };

  const getMucusSummary = () => {
    if (!mucusTexture && !mucusSensation) return 'Not set';
    const textureLabel = TEXTURES.find(t => t.value === mucusTexture)?.label || '';
    const sensationLabel = SENSATIONS.find(s => s.value === mucusSensation)?.label || '';
    
    if (mucusTexture && mucusSensation) {
      return `${textureLabel} / ${sensationLabel}`;
    }
    return textureLabel || sensationLabel;
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      
      {/* 1. Basal Body Temperature Accordion Section */}
      <div className="border border-slate-150 rounded-xl overflow-hidden bg-white shadow-3xs">
        <button
          type="button"
          onClick={() => toggleSection('bbt')}
          className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/70 border-b border-slate-100 flex items-center justify-between transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-rose-500 shrink-0" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Waking Temperature</span>
          </div>
          <div className="flex items-center gap-2">
            {expandedSection !== 'bbt' && (
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-mono border border-indigo-100/50">
                {getBbtSummary()}
              </span>
            )}
            {expandedSection === 'bbt' ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
          </div>
        </button>

        {expandedSection === 'bbt' && (
          <div className="p-4 flex flex-col gap-2 bg-white animate-fade-in">
            <p className="text-[10px] text-slate-400 leading-normal mb-1">
              Log your waking temperature in Celsius. Consistent thermal shifts verify ovulation.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                min="35.00"
                max="38.50"
                placeholder="e.g. 36.45"
                value={bbt}
                onChange={(e) => setBbt(e.target.value)}
                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500"
              />
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
                °C
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Cervical Mucus Accordion Section */}
      <div className="border border-slate-150 rounded-xl overflow-hidden bg-white shadow-3xs">
        <button
          type="button"
          onClick={() => toggleSection('mucus')}
          className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/70 border-b border-slate-100 flex items-center justify-between transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <Droplet className="h-4 w-4 text-indigo-500 shrink-0" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cervical Mucus</span>
          </div>
          <div className="flex items-center gap-2 max-w-[60%] truncate">
            {expandedSection !== 'mucus' && (
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/50 truncate">
                {getMucusSummary()}
              </span>
            )}
            {expandedSection === 'mucus' ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
          </div>
        </button>

        {expandedSection === 'mucus' && (
          <div className="p-4 flex flex-col gap-3 bg-white animate-fade-in">
            {/* Texture */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Texture / Consistency</span>
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                {TEXTURES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setMucusTexture(t.value)}
                    className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border text-center transition-all ${
                      mucusTexture === t.value
                        ? 'bg-indigo-500 text-white border-indigo-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sensation */}
            <div className="flex flex-col gap-1 mt-1 border-t border-slate-50 pt-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sensation at Vulva</span>
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                {SENSATIONS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setMucusSensation(s.value)}
                    className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border text-center transition-all ${
                      mucusSensation === s.value
                        ? 'bg-indigo-500 text-white border-indigo-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="flex flex-col gap-1 mt-1 border-t border-slate-50 pt-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mucus Color</span>
              <select
                value={mucusColor}
                onChange={(e) => setMucusColor(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 w-full mt-1"
              >
                {COLORS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 3. Vaginal Health Warning Accordion Section */}
      <div className="border border-slate-150 rounded-xl overflow-hidden bg-white shadow-3xs">
        <button
          type="button"
          onClick={() => toggleSection('warnings')}
          className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/70 border-b border-slate-100 flex items-center justify-between transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Health Warning Flags</span>
          </div>
          <div className="flex items-center gap-2">
            {expandedSection !== 'warnings' && hasOdorDiscomfort && (
              <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100/60 animate-pulse">
                Alert Flagged
              </span>
            )}
            {expandedSection === 'warnings' ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
          </div>
        </button>

        {expandedSection === 'warnings' && (
          <div className="p-4 flex flex-col gap-3 bg-white animate-fade-in">
            <label className="flex items-start gap-2.5 cursor-pointer p-2 hover:bg-slate-50 border border-slate-150 rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={hasOdorDiscomfort}
                onChange={(e) => setHasOdorDiscomfort(e.target.checked)}
                className="h-4 w-4 mt-0.5 rounded border-slate-350 text-rose-500 focus:ring-rose-500/10"
              />
              <div className="text-[11px] leading-tight">
                <span className="font-bold text-slate-700 block">Flag unusual discharge</span>
                <span className="text-slate-400 text-[10px]">Unusual strong odor, itching, or soreness</span>
              </div>
            </label>

            {hasOdorDiscomfort && (
              <div className="flex items-start gap-2 bg-rose-50 border border-rose-100 text-[10px] text-rose-700 p-3 rounded-lg leading-normal animate-fade-in shadow-2xs">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-rose-500" />
                <p>
                  <strong className="font-bold">Medical Note:</strong> An unusual odor or vaginal discomfort (like burning or itching) can be a sign of a bacterial, fungal (yeast), or chemical imbalance rather than typical cyclic discharge. Consider consulting a health professional if symptoms persist.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Action Buttons */}
      <div className="flex items-center gap-2 border-t border-slate-100 pt-3 mt-1">
        <button
          type="button"
          onClick={handleClear}
          className="flex-1 py-2 text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors flex items-center justify-center gap-1 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200/50"
        >
          <RefreshCw className="h-3.5 w-3.5 animate-spin-hover" /> Clear Day
        </button>
        
        <button
          type="submit"
          className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 border shadow-xs ${
            saveSuccess
              ? 'bg-emerald-500 text-white border-emerald-600'
              : 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-750'
          }`}
        >
          {saveSuccess ? (
            <>
              <Check className="h-3.5 w-3.5" /> Saved!
            </>
          ) : (
            'Save Symptoms'
          )}
        </button>
      </div>
    </form>
  );
}
