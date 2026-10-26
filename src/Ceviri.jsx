import React from "react";
import { tOgeler } from "./i18n.js";

// Ogeli ceviri: metindeki {ad} yer tutuculara React ogesi (kalin metin,
// baglanti, dugme) yerlestirir. Kelime sirasi dile gore degistigi icin oge
// metnin disinda birakilmaz.
//   <Ceviri anahtar={ANAHTAR} degerler={{ eposta: <b>{eposta}</b> }} />
export default function Ceviri({ anahtar, degerler }) {
  return tOgeler(anahtar, degerler).map((parca, i) => <React.Fragment key={i}>{parca}</React.Fragment>);
}
