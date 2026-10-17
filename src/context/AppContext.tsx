import React, { createContext, useContext, useState, useEffect } from 'react';
import { Station, DowntimeRecord, AppSettings, UploadedFileMeta, SmartAlert, AlertSeverity } from '../types';
import { INITIAL_STATIONS, INITIAL_DOWNTIME_LOGS, INITIAL_SETTINGS } from '../data/initialData';

interface AppContextType {
  stations: Station[];
  downtimeLogs: DowntimeRecord[];
  settings: AppSettings;
  uploadedFiles: UploadedFileMeta[];
  alerts: SmartAlert[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  adminModalOpen: boolean;
  setAdminModalOpen: (open: boolean) => void;
  
  // Actions
  addStation: (station: Omit<Station, 'id'>) => void;
  updateStation: (id: string, updates: Partial<Station>) => void;
  deleteStation: (id: string) => void;
  importStationsBatch: (newStations: Station[]) => void;

  addDowntimeRecord: (record: Omit<DowntimeRecord, 'id'>) => void;
  updateDowntimeRecord: (id: string, updates: Partial<DowntimeRecord>) => void;
  deleteDowntimeRecord: (id: string) => void;
  importDowntimeBatch: (records: DowntimeRecord[]) => void;

  addUploadedFile: (file: UploadedFileMeta) => void;
  removeUploadedFile: (id: string) => void;

  updateSettings: (newSettings: Partial<AppSettings>) => void;
  toggleDarkMode: () => void;
  changeLanguage: (lang: 'ar' | 'en') => void;
  acknowledgeAlert: (alertId: string) => void;

  // Computed KPIs
  totalSales: number;
  totalTarget: number;
  overallAchievementRate: number;
  criticalStationsCount: number;
  warningStationsCount: number;
  totalDowntimeHours: number;
  totalLostSalesM3: number;
  totalFinancialLossEGP: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load stored state if available, else initial data
  const [stations, setStations] = useState<Station[]>(() => {
    try {
      const saved = localStorage.getItem('cargas_stations');
      return saved ? JSON.parse(saved) : INITIAL_STATIONS;
    } catch {
      return INITIAL_STATIONS;
    }
  });

  const [downtimeLogs, setDowntimeLogs] = useState<DowntimeRecord[]>(() => {
    try {
      const saved = localStorage.getItem('cargas_downtime');
      return saved ? JSON.parse(saved) : INITIAL_DOWNTIME_LOGS;
    } catch {
      return INITIAL_DOWNTIME_LOGS;
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('cargas_settings');
      return saved ? { ...INITIAL_SETTINGS, ...JSON.parse(saved) } : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileMeta[]>([]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);
  const [acknowledgedAlertIds, setAcknowledgedAlertIds] = useState<string[]>([]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('cargas_stations', JSON.stringify(stations));
  }, [stations]);

  useEffect(() => {
    localStorage.setItem('cargas_downtime', JSON.stringify(downtimeLogs));
  }, [downtimeLogs]);

  useEffect(() => {
    localStorage.setItem('cargas_settings', JSON.stringify(settings));
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.setAttribute('dir', settings.language === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', settings.language);
  }, [settings]);

  // Generate Smart Alerts dynamically based on threshold
  const alerts: SmartAlert[] = stations.map(s => {
    const achievementRate = s.dailyTarget > 0 ? (s.actualSales / s.dailyTarget) * 100 : 100;
    const deficitVolume = Math.max(0, s.dailyTarget - s.actualSales);

    let severity: AlertSeverity = 'normal';
    let reason = 'الأداء ضمن المعدلات الطبيعية';

    if (achievementRate < 75) {
      severity = 'critical';
      reason = `انخفاض حاد في المبيعات بنسبة ${achievementRate.toFixed(1)}% فقط من المستهدف وعجز قدره ${deficitVolume.toLocaleString()} م³`;
    } else if (achievementRate < settings.alertThresholdPercent) {
      severity = 'warning';
      reason = `المبيعات أقل من الحد الأدنى المستهدف (${settings.alertThresholdPercent}%) بفارق ${deficitVolume.toLocaleString()} م³`;
    } else if (achievementRate >= 105) {
      severity = 'exceptional';
      reason = `تجاوز متميز للمستهدف بنسبة ${achievementRate.toFixed(1)}%`;
    }

    return {
      id: `alert-${s.id}`,
      stationId: s.id,
      stationName: s.name,
      governorate: s.governorate,
      severity,
      achievementRate,
      deficitVolume,
      reason,
      timestamp: s.lastUpdated,
      acknowledged: acknowledgedAlertIds.includes(`alert-${s.id}`)
    };
  }).filter(a => a.severity === 'critical' || a.severity === 'warning');

  // Computed KPIs
  const totalSales = stations.reduce((acc, s) => acc + (Number(s.actualSales) || 0), 0);
  const totalTarget = stations.reduce((acc, s) => acc + (Number(s.dailyTarget) || 0), 0);
  const overallAchievementRate = totalTarget > 0 ? Number(((totalSales / totalTarget) * 100).toFixed(1)) : 100;
  const criticalStationsCount = alerts.filter(a => a.severity === 'critical').length;
  const warningStationsCount = alerts.filter(a => a.severity === 'warning').length;
  const totalDowntimeHours = Number(downtimeLogs.reduce((acc, d) => acc + (Number(d.durationHours) || 0), 0).toFixed(1));
  const totalLostSalesM3 = downtimeLogs.reduce((acc, d) => acc + (Number(d.estimatedLostSales) || 0), 0);
  const totalFinancialLossEGP = totalLostSalesM3 * settings.gasPricePerM3;

  // Station Handlers
  const addStation = (station: Omit<Station, 'id'>) => {
    const newStation: Station = {
      ...station,
      id: `st-${Date.now()}`
    };
    setStations(prev => [newStation, ...prev]);
  };

  const updateStation = (id: string, updates: Partial<Station>) => {
    setStations(prev => prev.map(s => s.id === id ? { ...s, ...updates, lastUpdated: 'الآن' } : s));
  };

  const deleteStation = (id: string) => {
    setStations(prev => prev.filter(s => s.id !== id));
  };

  const importStationsBatch = (newStations: Station[]) => {
    setStations(prev => {
      // Merge or append by code/name
      const existingCodes = new Set(prev.map(s => s.code));
      const filteredNew = newStations.filter(s => !existingCodes.has(s.code));
      return [...filteredNew, ...prev];
    });
  };

  // Downtime Handlers
  const addDowntimeRecord = (record: Omit<DowntimeRecord, 'id'>) => {
    const newRecord: DowntimeRecord = {
      ...record,
      id: `dt-${Date.now()}`
    };
    setDowntimeLogs(prev => [newRecord, ...prev]);
  };

  const updateDowntimeRecord = (id: string, updates: Partial<DowntimeRecord>) => {
    setDowntimeLogs(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDowntimeRecord = (id: string) => {
    setDowntimeLogs(prev => prev.filter(d => d.id !== id));
  };

  const importDowntimeBatch = (records: DowntimeRecord[]) => {
    setDowntimeLogs(prev => [...records, ...prev]);
  };

  // File Handlers
  const addUploadedFile = (file: UploadedFileMeta) => {
    setUploadedFiles(prev => [file, ...prev]);
  };

  const removeUploadedFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  // Settings Handlers
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleDarkMode = () => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const changeLanguage = (lang: 'ar' | 'en') => {
    setSettings(prev => ({ ...prev, language: lang }));
  };

  const acknowledgeAlert = (alertId: string) => {
    setAcknowledgedAlertIds(prev => [...prev, alertId]);
  };

  return (
    <AppContext.Provider
      value={{
        stations,
        downtimeLogs,
        settings,
        uploadedFiles,
        alerts,
        activeTab,
        setActiveTab,
        isAdmin,
        setIsAdmin,
        adminModalOpen,
        setAdminModalOpen,
        addStation,
        updateStation,
        deleteStation,
        importStationsBatch,
        addDowntimeRecord,
        updateDowntimeRecord,
        deleteDowntimeRecord,
        importDowntimeBatch,
        addUploadedFile,
        removeUploadedFile,
        updateSettings,
        toggleDarkMode,
        changeLanguage,
        acknowledgeAlert,
        totalSales,
        totalTarget,
        overallAchievementRate,
        criticalStationsCount,
        warningStationsCount,
        totalDowntimeHours,
        totalLostSalesM3,
        totalFinancialLossEGP,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
