import { createClient } from "npm:@supabase/supabase-js@2";
import { denemeDavetHtml, konuGuvenli, yeniOzelliklerHtml as yeniOzelliklerSablonu } from "../_shared/borcama-email.ts";

const izinliOriginler = new Set([
  "https://borcama.com",
  "https://www.borcama.com",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
  "http://127.0.0.1:5176",
  "http://127.0.0.1:5177",
  "http://127.0.0.1:5180",
  "http://127.0.0.1:5181",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:5177",
  "http://localhost:5180",
  "http://localhost:5181",
]);

function cors(origin: string | null) {
  const izinli = origin && izinliOriginler.has(origin) ? origin : "https://borcama.com";
  return {
    "Access-Control-Allow-Origin": izinli,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin",
  };
}

function epostaMaskele(eposta: string) {
  const [kullanici = "", alan = ""] = eposta.split("@");
  const alanParcalari = alan.split(".");
  const alanAdi = alanParcalari.shift() || "";
  const uzanti = alanParcalari.length ? `.${alanParcalari.join(".")}` : "";
  const sol = kullanici.slice(0, 3);
  const sag = alanAdi.slice(0, 2);
  return `${sol}${kullanici.length > 3 ? "***" : ""}@${sag}${alanAdi.length > 2 ? "***" : ""}${uzanti}`;
}

async function tumKullanicilariGetir(admin: ReturnType<typeof createClient>) {
  const kullanicilar = [];
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error("USERS_UNAVAILABLE");
    kullanicilar.push(...data.users);
    if (data.users.length < 1000) break;
  }
  return kullanicilar;
}

async function kampanyaGetir(admin: ReturnType<typeof createClient>, slug: string) {
  const { data, error } = await admin.from("marketing_campaigns")
    .select("id,slug,name,subject,description,template_key,audience_type,kind,status")
    .eq("slug", slug).single();
  if (error || !data) throw new Error("CAMPAIGN_UNAVAILABLE");
  return data;
}

