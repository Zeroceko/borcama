const BANKS = [
  { name: "VakıfBank", tokens: ["turkiye vakiflar bankasi", "vakifbank", "vakif bank"] },
  { name: "QNB", tokens: ["qnb bank", "qnb finansbank", "qnb"] },
  { name: "Garanti BBVA", tokens: ["turkiye garanti bankasi", "garanti bbva"] },
  { name: "Akbank", tokens: ["akbank"] },
  { name: "İş Bankası", tokens: ["turkiye is bankasi", "is bankasi"] },
  { name: "Yapı Kredi", tokens: ["yapi ve kredi bankasi", "yapi kredi"] },
  { name: "Halkbank", tokens: ["turkiye halk bankasi", "halkbank"] },
  { name: "Ziraat Bankası", tokens: ["turkiye cumhuriyeti ziraat bankasi", "ziraat bankasi"] },
  { name: "DenizBank", tokens: ["denizbank"] },
  { name: "TEB", tokens: ["turk ekonomi bankasi", "teb"] },
  { name: "ING", tokens: ["ing bank", "ing"] },
  { name: "Enpara", tokens: ["enpara bank", "enpara.com", "enpara"] },
  { name: "Fibabanka", tokens: ["fibabanka"] },
  { name: "Kuveyt Türk", tokens: ["kuveyt turk"] },
  { name: "Türkiye Finans", tokens: ["turkiye finans"] },
];

export function normalizeLoanPlanText(value = "") {
  return String(value)
    .replace(/İ/g, "I")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[‐‑‒–—]/g, "-")
    .replace(/\u00a0/g, " ")
    .toLowerCase();
}

export function parseLoanMoney(raw) {
  if (raw === null || raw === undefined) return null;
  let value = String(raw)
    .replace(/\b(?:tl|try)\b/gi, "")
    .replace(/[^0-9,.-]/g, "")
    .replace(/^[.,]+|[.,]+$/g, "");
  if (!value) return null;
  const negative = value.startsWith("-");
  value = value.replace(/-/g, "");
  const dot = value.lastIndexOf(".");
  const comma = value.lastIndexOf(",");
  const decimal = dot >= 0 && comma >= 0
    ? (dot > comma ? "." : ",")
    : dot >= 0 && value.length - dot - 1 === 2
      ? "."
      : comma >= 0 && value.length - comma - 1 === 2
        ? ","
        : "";
  if (decimal) {
    const index = value.lastIndexOf(decimal);
    value = `${value.slice(0, index).replace(/[.,]/g, "")}.${value.slice(index + 1).replace(/[.,]/g, "")}`;
  } else value = value.replace(/[.,]/g, "");
  const number = Number(value);
  return Number.isFinite(number) ? (negative ? -number : number) : null;
}

function isoDate(day, month, year) {
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    Number.isNaN(date.getTime()) ||
    date.getDate() !== Number(day) ||
    date.getMonth() !== Number(month) - 1
  ) return "";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseDate(raw) {
  const match = String(raw || "").match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  return match ? isoDate(match[1], match[2], match[3]) : "";
}

function fieldNear(text, labels, pattern) {
  const normalized = normalizeLoanPlanText(text);
  for (const label of labels) {
    const start = normalized.indexOf(label);
    if (start < 0) continue;
    const sample = normalized.slice(start + label.length, start + label.length + 150);
    const match = sample.match(pattern);
    if (match) return match[1];
  }
  return "";
}

export function detectLoanBank(text) {
  const normalized = normalizeLoanPlanText(text).slice(0, 9000);
  const found = BANKS
    .map((bank) => ({
      bank: bank.name,
      score: bank.tokens.reduce((sum, token) => sum + (normalized.includes(token) ? token.length : 0), 0),
    }))
    .sort((left, right) => right.score - left.score)[0];
  return found?.score ? found.bank : "";
}

function parseRate(text) {
  const raw = fieldNear(text, ["akdi faiz orani", "faiz orani"], /%?\s*([0-9]+(?:[.,][0-9]+)?)/);
  return raw ? Number(raw.replace(",", ".")) : null;
}

function parseTerm(text) {
  const raw = fieldNear(text, ["kredi vadesi", "vade"], /([0-9]{1,3})/);
  return raw ? Number(raw) : null;
}

function parseLoanAmount(text) {
  const raw = fieldNear(text, ["kredi tutari"], /([0-9][0-9., ]{2,24}(?:\s*tl)?)/);
  return parseLoanMoney(raw);
}

