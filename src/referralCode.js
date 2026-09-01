export function referansKodunuTemizle(value) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 24);
}

export function davetKodunuYoldanOku(pathname = "", search = "") {
  const pathMatch = String(pathname).match(/^\/davet\/([^/?#]+)/i);
  const queryValue = new URLSearchParams(search).get("ref");
  return referansKodunuTemizle(pathMatch?.[1] || queryValue || "");
}

export function davetKayitYolu(code) {
  const normalized = referansKodunuTemizle(code);
  return normalized ? `/register?ref=${encodeURIComponent(normalized)}` : "/register";
}