async function takipliKampanyaGonder(
  admin: ReturnType<typeof createClient>,
  campaign: { id: string; slug: string; subject: string },
  target: { user_id: string; email: string },
  html: (url: string) => string,
  destination: string,
) {
  const apiKey = String(Deno.env.get("RESEND_API_KEY") || "").trim();
  if (!apiKey) throw new Error("EMAIL_PROVIDER_NOT_CONFIGURED");
  const { data: existing } = await admin.from("marketing_deliveries")
    .select("id,status").eq("campaign_id", campaign.id).eq("user_id", target.user_id).maybeSingle();
  if (existing && existing.status !== "failed") return false;
  let deliveryId = existing?.id;
  if (!deliveryId) {
    const { data, error } = await admin.from("marketing_deliveries").insert({
      campaign_id: campaign.id, user_id: target.user_id, recipient_email: target.email, status: "queued",
    }).select("id").single();
    if (error || !data) throw new Error("DELIVERY_CREATE_FAILED");
    deliveryId = data.id;
  }
  const track = `${String(Deno.env.get("SUPABASE_URL"))}/functions/v1/email-redirect?id=${encodeURIComponent(deliveryId)}&to=${encodeURIComponent(destination)}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Borcama <zero@borcama.com>", to: [target.email], reply_to: "zero@borcama.com",
      subject: campaign.subject, html: html(track),
      tags: [{ name: "campaign", value: campaign.slug }, { name: "delivery", value: deliveryId }],
    }),
  });
  const result = await response.json().catch(() => ({}));
  const now = new Date().toISOString();
  if (!response.ok || !result?.id) {
    await admin.from("marketing_deliveries").update({ status: "failed", error_code: `resend_${response.status}`, updated_at: now }).eq("id", deliveryId);
    throw new Error("EMAIL_SEND_FAILED");
  }
  await admin.from("marketing_deliveries").update({ resend_email_id: result.id, status: "sent", sent_at: now, last_event_at: now, updated_at: now }).eq("id", deliveryId);
  return true;
}

async function kampanyaListesi(admin: ReturnType<typeof createClient>) {
  const { data: campaigns, error } = await admin.from("marketing_campaigns")
    .select("id,slug,name,subject,description,template_key,audience_type,kind,status,updated_at")
    .order("created_at");
  if (error) throw new Error("CAMPAIGNS_UNAVAILABLE");
  const { data: deliveries } = await admin.from("marketing_deliveries")
    .select("campaign_id,status,delivered_at,opened_at,clicked_at,visited_at");
  return (campaigns || []).map((campaign) => {
    const rows = (deliveries || []).filter((row) => row.campaign_id === campaign.id);
    return {
      ...campaign,
      metrics: {
        sent: rows.filter((x) => !["queued", "failed"].includes(x.status)).length,
        delivered: rows.filter((x) => x.delivered_at).length,
        opened: rows.filter((x) => x.opened_at).length,
        clicked: rows.filter((x) => x.clicked_at).length,
        visited: rows.filter((x) => x.visited_at).length,
      },
    };
  });
}

async function funnelIstatistikleri(admin: ReturnType<typeof createClient>) {
  const since = new Date(Date.now() - 90 * 86400000).toISOString();
  const [{ data: daily, error: dailyError }, { data: sources, error: sourceError }] = await Promise.all([
    admin.rpc("admin_funnel_daily", { p_since: since }),
    admin.rpc("admin_funnel_sources", { p_since: since }),
  ]);
  if (dailyError || sourceError) return { available: false, daily: [], sources: [] };
  return { available: true, daily: daily || [], sources: sources || [] };
}

async function yeniOzelliklerDuyurusuGonder(
  admin: ReturnType<typeof createClient>,
  kullanicilar: Array<{ id: string; email?: string; email_confirmed_at?: string | null }>,
) {
  const campaign = await kampanyaGetir(admin, "features-2026-08");
  const { data: haklar, error } = await admin
    .from("user_entitlements")
    .select("user_id,features_announcement_sent_at");
  if (error) throw new Error("ENTITLEMENTS_UNAVAILABLE");
  const dahaOnceGonderilen = new Set(
    (haklar || []).filter((hak) => hak.features_announcement_sent_at).map((hak) => hak.user_id),
  );
  const hedefler = kullanicilar
    .filter((u) => u.email && u.email_confirmed_at && !dahaOnceGonderilen.has(u.id))
    .map((u) => ({ user_id: u.id, email: String(u.email).trim().toLowerCase() }));
  const simdi = new Date().toISOString();
  let gonderilen = 0;
  for (const hedef of hedefler) {
    const sent = await takipliKampanyaGonder(admin, campaign, hedef, (url) => yeniOzelliklerSablonu(url), "/debts?source=features-email");
    const { error: guncellemeHatasi } = await admin.from("user_entitlements").upsert(
      { user_id: hedef.user_id, features_announcement_sent_at: simdi, updated_at: simdi }, { onConflict: "user_id" },
    );
    if (guncellemeHatasi) throw new Error("EMAIL_STATUS_UPDATE_FAILED");
    if (sent) gonderilen += 1;
  }
  return gonderilen;
}

async function denemeDuyurusuGonder(
  admin: ReturnType<typeof createClient>,
  kullanicilar: Array<{ id: string; email?: string }>,
) {
  const campaign = await kampanyaGetir(admin, "trial-invite-2026-08");
  const simdi = new Date();
  const { data: haklar, error } = await admin
    .from("user_entitlements")
    .select("user_id,trial_ends_at,pro_expires_at,trial_announcement_sent_at")
    .gt("trial_ends_at", simdi.toISOString())
    .is("trial_announcement_sent_at", null);
  if (error) throw new Error("ENTITLEMENTS_UNAVAILABLE");
  const epostaHaritasi = new Map(
    kullanicilar
      .filter((u) => u.email)
      .map((u) => [u.id, String(u.email).trim().toLowerCase()]),
  );
  const hedefler = (haklar || []).filter((hak) => {
    const proAktif = hak.pro_expires_at && new Date(hak.pro_expires_at).getTime() > simdi.getTime();
    return !proAktif && epostaHaritasi.has(hak.user_id);
  });
  let gonderilen = 0;
  for (const hak of hedefler) {
    const target = { user_id: hak.user_id, email: String(epostaHaritasi.get(hak.user_id)) };
    const days = Math.max(1, Math.ceil((new Date(hak.trial_ends_at).getTime() - simdi.getTime()) / 86400000));
    const sent = await takipliKampanyaGonder(admin, campaign, target, (url) => denemeDavetHtml(days, url), "/summary?source=trial-email");
    const { error: guncellemeHatasi } = await admin.from("user_entitlements")
      .update({ trial_announcement_sent_at: simdi.toISOString(), updated_at: simdi.toISOString() }).eq("user_id", hak.user_id);
    if (guncellemeHatasi) throw new Error("EMAIL_STATUS_UPDATE_FAILED");
    if (sent) gonderilen += 1;
  }
  return gonderilen;
}

async function revenueCatYonetimUrl(userId: string) {
  const secretKey = String(Deno.env.get("REVENUECAT_SECRET_API_KEY") || "").trim();
  if (!secretKey) throw new Error("REVENUECAT_SECRET_NOT_CONFIGURED");
  const cevap = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`,
    { headers: { Authorization: `Bearer ${secretKey}`, Accept: "application/json" } },
  );
  if (!cevap.ok) throw new Error("REVENUECAT_CUSTOMER_UNAVAILABLE");
  const json = await cevap.json();
  return String(json?.subscriber?.management_url || "").trim() || null;
}

