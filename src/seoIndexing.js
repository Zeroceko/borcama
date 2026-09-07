const NOINDEX_TAM_YOLLAR = new Set([
  "/login",
  "/register",
  "/reset-password",
  "/upgrade",
  "/welcome",
  "/summary",
  "/debts",
  "/payments",
  "/debt-plan",
  "/income",
  "/fixed-income",
  "/expenses",
  "/fixed-expenses",
  "/assets",
  "/settings",
  "/classic",
  "/landing-v2",
  "/backoffice",
  "/ceo",
  "/marketing",
  "/analytics",
]);

export function noindexYoluMu(yol, crmAlani = false) {
  if (crmAlani) return true;
  if (NOINDEX_TAM_YOLLAR.has(yol)) return true;
  return yol.startsWith("/backoffice/") || yol.startsWith("/user/") || yol.startsWith("/davet/");
}
