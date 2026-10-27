import SwiftUI
import UIKit

// Ilk acilis kurulumu iOS'ta webview degil, SwiftUI ekranlari.
// Web tarafi akisin baslamasi gerektigine karar verir ve "baslat" mesajiyla
// metinleri (secili dilde degil, alti dilin tamami), ulke ve para birimi
// listelerini gonderir. Boylece metinlerin tek kaynagi web sozlugu kalir.
// Akis bitince sonuc web'e borcamaOnboardingBitti olayiyla doner; veri
// modeline yazma isini web yapar (onboardingSonucunuUygula).
// Bu ekranlar gercek kullanici verisi disinda tutar gostermez; karsilama
// ekranindaki ornek plan temsilidir.

// MARK: - Renkler

enum OBRenk {
    static let lime = Color(red: 0.804, green: 0.961, blue: 0.392)    // #cdf564
    static let coral = Color(red: 1.0, green: 0.435, blue: 0.349)     // #ff6f59
    static let mint = Color(red: 0.863, green: 0.914, blue: 0.890)    // #dce9e3
    static let krem = Color(red: 0.957, green: 0.937, blue: 0.878)    // #f4efe0
    static let murekkep = Color(red: 0.078, green: 0.086, blue: 0.059) // #14160f
    static let gri = Color(red: 0.36, green: 0.38, blue: 0.33)
    static let beyaz = Color.white
}

// MARK: - Girdi ve durum

struct OBUlke: Identifiable, Hashable {
    let kod: String
    let adlar: [String: String]   // dil kodu -> ulke adi
    let paraBirimi: String
    let bayrak: String
    let sik: Bool
    var id: String { kod }

    func ad(_ dil: String) -> String { adlar[dil] ?? adlar["en"] ?? kod }
}

struct OBParaBirimi: Identifiable, Hashable {
    let kod: String
    let sembol: String
    var id: String { kod }
}

struct OBBorc: Identifiable {
    let id = UUID()
    // Alanlar web'deki hizli formlarla ayni (onboardingAdimlari.js > durumdanSonuc):
    //   kart:  ad (banka), tutar (bu ayki borc), gun (son odeme gunu)
    //   kredi: ad (banka), taksit (aylik), kalanTaksit, gun (odeme gunu)
    //   kmh:   ad (banka), tutar (kullanilan)
    //   kisi:  ad (kime), tutar
    var tur: String
    var ad: String
    var tutar: Double?
    var gun: Int?
    var taksit: Double?
    var kalanTaksit: Int?

    // Bu ay odemeye giden tutar: kartta borcun tamami, kredide taksit; ek
    // hesap ve kisi borcunun sabit aylik odemesi yok.
    var buAyOdeme: Double {
        switch tur {
        case "kart": return tutar ?? 0
        case "kredi": return taksit ?? 0
        default: return 0
        }
    }

    var bakiye: Double {
        tur == "kredi" ? (taksit ?? 0) * Double(kalanTaksit ?? 0) : (tutar ?? 0)
    }
}

enum OBAdim: String, CaseIterable {
    case acilis, karsilama, dil, ulke, isim, hedef, siklik, gun, gelir, turler, borc, yasam, plan, hazir

    // Ilerleme cubugunda sayilan adimlar; acilis, karsilama ve hazir sayilmaz.
    static let numarali: [OBAdim] = [.dil, .ulke, .isim, .hedef, .siklik, .gun, .gelir, .turler, .borc, .yasam, .plan]

    var zemin: Color {
        switch self {
        case .acilis: return OBRenk.lime
        case .karsilama, .hedef, .gelir, .yasam: return OBRenk.mint
        default: return OBRenk.krem
        }
    }
}

final class OBDurum: ObservableObject {
    let metinler: [String: [String: String]]
    let ulkeler: [OBUlke]
    let paraBirimleri: [OBParaBirimi]
    let bugun: Date
    let baslangic = Date()
    var adimBaslangic = Date()

    @Published var adim: OBAdim = .acilis
    @Published var gecmis: [OBAdim] = []
    // Gecis yonu: geri gidiste ekran soldan gelir.
    var ileriYon = true
    @Published var dil: String
    @Published var ulke: String
    @Published var paraBirimi: String
    @Published var ad = ""
    @Published var hedefler: [String] = ["borc"]
    var hedef: String { hedefler.first ?? "borc" }
    // Haftalik odemede haftanin gunu (1 = pazartesi ... 7 = pazar).
    @Published var haftaGunu = 5
    @Published var siklik = "aylik"
    @Published var maasGunu = 1
    @Published var gelir: Double = 0
    @Published var borcTurleri: [String] = []
    @Published var borcYok = false
    @Published var borclar: [OBBorc] = []
    @Published var yasam: Double?
    @Published var atlanan: [String] = []
    // Karsilamada "Hesap acmadan devam et" secildiyse akis misafir olarak biter.
    var misafir = false

    var olay: (String, [String: Any]) -> Void = { _, _ in }
    var bitti: ([String: Any]) -> Void = { _ in }

    init(govde: [String: Any]) {
        metinler = govde["metinler"] as? [String: [String: String]] ?? [:]
        ulkeler = (govde["ulkeler"] as? [[String: Any]] ?? []).compactMap {
            guard let kod = $0["kod"] as? String else { return nil }
            return OBUlke(kod: kod,
                          adlar: $0["adlar"] as? [String: String] ?? [:],
                          paraBirimi: $0["paraBirimi"] as? String ?? "",
                          bayrak: $0["bayrak"] as? String ?? "",
                          sik: $0["sik"] as? Bool ?? false)
        }
        paraBirimleri = (govde["paraBirimleri"] as? [[String: Any]] ?? []).compactMap {
            guard let kod = $0["kod"] as? String else { return nil }
            return OBParaBirimi(kod: kod, sembol: $0["sembol"] as? String ?? kod)
        }
        let bicim = DateFormatter()
        bicim.dateFormat = "yyyy-MM-dd"
        bicim.locale = Locale(identifier: "en_US_POSIX")
        bugun = (govde["bugun"] as? String).flatMap { bicim.date(from: $0) } ?? Date()
        dil = govde["dil"] as? String ?? "tr"
        ulke = govde["ulke"] as? String ?? ""
        paraBirimi = govde["paraBirimi"] as? String ?? "TRY"
    }

    // MARK: Metin

    // Web sozlugune eklenene kadar yeni anahtarlarin yedegi (tr / en).
    static let yedek: [String: [String: String]] = [
        "tr": [
            "onboarding.hedef.aciklamaCoklu": "Birden fazla seçilebilir.",
            "onboarding.gun.baslikGri.ikiKez": "İlk maaş",
            "onboarding.gun.baslik.ikiKez": "hangi gün yatıyor?",
            "onboarding.gun.aciklama.ikiKez": "İkincisi 15 gün sonra sayılır.",
            "onboarding.gun.baslikGri.haftalik": "Para haftanın",
            "onboarding.gun.baslik.haftalik": "hangi günü giriyor?",
            "onboarding.gun.aciklama.haftalik": "Plan her hafta yenilenir.",
            "onboarding.gun.yankiHafta": "Bir sonraki ödeme {tarih}.",
            "onboarding.gelir.herAyOrtalama": "ayda ortalama",
        ],
        "en": [
            "onboarding.hedef.aciklamaCoklu": "You can pick more than one.",
            "onboarding.gun.baslikGri.ikiKez": "On which day",
            "onboarding.gun.baslik.ikiKez": "is your first payday?",
            "onboarding.gun.aciklama.ikiKez": "The second one counts 15 days later.",
            "onboarding.gun.baslikGri.haftalik": "Which weekday",
            "onboarding.gun.baslik.haftalik": "do you get paid?",
            "onboarding.gun.aciklama.haftalik": "Your plan renews every week.",
            "onboarding.gun.yankiHafta": "Next payment {tarih}.",
            "onboarding.gelir.herAyOrtalama": "monthly average",
        ],
    ]