function parseProduct(text) {
  const normalized = normalizeLoanPlanText(text);
  const candidates = [
    ["konut kredisi", "Konut kredisi"],
    ["tasit kredisi", "Taşıt kredisi"],
    ["ihtiyac kredisi", "İhtiyaç kredisi"],
    ["tuketici kredisi", "Tüketici kredisi"],
  ];
  const labelled = candidates.find(([token]) =>
    new RegExp(`(?:urun adi|kredi tipi)[^\n]{0,45}${token}`).test(normalized),
  );
  if (labelled) return labelled[1];
  const first = candidates
    .map(([token, label]) => ({ label, index: normalized.indexOf(token) }))
    .filter((item) => item.index >= 0)
    .sort((left, right) => left.index - right.index)[0];
  return first?.label || "Kredi";
}

function moneyTokens(line) {
  return [...String(line).matchAll(/-?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})|-?\d+[.,]\d{2}/g)]
    .map((match) => parseLoanMoney(match[0]))
    .filter((value) => value !== null);
}

function parseVakifRows(text) {
  const rows = [];
  for (const rawLine of String(text).split(/\n/)) {
    const line = rawLine.replace(/\s+/g, " ").trim();
    const start = line.match(/^(\d{1,3})\s+([0-9.,]+)\s*TL\s+(\d{2}[./]\d{2}[./]\d{4})\s+/i);
    if (!start) continue;
    const number = Number(start[1]);
    const dueDate = parseDate(start[3]);
    const remainder = line
      .slice(start[0].length)
      .replace(/^\d{2}[./]\d{2}[./]\d{4}\s+/, "");
    const amounts = moneyTokens(remainder);
    if (!number || !dueDate || amounts.length < 3) continue;
    rows.push({
      number,
      dueDate,
      installment: parseLoanMoney(start[2]),
      principal: amounts[0] ?? null,
      interest: amounts[1] ?? null,
      taxes: (amounts[2] || 0) + (amounts[3] || 0),
      insurance: amounts.length >= 6 ? amounts[4] || 0 : 0,
      remainingPrincipal: amounts.at(-1) ?? null,
      source: "plan",
    });
  }
  return rows;
}

function parseQnbRows(text) {
  const rows = [];
  for (const rawLine of String(text).split(/\n/)) {
    const line = rawLine.replace(/\s+/g, " ").trim();
    const start = line.match(/^(\d{1,3})\s+(\d{2}[./]\d{2}[./]\d{4})\s+/);
    if (!start || Number(start[1]) === 0) continue;
    const values = moneyTokens(line.slice(start[0].length));
    if (values.length < 8) continue;
    rows.push({
      number: Number(start[1]),
      dueDate: parseDate(start[2]),
      installment: values[1] ?? null,
      principal: values.at(-2) ?? null,
      interest: values[3] ?? values[2] ?? null,
      taxes: (values[4] || 0) + (values[5] || 0),
      insurance: 0,
      remainingPrincipal: values.at(-1) ?? null,
      source: "plan",
    });
  }
  return rows;
}

function parseGenericRows(text) {
  const rows = [];
  for (const rawLine of String(text).split(/\n/)) {
    const line = rawLine.replace(/\s+/g, " ").trim();
    const start = line.match(/^(\d{1,3})\s+(?:[0-9.,]+\s*(?:TL)?\s+)?(\d{2}[./]\d{2}[./]\d{4})\s+/i);
    if (!start || Number(start[1]) === 0) continue;
    const values = moneyTokens(line);
    if (values.length < 3) continue;
    rows.push({
      number: Number(start[1]),
      dueDate: parseDate(start[2]),
      installment: values[1] ?? null,
      principal: null,
      interest: null,
      taxes: null,
      insurance: null,
      remainingPrincipal: values.at(-1) ?? null,
      source: "plan",
    });
  }
  return rows;
}

