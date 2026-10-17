import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  HelpCircle, 
  ShieldCheck, 
  Flame, 
  TrendingDown, 
  Clock, 
  FileSpreadsheet, 
  Award,
  ChevronRight,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { askMoainAssistant, ChatMessage } from '../services/geminiService';
import { speechService } from '../services/speechService';

export const MoainAssistant: React.FC = () => {
  const { 
    settings, 
    totalSales, 
    overallAchievementRate, 
    criticalStationsCount, 
    totalDowntimeHours, 
    setActiveTab,
    alerts 
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeWalkthroughStep, setActiveWalkthroughStep] = useState<number | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'moain',
      text: `يا هلا بيك يا هندسة ومية مسا عليك! 👋
أنا "مُعين".. صاحبك وذراعك اليمين في متابعة محطات كارجاس للغاز الطبيعي، مطوّر بحب وذكاء بواسطة شركة "عزوتي" والمطور "محمد عبد الرحمن يوسف".

أنا هنا علشان:
1. نكشف مع بعض المحطات اللي مبيعاتها نزلت عن المستهدف ونعرف السبب فجأة.
2. نحلل ساعات توقف الضواغط وهبوط ضغط الشبكة ونحسب الفاقد المالي بالمليم.
3. نولد أي تقرير ترغب فيه من ملفات الإكسيل والـ PDF اللي ترفعها.

تحب نبدأ بمراجعة سريعة للمحطات الحرجة ولا أشرح لك كل صفحة خطوة بخطوة؟`,
      timestamp: 'الآن',
      audioAvailable: true
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    speechService.setOnStateChange((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => {
      speechService.stop();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const reply = await askMoainAssistant(text, {
        totalSales,
        achievementRate: overallAchievementRate,
        underperformingCount: criticalStationsCount,
        totalDowntimeHours
      });

      const moainMsg: ChatMessage = {
        id: `moain-${Date.now()}`,
        sender: 'moain',
        text: reply,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        audioAvailable: true
      };

      setMessages(prev => [...prev, moainMsg]);

      // Speak automatically if enabled
      if (settings.moainAutoSpeak) {
        speechService.speak(reply);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `moain-err-${Date.now()}`,
          sender: 'moain',
          text: 'معلش يا باشا حصل تأخير لحظي، بس بياناتك محفوظة وأنا معاك.. اطلب مني أي استفسار تاني!',
          timestamp: 'الآن'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      speechService.stop();
    } else {
      speechService.speak(text);
    }
  };

  const quickPrompts = [
    { label: '🚨 مين المحطات الحرجة حالياً؟', query: 'طلعلي المحطات اللي نسبة تحقيقها أقل من 80% وإيه أسباب الانخفاض؟' },
    { label: '⚙️ إيه أكتر أسباب ساعات التوقف؟', query: 'حلل لي أسباب الأعطال والضواغط المتوقفة وحجم الفاقد الإجمالي' },
    { label: '📖 اشرح لي إزاي استخدم التطبيق', query: 'اشرح لي طريقة استخدام التطبيق ووظائف كل صفحة خطوة بخطوة' },
    { label: '📊 هل حققنا المستهدف العام اليوم؟', query: 'هل إجمالي مبيعات كارجاس اليوم عدى المستهدف المطلوب ولا فيه عجز؟' }
  ];

  const appGuideSteps = [
    {
      num: 1,
      title: 'لوحة القيادة (Dashboard)',
      desc: 'تعرض مؤشرات المبيعات اللحظية، الفاقد المالي، وجرس التنبيه للمحطات المتأخرة.',
      action: () => setActiveTab('dashboard')
    },
    {
      num: 2,
      title: 'المحطات والمستهدف (Stations)',
      desc: 'جدول مقارنة المستهدف الفعلي، فرز المحطات حسب المحافظات والقطاعات وتعديل المستهدفات.',
      action: () => setActiveTab('stations')
    },
    {
      num: 3,
      title: 'ساعات التوقف والأعطال (Downtime)',
      desc: 'تسجيل وتتبع أعطال الكمبروسر وضغط الشبكة وانقطاع الكهرباء واحتساب الفاقد المالي بالجنيه.',
      action: () => setActiveTab('downtime')
    },
    {
      num: 4,
      title: 'رفع ومعالجة الملفات (Files Hub)',
      desc: 'سحب وإفلات ملفات الإكسيل والـ PDF والوورد والباوربوينت والصور لقراءتها فورياً.',
      action: () => setActiveTab('files')
    },
    {
      num: 5,
      title: 'التقارير الذكية والاستعلامات (AI Reports)',
      desc: 'كتابة أي تعليمات للذكاء الاصطناعي لإصدار تقرير فوري، مع تصدير إكسيل ومشاركة واتساب.',
      action: () => setActiveTab('reports')
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left / Info Column: Identity & Walkthrough */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Identity Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-900 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl" />
            
            <div className="flex items-center gap-3.5 mb-4 relative z-10">
              <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-inner">
                <Bot className="w-8 h-8 text-emerald-300" />
                {isSpeaking && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">مُعين | Moain</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                    روبوت ناطق ذكي
                  </span>
                </div>
                <p className="text-xs text-emerald-100/80">
                  روح "وضاح" وعقل "لوكا" وإنجاز "لوكا السريع"
                </p>
              </div>
            </div>

            {/* Speaking visualizer if active */}
            {isSpeaking && (
              <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center gap-1.5 animate-pulse">
                <Volume2 className="w-4 h-4 text-emerald-300" />
                <span className="text-xs font-bold text-emerald-100">مُعين يتحدث الآن بالصوت...</span>
                <div className="flex items-center gap-0.5 h-3 ml-2">
                  <span className="w-1 bg-emerald-300 h-2 animate-bounce" />
                  <span className="w-1 bg-emerald-300 h-3 animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1 bg-emerald-300 h-1.5 animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            )}

            <div className="text-xs text-slate-200 leading-relaxed space-y-2 border-t border-white/10 pt-3">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
                <span>
                  <strong>حقوق الملكية الفكرية:</strong> للمطور <strong>محمد عبد الرحمن يوسف</strong> وشركة <strong>عزوتي للبرمجيات وتكنولوجيا المعلومات</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  مُصمم خصيصاً لعمليات ومحطات <strong>كارجاس</strong> لتوزيع الغاز الطبيعي المضغوط وتحليل الأعطال.
                </span>
              </div>
            </div>
          </div>

          {/* Step-by-Step App Walkthrough Guide */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">
                  دليل صفحات التطبيق (المرجع المعتمد)
                </h4>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">5 أقسام</span>
            </div>

            <p className="text-[11px] text-slate-500 leading-normal">
              اضغط على أي قسم لمعرفة وظيفته والانتقال إليه فوراً بضغطة زر واحدة:
            </p>

            <div className="space-y-2">
              {appGuideSteps.map(step => (
                <div
                  key={step.num}
                  onClick={step.action}
                  className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-50/40 dark:hover:bg-slate-800/80 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      {step.num}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600">
                        {step.title}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                        {step.desc}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-[-2px] transition-all" />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right / Chat Column: Interactive Moain Chat */}
        <div className="lg:col-span-2 flex flex-col h-[700px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          
          {/* Chat Header */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                  الحوار المباشر مع مُعين
                </h4>
                <p className="text-[11px] text-slate-500">
                  اسأل عن مبيعات الغاز، الأعطال، الفاقد، أو اطلب تقرير مخصص
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isSpeaking && (
                <button
                  onClick={() => speechService.stop()}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 hover:bg-red-200 flex items-center gap-1"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>إيقاف الصوت</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-4 py-2 bg-slate-100/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-700/60 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-slate-400 font-bold shrink-0">اقتراحات سريعة:</span>
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.query)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 transition-all font-medium"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Messages Flow */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isMoain = msg.sender === 'moain';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isMoain ? 'justify-start' : 'justify-end'}`}
                >
                  {isMoain && (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isMoain
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tr-none'
                        : 'bg-emerald-600 text-white rounded-tl-none shadow-sm shadow-emerald-600/20'
                    }`}
                  >
                    <div className="whitespace-pre-line font-['Cairo']">
                      {msg.text}
                    </div>

                    <div className={`mt-2 flex items-center justify-between text-[10px] ${isMoain ? 'text-slate-400' : 'text-emerald-200'}`}>
                      <span>{msg.timestamp}</span>

                      {isMoain && (
                        <button
                          onClick={() => handleSpeak(msg.text)}
                          title="استمع للرد بصوت معين"
                          className="hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 font-bold"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>استماع</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="p-4 rounded-2xl rounded-tr-none bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.3s]" />
                  </div>
                  <span>مُعين يحلل البيانات ويحضر الرد...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-50 dark:bg-slate-800/70 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="اكتب استفسارك أو تعليماتك لمُعين (مثال: طلعلي تقرير أعطال قطاع القاهرة)..."
              disabled={loading}
              className="flex-1 text-xs sm:text-sm py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="p-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm"
              title="إرسال"
            >
              <Send className="w-4 h-4 rtl:rotate-180" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