    func t(_ anahtar: String, _ degerler: [String: String] = [:]) -> String {
        var metin = metinler[dil]?[anahtar] ?? OBDurum.yedek[dil]?[anahtar]
            ?? metinler["en"]?[anahtar] ?? OBDurum.yedek["en"]?[anahtar] ?? metinler["tr"]?[anahtar] ?? anahtar
        for (ad, deger) in degerler { metin = metin.replacingOccurrences(of: "{\(ad)}", with: deger) }
        return metin
    }

    var yerel: Locale { Locale(identifier: dil) }

    func tutar(_ n: Double) -> String {
        let bicim = NumberFormatter()
        bicim.numberStyle = .currency
        bicim.currencyCode = paraBirimi
        bicim.locale = yerel
        if let sembol = paraBirimleri.first(where: { $0.kod == paraBirimi })?.sembol { bicim.currencySymbol = sembol }
        bicim.maximumFractionDigits = 0
        bicim.minimumFractionDigits = 0
        return bicim.string(from: NSNumber(value: n.rounded())) ?? "\(Int(n))"
    }

    var sembol: String { paraBirimleri.first(where: { $0.kod == paraBirimi })?.sembol ?? paraBirimi }

    func tarih(_ d: Date, gunAdi: Bool = false) -> String {
        let bicim = DateFormatter()
        bicim.locale = yerel
        bicim.setLocalizedDateFormatFromTemplate(gunAdi ? "dMMMEEEE" : "dMMM")
        // Almanca "15. Nov." cumle sonunda cift nokta olmasin.
        var metin = bicim.string(from: d)
        if metin.hasSuffix(".") { metin.removeLast() }
        return metin
    }

    // MARK: Hesaplar (web'deki onboardingAdimlari.js ile ayni kurallar)

    var takvim: Calendar { var c = Calendar(identifier: .gregorian); c.timeZone = .current; return c }

    // Verilen ay gunune denk gelen bir sonraki tarih (bugun dahil). Ay o
    // gunu icermiyorsa ayin son gunu alinir (31 → 30 Kasim).
    func sonrakiTarih(gun: Int) -> Date {
        let bugunBas = takvim.startOfDay(for: bugun)
        for ekle in 0...2 {
            guard let ay = takvim.date(byAdding: .month, value: ekle, to: bugunBas),
                  let aralik = takvim.range(of: .day, in: .month, for: ay) else { continue }
            var bilesen = takvim.dateComponents([.year, .month], from: ay)
            bilesen.day = min(gun, aralik.count)
            if let aday = takvim.date(from: bilesen), aday >= bugunBas { return aday }
        }
        return bugunBas
    }

    // 1 = pazartesi ... 7 = pazar; bugun dahil bir sonraki o gun.
    func sonrakiHaftaGunu(_ gun: Int) -> Date {
        let bas = takvim.startOfDay(for: bugun)
        let bugunHafta = (takvim.component(.weekday, from: bas) + 5) % 7 + 1
        let fark = (gun - bugunHafta + 7) % 7
        return takvim.date(byAdding: .day, value: fark, to: bas) ?? bas
    }

    func haftaGunuAdi(_ gun: Int) -> String {
        let bicim = DateFormatter()
        bicim.locale = yerel
        let adlar = bicim.standaloneWeekdaySymbols ?? []
        guard adlar.count == 7 else { return "\(gun)" }
        return adlar[gun % 7].capitalized(with: yerel)
    }

    func kalanGun(_ d: Date) -> Int {
        takvim.dateComponents([.day], from: takvim.startOfDay(for: bugun), to: d).day ?? 0
    }

    var gunluk: Double { gelir / 30 }
    var buAyOdemeler: Double { borclar.reduce(0) { $0 + $1.buAyOdeme } }
    var yasamTutari: Double { yasam ?? 0 }
    var kredTaksitleri: Double { borclar.filter { $0.tur == "kredi" }.reduce(0) { $0 + ($1.taksit ?? 0) } }

    // Plan odemesi (planOdemeleri): kredi taksitleri + kartlara gelirden
    // kalanin sigan kadari (kucuk bakiyeden baslayarak); ay sonu eksiye dusmez.
    var planOdemeleri: Double {
        var guc = max(gelir - yasamTutari - kredTaksitleri, 0)
        var degisken: Double = 0
        for b in borclar.filter({ $0.tur == "kart" }).sorted(by: { $0.bakiye < $1.bakiye }) {
            let odeme = min(b.bakiye, guc)
            degisken += odeme
            guc -= odeme
        }
        return kredTaksitleri + degisken
    }

    var kalan: Double { gelir - planOdemeleri - yasamTutari }

    // Ilk bitecek borc (ilkBitecekBorc): kredi kalan taksitle biter; digerine
    // gidebilecek tutar = gelir - yasam - diger borclarin aylik odemesi.
    // Gelir yetmiyorsa ay nil.
    var ilkBitecek: (borc: OBBorc, ay: Int?)? {
        guard let ilk = borclar.first else { return nil }
        let sureler: [(OBBorc, Int?)] = borclar.map { b in
            if b.tur == "kredi" { return (b, b.kalanTaksit.flatMap { $0 > 0 ? $0 : nil }) }
            let guc = gelir - yasamTutari - kredTaksitleri
            return (b, guc > 0 && b.bakiye > 0 ? max(1, Int((b.bakiye / guc).rounded(.up))) : nil)
        }
        let bilinen = sureler.compactMap { s in s.1.map { (s.0, $0) } }
        guard let en = bilinen.min(by: { $0.1 != $1.1 ? $0.1 < $1.1 : $0.0.bakiye < $1.0.bakiye }) else { return (ilk, nil) }
        return (en.0, en.1)
    }

    // En yakin odeme: kartta son odeme gunu, kredide taksit gunu.
    var ilkOdeme: (borc: OBBorc, tarih: Date)? {
        borclar.filter { ($0.tur == "kart" || $0.tur == "kredi") && $0.gun != nil }
            .map { ($0, sonrakiTarih(gun: $0.gun!)) }
            .min { $0.1 < $1.1 }
    }

    // MARK: Gezinme

    var siradakiler: [OBAdim] {
        OBAdim.allCases.filter { a in
            if a == .borc && borcYok { return false }
            if a == .gun && siklik == "duzensiz" { return false }
            return true
        }
    }

    var numaralilar: [OBAdim] { OBAdim.numarali.filter { siradakiler.contains($0) } }

    func ileri(atlandi: Bool = false) {
        let simdiki = adim
        let sure = Int(Date().timeIntervalSince(adimBaslangic) * 1000)
        if OBAdim.numarali.contains(simdiki) {
            olay(atlandi ? "onboarding_atla" : "onboarding_adim", ["adim": simdiki.rawValue, "sure_ms": sure])
            if atlandi, !atlanan.contains(simdiki.rawValue) { atlanan.append(simdiki.rawValue) }
            // Yasam atlanirsa onerilen %45 yazilmaz; plan "girilmedi" gosterir.
            if atlandi, simdiki == .yasam { yasam = nil }
        }
        guard let sira = siradakiler.firstIndex(of: simdiki), sira + 1 < siradakiler.count else {
            bitir(cikis: misafir ? "misafir" : "tamam")
            return
        }
        gecmis.append(simdiki)
        ileriYon = true
        adimBaslangic = Date()
        adim = siradakiler[sira + 1]
    }

    func geri() {
        guard let onceki = gecmis.popLast() else { return }
        ileriYon = false
        adimBaslangic = Date()
        adim = onceki
    }

    func bitir(cikis: String) {
        let govde: [String: Any] = [
            "cikis": cikis,
            "dil": dil,
            "ulke": ulke,
            "paraBirimi": paraBirimi,
            "ad": ad.trimmingCharacters(in: .whitespacesAndNewlines),
            "hedef": hedef,
            "hedefler": hedefler,
            "maasHaftaGunu": haftaGunu,
            "siklik": siklik,
            "maasGunu": maasGunu,
            "gelir": gelir,
            "borcTurleri": borcYok ? [] : borcTurleri,
            "borclar": borclar.map { b -> [String: Any] in
                var d: [String: Any] = ["tur": b.tur, "ad": b.ad]
                if let tutar = b.tutar { d["tutar"] = tutar }
                if let gun = b.gun { d["gun"] = gun }
                if let taksit = b.taksit { d["taksit"] = taksit }
                if let kalan = b.kalanTaksit { d["kalanTaksit"] = kalan }
                return d
            },
            "yasam": yasam.map { $0 as Any } ?? NSNull(),
            "atlanan": atlanan,
            "sure_ms": Int(Date().timeIntervalSince(baslangic) * 1000),
        ]
        bitti(govde)
    }
}

