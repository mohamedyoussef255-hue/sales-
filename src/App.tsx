/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { StationsAnalysis } from './components/StationsAnalysis';
import { DowntimeTracker } from './components/DowntimeTracker';
import { FileUploadHub } from './components/FileUploadHub';
import { AiReportsCenter } from './components/AiReportsCenter';
import { MoainAssistant } from './components/MoainAssistant';
import { AdminModal } from './components/AdminModal';
import { Bot, Sparkles, ShieldCheck } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activeTab, setActiveTab, settings } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-['Cairo',sans-serif] selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Navigation */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'stations' && <StationsAnalysis />}
        {activeTab === 'downtime' && <DowntimeTracker />}
        {activeTab === 'files' && <FileUploadHub />}
        {activeTab === 'reports' && <AiReportsCenter />}
        {activeTab === 'moain' && <MoainAssistant />}
      </main>

      {/* Floating Moain Assistant Quick Button (if not already in moain tab and moain is enabled) */}
      {settings.moainEnabled && activeTab !== 'moain' && (
        <button
          onClick={() => setActiveTab('moain')}
          title="تحدث مع المساعد الذكي مُعين"
          className="fixed bottom-6 left-6 z-40 p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 group"
        >
          <div className="relative">
            <Bot className="w-6 h-6" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 absolute -top-0.5 -right-0.5 animate-ping" />
          </div>
          <span className="text-xs font-black hidden sm:inline">
            مُعين معاك
          </span>
        </button>
      )}

      {/* Admin Management Modal */}
      <AdminModal />

      {/* Professional Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 py-6 text-center text-xs text-slate-500 dark:text-slate-400 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-700 dark:text-slate-200">
              منظومة كارجاس (CARGAS) للغاز الطبيعي المضغوط
            </span>
            <span>•</span>
            <span>تحليل المبيعات الذكي ومتابعة الأعطال</span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              تصميم وتطوير حصري: <strong>شركة عزوتي للبرمجيات وتكنولوجيا المعلومات</strong> | المطور: <strong>محمد عبد الرحمن يوسف</strong>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