Deno.serve(async (req) => {
  const headers = { ...cors(req.headers.get("origin")), "Content-Type": "application/json; charset=utf-8" };
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "GET" && req.method !== "POST") return new Response(JSON.stringify({ error: "METHOD_NOT_ALLOWED" }), { status: 405, headers });

  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 401, headers });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const adminEmails = new Set((Deno.env.get("BACKOFFICE_ADMIN_EMAILS") || "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean));
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data: authData, error: authError } = await admin.auth.getUser(token);
  const email = authData.user?.email?.toLowerCase();
  if (authError || !email || !adminEmails.has(email)) {
    return new Response(JSON.stringify({ error: "FORBIDDEN" }), { status: 403, headers });
  }

  if (req.method === "POST") {
    const body = await req.json().catch(() => null);
    const userId = String(body?.userId || "");
    const action = String(body?.action || "");
    if (action === "update_campaign_subject") {
      try {
        const slug = String(body?.slug || "").trim();
        if (!/^[a-z0-9-]{3,80}$/.test(slug)) throw new Error("INVALID_CAMPAIGN");
        const subject = konuGuvenli(body?.subject);
        const { error } = await admin.from("marketing_campaigns")
          .update({ subject, updated_at: new Date().toISOString() }).eq("slug", slug);
        if (error) throw new Error("CAMPAIGN_UPDATE_FAILED");
        return new Response(JSON.stringify({ ok: true, slug, subject }), { status: 200, headers });
      } catch (error) {
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "CAMPAIGN_UPDATE_FAILED" }), { status: 422, headers });
      }
    }
    if (action === "send_trial_announcement") {
      try {
        const kullanicilar = await tumKullanicilariGetir(admin);
        const sent = await denemeDuyurusuGonder(admin, kullanicilar);
        return new Response(JSON.stringify({ ok: true, sent }), { status: 200, headers });
      } catch (error) {
        const kod = error instanceof Error ? error.message : "EMAIL_SEND_FAILED";
        return new Response(JSON.stringify({ error: kod }), { status: kod === "EMAIL_PROVIDER_NOT_CONFIGURED" ? 503 : 502, headers });
      }
    }
    if (action === "send_features_announcement") {
      try {
        const kullanicilar = await tumKullanicilariGetir(admin);
        const sent = await yeniOzelliklerDuyurusuGonder(admin, kullanicilar);
        return new Response(JSON.stringify({ ok: true, sent }), { status: 200, headers });
      } catch (error) {
        const kod = error instanceof Error ? error.message : "EMAIL_SEND_FAILED";
        return new Response(JSON.stringify({ error: kod }), { status: kod === "EMAIL_PROVIDER_NOT_CONFIGURED" ? 503 : 502, headers });
      }
    }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId) || !["grant_pro", "revoke_pro", "manage_pro"].includes(action)) {
      return new Response(JSON.stringify({ error: "INVALID_REQUEST" }), { status: 422, headers });
    }

    const { data: hedef, error: hedefHatasi } = await admin.auth.admin.getUserById(userId);
    if (hedefHatasi || !hedef.user) {
      return new Response(JSON.stringify({ error: "USER_NOT_FOUND" }), { status: 404, headers });
    }

    if (action === "manage_pro") {
      try {
        const managementURL = await revenueCatYonetimUrl(userId);
        if (!managementURL)
          return new Response(JSON.stringify({ error: "PAID_SUBSCRIPTION_NOT_FOUND" }), { status: 404, headers });
        return new Response(JSON.stringify({ ok: true, userId, managementURL }), { status: 200, headers });
      } catch (error) {
        const kod = error instanceof Error ? error.message : "SUBSCRIPTION_MANAGEMENT_FAILED";
        return new Response(JSON.stringify({ error: kod }), { status: kod === "REVENUECAT_SECRET_NOT_CONFIGURED" ? 503 : 502, headers });
      }
    }

    const simdi = new Date();
    let proExpiresAt: string | null = null;
    if (action === "grant_pro") {
      const { data: mevcut } = await admin
        .from("user_entitlements")
        .select("pro_expires_at")
        .eq("user_id", userId)
        .maybeSingle();
      const mevcutBitis = mevcut?.pro_expires_at ? new Date(mevcut.pro_expires_at) : null;
      const baslangic = mevcutBitis && mevcutBitis.getTime() > simdi.getTime() ? mevcutBitis : simdi;
      const bitis = new Date(baslangic);
      bitis.setDate(bitis.getDate() + 30);
      proExpiresAt = bitis.toISOString();
      const { error } = await admin.from("user_entitlements").upsert(
        {
          user_id: userId,
          pro_expires_at: proExpiresAt,
          pro_purchase_id: null,
          source: "admin_manual",
          updated_at: simdi.toISOString(),
        },
        { onConflict: "user_id" },
      );
      if (error) return new Response(JSON.stringify({ error: "ENTITLEMENT_UPDATE_FAILED" }), { status: 500, headers });
    } else {
      const { error } = await admin.from("user_entitlements").upsert(
        {
          user_id: userId,
          pro_expires_at: null,
          pro_purchase_id: null,
          source: "admin_revoked",
          updated_at: simdi.toISOString(),
        },
        { onConflict: "user_id" },
      );
      if (error) return new Response(JSON.stringify({ error: "ENTITLEMENT_UPDATE_FAILED" }), { status: 500, headers });
    }

    return new Response(JSON.stringify({ ok: true, userId, proExpiresAt }), { status: 200, headers });
  }

  let kullanicilar;
  try {
    kullanicilar = await tumKullanicilariGetir(admin);
  } catch {
    return new Response(JSON.stringify({ error: "USERS_UNAVAILABLE" }), { status: 500, headers });
  }

  const { data: kayitlar, error: kayitHatasi } = await admin.from("kv_store").select("user_id,updated_at,value");
  if (kayitHatasi) return new Response(JSON.stringify({ error: "DATA_UNAVAILABLE" }), { status: 500, headers });
  const { data: haklar, error: hakHatasi } = await admin
    .from("user_entitlements")
    .select("user_id,pro_expires_at,source,trial_started_at,trial_ends_at,trial_announcement_sent_at,features_announcement_sent_at");
  if (hakHatasi) return new Response(JSON.stringify({ error: "ENTITLEMENTS_UNAVAILABLE" }), { status: 500, headers });
  const veriDurumu = new Map((kayitlar || []).map((x) => [x.user_id, x.updated_at]));
  const hakDurumu = new Map((haklar || []).map((x) => [x.user_id, x]));
  const simdi = Date.now();
  const gun = 86400000;
  const satirlar = kullanicilar.map((u) => {
    const sonGiris = u.last_sign_in_at || null;
    const sonGirisMs = sonGiris ? new Date(sonGiris).getTime() : 0;
    const hak = hakDurumu.get(u.id);
    const proBitis = hak?.pro_expires_at || null;
    const trialBitis = hak?.trial_ends_at || null;
    const proAktif = !!proBitis && new Date(proBitis).getTime() > simdi;
    const trialAktif = !proAktif && !!trialBitis && new Date(trialBitis).getTime() > simdi;
    return {
      id: u.id,
      email: epostaMaskele(u.email || ""),
      created_at: u.created_at,
      last_sign_in_at: sonGiris,
      email_confirmed_at: u.email_confirmed_at || null,
      has_data: veriDurumu.has(u.id),
      data_updated_at: veriDurumu.get(u.id) || null,
      status: sonGirisMs && simdi - sonGirisMs <= 30 * gun ? "active" : "inactive",
      pro_active: proAktif,
      pro_expires_at: proBitis,
      pro_source: hak?.source || null,
      trial_active: trialAktif,
      trial_started_at: hak?.trial_started_at || null,
      trial_ends_at: trialBitis,
      trial_days_remaining: trialAktif ? Math.max(1, Math.ceil((new Date(trialBitis).getTime() - simdi) / gun)) : 0,
      trial_announcement_sent_at: hak?.trial_announcement_sent_at || null,
      features_announcement_sent_at: hak?.features_announcement_sent_at || null,
    };
  }).sort((a, b) => (b.last_sign_in_at || b.created_at).localeCompare(a.last_sign_in_at || a.created_at));

  const ozet = {
    total: satirlar.length,
    active_30d: satirlar.filter((x) => x.status === "active").length,
    signed_in_7d: satirlar.filter((x) => x.last_sign_in_at && simdi - new Date(x.last_sign_in_at).getTime() <= 7 * gun).length,
    new_7d: satirlar.filter((x) => simdi - new Date(x.created_at).getTime() <= 7 * gun).length,
    trial_active: satirlar.filter((x) => x.trial_active).length,
    trial_unannounced: satirlar.filter((x) => x.trial_active && !x.trial_announcement_sent_at).length,
    features_unannounced: satirlar.filter((x) => !x.features_announcement_sent_at && x.email_confirmed_at).length,
  };

  let campaigns = [];
  try { campaigns = await kampanyaListesi(admin); } catch { campaigns = []; }
  const analytics = await funnelIstatistikleri(admin);
  const finansal = topluFinansalIstatistik(kayitlar || []);
  const yonetim = yonetimIstatistikleri(kullanicilar, kayitlar || [], finansal.available);
  const geriBildirimler = geriBildirimleriHazirla(kullanicilar, kayitlar || []);
  return new Response(JSON.stringify({ summary: ozet, campaigns, analytics, financial: finansal, management: yonetim, users: satirlar, feedback: geriBildirimler }), { status: 200, headers });
});

