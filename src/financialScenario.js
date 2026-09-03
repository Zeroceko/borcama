import { statementPeriodsForExpense, expenseInstallmentAmountForPeriod } from "./statementPeriod.js";
import { loanStartsInMonths } from "./loanSchedule.js";

const number = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const monthKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const shiftMonth = (key, difference) => {
  const [year, month] = String(key).split("-").map(Number);
  return monthKey(new Date(year, month - 1 + difference, 1));
};

const median = (values) => {
  const sorted = values.filter((value) => value > 0).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
};

const statements = (cards = []) =>
  cards.flatMap((card) => [card, ...(Array.isArray(card?.ekstreGecmisi) ? card.ekstreGecmisi : [])]);

/**
 * Yaşam harcamasını mümkün olduğunda kesilmiş ekstrelerdeki yeni dönem
 * harcamalarından, aksi durumda kullanıcının harcama kayıtlarından tahmin eder.
 * Aynı kart hareketi iki yerde bulunabileceği için iki toplamı birbirine eklemek
 * yerine ay bazında yüksek olanı kullanır.
 */
export function estimateLivingSpend({ expenses = [], cards = [], currentDate = new Date() } = {}) {
  const currentMonth = monthKey(currentDate);
  const monthly = new Map();
  const ensure = (key) => {
    if (!monthly.has(key)) monthly.set(key, { key, manual: 0, manualCount: 0, statement: 0, statementCount: 0 });
    return monthly.get(key);
  };

  expenses.forEach((expense) => {
    const key = String(expense?.tarih || "").slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(key)) return;
    const card = cards.find((item) => expense.kaynak === `${item.banka} · ${item.ad || "Kredi kartı"}`);
    // Use the same statement allocation as the expenses screen. Cash entries
    // retain their transaction month rather than inheriting a card cutoff.
    const allocationCard = card || { kesimGunu: 31 };
    statementPeriodsForExpense(expense, allocationCard).forEach((period) => {
      const row = ensure(period);
      row.manual += Math.max(expenseInstallmentAmountForPeriod(expense, allocationCard, period), 0);
      row.manualCount += 1;
    });
  });

  statements(cards).forEach((statement) => {
    const key = String(statement?.ekstreAyi || "").slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(key)) return;
    if (statement?.yeniDonemEkstreBorcu === undefined) return;
    const amount = Math.max(number(statement.yeniDonemEkstreBorcu), 0);
    if (!amount) return;
    const row = ensure(key);
    row.statement += amount;
    row.statementCount += 1;
  });

  const completeHistory = [...monthly.values()].some((row) => row.key < currentMonth && (row.statement > 0 || row.manual > 0));
  const candidates = [...monthly.values()]
    .filter((row) => row.key <= currentMonth)
    .filter((row) => row.key !== currentMonth || row.statement > 0 || !completeHistory)
    .map((row) => ({
      ...row,
      amount: row.statement > 0
        ? Math.max(row.statement, row.manual)
        : row.manual,
    }))
    .filter((row) => row.amount > 0)
    .sort((a, b) => b.key.localeCompare(a.key))
    .slice(0, 3);

  const monthlyAmount = median(candidates.map((row) => row.amount));
  const statementMonths = candidates.filter((row) => row.statementCount > 0).length;
  const manualCount = candidates.reduce((sum, row) => sum + row.manualCount, 0);
  const confidence =
    candidates.length >= 3 || statementMonths >= 2
      ? "high"
      : candidates.length >= 2 || statementMonths >= 1 || manualCount >= 6
        ? "medium"
        : "low";

  return {
    monthlyAmount,
    dailyAmount: monthlyAmount / 30,
    confidence,
    monthsUsed: candidates.map((row) => row.key),
    statementMonths,
    manualCount,
    hasData: monthlyAmount > 0,
    partialMonthOnly: candidates.length === 1 && candidates[0].key === currentMonth && !statementMonths,
  };
}

function remainingInstallments(loan) {
  const explicit = Math.max(Math.floor(number(loan?.kalanTaksit)), 0);
  if (explicit) return explicit;
  const payment = Math.max(number(loan?.taksit), 0);
  return payment > 0 ? Math.max(Math.ceil(number(loan?.kalanBorc) / payment), 1) : 0;
}

