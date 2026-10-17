import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  FileText, 
  Image as ImageIcon, 
  Presentation, 
  Download, 
  Check, 
  AlertCircle, 
  Trash2, 
  Sparkles, 
  Bot, 
  ExternalLink,
  Table,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { parseUploadedFile, generateSampleExcelTemplate, ParsedFileResult } from '../services/fileParserService';
import { Station } from '../types';

export const FileUploadHub: React.FC = () => {
  const { 
    uploadedFiles, 
    addUploadedFile, 
    removeUploadedFile, 
    importStationsBatch, 
    importDowntimeBatch,
    setActiveTab,
    settings 
  } = useApp();

  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [lastParsedResult, setLastParsedResult] = useState<ParsedFileResult | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  const isAr = settings.language === 'ar';

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setProcessing(true);
    setImportSuccessMessage(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const parsed = await parseUploadedFile(file);
        setLastParsedResult(parsed);

        addUploadedFile({
          id: `f-${Date.now()}-${i}`,
          name: file.name,
          size: file.size,
          type: parsed.fileType,
          uploadDate: new Date().toLocaleDateString('ar-EG'),
          extractedSnippet: parsed.extractedText.slice(0, 1500),
          parsedRowCount: parsed.totalRows,
          previewUrl: parsed.previewUrl
        });

        // If Excel with stations, auto-suggest import
        if (parsed.stations && parsed.stations.length > 0) {
          setImportSuccessMessage(`تم العثور على ${parsed.stations.length} محطة غاز داخل ملف (${file.name}). اضغط زر "دمج المحطات" لإضافتها للنظام.`);
        }
      } catch (err) {
        console.error('Error parsing file:', err);
      }
    }
    setProcessing(false);
  };

  const handleApplyImportedStations = () => {
    if (!lastParsedResult?.stations) return;
    const validStations: Station[] = lastParsedResult.stations.map((s, idx) => ({
      id: s.id || `imp-${Date.now()}-${idx}`,
      code: s.code || `CG-IMP-${idx + 1}`,
      name: s.name || `محطة جديدة ${idx + 1}`,
      governorate: s.governorate || 'القاهرة',
      sector: s.sector || 'القاهرة الكبرى',
      dailyTarget: s.dailyTarget || 20000,
      actualSales: s.actualSales || 18000,
      compressorCount: s.compressorCount || 3,
      dispenserCount: s.dispenserCount || 8,
      maxCapacityPerHour: s.maxCapacityPerHour || 1200,
      status: s.status || 'active',
      lastUpdated: 'الآن',
      notes: s.notes
    }));

    importStationsBatch(validStations);

    if (lastParsedResult.downtimeRecords && lastParsedResult.downtimeRecords.length > 0) {
      importDowntimeBatch(lastParsedResult.downtimeRecords as any);
    }

    setImportSuccessMessage(`تم بنجاح استيراد ودمج ${validStations.length} محطة في قاعدة البيانات الحالية!`);
    setTimeout(() => {
      setActiveTab('stations');
    }, 1500);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'excel':
        return <FileSpreadsheet className="w-6 h-6 text-emerald-600" />;
      case 'word':
      case 'pdf':
        return <FileText className="w-6 h-6 text-blue-600" />;
      case 'image':
        return <ImageIcon className="w-6 h-6 text-purple-600" />;
      case 'powerpoint':
        return <Presentation className="w-6 h-6 text-amber-600" />;
      default:
        return <FileText className="w-6 h-6 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-emerald-600" />
            <span>{isAr ? 'مركز رفع ومعالجة كافة صيغ الملفات' : 'Smart Multi-Format File Hub'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            ارفع ملفات إكسيل (Excel)، وورد (Word)، بي دي اف (PDF)، باوربوينت (PPTX)، وصور العدادات للتحليل الفوري
          </p>
        </div>

        <button
          onClick={generateSampleExcelTemplate}
          className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 flex items-center gap-2 text-xs font-bold transition-all shadow-sm"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>{isAr ? 'تحميل نموذج إكسيل المعتمد (.xlsx)' : 'Download Excel Template'}</span>
        </button>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`relative p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
          isDragging 
            ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]' 
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-emerald-400'
        }`}
      >
        <input
          type="file"
          multiple
          accept=".xlsx,.xls,.csv,.docx,.doc,.pdf,.pptx,.ppt,.txt,.png,.jpg,.jpeg,.webp"
          onChange={(e) => handleFiles(e.target.files)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />

        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 ring-8 ring-emerald-500/5">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 mb-2">
          {processing 
            ? 'جاري فحص وقراءة الملفات واستخراج البيانات...' 
            : 'اسحب وأفلت الملفات هنا، أو اضغط للاختيار من جهازك'}
        </h3>

        <p className="text-xs text-slate-500 max-w-md leading-relaxed mb-4">
          يدعم التطبيق استيراد جداول <strong>Excel (.xlsx, .xls, .csv)</strong>، ومستندات <strong>Word / PDF</strong>، وعروض <strong>PowerPoint</strong>، وصور العدادات والضواغط.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold text-slate-400">
          <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800">.XLSX / .CSV</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800">.DOCX / .PDF</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800">.PPTX / .PPT</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800">.PNG / .JPG</span>
        </div>
      </div>

      {/* Success / Notification Banner */}
      {importSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{importSuccessMessage}</span>
          </div>

          {lastParsedResult?.stations && lastParsedResult.stations.length > 0 && (
            <button
              onClick={handleApplyImportedStations}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-1.5 shrink-0"
            >
              <Table className="w-4 h-4" />
              <span>دمج {lastParsedResult.stations.length} محطة الآن في المنظومة</span>
            </button>
          )}
        </div>
      )}

      {/* Preview of Last Parsed Result */}
      {lastParsedResult && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">
                مستخرجات الملف المرفوع: {lastParsedResult.fileName}
              </h4>
            </div>

            <button
              onClick={() => setActiveTab('reports')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 flex items-center gap-1"
            >
              <span>إصدار تقرير ذكي بناءً عليه</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-mono bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl max-h-48 overflow-y-auto">
            {lastParsedResult.extractedText}
          </div>

          {lastParsedResult.previewUrl && (
            <div className="mt-3">
              <span className="text-[11px] font-bold text-slate-500 block mb-1">معاينة الصورة المرفوعة:</span>
              <img
                src={lastParsedResult.previewUrl}
                alt="Preview"
                className="max-h-56 rounded-xl border border-slate-200 dark:border-slate-800 object-cover"
              />
            </div>
          )}
        </div>
      )}

      {/* Uploaded Files History */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>الملفات المرفوعة والمتاحة للنظام ({uploadedFiles.length})</span>
        </h3>

        {uploadedFiles.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            لم تقم برفع أي ملفات حتى الآن. يمكنك سحب ملف إكسيل للمبيعات للبدء فوراً!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {uploadedFiles.map(file => (
              <div
                key={file.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between gap-3 hover:border-emerald-500/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                      {file.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {(file.size / 1024).toFixed(1)} ك.ب • {file.uploadDate}
                    </div>
                    {file.parsedRowCount && (
                      <span className="inline-block mt-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                        {file.parsedRowCount} سجل مقروء
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => removeUploadedFile(file.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
                  title="حذف الملف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
