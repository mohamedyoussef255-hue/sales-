import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Download, 
  Share2, 
  Printer, 
  Bot, 
  Volume2, 
  VolumeX, 
  FileText, 
  FileSpreadsheet, 
  Check, 
  RefreshCw, 
  MessageSquare, 
  Copy,
  ExternalLink,
  Sliders,
  Mail,
  SendHorizontal
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { requestAiAnalysis } from '../services/geminiService';
import { speechService } from '../services/speechService';
import { exportStationsToExcel } from '../services/fileParserService';

export const AiReportsCenter: React.FC = () => {
  const { 
    stations, 
    downtimeLogs, 
    uploadedFiles, 
    settings 
  } = useApp();

  const [prompt, setPrompt] = useState('');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportResult, setReportResult] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const isAr = settings.language === 'ar';

  const reportPresets = [
    {
      title: '🚨 تقرير العجز والانخفاض الحرج',
      prompt: 'قم بإعداد تقرير تفصيلي عن المحطات التي حققت مبيعات أقل من 80% من المستهدف اليومي، موضحاً أسباب العجز والعجز بالمتر المكعب وتوصيات لمعالجة المشكلة فوراً.'
    },
    {
      title: '⚙️ تقرير ساعات التوقف والفاقد المالي',
      prompt: 'حلل ساعات التوقف المسجلة اليوم، وقسم الفاقد المالي وحجم الغاز المفقود حسب أسباب الأعطال (ضغط الشبكة، أعطال الكمبروسر، تذبذب الكهرباء)، وقدم توصيات للصيانة.'
    },
    {
      title: '📋 تقرير شامل للإدارة العليا (كارجاس)',
      prompt: 'أصدر تقريراً تنفيذياً شاملاً يوضح ملخص مبيعات الغاز الطبيعي لجميع المحطات، نسبة تحقيق المستهدف العام، أفضل المحطات أداءً، المحطات المتعثرة، والفاقد الإجمالي.'
    },
    {
      title: '🗺️ مقارنة أداء القطاعات والمحافظات',
      prompt: 'قارن بين أداء قطاع القاهرة الكبرى، الإسكندرية والساحل، الدلتا، والصعيد من حيث متوسط المبيعات وتحقيق المستهدف وساعات الأعطال.'
    }
  ];

  const handleGenerateReport = async (instructionToRun?: string) => {
    const textPrompt = instructionToRun || prompt;
    if (!textPrompt.trim() && !instructionToRun) return;

    setLoading(true);
    setReportResult(null);

    // Filter file contexts
    const selectedFilesContext = uploadedFiles
      .filter(f => selectedFileIds.includes(f.id))
      .map(f => ({
        name: f.name,
        type: f.type,
        textSnippet: f.extractedSnippet,
      }));

    try {
      const response = await requestAiAnalysis({
        prompt: textPrompt,
        stationsData: stations,
        downtimeData: downtimeLogs,
        fileContexts: selectedFilesContext,
        customInstructions: 'استعن أيضاً بمذكرات التفتيش وبيانات المحطات المسجلة واجعل التقرير منظماً ومرتباً بتنسيق احترافي.'
      });

      setReportResult(response.analysis);

      if (settings.moainAutoSpeak) {
        speechService.speak(response.analysis.slice(0, 500));
      }
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFileSelection = (id: string) => {
    setSelectedFileIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSpeakReport = () => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
    } else if (reportResult) {
      speechService.speak(reportResult);
      setIsSpeaking(true);
    }
  };

  const handleCopyReport = () => {
    if (!reportResult) return;
    navigator.clipboard.writeText(reportResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!reportResult) return;
    const text = encodeURIComponent(`*تقرير كارجاس لتحليل مبيعات الغاز الطبيعي والأعطال:*\n\n${reportResult.slice(0, 1500)}...\n\n_تم إصداره عبر منظومة كارجاس الذكية (عزوتي)_`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareEmail = () => {
    if (!reportResult) return;
    const subject = encodeURIComponent('تقرير عمليات ومبيعات محطات الغاز الطبيعي - كارجاس');
    const body = encodeURIComponent(reportResult);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-500" />
          <span>{isAr ? 'مركز الاستعلامات والتقارير الذكية (Gemini AI)' : 'AI Intelligence & Custom Reports Center'}</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          اكتب أي تعليمات أو استعلام للحصول على تقارير مخصصة وفورية، مستعيناً ببيانات المبيعات وسجلات الأعطال والملفات المرفوعة
        </p>
      </div>

      {/* Preset Report Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {reportPresets.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => {
              setPrompt(preset.prompt);
              handleGenerateReport(preset.prompt);
            }}
            disabled={loading}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 text-right transition-all shadow-sm hover:shadow-md group flex flex-col justify-between"
          >
            <div className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 mb-1">
              {preset.title}
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-2">
              {preset.prompt}
            </p>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
              <span>توليد فوري</span>
              <Sparkles className="w-3 h-3 text-amber-500" />
            </span>
          </button>
        ))}
      </div>

      {/* Prompt & Custom Instructions Box */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* File Inclusion Row */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              تضمين مستخرجات الملفات المرفوعة في سياق التقرير:
            </span>
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map(file => {
                const isSelected = selectedFileIds.includes(file.id);
                return (
                  <button
                    key={file.id}
                    onClick={() => handleToggleFileSelection(file.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{file.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            اكتب التعليمات أو الاستعلام المخصص للتقرير:
          </label>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="مثال: أصدر تقريراً عاجلاً بمحطات الغربية وأسيوط التي بها أعطال كمبروسر تسببت في هبوط المبيعات لأكثر من 20%، وقدم توصيات لمعالجة الوضع وتكليف فرق الصيانة..."
            className="w-full text-xs sm:text-sm p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-[11px] text-slate-400">
            الذكاء الاصطناعي مدعوم بـ Gemini 3.8 Flash مع تحليل مؤشرات كارجاس التشغيلية.
          </div>

          <button
            onClick={() => handleGenerateReport()}
            disabled={loading || (!prompt.trim() && uploadedFiles.length === 0)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جاري معالجة وتوليد التقرير الذكي...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>إصدار التقرير الآن</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Generated Report Display */}
      {reportResult && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 animate-fadeIn">
          
          {/* Report Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                  تقرير التحليل الذكي المعتمد
                </h3>
                <span className="text-[10px] text-slate-400">
                  تاريخ الإصدار: {new Date().toLocaleString('ar-EG')}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSpeakReport}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  isSpeaking 
                    ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                }`}
                title="استماع صوتي للتقرير"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{isSpeaking ? 'إيقاف الصوت' : 'استماع صوتي'}</span>
              </button>

              <button
                onClick={handleCopyReport}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 flex items-center gap-1.5"
                title="نسخ التقرير للحافظة"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ!' : 'نسخ النص'}</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 hover:bg-emerald-100 flex items-center gap-1.5"
                title="مشاركة عبر الواتساب"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>واتساب</span>
              </button>

              <button
                onClick={handleShareEmail}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 hover:bg-blue-100 flex items-center gap-1.5"
                title="مراسلة عبر الإيميل"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>إيميل</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 flex items-center gap-1.5"
                title="طباعة التقرير"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة</span>
              </button>
            </div>
          </div>

          {/* Report Text Content */}
          <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-loose whitespace-pre-line text-slate-800 dark:text-slate-200 bg-slate-50/70 dark:bg-slate-800/40 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 font-['Cairo']">
            {reportResult}
          </div>

        </div>
      )}

    </div>
  );
};
