import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://borcama.com", "https://www.borcama.com",
  ...Array.from({ length: 30 }, (_, i) => `http://127.0.0.1:${5173 + i}`),
  ...Array.from({ length: 30 }, (_, i) => `http://localhost:${5173 + i}`),
]);

function cors(origin: string | null) {
  const safeOrigin = origin && allowedOrigins.has(origin) ? origin : "https://borcama.com";
  return {
    "Access-Control-Allow-Origin": safeOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

const routeIds = new Set(["ozet", "borclar", "odemeler", "harcamalar", "sabit-giderler", "sabit-gelirler", "plan", "ayarlar", "none"]);
const systemInstruction = `Sen Borcama'nın Türkçe finansal açıklama asistanısın.
Yalnız verilen BORCAMA_HESAP_OZETI içindeki sayıları ve genel finans matematiğini kullan.
Her sorudan önce BORCAMA_HESAP_OZETI'nin tamamını birlikte değerlendir: aylık nakit akışı, borç maliyetleri, zorunlu ödemeler, son altı aylık eğilim, gider dağılımı, sabit gelir/gider, varlıklar, yapılandırmalar, ödeme geçmişi ve veri eksiklerini kontrol et.
Soruyu tek bir kaleme bakarak yanıtlama; cevabı toplam finansal profil ve kullanıcının aylık ödeme gücüyle çelişki kontrolü yaptıktan sonra ver.
Kullanıcının bankasına, sözleşmesine, güncel mevzuata veya hesabında olmayan bilgiye eriştiğini söyleme.
Hesap özetinde olmayan faiz, vergi, masraf, oran veya ödeme koşulunu uydurma.
Yeni kredi ve yapılandırmada aylık ödeme, toplam maliyet, nakit akışı ve riskleri karşılaştır; eksik kesin banka koşullarını belirt.
Teklifin aylık efektif maliyeti kullanıcının kayıtlı kart/KMH veya kredi maliyetinden belirgin düşükse, kredi yalnız bu pahalı borcu tamamen kapatacaksa, yeni harcama alanı yaratmayacaksa ve taksit aylık nakit akışına sığıyorsa "mantıklı görünüyor" diyebilirsin.
Bu koşullardan biri bilinmiyorsa koşullu konuş; yalnız düşük nominal faiz nedeniyle "al" deme. Borç kapatılmadan kullanılacak ek finansmanı veya aylık açığı büyüten taksiti uygun gösterme.
KKDF/BSMV gibi değerler özette varsa hesaba katıldığını açıkla; yoksa kesin toplam verme.
Yatırım tavsiyesi, kredi onayı garantisi veya hukuki sonuç verme. Acil borç/gecikmede bankayla görüşmeyi öner.
Yanıtı finansal okuryazarlığı olmayan birinin ilk okumada anlayacağı günlük Türkçeyle yaz; teknik terim kullanırsan aynı cümlede kısaca açıkla.
Yanıt alanı tam olarak şu düzende olsun: ilk satırda "Kısa cevap: ..."; ardından her biri "• " ile başlayan 2 veya 3 kısa madde; gerekiyorsa son satırda "Senden gereken: ...". Uzun paragraf yazma.
Yanıtı en fazla 130 kelime, sade ve doğrudan yaz. Her maddede tek fikir ver; kullanıcının girmediği sayıyı kesinmiş gibi sunma.
Tutar hesabını değiştirme; verilen rakamlar çelişiyorsa bunu söyle. Kullanıcı adına kayıt oluşturma veya değiştirme.
Yanıt dili Türkçe olsun.`;

Deno.serve(async (req) => {
  const headers = { ...cors(req.headers.get("origin")), "Content-Type": "application/json; charset=utf-8" };
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "METHOD_NOT_ALLOWED" }), { status: 405, headers });
  if (!allowedOrigins.has(req.headers.get("origin") || ""))
    return new Response(JSON.stringify({ error: "ORIGIN_NOT_ALLOWED" }), { status: 403, headers });

  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user)
    return new Response(JSON.stringify({ error: "AUTH_REQUIRED" }), { status: 401, headers });

  const body = await req.json().catch(() => null);
  const question = String(body?.question || "").trim().slice(0, 500);
  const context = body?.context;
  if (question.length < 3 || !context || JSON.stringify(context).length > 30000)
    return new Response(JSON.stringify({ error: "INVALID_REQUEST" }), { status: 422, headers });

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return new Response(JSON.stringify({ error: "MODEL_NOT_CONFIGURED" }), { status: 503, headers });
  if (Deno.env.get("GEMINI_PAID_SERVICE_CONFIRMED") !== "true")
    return new Response(JSON.stringify({ error: "PAID_SERVICE_REQUIRED" }), { status: 503, headers });
  const { data: quota, error: quotaError } = await admin.rpc("consume_financial_assistant_question", { p_user_id: authData.user.id });
  if (quotaError) return new Response(JSON.stringify({ error: "QUOTA_UNAVAILABLE" }), { status: 500, headers });
  if (!quota?.allowed)
    return new Response(JSON.stringify({ error: "DAILY_LIMIT", quota }), { status: 429, headers });
  const model = Deno.env.get("GEMINI_MODEL") || "gemini-3.7-flash";
  let gemini: Response;
  try {
    gemini = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: `SORU:\n${question}\n\nBORCAMA_HESAP_OZETI:\n${JSON.stringify(context)}` }] }],
        generationConfig: {
          thinkingConfig: { thinkingLevel: "LOW" },
          maxOutputTokens: 1000,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" }, answer: { type: "STRING" },
            route: { type: "STRING", enum: [...routeIds] }, actionLabel: { type: "STRING" },
            needsMoreInfo: { type: "BOOLEAN" }, disclaimer: { type: "STRING" },
          },
          required: ["title", "answer", "route", "actionLabel", "needsMoreInfo", "disclaimer"],
        },
        },
      }),
    });
  } catch {
    await admin.rpc("refund_financial_assistant_question", { p_user_id: authData.user.id });
    return new Response(JSON.stringify({ error: "MODEL_UNAVAILABLE", quota: { ...quota, remaining: quota.remaining + 1 } }), { status: 502, headers });
  }
  if (!gemini.ok) {
    await admin.rpc("refund_financial_assistant_question", { p_user_id: authData.user.id });
    return new Response(JSON.stringify({ error: "MODEL_UNAVAILABLE", quota: { ...quota, remaining: quota.remaining + 1 } }), { status: 502, headers });
  }
  const payload = await gemini.json();
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  let answer;
  try { answer = JSON.parse(text); } catch { answer = null; }
  if (!answer?.answer || !routeIds.has(answer.route)) {
    await admin.rpc("refund_financial_assistant_question", { p_user_id: authData.user.id });
    return new Response(JSON.stringify({ error: "INVALID_MODEL_RESPONSE", quota: { ...quota, remaining: quota.remaining + 1 } }), { status: 502, headers });
  }

  return new Response(JSON.stringify({
    title: String(answer.title || "Borcama yanıtı").slice(0, 100),
    answer: String(answer.answer).slice(0, 1800), route: answer.route,
    actionLabel: String(answer.actionLabel || "İlgili ekranı aç").slice(0, 60),
    needsMoreInfo: Boolean(answer.needsMoreInfo), disclaimer: String(answer.disclaimer || "").slice(0, 240), quota,
  }), { status: 200, headers });
});
