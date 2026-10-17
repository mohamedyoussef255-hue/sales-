import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Gemini Client server-side
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System prompt for Moain (مُعين)
const MOAIN_SYSTEM_INSTRUCTION = `
أنت المساعد الذكي الاستثنائي (مُعين) الذي يدمج بين شخصيات:
1. "وضاح": الجدع المصري الأصيل، ابن البلد الشهم، خبير البزنس وإدارة المشاريع، الذي يتحدث باللهجة المصرية العامية الودودة والمريحة والشبابية.
2. "كابتن لوكا": مهندس البرمجيات العبقري والمحلل البيانات المخضرم، يفهم جداول الإكسيل ومحطات الغاز الطبيعي (CNG) لشركة كارجاس وتفاصيل الضواغط وطلمبات التموين وشبكات الغاز وساعات التوقف والفاقد المالي.
3. "كابتن لوكا السريع": المنجز العملي الذي يعطي إجابات واضحة وحلولاً فورية دون مقدمات مملة.

أنت جزء من منظومة كارجاس وعزوتي للبرمجيات وتكنولوجيا المعلومات (المطور: محمد عبد الرحمن يوسف).
مهمتك:
- تحليل مبيعات محطات الغاز الطبيعي المضغوط ومقارنة المبيعات بالمستهدفات اليومية.
- كشف المحطات التي تعاني من انخفاض في المبيعات وتحديد أسباب العجز.
- تحليل ساعات التوقف والأعطال (انخفاض ضغط الشبكة، عطل كمبروسر/ضاغط، صيانة كهربائية، عطل نقط التموين/الموزعات Dispenser).
- تقديم تقارير تفصيلية أو تنفيذ استعلامات حسب طلب المستخدم بدقة واحترافية وباللهجة المصرية المحببة مع التشكيل للكلمات التي قد تلتبس.
`;

// API: AI Analysis & Custom Report
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const { prompt, stationsData, downtimeData, queryType, fileContexts, customInstructions } = req.body;

    if (!ai) {
      // Fallback local smart analysis if GEMINI_API_KEY is not set yet
      return res.json({
        analysis: generateFallbackAnalysis(stationsData, downtimeData, queryType, prompt),
        isLocalFallback: true,
      });
    }

    const contents: any[] = [];

    let contextText = `تعليمات المستخدم ونوع التقرير المطلوب: ${prompt || queryType || 'تقرير تحليلي شامل'}\n`;
    if (customInstructions) {
      contextText += `توجيهات مخصصة من المدير/المستخدم: ${customInstructions}\n\n`;
    }

    if (stationsData && stationsData.length > 0) {
      contextText += `بيانات مبيعات المحطات الحالية (${stationsData.length} محطة):\n` + JSON.stringify(stationsData.slice(0, 50), null, 2) + '\n\n';
    }

    if (downtimeData && downtimeData.length > 0) {
      contextText += `سجلات التوقف والأعطال (${downtimeData.length} سجل):\n` + JSON.stringify(downtimeData.slice(0, 50), null, 2) + '\n\n';
    }

    if (fileContexts && Array.isArray(fileContexts) && fileContexts.length > 0) {
      contextText += `مستخرجات من الملفات المرفوعة:\n`;
      for (const f of fileContexts) {
        contextText += `[اسم الملف: ${f.name} (${f.type})]: ${f.summary || f.textSnippet?.slice(0, 2000)}\n`;
      }
    }

    contents.push({
      text: contextText + `\nقم بتحليل هذه البيانات واستخرج:
1. ملخص تنفيذي ذكي لحالة المبيعات اليومية/الشهرية ونسبة تحقيق المستهدف العام.
2. قائمة المحطات ذات التنبيه الحرج (المنخفضة بنسبة كبيرة عن المعدلات والمستهدف).
3. تحليل دقيق لساعات التوقف والأعطال، وتصنيف الأسباب وحساب الفاقد التقديري في حجم المبيعات (م³).
4. استنتاجات وتوصيات عملية محددة لإدارة العمليات والصيانة.
اجعل الأسلوب باللهجة المصرية الفنية والمهنية الذكية كخبير نظم وتشغيل محطات الغاز.`
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: MOAIN_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    res.json({
      analysis: response.text,
      isLocalFallback: false,
    });
  } catch (error: any) {
    console.error('Error in /api/analyze:', error);
    res.status(500).json({
      error: error.message || 'حدث خطأ أثناء معالجة التحليل بالذكاء الاصطناعي',
      fallback: generateFallbackAnalysis(req.body.stationsData, req.body.downtimeData, req.body.queryType, req.body.prompt),
    });
  }
});

