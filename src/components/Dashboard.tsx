import React from 'react';
import { 
  Fuel, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  FileSpreadsheet, 
  Sparkles, 
  Bot, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldAlert,
  Download,
  UploadCloud,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportStationsToExcel } from '../services/fileParserService';

export const Dashboard: React.FC = () => {
  const { 
    stations, 
    downtimeLogs, 
    settings, 
    alerts, 
    setActiveTab, 
    totalSales, 
    totalTarget, 
    overallAchievementRate, 
    criticalStationsCount, 
    warningStationsCount, 
    totalDowntimeHours, 
    totalLostSalesM3, 
    totalFinancialLossEGP 
  } = useApp();

  const isAr = settings.language === 'ar';

  // Group stations by sector
  const sectorSales = stations.reduce((acc, st) => {
    if (!acc[st.sector]) {
      acc[st.sector] = { sales: 0, target: 0, count: 0 };
    }
    acc[st.sector].sales += st.actualSales;
    acc[st.sector].target += st.dailyTarget;
    acc[st.sector].count += 1;
    return acc;
  }, {} as Record<string, { sales: number; target: number; count: number }>);

  // Group downtime by cause
  const causeBreakdown = downtimeLogs.reduce((acc, d) => {
    acc[d.cause] = (acc[d.cause] || 0) + d.durationHours;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner / Welcome with Quick Actions */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-emerald-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>متابعة لحظية لمحطات تموين الغاز الطبيعي (CNG)</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
              {isAr ? 'منظومة كارجاس لمراقبة المبيعات وتنبيهات الأعطال' : 'CARGAS Smart Sales & Downtime Monitoring System'}
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isAr 
                ? 'رصد دقيق لكافة المحطات، مقارنة المبيعات بالمستهدفات اليومية، كشف انخفاض الضغوط والأعطال وحساب الفاقد المالي بدعم المساعد الذكي مُعين.' 
                : 'Real-time sales tracking against daily targets, early fault detection, lost revenue analytics with AI assistance.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('files')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <UploadCloud className="w-4 h-4 text-emerald-300" />
              <span>{isAr ? 'رفع ملف إكسيل' : 'Upload Excel'}</span>
            </button>

            <button
              onClick={() => exportStationsToExcel(stations)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isAr ? 'تصدير إكسيل' : 'Export Excel'}</span>
            </button>

            <button
              onClick={() => setActiveTab('moain')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Bot className="w-4 h-4" />
              <span>{isAr ? 'اسأل مُعين' : 'Ask Moain'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Critical Early Warning Alert Bar */}
      {criticalStationsCount > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/10 via-red-500/5 to-amber-500/10 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600 text-white shrink-0 shadow-md">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-red-700 dark:text-red-400">
                  {isAr ? `تنبيه حرج مبكر: يوجد ${criticalStationsCount} محطات منخفضة بشدة عن المستهدف اليومي!` : `Critical Alert: ${criticalStationsCount} stations severely underperforming!`}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600 text-white">
                  عاجل
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                أبرز المحطات المتأخرة: {alerts.filter(a => a.severity === 'critical').slice(0, 3).map(a => `${a.stationName} (${a.achievementRate.toFixed(1)}%)`).join('، ')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('stations')}
            className="self-end sm:self-center px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm shrink-0 flex items-center gap-1.5"
          >
            <span>{isAr ? 'فحص المحطات الحرجة' : 'Inspect Stations'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Actual Sales */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isAr ? 'المبيعات الفعلية الإجمالية' : 'Total Actual CNG Sales'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Fuel className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {totalSales.toLocaleString('ar-EG')} <span className="text-sm font-bold text-slate-500">م³</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className={`flex items-center font-bold ${overallAchievementRate >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {overallAchievementRate >= 90 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {overallAchievementRate}%
              </span>
              <span className="text-slate-400">من إجمالي المستهدف اليومي</span>
            </div>
          </div>

          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                overallAchievementRate >= 95 ? 'bg-emerald-500' : overallAchievementRate >= 85 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(overallAchievementRate, 100)}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Target Sales */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isAr ? 'المستهدف اليومي الإجمالي' : 'Total Daily Target'}
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {totalTarget.toLocaleString('ar-EG')} <span className="text-sm font-bold text-slate-500">م³</span>
            </div>
            <div className="text-xs text-slate-500">
              مجموع المستهدف لعدد <span className="font-bold text-slate-700 dark:text-slate-300">{stations.length}</span> محطة غاز
            </div>
          </div>

          <div className="mt-3 text-[11px] font-bold text-slate-500 flex items-center justify-between">
            <span>الفارق الإجمالي:</span>
            <span className={totalSales >= totalTarget ? 'text-emerald-600 font-mono' : 'text-red-500 font-mono'}>
              {totalSales >= totalTarget ? '+' : ''}{(totalSales - totalTarget).toLocaleString('ar-EG')} م³
            </span>
          </div>
        </div>

        {/* KPI 3: Downtime & Lost Sales */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isAr ? 'ساعات التوقف والأعطال' : 'Total Downtime Hours'}
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {totalDowntimeHours} <span className="text-sm font-bold text-slate-500">ساعة</span>
            </div>
            <div className="text-xs text-slate-500">
              في عدد <span className="font-bold text-slate-700 dark:text-slate-300">{downtimeLogs.length}</span> بلاغات عطل مسجلة
            </div>
          </div>

          <div className="mt-3 text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center justify-between">
            <span>الفاقد التقديري في الغاز:</span>
            <span className="font-mono">{totalLostSalesM3.toLocaleString('ar-EG')} م³</span>
          </div>
        </div>

        {/* KPI 4: Financial Impact */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isAr ? 'الفاقد المالي التقديري' : 'Estimated Financial Loss'}
            </span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-black text-red-600 dark:text-red-400 font-mono">
              {totalFinancialLossEGP.toLocaleString('ar-EG')} <span className="text-sm font-bold">ج.م</span>
            </div>
            <div className="text-xs text-slate-500">
              محسوب على أساس سعر المتر <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{settings.gasPricePerM3} ج.م</span>
            </div>
          </div>

          <div className="mt-3 text-[11px] font-bold text-slate-500 flex items-center justify-between">
            <span>تنبيهات حرجة:</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
              {criticalStationsCount} محطة
            </span>
          </div>
        </div>

      </div>

      {/* Two-Column Analytics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Stations Real-time Ranking & Progress */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                  {isAr ? 'مقارنة المبيعات الفعلية بالمستهدف لكل محطة' : 'Stations Actual vs Daily Target'}
                </h3>
                <p className="text-xs text-slate-500">
                  مؤشر الإنجاز ونسبة تحقيق المعدل اليومي المعتمد
                </p>
              </div>

              <button
                onClick={() => setActiveTab('stations')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>عرض كل المحطات ({stations.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {stations.slice(0, 6).map(st => {
                const rate = st.dailyTarget > 0 ? (st.actualSales / st.dailyTarget) * 100 : 100;
                const isCrit = rate < 75;
                const isWarn = rate < settings.alertThresholdPercent && !isCrit;

                return (
                  <div 
                    key={st.id} 
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-100">{st.name}</span>
                        <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {st.governorate}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-600 dark:text-slate-300">
                          <strong>{st.actualSales.toLocaleString('ar-EG')}</strong> / {st.dailyTarget.toLocaleString('ar-EG')} م³
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-black font-mono ${
                          isCrit 
                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' 
                            : isWarn 
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {rate.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCrit ? 'bg-red-500' : isWarn ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(rate, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Sector Performance & Downtime Causes Breakdown */}
        <div className="space-y-4">
          
          {/* Sector Breakdown */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
              {isAr ? 'توزيع المبيعات حسب القطاعات الجغرافية' : 'Sales by Sector'}
            </h3>

            <div className="space-y-2.5">
              {Object.entries(sectorSales).map(([sectorName, data]) => {
                const sectorRate = data.target > 0 ? (data.sales / data.target) * 100 : 100;
                return (
                  <div key={sectorName} className="text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{sectorName}</span>
                      <span className="font-mono font-bold text-slate-600 dark:text-slate-400">
                        {sectorRate.toFixed(1)}% ({data.sales.toLocaleString('ar-EG')} م³)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${sectorRate >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.min(sectorRate, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Downtime Causes Breakdown */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">
                {isAr ? 'أسباب ساعات التوقف الأكثر تأثيراً' : 'Top Breakdown Causes'}
              </h3>
              <button
                onClick={() => setActiveTab('downtime')}
                className="text-[11px] font-bold text-emerald-600 hover:underline"
              >
                التفاصيل
              </button>
            </div>

            <div className="space-y-2">
              {Object.entries(causeBreakdown).map(([cause, hours]) => (
                <div key={cause} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{cause}</span>
                  <span className="font-bold font-mono text-amber-600 dark:text-amber-400">
                    {hours.toFixed(1)} س
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
