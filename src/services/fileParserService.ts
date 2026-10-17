import * as XLSX from 'xlsx';
import { Station, DowntimeRecord, Governorate, Sector } from '../types';

export interface ParsedFileResult {
  fileName: string;
  fileType: 'excel' | 'word' | 'pdf' | 'image' | 'powerpoint' | 'other';
  fileSize: number;
  extractedText: string;
  previewUrl?: string;
  stations?: Partial<Station>[];
  downtimeRecords?: Partial<DowntimeRecord>[];
  sheetNames?: string[];
  totalRows?: number;
}

export async function parseUploadedFile(file: File): Promise<ParsedFileResult> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  if (['xlsx', 'xls', 'csv'].includes(extension)) {
    return parseExcelFile(file);
  }

  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'].includes(extension)) {
    return parseImageFile(file);
  }

  if (['pdf', 'docx', 'doc', 'pptx', 'ppt', 'txt'].includes(extension)) {
    return parseDocumentFile(file, extension);
  }

  return {
    fileName: file.name,
    fileType: 'other',
    fileSize: file.size,
    extractedText: `ملف مرفوع: ${file.name} بحجم ${(file.size / 1024).toFixed(1)} ك.ب.`,
  };
}

async function parseExcelFile(file: File): Promise<ParsedFileResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  const extractedStations: Partial<Station>[] = [];
  const extractedDowntimes: Partial<DowntimeRecord>[] = [];

  // Intelligent column mapping
  jsonData.forEach((row, index) => {
    const keys = Object.keys(row);

    const findVal = (keywords: string[]) => {
      for (const k of keys) {
        const cleanK = k.toLowerCase().trim();
        if (keywords.some(kw => cleanK.includes(kw.toLowerCase()))) {
          return row[k];
        }
      }
      return undefined;
    };

    const stationName = findVal(['اسم المحطة', 'المحطة', 'station', 'station_name', 'name']);
    const target = Number(findVal(['المستهدف', 'الهدف', 'المستهدف اليومي', 'target', 'daily_target'])) || 0;
    const sales = Number(findVal(['المبيعات', 'الفعلي', 'المبيعات الفعلية', 'actual', 'sales', 'volume'])) || 0;
    const gov = (findVal(['المحافظة', 'المدينة', 'governorate', 'city', 'gov']) || 'القاهرة') as Governorate;
    const sector = (findVal(['القطاع', 'sector', 'region']) || 'القاهرة الكبرى') as Sector;
    const compressors = Number(findVal(['الضواغط', 'كمبروسر', 'compressors', 'compressor_count'])) || 3;
    const dispensers = Number(findVal(['نقاط التموين', 'الموزعات', 'dispensers', 'nozzles'])) || 8;

    if (stationName) {
      extractedStations.push({
        id: `imp-${Date.now()}-${index}`,
        code: `CG-IMP-${String(index + 1).padStart(2, '0')}`,
        name: String(stationName).trim(),
        governorate: gov,
        sector: sector,
        dailyTarget: target || 20000,
        actualSales: sales || 18000,
        compressorCount: compressors,
        dispenserCount: dispensers,
        maxCapacityPerHour: Math.round(target / 16) || 1200,
        status: (sales > 0 && target > 0 && (sales / target) < 0.8) ? 'low_pressure' : 'active',
        lastUpdated: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        notes: `مستورد من ملف إكسيل: ${file.name}`
      });
    }

    // Look for downtime info
    const cause = findVal(['سبب العطل', 'العطل', 'سبب التوقف', 'cause', 'fault', 'reason']);
    const duration = Number(findVal(['ساعات التوقف', 'المدة', 'duration', 'hours', 'downtime'])) || 0;
    if (cause || duration > 0) {
      extractedDowntimes.push({
        id: `imp-dt-${Date.now()}-${index}`,
        stationId: `imp-${index}`,
        stationName: String(stationName || `محطة ${index + 1}`).trim(),
        date: new Date().toISOString().split('T')[0],
        startTime: '08:00',
        endTime: '12:00',
        durationHours: duration || 2.5,
        cause: (cause || 'صيانة وقائية مجدولة') as any,
        estimatedLostSales: Math.round((duration || 2.5) * 1000),
        lossCostEGP: Math.round((duration || 2.5) * 1000 * 6.5),
        status: 'resolved',
        technicianReport: `مستورد من ملف إكسيل`
      });
    }
  });

  const previewSnippet = jsonData.slice(0, 10).map(r => Object.entries(r).map(([k, v]) => `${k}: ${v}`).join(' | ')).join('\n');

  return {
    fileName: file.name,
    fileType: 'excel',
    fileSize: file.size,
    extractedText: `تم تحليل جدول إكسيل (${file.name}) بنجاح!\nعدد الشيتات: ${workbook.SheetNames.join(', ')}\nعدد الصفوف المقروءة: ${jsonData.length}\nعينة من البيانات:\n${previewSnippet}`,
    stations: extractedStations,
    downtimeRecords: extractedDowntimes,
    sheetNames: workbook.SheetNames,
    totalRows: jsonData.length,
  };
}

async function parseImageFile(file: File): Promise<ParsedFileResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        fileName: file.name,
        fileType: 'image',
        fileSize: file.size,
        previewUrl: reader.result as string,
        extractedText: `صورة فنية مرفوعة: ${file.name} - تم إدراجها لمعاينة عدادات المحطة أو شاشات التحكم بالضواغط أو تقرير الفحص الميداني.`,
      });
    };
    reader.readAsDataURL(file);
  });
}

