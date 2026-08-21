import { createClient } from "npm:@supabase/supabase-js@2";

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

function denemeDuyuruHtml(kalanGun: number) {
  const ozellikler = [
    "Borçların için kişisel ödeme önceliklerini gör",
    "Devreden bakiyelerin tahmini faiz yükünü takip et",
    "Aylık ödeme baskısını azaltan senaryoları incele",
    "Toplam faiz maliyetini azaltmaya yönelik önerileri karşılaştır",
  ];
  const liste = ozellikler.map((ozellik) => `<tr><td width="34" valign="top" style="padding:0 0 12px"><span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;border-radius:8px;background:#cdf564;color:#14160f;font-weight:900">✓</span></td><td valign="top" style="padding:2px 0 12px;color:#24261e;font-size:15px;line-height:1.45">${ozellik}</td></tr>`).join("");
  return `<!doctype html><html lang="tr"><body style="margin:0;background:#f4efe0;color:#14160f;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:32px 14px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden"><tr><td style="height:9px;background:#cdf564"></td></tr><tr><td style="padding:38px 36px 34px"><div style="font-size:30px;font-weight:900;letter-spacing:-1px;margin-bottom:26px">Borcama</div><div style="display:inline-block;padding:7px 11px;border-radius:999px;background:#eef8d0;color:#315c43;font-size:12px;font-weight:800">1 AY ÜCRETSİZ PRO</div><h1 style="font-size:32px;line-height:1.12;letter-spacing:-.7px;margin:18px 0 12px">Borcama Pro denemen hazır.</h1><p style="color:#55584c;font-size:16px;line-height:1.6;margin:0 0 22px">Hesabında yaklaşık <strong style="color:#14160f">${kalanGun} gün</strong> kalan, kart bilgisi gerektirmeyen Pro denemesi açık.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 12px">${liste}</table><a href="https://borcama.com/summary" style="display:block;margin-top:18px;padding:15px 22px;border-radius:999px;background:#cdf564;color:#14160f;text-align:center;text-decoration:none;font-size:16px;font-weight:900">Ücretsiz denemeye başla →</a><div style="margin-top:24px;padding:16px 18px;border-radius:14px;background:#f7f4ea;color:#686a60;font-size:13px;line-height:1.55"><strong style="color:#14160f">Kart bilgisi gerekmez.</strong> Deneme bittiğinde ücret alınmaz; hesabın ve kayıtların korunarak Ücretsiz plana dönersin.</div><p style="margin:26px 0 0;color:#898b80;font-size:12px;line-height:1.5">Soruların için <a href="mailto:zero@borcama.com" style="color:#315c43">zero@borcama.com</a></p></td></tr></table></td></tr></table></body></html>`;
}

function yeniOzelliklerHtml() {
  const ozellikler = [
    {
      no: "01",
      baslik: "Ekstreni yükle, rakamları tek tek yazma",
      metin: "Kredi kartı ekstreni PDF veya ekran görüntüsü olarak yükle. Borcama özet alanlarını çıkarır; sen kontrol edip kaydedersin.",
    },
    {
      no: "02",
      baslik: "Ödemeni borcun yanında kaydet",
      metin: "Asgari, kısmi veya tam ödeme yaptığında tutarı doğrudan ilgili kartın yanında kaydet; kalan borcunu güncel gör.",
    },
    {
      no: "03",
      baslik: "Geçmiş ekstrelerini dönem dönem gör",
      metin: "Kartının eski ekstrelerini kaybetmeden sakla; hangi dönemde ne kadar borç kaldığını daha kolay karşılaştır.",
    },
  ];
  const kartlar = ozellikler.map((ozellik) => `<tr><td style="padding:0 0 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f4ea;border-radius:16px"><tr><td width="54" valign="top" style="padding:18px 0 18px 18px"><span style="display:inline-block;width:36px;height:36px;line-height:36px;text-align:center;border-radius:11px;background:#cdf564;color:#14160f;font-size:12px;font-weight:900">${ozellik.no}</span></td><td valign="top" style="padding:18px"><div style="color:#14160f;font-size:17px;line-height:1.3;font-weight:900;margin-bottom:5px">${ozellik.baslik}</div><div style="color:#5d6055;font-size:14px;line-height:1.55">${ozellik.metin}</div></td></tr></table></td></tr>`).join("");
  return `<!doctype html><html lang="tr"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f4efe0;color:#14160f;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:32px 14px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:auto;background:#ffffff;border-radius:24px;overflow:hidden"><tr><td style="height:9px;background:#cdf564"></td></tr><tr><td style="padding:38px 36px 34px"><div style="font-size:30px;font-weight:900;letter-spacing:-1px;margin-bottom:26px">Borcama</div><div style="display:inline-block;padding:7px 11px;border-radius:999px;background:#fff0ec;color:#a63f31;font-size:12px;font-weight:800">SİZ İSTEDİNİZ, BİZ YAPTIK</div><h1 style="font-size:32px;line-height:1.12;letter-spacing:-.7px;margin:18px 0 12px">Ekstre girmek artık daha kısa.</h1><p style="color:#55584c;font-size:16px;line-height:1.6;margin:0 0 24px">Borcama'ya borçlarını daha az uğraşla takip etmeni sağlayan yeni özellikler ekledik.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${kartlar}</table><a href="https://borcama.com/debts" style="display:block;margin-top:18px;padding:15px 22px;border-radius:999px;background:#cdf564;color:#14160f;text-align:center;text-decoration:none;font-size:16px;font-weight:900">Yeni özellikleri dene →</a><div style="margin-top:24px;padding:17px 18px;border-radius:14px;background:#edf4ef;color:#52584f;font-size:13px;line-height:1.55"><strong style="color:#14160f">Dosyanın kontrolü sende.</strong> Ekstre cihazında okunur; kaydetmeden önce bulunan alanları sen doğrularsın.</div><div style="margin-top:14px;padding:17px 18px;border-radius:14px;background:#fff0ec;color:#6f4a43;font-size:13px;line-height:1.55"><strong style="color:#14160f">Sırada ne var?</strong> Kredi ödeme planını PDF'den aktarabilme özelliği üzerinde çalışıyoruz.</div><p style="margin:26px 0 0;color:#898b80;font-size:12px;line-height:1.5">Bir önerin mi var? Yanıtlayabilir veya <a href="mailto:zero@borcama.com" style="color:#315c43">zero@borcama.com</a> adresine yazabilirsin.</p></td></tr></table></td></tr></table></body></html>`;
}