const clamp = (value, minimum, maximum) =>
  Math.min(Math.max(number(value), minimum), maximum);

function dynamicTargetMonths(debtToIncomeRatio) {
  if (debtToIncomeRatio <= 0.5) return 12;
  if (debtToIncomeRatio <= 1) return 18;
  if (debtToIncomeRatio <= 2) return 24;
  return 36;
}

function simulateRevolvingDebt({
  monthlyIncome,
  livingBudget,
  schedules,
  debts,
  reserveTarget,
  reserveStarting = 0,
  freedPaymentRate = 0.7,
  maxMonths = 60,
}) {
  const revolving = debts.map((debt) => ({ ...debt }));
  const initialFixed = schedules.reduce((sum, loan) => sum + (loan.start === 0 ? loan.payment : 0), 0);
  const baseAvailable = monthlyIncome - livingBudget - initialFixed;
  let reserveBalance = Math.min(Math.max(number(reserveStarting), 0), reserveTarget);
  let totalInterest = 0;
  let previousTotal = revolving.reduce((sum, debt) => sum + debt.balance, 0);
  let increasingMonths = 0;

  for (let month = 1; month <= maxMonths; month += 1) {
    const fixedForMonth = schedules.reduce(
      (sum, loan) => sum + (month > loan.start && loan.months + loan.start >= month ? loan.payment : 0),
      0,
    );
    const freedFixed = Math.max(initialFixed - fixedForMonth, 0);
    const rawAvailable = baseAvailable + freedPaymentRate * freedFixed - Math.max(fixedForMonth - initialFixed, 0);
    const available = Math.max(rawAvailable, 0);

    revolving.forEach((debt) => {
      if (debt.balance <= 0 || debt.rate <= 0) return;
      const interest = debt.balance * debt.rate;
      const levies = interest * debt.levyRate;
      debt.balance += interest + levies;
      totalInterest += interest + levies;
    });

    const minimums = revolving.map((debt) => {
      if (debt.balance <= 0) return 0;
      const requested = month === 1 && debt.currentMinimum > 0
        ? debt.currentMinimum
        : debt.minimumRate > 0
          ? debt.balance * debt.minimumRate
          : 0;
      return Math.min(Math.max(requested, 0), debt.balance);
    });
    const totalMinimum = minimums.reduce((sum, value) => sum + value, 0);

    if (rawAvailable + 0.01 < totalMinimum) {
      return {
        status: "structural_gap",
        month,
        available,
        requiredMinimum: totalMinimum,
        monthlyGap: totalMinimum - rawAvailable,
        totalInterest,
        reserveBalance,
      };
    }

    minimums.forEach((minimum, index) => {
      revolving[index].balance = Math.max(revolving[index].balance - minimum, 0);
    });

    let extra = Math.max(available - totalMinimum, 0);
    const reserveContribution = Math.min(
      Math.max(reserveTarget - reserveBalance, 0),
      extra,
    );
    reserveBalance += reserveContribution;
    extra -= reserveContribution;

    revolving
      .sort((a, b) => b.effectiveRate - a.effectiveRate || b.balance - a.balance)
      .forEach((debt) => {
        if (extra <= 0 || debt.balance <= 0) return;
        const paid = Math.min(debt.balance, extra);
        debt.balance -= paid;
        extra -= paid;
      });

    const remaining = revolving.reduce((sum, debt) => sum + debt.balance, 0);
    if (remaining <= 1) {
      return {
        status: "ok",
        months: month,
        totalInterest,
        reserveBalance,
        firstMonthMinimum: month === 1 ? totalMinimum : undefined,
      };
    }

    increasingMonths = remaining > previousTotal + 0.01
      ? increasingMonths + 1
      : 0;
    if (increasingMonths >= 3) {
      const monthlyInterest = revolving.reduce(
        (sum, debt) => sum + debt.balance * debt.effectiveRate,
        0,
      );
      return {
        status: "structural_gap",
        month,
        available,
        requiredMinimum: Math.max(totalMinimum, monthlyInterest),
        monthlyGap: Math.max(totalMinimum, monthlyInterest) - rawAvailable,
        totalInterest,
        reserveBalance,
      };
    }
    previousTotal = remaining;
  }

  return {
    status: "long_horizon",
    months: maxMonths,
    totalInterest,
    reserveBalance,
  };
}