// MARK: - Ortak parcalar

private func dokunusTitresimi() {
    UISelectionFeedbackGenerator().selectionChanged()
}

struct OBDugme: View {
    let baslik: String
    var etkin = true
    let eylem: () -> Void

    var body: some View {
        Button(action: {
            UIImpactFeedbackGenerator(style: .medium).impactOccurred()
            eylem()
        }) {
            Text(baslik)
                .font(.system(size: 17, weight: .bold))
                .foregroundColor(OBRenk.murekkep)
                .frame(maxWidth: .infinity)
                .frame(height: 54)
                .background(
                    ZStack {
                        if etkin { RoundedRectangle(cornerRadius: 27).fill(OBRenk.coral).offset(x: 0, y: 4) }
                        RoundedRectangle(cornerRadius: 27).fill(etkin ? OBRenk.lime : OBRenk.beyaz)
                        RoundedRectangle(cornerRadius: 27).strokeBorder(OBRenk.murekkep, lineWidth: 1.5)
                    }
                )
        }
        .buttonStyle(.plain)
        .disabled(!etkin)
        .opacity(etkin ? 1 : 0.5)
    }
}

// Tek veya coklu secim satiri: secili olan lime zemin + coral blok golge.
struct OBSecenek: View {
    let baslik: String
    var sag: String? = nil
    var solSimge: String? = nil
    let secili: Bool
    let eylem: () -> Void

    var body: some View {
        Button(action: { dokunusTitresimi(); eylem() }) {
            HStack(spacing: 10) {
                if let solSimge { Text(solSimge).font(.system(size: 18)) }
                Text(baslik).font(.system(size: 16, weight: .semibold)).foregroundColor(OBRenk.murekkep)
                if secili {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 20))
                        .foregroundColor(OBRenk.murekkep)
                }
                Spacer()
                if let sag {
                    Text(sag).font(.system(size: 12, weight: .medium, design: .monospaced)).foregroundColor(OBRenk.gri)
                }
            }
            .padding(.horizontal, 16)
            .frame(minHeight: 52)
            .background(
                ZStack {
                    if secili { RoundedRectangle(cornerRadius: 14).fill(OBRenk.coral).offset(x: 0, y: 3) }
                    RoundedRectangle(cornerRadius: 14).fill(secili ? OBRenk.lime : OBRenk.beyaz)
                    RoundedRectangle(cornerRadius: 14).strokeBorder(OBRenk.murekkep, lineWidth: secili ? 1.5 : 1)
                }
            )
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(secili ? .isSelected : [])
    }
}

struct OBCip: View {
    let baslik: String
    let secili: Bool
    let eylem: () -> Void

    var body: some View {
        Button(action: { dokunusTitresimi(); eylem() }) {
            Text(baslik)
                .font(.system(size: 14, weight: .semibold, design: .monospaced))
                .foregroundColor(OBRenk.murekkep)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
                .fixedSize(horizontal: true, vertical: false)
                .padding(.horizontal, 14)
                .frame(height: 38)
                .background(Capsule().fill(secili ? OBRenk.coral : OBRenk.beyaz))
                .overlay(Capsule().strokeBorder(OBRenk.murekkep, lineWidth: 1))
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(secili ? .isSelected : [])
    }
}

// Yanit satiri: vurgulu tutar lime zemin uzerinde.
struct OBYanki: View {
    let parcalar: [(String, Bool)]

    var body: some View {
        parcalar.reduce(Text("")) { toplam, parca in
            // Rakamla baslayan vurgu (tutar) mono, digerleri (tarih, ad) kalin.
            let tutarMi = parca.0.contains(where: { $0.isNumber }) && !parca.0.contains(where: { $0.isLetter })
            return toplam + (parca.1
                ? Text(parca.0).font(.system(size: 16, weight: .bold, design: tutarMi ? .monospaced : .default))
                : Text(parca.0).font(.system(size: 16, weight: .medium)))
        }
        .foregroundColor(OBRenk.murekkep)
        .fixedSize(horizontal: false, vertical: true)
    }
}

// "{tutar}" gibi yer tutuculari vurgulu parcaya cevirir.
func obParcala(_ sablon: String, _ degerler: [String: String]) -> [(String, Bool)] {
    var sonuc: [(String, Bool)] = []
    var kalan = Substring(sablon)
    while let ac = kalan.firstIndex(of: "{"), let kapa = kalan[ac...].firstIndex(of: "}") {
        if ac > kalan.startIndex { sonuc.append((String(kalan[..<ac]), false)) }
        let ad = String(kalan[kalan.index(after: ac)..<kapa])
        sonuc.append((degerler[ad] ?? "", true))
        kalan = kalan[kalan.index(after: kapa)...]
    }
    if !kalan.isEmpty { sonuc.append((String(kalan), false)) }
    return sonuc
}

struct OBUstBar: View {
    @ObservedObject var d: OBDurum

    var body: some View {
        let liste = d.numaralilar
        let sira = liste.firstIndex(of: d.adim) ?? 0
        HStack(spacing: 12) {
            Button(action: { d.geri() }) {
                Image(systemName: "chevron.left")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(OBRenk.murekkep)
                    .frame(width: 34, height: 34)
                    .background(Circle().fill(OBRenk.beyaz))
                    .overlay(Circle().strokeBorder(OBRenk.murekkep, lineWidth: 1.2))
            }
            .accessibilityLabel(d.t("onboarding.geri"))
            HStack(spacing: 4) {
                ForEach(liste.indices, id: \.self) { i in
                    RoundedRectangle(cornerRadius: 3)
                        .fill(i < sira ? OBRenk.murekkep : (i == sira ? OBRenk.coral : OBRenk.beyaz))
                        .overlay(RoundedRectangle(cornerRadius: 3).strokeBorder(OBRenk.murekkep, lineWidth: i < sira ? 0 : 1))
                        .frame(height: 6)
                        .offset(y: i == sira ? 3 : 0)
                }
            }
            .accessibilityHidden(true)
        }
    }
}

// Iki tonlu baslik: gri giris + murekkep vurgu.
struct OBBaslik: View {
    let gri: String
    let vurgu: String

    var body: some View {
        (Text(gri.isEmpty ? "" : gri + " ").foregroundColor(OBRenk.gri) + Text(vurgu).foregroundColor(OBRenk.murekkep))
            .font(.system(size: 28, weight: .bold))
            .fixedSize(horizontal: false, vertical: true)
            .accessibilityAddTraits(.isHeader)
    }
}

// Numarali adimlarin ortak kabugu: ust cubuk, ADIM n/N, baslik, aciklama,
// icerik ve altta tek dugme.
struct OBKabuk<Icerik: View>: View {
    @ObservedObject var d: OBDurum
    let anahtar: String
    var dugme: String? = nil
    var dugmeEtkin = true
    var atlanabilir = false
    var dugmeEylemi: (() -> Void)? = nil
    var griAnahtari: String? = nil
    var baslikAnahtari: String? = nil
    var aciklamaAnahtari: String? = nil
    // Dil adiminda baslik bir/iki satir arasinda degisince icerik kaymasin.
    var baslikYuksekligi: CGFloat? = nil
    @ViewBuilder let icerik: () -> Icerik