const sayi = (deger: unknown) => {
  const n = Number(deger);
  return Number.isFinite(n) && n >= 0 && n <= 1_000_000_000_000 ? n : 0;
};

function geriBildirimleriHazirla(kullanicilar: Array<{ id: string; email?: string }>, kayitlar: Array<{ user_id: string; updated_at: string; value: string }>) {
  const epostalar = new Map(kullanicilar.map((u) => [u.id, epostaMaskele(u.email || "")]));
  const izinliTurler = new Set(["Fikir", "İyileştirme", "Sorun"]);
  const liste: Array<{ id: string; email: string; type: string; message: string; screen: string; created_at: string; status: string }> = [];
  for (const kayit of kayitlar) {
    try {
      const veri = JSON.parse(kayit.value);
      for (const x of Array.isArray(veri?.feedbacks) ? veri.feedbacks : []) {
        const mesaj = String(x?.mesaj || "").trim().slice(0, 1000);
        if (!mesaj) continue;
        const tur = String(x?.tur || "Fikir");
        liste.push({ id: String(x?.id || crypto.randomUUID()), email: epostalar.get(kayit.user_id) || "***", type: izinliTurler.has(tur) ? tur : "Fikir", message: mesaj, screen: String(x?.ekran || "/").slice(0, 80), created_at: String(x?.created_at || kayit.updated_at), status: String(x?.durum || "yeni") === "yeni" ? "yeni" : "incelendi" });
      }
    } catch { /* Geçersiz kullanıcı verisi geri bildirime dahil edilmez. */ }
  }
  return liste.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 100);
}

