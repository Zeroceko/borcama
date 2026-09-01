const htmlEscape = (value: unknown) => String(value ?? "")
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

const ozellikSatiri = (baslik: string, metin: string, renk: string) => `
<tr><td style="padding:0 0 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${renk};border-radius:18px"><tr>
<td width="34" valign="top" style="padding:18px 0 18px 18px"><span style="display:block;width:24px;height:24px;line-height:24px;text-align:center;border-radius:8px;background:#14160f;color:#cdf564;font-weight:900">✓</span></td>
<td style="padding:17px 18px"><div style="font-size:16px;line-height:1.35;font-weight:800;color:#14160f">${htmlEscape(baslik)}</div><div style="margin-top:4px;font-size:14px;line-height:1.5;color:#55584c">${htmlEscape(metin)}</div></td>
</tr></table></td></tr>`;

const duyuruKarti = (sira: string, baslik: string, metin: string, zemin: string, vurgu: string) => `
<tr><td style="padding:0 0 14px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${zemin};border:1px solid ${vurgu};border-radius:22px;overflow:hidden"><tr>
<td width="62" valign="top" style="padding:20px 0 20px 20px"><span style="display:block;width:42px;height:42px;line-height:42px;text-align:center;border-radius:13px;background:${vurgu};color:#14160f;font-size:15px;font-weight:900">${htmlEscape(sira)}</span></td>
<td style="padding:20px 22px 20px 14px"><div style="font-size:18px;line-height:1.25;font-weight:900;color:#14160f">${htmlEscape(baslik)}</div><div style="margin-top:7px;font-size:14px;line-height:1.55;color:#505348">${htmlEscape(metin)}</div></td>
</tr></table></td></tr>`;

