import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  ShieldCheck, 
  Settings, 
  Fuel, 
  Bot, 
  Sliders, 
  Palette, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  Save
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Station, Governorate, Sector } from '../types';

export const AdminModal: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    adminModalOpen, 
    setAdminModalOpen, 
    isAdmin, 
    setIsAdmin,
    stations,
    addStation,
    updateStation,
    deleteStation 
  } = useApp();

  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [adminTab, setAdminTab] = useState<'stations' | 'moain' | 'dropdowns' | 'system' | 'security'>('stations');

  // Station Form State
  const [editingStationId, setEditingStationId] = useState<string | null>(null);
  const [stationForm, setStationForm] = useState<Partial<Station>>({
    name: '',
    code: '',
    governorate: 'القاهرة',
    sector: 'القاهرة الكبرى',
    dailyTarget: 20000,
    actualSales: 18000,
    compressorCount: 3,
    dispenserCount: 8,
    status: 'active',
    managerName: '',
    managerPhone: '',
    notes: ''
  });

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  // New Dropdown cause input
  const [newCauseInput, setNewCauseInput] = useState('');
  // New Moain allowed topic input
  const [newTopicInput, setNewTopicInput] = useState('');

  if (!adminModalOpen) return null;

  const isAr = settings.language === 'ar';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPassword === settings.adminPasswordHash) {
      setIsAdmin(true);
      setPasswordError(false);
      setEnteredPassword('');
    } else {
      setPasswordError(true);
    }
  };

  const handleSaveStation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stationForm.name || !stationForm.dailyTarget) return;

    if (editingStationId) {
      updateStation(editingStationId, stationForm);
      setEditingStationId(null);
    } else {
      addStation({
        code: stationForm.code || `CG-${Date.now().toString().slice(-4)}`,
        name: stationForm.name,
        governorate: (stationForm.governorate as Governorate) || 'القاهرة',
        sector: (stationForm.sector as Sector) || 'القاهرة الكبرى',
        dailyTarget: Number(stationForm.dailyTarget) || 20000,
        actualSales: Number(stationForm.actualSales) || 0,
        compressorCount: Number(stationForm.compressorCount) || 3,
        dispenserCount: Number(stationForm.dispenserCount) || 8,
        maxCapacityPerHour: Math.round((Number(stationForm.dailyTarget) || 20000) / 16),
        status: stationForm.status || 'active',
        managerName: stationForm.managerName || '',
        managerPhone: stationForm.managerPhone || '',
        notes: stationForm.notes || '',
        lastUpdated: 'الآن'
      });
    }

    setStationForm({
      name: '',
      code: '',
      governorate: 'القاهرة',
      sector: 'القاهرة الكبرى',
      dailyTarget: 20000,
      actualSales: 18000,
      compressorCount: 3,
      dispenserCount: 8,
      status: 'active',
      managerName: '',
      managerPhone: '',
      notes: ''
    });
  };

  const handleEditClick = (station: Station) => {
    setEditingStationId(station.id);
    setStationForm(station);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword === confirmPassword) {
      updateSettings({ adminPasswordHash: newPassword });
      setPasswordChangeSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordChangeSuccess(false), 3000);
    }
  };

  const handleAddCause = () => {
    if (!newCauseInput.trim()) return;
    const current = settings.customDropdownCauses || [];
    if (!current.includes(newCauseInput.trim())) {
      updateSettings({ customDropdownCauses: [...current, newCauseInput.trim()] });
    }
    setNewCauseInput('');
  };

  const handleRemoveCause = (causeToRemove: string) => {
    const current = settings.customDropdownCauses || [];
    updateSettings({ customDropdownCauses: current.filter(c => c !== causeToRemove) });
  };

  const handleAddTopic = () => {
    if (!newTopicInput.trim()) return;
    const current = settings.moainAllowedTopics || [];
    if (!current.includes(newTopicInput.trim())) {
      updateSettings({ moainAllowedTopics: [...current, newTopicInput.trim()] });
    }
    setNewTopicInput('');
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    const current = settings.moainAllowedTopics || [];
    updateSettings({ moainAllowedTopics: current.filter(t => t !== topicToRemove) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                {isAr ? 'لوحة تحكم مدير النظام (Super Admin)' : 'Super Admin Management Console'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr 
                  ? 'التحكم الشامل في المحطات، القوائم، عتبات الإنذار، والمساعد الذكي مُعين' 
                  : 'Full control over stations, dropdowns, thresholds & AI assistant'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => setIsAdmin(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isAr ? 'خروج من الإدارة' : 'Logout Admin'}</span>
              </button>
            )}
            <button
              onClick={() => setAdminModalOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Password Screen if not logged in */}
        {!isAdmin ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 ring-8 ring-amber-500/5">
              <Lock className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-2">
              {isAr ? 'منطقة مدير النظام المحمية' : 'Restricted Admin Area'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6">
              {isAr 
                ? 'برجاء إدخال كلمة سر المدير لفتح التحكم الشامل بالتطبيق. كلمة السر الافتراضية هي: 0000' 
                : 'Please enter the admin password. Default password is: 0000'}
            </p>

            <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
              <div>
                <input
                  type="password"
                  value={enteredPassword}
                  onChange={(e) => setEnteredPassword(e.target.value)}
                  placeholder="••••"
                  autoFocus
                  maxLength={16}
                  className="w-full text-center text-2xl tracking-widest font-mono py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {passwordError && (
                  <p className="text-xs text-red-500 mt-2 font-medium flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {isAr ? 'كلمة السر غير صحيحة، حاول مرة ثانية (الافتراضي: 0000)' : 'Incorrect password (default: 0000)'}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm shadow-md hover:from-amber-600 hover:to-amber-700 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isAr ? 'دخول لوحة المدير' : 'Enter Admin Console'}</span>
              </button>
            </form>
          </div>
        ) : (
          /* Logged In Admin Console */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-56 bg-slate-50 dark:bg-slate-800/50 p-3 border-b md:border-b-0 md:border-l border-slate-200 dark:border-slate-700 flex md:flex-col gap-1 overflow-x-auto">
              <button
                onClick={() => setAdminTab('stations')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-right ${
                  adminTab === 'stations' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                }`}
              >
                <Fuel className="w-4 h-4" />
                <span>{isAr ? 'المحطات والمستهدف' : 'Stations & Targets'}</span>
              </button>

              <button
                onClick={() => setAdminTab('moain')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-right ${
                  adminTab === 'moain' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>{isAr ? 'التحكم في المساعد مُعين' : 'Moain AI Control'}</span>
              </button>

              <button
                onClick={() => setAdminTab('dropdowns')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-right ${
                  adminTab === 'dropdowns' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>{isAr ? 'القوائم والتصنيفات' : 'Dropdowns & Labels'}</span>
              </button>

              <button
                onClick={() => setAdminTab('system')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-right ${
                  adminTab === 'system' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>{isAr ? 'التنبيهات والأسعار' : 'Alerts & Pricing'}</span>
              </button>

              <button
                onClick={() => setAdminTab('security')}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-right ${
                  adminTab === 'security' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>{isAr ? 'كلمة السر والأمان' : 'Security'}</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 p-6 overflow-y-auto">
              
              {/* TAB 1: Stations Management */}
              {adminTab === 'stations' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mb-1">
                      {editingStationId ? (isAr ? 'تعديل بيانات المحطة' : 'Edit Station') : (isAr ? 'إضافة محطة غاز جديدة' : 'Add New CNG Station')}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isAr ? 'تحكم كامل في المستهدف اليومي، المبيعات الفعلية، وعدد الضواغط' : 'Full control over daily targets, sales and compressors'}
                    </p>
                  </div>

                  <form onSubmit={handleSaveStation} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">اسم المحطة</label>
                      <input
                        type="text"
                        required
                        value={stationForm.name}
                        onChange={(e) => setStationForm({ ...stationForm, name: e.target.value })}
                        placeholder="مثال: كارجاس - النزهة الجديدة"
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">كود المحطة</label>
                      <input
                        type="text"
                        value={stationForm.code}
                        onChange={(e) => setStationForm({ ...stationForm, code: e.target.value })}
                        placeholder="مثال: CG-CAI-05"
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">المحافظة</label>
                      <select
                        value={stationForm.governorate}
                        onChange={(e) => setStationForm({ ...stationForm, governorate: e.target.value as Governorate })}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      >
                        <option value="القاهرة">القاهرة</option>
                        <option value="الجيزة">الجيزة</option>
                        <option value="الإسكندرية">الإسكندرية</option>
                        <option value="القليوبية">القليوبية</option>
                        <option value="السويس">السويس</option>
                        <option value="بورسعيد">بورسعيد</option>
                        <option value="الشرقية">الشرقية</option>
                        <option value="الغربية">الغربية</option>
                        <option value="الدقهلية">الدقهلية</option>
                        <option value="أسيوط">أسيوط</option>
                        <option value="سوهاج">سوهاج</option>
                        <option value="قنا">قنا</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">المستهدف اليومي (م³)</label>
                      <input
                        type="number"
                        required
                        value={stationForm.dailyTarget}
                        onChange={(e) => setStationForm({ ...stationForm, dailyTarget: Number(e.target.value) })}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">المبيعات الفعلية (م³)</label>
                      <input
                        type="number"
                        value={stationForm.actualSales}
                        onChange={(e) => setStationForm({ ...stationForm, actualSales: Number(e.target.value) })}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">حالة التشغيل</label>
                      <select
                        value={stationForm.status}
                        onChange={(e) => setStationForm({ ...stationForm, status: e.target.value as any })}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      >
                        <option value="active">نشطة ومستقرة</option>
                        <option value="low_pressure">انخفاض ضغط الشبكة</option>
                        <option value="maintenance">صيانة وضواغط متوقفة</option>
                        <option value="offline">متوقفة بالكامل</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2 pt-2">
                      {editingStationId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStationId(null);
                            setStationForm({ name: '', dailyTarget: 20000, actualSales: 18000 });
                          }}
                          className="px-4 py-2 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        >
                          إلغاء التعديل
                        </button>
                      )}
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{editingStationId ? 'حفظ التعديلات' : 'إضافة المحطة الآن'}</span>
                      </button>
                    </div>
                  </form>

                  {/* Stations List Table for Admin */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-200">
                      قائمة المحطات المسجلة ({stations.length} محطة)
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-60 overflow-y-auto text-xs">
                      {stations.map(st => (
                        <div key={st.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-100">{st.name}</div>
                            <div className="text-[11px] text-slate-500">
                              {st.governorate} • مستهدف: {st.dailyTarget.toLocaleString()} م³ • مبيعات: {st.actualSales.toLocaleString()} م³
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditClick(st)}
                              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                              title="تعديل"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteStation(st.id)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Moain AI Assistant Control */}
              {adminTab === 'moain' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mb-1">
                      {isAr ? 'التحكم في المساعد الذكي مُعين' : 'Moain AI Assistant Policy & Behavior'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isAr 
                        ? 'تفعيل/إخفاء مُعين، وضبط المواضيع والمهام المسموح له بشرحها للعملاء والمستخدمين' 
                        : 'Enable/disable Moain and curate permitted knowledge boundaries'}
                    </p>
                  </div>

                  {/* Toggle Moain Visibility */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 block">
                        {isAr ? 'إظهار المساعد مُعين في واجهة المستخدم' : 'Enable Moain in User Interface'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {isAr ? 'في حالة التعطيل، يظل متاحاً فقط لمدير النظام ويكون مخفياً للمستخدمين العاديين' : 'When disabled, Moain is hidden from standard users'}
                      </span>
                    </div>
                    <button
                      onClick={() => updateSettings({ moainEnabled: !settings.moainEnabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.moainEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.moainEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Moain Permitted Topics */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        قائمة المهام والمواضيع المسموح لمُعين بالتحدث عنها والشرح للعملاء:
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTopicInput}
                        onChange={(e) => setNewTopicInput(e.target.value)}
                        placeholder="أضف تصريح موضوع جديد (مثال: طريقة عمل الضواغط والكمبروسر)..."
                        className="flex-1 text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                      <button
                        onClick={handleAddTopic}
                        className="px-4 py-2.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة تصريح</span>
                      </button>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      {(settings.moainAllowedTopics || []).map((topic, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs">
                          <span className="text-slate-700 dark:text-slate-200 flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            {topic}
                          </span>
                          <button
                            onClick={() => handleRemoveTopic(topic)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="حذف هذا الموضوع"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Dropdowns & Labels */}
              {adminTab === 'dropdowns' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mb-1">
                      {isAr ? 'التحكم في القوائم المنسدلة والتصنيفات' : 'Custom Dropdowns & Fault Classifications'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isAr ? 'تعديل وحذف وإضافة أسباب التوقف والأعطال التي تظهر في نماذج التسجيل' : 'Customize options for downtime causes and dropdowns'}
                    </p>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                      أسباب التوقف والأعطال المعتمدة في النظام:
                    </span>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCauseInput}
                        onChange={(e) => setNewCauseInput(e.target.value)}
                        placeholder="أضف سبباً جديداً للأعطال (مثال: صيانة محبس عزل الشبكة)..."
                        className="flex-1 text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                      <button
                        onClick={handleAddCause}
                        className="px-4 py-2.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة خيار</span>
                      </button>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      {(settings.customDropdownCauses || []).map((cause, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs">
                          <span className="text-slate-700 dark:text-slate-200 font-medium">
                            {cause}
                          </span>
                          <button
                            onClick={() => handleRemoveCause(cause)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Alerts & Pricing System */}
              {adminTab === 'system' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mb-1">
                      {isAr ? 'عتبات التنبيهات والبارامترات المالية' : 'Alert Thresholds & Economic Parameters'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isAr ? 'تحديد نسبة إطلاق جرس الإنذار وسعر بيع متر الغاز لحساب الفاقد' : 'Define threshold percentages and unit price for loss calculations'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                        عتبة الإنذار لانخفاض المبيعات (%)
                      </label>
                      <p className="text-[11px] text-slate-500">
                        أي محطة تحقق أقل من هذه النسبة سيتم تصنيفها تلقائياً كمحطة متأخرة أو حرجة وإطلاق تنبيه
                      </p>
                      <div className="flex items-center gap-3 pt-2">
                        <input
                          type="range"
                          min="50"
                          max="95"
                          step="1"
                          value={settings.alertThresholdPercent}
                          onChange={(e) => updateSettings({ alertThresholdPercent: Number(e.target.value) })}
                          className="flex-1 accent-emerald-600"
                        />
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 min-w-12 text-center">
                          {settings.alertThresholdPercent}%
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                        سعر متر الغاز الطبيعي المضغوط (جنيه / م³)
                      </label>
                      <p className="text-[11px] text-slate-500">
                        يُستخدم لاحتساب الفاقد المالي الناجم عن ساعات التوقف والأعطال
                      </p>
                      <input
                        type="number"
                        step="0.25"
                        value={settings.gasPricePerM3}
                        onChange={(e) => updateSettings({ gasPricePerM3: Number(e.target.value) })}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: Security */}
              {adminTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mb-1">
                      {isAr ? 'أمان النظام وتغيير كلمة السر' : 'Admin Security & Password'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isAr ? 'تغيير كلمة السر الافتراضية (0000) لحماية إعدادات لوحة التحكم' : 'Update default password (0000) for security'}
                    </p>
                  </div>

                  <form onSubmit={handleChangePassword} className="max-w-md space-y-4 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        كلمة السر الجديدة للمدير
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="أدخل كلمة السر الجديدة"
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        تأكيد كلمة السر الجديدة
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="أعد إدخال كلمة السر"
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>

                    {passwordChangeSuccess && (
                      <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                        <Check className="w-4 h-4" />
                        <span>تم تحديث كلمة سر المدير بنجاح وحفظها!</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>حفظ كلمة السر الجديدة</span>
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
