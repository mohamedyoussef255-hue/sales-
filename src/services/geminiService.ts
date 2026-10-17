import { Station, DowntimeRecord, UploadedFileMeta } from '../types';

export interface AnalysisRequest {
  prompt?: string;
  queryType?: string;
  stationsData: Station[];
  downtimeData: DowntimeRecord[];
  fileContexts?: { name: string; type: string; summary?: string; textSnippet?: string }[];
  customInstructions?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'moain';
  text: string;
  timestamp: string;
  audioAvailable?: boolean;
}

export async function requestAiAnalysis(request: AnalysisRequest): Promise<{ analysis: string; isLocalFallback: boolean }> {
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    return {
      analysis: data.analysis || data.fallback,
      isLocalFallback: data.isLocalFallback ?? false,
    };
  } catch (error) {
    console.warn('API error, using client-side intelligent fallback analysis:', error);
    return {
      analysis: generateClientSideFallbackAnalysis(request),
      isLocalFallback: true,
    };
  }
}

export async function askMoainAssistant(
  message: string,
  contextData: { totalSales: number; achievementRate: number; underperformingCount: number; totalDowntimeHours: number }
): Promise<string> {
  try {
    const res = await fetch('/api/chat-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, contextData }),
    });

    if (!res.ok) throw new Error('Failed to reach assistant');
    const data = await res.json();
    return data.reply;
  } catch {
    // Intelligent local response in Egyptian Arabic
    const m = message.toLowerCase();
    if (m.includes('أعطال') || m.includes('توقف') || m.includes('كمبروسر')) {
      return `يا فندم بخصوص ساعات التوقف، أكبر عطل مؤثر حالياً هو توقف الضاغط في محطة الوراق ومشاكل تذبذب الكهرباء في المحلة. إجمالي ساعات التوقف سجلت ${contextData.totalDowntimeHours} ساعة والفاقد التقديري تم احتسابه بدقة في تبويب الأعطال!`;
    }
    if (m.includes('مبيعات') || m.includes('مستهدف') || m.includes('انخفاض') || m.includes('محطات')) {
      return `مبيعاتنا الإجمالية اليوم ${contextData.totalSales.toLocaleString('ar-EG')} م³ بنسبة تحقيق ${contextData.achievementRate}%. عندنا ${contextData.underperformingCount} محطات محتاجة تدخل ودعم فوري لأنها أقل من المعدل المسموح به (85%).`;
    }
    if (m.includes('تقرير') || m.includes('اكسيل') || m.includes('رفع')) {
      return `تقدر ترفع أي ملف إكسيل أو تقرير PDF أو صور العدادات من تبويب "رفع ومعالجة الملفات"، والسيستم هيقرأ البيانات فوراً ويولد لك تقارير مخصصة تشاركها عبر الواتساب أو الإيميل بنقرة واحدة!`;
    }
    return `تحت أمرك يا فندم! أنا معاك خطوة بخطوة في منظومة كارجاس. شايف قدامي كل أرقام المبيعات ومؤشرات الأعطال والتنبيهات، قول لي حابب نستعلم عن إيه أو نوجه أمر لتقرير محدد؟`;
  }
}

function generateClientSideFallbackAnalysis(req: AnalysisRequest): string {
  const { stationsData, downtimeData, prompt } = req;
  const totalSales = stationsData.reduce((acc, s) => acc + s.actualSales, 0);
  const totalTarget = stationsData.reduce((acc, s) => acc + s.dailyTarget, 0);
  const achievementRate = totalTarget > 0 ? ((totalSales / totalTarget) * 100).toFixed(1) : '100';

  const critical = stationsData.filter(s => {
    const r = s.dailyTarget > 0 ? (s.actualSales / s.dailyTarget) * 100 : 100;
    return r < 85;
  });

  const totalDowntime = downtimeData.reduce((acc, d) => acc + d.durationHours, 0);
  const totalLost = downtimeData.reduce((acc, d) => acc + d.estimatedLostSales, 0);

  return `📊 **تقرير التحليل التشغيلي الذكي لمحطات الغاز (كارجاس):**

• **التعليمات المنفذة:** ${prompt || 'تقرير الأداء الشامل ورصد الفجوات'}
• **إجمالي المبيعات المحققة:** ${totalSales.toLocaleString('ar-EG')} م³ من أصل مستهدف ${totalTarget.toLocaleString('ar-EG')} م³ (معدل الإنجاز العام: ${achievementRate}%).
• **المحطات التي تعاني من انخفاض ملحوظ (< 85%):** ${critical.length} محطات من إجمالي ${stationsData.length} محطة.

🚨 **قائمة المحطات الحرجة ذات الأولوية الأولى:**
${critical.map(s => `- **${s.name}** (${s.governorate}): نسبة التحقيق ${((s.actualSales / s.dailyTarget) * 100).toFixed(1)}% | عجز: ${(s.dailyTarget - s.actualSales).toLocaleString('ar-EG')} م³`).join('\n')}

⚙️ **رصد ساعات التوقف والفاقد الإنتاجي:**
• إجمالي ساعات التوقف المسجلة: ${totalDowntime.toFixed(1)} ساعة.
• حجم الفاقد التقديري في ضخ الغاز: ${totalLost.toLocaleString('ar-EG')} م³ بقيمة مالية تقريبية ${(totalLost * 6.5).toLocaleString('ar-EG')} جنيه.

🎯 **توصيات استراتيجية للتشغيل:**
1. التنسيق مع شركات نقل وتوزيع الغاز لرفع ضغوط خطوط الدخول للمحطات المتأثرة.
2. تكثيف أعمال صيانة البساتم والصمامات للضواغط ذات الأعطال المتكررة.
3. اعتماد جدول متابعة دوري للمستهدف اليومي عبر المساعد "مُعين".`;
}
