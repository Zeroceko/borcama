const BANK_PROFILES = [
  { bank: "Halkbank", brand: "Paraf", tokens: ["halkbank", "paraf"] },
  { bank: "TEB", brand: "SHE", tokens: ["teb", "turk ekonomi bankasi", "she kredi"] },
  { bank: "Garanti BBVA", brand: "Bonus", tokens: ["garanti bbva", "bonus trink", "bonus"] },
  { bank: "Akbank", brand: "Axess", tokens: ["akbank", "axess"] },
  { bank: "VakıfBank", brand: "World", tokens: ["vakifbank", "vakif bank", "world"] },
  { bank: "Enpara", brand: "Enpara", tokens: ["enpara", "en para"] },
];

const FIELD_ALIASES = {
  statementTotal: [
    "donem borcunuz",
    "donem borcu",
    "ekstre borcu",
    "toplam borc",
    "genel toplam",
    "hesap bakiyesi",
  ],
  minimumPayment: [
    "asgari odeme tutari",
    "minimum odeme tutari",
    "min odeme tutari",
    "en az odeme tutari",
    "min. odeme tutari",
  ],
  creditLimit: ["toplam kredi limiti", "kart limiti", "musteri limiti", "limiti"],
  previousBalance: [
    "bir onceki donem ekstre borcu",
    "bir onceki ekstre borcu",
    "onceki hesap bakiyesi",
    "onceki bakiye",
    "onceki donem hesap ozeti bakiyesi",
  ],
  periodPayments: ["donemsel alacak kayitlari", "odemeleriniz", "odemeler"],
  currentPurchases: [
    "donem ici borc tutari",
    "donem harcamalari",
    "harcamalar ve yansiyan taksitler",
    "donem ici islemler",
  ],
  fees: [
    "toplam faiz ucret vergiler",
    "toplam faiz ve ucretler",
    "faiz vergiler ucretler ve diger",
    "faiz ve ucretler",
  ],
};

const MONTHS = {
  ocak: 0,
  subat: 1,
  mart: 2,
  nisan: 3,
  mayis: 4,
  haziran: 5,
  temmuz: 6,
  agustos: 7,
  eylul: 8,
  ekim: 9,
  kasim: 10,
  aralik: 11,
};

export function normalizeStatementText(value = "") {
  return String(value)
    .replace(/İ/g, "I")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[‐‑‒–—]/g, "-")
    .replace(/\u00a0/g, " ")
    .toLowerCase();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function labelRegex(value) {
  return value
    .split(/\s+/)
    .map(escapeRegex)
    .join("[\\s,.:;/()_-]+");
}

function parseMoneyResult(raw, { statementField = false } = {}) {
  if (raw === null || raw === undefined) return null;
  const source = String(raw);
  const negative = /\(-?\)|-\s*$|^\s*-/.test(source);
  let value = source
    .replace(/\b(?:tl|try)\b/gi, "")
    .replace(/[^0-9.,]/g, "")
    .replace(/^[.,]+|[.,]+$/g, "");
  if (!value) return null;
  const dot = value.lastIndexOf(".");
  const comma = value.lastIndexOf(",");
  let decimal = "";
  if (dot >= 0 && comma >= 0) decimal = dot > comma ? "." : ",";
  else if (dot >= 0 && value.length - dot - 1 === 2) decimal = ".";
  else if (comma >= 0 && value.length - comma - 1 === 2) decimal = ",";
  let recoveredCents = false;
  if (decimal) {
    const index = value.lastIndexOf(decimal);
    value =
      value.slice(0, index).replace(/[.,]/g, "") +
      "." +
      value.slice(index + 1).replace(/[.,]/g, "");
  } else {
    const digits = value.replace(/[.,]/g, "");
    // Banka ekstrelerindeki ozet tutarlar daima kurus hanesiyle basilir.
    // OCR bazen 89.692,57 degerini 8969257 veya 89.69257 olarak okur.
    // Alan etiketiyle bulunan bu degerlerde son iki haneyi kurus olarak geri
    // kazanmak, butun tutarin 100 kat buyuk kaydedilmesini engeller.
    if (statementField && digits.length >= 3) {
      value = `${digits.slice(0, -2) || "0"}.${digits.slice(-2)}`;
      recoveredCents = true;
    } else value = digits;
  }
  const number = Number(value);
  return Number.isFinite(number)
    ? { value: negative ? -number : number, recoveredCents }
    : null;
}

export function parseMoney(raw, options) {
  return parseMoneyResult(raw, options)?.value ?? null;
}