function findLivingBudgetForTarget({
  targetMonths,
  currentLivingBudget,
  simulationInput,
}) {
  const closesInTarget = (livingBudget) => {
    const result = simulateRevolvingDebt({
      ...simulationInput,
      livingBudget,
      maxMonths: targetMonths,
    });
    return result.status === "ok" && result.months <= targetMonths;
  };

  if (!closesInTarget(0)) return null;
  if (closesInTarget(currentLivingBudget)) return currentLivingBudget;

  let low = 0;
  let high = currentLivingBudget;
  for (let step = 0; step < 32; step += 1) {
    const middle = (low + high) / 2;
    if (closesInTarget(middle)) low = middle;
    else high = middle;
  }
  return low;
}

/**
 * Sabit vadeli kredileri bütçeden ay ay düşer; kart/KMH gibi değişken faizli
 * borçları ise kalan bütçeyle en yüksek faizden başlayarak kapatır.
 */
export function calculateRevolvingDebtScenario({
  income = 0,
  expenses = [],
  cards = [],
  loans = [],
  debts = [],
  currentDate = new Date(),
  reserveRatio = 0.05,
  reserveStarting = 0,
  maxMonths = 60,
  targetRevolvingMonths = null,
  freedPaymentRate = 0.7,
  livingBudgetOverride = null,
} = {}) {
  const assumptions = {
    newRevolvingDebt: 0,
    livingSpendFundedFromIncome: true,
    fixedLoanPaymentsContinue: true,
    inflationApplied: false,
    incomeGrowthApplied: false,
    interestRatesStayAsEntered: true,
    kkdfRate: 0.15,
    bsmvRate: 0.15,
  };
  const monthlyIncome = Math.max(number(income), 0);
  const estimatedLiving = estimateLivingSpend({ expenses, cards, currentDate });
  const hasLivingOverride =
    livingBudgetOverride !== null &&
    livingBudgetOverride !== "" &&
    Number.isFinite(Number(livingBudgetOverride));
  const overriddenLivingAmount = Math.max(number(livingBudgetOverride), 0);
  const living = hasLivingOverride
    ? {
        ...estimatedLiving,
        monthlyAmount: overriddenLivingAmount,
        dailyAmount: overriddenLivingAmount / 30,
        hasData: true,
        modeled: true,
      }
    : estimatedLiving;
  const schedules = loans
    .filter((loan) => number(loan?.kalanBorc) > 0 && number(loan?.taksit) > 0)
    .map((loan) => ({
      payment: Math.max(number(loan.taksit), 0),
      start: loanStartsInMonths(loan, currentDate),
      months: remainingInstallments(loan),
    }));
  const revolving = debts
    .filter((debt) => !debt?.sabitTaksit && number(debt?.bakiye) > 0)
    .map((debt) => ({
      balance: Math.max(number(debt.bakiye), 0),
      rate: Math.max(number(debt.faiz), 0) / 100,
      levyRate: clamp(
        debt.vergiFonOrani === undefined ? 0.3 : debt.vergiFonOrani,
        0,
        1,
      ),
      currentMinimum: Math.max(number(debt.minimumOdeme), 0),
      minimumRate: clamp(debt.minimumOran, 0, 1),
    }));
  revolving.forEach((debt) => {
    debt.effectiveRate = debt.rate * (1 + debt.levyRate);
  });

  const fixedMonthly = schedules.reduce((sum, loan) => sum + (loan.start === 0 ? loan.payment : 0), 0);
  const lastFixedPaymentMonth = schedules.reduce(
    (latest, loan) => Math.max(latest, loan.months + loan.start),
    0,
  );
  const reserve = monthlyIncome * Math.max(number(reserveRatio), 0);
  const livingBudget = living.monthlyAmount;
  const initialDebtBudget = monthlyIncome - fixedMonthly - livingBudget;
  const initialDebt = revolving.reduce((sum, debt) => sum + debt.balance, 0);
  const maximumLivingBudget = Math.max(monthlyIncome - fixedMonthly - reserve, 0);
  const firstMonthInterest = revolving.reduce(
    (sum, debt) => sum + debt.balance * debt.effectiveRate,
    0,
  );
  const debtIncomeRatio = monthlyIncome > 0 ? initialDebt / monthlyIncome : Infinity;
  const safeTargetMonths = targetRevolvingMonths
    ? Math.max(Math.floor(number(targetRevolvingMonths)), 1)
    : dynamicTargetMonths(debtIncomeRatio);
  const simulationInput = {
    monthlyIncome,
    schedules,
    debts: revolving,
    reserveTarget: reserve,
    reserveStarting,
    freedPaymentRate: clamp(freedPaymentRate, 0, 1),
  };
  const bisectionLivingBudget = findLivingBudgetForTarget({
    targetMonths: safeTargetMonths,
    currentLivingBudget: livingBudget,
    simulationInput,
  });
  // Kullanıcıya yaşamını sıfırlayan bir hedef dayatma. En fazla %30 azaltımı
  // doğrudan senaryo olarak göster; daha fazlası gerekiyorsa yapısal çözüm de.
  const humaneLivingFloor = livingBudget * 0.7;
  const recommendedLivingBudget = bisectionLivingBudget === null
    ? humaneLivingFloor
    : Math.max(bisectionLivingBudget, humaneLivingFloor);
  const recommendedDailyLiving = recommendedLivingBudget / 30;
  const livingReductionNeeded = Math.max(livingBudget - recommendedLivingBudget, 0);
  const minimumDebtBudget = Math.max(monthlyIncome - fixedMonthly - recommendedLivingBudget, 0);
  const principalReductionTarget = Math.max(minimumDebtBudget - firstMonthInterest, 0);

  const recommendation = {
    firstMonthInterest,
    principalReductionTarget,
    minimumDebtBudget,
    recommendedLivingBudget,
    recommendedDailyLiving,
    livingReductionNeeded,
    targetRevolvingMonths: safeTargetMonths,
    targetReachableWithinHumaneFloor:
      bisectionLivingBudget !== null && bisectionLivingBudget + 0.01 >= humaneLivingFloor,
    method: "monthly_simulation_bisection",
  };

  if (!monthlyIncome || !initialDebt) {
    return {
      status: !initialDebt ? "no_revolving_debt" : "missing_income",
      living,
      monthlyIncome,
      fixedMonthly,
      reserve,
      livingBudget,
      dailyLivingTarget: livingBudget / 30,
      maximumLivingBudget,
      initialDebt,
      initialDebtBudget,
      lastFixedPaymentMonth,
      recommendation,
      assumptions,
    };
  }
  if (!living.hasData || (living.partialMonthOnly && !hasLivingOverride)) {
    return {
      status: "missing_spending_history",
      living,
      monthlyIncome,
      fixedMonthly,
      reserve,
      livingBudget,
      dailyLivingTarget: 0,
      maximumLivingBudget,
      initialDebt,
      initialDebtBudget,
      lastFixedPaymentMonth,
      recommendation,
      assumptions,
    };
  }

  const simulation = simulateRevolvingDebt({
    ...simulationInput,
    livingBudget,
    maxMonths,
  });
  const spendingScenarios = [0, 0.1, 0.2, 0.3].map((reductionRate) => {
    const scenarioLivingBudget = livingBudget * (1 - reductionRate);
    const result = simulateRevolvingDebt({
      ...simulationInput,
      livingBudget: scenarioLivingBudget,
      maxMonths,
    });
    return {
      reductionRate,
      livingBudget: scenarioLivingBudget,
      dailyLivingBudget: scenarioLivingBudget / 30,
      status: result.status,
      months: result.months,
      totalInterest: result.totalInterest,
      monthlyGap: result.monthlyGap || 0,
    };
  });

  const publicStatus = simulation.status === "structural_gap"
    ? "structural_gap"
    : simulation.status;
  return {
    status: publicStatus,
    months: simulation.months,
    living,
    monthlyIncome,
    fixedMonthly,
    reserve,
    livingBudget,
    dailyLivingTarget: livingBudget / 30,
    maximumLivingBudget,
    initialDebt,
    initialDebtBudget,
    lastFixedPaymentMonth,
    totalInterest: simulation.totalInterest,
    modeledMonths: simulation.months || simulation.month || 0,
    requiredMinimum: simulation.requiredMinimum || 0,
    monthlyGap: simulation.monthlyGap || 0,
    reserveBalance: simulation.reserveBalance,
    spendingScenarios,
    recommendation,
    assumptions,
  };
}

export { monthKey, shiftMonth };
