export const CRM_ALANI = "crm.borcama.com";

export function crmAlanindaMi() {
  return typeof window !== "undefined" && window.location.hostname.toLowerCase() === CRM_ALANI;
}

export function yonetimYolu(yol) {
  if (!crmAlanindaMi()) return yol;
  if (yol === "/backoffice") return "/";
  if (yol.startsWith("/backoffice/user/")) return yol.replace("/backoffice", "");
  return yol;
}

export function uygulamaYolu(yol = "/summary") {
  return crmAlanindaMi() ? `https://borcama.com${yol}` : yol;
}