async function parseDocumentFile(file: File, ext: string): Promise<ParsedFileResult> {
  const typeMap: Record<string, 'word' | 'pdf' | 'powerpoint' | 'other'> = {
    docx: 'word',
    doc: 'word',
    pdf: 'pdf',
    pptx: 'powerpoint',
    ppt: 'powerpoint',
    txt: 'word',
  };

  const fileType = typeMap[ext] || 'other';

  try {
    const text = await file.text();
    const cleanText = text.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, ' ').slice(0, 3000);
    return {
      fileName: file.name,
      fileType,
      fileSize: file.size,
      extractedText: cleanText.trim() ? cleanText : `تم رفع مستند ${file.name} بصيغة ${ext.toUpperCase()} بحجم ${(file.size / 1024).toFixed(1)} ك.ب، وجاهز للتحليل ودمجه مع تقارير كارجاس.`,
    };
  } catch {
    return {
      fileName: file.name,
      fileType,
      fileSize: file.size,
      extractedText: `مستند مرفوع: ${file.name} (${ext.toUpperCase()}) جاهز للاستشارة الفنية وللاستعلام بالذكاء الاصطناعي.`,
    };
  }
}

// Generate a sample Excel template for users to download
export function generateSampleExcelTemplate(): void {
  const sampleData = [
    {
      'كود المحطة': 'CG-CAI-101',
      'اسم المحطة': 'كارجاس - التجمع الخامس (شارع التسعين)',
      'المحافظة': 'القاهرة',
      'القطاع': 'القاهرة الكبرى',
      'المستهدف اليومي (م³)': 24000,
      'المبيعات الفعلية (م³)': 25500,
      'عدد الضواغط': 4,
      'نقاط التموين': 12,
      'ساعات التوقف اليومية': 0,
      'سبب العطل إن وجد': '',
      'اسم مدير المحطة': 'م. حازم السعيد',
      'ملاحظات التشغيل': 'ضغط الشبكة ممتاز ومعدل التردد طبيعي'
    },
    {
      'كود المحطة': 'CG-GIZ-102',
      'اسم المحطة': 'كارجاس - ميدان الجيزة',
      'المحافظة': 'الجيزة',
      'القطاع': 'القاهرة الكبرى',
      'المستهدف اليومي (م³)': 28000,
      'المبيعات الفعلية (م³)': 19200,
      'عدد الضواغط': 4,
      'نقاط التموين': 14,
      'ساعات التوقف اليومية': 3.5,
      'سبب العطل إن وجد': 'انخفاض ضغط الشبكة القومية',
      'اسم مدير المحطة': 'م. عادل إبراهيم',
      'ملاحظات التشغيل': 'عجز في المبيعات بسبب هبوط ضغط خط الدخول'
    },
    {
      'كود المحطة': 'CG-ALX-103',
      'اسم المحطة': 'كارجاس - العجمي (الإسكندرية)',
      'المحافظة': 'الإسكندرية',
      'القطاع': 'الإسكندرية والساحل',
      'المستهدف اليومي (م³)': 21000,
      'المبيعات الفعلية (م³)': 14800,
      'عدد الضواغط': 3,
      'نقاط التموين': 8,
      'ساعات التوقف اليومية': 4.0,
      'سبب العطل إن وجد': 'عطل ضواغط الغاز (الكمبروسر)',
      'اسم مدير المحطة': 'م. مصطفى الشامي',
      'ملاحظات التشغيل': 'توقف الضاغط رقم 1 لعطل بلوف الضغط العالي'
    },
    {
      'كود المحطة': 'CG-DKH-104',
      'اسم المحطة': 'كارجاس - المنصورة (الدقهلية)',
      'المحافظة': 'الدقهلية',
      'القطاع': 'الدلتا والقناة',
      'المستهدف اليومي (م³)': 17500,
      'المبيعات الفعلية (م³)': 18200,
      'عدد الضواغط': 3,
      'نقاط التموين': 8,
      'ساعات التوقف اليومية': 0.5,
      'سبب العطل إن وجد': 'صيانة وقائية مجدولة',
      'اسم مدير المحطة': 'م. أحمد فؤاد',
      'ملاحظات التشغيل': 'صيانة روتينية خفيفة وتم استئناف التموين'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'مبيعات وأعطال المحطات');

  XLSX.writeFile(workbook, 'نموذج_كارجاس_مبيعات_وأعطال_المحطات.xlsx');
}

// Export current stations data to Excel
export function exportStationsToExcel(stations: Station[]): void {
  const exportData = stations.map(s => {
    const rate = s.dailyTarget > 0 ? ((s.actualSales / s.dailyTarget) * 100).toFixed(1) : '100';
    const diff = s.actualSales - s.dailyTarget;
    return {
      'كود المحطة': s.code,
      'اسم المحطة': s.name,
      'المحافظة': s.governorate,
      'القطاع': s.sector,
      'المستهدف اليومي (م³)': s.dailyTarget,
      'المبيعات الفعلية (م³)': s.actualSales,
      'نسبة التحقيق (%)': `${rate}%`,
      'الفارق (م³)': diff,
      'الحالة': s.status === 'active' ? 'نشطة' : s.status === 'low_pressure' ? 'انخفاض ضغط' : 'صيانة/توقف',
      'عدد الضواغط': s.compressorCount,
      'نقاط التموين': s.dispenserCount,
      'مدير المحطة': s.managerName || '-',
      'ملاحظات': s.notes || '-'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'تقرير مبيعات المحطات');

  XLSX.writeFile(workbook, `تقرير_مبيعات_كارجاس_${new Date().toISOString().split('T')[0]}.xlsx`);
}
