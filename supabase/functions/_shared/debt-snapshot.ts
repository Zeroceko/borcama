type VeriKaydi = { value: string };

export type BorcToplamlari = {
  participant_count: number;
  total_debt: number;
  cards: number;
  loans: number;
  overdrafts: number;
  others: number;
};

export const guvenliSayi = (deger: unknown) => {
  const n = Number(deger);
  return Number.isFinite(n) && n >= 0 && n <= 1_000_000_000_000 ? n : 0;
};

export function krediKartiBorcu(kayit: Record<string, unknown>) {
  const yeniModel = kayit.toplamEkstreBorcu !== undefined || kayit.oncekiDonemBorcu !== undefined || kayit.yapilanOdeme !== undefined;
  if (!yeniModel) return (guvenliSayi(kayit.donemIciToplam) || guvenliSayi(kayit.borc)) + guvenliSayi(kayit.donemIciEklenen);
  const ekstre = guvenliSayi(kayit.toplamEkstreBorcu) || guvenliSayi(kayit.oncekiDonemBorcu);
  const devreden = Math.max(ekstre - Math.min(guvenliSayi(kayit.yapilanOdeme), ekstre), 0);
  const oran = ekstre >= 180000 ? 4.25 : ekstre >= 30000 ? 3.75 : 3.25;
  return devreden + (devreden * oran) / 100;
}

export function borcToplamlariniHesapla(kayitlar: VeriKaydi[]): BorcToplamlari {
  const toplam = { participant_count: 0, total_debt: 0, cards: 0, loans: 0, overdrafts: 0, others: 0 };
  for (const kayit of kayitlar) {
    try {
      const veri = JSON.parse(kayit.value);
      if (!veri || typeof veri !== "object") continue;
      const cards = Array.isArray(veri.cards) ? veri.cards.reduce((t: number, x: Record<string, unknown>) => t + krediKartiBorcu(x), 0) : 0;
      const loans = Array.isArray(veri.loans) ? veri.loans.reduce((t: number, x: Record<string, unknown>) => t + guvenliSayi(x.kalanBorc), 0) : 0;
      const overdrafts = Array.isArray(veri.overdrafts) ? veri.overdrafts.reduce((t: number, x: Record<string, unknown>) => t + guvenliSayi(x.kullanilan), 0) : 0;
      const others = Array.isArray(veri.others) ? veri.others.reduce((t: number, x: Record<string, unknown>) => t + guvenliSayi(x.tutar), 0) : 0;
      toplam.cards += cards;
      toplam.loans += loans;
      toplam.overdrafts += overdrafts;
      toplam.others += others;
      toplam.total_debt += cards + loans + overdrafts + others;
      toplam.participant_count += 1;
    } catch { /* Geçersiz kullanıcı verisi toplama katılmaz. */ }
  }
  return toplam;
}

export function istanbulTarihi(tarih = new Date()) {
  const parcalar = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(tarih);
  const parca = (tur: string) => parcalar.find((x) => x.type === tur)?.value || "";
  return `${parca("year")}-${parca("month")}-${parca("day")}`;
}

export async function gunlukBorcSnapshotKaydet(admin: any, mevcutKayitlar?: VeriKaydi[]) {
  let kayitlar = mevcutKayitlar;
  if (!kayitlar) {
    const { data, error } = await admin.from("kv_store").select("value").eq("key", "borctakip:v1");
    if (error) throw new Error("DEBT_DATA_UNAVAILABLE");
    kayitlar = data || [];
  }
  const toplam = borcToplamlariniHesapla(kayitlar);
  const snapshot = {
    snapshot_date: istanbulTarihi(),
    participant_count: toplam.participant_count,
    total_debt: toplam.total_debt,
    cards: toplam.cards,
    loans: toplam.loans,
    overdrafts: toplam.overdrafts,
    others: toplam.others,
    updated_at: new Date().toISOString(),
  };
  const { error } = await admin.from("financial_daily_snapshots").upsert(snapshot, { onConflict: "snapshot_date" });
  if (error) throw new Error("DEBT_SNAPSHOT_FAILED");
  return snapshot;
}