    var body: some View {
        let liste = d.numaralilar
        let sira = (liste.firstIndex(of: d.adim) ?? 0) + 1
        VStack(alignment: .leading, spacing: 0) {
            OBUstBar(d: d).padding(.top, 8).padding(.horizontal, 20)
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        Text(d.t("onboarding.adimEtiketi", ["n": "\(sira)", "toplam": "\(liste.count)"]))
                            .font(.system(size: 12, weight: .semibold, design: .monospaced))
                            .foregroundColor(OBRenk.gri)
                        Spacer()
                        if atlanabilir {
                            Button(d.t("onboarding.atla")) { d.ileri(atlandi: true) }
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(OBRenk.murekkep)
                        }
                    }
                    .padding(.top, 22)
                    OBBaslik(gri: d.t(griAnahtari ?? "onboarding.\(anahtar).baslikGri"), vurgu: d.t(baslikAnahtari ?? "onboarding.\(anahtar).baslik"))
                        .frame(minHeight: baslikYuksekligi, alignment: .topLeading)
                    Text(d.t(aciklamaAnahtari ?? "onboarding.\(anahtar).aciklama"))
                        .font(.system(size: 14))
                        .foregroundColor(OBRenk.gri)
                        .padding(.bottom, 16)
                    icerik()
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 24)
            }
            OBDugme(baslik: dugme ?? d.t("onboarding.devam"), etkin: dugmeEtkin) {
                if let dugmeEylemi { dugmeEylemi() } else { d.ileri() }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 12)
        }
    }
}

// MARK: - Ekranlar

struct OBAcilis: View {
    @ObservedObject var d: OBDurum

    var body: some View {
        GeometryReader { g in
            ZStack {
                OBRenk.lime
                Circle().fill(OBRenk.coral)
                    .overlay(Circle().strokeBorder(OBRenk.murekkep, lineWidth: 1))
                    .frame(width: g.size.width * 0.75)
                    .position(x: g.size.width * 0.95, y: g.size.height * 0.2)
                Circle().fill(OBRenk.mint)
                    .overlay(Circle().strokeBorder(OBRenk.murekkep, lineWidth: 1))
                    .frame(width: g.size.width * 0.6)
                    .position(x: g.size.width * 0.05, y: g.size.height * 0.98)
                VStack(spacing: 14) {
                    if let logo = UIImage(named: "BorcamaLogo") {
                        Image(uiImage: logo).resizable().scaledToFit().frame(width: 200)
                    } else {
                        Text("Borcama").font(.system(size: 40, weight: .black))
                    }
                    Text(d.t("onboarding.acilis.slogan"))
                        .font(.system(size: 14, weight: .medium, design: .monospaced))
                        .foregroundColor(OBRenk.murekkep)
                }
            }
        }
        .ignoresSafeArea()
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                if d.adim == .acilis { withAnimation(.easeInOut(duration: 0.35)) { d.ileri() } }
            }
        }
    }
}

struct OBKarsilama: View {
    @ObservedObject var d: OBDurum

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                if let logo = UIImage(named: "BorcamaLogo") {
                    Image(uiImage: logo).resizable().scaledToFit().frame(height: 26)
                } else {
                    Text("Borcama").font(.system(size: 22, weight: .black))
                }
                Spacer()
                // Dil ve para birimi cipi: dokununca dil adimina gider.
                Button(action: { d.ileri() }) {
                    Text("\(d.dil.uppercased()) · \(d.sembol)")
                        .font(.system(size: 12, weight: .semibold, design: .monospaced))
                        .foregroundColor(OBRenk.murekkep)
                        .padding(.horizontal, 12)
                        .frame(height: 28)
                        .background(Capsule().fill(OBRenk.beyaz))
                        .overlay(Capsule().strokeBorder(OBRenk.murekkep, lineWidth: 1))
                }
                .accessibilityLabel(d.t("onboarding.dil.baslikGri") + " " + d.t("onboarding.dil.baslik"))
            }
            .padding(.top, 12)
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 14) {
                    OBBaslik(gri: d.t("onboarding.karsilama.baslikGri"), vurgu: d.t("onboarding.karsilama.baslik"))
                        .padding(.top, 28)
                    Text(d.t("onboarding.karsilama.aciklama"))
                        .font(.system(size: 14))
                        .foregroundColor(OBRenk.gri)
                    OBPlanKarti(d: d,
                                etiket: d.t("onboarding.karsilama.ornekEtiket"),
                                tutar: d.tutar(OBOrnek.kalan(d.paraBirimi)),
                                alt: d.t("onboarding.karsilama.ornekAlt"),
                                oranlar: [0.2, 0.45, 0.35])
                        .accessibilityElement(children: .combine)
                    HStack(spacing: 10) {
                        OBSayac(etiket: d.t("onboarding.karsilama.sonOdeme"), deger: "19", birim: d.t("onboarding.karsilama.gun"), vurgulu: true)
                        OBSayac(etiket: d.t("onboarding.karsilama.borcBitisi"), deger: "4", birim: d.t("onboarding.karsilama.ay"), vurgulu: false)
                    }
                    .accessibilityHidden(true)
                }
            }
            OBDugme(baslik: d.t("onboarding.karsilama.basla")) { d.misafir = false; d.ileri() }
            HStack(spacing: 18) {
                Button(action: { d.bitir(cikis: "giris") }) {
                    Text(d.t("onboarding.karsilama.hesabimVar")).underline()
                }
                // Hesapsiz kullanim: ayni kurulum akisi, sonunda kayit yerine
                // veriler cihazda kalir.
                Button(action: { d.misafir = true; d.ileri() }) {
                    Text(d.t("onboarding.karar.misafir")).underline()
                }
            }
            .font(.system(size: 14, weight: .semibold))
            .foregroundColor(OBRenk.murekkep)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
        }
        .padding(.horizontal, 20)
    }
}

// Karsilama ornegi yalniz temsilidir; TRY icin yazilip diger birimlere kabaca olceklenir.
enum OBOrnek {
    static func kalan(_ birim: String) -> Double {
        switch birim {
        case "TRY": return 26000
        case "JPY": return 90000
        case "INR", "RUB": return 55000
        default: return 650
        }
    }
}

struct OBPlanKarti: View {
    @ObservedObject var d: OBDurum
    let etiket: String
    let tutar: String
    let alt: String
    let oranlar: [Double]

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(etiket.uppercased())
                .font(.system(size: 11, weight: .bold, design: .monospaced))
                .foregroundColor(OBRenk.murekkep)
            Text(tutar)
                .font(.system(size: 34, weight: .bold, design: .monospaced))
                .foregroundColor(OBRenk.murekkep)
                .minimumScaleFactor(0.6)
                .lineLimit(1)
            Text(alt).font(.system(size: 13)).foregroundColor(OBRenk.murekkep)
                .fixedSize(horizontal: false, vertical: true)
            GeometryReader { g in
                HStack(spacing: 3) {
                    let renkler = [OBRenk.murekkep, OBRenk.beyaz, OBRenk.lime]
                    ForEach(oranlar.indices, id: \.self) { i in
                        Capsule().fill(renkler[i % 3])
                            .overlay(Capsule().strokeBorder(OBRenk.murekkep, lineWidth: 1))
                            .frame(width: max(8, (g.size.width - 6) * oranlar[i]))
                    }
                }
            }
            .frame(height: 8)
        }
        .padding(16)
        .background(
            ZStack {
                RoundedRectangle(cornerRadius: 16).fill(OBRenk.lime).offset(x: 0, y: 4)
                RoundedRectangle(cornerRadius: 16).fill(OBRenk.coral)
                RoundedRectangle(cornerRadius: 16).strokeBorder(OBRenk.murekkep, lineWidth: 1.5)
            }
        )
    }
}

struct OBSayac: View {
    let etiket: String
    let deger: String
    let birim: String
    let vurgulu: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(etiket.uppercased())
                .font(.system(size: 10, weight: .bold, design: .monospaced))
                .foregroundColor(OBRenk.gri)
            HStack(spacing: 6) {
                Text(deger)
                    .font(.system(size: 20, weight: .bold, design: .monospaced))
                    .padding(.horizontal, vurgulu ? 6 : 0)
                    .background(vurgulu ? RoundedRectangle(cornerRadius: 6).fill(OBRenk.coral) : nil)
                Text(birim).font(.system(size: 18, weight: .medium))
            }
            .foregroundColor(OBRenk.murekkep)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(RoundedRectangle(cornerRadius: 14).fill(OBRenk.beyaz))
        .overlay(RoundedRectangle(cornerRadius: 14).strokeBorder(OBRenk.murekkep, lineWidth: 1))
    }
}

