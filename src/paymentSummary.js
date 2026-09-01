export function isMandatoryPaymentPending(payment) {
  if (payment?.kartOdemesi) return !payment.minimumTamam;
  return !payment?.odendi;
}

export function mergeArchivedCardStatement(card, statement) {
  const record = { ...card, ...statement };
  if (!Object.prototype.hasOwnProperty.call(statement, "sonOdemeTarihi")) {
    delete record.sonOdemeTarihi;
  }
  if (!Object.prototype.hasOwnProperty.call(statement, "hesapKesimTarihi")) {
    delete record.hesapKesimTarihi;
  }
  return record;
}

export function summarizeMandatoryPayments(payments = []) {
  return payments.reduce(
    (summary, payment) => {
      const target = Math.max(+payment?.hedefTutar || 0, 0);
      const remaining = Math.min(Math.max(+payment?.tutar || 0, 0), target);
      const covered = Math.max(target - remaining, 0);

      summary.total += target;
      summary.covered += covered;
      summary.remaining += remaining;
      return summary;
    },
    { total: 0, covered: 0, remaining: 0 },
  );
}
