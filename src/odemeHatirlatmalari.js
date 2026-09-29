import { nativeMi } from "./platform.js";

const HATIRLATICI_TURU = "borcama-payment-reminder";

function tarihAnahtari(tarih) {
  const yerel = new Date(tarih.getTime() - tarih.getTimezoneOffset() * 60000);
  return yerel.toISOString().slice(0, 10);
}

function tarihCoz(value) {
  const eslesme = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!eslesme) return null;
  const tarih = new Date(+eslesme[1], +eslesme[2] - 1, +eslesme[3]);
  return tarih.getFullYear() === +eslesme[1] && tarih.getMonth() === +eslesme[2] - 1 &&
      tarih.getDate() === +eslesme[3]
    ? tarih
    : null;
}

function ayIcinGun(yil, ay, gun) {
  const sonGun = new Date(yil, ay + 1, 0).getDate();
  return new Date(yil, ay, Math.min(Math.max(Number(gun) || 1, 1), sonGun));
}

function sonrakiAylikTarih(gun, simdi, enErken = null) {
  const bugun = new Date(simdi.getFullYear(), simdi.getMonth(), simdi.getDate());
  let aday = ayIcinGun(simdi.getFullYear(), simdi.getMonth(), gun);
  if (aday < bugun) aday = ayIcinGun(simdi.getFullYear(), simdi.getMonth() + 1, gun);
  if (enErken && aday < enErken) aday = enErken;
  return aday;
}

function bildirimId(tarih) {
  return 910000 + Number(tarihAnahtari(tarih).replaceAll("-", "")) % 80000;
}

export function odemeHatirlaticilariniOlustur(veri, simdi = new Date()) {
  const tarihler = [];
  const bugun = new Date(simdi.getFullYear(), simdi.getMonth(), simdi.getDate());

  for (const kart of veri?.cards || []) {
    const odemeAnahtari = `kart-${kart.id}-ekstre-${kart.ekstreAyi || tarihAnahtari(simdi).slice(0, 7)}`;
    if (veri?.paid?.[odemeAnahtari]) continue;
    let vade = tarihCoz(kart.sonOdemeTarihi);
    if (!vade || vade < bugun) {
      if (!kart.sonOdemeGunu) continue;
      vade = sonrakiAylikTarih(kart.sonOdemeGunu, simdi);
    }
    tarihler.push(vade);
  }

  for (const kredi of veri?.loans || []) {
    if ((Number(kredi.kalanBorc) || 0) <= 0 || Number(kredi.kalanTaksit) === 0) continue;
    const ilkTaksit = tarihCoz(kredi.ilkOdemeTarihi);
    const gun = kredi.odemeGunu || ilkTaksit?.getDate();
    if (!gun) continue;
    let vade = sonrakiAylikTarih(gun, simdi, ilkTaksit);
    const odemeAnahtari = `kredi-${kredi.id}-${tarihAnahtari(vade).slice(0, 7)}`;
    if (veri?.paid?.[odemeAnahtari]) {
      vade = ayIcinGun(vade.getFullYear(), vade.getMonth() + 1, gun);
    }
    tarihler.push(vade);
  }

  const benzersiz = [...new Map(tarihler.map((tarih) => [tarihAnahtari(tarih), tarih])).values()];
  return benzersiz
    .map((vade) => {
      const at = new Date(vade.getFullYear(), vade.getMonth(), vade.getDate() - 1, 9, 0, 0, 0);
      if (at.getTime() <= simdi.getTime()) return null;
      return {
        id: bildirimId(vade),
        title: "Ödeme hatırlatması",
        body: "Yarın için kayıtlı ödemen var. Ayrıntıları Borcama'da kontrol et.",
        schedule: { at },
        extra: { borcamaType: HATIRLATICI_TURU, dueDate: tarihAnahtari(vade) },
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.schedule.at - b.schedule.at)
    .slice(0, 32);
}

async function eklentiyiGetir() {
  if (!nativeMi) return null;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  return LocalNotifications;
}

async function mevcutBorcamaHatirlaticilariniIptalEt(LocalNotifications) {
  const bekleyen = await LocalNotifications.getPending();
  const bildirimler = (bekleyen.notifications || [])
    .filter((bildirim) => bildirim.extra?.borcamaType === HATIRLATICI_TURU)
    .map(({ id }) => ({ id }));
  if (bildirimler.length) await LocalNotifications.cancel({ notifications: bildirimler });
}

export async function odemeHatirlaticilariniYenile(veri, aktif, izinIste = false) {
  const LocalNotifications = await eklentiyiGetir();
  if (!LocalNotifications) return { active: false, count: 0 };
  await mevcutBorcamaHatirlaticilariniIptalEt(LocalNotifications);
  if (!aktif) return { active: false, count: 0 };

  let izin = await LocalNotifications.checkPermissions();
  if (izin.display !== "granted" && izinIste) izin = await LocalNotifications.requestPermissions();
  if (izin.display !== "granted") throw new Error("NOTIFICATION_PERMISSION_DENIED");

  const notifications = odemeHatirlaticilariniOlustur(veri);
  if (notifications.length) await LocalNotifications.schedule({ notifications });
  return { active: true, count: notifications.length };
}
