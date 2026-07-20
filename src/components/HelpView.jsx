import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, BookOpen, Heart, Thermometer, ShieldAlert } from 'lucide-react';
import PageViewLayout from './PageViewLayout.jsx';

export default function HelpView({ onClose }) {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (id) => {
    setOpenSection(openSection === id ? null : id);
  };

  const sections = [
    {
      id: 'faq',
      title: '❓ Frequently Asked Questions (FAQs)',
      icon: <HelpCircle className="h-4.5 w-4.5 text-indigo-500" />,
      content: (
        <div className="flex flex-col gap-4">
          <div className="border-b border-slate-100 pb-3">
            <h5 className="font-bold text-xs text-slate-800">How do I record a new period cycle?</h5>
            <p className="text-[11px] text-slate-500 mt-1 font-medium leading-relaxed">
              Navigate back to the main <strong>Dashboard</strong>. On the sidebar (or inside the drawer if on mobile), click the <strong>Log Period Cycle</strong> button. Fill in the start date and end date, or check "Ongoing period" if you are actively bleeding today.
            </p>
          </div>
          
          <div className="border-b border-slate-100 pb-3">
            <h5 className="font-bold text-xs text-slate-800">How do I edit or delete an incorrect cycle log?</h5>
            <p className="text-[11px] text-slate-500 mt-1 font-medium leading-relaxed">
              Open the <strong>Cycle History</strong> page from the settings menu. Under the "Logged Cycles" tab, you will see a list of all recorded periods. Click the <strong>Edit (Pencil)</strong> icon to adjust dates, or click the <strong>Delete (Trash)</strong> icon to remove the cycle completely.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-xs text-slate-800">Why are my future period forecasts shifting?</h5>
            <p className="text-[11px] text-slate-500 mt-1 font-medium leading-relaxed">
              Selene is an <strong>adaptive</strong> tracking model. Every time you log a new period, the system automatically recalibrates your rolling average cycle duration. If your cycles become longer or shorter, future predictions adjust dynamically to match your body's behavior.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'ovulation',
      title: '🧬 Ovulation & Fertile Predictions',
      icon: <Heart className="h-4.5 w-4.5 text-rose-500 animate-pulse-slow" />,
      content: (
        <div className="flex flex-col gap-3 font-semibold text-slate-600 text-[11px] leading-relaxed">
          <p>
            Selene's prediction algorithms estimate ovulation and fertile windows using clinical reproductive patterns:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-2 text-slate-500 font-medium">
            <li>
              <strong>Ovulation Offset:</strong> Post-ovulation luteal phases are physiologically stable, lasting approximately 14 days. Selene calculates your estimated ovulation day as:
              <div className="my-1.5 font-mono text-xs text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-100 w-fit">
                Ovulation Day = Cycle Start Date + (Average Cycle Length - 14 days)
              </div>
            </li>
            <li>
              <strong>Fertile Window:</strong> Sperm can survive inside the cervix for up to 5 days, while a released egg is viable for 24 hours. The fertile window is mathematically calculated as:
              <div className="my-1.5 font-mono text-xs text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-100 w-fit">
                Fertility Window = [Ovulation - 5 days, Ovulation + 1 day]
              </div>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'symptothermal',
      title: '🌡️ Symptothermal Double-Check Validation',
      icon: <Thermometer className="h-4.5 w-4.5 text-emerald-500" />,
      content: (
        <div className="flex flex-col gap-3 font-semibold text-slate-600 text-[11px] leading-relaxed">
          <p>
            Mathematical models are estimations. To confirm ovulation with higher accuracy, Selene features dual-indicator biological tracking:
          </p>
          <ol className="list-decimal pl-5 flex flex-col gap-2 text-slate-500 font-medium">
            <li>
              <strong>Basal Body Temperature (BBT):</strong> Log your waking temperature immediately upon opening your eyes. After ovulation, progesterone release causes a sustained rise of <strong>0.3°C to 0.5°C</strong> above your baseline.
            </li>
            <li>
              <strong>Cervical Mucus Consistency:</strong> During peak fertile days, estrogen causes mucus to become clear, slippery, and stretchy (resembling raw egg-whites). This environment helps keep sperm viable.
            </li>
          </ol>
          <p className="mt-1">
            When your temperature shift matches your peak egg-white mucus logs, you can verify ovulation with confidence.
          </p>
        </div>
      )
    },
    {
      id: 'safety',
      title: '⚠️ Safety, Limitations & Disclaimer',
      icon: <ShieldAlert className="h-4.5 w-4.5 text-amber-500" />,
      content: (
        <div className="bg-amber-50/50 border border-amber-200/60 p-3 rounded-2xl flex flex-col gap-2.5 text-amber-800 text-[11px] font-semibold">
          <p className="text-amber-900 font-extrabold uppercase tracking-wider text-[10px]">Critical Safety Notice:</p>
          <ul className="list-disc pl-4 flex flex-col gap-1.5 font-medium text-amber-700">
            <li><strong>Not Contraception:</strong> Selene is a cycle journal, not a birth control tool. Do not rely on calendar projections to avoid pregnancy. Calendar formulas have a typical failure rate between 12% and 24%.</li>
            <li><strong>Biological Volatility:</strong> Travel, stress, changes in sleep, diet, or illness can delay ovulation, making calendar-only projections inaccurate.</li>
            <li><strong>No Medical Diagnosis:</strong> This app does not substitute clinical care. If you experience cycles shorter than 21 days, longer than 90 days, or bleeding longer than 10 days, consult your physician.</li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <PageViewLayout
      title="Help Center & User Guide"
      icon={<BookOpen className="h-5 w-5 text-indigo-500" />}
      onBack={onClose}
    >
      <div className="flex flex-col gap-5">
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Learn how to manage your data, understand reproductive biological phases, and interpret symptothermal calculation models.
        </p>

        {/* FAQ Sections Accordion */}
        <div className="flex flex-col gap-3 my-1">
          {sections.map((sec) => {
            const isOpen = openSection === sec.id;
            return (
              <div 
                key={sec.id}
                className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-3xs"
              >
                <button
                  onClick={() => toggleSection(sec.id)}
                  className={`w-full text-left p-4 flex items-center justify-between font-bold text-xs transition-colors cursor-pointer select-none ${
                    isOpen ? 'bg-slate-50 border-b border-slate-200/80 text-slate-800' : 'bg-white text-slate-700 hover:bg-slate-50/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {sec.icon}
                    <span>{sec.title}</span>
                  </div>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-slate-550" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>

                {isOpen && (
                  <div className="p-4 bg-white animate-fade-in text-slate-650">
                    {sec.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Return Button */}
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