function amountNearAlias(text, aliases, recoveredFields, fieldName) {
  const normalized = normalizeStatementText(text);
  for (const alias of aliases) {
    const label = labelRegex(alias);
    const patterns = [
      new RegExp(`${label}[ \\t]*[:;=-]?[ \\t]*(?:tl\\.?[ \\t]*)?([+-]?[ \\t]*[0-9][0-9., \\t]{0,18}(?:[ \\t]*tl)?)`, "i"),
      new RegExp(`${label}[^\\n]{0,18}?(?:tl\\.?[ \\t]*)?([+-]?[ \\t]*[0-9][0-9., \\t]{0,18}(?:[ \\t]*tl)?)`, "i"),
      new RegExp(`${label}[^\\n]{0,36}\\n[ \\t]*(?:tl\\.?[ \\t]*)?([+-]?[ \\t]*[0-9][0-9., \\t]{0,18}(?:[ \\t]*tl)?)`, "i"),
    ];
    for (const pattern of patterns) {
      const match = normalized.match(pattern);
      if (!match) continue;
      const amount = parseMoneyResult(match[1], { statementField: true });
      if (amount !== null) {
        if (amount.recoveredCents && fieldName) recoveredFields?.add(fieldName);
        return amount.value;
      }
    }
  }
  return null;
}

