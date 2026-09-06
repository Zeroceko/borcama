const temizle = (deger) => String(deger || "").replace(/\s+/g, " ").trim();

export function asistanYanitiniSunumaDonustur(answer) {
  const metin = String(answer || "")
    .replace(/\r/g, "")
    .replace(/\s*•\s*/g, "\n• ")
    .replace(/\s*(Senden gereken:)\s*/gi, "\n$1 ")
    .trim();
  const satirlar = metin.split(/\n+/).map(temizle).filter(Boolean);
  let kisaCevap = "";
  let sonrakiAdim = "";
  const maddeler = [];

  for (const satir of satirlar) {
    if (/^kısa cevap\s*:/i.test(satir)) kisaCevap = temizle(satir.replace(/^kısa cevap\s*:/i, ""));
    else if (/^senden gereken\s*:/i.test(satir)) sonrakiAdim = temizle(satir.replace(/^senden gereken\s*:/i, ""));
    else if (/^•/.test(satir)) maddeler.push(temizle(satir.replace(/^•\s*/, "")));
    else if (!kisaCevap) kisaCevap = satir;
    else maddeler.push(satir);
  }

  return { kisaCevap, maddeler: maddeler.slice(0, 3), sonrakiAdim };
}
