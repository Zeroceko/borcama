const ANAHTAR = "borcama:pending-pro-plan";

export function proPlaniDogrula(deger) {
  return deger === "annual" || deger === "monthly" ? deger : null;
}

export function proNiyetiniOku() {
  const hamPlan = new URLSearchParams(window.location.search).get("plan");
  if (hamPlan === "free") {
    localStorage.removeItem(ANAHTAR);
    return null;
  }
  const sorgu = proPlaniDogrula(
    hamPlan,
  );
  if (sorgu) {
    localStorage.setItem(ANAHTAR, sorgu);
    return sorgu;
  }
  return proPlaniDogrula(localStorage.getItem(ANAHTAR));
}

export function proNiyetiniKaydet(plan) {
  const dogruPlan = proPlaniDogrula(plan);
  if (dogruPlan) localStorage.setItem(ANAHTAR, dogruPlan);
  return dogruPlan;
}

export function proNiyetiniTemizle() {
  localStorage.removeItem(ANAHTAR);
}

export function proKayitLinki(plan) {
  const dogruPlan = proPlaniDogrula(plan);
  return dogruPlan ? `/register?plan=${dogruPlan}` : "/register";
}