struct OBDil: View {
    @ObservedObject var d: OBDurum
    let diller: [(String, String, String)] = [
        ("tr", "Türkçe", "🇹🇷"), ("en", "English", "🇬🇧"), ("de", "Deutsch", "🇩🇪"),
        ("fr", "Français", "🇫🇷"), ("es", "Español", "🇪🇸"), ("it", "Italiano", "🇮🇹"),
    ]

    var body: some View {
        OBKabuk(d: d, anahtar: "dil", baslikYuksekligi: 76) {
            VStack(spacing: 10) {
                ForEach(diller, id: \.0) { kod, ad, bayrak in
                    OBSecenek(baslik: ad, sag: kod.uppercased(), solSimge: bayrak, secili: d.dil == kod) {
                        // Metinler yeni dile animasyonsuz gecer; aksi halde
                        // satirlar kayip yeniden yerlesiyordu.
                        var islem = Transaction()
                        islem.disablesAnimations = true
                        withTransaction(islem) { d.dil = kod }
                        d.olay("dil", ["dil": kod])
                    }
                }
            }
        }
    }
}

struct OBUlkeEkrani: View {
    @ObservedObject var d: OBDurum
    @State private var tumUlkeler = false
    @State private var tumParalar = false
    @State private var oneCikanlar: [OBUlke] = []

    // Dil sayisi kadar (6) ulke: her dilin ulkesi; tespit edilen ulke bunlarin
    // disindaysa basa eklenir. Sira acilista bir kez kurulur; secim yapinca
    // satirlar yer degistirmez.
    func oneCikanlariKur() {
        guard oneCikanlar.isEmpty else { return }
        let dilUlkeleri = ["TR", "GB", "DE", "FR", "ES", "IT"]
        var kodlar = dilUlkeleri
        if !d.ulke.isEmpty, !kodlar.contains(d.ulke) { kodlar = [d.ulke] + kodlar.prefix(5) }
        oneCikanlar = kodlar.compactMap { kod in d.ulkeler.first { $0.kod == kod } }
    }

    // Tam liste secili dilde alfabetik.
    var tumu: [OBUlke] {
        d.ulkeler.sorted { $0.ad(d.dil).compare($1.ad(d.dil), locale: d.yerel) == .orderedAscending }
    }

    var body: some View {
        OBKabuk(d: d, anahtar: "ulke", dugmeEtkin: !d.ulke.isEmpty) {
            Color.clear.frame(height: 0).onAppear { oneCikanlariKur() }
            VStack(spacing: 10) {
                ForEach(tumUlkeler ? tumu : oneCikanlar) { u in
                    OBSecenek(baslik: u.ad(d.dil), sag: "\(u.paraBirimi) \(sembol(u.paraBirimi))", solSimge: u.bayrak, secili: d.ulke == u.kod) {
                        d.ulke = u.kod
                        if !u.paraBirimi.isEmpty { d.paraBirimi = u.paraBirimi }
                    }
                }
                if !tumUlkeler {
                    OBSatirBaglanti(baslik: d.t("onboarding.ulke.baskaUlke")) { tumUlkeler = true }
                }
                OBSatirBaglanti(baslik: d.t("onboarding.ulke.baskaPara", ["kod": "\(d.paraBirimi) \(d.sembol)"])) {
                    tumParalar.toggle()
                }
                if tumParalar {
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 84), spacing: 8)], spacing: 8) {
                        ForEach(d.paraBirimleri) { p in
                            OBCip(baslik: "\(p.kod) \(p.sembol)", secili: d.paraBirimi == p.kod) { d.paraBirimi = p.kod }
                        }
                    }
                }
            }
        }
    }

    func sembol(_ kod: String) -> String { d.paraBirimleri.first(where: { $0.kod == kod })?.sembol ?? "" }
}

struct OBSatirBaglanti: View {
    let baslik: String
    let eylem: () -> Void

    var body: some View {
        Button(action: eylem) {
            HStack {
                Text(baslik).font(.system(size: 14, weight: .semibold))
                Spacer()
                Image(systemName: "chevron.right").font(.system(size: 12, weight: .bold))
            }
            .foregroundColor(OBRenk.murekkep)
            .padding(.vertical, 12)
            .overlay(Rectangle().fill(OBRenk.murekkep.opacity(0.15)).frame(height: 1), alignment: .bottom)
        }
        .buttonStyle(.plain)
    }
}

struct OBIsim: View {
    @ObservedObject var d: OBDurum
    @FocusState private var odak: Bool

    var body: some View {
        OBKabuk(d: d, anahtar: "isim", atlanabilir: true) {
            TextField(d.t("onboarding.isim.yerTutucu"), text: $d.ad)
                .font(.system(size: 22, weight: .semibold))
                .foregroundColor(OBRenk.murekkep)
                .textContentType(.givenName)
                .submitLabel(.next)
                .focused($odak)
                .padding(16)
                .background(RoundedRectangle(cornerRadius: 14).fill(OBRenk.beyaz))
                .overlay(RoundedRectangle(cornerRadius: 14).strokeBorder(OBRenk.murekkep, lineWidth: 1.2))
                .onSubmit { d.ileri() }
                .onAppear { DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { odak = true } }
        }
    }
}

struct OBTekSecim: View {
    @ObservedObject var d: OBDurum
    let anahtar: String
    let secenekler: [String]
    var sagNotlar: [String: String] = [:]
    let secili: String
    let sec: (String) -> Void

    var body: some View {
        OBKabuk(d: d, anahtar: anahtar) {
            VStack(spacing: 10) {
                ForEach(secenekler, id: \.self) { s in
                    OBSecenek(baslik: d.t("onboarding.\(anahtar).\(s)"),
                              sag: sagNotlar[s].map { d.t($0) },
                              secili: secili == s) { sec(s) }
                }
            }
        }
    }
}

struct OBMaasGunu: View {
    @ObservedObject var d: OBDurum

    var body: some View {
        if d.siklik == "haftalik" { OBHaftaGunu(d: d) } else { OBAyGunu(d: d) }
    }
}

// Ayda bir / ayda iki: ayin gunu. Ayda ikide ilk maas sorulur.
struct OBAyGunu: View {
    @ObservedObject var d: OBDurum

    var body: some View {
        let sonraki = d.sonrakiTarih(gun: d.maasGunu)
        let kalan = d.kalanGun(sonraki)
        let ek = d.siklik == "ikiKez" ? ".ikiKez" : ""
        OBKabuk(d: d, anahtar: "gun",
                griAnahtari: "onboarding.gun.baslikGri" + ek,
                baslikAnahtari: "onboarding.gun.baslik" + ek,
                aciklamaAnahtari: "onboarding.gun.aciklama" + ek) {
            ScrollViewReader { kaydir in
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(1...31, id: \.self) { gun in
                            Button(action: { dokunusTitresimi(); d.maasGunu = gun }) {
                                Text("\(gun)")
                                    .font(.system(size: 15, weight: .semibold, design: .monospaced))
                                    .foregroundColor(OBRenk.murekkep)
                                    .frame(width: 44, height: 44)
                                    .background(Circle().fill(d.maasGunu == gun ? OBRenk.coral : OBRenk.beyaz))
                                    .overlay(Circle().strokeBorder(OBRenk.murekkep, lineWidth: 1))
                            }
                            .buttonStyle(.plain)
                            .id(gun)
                            .accessibilityAddTraits(d.maasGunu == gun ? .isSelected : [])
                        }
                    }
                    .padding(.vertical, 4)
                }
                .onAppear { kaydir.scrollTo(d.maasGunu, anchor: .center) }
            }
            OBYanki(parcalar: obParcala(d.t("onboarding.gun.yanki"), ["tarih": d.tarih(sonraki, gunAdi: true)]))
                .padding(.top, 14)
            Text(kalan == 0 ? d.t("onboarding.gun.bugun") : d.t("onboarding.gun.kalan", ["gun": "\(kalan)"]))
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(OBRenk.murekkep)
        }
    }
}

