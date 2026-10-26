// Test yardimcisi: uygulama ici web sayfalarini (giris, kayit, SSS, yasal)
// secilen dilde sunucu tarafinda cizer. webCokDilli.test.js, vite'in
// ssrLoadModule'u ile yukler; uygulama paketine girmez.
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GirisEkrani } from "../Auth.jsx";
import Faq from "../Faq.jsx";
import { GizlilikMetni, IadePolitikasi, KullaniciSozlesmesi } from "../Legal.jsx";
import { dilAyarla, dilSozlugunuYukle } from "../i18n.js";

const SAYFALAR = {
  login: () => <GirisEkrani />,
  register: () => <GirisEkrani kayitModu />,
  faq: () => <Faq />,
  terms: () => <KullaniciSozlesmesi />,
  privacy: () => <GizlilikMetni />,
  "refund-policy": () => <IadePolitikasi />,
};

export const SAYFA_ADLARI = Object.keys(SAYFALAR);

export function sayfaCiz(ad, dilKodu = "tr") {
  dilAyarla(dilKodu);
  globalThis.location.pathname = `/${ad}`;
  return renderToStaticMarkup(SAYFALAR[ad]());
}

export function dilYukle(kod) {
  return dilSozlugunuYukle(kod);
}
