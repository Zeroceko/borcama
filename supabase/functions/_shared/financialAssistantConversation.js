export const MAX_ASSISTANT_EXCHANGES = 5;

export function normalizeAssistantHistory(history = []) {
  if (!Array.isArray(history) || history.length > MAX_ASSISTANT_EXCHANGES) throw new Error("INVALID_HISTORY");
  return history.map((exchange) => {
    if (!exchange || typeof exchange.question !== "string" || typeof exchange.answer !== "string") {
      throw new Error("INVALID_HISTORY");
    }
    const question = exchange.question.trim();
    const answer = exchange.answer.trim();
    if (!question || question.length > 500 || !answer || answer.length > 1800) throw new Error("INVALID_HISTORY");
    // Do not forward client-provided roles, metadata or financial snapshots.
    return { question, answer };
  });
}

export function appendAssistantExchange(history, exchange) {
  return normalizeAssistantHistory([...history, exchange].slice(-MAX_ASSISTANT_EXCHANGES));
}

export function buildFinancialAssistantContents({ question, context, history = [] }) {
  const exchanges = normalizeAssistantHistory(history);
  return [
    ...exchanges.flatMap((exchange) => [
      { role: "user", parts: [{ text: exchange.question }] },
      { role: "model", parts: [{ text: exchange.answer }] },
    ]),
    { role: "user", parts: [{ text: `SORU:\n${question}\n\nBORCAMA_HESAP_OZETI:\n${JSON.stringify(context)}` }] },
  ];
}