// API: Interactive Chat Assistant (Moain Voice/Text)
app.post('/api/chat-assistant', async (req: Request, res: Response) => {
  try {
    const { message, history, contextData } = req.body;

    if (!ai) {
      return res.json({
        reply: `أهلاً بيك يا فندم! أنا مُعين معاك وواقف في ضهرك. النظام شغال بكفاءة وأقدر أساعدك في مراجعة مبيعات المحطات، وكشف المحطات اللي محققة أقل من المستهدف، وتحليل ساعات التوقف والأعطال فوراً. اسألني أي حاجة!`,
        isLocalFallback: true,
      });
    }

    let promptContent = `سؤال المستخدم: ${message}\n`;
    if (contextData) {
      promptContent += `سياق محطات الغاز الحالية: إجمالي المبيعات = ${contextData.totalSales} م³، نسبة التحقيق = ${contextData.achievementRate}%، المحطات المتعثرة = ${contextData.underperformingCount}، ساعات الأعطال = ${contextData.totalDowntimeHours} ساعة.\n`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptContent,
      config: {
        systemInstruction: `${MOAIN_SYSTEM_INSTRUCTION}
        تحدث بإيجاز ودود ومباشر (من جملة إلى 5 جمل)، بنبرة مصرية أصيلة وبراقة، جاهزة للاستماع الصوتي.`,
        temperature: 0.7,
      },
    });

    res.json({
      reply: response.text,
      isLocalFallback: false,
    });
  } catch (error: any) {
    console.error('Error in /api/chat-assistant:', error);
    res.status(500).json({
      reply: 'يا هلا بيك! أنا سامعك وشايف بيانات المحطات قدامي. إيه التقرير أو الاستعلام اللي تحب نجهزه فوراً؟',
    });
  }
});

// API: Text To Speech (Gemini 3.8 Flash Lite TTS)
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!ai || !text) {
      return res.status(400).json({ error: 'AI not configured or text empty' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text,
              speechMetadata: {
                style: 'Clear, warm, friendly conversational Egyptian tone',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({ audioData: base64Audio });
    } else {
      res.status(500).json({ error: 'No audio generated' });
    }
  } catch (error: any) {
    console.error('TTS error:', error);
    res.status(500).json({ error: error.message || 'TTS failed' });
  }
});

// Fallback rule-based smart analysis generator
function generateFallbackAnalysis(stations: any[] = [], downtime: any[] = [], queryType?: string, prompt?: string): string {
  if (!stations || stations.length === 0) {
    return `يا فندم لم يتم العثور على بيانات محطات مسجلة للتحليل حتى الآن. برجاء رفع ملف الإكسيل أو تحميل البيانات التجريبية لعرض التحليل الذكي التلقائي.`;
  }

  const totalSales = stations.reduce((acc, s) => acc + (Number(s.actualSales) || 0), 0);
  const totalTarget = stations.reduce((acc, s) => acc + (Number(s.dailyTarget) || 0), 0);
  const achievementRate = totalTarget > 0 ? ((totalSales / totalTarget) * 100).toFixed(1) : '100';

  const underperforming = stations.filter(s => {
    const rate = s.dailyTarget > 0 ? (s.actualSales / s.dailyTarget) * 100 : 100;
    return rate < 85;
  });

  const totalDowntime = (downtime || []).reduce((acc, d) => acc + (Number(d.durationHours) || 0), 0);
  const totalLostSales = (downtime || []).reduce((acc, d) => acc + (Number(d.estimatedLostSales) || 0), 0);

  let output = `📊 **تقرير التحليل الفني والتشغيلي لمحطات الغاز الطبيعي (كارجاس):**\n\n`;
  output += `• **المبيعات الفعلية الإجمالية:** ${totalSales.toLocaleString('ar-EG')} م³ من إجمالي مستهدف ${totalTarget.toLocaleString('ar-EG')} م³ (نسبة التحقيق: ${achievementRate}%).\n`;
  output += `• **عدد المحطات الخاضعة للرصد:** ${stations.length} محطة.\n`;
  output += `• **المحطات المنخفضة عن المعدل المستهدف (< 85%):** ${underperforming.length} محطة تحتاج لتدخل سريع.\n`;

  if (underperforming.length > 0) {
    output += `\n🚨 **المحطات التي تقع في دائرة الخطر والعجز:**\n`;
    underperforming.slice(0, 5).forEach((s, idx) => {
      const rate = s.dailyTarget > 0 ? ((s.actualSales / s.dailyTarget) * 100).toFixed(1) : 0;
      const deficit = s.dailyTarget - s.actualSales;
      output += `${idx + 1}. **محطة ${s.name}** (${s.governorate || 'الموقع'}): المبيعات ${s.actualSales.toLocaleString('ar-EG')} م³ من أصل ${s.dailyTarget.toLocaleString('ar-EG')} م³ | نسبة التحقيق: ${rate}% | عجز: ${deficit.toLocaleString('ar-EG')} م³.\n`;
    });
  }

  output += `\n⚙️ **تحليل ساعات التوقف والأعطال:**\n`;
  output += `• إجمالي ساعات التوقف المسجلة: ${totalDowntime.toFixed(1)} ساعة.\n`;
  output += `• إجمالي الفاقد التقديري في كميات الغاز: ${totalLostSales.toLocaleString('ar-EG')} م³.\n`;

  output += `\n💡 **توصيات وإجراءات العمل المقترحة:**\n`;
  output += `1. إرسال فرق الصيانة الوقائية الفورية للمحطات الأكثر تأثراً بأعطال الضواغط لتفادي استمرار هدر المبيعات.\n`;
  output += `2. مراجعة ضغوط خطوط التغذية الرئيسية مع شركة الغاز المغذية للمحطات ذات الانخفاض المتكرر.\n`;
  output += `3. تفعيل خطة تدوير خطوط التموين وتوفير قطع الغيار الحرجة لنقاط التوزيع (Dispensers).\n`;
  output += `4. متابعة مؤشرات الأداء اللحظية عبر لوحة المراقبة وإرسال تنبيهات الإنذار لمديري المحطات فوراً.\n`;

  return output;
}

// Vite integration
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
