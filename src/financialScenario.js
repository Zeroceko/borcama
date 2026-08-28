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
    const row = ensure(key);
    row.manual += Math.max(number(expense?.tutar), 0);
    row.manualCount += 1;
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

  const current = monthly.get(currentMonth);
  if (current && current.statement <= 0 && current.manual > 0) {
    const elapsed = Math.max(currentDate.getDate(), 1);
    const days = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    current.projectedManual = current.manual * (days / elapsed);
  }

  const candidates = [...monthly.values()]
    .filter((row) => row.key <= currentMonth)
    .map((row) => ({
      ...row,
      amount: row.statement > 0
        ? Math.max(row.statement, row.manual)
        : row.key === currentMonth
          ? row.projectedManual || row.manual
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
  };
}

function remainingInstallments(loan) {
  const explicit = Math.max(Math.floor(number(loan?.kalanTaksit)), 0);
  if (explicit) return explicit;
  const payment = Math.max(number(loan?.taksit), 0);
  return payment > 0 ? Math.max(Math.ceil(number(loan?.kalanBorc) / payment), 1) : 0;
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
  maxMonths = 240,
  livingBudgetOverride = null,
} = {}) {
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
      months: remainingInstallments(loan),
    }));
  const revolving = debts
    .filter((debt) => !debt?.sabitTaksit && number(debt?.bakiye) > 0)
    .map((debt) => ({
      balance: Math.max(number(debt.bakiye), 0),
      rate: Math.max(number(debt.faiz), 0) / 100,
    }));

  const fixedMonthly = schedules.reduce((sum, loan) => sum + loan.payment, 0);
  const lastFixedPaymentMonth = schedules.reduce(
    (latest, loan) => Math.max(latest, loan.months),
    0,
  );
  const reserve = monthlyIncome * Math.max(number(reserveRatio), 0);
  const livingBudget = living.monthlyAmount;
  const initialDebtBudget = monthlyIncome - fixedMonthly - livingBudget - reserve;
  const initialDebt = revolving.reduce((sum, debt) => sum + debt.balance, 0);
  const maximumLivingBudget = Math.max(monthlyIncome - fixedMonthly - reserve, 0);
  const firstMonthInterest = revolving.reduce(
    (sum, debt) => sum + debt.balance * debt.rate,
    0,
  );
  // Yalnızca faizi karşılamak borcu küçültmez. İlk ay ana paranın %1'ini de
  // azaltacak açık ve ihtiyatlı bir başlangıç hedefi kullan.
  const principalReductionTarget = initialDebt * 0.01;
  const minimumDebtBudget = firstMonthInterest + principalReductionTarget;
  const recommendedLivingBudget = Math.max(
    monthlyIncome - fixedMonthly - reserve - minimumDebtBudget,
    0,
  );
  const recommendedDailyLiving = recommendedLivingBudget / 30;
  const livingReductionNeeded = Math.max(livingBudget - recommendedLivingBudget, 0);

  const recommendation = {
    firstMonthInterest,
    principalReductionTarget,
    minimumDebtBudget,
    recommendedLivingBudget,
    recommendedDailyLiving,
    livingReductionNeeded,
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
    };
  }
  if (!living.hasData) {
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
    };
  }

  let totalInterest = 0;
  let previousTotal = initialDebt;
  let nonDecreasingMonths = 0;

  for (let month = 1; month <= maxMonths; month += 1) {
    const fixedForMonth = schedules.reduce(
      (sum, loan) => sum + (loan.months >= month ? loan.payment : 0),
      0,
    );
    const available = Math.max(monthlyIncome - fixedForMonth - livingBudget - reserve, 0);

    revolving.forEach((debt) => {
      if (debt.balance <= 0 || debt.rate <= 0) return;
      const interest = debt.balance * debt.rate;
      debt.balance += interest;
      totalInterest += interest;
    });

    let payment = available;
    revolving
      .sort((a, b) => b.rate - a.rate || b.balance - a.balance)
      .forEach((debt) => {
        if (payment <= 0 || debt.balance <= 0) return;
        const paid = Math.min(debt.balance, payment);
        debt.balance -= paid;
        payment -= paid;
      });

    const remaining = revolving.reduce((sum, debt) => sum + debt.balance, 0);
    if (remaining <= 1) {
      return {
        status: "ok",
        months: month,
        totalInterest,
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
      };
    }
    // İlk aylarda sabit kredi taksitleri tüm bütçeyi kullanabilir. Bu durumda
    // kart borcu geçici olarak büyüse bile krediler bittikten sonra açılan bütçe
    // kapanışı mümkün kılabilir; artış sayacını ancak son sabit taksit ödendikten
    // sonra başlat.
    nonDecreasingMonths = month < lastFixedPaymentMonth
      ? 0
      : remaining >= previousTotal - 0.01
        ? nonDecreasingMonths + 1
        : 0;
    if (nonDecreasingMonths >= 12) break;
    previousTotal = remaining;
  }

  return {
    status: "not_sustainable",
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
    totalInterest,
    recommendation,
  };
}

export { monthKey, shiftMonth };