function uniqueRows(rows) {
  const seen = new Set();
  return rows
    .filter((row) => {
      const key = `${row.number}|${row.dueDate}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((left, right) => left.number - right.number);
}

function median(values) {
  const sorted = values.filter((value) => Number.isFinite(value) && value > 0).sort((a, b) => a - b);
  if (!sorted.length) return null;
  return sorted[Math.floor(sorted.length / 2)];
}

export function validateLoanPlanResult(result = {}) {
  const errors = [];
  if (!result.bank) errors.push("Banka otomatik tanınamadı; banka adını kontrol et.");
  if (!(result.originalPrincipal > 0)) errors.push("Kredi tutarı okunamadı.");
  if (!(result.installment > 0)) errors.push("Aylık taksit okunamadı.");
  if (!(result.remainingInstallments > 0)) errors.push("Kalan taksit bulunamadı; kapanmış plan olabilir.");
  if (!(result.remainingPrincipal > 0)) errors.push("Kalan anapara okunamadı.");
  return errors;
}

export function parseLoanPlanText(text, { sourceType = "pdf", pagesRead = 1, today = new Date() } = {}) {
  const bank = detectLoanBank(text);
  const profileRows = bank === "VakıfBank"
    ? parseVakifRows(text)
    : bank === "QNB"
      ? parseQnbRows(text)
      : parseGenericRows(text);
  const schedule = uniqueRows(profileRows);
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const remainingRows = schedule.filter((row) => row.dueDate >= todayKey && (row.remainingPrincipal === null || row.remainingPrincipal >= 0));
  const next = remainingRows[0] || null;
  const previous = next ? schedule.find((row) => row.number === next.number - 1) : schedule.at(-1);
  const inferredPrincipal = schedule[0]?.principal !== null && schedule[0]?.remainingPrincipal !== null
    ? schedule[0].principal + schedule[0].remainingPrincipal
    : null;
  const parsedPrincipal = parseLoanAmount(text);
  const originalPrincipal = parsedPrincipal && (!inferredPrincipal || parsedPrincipal <= inferredPrincipal * 2)
    ? parsedPrincipal
    : inferredPrincipal;
  const remainingPrincipal = next
    ? (previous?.remainingPrincipal ?? (next.principal !== null && next.remainingPrincipal !== null
      ? next.principal + next.remainingPrincipal
      : null))
    : 0;
  const installment = next?.installment ?? median(schedule.map((row) => row.installment));
  const totalRepayment = schedule.reduce((sum, row) => sum + (row.installment || 0), 0);
  const remainingPaymentTotal = remainingRows.reduce((sum, row) => sum + (row.installment || 0), 0);
  const remainingFinancingCost = remainingPaymentTotal && remainingPrincipal !== null
    ? Math.max(remainingPaymentTotal - remainingPrincipal, 0)
    : null;
  const parsedTerm = parseTerm(text);
  const term = parsedTerm && (!schedule.length || parsedTerm <= schedule.length + 12)
    ? parsedTerm
    : schedule.length || null;
  const parsedRate = parseRate(text);
  const percentageCandidates = [...normalizeLoanPlanText(text).matchAll(/%\s*([0-9]+(?:[.,][0-9]+)?)/g)]
    .map((match) => Number(match[1].replace(",", ".")))
    .filter((value) => value > 0 && value <= 10);
  const monthlyInterestRate = bank === "QNB" && percentageCandidates.length
    ? percentageCandidates[0]
    : parsedRate && parsedRate <= 20
      ? parsedRate
      : percentageCandidates[0] ?? null;
  const result = {
    bank,
    productName: parseProduct(text),
    originalPrincipal,
    remainingPrincipal,
    installment,
    term,
    remainingInstallments: remainingRows.length,
    monthlyInterestRate,
    nextInstallmentNumber: next?.number || null,
    firstPaymentDate: next?.dueDate || schedule[0]?.dueDate || "",
    paymentDay: next?.dueDate ? Number(next.dueDate.slice(-2)) : null,
    totalRepayment: totalRepayment || null,
    remainingPaymentTotal: remainingPaymentTotal || null,
    remainingFinancingCost,
    schedule,
    pagesRead,
    sourceType,
    warnings: [],
  };
  if (bank && !["VakıfBank", "QNB"].includes(bank)) {
    result.warnings.push("Bu banka genel tablo okuyucusuyla işlendi; tüm alanları kontrol et.");
  }
  if (schedule.length && result.term && schedule.length !== result.term) {
    result.warnings.push(`Belgede ${schedule.length} taksit satırı bulundu; bildirilen vade ${result.term}.`);
  }
  result.blockingErrors = validateLoanPlanResult(result);
  const found = [bank, originalPrincipal, installment, result.remainingInstallments, remainingPrincipal, result.monthlyInterestRate]
    .filter((value) => value !== null && value !== "" && value !== undefined).length;
  result.confidence = Math.round((found / 6) * 100);
  return result;
}
