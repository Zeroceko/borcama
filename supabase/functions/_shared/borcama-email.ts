const htmlEscape = (value: unknown) => String(value ?? "")
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

const ozellikSatiri = (baslik: string, metin: string, renk: string) => `
<tr><td style="padding:0 0 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${renk};border-radius:18px"><tr>
<td width="34" valign="top" style="padding:18px 0 18px 18px"><span style="display:block;width:24px;height:24px;line-height:24px;text-align:center;border-radius:8px;background:#14160f;color:#cdf564;font-weight:900">✓</span></td>
<td style="padding:17px 18px"><div style="font-size:16px;line-height:1.35;font-weight:800;color:#14160f">${htmlEscape(baslik)}</div><div style="margin-top:4px;font-size:14px;line-height:1.5;color:#55584c">${htmlEscape(metin)}</div></td>
</tr></table></td></tr>`;

function cerceve(icerik: string, altMetin = "Bu e-posta Borcama hesabınla ilgili gönderildi.") {
  return `<!doctype html><html lang="tr"><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"></head>
<body style="margin:0;background:#f4efe0;color:#14160f;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:28px 12px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:auto;background:#fff;border-radius:26px;overflow:hidden;box-shadow:0 12px 36px rgba(20,22,15,.08)">
<tr><td style="height:10px;background:linear-gradient(90deg,#cdf564 0 42%,#ff6c5c 42% 72%,#bfe1dd 72%)"></td></tr><tr><td style="padding:34px 34px 30px">
<div style="font-size:31px;line-height:1;font-weight:900;letter-spacing:-1.4px;color:#14160f;margin-bottom:28px">Borcama<span style="color:#ff6c5c">.</span></div>${icerik}
<p style="margin:26px 0 0;color:#85877d;font-size:12px;line-height:1.55">${htmlEscape(altMetin)} Soruların için <a href="mailto:zero@borcama.com" style="color:#315c43">zero@borcama.com</a></p>
</td></tr></table></td></tr></table></body></html>`;
}

const buton = (url: string, metin: string) => `<a href="${htmlEscape(url)}" style="display:block;margin-top:22px;padding:16px 22px;border-radius:999px;background:#cdf564;color:#14160f;text-align:center;text-decoration:none;font-size:16px;font-weight:900">${htmlEscape(metin)} →</a>`;

export function dogrulamaHtml(url: string) {
  return cerceve(`<h1 style="font-size:34px;line-height:1.1;letter-spacing:-1px;margin:0 0 12px">Borcama hesabını doğrula.</h1>
<p style="color:#55584c;font-size:16px;line-height:1.6;margin:0">Borçlarını tek yerde takip etmeye başlamak için e-posta adresini doğrula. Bağlantı yalnızca bu hesap için çalışır.</p>
${buton(url, "E-posta adresimi doğrula")}
<div style="margin-top:18px;padding:16px 18px;border-radius:16px;background:#e5f1ee;color:#4b554f;font-size:13px;line-height:1.55">Bu kaydı sen oluşturmadıysan e-postayı yok sayabilirsin.</div>`);
}

export function hesapAksiyonuHtml(url: string, tur: string) {
  const icerik: Record<string, { baslik: string; metin: string; buton: string }> = {
    recovery: { baslik: "Yeni parolanı belirle.", metin: "Borcama hesabının parolasını güvenle yenilemek için aşağıdaki bağlantıyı kullan.", buton: "Parolamı yenile" },
    magiclink: { baslik: "Borcama'ya giriş yap.", metin: "Parola kullanmadan hesabına güvenli biçimde giriş yapmak için aşağıdaki bağlantıyı kullan.", buton: "Borcama'ya giriş yap" },
    invite: { baslik: "Borcama hesabın hazır.", metin: "Hesabını açmak ve Borcama'yı kullanmaya başlamak için aşağıdaki bağlantıyı kullan.", buton: "Hesabımı aç" },
    email_change: { baslik: "Yeni e-posta adresini doğrula.", metin: "Hesabındaki e-posta değişikliğini tamamlamak için aşağıdaki bağlantıyı kullan.", buton: "E-postamı doğrula" },
  };
  const x = icerik[tur] || icerik.magiclink;
  return cerceve(`<h1 style="font-size:34px;line-height:1.1;letter-spacing:-1px;margin:0 0 12px">${htmlEscape(x.baslik)}</h1>
<p style="color:#55584c;font-size:16px;line-height:1.6;margin:0">${htmlEscape(x.metin)}</p>
${buton(url, x.buton)}<div style="margin-top:18px;padding:16px 18px;border-radius:16px;background:#e5f1ee;color:#4b554f;font-size:13px;line-height:1.55">Bu isteği sen yapmadıysan e-postayı yok sayabilirsin.</div>`);
}

