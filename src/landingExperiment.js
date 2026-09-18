export const LANDING_DENEYI = "landing-003";
// LANDING-001 was a CTA-only test and LANDING-002 mixed offer, copy and
// presentation changes. LANDING-003 keeps the offer and core claims equal so
// that the complete page presentation can be compared cleanly.
export const LANDING_DENEYI_AKTIF = true;
export const LANDING_DENEYI_ANAHTARI = "borcama:landing-003-variant";

const GECERLI_VARYANTLAR = new Set(["control", "variant"]);

export function landingDeneyiVaryantiBelirle({ storedVariant = "", randomValue = Math.random() } = {}) {
  if (GECERLI_VARYANTLAR.has(storedVariant)) return storedVariant;
  return randomValue < 0.5 ? "control" : "variant";
}

export function aktifLandingDeneyiOku() {
  if (!LANDING_DENEYI_AKTIF) return { experiment_id: "", experiment_variant: "" };
  if (typeof window === "undefined") return { experiment_id: "", experiment_variant: "" };
  let variant = "";
  try { variant = localStorage.getItem(LANDING_DENEYI_ANAHTARI) || ""; } catch { variant = ""; }
  return GECERLI_VARYANTLAR.has(variant)
    ? { experiment_id: LANDING_DENEYI, experiment_variant: variant }
    : { experiment_id: "", experiment_variant: "" };
}

export function landingDeneyiAta(source = {}) {
  if (!LANDING_DENEYI_AKTIF) return { experiment_id: "", experiment_variant: "" };
  if (typeof window === "undefined") return { experiment_id: "", experiment_variant: "" };
  if (import.meta.env.DEV) {
    const preview = new URLSearchParams(window.location.search).get("landing_preview");
    if (GECERLI_VARYANTLAR.has(preview))
      return { experiment_id: LANDING_DENEYI, experiment_variant: preview };
  }
  const storedVariant = aktifLandingDeneyiOku().experiment_variant;
  const variant = landingDeneyiVaryantiBelirle({ source, storedVariant });
  if (!variant) return { experiment_id: "", experiment_variant: "" };
  if (!storedVariant) {
    try { localStorage.setItem(LANDING_DENEYI_ANAHTARI, variant); } catch { /* Ölçüm tercihi ürün kullanımını engellemez. */ }
  }
  return { experiment_id: LANDING_DENEYI, experiment_variant: variant };
}
