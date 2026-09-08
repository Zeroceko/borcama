export const FINANCIAL_ASSISTANT_ROUTE_IDS = new Set([
  "ozet", "borclar", "odemeler", "harcamalar", "sabit-giderler",
  "sabit-gelirler", "plan", "ayarlar", "none",
]);

const normalize = (value) => String(value ?? "")
  .toLocaleLowerCase("tr-TR")
  .normalize("NFKC")
  .replace(/[’‘]/g, "'");

const wordCount = (value) => String(value ?? "").trim().split(/\s+/).filter(Boolean).length;

const unsafePatterns = [
  /\bkesinlikle\s+(?:kredi\s+al|kredi\s+çek|yatırım\s+yap|yapılandır)\b/i,
  /\bmutlaka\s+(?:kredi\s+al|kredi\s+çek|yatırım\s+yap|yapılandır)\b/i,
  /\bkesin\s+(?:kredi\s+)?onay\w*\b[^.!?\n]{0,40}\b(?:verir|alırsın|çıkar|sağlar|garantiler)\b/i,
  /\b(?:kredi|onay|sonuç|kazanç)\s+garantisi\s+veriyorum\b/i,
  /\b(?:oran|faiz|taksit|maliyet)\b[^.!?\n]{0,40}\bdeğişmez\b/i,
  /\bbanka\s+(?:hesabına|hesabını|kayıtlarına|sistemine)\s+(?:eriştim|bağlandım|kontrol ettim)\b/i,
  /\bkaydını\s+(?:oluşturdum|değiştirdim|sildim|güncelledim)\b/i,
];

const collectPercentageNumbers = (value, result = []) => {
  if (Array.isArray(value)) {
    value.forEach((item) => collectPercentageNumbers(item, result));
    return result;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      if (typeof item === "number" && Number.isFinite(item) && /faiz|oran|yuzde|yüzde/i.test(key)) result.push(item);
      else collectPercentageNumbers(item, result);
    }
  }
  return result;
};

const extractPercentages = (value) => {
  const values = [];
  for (const match of String(value ?? "").matchAll(/%\s*(\d+(?:[.,]\d+)?)|\b(\d+(?:[.,]\d+)?)\s*%|\byüzde\s+(\d+(?:[.,]\d+)?)/gi)) {
    const raw = match[1] ?? match[2] ?? match[3];
    values.push(Number(raw.replace(",", ".")));
  }
  return values.filter(Number.isFinite);
};

const approximatelyIncludes = (values, target) => values.some((value) => Math.abs(value - target) < 0.0001);

export function validateFinancialAssistantResponse({ response, context, question = "" }) {
  const errors = [];
  if (!response || typeof response !== "object" || Array.isArray(response)) {
    return { valid: false, errors: ["response_not_object"] };
  }

  const requiredStrings = ["title", "answer", "route", "actionLabel", "disclaimer"];
  for (const field of requiredStrings) {
    if (typeof response[field] !== "string" || !response[field].trim()) errors.push(`invalid_field:${field}`);
  }
  if (typeof response.needsMoreInfo !== "boolean") errors.push("invalid_field:needsMoreInfo");
  if (!FINANCIAL_ASSISTANT_ROUTE_IDS.has(response.route)) errors.push("invalid_route");

  if (typeof response.title === "string" && response.title.length > 100) errors.push("title_too_long");
  if (typeof response.answer === "string" && response.answer.length > 1800) errors.push("answer_too_long");
  if (typeof response.actionLabel === "string" && response.actionLabel.length > 60) errors.push("action_label_too_long");
  if (typeof response.disclaimer === "string" && response.disclaimer.length > 240) errors.push("disclaimer_too_long");

  const answer = String(response.answer ?? "").trim();
  const lines = answer.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines[0]?.startsWith("Kısa cevap: ")) errors.push("missing_short_answer_prefix");
  const bulletLines = lines.filter((line) => /^•\s+\S/.test(line));
  if (bulletLines.length < 2 || bulletLines.length > 3) errors.push("invalid_bullet_count");
  if (lines.slice(1).some((line) => !/^•\s+\S/.test(line) && !/^Yapman gereken:\s+\S/.test(line))) {
    errors.push("invalid_answer_structure");
  }
  if (wordCount(answer) > 130) errors.push("answer_over_130_words");

  const fullText = normalize(`${response.title ?? ""}\n${answer}\n${response.disclaimer ?? ""}`);
  if (unsafePatterns.some((pattern) => pattern.test(fullText))) errors.push("unsafe_certainty_or_action");

  const sourceNumbers = [...collectPercentageNumbers(context), ...extractPercentages(question)];
  for (const percentage of extractPercentages(fullText)) {
    if (!approximatelyIncludes(sourceNumbers, percentage)) errors.push(`ungrounded_percentage:${percentage}`);
  }

  return { valid: errors.length === 0, errors: [...new Set(errors)] };
}
