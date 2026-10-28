// Klavye denetimi (direktif K12, §9): klavye acikken webview 390x508'e
// kuculur (Keyboard.resize = native). kayit, giris, kod ve borc ekranlarinda
// girdiye odaklanilir; birincil dugme (.oa-alt .oa-dugme) tamamen gorunur
// alanda olmali. Biri bile degilse cikis kodu 1. Iki temada calisir.
// Istege bagli --ss KLASOR: her ekranin goruntusu.
//
//   node scripts/klavye-denetimi.mjs [--demo URL] [--auth URL] [--chrome YOL] [--ss KLASOR]
import { mkdirSync } from "node:fs";
import { argumanlar, ekranlariGez, tarayiciAc } from "./onboarding-ekranlari.mjs";

const { demo, auth, chrome } = argumanlar();
const ssIndex = process.argv.indexOf("--ss");
const ssKlasoru = ssIndex >= 0 ? process.argv[ssIndex + 1] : null;
if (ssKlasoru) mkdirSync(ssKlasoru, { recursive: true });
const GENISLIK = 390;
const YUKSEKLIK = 508;
const ODAK = { kayit: "#auth-email", giris: "#auth-email", kod: "#auth-code", borc: ".oa-alan input >> nth=2" };

const browser = await tarayiciAc(chrome);
let hata = 0;
for (const tema of ["light", "dark"]) {
  await ekranlariGez(browser, {
    demo, auth, genislik: GENISLIK, yukseklik: YUKSEKLIK, tema,
    yalniz: Object.keys(ODAK),
    her: async (ad, page) => {
      await page.locator(ODAK[ad]).focus();
      await page.waitForTimeout(350);
      const kutu = await page.locator(".oa-alt .oa-dugme").first().boundingBox();
      const tamam = Boolean(kutu) && kutu.y >= 0 && kutu.y + kutu.height <= YUKSEKLIK && kutu.x >= 0 && kutu.x + kutu.width <= GENISLIK;
      if (!tamam) hata += 1;
      console.log(`${tema.padEnd(5)} ${ad.padEnd(6)} ${tamam ? "CTA görünür" : "CTA KLAVYENİN ALTINDA"} ${kutu ? `(y ${Math.round(kutu.y)}-${Math.round(kutu.y + kutu.height)} / ${YUKSEKLIK})` : "(yok)"}`);
      if (ssKlasoru) await page.screenshot({ path: `${ssKlasoru}/klavye-${ad}-${tema}.png` });
    },
  });
}
await browser.close();
console.log(hata ? `\n${hata} ekranda CTA görünmüyor.` : "\nKlavye denetimi geçti.");
process.exit(hata ? 1 : 0);
