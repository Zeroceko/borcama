// Onboarding yalniz native kabukta, oturumu olmayan kullaniciya ve yalniz bir
// kez gosterilir. Tercih cihazda kalir; sunucuya bir sey yazilmaz.
const ANAHTAR = "borcama:onboarding:v1";

export function onboardingTamamlandiMi() {
  try {
    return localStorage.getItem(ANAHTAR) === "1";
  } catch {
    // Depolama kapaliysa onboarding'i gostermek yerine gecmek daha guvenli:
    // her acilista tekrar cikan bir tanitim akisi kullaniciyi uygulamaya
    // sokmaz.
    return true;
  }
}

export function onboardingTamamla() {
  try {
    localStorage.setItem(ANAHTAR, "1");
  } catch {
    // Yazamazsak akis yine de devam eder.
  }
}
