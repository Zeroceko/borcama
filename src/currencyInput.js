const sadeceRakam = (value) => String(value ?? "").replace(/\D/g, "");

export function paraGirdisiniCoz(value) {
  const metin = String(value ?? "").trim().replace(/\s/g, "");
  if (!metin) return "";

  const virgul = metin.indexOf(",");
  if (virgul >= 0) {
    const tam = sadeceRakam(metin.slice(0, virgul));
    const kurus = sadeceRakam(metin.slice(virgul + 1)).slice(0, 2);
    if (!tam && !kurus) return "";
    return `${tam || "0"}.${kurus}`;
  }

  return sadeceRakam(metin.replace(/\./g, ""));
}

export function paraGirdisiniFormatla(value) {
  if (value === "" || value === null || value === undefined) return "";

  const metin = String(value).trim().replace(/\s/g, "").replace(",", ".");
  const [hamTam = "", ...ondalikParcalari] = metin.split(".");
  const tam = sadeceRakam(hamTam).replace(/^0+(?=\d)/, "") || "0";
  const kurusVar = ondalikParcalari.length > 0;
  const kurus = sadeceRakam(ondalikParcalari.join("")).slice(0, 2);
  const gruplu = tam.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return kurusVar ? `${gruplu},${kurus}` : gruplu;
}