function kartBorcu(k: Record<string, unknown>) {
  const yeniModel = k.toplamEkstreBorcu !== undefined || k.oncekiDonemBorcu !== undefined || k.yapilanOdeme !== undefined;
  if (!yeniModel) return (sayi(k.donemIciToplam) || sayi(k.borc)) + sayi(k.donemIciEklenen);
  const ekstre = sayi(k.toplamEkstreBorcu) || sayi(k.oncekiDonemBorcu);
  const devreden = Math.max(ekstre - Math.min(sayi(k.yapilanOdeme), ekstre), 0);
  const oran = ekstre >= 180000 ? 4.25 : ekstre >= 30000 ? 3.75 : 3.25;
  return devreden + (devreden * oran) / 100;
}

function topluFinansalIstatistik(kayitlar: Array<{ user_id: string; value: string }>) {
  const ay = new Date().toISOString().slice(0, 7);
  const toplam = { debt: 0, income: 0, expense: 0, cards: 0, loans: 0, overdrafts: 0, others: 0 };
  let katilan = 0;
  for (const kayit of kayitlar) {
    try {
      const veri = JSON.parse(kayit.value);
      if (!veri || typeof veri !== "object") continue;
      const cards = Array.isArray(veri.cards) ? veri.cards.reduce((t: number, x: Record<string, unknown>) => t + kartBorcu(x), 0) : 0;
      const loans = Array.isArray(veri.loans) ? veri.loans.reduce((t: number, x: Record<string, unknown>) => t + sayi(x.kalanBorc), 0) : 0;
      const overdrafts = Array.isArray(veri.overdrafts) ? veri.overdrafts.reduce((t: number, x: Record<string, unknown>) => t + sayi(x.kullanilan), 0) : 0;
      const others = Array.isArray(veri.others) ? veri.others.reduce((t: number, x: Record<string, unknown>) => t + sayi(x.tutar), 0) : 0;
      const income = Array.isArray(veri.incomes) ? veri.incomes.reduce((t: number, x: Record<string, unknown>) => t + (x.tekrar === "Tek seferlik" && !String(x.tarih || "").startsWith(ay) ? 0 : sayi(x.tutar)), 0) : 0;
      const expense = Array.isArray(veri.expenses) ? veri.expenses.reduce((t: number, x: Record<string, unknown>) => t + (String(x.tarih || "").startsWith(ay) ? sayi(x.tutar) : 0), 0) : 0;
      toplam.cards += cards; toplam.loans += loans; toplam.overdrafts += overdrafts; toplam.others += others;
      toplam.debt += cards + loans + overdrafts + others; toplam.income += income; toplam.expense += expense;
      katilan += 1;
    } catch { /* Bozuk veya eski kayıt toplama dahil edilmez. */ }
  }
  if (katilan < 3) return { available: false, participant_count: katilan, minimum_required: 3 };
  return {
    available: true, participant_count: katilan,
    total_debt: toplam.debt, monthly_income: toplam.income, monthly_expense: toplam.expense,
    debt_to_monthly_income: toplam.income > 0 ? toplam.debt / toplam.income : null,
    breakdown: { cards: toplam.cards, loans: toplam.loans, overdrafts: toplam.overdrafts, others: toplam.others },
  };
}

