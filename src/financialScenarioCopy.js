import { t } from "./i18n.js";

// Metinler sözlükte (locales/bolumler/plan.js); dil oturum boyunca değişmez.
export const FINANCIAL_SCENARIO_COPY = {
  missing_income: {
    titles: [t("plan.senaryoMetni.missing_income.baslik1"), t("plan.senaryoMetni.missing_income.baslik2")],
    reason: t("plan.senaryoMetni.missing_income.neden"),
  },
  no_revolving_debt: {
    titles: [t("plan.senaryoMetni.no_revolving_debt.baslik1"), t("plan.senaryoMetni.no_revolving_debt.baslik2")],
    reason: t("plan.senaryoMetni.no_revolving_debt.neden"),
  },
  missing_spending_history: {
    titles: [t("plan.senaryoMetni.missing_spending_history.baslik1"), t("plan.senaryoMetni.missing_spending_history.baslik2")],
    reason: t("plan.senaryoMetni.missing_spending_history.neden"),
  },
  structural_gap: {
    titles: [t("plan.senaryoMetni.structural_gap.baslik1"), t("plan.senaryoMetni.structural_gap.baslik2")],
    reason: t("plan.senaryoMetni.structural_gap.neden"),
  },
  interest_only: {
    titles: [t("plan.senaryoMetni.interest_only.baslik1"), t("plan.senaryoMetni.interest_only.baslik2")],
    reason: t("plan.senaryoMetni.interest_only.neden"),
  },
  spending_cut: {
    titles: [t("plan.senaryoMetni.spending_cut.baslik1"), t("plan.senaryoMetni.spending_cut.baslik2")],
    reason: t("plan.senaryoMetni.spending_cut.neden"),
  },
  loan_relief: {
    titles: [t("plan.senaryoMetni.loan_relief.baslik1"), t("plan.senaryoMetni.loan_relief.baslik2")],
    reason: t("plan.senaryoMetni.loan_relief.neden"),
  },
  fast_payoff: {
    titles: [t("plan.senaryoMetni.fast_payoff.baslik1"), t("plan.senaryoMetni.fast_payoff.baslik2")],
    reason: t("plan.senaryoMetni.fast_payoff.neden"),
  },
  steady_payoff: {
    titles: [t("plan.senaryoMetni.steady_payoff.baslik1"), t("plan.senaryoMetni.steady_payoff.baslik2")],
    reason: t("plan.senaryoMetni.steady_payoff.neden"),
  },
  long_payoff: {
    titles: [t("plan.senaryoMetni.long_payoff.baslik1"), t("plan.senaryoMetni.long_payoff.baslik2")],
    reason: t("plan.senaryoMetni.long_payoff.neden"),
  },
};

export function resolveFinancialScenarioType(scenario = {}) {
  if (scenario.status === "missing_income") return "missing_income";
  if (scenario.status === "no_revolving_debt") return "no_revolving_debt";
  if (scenario.status === "missing_spending_history") return "missing_spending_history";

  if (scenario.status === "structural_gap") {
    return "structural_gap";
  }

  if (scenario.status === "long_horizon") {
    return "long_payoff";
  }

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