// Haftada bir: haftanin gunu (pazartesiden baslar).
struct OBHaftaGunu: View {
    @ObservedObject var d: OBDurum

    var body: some View {
        let sonraki = d.sonrakiHaftaGunu(d.haftaGunu)
        let kalan = d.kalanGun(sonraki)
        OBKabuk(d: d, anahtar: "gun",
                griAnahtari: "onboarding.gun.baslikGri.haftalik",
                baslikAnahtari: "onboarding.gun.baslik.haftalik",
                aciklamaAnahtari: "onboarding.gun.aciklama.haftalik") {
            VStack(spacing: 10) {
                ForEach(1...7, id: \.self) { gun in
                    OBSecenek(baslik: d.haftaGunuAdi(gun), secili: d.haftaGunu == gun) { d.haftaGunu = gun }
                }
            }
            OBYanki(parcalar: obParcala(d.t("onboarding.gun.yankiHafta"), ["tarih": d.tarih(sonraki, gunAdi: true)]))
                .padding(.top, 14)
            Text(kalan == 0 ? d.t("onboarding.gun.bugun") : d.t("onboarding.gun.kalan", ["gun": "\(kalan)"]))
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(OBRenk.murekkep)
        }
    }
}

// Hedef: birden fazla secilebilir; en az biri secili kalir.
struct OBHedef: View {
    @ObservedObject var d: OBDurum
    let secenekler = ["borc", "aySonu", "kontrol"]

    var body: some View {
        OBKabuk(d: d, anahtar: "hedef", dugmeEtkin: !d.hedefler.isEmpty,
                aciklamaAnahtari: "onboarding.hedef.aciklamaCoklu") {
            VStack(spacing: 10) {
                ForEach(secenekler, id: \.self) { s in
                    OBSecenek(baslik: d.t("onboarding.hedef.\(s)"), secili: d.hedefler.contains(s)) {
                        if let i = d.hedefler.firstIndex(of: s) { d.hedefler.remove(at: i) } else { d.hedefler.append(s) }
                    }
                }
            }
        }
    }
}

// Tutar alani: yalniz rakam ve ondalik ayrac; dil ayracina gore okunur.
func obSayi(_ metin: String, _ yerel: Locale) -> Double {
    let ayrac = yerel.decimalSeparator ?? ","
    var temiz = ""
    for k in metin {
        if k.isNumber { temiz.append(k) } else if String(k) == ayrac { temiz.append(".") }
    }
    return Double(temiz) ?? 0
}

struct OBTutarAlani: View {
    @ObservedObject var d: OBDurum
    let etiket: String
    @Binding var metin: String
    var buyuk = false
    var odakla = false

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            if !etiket.isEmpty {
                Text(etiket.uppercased())
                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                    .foregroundColor(OBRenk.gri)
            }
            HStack(spacing: 4) {
                Text(d.sembol)
                    .font(.system(size: buyuk ? 44 : 20, weight: .bold, design: .monospaced))
                    .foregroundColor(OBRenk.murekkep)
                OBTutarGirdisi(metin: $metin, yerel: d.yerel, boyut: buyuk ? 44 : 20, odakla: odakla)
                    .frame(height: buyuk ? 56 : 28)
            }
        }
        .padding(buyuk ? 0 : 12)
        .background(buyuk ? nil : RoundedRectangle(cornerRadius: 14).fill(OBRenk.beyaz))
        .overlay(buyuk ? nil : RoundedRectangle(cornerRadius: 14).strokeBorder(OBRenk.murekkep, lineWidth: 1.2))
    }
}

// Tutar girdisi UITextField ile: her tus vurusunda ham deger (rakam + en
// fazla bir ondalik ayrac) hesaplanir, alan binlik ayracli bicimle yeniden
// yazilir ve imlec sona alinir. SwiftUI TextField'da bicimi geri yazmak hizli
// yazarken tus kaybettiriyordu.
struct OBTutarGirdisi: UIViewRepresentable {
    @Binding var metin: String   // ham: "12500" ya da "12,5"
    let yerel: Locale
    let boyut: CGFloat
    var odakla = false

    func makeCoordinator() -> Koordinator { Koordinator(self) }

    func makeUIView(context: Context) -> UITextField {
        let alan = UITextField()
        alan.keyboardType = .decimalPad
        alan.font = UIFont.monospacedSystemFont(ofSize: boyut, weight: .bold)
        alan.textColor = UIColor(red: 0.078, green: 0.086, blue: 0.059, alpha: 1)
        alan.placeholder = "0"
        alan.delegate = context.coordinator
        alan.setContentHuggingPriority(.defaultLow, for: .horizontal)
        alan.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)
        alan.text = context.coordinator.bicimle(metin)
        if odakla {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.45) { alan.becomeFirstResponder() }
        }
        return alan
    }

    func updateUIView(_ alan: UITextField, context: Context) {
        context.coordinator.ust = self
        let beklenen = context.coordinator.bicimle(metin)
        if alan.text != beklenen { alan.text = beklenen }
    }

    final class Koordinator: NSObject, UITextFieldDelegate {
        var ust: OBTutarGirdisi
        init(_ ust: OBTutarGirdisi) { self.ust = ust }

        var ayrac: String { ust.yerel.decimalSeparator ?? "," }

        func textField(_ alan: UITextField, shouldChangeCharactersIn aralik: NSRange,
                       replacementString ek: String) -> Bool {
            let eski = alan.text ?? ""
            guard let r = Range(aralik, in: eski) else { return false }
            // Nokta tusu ondalik ayraca cevrilir (Turkce klavyede virgul).
            let girdi = ek == "." || ek == "," ? ayrac : ek
            let yeni = eski.replacingCharacters(in: r, with: girdi)
            let ham = temizle(yeni)
            alan.text = bicimle(ham)
            if let son = alan.position(from: alan.endOfDocument, offset: 0) {
                alan.selectedTextRange = alan.textRange(from: son, to: son)
            }
            ust.metin = ham
            return false
        }

        // Rakamlar ve en fazla bir ondalik ayrac (2 hane); binlik ayraclar atilir.
        func temizle(_ girdi: String) -> String {
            var tam = "", kesir: String? = nil
            for k in girdi {
                if k.isNumber {
                    if kesir != nil { if kesir!.count < 2 { kesir!.append(k) } } else { tam.append(k) }
                } else if String(k) == ayrac, kesir == nil {
                    kesir = ""
                }
            }
            tam = String(tam.drop(while: { $0 == "0" }).prefix(12))
            if let kesir { return (tam.isEmpty ? "0" : tam) + ayrac + kesir }
            return tam
        }

        func bicimle(_ ham: String) -> String {
            guard !ham.isEmpty else { return "" }
            let parcalar = ham.components(separatedBy: ayrac)
            let bicim = NumberFormatter()
            bicim.numberStyle = .decimal
            bicim.locale = ust.yerel
            bicim.maximumFractionDigits = 0
            let tam = bicim.string(from: NSNumber(value: Double(parcalar[0]) ?? 0)) ?? parcalar[0]
            return parcalar.count > 1 ? tam + ayrac + parcalar[1] : tam
        }
    }
}

struct OBGelir: View {
    @ObservedObject var d: OBDurum
    @State private var metin = ""

    var body: some View {
        OBKabuk(d: d, anahtar: "gelir", dugmeEtkin: d.gelir > 0) {
            OBTutarAlani(d: d, etiket: "", metin: $metin, buyuk: true, odakla: true)
                .onChange(of: metin) { yeni in d.gelir = obSayi(yeni, d.yerel) }
            Text(d.t(d.siklik == "aylik" ? "onboarding.gelir.herAy" : "onboarding.gelir.herAyOrtalama")).font(.system(size: 13)).foregroundColor(OBRenk.gri)
            if d.gelir > 0 {
                OBYanki(parcalar: obParcala(d.t("onboarding.gelir.yanki"), ["tutar": d.tutar(d.gunluk)]))
                    .padding(.top, 14)
            }
        }
        .onAppear { if d.gelir > 0 && metin.isEmpty { metin = String(Int(d.gelir)) } }
    }
}

