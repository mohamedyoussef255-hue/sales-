import React, { useState } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  Wrench, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Activity, 
  DollarSign, 
  Zap, 
  Fuel, 
  ShieldCheck,
  Search,
  Sliders,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DowntimeRecord, DowntimeCause } from '../types';

export const DowntimeTracker: React.FC = () => {
  const { 
    downtimeLogs, 
    stations, 
    settings, 
    addDowntimeRecord, 
    updateDowntimeRecord, 
    deleteDowntimeRecord,
    totalDowntimeHours, 
    totalLostSalesM3, 
    totalFinancialLossEGP 
  } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCause, setFilterCause] = useState<string>('all');
  const [filterStation, setFilterStation] = useState<string>('all');

  const [formStationId, setFormStationId] = useState(stations[0]?.id || '');
  const [formDuration, setFormDuration] = useState(3.0);
  const [formCause, setFormCause] = useState<DowntimeCause>('عطل ضواغط الغاز (الكمبروسر)');
  const [formReport, setFormReport] = useState('');
  const [formReportedBy, setFormReportedBy] = useState('');

  const isAr = settings.language === 'ar';

  const causesList = settings.customDropdownCauses || [
    'انخفاض ضغط الشبكة القومية',
    'عطل ضواغط الغاز (الكمبروسر)',
    'انقطاع أو عدم استقرار الكهرباء',
    'عطل مسدسات ونقاط التموين (Dispensers)',
    'صيانة وقائية مجدولة',
    'أعمال مدنية وتوسعات',
    'طوارئ وسلامة وصحة مهنية (HSE)',
    'أخرى'
  ];

  const handleCreateDowntime = (e: React.FormEvent) => {
    e.preventDefault();
    const st = stations.find(s => s.id === formStationId) || stations[0];
    const capacityPerHour = st?.maxCapacityPerHour || 1000;
    const estimatedLost = Math.round(formDuration * (capacityPerHour * 0.7)); // conservative loss
    const cost = estimatedLost * settings.gasPricePerM3;

    addDowntimeRecord({
      stationId: st?.id || 'st-new',
      stationName: st?.name || 'محطة كارجاس',
      date: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '11:00',
      durationHours: Number(formDuration),
      cause: formCause,
      affectedCompressors: 2,
      estimatedLostSales: estimatedLost,
      lossCostEGP: cost,
      status: 'ongoing',
      technicianReport: formReport || 'تم تسجيل البلاغ بواسطة غرفة العمليات',
      reportedBy: formReportedBy || 'مهندس الموقع'
    });

    setShowAddForm(false);
    setFormReport('');
  };

  const filteredLogs = downtimeLogs.filter(d => {
    const matchCause = filterCause === 'all' || d.cause === filterCause;
    const matchStation = filterStation === 'all' || d.stationId === filterStation;
    return matchCause && matchStation;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header & KPI Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-500" />
            <span>{isAr ? 'تحليل ساعات التوقف والأعطال وحساب الفاقد' : 'Downtime & Breakdown Analysis'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            رصد الأعطال الفنية والتشغيلية، انقطاع الضغوط، واحتساب الفاقد المالي بدقة متناهية
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'إغلاق النموذج' : 'تسجيل بلاغ عطل / توقف جديد'}</span>
        </button>
      </div>

      {/* Top 3 Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-900 dark:text-slate-100 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500 text-slate-950 font-black">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">إجمالي ساعات التوقف</div>
            <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
              {totalDowntimeHours} <span className="text-xs font-normal">ساعة</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-slate-900 dark:text-slate-100 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500 text-white font-black">
            <Fuel className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">الفاقد التقديري في حجم الغاز</div>
            <div className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
              {totalLostSalesM3.toLocaleString('ar-EG')} <span className="text-xs font-normal">م³</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-slate-900 dark:text-slate-100 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-600 text-white font-black">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">الفاقد المالي بالجنيه المصري</div>
            <div className="text-2xl font-black font-mono text-red-600 dark:text-red-400">
              {totalFinancialLossEGP.toLocaleString('ar-EG')} <span className="text-xs font-normal">ج.م</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Downtime Form Dropdown */}
      {showAddForm && (
        <form onSubmit={handleCreateDowntime} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/40 shadow-lg space-y-4 animate-fadeIn">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Wrench className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
              تسجيل حالة توقف أو عطل تشغيلي
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">المحطة المتأثرة</label>
              <select
                value={formStationId}
                onChange={(e) => setFormStationId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                {stations.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.governorate})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">سبب التوقف / العطل</label>
              <select
                value={formCause}
                onChange={(e) => setFormCause(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                {causesList.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">مدة التوقف (بالساعات)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                required
                value={formDuration}
                onChange={(e) => setFormDuration(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">المسؤول عن البلاغ</label>
              <input
                type="text"
                placeholder="اسم المهندس / الفني"
                value={formReportedBy}
                onChange={(e) => setFormReportedBy(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">ملاحظات وتقرير الفني</label>
            <textarea
              rows={2}
              placeholder="وصف تفصيلي للعطل (مثال: ارتفاع درجة حرارة زيت الضاغط رقم 1 وهبوط ضغط الدخول لـ 10 بار)..."
              value={formReport}
              onChange={(e) => setFormReport(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm"
            >
              حفظ البلاغ واحتساب الفاقد
            </button>
          </div>
        </form>
      )}

      {/* Filter bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-bold">
          <Filter className="w-4 h-4" />
          <span>تصفية السجلات:</span>
        </div>

        <select
          value={filterCause}
          onChange={(e) => setFilterCause(e.target.value)}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
        >
          <option value="all">كافة الأسباب ({downtimeLogs.length})</option>
          {causesList.map((c, i) => (
            <option key={i} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={filterStation}
          onChange={(e) => setFilterStation(e.target.value)}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
        >
          <option value="all">كافة المحطات</option>
          {stations.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Downtime Records List */}
      <div className="space-y-3">
        {filteredLogs.map(rec => (
          <div
            key={rec.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-500/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  {rec.stationName}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  rec.status === 'ongoing' 
                    ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 animate-pulse' 
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {rec.status === 'ongoing' ? 'عطل جاري' : 'تم الإصلاح'}
                </span>
              </div>

              <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{rec.cause}</span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                {rec.technicianReport || 'لا يوجد تقرير فني مسجل'}
              </p>

              <div className="text-[11px] text-slate-400">
                التاريخ: {rec.date} • البلاغ بواسطة: {rec.reportedBy || 'المشرف'}
              </div>
            </div>

            {/* Metrics column */}
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
              <div className="text-center">
                <div className="text-[10px] text-slate-400">مدة التوقف</div>
                <div className="text-base font-black font-mono text-slate-800 dark:text-slate-100">
                  {rec.durationHours} س
                </div>
              </div>

              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />

              <div className="text-center">
                <div className="text-[10px] text-slate-400">الفاقد (م³)</div>
                <div className="text-base font-black font-mono text-blue-600 dark:text-blue-400">
                  {rec.estimatedLostSales.toLocaleString('ar-EG')}
                </div>
              </div>

              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />

              <div className="text-center">
                <div className="text-[10px] text-slate-400">الخسارة (ج.م)</div>
                <div className="text-base font-black font-mono text-red-600 dark:text-red-400">
                  {rec.lossCostEGP.toLocaleString('ar-EG')}
                </div>
              </div>

              <div className="flex flex-col gap-1 pr-2">
                {rec.status === 'ongoing' && (
                  <button
                    onClick={() => updateDowntimeRecord(rec.id, { status: 'resolved' })}
                    title="تأكيد اكتمال الإصلاح"
                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteDowntimeRecord(rec.id)}
                  title="حذف السجل"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
