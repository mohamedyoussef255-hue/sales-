export type AlertSeverity = 'critical' | 'warning' | 'normal' | 'exceptional';

export type Governorate = 
  | 'القاهرة' 
  | 'الجيزة' 
  | 'الإسكندرية' 
  | 'القليوبية' 
  | 'السويس' 
  | 'بورسعيد' 
  | 'الشرقية' 
  | 'الغربية' 
  | 'الدقهلية' 
  | 'أسيوط' 
  | 'سوهاج' 
  | 'قنا' 
  | 'البحر الأحمر';

export type Sector = 'القاهرة الكبرى' | 'الإسكندرية والساحل' | 'الدلتا والقناة' | 'شمال ووسط الصعيد' | 'جنوب الصعيد';

export interface Station {
  id: string;
  code: string;
  name: string;
  governorate: Governorate;
  sector: Sector;
  dailyTarget: number; // m³ per day
  actualSales: number; // m³ per day
  previousDaySales?: number;
  compressorCount: number;
  dispenserCount: number;
  maxCapacityPerHour: number; // m³ per hour
  managerName?: string;
  managerPhone?: string;
  notes?: string;
  status: 'active' | 'maintenance' | 'low_pressure' | 'offline';
  lastUpdated: string;
}

export type DowntimeCause = 
  | 'انخفاض ضغط الشبكة القومية' 
  | 'عطل ضواغط الغاز (الكمبروسر)' 
  | 'انقطاع أو عدم استقرار الكهرباء' 
  | 'عطل مسدسات ونقاط التموين (Dispensers)' 
  | 'صيانة وقائية مجدولة' 
  | 'أعمال مدنية وتوسعات' 
  | 'طوارئ وسلامة وصحة مهنية (HSE)' 
  | 'أخرى';

export interface DowntimeRecord {
  id: string;
  stationId: string;
  stationName: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  cause: DowntimeCause;
  affectedCompressors?: number;
  estimatedLostSales: number; // in m³
  lossCostEGP: number; // calculated with gas price
  status: 'resolved' | 'ongoing' | 'investigating';
  technicianReport?: string;
  reportedBy?: string;
}

export interface UploadedFileMeta {
  id: string;
  name: string;
  size: number;
  type: 'excel' | 'word' | 'pdf' | 'image' | 'powerpoint' | 'other';
  uploadDate: string;
  extractedSnippet?: string;
  parsedRowCount?: number;
  previewUrl?: string;
}

export interface AppSettings {
  language: 'ar' | 'en';
  darkMode: boolean;
  themeColor: 'emerald' | 'blue' | 'indigo' | 'amber' | 'slate';
  accentColor: string;
  adminPasswordHash: string; // default 0000
  alertThresholdPercent: number; // default 85%
  gasPricePerM3: number; // default 6.50 EGP
  moainEnabled: boolean;
  moainVoiceSpeed: number; // 0.8 - 1.2
  moainAutoSpeak: boolean;
  moainAllowedTopics: string[];
  customDropdownCauses: string[];
}

export interface SmartAlert {
  id: string;
  stationId: string;
  stationName: string;
  governorate: Governorate;
  severity: AlertSeverity;
  achievementRate: number; // %
  deficitVolume: number; // m³
  reason: string;
  timestamp: string;
  acknowledged: boolean;
}