function yonetimIstatistikleri(kullanicilar: Array<{ created_at: string; last_sign_in_at?: string | null }>, kayitlar: Array<{ value: string }>, finansalAcik: boolean) {
  const gunler: Array<{ date: string; new_users: number; last_sign_ins: number; income: number; expense: number }> = [];
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date(); d.setUTCDate(d.getUTCDate() - i);
    gunler.push({ date: d.toISOString().slice(0, 10), new_users: 0, last_sign_ins: 0, income: 0, expense: 0 });
  }
  const gunMap = new Map(gunler.map((x) => [x.date, x]));
  for (const u of kullanicilar) {
    const kayit = gunMap.get(String(u.created_at).slice(0, 10)); if (kayit) kayit.new_users += 1;
    const giris = gunMap.get(String(u.last_sign_in_at || "").slice(0, 10)); if (giris) giris.last_sign_ins += 1;
  }
  const urunler = { cards: 0, loans: 0, overdrafts: 0, others: 0, incomes: 0, expenses: 0 };
  const bankalar = new Map<string, number>();
  for (const kayit of kayitlar) {
    try {
      const veri = JSON.parse(kayit.value);
      for (const [alan, bankaVar] of [["cards", true], ["loans", true], ["overdrafts", true], ["others", true], ["incomes", false], ["expenses", false]] as const) {
        const liste = Array.isArray(veri?.[alan]) ? veri[alan] : [];
        urunler[alan] += liste.length;
        if (bankaVar) for (const x of liste) {
          const banka = String(x.banka || "").trim(); if (banka) bankalar.set(banka, (bankalar.get(banka) || 0) + 1);
        }
      }
      for (const x of Array.isArray(veri?.expenses) ? veri.expenses : []) {
        const g = gunMap.get(String(x.tarih || "").slice(0, 10)); if (g) g.expense += sayi(x.tutar);
      }
      for (const x of Array.isArray(veri?.incomes) ? veri.incomes : []) {
        const g = gunMap.get(String(x.tarih || "").slice(0, 10)); if (g) g.income += sayi(x.tutar);
      }
    } catch { /* Geçersiz kayıt yönetim toplamına katılmaz. */ }
  }
  return {
    days: gunler.map((x) => ({ ...x, income: finansalAcik ? x.income : null, expense: finansalAcik ? x.expense : null })),
    data_adoption_rate: kullanicilar.length ? kayitlar.length / kullanicilar.length : 0,
    products: finansalAcik ? urunler : null,
    banks: finansalAcik ? [...bankalar.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count })) : null,
  };
}