function cerceve(icerik: string, altMetin = "Bu e-posta Borcama hesabınla ilgili gönderildi.") {
  return `<!doctype html><html lang="tr"><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"></head>
<body style="margin:0;background:#f4efe0;color:#14160f;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding:28px 12px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:auto;background:#fff;border-radius:26px;overflow:hidden;box-shadow:0 12px 36px rgba(20,22,15,.08)">
<tr><td style="height:10px;background:linear-gradient(90deg,#cdf564 0 42%,#ff6c5c 42% 72%,#bfe1dd 72%)"></td></tr><tr><td style="padding:34px 34px 30px">
<div style="font-size:31px;line-height:1;font-weight:900;letter-spacing:-1.4px;color:#14160f;margin-bottom:28px">Borcama<span style="color:#ff6c5c">.</span></div>${icerik}
<p style="margin:26px 0 0;color:#85877d;font-size:12px;line-height:1.55">${htmlEscape(altMetin)} Soru, görüş ve önerilerin için <a href="mailto:zero@borcama.com" style="color:#315c43">zero@borcama.com</a></p>
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

export function referansOduluHtml(role: "referrer" | "invitee", url: string) {
  const referrer = role === "referrer";
  return cerceve(`<div style="padding:28px;border-radius:22px;background:#073b2d;box-shadow:7px 7px 0 #ff6c5c">
<div style="font-size:38px;line-height:1.05;font-weight:900;letter-spacing:-1.3px;color:#fff">${referrer ? "Arkadaşın katıldı." : "Davet ödülün hazır."}<br><span style="color:#cdf564">30 gün Pro kazandın.</span></div>
<p style="margin:16px 0 0;color:#dcebe5;font-size:15px;line-height:1.55">${referrer ? "Davet ettiğin kişi e-posta adresini doğruladı." : "Davet koduyla kaydını tamamlayıp e-posta adresini doğruladın."} Pro ödülün hesabına işlendi.</p>
</div>
<div style="margin-top:25px;padding:20px;border-radius:18px;background:#effbd8;color:#3f5428;font-size:14px;line-height:1.6"><strong style="color:#14160f">Ödül nasıl kullanılır?</strong><br>Aktif denemen varsa bitişine eklenir. Ücretli Pro kullanıyorsan sıradaki tahsilatın 30 gün ertelenir; ödül dönemi bitince aboneliğin ve otomatik tahsilatın devam eder.</div>
${buton(url, "Ödülümü gör")}`);
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

export function surum133DuyuruHtml(url: string, feedbackUrl = "https://borcama.com/summary?feedback=1&utm_source=resend&utm_medium=email&utm_campaign=siz_istediniz_v1_33_0&utm_content=feedback_cta") {
  return cerceve(`<div style="display:none;max-height:0;overflow:hidden;color:transparent">Ekstrelerini yönet, taksitlerini doğru aylarda gör ve borç kapatma planını oluştur.</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;background:#073b2d;border-radius:24px;overflow:hidden;box-shadow:8px 8px 0 #ff6c5c"><tr><td style="padding:34px 30px">
<div style="font-size:39px;line-height:1.05;letter-spacing:-1.5px;font-weight:900;color:#fff">Siz istediniz.<br><span style="color:#cdf564">Biz yaptık.</span></div>
<p style="color:#dcebe5;font-size:16px;line-height:1.55;margin:17px 0 0">Borcama'da doğrudan görebileceğin ve hemen kullanabileceğin önemli yenilikler var.</p>
</td></tr></table>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0">
${duyuruKarti("01", "Ekstreni istediğin şekilde ekle", "Cihazında okut veya bilgileri manuel gir. Ham ekstre dosyan Borcama'ya yüklenmez.", "#effbd8", "#b9ea4f")}
${duyuruKarti("02", "Geçmiş ekstrelerini yönet", "Eski kayıtlarını gör; yanlış karta eklenen ekstreyi taşı veya ihtiyacın yoksa sil.", "#e6f4f1", "#9fd7ce")}
${duyuruKarti("03", "Taksitleri gerçek aylarında gör", "Taksitli harcamanın tamamı tek aya yazılmaz. Her taksit ödeneceği döneme dağıtılır.", "#fff0ec", "#ff8a78")}
${duyuruKarti("04", "Borçlarını kapatma sırasını planla", "Gelirin, taksitlerin, yaşam giderlerin ve faiz yükün birlikte hesaplanır. Önce hangi borca yönelmenin etkisini görürsün.", "#f3eafa", "#d6b8ef")}
${duyuruKarti("05", "Daha sade bir Borcama kullan", "Bugün ve Borçlar ekranları artık sıradaki önemli aksiyonunu daha net gösteriyor.", "#fff7d6", "#f2d25f")}
</table><div style="padding:2px 7px 7px"><a href="${htmlEscape(url)}" style="display:block;margin-top:22px;padding:17px 22px;border-radius:999px;background:#cdf564;color:#14160f;text-align:center;text-decoration:none;font-size:16px;font-weight:900;box-shadow:6px 6px 0 #ff6c5c">Yenilikleri hesabımda gör →</a></div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:32px;background:#ff6c5c;border-radius:22px;overflow:hidden"><tr><td style="padding:27px 26px">
<img src="https://borcama.com/email-assets/gorus-bildir-ekran.jpg" width="245" alt="Borcama ekranındaki Görüş bildir butonu" style="display:block;width:245px;max-width:100%;height:auto;margin:0 auto 24px;border:2px solid #14160f;border-radius:16px;box-shadow:6px 6px 0 #cdf564">
<div style="font-size:24px;line-height:1.15;font-weight:900;color:#14160f">Sırada neyi yapalım?</div>
<p style="margin:10px 0 18px;color:#3c251f;font-size:14px;line-height:1.55">Borcama'da ihtiyaç duyduğun özelliği veya iyileştirmeyi bize yaz. Dilediğin zaman görüş bildirebilirsin; hepsini tek tek okuyoruz.</p>
<a href="${htmlEscape(feedbackUrl)}" style="display:block;padding:14px 18px;border:2px solid #14160f;border-radius:999px;background:#fff;color:#14160f;text-align:center;text-decoration:none;font-size:15px;font-weight:900">Fikrimi paylaş →</a>
</td></tr></table>
<p style="margin:16px 0 0;color:#85877d;font-size:12px;line-height:1.55;text-align:center">Hesabındaki kayıtları yalnızca sen görebilirsin.</p>`);
}

export function denemeDavetHtml(kalanGun: number, url: string) {
  return denemeBasladiHtml(kalanGun, url);
}

export function konuGuvenli(konu: unknown) {
  const temiz = String(konu || "").replace(/[\r\n]/g, " ").trim();
  if (temiz.length < 3 || temiz.length > 150) throw new Error("INVALID_SUBJECT");
  return temiz;
}
