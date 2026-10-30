import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { t } from "./i18n.js";
import { tr, en } from "./locales/bolumler/bilesenler.js";

const kaynak = (ad) => readFile(new URL(`./${ad}`, import.meta.url), "utf8");

// Web'de (dil "tr") ekranda görünen metin çeviri öncesiyle birebir aynı kalmalı.
const BEKLENEN = {
  "CevrimdisiPerde.jsx": {
    "bilesen.cevrimdisi.baslik": "Bağlantı gerekiyor",
    "bilesen.cevrimdisi.metin":
      "Borcama finansal kayıtlarını hesabından okur. İnternet bağlantısı olmadan güncel tutarları gösteremez.",
    "bilesen.cevrimdisi.guvence":
      "Kayıtların silinmedi. Bağlantı geri geldiğinde kaldığın yerden devam edeceksin.",
  },
  "BiyometrikKilit.jsx": {
    "bilesen.kilit.ariaEtiket": "Uygulama kilidi",
    "bilesen.kilit.metin": "Finansal verilerini görmek için kimliğini doğrula.",
    "bilesen.kilit.kilidiAc": "Kilidi aç",
    "bilesen.biyometrik.guvenlik": "Güvenlik",
    "bilesen.biyometrik.kapat": "Kilidi kapat",
    "bilesen.biyometrik.ac": "Kilidi aç",
  },
  "biometrik.js": {
    "bilesen.biyometrik.varsayilanAd": "Biyometrik kimlik",
    "bilesen.biyometrik.sebep": "Borcama'yı açmak için kimliğini doğrula",
    "bilesen.biyometrik.vazgec": "Vazgeç",
    "bilesen.biyometrik.cihazSifresi": "Cihaz şifresini kullan",
  },
  "OdemeHatirlatmaAyari.jsx": {
    "bilesen.hatirlatma.izinYok":
      "Bildirim izni verilmedi. iOS Ayarlar → Borcama → Bildirimler bölümünden açabilirsin.",
    "bilesen.hatirlatma.baslik": "Hatırlatmalar",
    "bilesen.hatirlatma.satir": "Ödeme günü hatırlatması",
    "bilesen.hatirlatma.acikAciklama":
      "Kayıtlı ödemelerinden bir gün önce saat 09:00'da hatırlatılır. Bildirimde borcun adı ve tutarı yazar; kart numarası yazmaz. Hesaplama cihazında yapılır.",
    "bilesen.hatirlatma.kapaliAciklama":
      "Açarsan kayıtlı ödemelerinden bir gün önce saat 09:00'da hatırlatılır.",
    "bilesen.hatirlatma.kapat": "Hatırlatmayı kapat",
    "bilesen.hatirlatma.ac": "Hatırlatmayı aç",
    "bilesen.hatirlatma.hassas": "Hassas mod",
    "bilesen.hatirlatma.hassasAcikAciklama": "Açık: bildirimde tutar gizli, yalnız borcun adı yazar.",
    "bilesen.hatirlatma.hassasKapaliAciklama": "Açarsan bildirimlerde tutar gösterilmez.",
    "bilesen.hatirlatma.hassasAc": "Hassas modu aç",
    "bilesen.hatirlatma.hassasKapat": "Hassas modu kapat",
  },
  "odemeBildirimiPlan.js": {
    "bilesen.bildirim.tekBaslik": "Yarın ödeme: {ad}",
    "bilesen.bildirim.tekMetin": "{tutar} ödemen var. Dokun, ödemeyi kaydet.",
    "bilesen.bildirim.tekMetinHassas": "Yarın ödemen var. Dokun, ödemeyi kaydet.",
    "bilesen.bildirim.cokBaslik": "Yarın {n} ödeme",
  },
  "odemeBildirimi.js": {
    "bilesen.bildirim.odedim": "Ödedim",
    "bilesen.bildirim.yarin": "Yarın hatırlat",
  },
  "DogrulamaEkrani.jsx": {
    "bilesen.dogrulama.suresiDolmus":
      "Bağlantının süresi dolmuş ya da daha önce kullanılmış. Yeni bir bağlantı iste.",
    "bilesen.dogrulama.bilgiYok": "Bağlantıda doğrulama bilgisi yok.",
    "bilesen.dogrulama.dogrulaniyor": "Hesabın doğrulanıyor…",
    "bilesen.dogrulama.giriseDon": "Giriş ekranına dön",
  },
  "AccountDeleted.jsx": {
    "bilesen.hesapSilindi.baslik": "Hesabın silindi.",
    "bilesen.hesapSilindi.anaSayfa": "Ana sayfaya dön →",
  },
};

test("bileşen metinleri sözlükten okunur ve Türkçesi değişmedi", async () => {
  for (const [dosya, anahtarlar] of Object.entries(BEKLENEN)) {
    const metin = await kaynak(dosya);
    for (const [anahtar, turkce] of Object.entries(anahtarlar)) {
      assert.ok(metin.includes(`t("${anahtar}"`), `${dosya}: t("${anahtar}") yok`);
      assert.equal(tr[anahtar], turkce, anahtar);
      assert.equal(t(anahtar), turkce, anahtar);
      assert.ok(en[anahtar], `${anahtar} için İngilizce yok`);
    }
  }
});

test("değişkenli bileşen metinleri bugünkü Türkçeyi üretir", () => {
  assert.equal(t("bilesen.biyometrik.baslik", { ad: "Face ID" }), "Face ID ile uygulama kilidi");
  assert.equal(
    t("bilesen.biyometrik.acikAciklama", { ad: "Face ID" }),
    "Borcama her açıldığında ve arka plandan her dönüşte Face ID sorulur.",
  );
  assert.equal(
    t("bilesen.biyometrik.kapaliAciklama", { ad: "Touch ID" }),
    "Açarsan Borcama her açıldığında Touch ID sorulur.",
  );
  assert.equal(t("bilesen.dogrulama.dogrulanamadi", { sebep: "x" }), "Bağlantı doğrulanamadı. (x)");
  for (const anahtar of ["bilesen.hesapSilindi.metinTekil", "bilesen.hesapSilindi.metinCogul"]) {
    assert.equal(
      t(anahtar, { n: 5 }),
      "Borcama hesabın ve hesabına bağlı kayıtlar kalıcı olarak silindi. 5 saniye içinde ana sayfaya yönlendiriliyorsun.",
    );
  }
});

test("platform yönergeleri Türkçe kalır (başka metinlere gömülüyor)", async () => {
  const platform = await kaynak("platform.js");
  assert.match(platform, /"Uygulamayı yeniden başlatıp"/);
  assert.match(platform, /"sayfayı yenileyin"/);
  assert.match(platform, /nativeMi \? "cihaz" : "tarayıcı"/);
});

test("ödeme bildirimi hassas modda tutar göstermez; normalde tutar yer tutucusu var (iki dilde)", () => {
  for (const sozluk of [tr, en]) {
    assert.doesNotMatch(sozluk["bilesen.bildirim.tekMetinHassas"], /\d|₺|TL|\{/);
    assert.match(sozluk["bilesen.bildirim.tekMetin"], /\{tutar\}/);
  }
});