async function yeniOzelliklerDuyurusuGonder(
  admin: ReturnType<typeof createClient>,
  kullanicilar: Array<{ id: string; email?: string; email_confirmed_at?: string | null }>,
) {
  const apiKey = String(Deno.env.get("RESEND_API_KEY") || "").trim();
  if (!apiKey) throw new Error("EMAIL_PROVIDER_NOT_CONFIGURED");
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
  for (let i = 0; i < hedefler.length; i += 100) {
    const grup = hedefler.slice(i, i + 100);
    const cevap = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(grup.map((hak) => ({
        from: "Borcama <zero@borcama.com>",
        to: [hak.email],
        reply_to: "zero@borcama.com",
        subject: "Siz istediniz, biz yaptık: Borcama'da yenilikler",
        html: yeniOzelliklerHtml(),
      }))),
    });
    if (!cevap.ok) throw new Error("EMAIL_SEND_FAILED");
    const { error: guncellemeHatasi } = await admin
      .from("user_entitlements")
      .upsert(
        grup.map((hak) => ({ user_id: hak.user_id, features_announcement_sent_at: simdi, updated_at: simdi })),
        { onConflict: "user_id" },
      );
    if (guncellemeHatasi) throw new Error("EMAIL_STATUS_UPDATE_FAILED");
    gonderilen += grup.length;
  }
  return gonderilen;
}

async function denemeDuyurusuGonder(
  admin: ReturnType<typeof createClient>,
  kullanicilar: Array<{ id: string; email?: string }>,
) {
  const apiKey = String(Deno.env.get("RESEND_API_KEY") || "").trim();
  if (!apiKey) throw new Error("EMAIL_PROVIDER_NOT_CONFIGURED");
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
  for (let i = 0; i < hedefler.length; i += 100) {
    const grup = hedefler.slice(i, i + 100);
    const mesajlar = grup.map((hak) => ({
      from: "Borcama <zero@borcama.com>",
      to: [epostaHaritasi.get(hak.user_id)],
      reply_to: "zero@borcama.com",
      subject: "Borcama Pro'yu 1 Ay Ücretsiz Denemeye Başla",
      html: denemeDuyuruHtml(
        Math.max(1, Math.ceil((new Date(hak.trial_ends_at).getTime() - simdi.getTime()) / 86400000)),
      ),
    }));
    const cevap = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(mesajlar),
    });
    if (!cevap.ok) throw new Error("EMAIL_SEND_FAILED");
    const ids = grup.map((hak) => hak.user_id);
    const { error: guncellemeHatasi } = await admin
      .from("user_entitlements")
      .update({ trial_announcement_sent_at: simdi.toISOString(), updated_at: simdi.toISOString() })
      .in("user_id", ids);
    if (guncellemeHatasi) throw new Error("EMAIL_STATUS_UPDATE_FAILED");
    gonderilen += grup.length;
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

  const finansal = topluFinansalIstatistik(kayitlar || []);
  const yonetim = yonetimIstatistikleri(kullanicilar, kayitlar || [], finansal.available);
  const geriBildirimler = geriBildirimleriHazirla(kullanicilar, kayitlar || []);
  return new Response(JSON.stringify({ summary: ozet, financial: finansal, management: yonetim, users: satirlar, feedback: geriBildirimler }), { status: 200, headers });
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