export function denemeBasladiHtml(kalanGun: number, url: string) {
  return cerceve(`<h1 style="font-size:34px;line-height:1.1;letter-spacing:-1px;margin:0 0 12px">Pro deneme üyeliğin başladı.</h1>
<p style="color:#55584c;font-size:16px;line-height:1.6;margin:0 0 24px">Ödeme bilgisi gerektirmeyen denemende <strong style="color:#14160f">${Math.max(1, kalanGun)} gün</strong> var. Deneme sonunda otomatik ücret alınmaz.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
${ozellikSatiri("Kişisel ödeme öncelikleri", "Önce hangi borca yönelmenin daha anlamlı olduğunu gör.", "#eef8d0")}
${ozellikSatiri("Tahmini faiz görünümü", "Devreden bakiyelerin yaklaşık aylık maliyetini takip et.", "#fff0ec")}
${ozellikSatiri("Daha net aylık plan", "Ödeme baskısını ve toplam maliyeti farklı hedeflerle incele.", "#e5f1ee")}
</table>${buton(url, "Borcama Pro'yu kullan")}`);
}

export function denemeBitiyorHtml(kalanGun: number, url: string) {
  return cerceve(`<h1 style="font-size:34px;line-height:1.1;letter-spacing:-1px;margin:0 0 12px">Pro denemen ${Math.max(1, kalanGun)} gün içinde bitiyor.</h1>
<p style="color:#55584c;font-size:16px;line-height:1.6;margin:0">Kayıtların korunacak ve hesabın Ücretsiz plana dönecek. Kişisel önerileri ve gelişmiş analizleri kullanmaya devam etmek istersen Pro'ya geçebilirsin.</p>
<div style="margin-top:22px;padding:22px;border-radius:18px;background:#fff0ec"><div style="font-size:15px;font-weight:900;color:#14160f">Devam edersen açık kalacaklar</div><div style="margin-top:9px;color:#61534f;font-size:14px;line-height:1.7">Kişisel borç öncelikleri · tahmini faiz görünümü · gelişmiş finansal sinyaller</div></div>
${buton(url, "Borcama Pro'ya geç")}
<p style="margin:15px 0 0;color:#85877d;font-size:12px;line-height:1.5;text-align:center">Satın alma ekranında aylık veya yıllık planı seçebilirsin.</p>`);
}

export function yeniOzelliklerHtml(url: string) {
  return cerceve(`<h1 style="font-size:34px;line-height:1.1;letter-spacing:-1px;margin:0 0 12px">Ekstre ve kredi planı girmek artık daha kısa.</h1>
<p style="color:#55584c;font-size:16px;line-height:1.6;margin:0 0 24px">İstediğiniz iki büyük yeniliği Borcama'ya ekledik.</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
${ozellikSatiri("Ekstreni PDF veya ekran görüntüsüyle yükle", "Borcama alanları çıkarır; sen kontrol edip tek adımda kaydedersin.", "#eef8d0")}
${ozellikSatiri("Kredi ödeme planını aktar", "Taksit listesini yükleyip kredi bilgilerini daha az girişle oluşturursun.", "#fff0ec")}
${ozellikSatiri("Ödemeyi borcun yanında kaydet", "Asgari, kısmi veya tam ödemeyi ilgili kaydın yanında işlersin.", "#e5f1ee")}
</table>${buton(url, "Yeni özellikleri dene")}`);
}

export function denemeDavetHtml(kalanGun: number, url: string) {
  return denemeBasladiHtml(kalanGun, url);
}

export function konuGuvenli(konu: unknown) {
  const temiz = String(konu || "").replace(/[\r\n]/g, " ").trim();
  if (temiz.length < 3 || temiz.length > 150) throw new Error("INVALID_SUBJECT");
  return temiz;
}