struct OBTurler: View {
    @ObservedObject var d: OBDurum
    let turler = ["kart", "kredi", "kmh", "kisi"]

    var body: some View {
        let sayi = d.borcTurleri.count
        OBKabuk(d: d, anahtar: "turler",
                dugme: sayi > 1 ? d.t("onboarding.turler.dugme", ["n": "\(sayi)"]) : d.t("onboarding.devam"),
                dugmeEtkin: sayi > 0) {
            VStack(spacing: 10) {
                ForEach(turler, id: \.self) { tur in
                    OBSecenek(baslik: d.t("onboarding.turler.\(tur)"), secili: d.borcTurleri.contains(tur)) {
                        if let i = d.borcTurleri.firstIndex(of: tur) { d.borcTurleri.remove(at: i) } else { d.borcTurleri.append(tur) }
                    }
                }
                OBSatirBaglanti(baslik: d.t("onboarding.turler.yok")) {
                    d.borcTurleri = []
                    d.borclar = []
                    d.borcYok = true
                    d.ileri()
                }
            }
        }
        .onAppear { d.borcYok = false }
    }
}

struct OBBorcEkrani: View {
    @ObservedObject var d: OBDurum
    @State private var tur = "kart"
    @State private var ad = ""
    @State private var tutar = ""
    @State private var gun = ""
    @State private var taksit = ""
    @State private var kalanTaksit = ""

    // Gecerlilik web'deki borcGecerli ile ayni: ad her turde zorunlu; kartta
    // tutar + gun, kredide taksit + kalan taksit + gun, digerlerinde tutar.
    var taslak: OBBorc? {
        let temizAd = ad.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !temizAd.isEmpty else { return nil }
        let gunSayi = Int(gun).flatMap { (1...31).contains($0) ? $0 : nil }
        let n = obSayi(tutar, d.yerel)
        switch tur {
        case "kredi":
            let t = obSayi(taksit, d.yerel)
            guard t > 0, let k = Int(kalanTaksit), k >= 1, let g = gunSayi else { return nil }
            return OBBorc(tur: tur, ad: temizAd, gun: g, taksit: t, kalanTaksit: k)
        case "kart":
            guard n > 0, let g = gunSayi else { return nil }
            return OBBorc(tur: tur, ad: temizAd, tutar: n, gun: g)
        default:
            guard n > 0 else { return nil }
            return OBBorc(tur: tur, ad: temizAd, tutar: n)
        }
    }

    func kaydet() {
        guard let b = taslak else { return }
        d.borclar.append(b)
        ad = ""; tutar = ""; gun = ""; taksit = ""; kalanTaksit = ""
    }

    var body: some View {
        let toplam = d.buAyOdemeler + (taslak?.buAyOdeme ?? 0)
        // Atlanabilir: o ana kadar eklenen borclar kalir, yoksa borcsuz devam.
        OBKabuk(d: d, anahtar: "borc",
                dugme: d.t("onboarding.borc.dugme"),
                dugmeEtkin: taslak != nil || !d.borclar.isEmpty,
                atlanabilir: true,
                dugmeEylemi: { kaydet(); d.ileri() },
                baslikAnahtari: "onboarding.borc.baslik.\(tur)",
                aciklamaAnahtari: "onboarding.borc.aciklama.\(tur)") {
            if d.borcTurleri.count > 1 {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(d.borcTurleri, id: \.self) { t in
                            OBCip(baslik: d.t("onboarding.turler.\(t)"), secili: tur == t) { tur = t }
                        }
                    }
                }
            }
            OBMetinAlani(etiket: d.t(tur == "kisi" ? "onboarding.borc.kime" : "onboarding.borc.banka"), metin: $ad)
            switch tur {
            case "kredi":
                OBTutarAlani(d: d, etiket: d.t("onboarding.borc.taksit"), metin: $taksit)
                OBMetinAlani(etiket: d.t("onboarding.borc.kalanTaksit"), metin: $kalanTaksit, sayisal: true)
                OBMetinAlani(etiket: d.t("onboarding.borc.odemeGunu"), metin: $gun, sayisal: true)
            case "kmh":
                OBTutarAlani(d: d, etiket: d.t("onboarding.borc.kullanilan"), metin: $tutar)
            case "kisi":
                OBTutarAlani(d: d, etiket: d.t("onboarding.borc.tutar"), metin: $tutar)
            default:
                OBTutarAlani(d: d, etiket: d.t("onboarding.borc.buAykiBorc"), metin: $tutar)
                OBMetinAlani(etiket: d.t("onboarding.borc.sonOdemeGunu"), metin: $gun, sayisal: true)
            }
            Button(action: { kaydet() }) {
                Text("+ " + d.t("onboarding.borc.baskaEkle")).font(.system(size: 14, weight: .semibold)).foregroundColor(OBRenk.murekkep)
            }
            .disabled(taslak == nil)
            .opacity(taslak == nil ? 0.4 : 1)
            .padding(.vertical, 6)
            ForEach(d.borclar) { b in
                HStack {
                    Text(b.ad).font(.system(size: 14, weight: .semibold))
                    Spacer()
                    Text(d.tutar(b.tur == "kredi" ? (b.taksit ?? 0) : (b.tutar ?? 0)))
                        .font(.system(size: 14, weight: .bold, design: .monospaced))
                    Button(action: { d.borclar.removeAll { $0.id == b.id } }) {
                        Image(systemName: "xmark").font(.system(size: 12, weight: .bold))
                    }
                    .accessibilityLabel(d.t("onboarding.borc.kaldir", ["ad": b.ad]))
                }
                .foregroundColor(OBRenk.murekkep)
                .padding(12)
                .background(RoundedRectangle(cornerRadius: 12).fill(OBRenk.lime))
                .overlay(RoundedRectangle(cornerRadius: 12).strokeBorder(OBRenk.murekkep, lineWidth: 1))
            }
            if toplam > 0 {
                OBYanki(parcalar: obParcala(d.t("onboarding.borc.yanki"), ["tutar": d.tutar(toplam)]))
            }
        }
        .onAppear { if let ilk = d.borcTurleri.first, !d.borcTurleri.contains(tur) { tur = ilk } }
    }
}

struct OBMetinAlani: View {
    let etiket: String
    @Binding var metin: String
    var sayisal = false

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(etiket.uppercased())
                .font(.system(size: 10, weight: .bold, design: .monospaced))
                .foregroundColor(OBRenk.gri)
            TextField("", text: $metin)
                .keyboardType(sayisal ? .numberPad : .default)
                .font(.system(size: 20, weight: .semibold, design: sayisal ? .monospaced : .default))
                .foregroundColor(OBRenk.murekkep)
        }
        .padding(12)
        .background(RoundedRectangle(cornerRadius: 14).fill(OBRenk.beyaz))
        .overlay(RoundedRectangle(cornerRadius: 14).strokeBorder(OBRenk.murekkep, lineWidth: 1.2))
    }
}

struct OBYasam: View {
    @ObservedObject var d: OBDurum
    @State private var kendim = false
    @State private var metin = ""

    var body: some View {
        OBKabuk(d: d, anahtar: "yasam", atlanabilir: true) {
            HStack(spacing: 8) {
                ForEach([0.30, 0.45, 0.60], id: \.self) { oran in
                    let deger = (d.gelir * oran).rounded()
                    OBCip(baslik: d.tutar(deger), secili: !kendim && d.yasam == deger) {
                        kendim = false
                        d.yasam = deger
                    }
                }
            }
            OBCip(baslik: d.t("onboarding.yasam.kendim"), secili: kendim) { kendim = true }
            if kendim {
                OBTutarAlani(d: d, etiket: "", metin: $metin, odakla: true)
                    .onChange(of: metin) { yeni in d.yasam = obSayi(yeni, d.yerel) }
            }
            if d.yasam != nil {
                OBYanki(parcalar: obParcala(d.t(d.kalan < 0 ? "onboarding.yasam.acik" : "onboarding.yasam.yanki"),
                                            ["tutar": d.tutar(abs(d.kalan))]))
                    .padding(.top, 10)
            }
        }
        .onAppear { if d.yasam == nil && d.gelir > 0 { d.yasam = (d.gelir * 0.45).rounded() } }
    }
}

