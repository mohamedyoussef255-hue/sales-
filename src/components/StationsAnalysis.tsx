import React, { useState } from 'react';
import { 
  Fuel, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Edit2, 
  Trash2, 
  ArrowUpDown, 
  Activity, 
  SlidersHorizontal,
  ChevronRight,
  Gauge
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Station, Governorate } from '../types';
import { exportStationsToExcel } from '../services/fileParserService';

export const StationsAnalysis: React.FC = () => {
  const { 
    stations, 
    settings, 
    updateStation, 
    deleteStation, 
    addStation,
    setAdminModalOpen 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGov, setSelectedGov] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'achievement_asc' | 'achievement_desc' | 'target_desc' | 'sales_desc'>('achievement_asc');
  
  // Quick Edit Target Modal state
  const [editingTargetStation, setEditingTargetStation] = useState<Station | null>(null);
  const [newTargetValue, setNewTargetValue] = useState<number>(0);

  const isAr = settings.language === 'ar';

  const governorates: Governorate[] = [
    'القاهرة', 'الجيزة', 'الإسكندرية', 'القليوبية', 'السويس', 
    'بورسعيد', 'الشرقية', 'الغربية', 'الدقهلية', 'أسيوط', 'سوهاج', 'قنا'
  ];

  // Filtering
  const filteredStations = stations.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.governorate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGov = selectedGov === 'all' || s.governorate === selectedGov;
    
    const rate = s.dailyTarget > 0 ? (s.actualSales / s.dailyTarget) * 100 : 100;
    let matchesStatus = true;
    if (selectedStatus === 'critical') matchesStatus = rate < 75;
    else if (selectedStatus === 'warning') matchesStatus = rate >= 75 && rate < settings.alertThresholdPercent;
    else if (selectedStatus === 'good') matchesStatus = rate >= settings.alertThresholdPercent;
    else if (selectedStatus === 'maintenance') matchesStatus = s.status === 'maintenance' || s.status === 'low_pressure';

    return matchesSearch && matchesGov && matchesStatus;
  });

  // Sorting
  filteredStations.sort((a, b) => {
    const rateA = a.dailyTarget > 0 ? (a.actualSales / a.dailyTarget) * 100 : 100;
    const rateB = b.dailyTarget > 0 ? (b.actualSales / b.dailyTarget) * 100 : 100;

    if (sortBy === 'achievement_asc') return rateA - rateB;
    if (sortBy === 'achievement_desc') return rateB - rateA;
    if (sortBy === 'target_desc') return b.dailyTarget - a.dailyTarget;
    if (sortBy === 'sales_desc') return b.actualSales - a.actualSales;
    return 0;
  });

  const handleOpenEditTarget = (st: Station) => {
    setEditingTargetStation(st);
    setNewTargetValue(st.dailyTarget);
  };

  const handleSaveTarget = () => {
    if (editingTargetStation && newTargetValue > 0) {
      updateStation(editingTargetStation.id, { dailyTarget: newTargetValue });
      setEditingTargetStation(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Fuel className="w-6 h-6 text-emerald-600" />
            <span>{isAr ? 'تحليل مبيعات المحطات والمستهدف اليومي' : 'CNG Stations Sales & Target Analysis'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isAr 
              ? `إجمالي المحطات المسجلة: ${stations.length} محطة • عتبة التحذير الحالية: ${settings.alertThresholdPercent}%` 
              : `Total Stations: ${stations.length} • Current Warning Threshold: ${settings.alertThresholdPercent}%`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => exportStationsToExcel(stations)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>{isAr ? 'تصدير إكسيل' : 'Export Excel'}</span>
          </button>

          <button
            onClick={() => setAdminModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة محطة جديدة' : 'Add Station'}</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم أو الكود..."
            className="w-full text-xs pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Governorate Filter */}
        <div>
          <select
            value={selectedGov}
            onChange={(e) => setSelectedGov(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">كافة المحافظات ({stations.length})</option>
            {governorates.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">جميع الحالات ومستويات الأداء</option>
            <option value="critical">🚨 المحطات الحرجة فقط (&lt; 75%)</option>
            <option value="warning">⚠️ المحطات في دائرة التحذير (&lt; {settings.alertThresholdPercent}%)</option>
            <option value="good">✅ المحطات المستقرة والمتفوقة (&gt;= {settings.alertThresholdPercent}%)</option>
            <option value="maintenance">🔧 محطات تحت الصيانة أو هبوط الضغط</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="achievement_asc">الأقل تحقيقاً للمستهدف أولاً (الأكثر عجزاً)</option>
            <option value="achievement_desc">الأعلى تحقيقاً للمستهدف أولاً</option>
            <option value="sales_desc">الأعلى في حجم المبيعات (م³)</option>
            <option value="target_desc">الأعلى في المستهدف اليومي (م³)</option>
          </select>
        </div>

      </div>

      {/* Stations Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold">
              <tr>
                <th className="py-3.5 px-4">المحطة والكود</th>
                <th className="py-3.5 px-4">الموقع والقطاع</th>
                <th className="py-3.5 px-4 text-center">المستهدف اليومي</th>
                <th className="py-3.5 px-4 text-center">المبيعات الفعلية</th>
                <th className="py-3.5 px-4 text-center">نسبة التحقيق</th>
                <th className="py-3.5 px-4 text-center">الفارق (عجز / فائض)</th>
                <th className="py-3.5 px-4 text-center">المعدات والحالة</th>
                <th className="py-3.5 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStations.map(st => {
                const rate = st.dailyTarget > 0 ? (st.actualSales / st.dailyTarget) * 100 : 100;
                const diff = st.actualSales - st.dailyTarget;
                const isCrit = rate < 75;
                const isWarn = rate < settings.alertThresholdPercent && !isCrit;

                return (
                  <tr 
                    key={st.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      isCrit ? 'bg-red-500/5' : isWarn ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    {/* Station Name & Code */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        {isCrit && <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />}
                        <span>{st.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {st.code} • {st.managerName || 'إدارة التشغيل'}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <div className="font-semibold">{st.governorate}</div>
                      <div className="text-[10px] text-slate-400">{st.sector}</div>
                    </td>

                    {/* Daily Target */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-200">
                      {st.dailyTarget.toLocaleString('ar-EG')} م³
                    </td>

                    {/* Actual Sales */}
                    <td className="py-3.5 px-4 text-center font-mono font-extrabold text-slate-900 dark:text-slate-100">
                      {st.actualSales.toLocaleString('ar-EG')} م³
                    </td>

                    {/* Achievement Rate */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black font-mono shadow-xs ${
                        isCrit 
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-800' 
                          : isWarn 
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          : rate >= 105
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                      }`}>
                        {rate.toFixed(1)}%
                      </span>
                    </td>

                    {/* Diff */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold">
                      <span className={diff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                        {diff >= 0 ? `+${diff.toLocaleString('ar-EG')}` : diff.toLocaleString('ar-EG')} م³
                      </span>
                    </td>

                    {/* Equipment & Status */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                          {st.compressorCount} ضواغط
                        </span>
                        <span className={`px-2 py-0.5 rounded ${
                          st.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' 
                            : st.status === 'low_pressure'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400'
                        }`}>
                          {st.status === 'active' ? 'نشطة' : st.status === 'low_pressure' ? 'ضغط منخفض' : 'صيانة'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditTarget(st)}
                          title="تعديل المستهدف اليومي"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteStation(st.id)}
                          title="حذف المحطة"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Target Edit Dialog */}
      {editingTargetStation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              تعديل المستهدف اليومي لمحطة:
            </h3>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {editingTargetStation.name} ({editingTargetStation.governorate})
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                المستهدف اليومي الجديد (م³/اليوم):
              </label>
              <input
                type="number"
                value={newTargetValue}
                onChange={(e) => setNewTargetValue(Number(e.target.value))}
                className="w-full text-base font-mono font-bold p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingTargetStation(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveTarget}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
              >
                تطبيق وحفظ المستهدف
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
