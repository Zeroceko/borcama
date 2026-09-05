import { createClient } from "npm:@supabase/supabase-js@2";
import { denemeDavetHtml, konuGuvenli, surum133DuyuruHtml, yeniOzelliklerHtml as yeniOzelliklerSablonu } from "../_shared/borcama-email.ts";
import { borcToplamlariniHesapla, guvenliSayi, gunlukBorcSnapshotKaydet } from "../_shared/debt-snapshot.ts";

const izinliOriginler = new Set([
  "https://borcama.com",
  "https://www.borcama.com",
  "https://crm.borcama.com",
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

const TEK_YONETICI_EPOSTASI = "ozerocek@gmail.com";

function cors(origin: string | null) {
  const izinli = origin && izinliOriginler.has(origin) ? origin : "https://borcama.com";
  return {
    "Access-Control-Allow-Origin": izinli,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin",
  };
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
      headers: { "List-Unsubscribe": `<mailto:zero@borcama.com?subject=Abonelikten%20ayril>` },
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

async function kullaniciKampanyaGecmisi(
  admin: ReturnType<typeof createClient>,
  userId: string,
) {
  const { data, error } = await admin.from("marketing_deliveries")
    .select("id,campaign_id,status,sent_at,delivered_at,opened_at,clicked_at,visited_at,error_code,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return [];
  const kampanyaIdleri = [...new Set((data || []).map((delivery) => delivery.campaign_id))];
  const { data: campaigns } = kampanyaIdleri.length
    ? await admin.from("marketing_campaigns").select("id,name,subject,kind").in("id", kampanyaIdleri)
    : { data: [] };
  const kampanyaHaritasi = new Map((campaigns || []).map((campaign) => [campaign.id, campaign]));
  return (data || []).map((delivery) => {
    const campaign = kampanyaHaritasi.get(delivery.campaign_id);
    return {
      id: delivery.id,
      campaign_name: campaign?.name || "Borcama e-postası",
      subject: campaign?.subject || "",
      kind: campaign?.kind || "",
      status: delivery.status,
      sent_at: delivery.sent_at,
      delivered_at: delivery.delivered_at,
      opened_at: delivery.opened_at,
      clicked_at: delivery.clicked_at,
      visited_at: delivery.visited_at,
      error_code: delivery.error_code,
      created_at: delivery.created_at,
    };
  });
}

async function funnelIstatistikleri(admin: ReturnType<typeof createClient>) {
  const since = new Date(Date.now() - 90 * 86400000).toISOString();
  const [{ data: daily, error: dailyError }, { data: sources, error: sourceError }, { data: pmax, error: pmaxError }, { data: landingExperiment, error: landingExperimentError }, { data: depositTool, error: depositToolError }] = await Promise.all([
    admin.rpc("admin_funnel_daily", { p_since: since }),
    admin.rpc("admin_funnel_sources", { p_since: since }),
    admin.rpc("admin_pmax_control_funnel", { p_since: since }),
    admin.rpc("admin_landing_experiment_funnel", { p_since: since }),
    admin.rpc("admin_deposit_tool_funnel", { p_since: since }),
  ]);
  if (dailyError || sourceError || pmaxError || landingExperimentError || depositToolError) return { available: false, daily: [], sources: [], pmax: null, landing_experiment: [], deposit_tool: null };
  return { available: true, daily: daily || [], sources: sources || [], pmax: pmax?.[0] || null, landing_experiment: landingExperiment || [], deposit_tool: depositTool?.[0] || null };
}

async function referralOverview(
  admin: ReturnType<typeof createClient>,
  emails: Map<string, string>,
  userId: string | null = null,
) {
  let query = admin.from("referrals")
    .select("id,referrer_user_id,invitee_user_id,status,risk_reason,attributed_at,verified_at,rewarded_at,reviewed_at")
    .order("created_at", { ascending: false }).limit(300);
  if (userId) query = query.or(`referrer_user_id.eq.${userId},invitee_user_id.eq.${userId}`);
  const { data: rows, error } = await query;
  if (error) return { available: false, summary: {}, items: [] };
  const ids = (rows || []).map((row) => row.id);
  const { data: rewards } = ids.length
    ? await admin.from("referral_rewards").select("referral_id,user_id,role,days,status,starts_at,ends_at,applied_at,billing_pause_status,paddle_subscription_id,billing_pause_effective_at,billing_resume_at,billing_error").in("referral_id", ids)
    : { data: [] };
  const items = (rows || []).map((row) => ({
    ...row,
    referrer_email: emails.get(row.referrer_user_id) || "—",
    invitee_email: emails.get(row.invitee_user_id) || "—",
    rewards: (rewards || []).filter((reward) => reward.referral_id === row.id),
  }));
  return {
    available: true,
    summary: {
      registered: items.length,
      verified: items.filter((item) => !!item.verified_at).length,
      rewarded: items.filter((item) => item.status === "rewarded").length,
      review: items.filter((item) => item.status === "review").length,
      granted_days: (rewards || []).filter((reward) => reward.status === "applied").reduce((sum, reward) => sum + Number(reward.days || 0), 0),
    },
    items,
  };
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

type KampanyaKullanicisi = {
  id: string;
  email?: string;
  email_confirmed_at?: string | null;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
};

function iletisimdenCikmis(user: KampanyaKullanicisi) {
  const metadata = { ...(user.app_metadata || {}), ...(user.user_metadata || {}) };
  return metadata.marketing_opt_out === true ||
    metadata.email_opt_out === true ||
    metadata.communication_opt_out === true;
}

async function surum133Hedefleri(
  admin: ReturnType<typeof createClient>,
  kullanicilar: KampanyaKullanicisi[],
) {
  const campaign = await kampanyaGetir(admin, "features-v1-33");
  if (campaign.status !== "active") throw new Error("CAMPAIGN_NOT_ACTIVE");
  const [{ data: mevcutlar, error: mevcutHatasi }, { data: engellenenler, error: engelHatasi }] = await Promise.all([
    admin.from("marketing_deliveries").select("user_id,status").eq("campaign_id", campaign.id),
    admin.from("marketing_deliveries").select("user_id,status").in("status", ["bounced", "complained"]),
  ]);
  if (mevcutHatasi || engelHatasi) throw new Error("DELIVERIES_UNAVAILABLE");
  const dahaOnceGonderilen = new Set(
    (mevcutlar || []).filter((x) => x.user_id && x.status !== "failed").map((x) => x.user_id),
  );
  const teslimatiEngellenen = new Set((engellenenler || []).filter((x) => x.user_id).map((x) => x.user_id));
  const hedefler = kullanicilar
    .filter((u) => u.email && u.email_confirmed_at)
    .filter((u) => !iletisimdenCikmis(u) && !teslimatiEngellenen.has(u.id) && !dahaOnceGonderilen.has(u.id))
    .map((u) => ({ user_id: u.id, email: String(u.email).trim().toLowerCase() }));
  return { campaign, hedefler };
}

async function surum133DuyurusuGonder(
  admin: ReturnType<typeof createClient>,
  kullanicilar: KampanyaKullanicisi[],
) {
  const { campaign, hedefler } = await surum133Hedefleri(admin, kullanicilar);
  let gonderilen = 0;
  for (const hedef of hedefler) {
    const sent = await takipliKampanyaGonder(
      admin,
      campaign,
      hedef,
      (url) => surum133DuyuruHtml(url),
      "/debts?utm_source=resend&utm_medium=email&utm_campaign=siz_istediniz_v1_33_0&utm_content=ana_cta",
    );
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

// Finansal kayıtların içeriğini okumadan, yalnız gizlilik-minimize edilmiş olay
// adlarından CEO için güvenilir ürün kullanım hunisi üretilir.
const AKTIVASYON_OLAYLARI = ["card_added", "statement_added", "loan_added", "overdraft_added", "other_debt_added"];
const ANLAMLI_KULLANIM_OLAYLARI = [...AKTIVASYON_OLAYLARI, "expense_added", "income_added", "asset_added", "payment_added"];

function turkiyeGunBaslangici(simdi = new Date()) {
  const parcalar = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(simdi);
  const parca = (tur: string) => parcalar.find((x) => x.type === tur)?.value || "";
  return new Date(`${parca("year")}-${parca("month")}-${parca("day")}T00:00:00+03:00`);
}

function edinimKanali(edinim: Record<string, unknown> | undefined) {
  if (!edinim) return null;
  return {
    source: String(edinim.source || "direct").slice(0, 100),
    medium: String(edinim.medium || "").slice(0, 100),
    campaign: String(edinim.campaign || "").slice(0, 120),
  };
}

async function tumAktiviteOlaylariniGetir(
  admin: ReturnType<typeof createClient>, olayTurleri: string[], baslangic: string | null = null, artan = false,
) {
  const sonuc: Array<{ user_id: string; event_type: string; created_at: string }> = [];
  for (let sayfa = 0; sayfa < 200; sayfa += 1) {
    let sorgu = admin.from("activity_logs").select("user_id,event_type,created_at")
      .in("event_type", olayTurleri).order("created_at", { ascending: artan })
      .range(sayfa * 1000, sayfa * 1000 + 999);
    if (baslangic) sorgu = sorgu.gte("created_at", baslangic);
    const { data, error } = await sorgu;
    if (error) throw new Error("ACTIVITY_MEASUREMENT_UNAVAILABLE");
    sonuc.push(...(data || []));
    if ((data || []).length < 1000) return sonuc;
  }
  // Eksik toplam dönmek yerine kapasite aşıldığını görünür kıl; rapor yanlış güven yaratmasın.
  throw new Error("ACTIVITY_MEASUREMENT_TOO_LARGE");
}

async function buyumeHunisiIstatistikleri(
  admin: ReturnType<typeof createClient>,
  kullanicilar: Array<{ id: string; created_at: string; email_confirmed_at?: string | null }>,
  edinimler: Array<Record<string, unknown>>,
) {
  const simdi = new Date();
  const bugunBaslangici = turkiyeGunBaslangici(simdi);
  const yediGunOnce = new Date(simdi.getTime() - 7 * 86400000);
  let aktivasyonOlaylari: Array<{ user_id: string; created_at: string }> = [];
  let kullanimOlaylari: Array<{ user_id: string; created_at: string }> = [];
  try {
    [aktivasyonOlaylari, kullanimOlaylari] = await Promise.all([
      tumAktiviteOlaylariniGetir(admin, AKTIVASYON_OLAYLARI, null, true),
      tumAktiviteOlaylariniGetir(admin, ANLAMLI_KULLANIM_OLAYLARI, yediGunOnce.toISOString()),
    ]);
  } catch {
    return {
      available: false,
      generated_at: simdi.toISOString(),
      error: "ACTIVITY_MEASUREMENT_UNAVAILABLE",
    };
  }

  const edinimHaritasi = new Map(edinimler.map((x) => [String(x.user_id), x]));
  const ilkAktivasyon = new Map<string, string>();
  for (const olay of aktivasyonOlaylari) {
    const userId = String(olay.user_id || "");
    if (userId && !ilkAktivasyon.has(userId)) ilkAktivasyon.set(userId, String(olay.created_at));
  }
  const bugunKullananlar = new Set<string>();
  const yediGundeKullananlar = new Set<string>();
  for (const olay of kullanimOlaylari) {
    const userId = String(olay.user_id || "");
    if (!userId) continue;
    yediGundeKullananlar.add(userId);
    if (new Date(String(olay.created_at)).getTime() >= bugunBaslangici.getTime()) bugunKullananlar.add(userId);
  }

  const kanalSayilari = new Map<string, { source: string; medium: string; campaign: string; new_today: number; verified_today: number; activated_today: number }>();
  const olculemeyen = { new_today: 0, verified_today: 0, activated_today: 0 };
  const kanalaEkle = (userId: string, alan: "new_today" | "verified_today" | "activated_today") => {
    const kanal = edinimKanali(edinimHaritasi.get(userId));
    if (!kanal) { olculemeyen[alan] += 1; return; }
    const anahtar = `${kanal.source}\u0000${kanal.medium}\u0000${kanal.campaign}`;
    const satir = kanalSayilari.get(anahtar) || { ...kanal, new_today: 0, verified_today: 0, activated_today: 0 };
    satir[alan] += 1;
    kanalSayilari.set(anahtar, satir);
  };
  let toplamDogrulanmis = 0;
  for (const kullanici of kullanicilar) {
    if (kullanici.email_confirmed_at) toplamDogrulanmis += 1;
    if (new Date(kullanici.created_at).getTime() >= bugunBaslangici.getTime()) kanalaEkle(kullanici.id, "new_today");
    if (kullanici.email_confirmed_at && new Date(kullanici.email_confirmed_at).getTime() >= bugunBaslangici.getTime()) kanalaEkle(kullanici.id, "verified_today");
  }
  for (const [userId, tarih] of ilkAktivasyon) {
    if (new Date(tarih).getTime() >= bugunBaslangici.getTime()) kanalaEkle(userId, "activated_today");
  }

  return {
    available: true,
    generated_at: simdi.toISOString(),
    time_zone: "Europe/Istanbul",
    activation_definition: "İlk kart, ekstre, kredi, ek hesap/KMH veya diğer borç ekleme olayı",
    usage_definition: "Giriş hariç borç, ekstre, gelir, gider, varlık veya ödeme kaydı",
    summary: {
      total_registered: kullanicilar.length,
      total_verified: toplamDogrulanmis,
      new_today: [...kanalSayilari.values()].reduce((toplam, x) => toplam + x.new_today, 0) + olculemeyen.new_today,
      verified_today: [...kanalSayilari.values()].reduce((toplam, x) => toplam + x.verified_today, 0) + olculemeyen.verified_today,
      used_today: bugunKullananlar.size,
      used_7d: yediGundeKullananlar.size,
      activated_total_observed: ilkAktivasyon.size,
      activated_today: [...kanalSayilari.values()].reduce((toplam, x) => toplam + x.activated_today, 0) + olculemeyen.activated_today,
    },
    channels: [...kanalSayilari.values()].sort((a, b) => (b.new_today + b.verified_today + b.activated_today) - (a.new_today + a.verified_today + a.activated_today)),
    unmeasured: olculemeyen,
  };
}

const TAM_AKTIVASYON_BORC_OLAYLARI = AKTIVASYON_OLAYLARI;
const TAM_AKTIVASYON_HAREKET_OLAYLARI = ["expense_added", "payment_added"];

function gecersizOlmayanTarih(deger: string | null | undefined) {
  const zaman = new Date(String(deger || "")).getTime();
  return Number.isFinite(zaman) ? zaman : null;
}

function turkiyeTarihAnahtari(tarih = new Date()) {
  const parcalar = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(tarih);
  const parca = (tur: string) => parcalar.find((x) => x.type === tur)?.value || "";
  return `${parca("year")}-${parca("month")}-${parca("day")}`;
}

function urunSagligiDonemi(req: Request) {
  const url = new URL(req.url);
  const tip = url.searchParams.get("health_period") || "30d";
  const bugun = turkiyeGunBaslangici();
  const sonrakiGun = new Date(bugun.getTime() + 86400000);
  let baslangic = new Date(sonrakiGun);
  let bitis = new Date(sonrakiGun);
  let etiket = "Son 30 gün";
  if (tip === "today") { baslangic = bugun; etiket = "Bugün"; }
  else if (tip === "7d") { baslangic = new Date(sonrakiGun.getTime() - 7 * 86400000); etiket = "Son 7 gün"; }
  else if (tip === "30d") { baslangic = new Date(sonrakiGun.getTime() - 30 * 86400000); }
  else if (tip === "custom") {
    const baslangicMetni = url.searchParams.get("health_from") || "";
    const bitisMetni = url.searchParams.get("health_to") || "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(baslangicMetni) || !/^\d{4}-\d{2}-\d{2}$/.test(bitisMetni)) throw new Error("INVALID_HEALTH_PERIOD");
    baslangic = new Date(`${baslangicMetni}T00:00:00+03:00`);
    bitis = new Date(`${bitisMetni}T00:00:00+03:00`);
    bitis = new Date(bitis.getTime() + 86400000);
    if (baslangic.getTime() >= bitis.getTime() || bitis.getTime() - baslangic.getTime() > 366 * 86400000) throw new Error("INVALID_HEALTH_PERIOD");
    etiket = "Özel dönem";
  } else throw new Error("INVALID_HEALTH_PERIOD");
  const oncekiBaslangic = new Date(baslangic.getTime() - (bitis.getTime() - baslangic.getTime()));
  return { tip, etiket, baslangic, bitis, oncekiBaslangic };
}

// Bu özet ham finansal kayıt okumaz: yalnız anonimleştirilmiş olay adları, auth
// zamanları, edinim kaydı ve ödeme referansı olan entitlement satırlarını kullanır.
async function urunSagligiIstatistikleri(
  admin: ReturnType<typeof createClient>,
  req: Request,
  kullanicilar: Array<{ id: string; created_at: string; email_confirmed_at?: string | null }>,
  edinimler: Array<Record<string, unknown>>,
  haklar: Array<Record<string, unknown>>,
) {
  const simdi = new Date();
  const donem = urunSagligiDonemi(req);
  let olaylar: Array<{ user_id: string; event_type: string; created_at: string }> = [];
  try { olaylar = await tumAktiviteOlaylariniGetir(admin, ANLAMLI_KULLANIM_OLAYLARI, null, true); }
  catch { return { available: false, generated_at: simdi.toISOString(), error: "ACTIVITY_MEASUREMENT_UNAVAILABLE" }; }

  const aralikta = (deger: string | null | undefined, baslangic = donem.baslangic, bitis = donem.bitis) => {
    const zaman = gecersizOlmayanTarih(deger);
    return zaman !== null && zaman >= baslangic.getTime() && zaman < bitis.getTime();
  };
  const ilkOlay = olaylar[0]?.created_at || null;
  const izlemeBaslangici = gecersizOlmayanTarih(ilkOlay);
  const kullaniciDurumu = new Map<string, { borc?: number; gelir?: number; hareket?: number; tam?: number }>();
  for (const olay of olaylar) {
    const userId = String(olay.user_id || ""); const zaman = gecersizOlmayanTarih(olay.created_at);
    if (!userId || zaman === null) continue;
    const durum = kullaniciDurumu.get(userId) || {};
    if (TAM_AKTIVASYON_BORC_OLAYLARI.includes(olay.event_type) && durum.borc === undefined) durum.borc = zaman;
    if (olay.event_type === "income_added" && durum.gelir === undefined) durum.gelir = zaman;
    if (TAM_AKTIVASYON_HAREKET_OLAYLARI.includes(olay.event_type) && durum.hareket === undefined) durum.hareket = zaman;
    if (durum.tam === undefined && durum.borc !== undefined && durum.gelir !== undefined && durum.hareket !== undefined) durum.tam = Math.max(durum.borc, durum.gelir, durum.hareket);
    kullaniciDurumu.set(userId, durum);
  }
  const anlamliTekiller = (baslangic: Date, bitis: Date) => new Set(olaylar.filter((x) => aralikta(x.created_at, baslangic, bitis)).map((x) => String(x.user_id || "")).filter(Boolean)).size;
  const say = (alan: "created_at" | "email_confirmed_at", baslangic = donem.baslangic, bitis = donem.bitis) => kullanicilar.filter((x) => aralikta(x[alan], baslangic, bitis)).length;
  const ilkBorcSayisi = (baslangic = donem.baslangic, bitis = donem.bitis) => [...kullaniciDurumu.values()].filter((x) => x.borc !== undefined && x.borc >= baslangic.getTime() && x.borc < bitis.getTime()).length;
  const tamAktivasyonSayisi = (baslangic = donem.baslangic, bitis = donem.bitis) => [...kullaniciDurumu.values()].filter((x) => x.tam !== undefined && x.tam >= baslangic.getTime() && x.tam < bitis.getTime()).length;
  const onceki = { registered: say("created_at", donem.oncekiBaslangic, donem.baslangic), verified: say("email_confirmed_at", donem.oncekiBaslangic, donem.baslangic), first_debt_or_statement: ilkBorcSayisi(donem.oncekiBaslangic, donem.baslangic), full_activation_observed: tamAktivasyonSayisi(donem.oncekiBaslangic, donem.baslangic), meaningful_active: anlamliTekiller(donem.oncekiBaslangic, donem.baslangic) };

  const edinimHaritasi = new Map(edinimler.map((x) => [String(x.user_id || ""), x]));
  const kanalSatirlari = new Map<string, { source: string; medium: string; campaign: string; registered: number; verified: number; full_activation_observed: number }>();
  const bilinmeyenKanal = { registered: 0, verified: 0, full_activation_observed: 0 };
  const kanalaEkle = (userId: string, alan: "registered" | "verified" | "full_activation_observed") => {
    const edinim = edinimKanali(edinimHaritasi.get(userId));
    if (!edinim) { bilinmeyenKanal[alan] += 1; return; }
    const anahtar = `${edinim.source}\u0000${edinim.medium}\u0000${edinim.campaign}`;
    const satir = kanalSatirlari.get(anahtar) || { ...edinim, registered: 0, verified: 0, full_activation_observed: 0 };
    satir[alan] += 1; kanalSatirlari.set(anahtar, satir);
  };
  for (const kullanici of kullanicilar) {
    if (aralikta(kullanici.created_at)) kanalaEkle(kullanici.id, "registered");
    if (aralikta(kullanici.email_confirmed_at)) kanalaEkle(kullanici.id, "verified");
  }
  for (const [userId, durum] of kullaniciDurumu) if (durum.tam !== undefined && durum.tam >= donem.baslangic.getTime() && durum.tam < donem.bitis.getTime()) kanalaEkle(userId, "full_activation_observed");

  const retention = (gun: number) => {
    if (izlemeBaslangici === null) return { available: false, reason: "Aktivite günlüğü henüz veri içermiyor." };
    const olgunlukSiniri = Math.min(donem.bitis.getTime(), simdi.getTime()) - (gun + 1) * 86400000;
    const kohort = kullanicilar.filter((x) => { const kayit = gecersizOlmayanTarih(x.created_at); return kayit !== null && kayit >= Math.max(izlemeBaslangici, donem.baslangic.getTime()) && kayit <= olgunlukSiniri; });
    if (!kohort.length) return { available: false, reason: "Yeterli gözlem süresi olan izlenebilir kohort yok." };
    const geriDonen = kohort.filter((x) => {
      const kayit = gecersizOlmayanTarih(x.created_at)!; const hedefBaslangic = kayit + gun * 86400000; const hedefBitis = hedefBaslangic + 86400000;
      return olaylar.some((o) => o.user_id === x.id && aralikta(o.created_at, new Date(hedefBaslangic), new Date(hedefBitis)));
    }).length;
    return { available: true, returned: geriDonen, eligible: kohort.length };
  };
  const hakHaritasi = new Map(haklar.map((x) => [String(x.user_id || ""), x]));
  const aktifDeneme = [...hakHaritasi.values()].filter((x) => {
    const deneme = gecersizOlmayanTarih(String(x.trial_ends_at || "")); const pro = gecersizOlmayanTarih(String(x.pro_expires_at || ""));
    return deneme !== null && deneme > simdi.getTime() && !(pro !== null && pro > simdi.getTime());
  }).length;
  const ucretliAktifPro = [...hakHaritasi.values()].filter((x) => {
    const pro = gecersizOlmayanTarih(String(x.pro_expires_at || ""));
    return pro !== null && pro > simdi.getTime() && Boolean(String(x.pro_purchase_id || "").trim());
  }).length;
  const toplamDogrulanmis = kullanicilar.filter((x) => x.email_confirmed_at).length;
  const eskiIzlenemeyen = izlemeBaslangici === null ? kullanicilar.length : kullanicilar.filter((x) => (gecersizOlmayanTarih(x.created_at) || 0) < izlemeBaslangici && !kullaniciDurumu.get(x.id)?.tam).length;
  return {
    available: true, generated_at: simdi.toISOString(), time_zone: "Europe/Istanbul",
    period: { type: donem.tip, label: donem.etiket, from: turkiyeTarihAnahtari(donem.baslangic), to: turkiyeTarihAnahtari(new Date(donem.bitis.getTime() - 1)) },
    target: { verified_users: 200, current_verified_users: toplamDogrulanmis, definition: "60. gün hedefi: e-postası doğrulanmış benzersiz hesaplar." },
    summary: { registered: say("created_at"), verified: say("email_confirmed_at"), first_debt_or_statement: ilkBorcSayisi(), full_activation_observed: tamAktivasyonSayisi(), meaningful_active: anlamliTekiller(donem.baslangic, donem.bitis), previous: onceki },
    active_users: { today: anlamliTekiller(turkiyeGunBaslangici(simdi), new Date(turkiyeGunBaslangici(simdi).getTime() + 86400000)), last_7_days: anlamliTekiller(new Date(turkiyeGunBaslangici(simdi).getTime() - 6 * 86400000), new Date(turkiyeGunBaslangici(simdi).getTime() + 86400000)), last_30_days: anlamliTekiller(new Date(turkiyeGunBaslangici(simdi).getTime() - 29 * 86400000), new Date(turkiyeGunBaslangici(simdi).getTime() + 86400000)), definition: "Giriş hariç borç/ekstre, gelir, gider, varlık veya ödeme olayı yapan tekil kullanıcı." },
    retention: { d7: retention(7), d30: retention(30), definition: "Kayıttan tam 7. veya 30. gündeki anlamlı kullanım; oran her zaman dönen/uygun kohort olarak verilir." },
    pro: { active_trial: aktifDeneme, paid_active_pro: ucretliAktifPro, first_paid_conversion: { available: false, reason: "İlk ücretli dönüşümün değişmez tarihçesi mevcut entitlement kaynağında tutulmuyor." }, definition: "Ücretli aktif Pro yalnız geçerli Pro bitişi ve ödeme referansı olan hesaplardır; deneme veya yönetici ödülü gelir değildir." },
    channels: [...kanalSatirlari.values()].sort((a, b) => (b.registered + b.verified + b.full_activation_observed) - (a.registered + a.verified + a.full_activation_observed)),
    unknown_channel: bilinmeyenKanal,
    measurement: { activation_definition: "Tam aktivasyon: ilk borç/ekstre + gelir + ilk gider veya ödeme olayı.", activity_tracking_started_at: ilkOlay, legacy_or_unmeasured_accounts: eskiIzlenemeyen, test_admin_classification: { available: false, reason: "Doğrulanmış test/yönetici/çevre işareti kaynakta yok; eski tarih veya ilk temas kaydı müşteri türü sayılmaz." }, cost_data: { available: false, reason: "Bu CRM kaynağında dönemsel kanal maliyeti yok; maliyet ve edinme başına maliyet hesaplanmadı." }, critical_flow_errors: { available: false, reason: "Kritik akış hata kaynağı bu rapora bağlı değil." }, open_support: { available: false, reason: "Açık destek kaydı için tamamlanmış, dönemsel bir kaynak yok." } },
  };
}

Deno.serve(async (req) => {
  const headers = { ...cors(req.headers.get("origin")), "Content-Type": "application/json; charset=utf-8" };
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  if (req.method !== "GET" && req.method !== "POST") return new Response(JSON.stringify({ error: "METHOD_NOT_ALLOWED" }), { status: 405, headers });

  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 401, headers });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data: authData, error: authError } = await admin.auth.getUser(token);
  const email = authData.user?.email?.toLowerCase();
  if (authError || email !== TEK_YONETICI_EPOSTASI) {
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
    if (action === "send_release_133_announcement") {
      try {
        const kullanicilar = await tumKullanicilariGetir(admin);
        const sent = await surum133DuyurusuGonder(admin, kullanicilar);
        return new Response(JSON.stringify({ ok: true, sent }), { status: 200, headers });
      } catch (error) {
        const kod = error instanceof Error ? error.message : "EMAIL_SEND_FAILED";
        return new Response(JSON.stringify({ error: kod }), { status: kod === "EMAIL_PROVIDER_NOT_CONFIGURED" ? 503 : 502, headers });
      }
    }
    if (["approve_referral", "reject_referral"].includes(action)) {
      const referralId = String(body?.referralId || "");
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(referralId))
        return new Response(JSON.stringify({ error: "INVALID_REFERRAL" }), { status: 422, headers });
      const { error } = await admin.rpc("review_referral_reward", {
        target_referral_id: referralId,
        target_admin_id: authData.user!.id,
        approve: action === "approve_referral",
      });
      if (error) return new Response(JSON.stringify({ error: "REFERRAL_REVIEW_FAILED" }), { status: 500, headers });
      return new Response(JSON.stringify({ ok: true, referralId, status: action === "approve_referral" ? "approved" : "rejected" }), { status: 200, headers });
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

  const { data: kayitlar, error: kayitHatasi } = await admin.from("kv_store").select("user_id,updated_at,value").eq("key", "borctakip:v1");
  if (kayitHatasi) return new Response(JSON.stringify({ error: "DATA_UNAVAILABLE" }), { status: 500, headers });
  const { data: haklar, error: hakHatasi } = await admin
    .from("user_entitlements")
    .select("user_id,pro_expires_at,pro_purchase_id,source,trial_started_at,trial_ends_at,trial_announcement_sent_at,features_announcement_sent_at");
  if (hakHatasi) return new Response(JSON.stringify({ error: "ENTITLEMENTS_UNAVAILABLE" }), { status: 500, headers });
  const { data: edinimler, error: edinimHatasi } = await admin.from("user_acquisition")
    .select("user_id,source,medium,campaign,content,term,click_id_present,plan,first_touch_at,captured_at");
  if (edinimHatasi) return new Response(JSON.stringify({ error: "ACQUISITION_UNAVAILABLE" }), { status: 500, headers });
  const veriDurumu = new Map((kayitlar || []).map((x) => [x.user_id, x.updated_at]));
  const hakDurumu = new Map((haklar || []).map((x) => [x.user_id, x]));
  const edinimDurumu = new Map((edinimler || []).map((x) => [x.user_id, x]));
  const simdi = Date.now();
  const gun = 86400000;
  const satirlar = kullanicilar.map((u) => {
    const sonGiris = u.last_sign_in_at || null;
    const sonGirisMs = sonGiris ? new Date(sonGiris).getTime() : 0;
    const yasakBitisi = u.banned_until || null;
    const erisimEngelli = !!yasakBitisi && new Date(yasakBitisi).getTime() > simdi;
    const hak = hakDurumu.get(u.id);
    const proBitis = hak?.pro_expires_at || null;
    const trialBitis = hak?.trial_ends_at || null;
    const proAktif = !!proBitis && new Date(proBitis).getTime() > simdi;
    const denemedenCikarildi = ["admin_revoked", "self_revoked"].includes(hak?.source || "");
    const trialAktif = !proAktif && !denemedenCikarildi && !!trialBitis && new Date(trialBitis).getTime() > simdi;
    const edinim = edinimDurumu.get(u.id);
    return {
      id: u.id,
      email: u.email || "",
      created_at: u.created_at,
      last_sign_in_at: sonGiris,
      email_confirmed_at: u.email_confirmed_at || null,
      has_data: veriDurumu.has(u.id),
      data_updated_at: veriDurumu.get(u.id) || null,
      status: sonGirisMs && simdi - sonGirisMs <= 30 * gun ? "active" : "inactive",
      access_status: erisimEngelli ? "blocked" : "normal",
      banned_until: erisimEngelli ? yasakBitisi : null,
      pro_active: proAktif,
      pro_expires_at: proBitis,
      pro_source: hak?.source || null,
      trial_active: trialAktif,
      trial_started_at: hak?.trial_started_at || null,
      trial_ends_at: trialBitis,
      trial_days_remaining: trialAktif ? Math.max(1, Math.ceil((new Date(trialBitis).getTime() - simdi) / gun)) : 0,
      trial_announcement_sent_at: hak?.trial_announcement_sent_at || null,
      features_announcement_sent_at: hak?.features_announcement_sent_at || null,
      acquisition: edinim ? {
        captured: true,
        source: String(edinim.source || "direct").slice(0, 100),
        medium: String(edinim.medium || "").slice(0, 100),
        campaign: String(edinim.campaign || "").slice(0, 120),
        content: String(edinim.content || "").slice(0, 120),
        term: String(edinim.term || "").slice(0, 120),
        paid_click: Boolean(edinim.click_id_present),
        plan: String(edinim.plan || "").slice(0, 30),
        first_touch_at: edinim.first_touch_at || null,
        captured_at: edinim.captured_at || null,
      } : { captured: false },
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
    release_133_unannounced: 0,
  };

  try {
    const { hedefler } = await surum133Hedefleri(admin, kullanicilar);
    ozet.release_133_unannounced = hedefler.length;
  } catch { /* Kampanya canlı değilse gönderim sayısı sıfır kalır. */ }

  const istenenKullaniciId = new URL(req.url).searchParams.get("userId");
  if (istenenKullaniciId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(istenenKullaniciId)) {
    return new Response(JSON.stringify({ error: "INVALID_USER_ID" }), { status: 422, headers });
  }
  let campaigns = [];
  let analytics = null;
  let finansal = null;
  let yonetim = null;
  let buyumeHunisi = null;
  let urunSagligi = null;
  if (!istenenKullaniciId) {
    try { campaigns = await kampanyaListesi(admin); } catch { campaigns = []; }
    analytics = await funnelIstatistikleri(admin);
    finansal = topluFinansalIstatistik(kayitlar || []);
    if (finansal.available) {
      try {
        await gunlukBorcSnapshotKaydet(admin, kayitlar || []);
        const baslangic = new Date(); baslangic.setUTCDate(baslangic.getUTCDate() - 29);
        const { data: egilim, error: egilimHatasi } = await admin.from("financial_daily_snapshots")
          .select("snapshot_date,participant_count,total_debt,cards,loans,overdrafts,others")
          .gte("snapshot_date", baslangic.toISOString().slice(0, 10)).order("snapshot_date");
        if (!egilimHatasi) finansal.debt_trend = (egilim || []).map((x) => ({
          date: x.snapshot_date, participant_count: x.participant_count,
          total_debt: Number(x.total_debt), cards: Number(x.cards), loans: Number(x.loans),
          overdrafts: Number(x.overdrafts), others: Number(x.others),
        }));
      } catch { /* Snapshot tablosu geçici olarak ulaşılamazsa mevcut toplamlar yine gösterilir. */ }
    }
    yonetim = yonetimIstatistikleri(kullanicilar, kayitlar || [], finansal.available);
    buyumeHunisi = await buyumeHunisiIstatistikleri(admin, kullanicilar, edinimler || []);
    try {
      urunSagligi = await urunSagligiIstatistikleri(admin, req, kullanicilar, edinimler || [], haklar || []);
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_HEALTH_PERIOD") {
        return new Response(JSON.stringify({ error: "INVALID_HEALTH_PERIOD" }), { status: 422, headers });
      }
      urunSagligi = { available: false, generated_at: new Date().toISOString(), error: "PRODUCT_HEALTH_UNAVAILABLE" };
    }
  }
  const geriBildirimler = geriBildirimleriHazirla(kullanicilar, kayitlar || [], istenenKullaniciId);
  const epostalar = new Map(kullanicilar.map((u) => [u.id, u.email || ""]));
  const referrals = await referralOverview(admin, epostalar, istenenKullaniciId);
  const kullaniciKampanyalari = istenenKullaniciId
    ? await kullaniciKampanyaGecmisi(admin, istenenKullaniciId)
    : [];
  let aktiviteler: Array<Record<string, unknown>> = [];
  let aktiviteSorgusu = admin
    .from("activity_logs")
    .select("id,user_id,event_type,entity_type,source,path,metadata,created_at")
    .order("created_at", { ascending: false });
  if (istenenKullaniciId) aktiviteSorgusu = aktiviteSorgusu.eq("user_id", istenenKullaniciId);
  const { data: aktiviteKayitlari, error: aktiviteHatasi } = await aktiviteSorgusu.limit(istenenKullaniciId ? 500 : 300);
  if (!aktiviteHatasi) {
    aktiviteler = (aktiviteKayitlari || []).map((x) => ({
      id: x.id,
      user_id: x.user_id,
      email: epostalar.get(x.user_id) || "***",
      event_type: x.event_type,
      entity_type: x.entity_type,
      source: x.source,
      path: x.path,
      label: String(x.metadata?.label || "").slice(0, 80),
      created_at: x.created_at,
    }));
  }
  // Eski hesaplar için yalnızca en son girişi başlangıç kaydı olarak gösterir.
  // Ayrıntılı giriş geçmişi bu sürümden itibaren activity_logs içinde birikir.
  const girisiLoglananlar = new Set(aktiviteler.filter((x) => x.event_type === "login").map((x) => x.email));
  for (const u of satirlar) {
    if (istenenKullaniciId && u.id !== istenenKullaniciId) continue;
    if (!u.last_sign_in_at || girisiLoglananlar.has(u.email)) continue;
    aktiviteler.push({
      id: `last-login-${u.id}`,
      user_id: u.id,
      email: u.email,
      event_type: "login",
      entity_type: "session",
      source: "auth_last_seen",
      path: null,
      label: "",
      created_at: u.last_sign_in_at,
    });
  }
  aktiviteler.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  aktiviteler = aktiviteler.slice(0, 300);
  ozet.activity_24h = aktiviteler.filter((x) => simdi - new Date(String(x.created_at)).getTime() <= gun).length;
  const gorunenKullanicilar = istenenKullaniciId
    ? satirlar.filter((u) => u.id === istenenKullaniciId)
    : satirlar.map(({ acquisition: _acquisition, ...u }) => u);
  return new Response(JSON.stringify({
    summary: ozet,
    campaigns,
    user_campaigns: kullaniciKampanyalari,
    analytics,
    financial: finansal,
    management: yonetim,
    growth_funnel: buyumeHunisi,
    product_health: urunSagligi,
    users: gorunenKullanicilar,
    feedback: geriBildirimler,
    activities: aktiviteler,
    referrals,
  }), { status: 200, headers });
});

const sayi = guvenliSayi;

function geriBildirimleriHazirla(kullanicilar: Array<{ id: string; email?: string }>, kayitlar: Array<{ user_id: string; updated_at: string; value: string }>, userId: string | null = null) {
  const epostalar = new Map(kullanicilar.map((u) => [u.id, u.email || ""]));
  const izinliTurler = new Set(["Fikir", "İyileştirme", "Sorun"]);
  const liste: Array<{ id: string; user_id: string; email: string; type: string; message: string; screen: string; created_at: string; status: string }> = [];
  for (const kayit of kayitlar) {
    if (userId && kayit.user_id !== userId) continue;
    try {
      const veri = JSON.parse(kayit.value);
      for (const x of Array.isArray(veri?.feedbacks) ? veri.feedbacks : []) {
        const mesaj = String(x?.mesaj || "").trim().slice(0, 1000);
        if (!mesaj) continue;
        const tur = String(x?.tur || "Fikir");
        liste.push({ id: String(x?.id || crypto.randomUUID()), user_id: kayit.user_id, email: epostalar.get(kayit.user_id) || "***", type: izinliTurler.has(tur) ? tur : "Fikir", message: mesaj, screen: String(x?.ekran || "/").slice(0, 80), created_at: String(x?.created_at || kayit.updated_at), status: String(x?.durum || "yeni") === "yeni" ? "yeni" : "incelendi" });
      }
    } catch { /* Geçersiz kullanıcı verisi geri bildirime dahil edilmez. */ }
  }
  return liste.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 100);
}

function topluFinansalIstatistik(kayitlar: Array<{ user_id: string; value: string }>) {
  const ay = new Date().toISOString().slice(0, 7);
  const borclar = borcToplamlariniHesapla(kayitlar);
  const toplam = { income: 0, expense: 0 };
  for (const kayit of kayitlar) {
    try {
      const veri = JSON.parse(kayit.value);
      if (!veri || typeof veri !== "object") continue;
      const income = Array.isArray(veri.incomes) ? veri.incomes.reduce((t: number, x: Record<string, unknown>) => t + (x.tekrar === "Tek seferlik" && !String(x.tarih || "").startsWith(ay) ? 0 : sayi(x.tutar)), 0) : 0;
      const expense = Array.isArray(veri.expenses) ? veri.expenses.reduce((t: number, x: Record<string, unknown>) => t + (String(x.tarih || "").startsWith(ay) ? sayi(x.tutar) : 0), 0) : 0;
      toplam.income += income; toplam.expense += expense;
    } catch { /* Bozuk veya eski kayıt toplama dahil edilmez. */ }
  }
  if (borclar.participant_count < 3) return { available: false, participant_count: borclar.participant_count, minimum_required: 3 };
  return {
    available: true, participant_count: borclar.participant_count,
    total_debt: borclar.total_debt, monthly_income: toplam.income, monthly_expense: toplam.expense,
    debt_to_monthly_income: toplam.income > 0 ? borclar.total_debt / toplam.income : null,
    breakdown: { cards: borclar.cards, loans: borclar.loans, overdrafts: borclar.overdrafts, others: borclar.others },
    debt_trend: [] as Array<Record<string, unknown>>,
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
