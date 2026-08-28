export const FINANCIAL_SCENARIO_COPY = {
  missing_income: {
    titles: [
      "Borç planını hesaplamak için aylık gelirini ekle",
      "Kapanış süresi için gelir bilgisi gerekiyor",
    ],
    reason: "Gelir olmadan güvenli bir harcama veya ödeme hedefi hesaplanamaz.",
  },
  no_revolving_debt: {
    titles: [
      "Kart ve ek hesap borcun görünmüyor",
      "Şu anda planlanacak kart veya KMH borcu yok",
    ],
    reason: "Sabit vadeli krediler ödeme takviminde ayrıca izlenir.",
  },
  missing_spending_history: {
    titles: [
      "Gerçekçi bir hedef için harcama geçmişin gerekiyor",
      "Harcama hedefini hesaplamak için birkaç kayıt daha ekle",
    ],
    reason: "Borcama rastgele günlük limit üretmez; kayıtlı ekstre ve harcamaları kullanır.",
  },
  structural_gap: {
    titles: [
      "Gelirin sabit ödemeler ve faiz yükünü karşılamıyor",
      "Bu plan yalnızca harcama azaltarak dengelenemiyor",
    ],
    reason: "Sabit kredi taksitleri, güvenlik payı ve borcun ilk ay maliyeti geliri aşıyor.",
  },
  interest_only: {
    titles: [
      "Kartlara kalan bütçe faizi ancak karşılıyor",
      "Ödeme var, ancak ana para yeterince küçülmüyor",
    ],
    reason: "Borcu azaltmak için aylık faizin üzerinde ana para ödemesi gerekir.",
  },
  spending_cut: {
    titles: [
      "Harcama bütçeni düşürürsen kart borcun küçülmeye başlar",
      "Kart borcunu azaltmak için aylık harcamada alan aç",
    ],
    reason: "Önerilen hedef; sabit taksit, güvenlik payı, faiz ve ana para azaltımını birlikte ayırır.",
  },
  loan_relief: {
    titles: [
      "Kredi taksitleri bittikçe kartlara daha fazla bütçe kalacak",
      "Sabit taksitlerin bitişi borç planını hızlandıracak",
    ],
    reason: "Biten kredi taksitleri yeni harcamaya değil kart ve KMH borcuna aktarılmıştır.",
  },
  fast_payoff: {
    titles: [
      "Mevcut plan kart ve KMH borcunu bir yıl içinde bitirebilir",
      "Kart ve ek hesap borcun için kısa vadeli bir kapanış planın var",
    ],
    reason: "Gelir, sabit taksitler, yaşam harcaması ve faiz birlikte hesaplanmıştır.",
  },
  steady_payoff: {
    titles: [
      "Kart ve KMH borcun düzenli biçimde azalıyor",
      "Mevcut ödeme düzenin borcu küçültüyor",
    ],
    reason: "Plan borcu kapatıyor; ek ödeme kapanış süresini daha da kısaltabilir.",
  },
  long_payoff: {
    titles: [
      "Plan çalışıyor, ancak borcun kapanması uzun sürecek",
      "Borç azalıyor; küçük bir ek ödeme süreyi kısaltabilir",
    ],
    reason: "Mevcut bütçe faizin üzerinde ödeme sağlıyor ancak ana para yavaş azalıyor.",
  },
};

export function resolveFinancialScenarioType(scenario = {}) {
  if (scenario.status === "missing_income") return "missing_income";
  if (scenario.status === "no_revolving_debt") return "no_revolving_debt";
  if (scenario.status === "missing_spending_history") return "missing_spending_history";

  if (scenario.status === "not_sustainable") {
    const recommendation = scenario.recommendation || {};
    const essentialNeed =
      (+scenario.fixedMonthly || 0) +
      (+scenario.reserve || 0) +
      (+recommendation.minimumDebtBudget || 0);
    if ((+scenario.monthlyIncome || 0) <= essentialNeed + 1) return "structural_gap";
    if (
      (+scenario.initialDebtBudget || 0) > 0 &&
      (+scenario.initialDebtBudget || 0) <= (+recommendation.firstMonthInterest || 0) + 1
    ) return "interest_only";
    return "spending_cut";
  }

  if (scenario.status === "ok") {
    if (
      (+scenario.lastFixedPaymentMonth || 0) > 0 &&
      (+scenario.months || 0) > (+scenario.lastFixedPaymentMonth || 0)
    ) return "loan_relief";
    if ((+scenario.months || 0) <= 12) return "fast_payoff";
    if ((+scenario.months || 0) <= 24) return "steady_payoff";
    return "long_payoff";
  }

  return "missing_spending_history";
}

export function getFinancialScenarioCopy(scenario, variant = 0) {
  const type = resolveFinancialScenarioType(scenario);
  const copy = FINANCIAL_SCENARIO_COPY[type];
  const index = Math.abs(Number(variant) || 0) % copy.titles.length;
  return { type, title: copy.titles[index], reason: copy.reason };
}
