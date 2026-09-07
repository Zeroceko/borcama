export const LANDING_DENEYI = "landing-002";
// LANDING-001 was a CTA-only PMax test. LANDING-002 compares the complete
// current landing (control) with the rebuilt page (variant) for all new visits.
export const LANDING_DENEYI_AKTIF = true;
export const LANDING_DENEYI_ANAHTARI = "borcama:landing-002-variant";

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