struct OBPlan: View {
    @ObservedObject var d: OBDurum

    var body: some View {
        let gider = max(d.gelir, 1)
        let oranlar = [d.planOdemeleri / gider, d.yasamTutari / gider, max(0, d.kalan) / gider]
        OBKabuk(d: d, anahtar: "plan", dugme: d.t("onboarding.plan.dugme")) {
            OBPlanKarti(d: d,
                        etiket: d.t("onboarding.plan.etiket"),
                        tutar: d.tutar(d.kalan),
                        alt: d.t(d.yasam == nil ? "onboarding.plan.formulYasamsiz" : "onboarding.plan.formul", [
                            "gelir": d.tutar(d.gelir),
                            "odemeler": d.tutar(d.planOdemeleri),
                            "yasam": d.tutar(d.yasamTutari),
                        ]),
                        oranlar: oranlar)
            if let ilk = d.ilkBitecek {
                let b = ilk.borc
                HStack(spacing: 10) {
                    Text("1")
                        .font(.system(size: 12, weight: .bold, design: .monospaced))
                        .frame(width: 26, height: 26)
                        .background(Circle().fill(OBRenk.lime))
                        .overlay(Circle().strokeBorder(OBRenk.murekkep, lineWidth: 1))
                    VStack(alignment: .leading, spacing: 2) {
                        Text(b.ad).font(.system(size: 14, weight: .semibold))
                        if let gun = b.gun {
                            Text(d.tarih(d.sonrakiTarih(gun: gun))).font(.system(size: 12)).foregroundColor(OBRenk.gri)
                        }
                    }
                    Spacer()
                    Text(d.tutar(b.tur == "kredi" ? (b.taksit ?? 0) : b.bakiye / Double(max(ilk.ay ?? 1, 1))))
                        .font(.system(size: 13, weight: .bold, design: .monospaced))
                        .padding(.horizontal, 8).padding(.vertical, 4)
                        .background(Capsule().fill(OBRenk.coral))
                        .overlay(Capsule().strokeBorder(OBRenk.murekkep, lineWidth: 1))
                }
                .foregroundColor(OBRenk.murekkep)
                .padding(12)
                .background(RoundedRectangle(cornerRadius: 14).fill(OBRenk.beyaz))
                .overlay(RoundedRectangle(cornerRadius: 14).strokeBorder(OBRenk.murekkep, lineWidth: 1.2))
                if let ay = ilk.ay {
                    OBYanki(parcalar: obParcala(d.t(ay == 1 ? "onboarding.plan.buAyBiter" : "onboarding.plan.biter"),
                                                ["ad": b.ad, "ay": "\(ay)"]))
                } else {
                    OBYanki(parcalar: [(d.t("onboarding.plan.yetmiyor"), false)])
                }
                if let odeme = d.ilkOdeme {
                    OBYanki(parcalar: obParcala(d.t("onboarding.plan.ilkOdeme"), ["tarih": d.tarih(odeme.tarih)]))
                }
            } else {
                OBYanki(parcalar: [(d.t("onboarding.plan.borcsuz"), false)])
            }
        }
    }
}

struct OBHazir: View {
    @ObservedObject var d: OBDurum
    @State private var gorundu = false

    var ilkOdeme: Date? { d.ilkOdeme?.tarih }

    var body: some View {
        VStack(spacing: 14) {
            Spacer()
            Image(systemName: "checkmark")
                .font(.system(size: 34, weight: .heavy))
                .foregroundColor(OBRenk.murekkep)
                .frame(width: 72, height: 72)
                .background(
                    ZStack {
                        RoundedRectangle(cornerRadius: 16).fill(OBRenk.murekkep).offset(x: 3, y: 4)
                        RoundedRectangle(cornerRadius: 16).fill(OBRenk.coral)
                        RoundedRectangle(cornerRadius: 16).strokeBorder(OBRenk.murekkep, lineWidth: 1.5)
                    }
                )
                .scaleEffect(gorundu ? 1 : 0.4)
                .opacity(gorundu ? 1 : 0)
            Text(d.t("onboarding.hazir.rozet"))
                .font(.system(size: 12, weight: .medium, design: .monospaced))
                .foregroundColor(OBRenk.gri)
            Text(d.ad.isEmpty ? d.t("onboarding.hazir.baslik") : d.t("onboarding.hazir.baslikAd", ["ad": d.ad.trimmingCharacters(in: .whitespaces)]))
                .font(.system(size: 36, weight: .bold))
                .foregroundColor(OBRenk.murekkep)
                .multilineTextAlignment(.center)
                .accessibilityAddTraits(.isHeader)
            Text(ilkOdeme.map { d.t("onboarding.hazir.aciklama", ["tarih": d.tarih($0)]) } ?? d.t("onboarding.hazir.aciklamaBorcsuz"))
                .font(.system(size: 14))
                .foregroundColor(OBRenk.gri)
                .multilineTextAlignment(.center)
            Spacer()
            OBDugme(baslik: d.t("onboarding.hazir.dugme")) { d.bitir(cikis: d.misafir ? "misafir" : "tamam") }
                .padding(.bottom, 12)
        }
        .padding(.horizontal, 24)
        .onAppear {
            UINotificationFeedbackGenerator().notificationOccurred(.success)
            withAnimation(.spring(response: 0.45, dampingFraction: 0.6)) { gorundu = true }
        }
    }
}

// MARK: - Kok gorunum

struct OBAkis: View {
    @ObservedObject var d: OBDurum

    var body: some View {
        ZStack {
            d.adim.zemin.ignoresSafeArea()
            Group {
                switch d.adim {
                case .acilis: OBAcilis(d: d)
                case .karsilama: OBKarsilama(d: d)
                case .dil: OBDil(d: d)
                case .ulke: OBUlkeEkrani(d: d)
                case .isim: OBIsim(d: d)
                case .hedef: OBHedef(d: d)
                case .siklik:
                    OBTekSecim(d: d, anahtar: "siklik", secenekler: ["aylik", "ikiKez", "haftalik", "duzensiz"],
                               sagNotlar: ["ikiKez": "onboarding.siklik.ikiKezIpucu"], secili: d.siklik) { d.siklik = $0 }
                case .gun: OBMaasGunu(d: d)
                case .gelir: OBGelir(d: d)
                case .turler: OBTurler(d: d)
                case .borc: OBBorcEkrani(d: d)
                case .yasam: OBYasam(d: d)
                case .plan: OBPlan(d: d)
                case .hazir: OBHazir(d: d)
                }
            }
            .id(d.adim)
            .transition(.asymmetric(insertion: .move(edge: d.ileriYon ? .trailing : .leading),
                                    removal: .move(edge: d.ileriYon ? .leading : .trailing)))
        }
        .animation(.easeInOut(duration: 0.28), value: d.adim)
        .environment(\.locale, d.yerel)
        .preferredColorScheme(.light)
    }
}

final class OBDenetleyici: UIHostingController<OBAkis> {
    init(durum: OBDurum) {
        super.init(rootView: OBAkis(d: durum))
        modalPresentationStyle = .fullScreen
        // Akis her zaman acik renkte; koyu temada metin alanlari beyaz yazi
        // ile beyaz zemine dusuyordu.
        overrideUserInterfaceStyle = .light
        // Akis kendi geri dugmesiyle gezinir; kaydirarak kapatma yok.
        isModalInPresentation = true
    }

    @MainActor required dynamic init?(coder: NSCoder) { nil }

    override var preferredStatusBarStyle: UIStatusBarStyle { .darkContent }
}
