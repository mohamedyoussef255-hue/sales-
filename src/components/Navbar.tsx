import React, { useState, useRef } from 'react';
import { 
  Fuel, 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  ShieldCheck, 
  Sliders, 
  Bot, 
  Layers,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const { 
    settings, 
    toggleDarkMode, 
    changeLanguage, 
    activeTab, 
    setActiveTab, 
    alerts, 
    isAdmin, 
    setIsAdmin,
    setAdminModalOpen 
  } = useApp();

  const [clickCount, setClickCount] = useState(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [clickHint, setClickHint] = useState<string | null>(null);

  // 5-click easter egg / secret trigger for Admin login
  const handleLogoClick = () => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (nextCount < 5) {
      setClickHint(`${5 - nextCount} نقرات متبقية لفتح وضع المدير`);
      clickTimerRef.current = setTimeout(() => {
        setClickCount(0);
        setClickHint(null);
      }, 2500);
    } else {
      setClickCount(0);
      setClickHint(null);
      setAdminModalOpen(true);
    }
  };

  const isAr = settings.language === 'ar';
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Secret 5-Click Admin Trigger */}
          <div className="flex items-center gap-3">
            <div 
              onClick={handleLogoClick}
              title="اضغط 5 مرات لفتح وضع المدير"
              className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95 transition-all select-none hover:rotate-6 hover:shadow-emerald-500/40"
            >
              <Fuel className="w-6 h-6 stroke-[2.2]" />
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[8px] font-bold text-slate-900 shadow">
                CNG
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span 
                  onClick={handleLogoClick}
                  className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-700 to-teal-600 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent cursor-pointer"
                >
                  {isAr ? 'كارجاس | CARGAS' : 'CARGAS | CNG Systems'}
                </span>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                    <ShieldCheck className="w-3 h-3" />
                    {isAr ? 'مدير النظام' : 'Admin'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                {isAr 
                  ? 'منظومة التحليل الذكي لمبيعات الغاز الطبيعي والأعطال • عزوتي' 
                  : 'Smart CNG Sales & Downtime Intelligence • Ezouti'}
              </p>
            </div>

            {clickHint && (
              <span className="animate-pulse text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold px-2 py-1 rounded-md border border-amber-500/20">
                {clickHint}
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
            >
              {isAr ? 'لوحة القيادة' : 'Dashboard'}
            </button>

            <button
              onClick={() => setActiveTab('stations')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'stations'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
            >
              <span>{isAr ? 'المحطات والمستهدف' : 'Stations & Targets'}</span>
              {criticalCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('downtime')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'downtime'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
            >
              {isAr ? 'ساعات التوقف والأعطال' : 'Downtime & Losses'}
            </button>

            <button
              onClick={() => setActiveTab('files')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'files'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
            >
              {isAr ? 'رفع ومعالجة الملفات' : 'Upload Files'}
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'reports'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{isAr ? 'التقارير الذكية' : 'AI Reports'}</span>
            </button>
          </nav>

          {/* Right Utility Controls */}
          <div className="flex items-center gap-2">
            
            {/* Moain Assistant Toggle Button */}
            {settings.moainEnabled && (
              <button
                onClick={() => setActiveTab('moain')}
                title={isAr ? 'التحدث مع المساعد الذكي مُعين' : 'Chat with Moain'}
                className={`relative p-2 rounded-xl border transition-all flex items-center gap-1.5 ${
                  activeTab === 'moain'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm shadow-emerald-500/30'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span className="text-xs font-bold hidden sm:inline">{isAr ? 'مُعين' : 'Moain'}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            )}

            {/* Alerts Quick Dropdown/Trigger */}
            <button
              onClick={() => setActiveTab('stations')}
              title={isAr ? `${alerts.length} تنبيهات نشطة` : `${alerts.length} Active Alerts`}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-[9px] font-extrabold text-white shadow">
                  {alerts.length}
                </span>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              title={settings.darkMode ? (isAr ? 'تفعيل الوضع النهاري' : 'Light Mode') : (isAr ? 'تفعيل الوضع الليلي' : 'Dark Mode')}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {settings.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => changeLanguage(isAr ? 'en' : 'ar')}
              title={isAr ? 'Switch to English' : 'التحويل للغة العربية'}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs font-bold font-mono"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{isAr ? 'EN' : 'عربي'}</span>
            </button>

            {/* Admin Console Shortcut */}
            <button
              onClick={() => setAdminModalOpen(true)}
              title={isAdmin ? (isAr ? 'لوحة تحكم المدير' : 'Admin Console') : (isAr ? 'تسجيل دخول المدير' : 'Admin Login')}
              className={`p-2 rounded-xl transition-all ${
                isAdmin 
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-4 h-4" />
            </button>

          </div>

        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto text-[11px] font-bold">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2 py-1 rounded-md ${activeTab === 'dashboard' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' : 'text-slate-600'}`}
          >
            {isAr ? 'الرئيسية' : 'Dashboard'}
          </button>
          <button
            onClick={() => setActiveTab('stations')}
            className={`px-2 py-1 rounded-md ${activeTab === 'stations' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' : 'text-slate-600'}`}
          >
            {isAr ? 'المحطات' : 'Stations'} ({criticalCount})
          </button>
          <button
            onClick={() => setActiveTab('downtime')}
            className={`px-2 py-1 rounded-md ${activeTab === 'downtime' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' : 'text-slate-600'}`}
          >
            {isAr ? 'الأعطال' : 'Downtime'}
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-2 py-1 rounded-md ${activeTab === 'files' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' : 'text-slate-600'}`}
          >
            {isAr ? 'الملفات' : 'Files'}
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-2 py-1 rounded-md ${activeTab === 'reports' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' : 'text-slate-600'}`}
          >
            {isAr ? 'التقارير' : 'Reports'}
          </button>
        </div>

      </div>
    </header>
  );
};