function parseDateValue(raw) {
  if (!raw) return null;
  const normalized = normalizeStatementText(raw).trim();
  const numeric = normalized.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (numeric) {
    const [, day, month, year] = numeric;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const named = normalized.match(/(\d{1,2})\s+([a-z]+)\s+(\d{4})/);
  if (named && MONTHS[named[2]] !== undefined) {
    const date = new Date(Number(named[3]), MONTHS[named[2]], Number(named[1]));
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

function dateNearAlias(text, aliases, preferLast = false) {
  const normalized = normalizeStatementText(text);
  for (const alias of aliases) {
    const start = normalized.indexOf(alias);
    if (start < 0) continue;
    const currentLine = normalized.slice(start, normalized.indexOf("\n", start) < 0 ? undefined : normalized.indexOf("\n", start));
    let matches = [
      ...currentLine.matchAll(/\d{1,2}[./-]\d{1,2}[./-]\d{4}|\d{1,2}\s+[a-z]+\s+\d{4}/g),
    ];
    if (!matches.length) {
      const sample = normalized.slice(start, start + 140);
      matches = [
        ...sample.matchAll(/\d{1,2}[./-]\d{1,2}[./-]\d{4}|\d{1,2}\s+[a-z]+\s+\d{4}/g),
      ];
    }
    if (!matches.length) continue;
    const selected = preferLast ? matches.at(-1) : matches[0];
    const date = parseDateValue(selected[0]);
    if (date) return date;
  }
  return null;
}

function isoDate(date) {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function detectBank(text) {
  const normalized = normalizeStatementText(text);
  let best = null;
  for (const profile of BANK_PROFILES) {
    const score = profile.tokens.reduce(
      (total, token) => total + (normalized.includes(token) ? 1 : 0),
      0,
    );
    if (!best || score > best.score) best = { ...profile, score };
  }
  return best?.score > 0 ? best : { bank: "", brand: "", score: 0 };
}

function findCardLast4(text) {
  const normalized = normalizeStatementText(text);
  const matches = [
    ...normalized.matchAll(/(?:kart(?:\s+numarasi|\s+no)?[^\n]{0,45})((?:\d[\s-]*){4})\b/g),
  ];
  if (!matches.length) return "";
  return matches[0][1].replace(/\D/g, "").slice(-4);
}

function parseEnparaSummaryTable(text) {
  const lines = normalizeStatementText(text).split(/\n/);
  const moneyPattern = /[-+]?\s*\d{1,3}(?:[.\s]\d{3})*,\d{2}\s*(?:tl)?/gi;
  for (let index = 0; index < lines.length; index += 1) {
    // Enpara's column names wrap across several OCR lines. Treat the whole
    // header block as one unit instead of depending on a particular wrap.
    const header = lines.slice(index, index + 4).join(" ");
    if (!header.includes("odemeler") || !header.includes("yansiyan taksitler"))
      continue;
    for (let offset = 1; offset <= 7; offset += 1) {
      const values = [...(lines[index + offset] || "").matchAll(moneyPattern)]
        .map((match) => parseMoney(match[0]))
        .filter((value) => value !== null);
      if (values.length < 5) continue;
      return {
        previousBalance: values[0],
        periodPayments: Math.abs(values[1]),
        currentPurchases: values[2],
        fees: values.length >= 6 ? values.at(-2) : values.at(-1),
        statementTotal: values.length >= 6 ? values.at(-1) : null,
      };
    }
  }
  return null;
}

function amountsAfterLine(text, label, maxLines = 8) {
  const lines = normalizeStatementText(text).split(/\n/);
  const start = lines.findIndex((line) => line.includes(label));
  if (start < 0) return [];
  const moneyPattern = /[-+]?\s*\d{1,3}(?:[.,\s]\d{3})*[.,]\d{2}\s*(?:tl)?/gi;
  return lines
    .slice(start, start + maxLines)
    .flatMap((line) => [...line.matchAll(moneyPattern)])
    .map((match) => parseMoney(match[0]))
    .filter((value) => value !== null);
}

function parseHalkbankSummary(text) {
  const balances = amountsAfterLine(text, "hesap bakiyesi", 7);
  const limits = amountsAfterLine(text, "toplam kredi limiti", 11);
  return {
    statementTotal: balances[0] ?? null,
    minimumPayment: balances[1] ?? null,
    creditLimit: limits[0] ?? null,
  };
}

export function parseStatementText(text, options = {}) {
  const recoveredFields = new Set();
  const profile = detectBank(text);
  const statementDate =
    dateNearAlias(text, ["hesap kesim tarihi", "ekstre tarihi", "ekstre tari"]) ||
    dateNearAlias(text, ["ekstre donemi"], true);
  const dueDate = dateNearAlias(text, ["son odeme tarihi"]);
  const nextStatementDate = dateNearAlias(text, ["bir sonraki hesap kesim tarihi"]);
  const totalAliases =
    profile.bank === "Halkbank"
      ? ["hesap bakiyesi", "donem borcu", "ekstre borcu"]
      : profile.bank === "Enpara"
        ? ["ekstre borcu", "donem borcu", "hesap bakiyesi"]
        : FIELD_ALIASES.statementTotal;
  let statementTotal = amountNearAlias(text, totalAliases, recoveredFields, "statementTotal");
  let minimumPayment = amountNearAlias(text, FIELD_ALIASES.minimumPayment, recoveredFields, "minimumPayment");
  let creditLimit = amountNearAlias(text, FIELD_ALIASES.creditLimit, recoveredFields, "creditLimit");
  let previousBalance = amountNearAlias(text, FIELD_ALIASES.previousBalance, recoveredFields, "previousBalance");
  const periodPaymentsRaw = amountNearAlias(text, FIELD_ALIASES.periodPayments, recoveredFields, "periodPayments");
  let periodPayments =
    periodPaymentsRaw === null ? null : Math.abs(periodPaymentsRaw);
  let currentPurchases = amountNearAlias(text, FIELD_ALIASES.currentPurchases, recoveredFields, "currentPurchases");
  let fees = amountNearAlias(text, FIELD_ALIASES.fees, recoveredFields, "fees");

  if (profile.bank === "Enpara") {
    const table = parseEnparaSummaryTable(text);
    if (table) {
      statementTotal = table.statementTotal ?? statementTotal;
      previousBalance = table.previousBalance;
      periodPayments = table.periodPayments;
      currentPurchases = table.currentPurchases;
      fees = table.fees;
    }
  }
  if (profile.bank === "Halkbank") {
    const table = parseHalkbankSummary(text);
    statementTotal ??= table.statementTotal;
    minimumPayment ??= table.minimumPayment;
    creditLimit ??= table.creditLimit;
  }
  if (
    statementTotal !== null &&
    minimumPayment !== null &&
    minimumPayment > statementTotal
  ) {
    const decimalShifted = minimumPayment / 100;
    if (decimalShifted <= statementTotal) minimumPayment = decimalShifted;
  }

  if (
    currentPurchases === null &&
    statementTotal !== null &&
    previousBalance !== null &&
    periodPayments !== null &&
    fees !== null
  ) {
    const inferredPurchases =
      statementTotal - previousBalance + periodPayments - fees;
    if (inferredPurchases >= 0)
      currentPurchases = Math.round(inferredPurchases * 100) / 100;
  }

  let carriedBalance = null;
  let currentPeriodDebt = null;
  if (statementTotal !== null) {
    const reportedNew =
      (currentPurchases !== null ? Math.max(currentPurchases, 0) : 0) +
      (fees !== null ? Math.max(fees, 0) : 0);
    if (reportedNew > 0 && statementTotal + 0.01 >= reportedNew) {
      currentPeriodDebt = Math.round(reportedNew * 100) / 100;
      carriedBalance =
        Math.round(Math.max(statementTotal - reportedNew, 0) * 100) / 100;
    } else if (previousBalance !== null) {
      carriedBalance =
        Math.round(
          Math.max(previousBalance - Math.max(periodPayments || 0, 0), 0) *
            100,
        ) / 100;
      currentPeriodDebt =
        Math.round(Math.max(statementTotal - carriedBalance, 0) * 100) / 100;
    } else {
      carriedBalance = 0;
      currentPeriodDebt = statementTotal;
    }
  }

  const warnings = [];
  if (!profile.bank) warnings.push("Banka otomatik tanınamadı.");
  if (statementTotal === null) warnings.push("Toplam ekstre borcu bulunamadı.");
  if (!statementDate) warnings.push("Ekstre kesim tarihi bulunamadı.");
  if (!dueDate) warnings.push("Son ödeme tarihi bulunamadı.");
  if (minimumPayment === null) warnings.push("Asgari ödeme tutarı bulunamadı.");
  if (previousBalance === null || periodPayments === null)
    warnings.push("Devreden bakiye kırılımını kaydetmeden önce kontrol edin.");
  if (recoveredFields.size)
    warnings.push(
      "OCR bazı tutarlardaki kuruş ayıracını kaybetti; son iki hane kuruş kabul edilerek düzeltildi. Kaydetmeden önce rakamları kontrol edin.",
    );

  const blockingErrors = validateStatementResult({
    statementDate: isoDate(statementDate),
    dueDate: isoDate(dueDate),
    statementTotal,
    minimumPayment,
    creditLimit,
    previousBalance,
    periodPayments,
    currentPurchases,
    fees,
  });

  const confidenceParts = [
    profile.bank ? 20 : 0,
    statementTotal !== null ? 25 : 0,
    statementDate ? 15 : 0,
    dueDate ? 15 : 0,
    minimumPayment !== null ? 10 : 0,
    creditLimit !== null ? 5 : 0,
    previousBalance !== null ? 5 : 0,
    periodPayments !== null ? 5 : 0,
  ];

  return {
    bank: profile.bank,
    cardBrand: profile.brand,
    cardLast4: findCardLast4(text),
    statementDate: isoDate(statementDate),
    statementPeriod: statementDate ? isoDate(statementDate).slice(0, 7) : "",
    dueDate: isoDate(dueDate),
    nextStatementDate: isoDate(nextStatementDate),
    statementTotal,
    minimumPayment,
    creditLimit,
    previousBalance,
    periodPayments,
    currentPurchases,
    fees,
    carriedBalance,
    currentPeriodDebt,
    confidence: Math.max(
      0,
      confidenceParts.reduce((sum, value) => sum + value, 0) -
        (recoveredFields.size ? 15 : 0) -
        blockingErrors.length * 25,
    ),
    warnings,
    blockingErrors,
    recoveredFields: [...recoveredFields],
    pagesRead: options.pagesRead || 1,
    sourceType: options.sourceType || "image",
  };
}

export function validateStatementResult(result = {}) {
  const errors = [];
  const number = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };
  const total = number(result.statementTotal);
  const minimum = number(result.minimumPayment);
  const limit = number(result.creditLimit);
  const amounts = [
    ["Toplam ekstre borcu", total],
    ["Asgari ödeme", minimum],
    ["Kart limiti", limit],
    ["Önceki ekstre bakiyesi", number(result.previousBalance)],
    ["Dönem içi ödemeler", number(result.periodPayments)],
    ["Yeni harcama ve taksitler", number(result.currentPurchases)],
    ["Faiz, vergi ve ücretler", number(result.fees)],
  ];
  amounts.forEach(([label, value]) => {
    if (value !== null && value < 0) errors.push(`${label} negatif olamaz.`);
  });
  if (total !== null && minimum !== null && minimum > total)
    errors.push("Asgari ödeme toplam ekstre borcundan büyük olamaz.");
  if (total !== null && limit !== null && limit > 0 && total > limit * 1.5)
    errors.push("Toplam ekstre borcu kart limitine göre olağan dışı görünüyor.");
  if (
    result.statementDate &&
    result.dueDate &&
    new Date(result.dueDate).getTime() < new Date(result.statementDate).getTime()
  )
    errors.push("Son ödeme tarihi ekstre kesim tarihinden önce olamaz.");
  return [...new Set(errors)];
}

export { FIELD_ALIASES };
