import { dilSozlugunuYukle } from "./i18n.js";

// Uygulama girisi. Secili dil Turkce/Ingilizce disindaysa sozlugu, modul
// duzeyinde ceviri yapan dosyalar degerlendirilmeden once yuklenir; web'de
// (daima Turkce) hicbir sey indirilmez ve dogrudan main.jsx'e gecilir.
dilSozlugunuYukle().finally(() => import("./main.jsx"));
