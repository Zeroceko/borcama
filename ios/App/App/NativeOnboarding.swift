import SwiftUI
import UIKit
import Combine
import CoreText

// Ilk acilis kurulumu iOS'ta webview degil, SwiftUI ekranlari.
// Web tarafi akisin baslamasi gerektigine karar verir ve "baslat" mesajiyla
// metinleri (secili dilde degil, alti dilin tamami), ulke ve para birimi
// listelerini gonderir. Boylece metinlerin tek kaynagi web sozlugu kalir.
// Akis bitince sonuc web'e borcamaOnboardingBitti olayiyla doner; veri
// modeline yazma isini web yapar (onboardingSonucunuUygula).
// Yuzey: docs/onboarding-v3-direktifi.md (§2 token'lar, §3 bilesenler);
// web esi src/Onboarding.jsx + src/onboardingAkis.css. Mantik (hesaplar,
// atlama kurallari, sonuc sekli) onboardingAdimlari.js ile ayni.
// Bu ekranlar gercek kullanici verisi disinda tutar gostermez; karsilama
// maketindeki tutarlar temsilidir.

// MARK: - Renkler (direktif §2.1; acik = ACIK_TEMA, koyu = KOYU_TEMA)

enum OBRenk {
    private static func hex(_ v: UInt32, _ a: CGFloat = 1) -> UIColor {
        UIColor(red: CGFloat((v >> 16) & 0xff) / 255, green: CGFloat((v >> 8) & 0xff) / 255, blue: CGFloat(v & 0xff) / 255, alpha: a)
    }
    // Acik/koyu degeri sistem ozelliginden (overrideUserInterfaceStyle) okunur.
    private static func dinamik(_ acik: UInt32, _ koyu: UInt32, acikAlfa: CGFloat = 1, koyuAlfa: CGFloat = 1) -> Color {
        Color(UIColor { t in t.userInterfaceStyle == .dark ? hex(koyu, koyuAlfa) : hex(acik, acikAlfa) })
    }

    static let ink = Color(hex(0x14160f))
    static let lime = Color(hex(0xcdf564))
    static let coral = Color(hex(0xff6f59))
    static let mint = Color(hex(0xd9e7e1))

    static let zemin = dinamik(0xf4efe0, 0x0f110a)
    static let yuzey = dinamik(0xffffff, 0x191c12)
    static let yuzey2 = dinamik(0xf6f3e8, 0x22261a)
    static let yuzey3 = dinamik(0xe6e1d2, 0x2e3324)
    static let metin = dinamik(0x14160f, 0xf4efe0)
    static let metin2 = dinamik(0x55584c, 0xb5b2a0)
    static let metin3 = dinamik(0x8a8c7e, 0x8a8c7e)
    static let ozet = dinamik(0xd9e7e1, 0x191c12)
    static let ozetMetin = dinamik(0x14160f, 0xf4efe0)
    static let ozetTutar = dinamik(0x14160f, 0xcdf564)
    // K9: secili secenek CTA'dan ayri; acikta murekkep, koyuda krem dolgu.
    static let seciliZemin = dinamik(0x14160f, 0xf4efe0)
    static let seciliMetin = dinamik(0xf4efe0, 0x14160f)
    static let ilerlemeTamam = dinamik(0x14160f, 0xf4efe0)
    static let ilerlemeSirada = dinamik(0xe65340, 0xff6f59)
    static let ilerlemeBekleyen = dinamik(0x14160f, 0xf4efe0, acikAlfa: 0.14, koyuAlfa: 0.16)
    static let cerceve = dinamik(0x14160f, 0x2e3324)
    static let parlama = dinamik(0xcdf564, 0xcdf564, acikAlfa: 0.42, koyuAlfa: 0.16)
    // Tema kartlarindaki mini maket iki temada sabittir (ornek ekran).
    static let maketAcik = Color(hex(0xf4efe0))
    static let maketAcikMetin = Color(hex(0x14160f))
    static let maketKoyu = Color(hex(0x0f110a))
    static let maketKoyuMetin = Color(hex(0xcdf564))
    static let maketKoyuYuzey = Color(hex(0x22261a))
    static let maketKoyuCizgi = Color(hex(0xf4efe0))
}

// Ozet golgesi (buyuk tutar, plan tutari, maket tutari): acikta lime + coral,
// koyuda yalniz coral.
struct OBOzetGolge: ViewModifier {
    @Environment(\.colorScheme) private var sema
    var olcek: CGFloat = 1
    func body(content: Content) -> some View {
        content
            .shadow(color: OBRenk.coral, radius: 0, x: (sema == .dark ? 3 : 5) * olcek, y: (sema == .dark ? 3 : 5) * olcek)
            .shadow(color: sema == .dark ? .clear : OBRenk.lime, radius: 0, x: 3 * olcek, y: 3 * olcek)
    }
}

// MARK: - Yazi tipleri (Archivo Black, Space Grotesk, JetBrains Mono; Fonts/)

enum OBYazi {
    private static var kayitli = false

    // Pakete "Fonts" klasor referansi olarak girer; Info.plist yerine
    // calisma zamaninda kaydedilir.
    static func kaydet() {
        guard !kayitli else { return }
        kayitli = true
        let dosyalar = Bundle.main.urls(forResourcesWithExtension: "ttf", subdirectory: "Fonts") ?? []
        for url in dosyalar { CTFontManagerRegisterFontsForURL(url as CFURL, .process, nil) }
    }

    private static let wght = UIFontDescriptor.AttributeName(rawValue: kCTFontVariationAttribute as String)

    // Degisken yazi tipi (wght ekseni 2003265652).
    private static func degisken(_ aile: String, _ boyut: CGFloat, _ agirlik: CGFloat) -> UIFont {
        let tanim = UIFontDescriptor(fontAttributes: [.family: aile, wght: [2003265652: agirlik]])
        return UIFont(descriptor: tanim, size: boyut)
    }

    static func govde(_ boyut: CGFloat, _ agirlik: CGFloat = 500) -> Font { Font(degisken("Space Grotesk", boyut, agirlik)) }
    static func mono(_ boyut: CGFloat, _ agirlik: CGFloat = 700) -> Font { Font(degisken("JetBrains Mono", boyut, agirlik)) }
    static func baslik(_ boyut: CGFloat) -> Font { Font.custom("ArchivoBlack-Regular", size: boyut) }
}

// MARK: - Girdi ve durum

struct OBUlke: Identifiable, Hashable {
    let kod: String
    let adlar: [String: String]   // dil kodu -> ulke adi
    let paraBirimi: String
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
    case acilis, karsilama, dil, gorunum, ulke, isim, hedef, siklik, gun, gelir, turler, borc, plan, hazir

    // Ilerleme cubugunda sayilan adimlar; acilis, karsilama ve hazir sayilmaz.
    static let numarali: [OBAdim] = [.dil, .gorunum, .ulke, .isim, .hedef, .siklik, .gun, .gelir, .turler, .borc, .plan]
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
    @Published var dil: String
    // Gorunum: "system" cihazi izler; secim aninda tum akis degisir.
    @Published var tema: String
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
    // Yasam gideri sorulmuyor (K10); alan sonucta null kalir.
    var yasam: Double? = nil
    @Published var atlanan: [String] = []
    // Karsilamada "Hesap acmadan devam et" secildiyse akis misafir olarak biter.
    var misafir = false

    var olay: (String, [String: Any]) -> Void = { _, _ in }
    var bitti: ([String: Any]) -> Void = { _ in }

    static let temalar = ["system", "light", "dark"]

    init(govde: [String: Any]) {
        metinler = govde["metinler"] as? [String: [String: String]] ?? [:]
        ulkeler = (govde["ulkeler"] as? [[String: Any]] ?? []).compactMap {
            guard let kod = $0["kod"] as? String else { return nil }
            return OBUlke(kod: kod,
                          adlar: $0["adlar"] as? [String: String] ?? [:],
                          paraBirimi: $0["paraBirimi"] as? String ?? "",
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
        let gelenTema = govde["tema"] as? String ?? "system"
        tema = OBDurum.temalar.contains(gelenTema) ? gelenTema : "system"
        ulke = govde["ulke"] as? String ?? ""
        paraBirimi = govde["paraBirimi"] as? String ?? "TRY"
        // Giris ekranindan geri donuste acilis logosu tekrar oynamaz.
        if govde["geri"] as? Bool == true { adim = .karsilama }
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

    // Iki parcali sozluk basligi tek renk, tek parca basilir (K7).
    func baslik(_ gri: String, _ vurgu: String) -> String {
        let g = metinler[dil]?[gri] ?? OBDurum.yedek[dil]?[gri] ?? metinler["en"]?[gri] ?? OBDurum.yedek["en"]?[gri] ?? ""
        let v = t(vurgu)
        return g.isEmpty ? v : g + " " + v
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

    // Simgesiz, binlik ayracli sayi (buyuk tutar gosterimi).
    func sayi(_ n: Double) -> String {
        let bicim = NumberFormatter()
        bicim.numberStyle = .decimal
        bicim.locale = yerel
        bicim.maximumFractionDigits = 0
        return bicim.string(from: NSNumber(value: n.rounded())) ?? "\(Int(n))"
    }

    var sembol: String { paraBirimleri.first(where: { $0.kod == paraBirimi })?.sembol ?? paraBirimi }

    func tarih(_ d: Date, gunAdi: Bool = false, uzun: Bool = false) -> String {
        let bicim = DateFormatter()
        bicim.locale = yerel
        bicim.setLocalizedDateFormatFromTemplate(gunAdi ? "dMMMEEEE" : (uzun ? "dMMMM" : "dMMM"))
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

    func haftaGunuAdi(_ gun: Int, kisa: Bool = false) -> String {
        let bicim = DateFormatter()
        bicim.locale = yerel
        let adlar = (kisa ? bicim.shortStandaloneWeekdaySymbols : bicim.standaloneWeekdaySymbols) ?? []
        guard adlar.count == 7 else { return "\(gun)" }
        return adlar[gun % 7].capitalized(with: yerel)
    }

    func kalanGun(_ d: Date) -> Int {
        takvim.dateComponents([.day], from: takvim.startOfDay(for: bugun), to: d).day ?? 0
    }

    var gunluk: Double { gelir / 30 }
    var buAyOdemeler: Double { borclar.reduce(0) { $0 + $1.buAyOdeme } }
    // Plan, yasam icin gelirin %45'ini varsayar (web: yasamVarsayilan).
    var yasamTutari: Double { yasam ?? (gelir * 45 / 100).rounded() }
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
        }
        guard let sira = siradakiler.firstIndex(of: simdiki), sira + 1 < siradakiler.count else {
            bitir(cikis: misafir ? "misafir" : "tamam")
            return
        }
        gecmis.append(simdiki)
        adimBaslangic = Date()
        adim = siradakiler[sira + 1]
    }

    func geri() {
        guard let onceki = gecmis.popLast() else { return }
        adimBaslangic = Date()
        adim = onceki
    }

    func bitir(cikis: String) {
        let govde: [String: Any] = [
            "cikis": cikis,
            "dil": dil,
            "tema": tema,
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
            "yasam": NSNull(),
            "atlanan": atlanan,
            "sure_ms": Int(Date().timeIntervalSince(baslangic) * 1000),
        ]
        bitti(govde)
    }
}

// MARK: - Ortak parcalar

// Bolge kodundan bayrak (TR -> regional indicator ciftine); K6 istisnasi.
func obBayrak(_ kod: String) -> String {
    String(String.UnicodeScalarView(kod.uppercased().unicodeScalars.compactMap { Unicode.Scalar(127397 + $0.value) }))
}

private func dokunusTitresimi() {
    UISelectionFeedbackGenerator().selectionChanged()
}

// Mono etiket: "ADIM 3/12", "AYIN GUNU", form alani etiketleri.
struct OBMonoEtiket: View {
    let metin: String
    var renk: Color = OBRenk.metin2
    var body: some View {
        Text(metin.uppercased())
            .font(OBYazi.mono(10.5, 700))
            .tracking(0.8)
            .foregroundColor(renk)
    }
}

// Birincil dugme: 56px pill, lime + coral blok golge. Pasif: yuzey-2 + metin-3.
struct OBDugme: View {
    let baslik: String
    var etkin = true
    var koyu = false   // kapanis: ink zemin + lime metin
    let eylem: () -> Void
    @State private var basili = false

    var body: some View {
        Button(action: {
            UIImpactFeedbackGenerator(style: .medium).impactOccurred()
            eylem()
        }) {
            Text(baslik)
                .font(OBYazi.govde(16, 700))
                .foregroundColor(etkin ? (koyu ? OBRenk.lime : OBRenk.ink) : OBRenk.metin3)
                .frame(maxWidth: .infinity)
                .frame(height: 56)
                .background(
                    ZStack {
                        if etkin { Capsule().fill(OBRenk.coral).offset(y: basili ? 1 : 4) }
                        Capsule().fill(etkin ? (koyu ? OBRenk.ink : OBRenk.lime) : OBRenk.yuzey2)
                    }
                )
                .offset(y: basili ? 3 : 0)
        }
        .buttonStyle(.plain)
        .disabled(!etkin)
        .simultaneousGesture(DragGesture(minimumDistance: 0)
            .onChanged { _ in if !basili { withAnimation(.easeOut(duration: 0.08)) { basili = true } } }
            .onEnded { _ in withAnimation(.easeOut(duration: 0.08)) { basili = false } })
    }
}

// Secim halkasi: 22px; secilince lime dolgu + ink tik.
struct OBHalka: View {
    let secili: Bool
    var boyut: CGFloat = 22
    var body: some View {
        ZStack {
            Circle().fill(secili ? OBRenk.lime : Color.clear)
            Circle().strokeBorder(secili ? OBRenk.lime : OBRenk.yuzey3, lineWidth: 1.5)
            if secili {
                Image(systemName: "checkmark").font(.system(size: boyut * 0.5, weight: .heavy)).foregroundColor(OBRenk.ink)
            }
        }
        .frame(width: boyut, height: boyut)
        .animation(.easeOut(duration: 0.18), value: secili)
    }
}

// Mono kod rozeti (TR, EN, KISI); secilince lime dolgu + ink metin.
struct OBKod: View {
    let kod: String
    var secili = false
    var body: some View {
        Text(kod)
            .font(OBYazi.mono(11, 700))
            .foregroundColor(secili ? OBRenk.ink : OBRenk.metin)
            .padding(.horizontal, 7)
            .frame(minWidth: 30, minHeight: 24)
            .background(RoundedRectangle(cornerRadius: 7).fill(secili ? OBRenk.lime : OBRenk.yuzey2))
    }
}

// Basili tutunca hafif kuculme (120 ms scale .985).
struct OBBasmaStili: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.985 : 1)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }
}

// Kenarliksiz secim satiri: 60px, yuzey, 18px kose; sol kod rozeti, orta metin
// + alt satir, sag mono not + halka. Secili: murekkep/krem dolgu + ters metin
// (K9; lime yalniz CTA'da). Ulke satirinda kod yerine bayrak.
struct OBSecenek: View {
    let baslik: String
    var alt: String? = nil
    var sag: String? = nil
    var kod: String? = nil
    var bayrak: String? = nil
    let secili: Bool
    let eylem: () -> Void

    var body: some View {
        Button(action: { dokunusTitresimi(); eylem() }) {
            HStack(spacing: 12) {
                if let kod { OBKod(kod: kod, secili: secili) }
                if let bayrak { Text(bayrak).font(.system(size: 24)).frame(width: 32).accessibilityHidden(true) }
                VStack(alignment: .leading, spacing: 2) {
                    Text(baslik).font(OBYazi.govde(15, 700)).foregroundColor(secili ? OBRenk.seciliMetin : OBRenk.metin)
                    if let alt, !alt.isEmpty {
                        Text(alt).font(OBYazi.govde(12.5, 500)).foregroundColor(secili ? OBRenk.seciliMetin.opacity(0.74) : OBRenk.metin2)
                    }
                }
                Spacer(minLength: 8)
                if let sag {
                    Text(sag).font(OBYazi.mono(11, 700)).foregroundColor(secili ? OBRenk.seciliMetin.opacity(0.74) : OBRenk.metin2)
                }
                OBHalka(secili: secili)
            }
            .padding(.horizontal, 16)
            .frame(minHeight: 60)
            .background(RoundedRectangle(cornerRadius: 18).fill(secili ? OBRenk.seciliZemin : OBRenk.yuzey))
            .contentShape(Rectangle())
        }
        .buttonStyle(OBBasmaStili())
        .animation(.easeOut(duration: 0.18), value: secili)
        .accessibilityAddTraits(secili ? .isSelected : [])
    }
}

// Ikonlu secim karti (2 sutun): sol ust ikon rozeti, sag ust halka, alt metin.
struct OBSecimKarti: View {
    let baslik: String
    let simge: String
    let secili: Bool
    let eylem: () -> Void

    var body: some View {
        Button(action: { dokunusTitresimi(); eylem() }) {
            VStack(alignment: .leading, spacing: 0) {
                HStack(alignment: .top) {
                    Image(systemName: simge)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(secili ? OBRenk.ink : OBRenk.metin)
                        .frame(width: 40, height: 40)
                        .background(RoundedRectangle(cornerRadius: 12).fill(secili ? OBRenk.lime : OBRenk.yuzey2))
                    Spacer()
                    OBHalka(secili: secili)
                }
                Spacer(minLength: 14)
                Text(baslik)
                    .font(OBYazi.govde(14, 700))
                    .foregroundColor(secili ? OBRenk.seciliMetin : OBRenk.metin)
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(14)
            .frame(maxWidth: .infinity, minHeight: 124, alignment: .topLeading)
            .background(RoundedRectangle(cornerRadius: 20).fill(secili ? OBRenk.seciliZemin : OBRenk.yuzey))
            .contentShape(Rectangle())
        }
        .buttonStyle(OBBasmaStili())
        .animation(.easeOut(duration: 0.18), value: secili)
        .accessibilityAddTraits(secili ? .isSelected : [])
    }
}

// Kenarliksiz ek satir: baslik + alt satir, sagda ok (secilince tik).
struct OBEkSatir: View {
    let baslik: String
    var alt: String? = nil
    var secili = false
    let eylem: () -> Void

    var body: some View {
        Button(action: eylem) {
            HStack(spacing: 10) {
                VStack(alignment: .leading, spacing: 2) {
                    Text(baslik).font(OBYazi.govde(14, 700)).foregroundColor(secili ? OBRenk.seciliMetin : OBRenk.metin)
                    if let alt { Text(alt).font(OBYazi.govde(12, 500)).foregroundColor(secili ? OBRenk.seciliMetin.opacity(0.74) : OBRenk.metin2) }
                }
                Spacer()
                Image(systemName: secili ? "checkmark" : "chevron.right")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(secili ? OBRenk.seciliMetin : OBRenk.metin)
            }
            .padding(.horizontal, 16)
            .frame(minHeight: 54)
            .background(RoundedRectangle(cornerRadius: 18).fill(secili ? OBRenk.seciliZemin : Color.clear))
            .contentShape(Rectangle())
        }
        .buttonStyle(OBBasmaStili())
    }
}

// Cip: 999px, yuzey; secili murekkep/krem dolgu (K9). Mono tutar cipleri icin `mono`.
struct OBCip: View {
    let baslik: String
    var mono = false
    let secili: Bool
    let eylem: () -> Void

    var body: some View {
        Button(action: { dokunusTitresimi(); eylem() }) {
            Text(baslik)
                .font(mono ? OBYazi.mono(13, 700) : OBYazi.govde(13.5, 700))
                .foregroundColor(secili ? OBRenk.seciliMetin : OBRenk.metin)
                .lineLimit(1)
                .fixedSize(horizontal: true, vertical: false)
                .padding(.horizontal, 16)
                .frame(height: 40)
                .background(Capsule().fill(secili ? OBRenk.seciliZemin : OBRenk.yuzey))
        }
        .buttonStyle(OBBasmaStili())
        .animation(.easeOut(duration: 0.18), value: secili)
        .accessibilityAddTraits(secili ? .isSelected : [])
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

// Yanki: AttributedString ile satir ici lime mark (iOS 15+).
struct OBYankiMetni: View {
    let parcalar: [(String, Bool)]
    @Environment(\.colorScheme) private var sema

    var body: some View {
        var toplam = AttributedString()
        for parca in parcalar {
            var a = AttributedString(parca.1 ? "\u{2009}\(parca.0)\u{2009}" : parca.0)
            if parca.1 {
                a.font = OBYazi.mono(14.5, 700)
                a.foregroundColor = OBRenk.ink
                a.backgroundColor = OBRenk.lime
            } else {
                a.font = OBYazi.govde(17, 700)
                a.foregroundColor = sema == .dark ? Color(red: 0.957, green: 0.937, blue: 0.878) : OBRenk.ink
            }
            toplam += a
        }
        return Text(toplam)
            .lineSpacing(4)
            .fixedSize(horizontal: false, vertical: true)
    }
}

// Bilgi karti: 30px lime ikon rozeti + kalin cumle + aciklama.
struct OBBilgiKarti: View {
    let simge: String
    let kalin: String
    var aciklama: String? = nil

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: simge)
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(OBRenk.ink)
                .frame(width: 30, height: 30)
                .background(RoundedRectangle(cornerRadius: 9).fill(OBRenk.lime))
            (Text(kalin).font(OBYazi.govde(13.5, 700)).foregroundColor(OBRenk.metin)
                + Text(aciklama.map { " " + $0 } ?? "").font(OBYazi.govde(13, 500)).foregroundColor(OBRenk.metin2))
                .lineSpacing(3)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 16).fill(OBRenk.yuzey))
    }
}

// Ust kabuk: geri (40px daire) · parcali ilerleme · sagda "Simdilik gec".
struct OBUstBar: View {
    @ObservedObject var d: OBDurum
    var atla: (() -> Void)? = nil

    var body: some View {
        let liste = d.numaralilar
        let sira = liste.firstIndex(of: d.adim) ?? 0
        HStack(spacing: 14) {
            Button(action: { d.geri() }) {
                Image(systemName: "chevron.left")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(OBRenk.metin)
                    .frame(width: 40, height: 40)
                    .background(Circle().fill(OBRenk.yuzey2))
            }
            .buttonStyle(OBBasmaStili())
            .accessibilityLabel(d.t("onboarding.geri"))
            HStack(spacing: 4) {
                ForEach(liste.indices, id: \.self) { i in
                    Capsule()
                        .fill(i < sira ? OBRenk.ilerlemeTamam : (i == sira ? OBRenk.ilerlemeSirada : OBRenk.ilerlemeBekleyen))
                        .frame(height: 4)
                        .animation(.easeOut(duration: 0.25), value: sira)
                }
            }
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(d.t("onboarding.ilerlemeAria", ["n": "\(sira + 1)", "toplam": "\(liste.count)"]))
            if let atla {
                Button(action: atla) {
                    Text(d.t("onboarding.atla"))
                        .font(OBYazi.govde(13, 700))
                        .underline()
                        .foregroundColor(OBRenk.metin2)
                        .padding(.leading, 8)
                        .frame(height: 40)
                }
                .buttonStyle(.plain)
            }
        }
        .frame(height: 44)
    }
}

// Tek renk Archivo Black baslik.
struct OBBaslik: View {
    let metin: String
    var boyut: CGFloat = 28

    var body: some View {
        Text(metin)
            .font(OBYazi.baslik(boyut))
            .foregroundColor(OBRenk.metin)
            .lineSpacing(boyut * 0.12)
            .fixedSize(horizontal: false, vertical: true)
            .accessibilityAddTraits(.isHeader)
    }
}

// Zemin: krem/koyu + ust %44'te lime parlama (iki temada da).
struct OBZemin: View {
    var body: some View {
        GeometryReader { g in
            ZStack(alignment: .top) {
                OBRenk.zemin
                EllipticalGradient(colors: [OBRenk.parlama, .clear], center: UnitPoint(x: 0.2, y: 0), startRadiusFraction: 0, endRadiusFraction: 0.7)
                    .frame(height: g.size.height * 0.44)
            }
        }
        .ignoresSafeArea()
    }
}

// Numarali adimlarin ortak kabugu: ust cubuk, ADIM n/N, baslik, aciklama,
// kayan icerik ve altta sabit dugme (ustunde zemine solma).
struct OBKabuk<Icerik: View>: View {
    @ObservedObject var d: OBDurum
    let anahtar: String
    var dugme: String? = nil
    var dugmeEtkin = true
    var atlanabilir = false
    var atlaEylemi: (() -> Void)? = nil
    var dugmeEylemi: (() -> Void)? = nil
    var griAnahtari: String? = nil
    var baslikAnahtari: String? = nil
    var aciklamaAnahtari: String? = nil
    var aciklamaMetni: String? = nil
    // Icerik kaydirilmadan sabit yerlesir (gelir: tus takimi altta).
    var dikey = false
    @ViewBuilder let icerik: () -> Icerik

    var body: some View {
        let liste = d.numaralilar
        let sira = (liste.firstIndex(of: d.adim) ?? 0) + 1
        VStack(alignment: .leading, spacing: 0) {
            OBUstBar(d: d, atla: atlanabilir ? (atlaEylemi ?? { d.ileri(atlandi: true) }) : nil)
                .padding(.top, 10)
                .padding(.horizontal, 20)
            ZStack(alignment: .bottom) {
                let govde = VStack(alignment: .leading, spacing: 10) {
                    OBMonoEtiket(metin: d.t("onboarding.adimEtiketi", ["n": "\(sira)", "toplam": "\(liste.count)"]))
                        .padding(.top, 22)
                    OBBaslik(metin: d.baslik(griAnahtari ?? "onboarding.\(anahtar).baslikGri", baslikAnahtari ?? "onboarding.\(anahtar).baslik"))
                    Text(aciklamaMetni ?? d.t(aciklamaAnahtari ?? "onboarding.\(anahtar).aciklama"))
                        .font(OBYazi.govde(14.5, 500))
                        .foregroundColor(OBRenk.metin2)
                        .lineSpacing(3)
                        .fixedSize(horizontal: false, vertical: true)
                        .padding(.bottom, 14)
                    icerik()
                }
                .padding(.horizontal, 20)
                if dikey {
                    govde.padding(.bottom, 96).frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
                } else {
                    ScrollView(showsIndicators: false) {
                        govde.padding(.bottom, 110)
                    }
                }
                VStack(spacing: 0) {
                    LinearGradient(colors: [OBRenk.zemin.opacity(0), OBRenk.zemin], startPoint: .top, endPoint: .bottom)
                        .frame(height: 28)
                    OBDugme(baslik: dugme ?? d.t("onboarding.devam"), etkin: dugmeEtkin) {
                        if let dugmeEylemi { dugmeEylemi() } else { d.ileri() }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 24)
                    .background(OBRenk.zemin)
                }
            }
        }
    }
}

// MARK: - Acilis ve karsilama

struct OBLogo: View {
    @Environment(\.colorScheme) private var sema
    var yukseklik: CGFloat = 40
    var body: some View {
        if let logo = UIImage(named: sema == .dark ? "BorcamaLogoKoyu" : "BorcamaLogo") {
            Image(uiImage: logo).resizable().scaledToFit().frame(height: yukseklik)
        } else {
            Text("Borcama").font(OBYazi.baslik(yukseklik * 0.8)).foregroundColor(OBRenk.metin)
        }
    }
}

struct OBAcilis: View {
    @ObservedObject var d: OBDurum

    var body: some View {
        ZStack {
            OBZemin()
            OBLogo(yukseklik: 64)
        }
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                if d.adim == .acilis { withAnimation(.easeInOut(duration: 0.3)) { d.ileri() } }
            }
        }
    }
}

// Karsilama ornegi temsilidir; TRY icin yazilip diger birimlere kabaca
// olceklenir (bolgeKurallari.js > ornekTutar gibi iki anlamli haneye yuvarlanir).
enum OBOrnek {
    static func olcek(_ birim: String) -> Double {
        switch birim {
        case "TRY": return 1
        case "JPY": return 3.5
        case "INR", "RUB": return 2.1
        default: return 0.025
        }
    }

    static func tutar(_ tryTutari: Double, _ birim: String) -> Double {
        if birim == "TRY" { return tryTutari }
        let deger = tryTutari * olcek(birim)
        guard deger > 0 else { return 0 }
        let adim = pow(10, max(floor(log10(deger)) - 1, 0))
        return (deger / adim).rounded() * adim
    }
}

// Banka logosu (Assets: BankaAkbank, BankaQNB, BankaEnpara) ya da kod rozeti.
struct OBBankaLogosu: View {
    let ad: String
    var kisi = false
    var kisiEtiketi = "Kişi"
    var boyut: CGFloat = 28

    private var varlik: String? {
        let n = ad.lowercased().replacingOccurrences(of: "ı", with: "i")
        if n.hasPrefix("akbank") { return "BankaAkbank" }
        if n.hasPrefix("qnb") { return "BankaQNB" }
        if n.hasPrefix("enpara") { return "BankaEnpara" }
        return nil
    }

    var body: some View {
        if kisi {
            OBKod(kod: kisiEtiketi)
        } else if let varlik, let img = UIImage(named: varlik) {
            Image(uiImage: img).resizable().scaledToFit()
                .frame(width: boyut - 8, height: boyut - 8)
                .frame(width: boyut, height: boyut)
                .background(RoundedRectangle(cornerRadius: 8).fill(Color.white))
        } else {
            OBKod(kod: String(ad.trimmingCharacters(in: .whitespaces).prefix(3)).uppercased())
        }
    }
}

// Uygulamanin gercek ekranindan maket: maasa kadar kalan, borc listesi.
struct OBMaket: View {
    @ObservedObject var d: OBDurum
    let slayt: Int

    private func satir(_ logo: OBBankaLogosu, _ ad: String, _ alt: String, _ tutar: Double, vurgu: Bool) -> some View {
        HStack(spacing: 8) {
            logo
            VStack(alignment: .leading, spacing: 1) {
                Text(ad).font(OBYazi.govde(12, 700)).foregroundColor(OBRenk.metin).lineLimit(1)
                Text(alt).font(OBYazi.govde(10, 500)).foregroundColor(OBRenk.metin2).lineLimit(1)
            }
            Spacer(minLength: 4)
            Text(d.tutar(OBOrnek.tutar(tutar, d.paraBirimi))).font(OBYazi.mono(12, 700)).foregroundColor(OBRenk.metin)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 9)
        .background(RoundedRectangle(cornerRadius: 14).fill(OBRenk.yuzey))
        .overlay(RoundedRectangle(cornerRadius: 14).strokeBorder(OBRenk.lime, lineWidth: vurgu ? 2 : 0))
        .animation(.easeOut(duration: 0.3), value: vurgu)
    }

    var body: some View {
        let maas = d.sonrakiTarih(gun: 15)
        let gun = max(d.kalanGun(maas), 1)
        VStack(alignment: .leading, spacing: 10) {
            OBMonoEtiket(metin: d.t("onboarding.karsilama.ornekEtiket"))
            Text(d.tutar(OBOrnek.tutar(8450, d.paraBirimi)))
                .font(OBYazi.baslik(34))
                .foregroundColor(OBRenk.ozetTutar)
                .modifier(OBOzetGolge())
                .padding(.vertical, 2)
            OBMaketGun(d: d, gun: gun, vurgu: slayt == 3)
            OBMonoEtiket(metin: d.t("onboarding.karsilama.borclar")).padding(.top, 4)
            satir(OBBankaLogosu(ad: "Akbank", boyut: 26), "Akbank",
                  d.t("onboarding.karsilama.maketSonOdeme", ["tarih": d.tarih(d.sonrakiTarih(gun: 12))]), 6200, vurgu: slayt != 3)
            satir(OBBankaLogosu(ad: "QNB", boyut: 26), d.t("onboarding.karsilama.maketKredi"),
                  d.t("onboarding.karsilama.maketTaksit", ["n": "8"]), 4150, vurgu: false)
            satir(OBBankaLogosu(ad: "Enpara", boyut: 26), d.t("onboarding.karsilama.maketEkHesap"),
                  d.t("onboarding.karsilama.maketKullanilan"), 1900, vurgu: false)
            satir(OBBankaLogosu(ad: "", kisi: true, kisiEtiketi: d.t("onboarding.karsilama.kisiRozet"), boyut: 26),
                  d.t("onboarding.karsilama.maketKisiAd"), d.t("onboarding.karsilama.maketKisi"), 3000, vurgu: false)
        }
        .padding(.top, 18)
        .padding(.horizontal, 14)
        .frame(width: 262 - 16, alignment: .topLeading)
        .frame(maxHeight: .infinity, alignment: .top)
        .background(OBRenk.zemin)
        .clipShape(OBUstYuvarlak(yaricap: 32))
        .padding(.horizontal, 8)
        .padding(.top, 8)
        // Golge yok: ust kapta kirpildigi icin cercevenin etrafinda dikdortgen
        // bir leke birakiyordu.
        .background(OBUstYuvarlak(yaricap: 40).fill(OBRenk.cerceve))
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(d.t("onboarding.karsilama.ornekAria"))
    }
}

// "Maasa {gun} gun var. Odemeler planda." satiri; 3. slaytta lime dolgu.
private struct OBMaketGun: View {
    @ObservedObject var d: OBDurum
    let gun: Int
    let vurgu: Bool

    var body: some View {
        let parcalar = obParcala(d.t("onboarding.karsilama.maketKalan"), ["gun": "\(gun)"])
        parcalar.reduce(Text("")) { toplam, p in
            toplam + Text(p.0).font(OBYazi.govde(12, p.1 ? 700 : 500))
                .foregroundColor(vurgu ? OBRenk.ink : (p.1 ? OBRenk.metin : OBRenk.metin2))
        }
        .padding(.horizontal, vurgu ? 10 : 0)
        .padding(.vertical, vurgu ? 6 : 0)
        .background(RoundedRectangle(cornerRadius: 10).fill(vurgu ? OBRenk.lime : Color.clear))
        .animation(.easeOut(duration: 0.3), value: vurgu)
    }
}

// Yalniz ust koseleri yuvarlak dikdortgen (maket telefon cercevesi).
struct OBUstYuvarlak: Shape {
    let yaricap: CGFloat
    func path(in r: CGRect) -> Path {
        Path(UIBezierPath(roundedRect: r, byRoundingCorners: [.topLeft, .topRight], cornerRadii: CGSize(width: yaricap, height: yaricap)).cgPath)
    }
}

struct OBKarsilama: View {
    @ObservedObject var d: OBDurum
    @State private var slayt = 1
    @Environment(\.accessibilityReduceMotion) private var hareketAz
    let zamanlayici = Timer.publish(every: 3.6, on: .main, in: .common).autoconnect()

    var body: some View {
        VStack(spacing: 0) {
            OBLogo(yukseklik: 36).padding(.top, 14)
            HStack(spacing: 6) {
                ForEach(1...3, id: \.self) { s in
                    Capsule().fill(s == slayt ? OBRenk.ilerlemeSirada : OBRenk.ilerlemeBekleyen)
                        .frame(width: 20, height: 4)
                }
            }
            .padding(.top, 16)
            .accessibilityHidden(true)
            VStack(spacing: 8) {
                Text(d.t("onboarding.karsilama.slayt\(slayt)"))
                    .font(OBYazi.baslik(24))
                    .foregroundColor(OBRenk.metin)
                    .multilineTextAlignment(.center)
                    .accessibilityAddTraits(.isHeader)
                Text(d.t("onboarding.karsilama.slayt\(slayt)Alt"))
                    .font(OBYazi.govde(14.5, 500))
                    .foregroundColor(OBRenk.metin2)
                    .multilineTextAlignment(.center)
                    .lineSpacing(3)
            }
            .frame(height: 96, alignment: .top)
            .padding(.top, 14)
            .padding(.horizontal, 20)
            .id(slayt)
            .transition(hareketAz ? .identity : .opacity)
            OBMaket(d: d, slayt: slayt)
                .padding(.top, 6)
                .frame(maxHeight: .infinity, alignment: .top)
                .clipped()
            VStack(spacing: 0) {
                LinearGradient(colors: [OBRenk.zemin.opacity(0), OBRenk.zemin], startPoint: .top, endPoint: .bottom)
                    .frame(height: 28)
                VStack(spacing: 6) {
                    OBDugme(baslik: d.t("onboarding.karsilama.basla")) { d.misafir = false; d.ileri() }
                    Button(action: { d.bitir(cikis: "giris") }) {
                        Text(d.t("onboarding.karsilama.hesabimVar")).underline()
                            .font(OBYazi.govde(14, 700)).foregroundColor(OBRenk.metin)
                            .frame(height: 40)
                    }
                    // Hesapsiz kullanim: ayni kurulum akisi, sonunda kayit yerine
                    // veriler cihazda kalir.
                    Button(action: { d.misafir = true; d.ileri() }) {
                        Text(d.t("onboarding.karar.misafir")).underline()
                            .font(OBYazi.govde(13.5, 700)).foregroundColor(OBRenk.metin2)
                            .frame(height: 36)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 8)
                .background(OBRenk.zemin)
            }
        }
        .animation(hareketAz ? nil : .easeInOut(duration: 0.3), value: slayt)
        .onReceive(zamanlayici) { _ in if !hareketAz { slayt = slayt % 3 + 1 } }
        .gesture(DragGesture(minimumDistance: 40).onEnded { g in
            slayt = g.translation.width < 0 ? slayt % 3 + 1 : (slayt + 1) % 3 + 1
        })
    }
}

// MARK: - Adimlar

struct OBDil: View {
    @ObservedObject var d: OBDurum
    let diller: [(String, String)] = [
        ("tr", "Türkçe"), ("en", "English"), ("de", "Deutsch"),
        ("fr", "Français"), ("es", "Español"), ("it", "Italiano"),
    ]

    // Dilin adi secili dilde: "English" altinda "Ingilizce".
    func dilinAdi(_ kod: String) -> String? {
        guard kod != d.dil, let ad = d.yerel.localizedString(forLanguageCode: kod) else { return nil }
        return ad.prefix(1).uppercased(with: d.yerel) + ad.dropFirst()
    }

    var body: some View {
        OBKabuk(d: d, anahtar: "dil") {
            VStack(spacing: 10) {
                ForEach(diller, id: \.0) { kod, ad in
                    OBSecenek(baslik: ad, alt: dilinAdi(kod), kod: kod.uppercased(), secili: d.dil == kod) {
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

// Gorunum: Sistem / Acik / Koyu; mini maket iki temada sabit ornek ekran.
struct OBGorunum: View {
    @ObservedObject var d: OBDurum

    var body: some View {
        OBKabuk(d: d, anahtar: "gorunum", griAnahtari: "onboarding.gorunum.baslikGri") {
            HStack(alignment: .top, spacing: 10) {
                OBTemaKarti(d: d, tema: "system", ad: d.t("onboarding.gorunum.sistem"))
                OBTemaKarti(d: d, tema: "light", ad: d.t("onboarding.gorunum.acik"))
                OBTemaKarti(d: d, tema: "dark", ad: d.t("onboarding.gorunum.koyu"))
            }
        }
    }
}

struct OBTemaKarti: View {
    @ObservedObject var d: OBDurum
    let tema: String
    let ad: String

    var secili: Bool { d.tema == tema }

    private func mini(koyu: Bool) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Capsule().fill((koyu ? OBRenk.maketKoyuCizgi : OBRenk.maketAcikMetin).opacity(0.18)).frame(width: 34, height: 6)
            Text(d.tutar(OBOrnek.tutar(8450, d.paraBirimi)))
                .font(OBYazi.baslik(21))
                .foregroundColor(koyu ? OBRenk.maketKoyuMetin : OBRenk.maketAcikMetin)
                .lineLimit(1).minimumScaleFactor(0.6)
            Capsule().fill(OBRenk.lime).frame(height: 16)
            Capsule().fill(OBRenk.coral).frame(height: 16)
            Capsule().fill(koyu ? OBRenk.maketKoyuYuzey : OBRenk.mint).frame(height: 16)
            ZStack(alignment: .leading) {
                Capsule().fill(OBRenk.lime).frame(width: 52, height: 22)
                Circle().fill(OBRenk.ink).frame(width: 16, height: 16).padding(.leading, 3)
            }
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 14)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(koyu ? OBRenk.maketKoyu : OBRenk.maketAcik)
    }

    var body: some View {
        Button(action: { dokunusTitresimi(); d.tema = tema }) {
            VStack(spacing: 6) {
                ZStack {
                    if tema == "system" {
                        // Sistem karti dikey bolunmus: solu acik, sagi koyu.
                        mini(koyu: false)
                        mini(koyu: true).mask(HStack(spacing: 0) { Color.clear; Color.black }.frame(maxWidth: .infinity))
                    } else {
                        mini(koyu: tema == "dark")
                    }
                }
                .frame(height: 190)
                .clipShape(RoundedRectangle(cornerRadius: 16))
                HStack {
                    Text(ad).font(OBYazi.govde(13, 700)).foregroundColor(secili ? OBRenk.seciliMetin : OBRenk.metin)
                    Spacer()
                    OBHalka(secili: secili, boyut: 20)
                }
                .padding(.leading, 10).padding(.trailing, 8).padding(.bottom, 2)
            }
            .padding(6)
            .background(RoundedRectangle(cornerRadius: 20).fill(secili ? OBRenk.seciliZemin : OBRenk.yuzey))
        }
        .buttonStyle(OBBasmaStili())
        .animation(.easeOut(duration: 0.18), value: secili)
        .accessibilityAddTraits(secili ? .isSelected : [])
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
        let seciliOneCikan = oneCikanlar.contains { $0.kod == d.ulke }
        OBKabuk(d: d, anahtar: "ulke", dugmeEtkin: !d.ulke.isEmpty) {
            Color.clear.frame(height: 0).onAppear { oneCikanlariKur() }
            VStack(spacing: 10) {
                ForEach(tumUlkeler ? tumu : oneCikanlar) { u in
                    let birim = u.kod == d.ulke ? d.paraBirimi : u.paraBirimi
                    OBSecenek(baslik: u.ad(d.dil), sag: "\(birim) \(sembol(birim))", bayrak: obBayrak(u.kod), secili: d.ulke == u.kod) {
                        d.ulke = u.kod
                        if !u.paraBirimi.isEmpty { d.paraBirimi = u.paraBirimi }
                    }
                }
            }
            if !tumUlkeler {
                OBEkSatir(baslik: d.t("onboarding.ulke.baskaUlke"),
                          alt: seciliOneCikan ? d.t("onboarding.ulke.baskaUlkeAlt") : "\(d.ulke) · \(d.ulkeler.first { $0.kod == d.ulke }?.ad(d.dil) ?? "")") {
                    withAnimation(.easeOut(duration: 0.2)) { tumUlkeler = true }
                }
            }
            OBEkSatir(baslik: d.t("onboarding.ulke.baskaPara", ["kod": "\(d.paraBirimi) \(d.sembol)"]), secili: tumParalar) {
                withAnimation(.easeOut(duration: 0.2)) { tumParalar.toggle() }
            }
            if tumParalar {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 90), spacing: 8)], spacing: 8) {
                    ForEach(d.paraBirimleri) { p in
                        OBCip(baslik: "\(p.kod) \(p.sembol)", mono: true, secili: d.paraBirimi == p.kod) { d.paraBirimi = p.kod }
                    }
                }
            }
        }
    }

    func sembol(_ kod: String) -> String { d.paraBirimleri.first(where: { $0.kod == kod })?.sembol ?? "" }
}

struct OBIsim: View {
    @ObservedObject var d: OBDurum
    @FocusState private var odak: Bool

    var body: some View {
        OBKabuk(d: d, anahtar: "isim", atlanabilir: true,
                atlaEylemi: { d.ad = ""; d.ileri(atlandi: true) },
                dugmeEylemi: { d.ileri(atlandi: d.ad.trimmingCharacters(in: .whitespaces).isEmpty) }) {
            TextField("", text: $d.ad, prompt: Text(d.t("onboarding.isim.yerTutucu")).foregroundColor(OBRenk.metin3))
                .font(OBYazi.govde(20, 700))
                .foregroundColor(OBRenk.metin)
                .textContentType(.givenName)
                .submitLabel(.next)
                .focused($odak)
                .padding(.horizontal, 18)
                .frame(height: 64)
                .background(RoundedRectangle(cornerRadius: 16).fill(OBRenk.yuzey))
                .overlay(RoundedRectangle(cornerRadius: 16).strokeBorder(OBRenk.lime, lineWidth: odak ? 2 : 0))
                .onSubmit { d.ileri() }
                .onAppear { DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { odak = true } }
        }
    }
}

// Hedef: ikonlu kartlar, birden fazla secilebilir; en az biri secili kalir.
struct OBHedef: View {
    @ObservedObject var d: OBDurum
    let secenekler = [("borc", "target"), ("aySonu", "calendar.badge.checkmark"), ("kontrol", "slider.horizontal.3")]

    var body: some View {
        OBKabuk(d: d, anahtar: "hedef", dugmeEtkin: !d.hedefler.isEmpty,
                aciklamaMetni: d.t("onboarding.hedef.aciklamaCoklu") + " " + d.t("onboarding.hedef.aciklama")) {
            LazyVGrid(columns: [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)], spacing: 10) {
                ForEach(secenekler, id: \.0) { s, simge in
                    OBSecimKarti(baslik: d.t("onboarding.hedef.\(s)"), simge: simge, secili: d.hedefler.contains(s)) {
                        if let i = d.hedefler.firstIndex(of: s) {
                            if d.hedefler.count > 1 { d.hedefler.remove(at: i) }
                        } else { d.hedefler.append(s) }
                    }
                }
            }
        }
    }
}

struct OBSiklik: View {
    @ObservedObject var d: OBDurum
    let secenekler = ["aylik", "ikiKez", "haftalik", "duzensiz"]

    var body: some View {
        OBKabuk(d: d, anahtar: "siklik") {
            VStack(spacing: 10) {
                ForEach(secenekler, id: \.self) { s in
                    OBSecenek(baslik: d.t("onboarding.siklik.\(s)"),
                              alt: s == "duzensiz" ? d.t("onboarding.siklik.duzensizAlt") : nil,
                              sag: s == "ikiKez" ? d.t("onboarding.siklik.ikiKezIpucu") : nil,
                              secili: d.siklik == s) { d.siklik = s }
                }
            }
        }
    }
}

// Maas gunu: ayda bir/iki -> ayin gunu (serit + kaydirici); haftalik -> 7 sutun.
struct OBMaasGunu: View {
    @ObservedObject var d: OBDurum

    var body: some View {
        let haftalik = d.siklik == "haftalik"
        let ek = haftalik ? ".haftalik" : (d.siklik == "ikiKez" ? ".ikiKez" : "")
        let sonraki = haftalik ? d.sonrakiHaftaGunu(d.haftaGunu) : d.sonrakiTarih(gun: d.maasGunu)
        let kalan = d.kalanGun(sonraki)
        let donemBasi = d.takvim.date(byAdding: .month, value: -1, to: sonraki) ?? sonraki
        let donemSonu = d.takvim.date(byAdding: .day, value: -1, to: sonraki) ?? sonraki
        let haftaAdi = d.haftaGunuAdi((d.takvim.component(.weekday, from: sonraki) + 5) % 7 + 1)
        OBKabuk(d: d, anahtar: "gun",
                griAnahtari: "onboarding.gun.baslikGri" + ek,
                baslikAnahtari: "onboarding.gun.baslik" + ek,
                aciklamaAnahtari: "onboarding.gun.aciklama" + ek) {
            VStack(spacing: 12) {
                OBMonoEtiket(metin: haftalik ? d.t("onboarding.gun.baslik.haftalik") : d.t("onboarding.gun.gunEtiketi"))
                if haftalik {
                    OBHaftaGunleri(d: d)
                } else {
                    OBGunSecici(d: d)
                }
            }
            .padding(.vertical, 16)
            .frame(maxWidth: .infinity)
            .background(RoundedRectangle(cornerRadius: 20).fill(OBRenk.yuzey))
            OBYankiMetni(parcalar: obParcala(d.t(haftalik ? "onboarding.gun.yankiHafta" : "onboarding.gun.yanki"), ["tarih": d.tarih(sonraki, gunAdi: true)])
                         + [(" " + (kalan == 0 ? d.t("onboarding.gun.bugun") : d.t("onboarding.gun.kalan", ["gun": "\(kalan)"])), false)])
                .padding(.top, 6)
            if haftalik {
                OBBilgiKarti(simge: "calendar.badge.checkmark", kalin: d.t("onboarding.gun.donemHafta", ["gun": haftaAdi]))
            } else {
                OBBilgiKarti(simge: "calendar.badge.checkmark",
                             kalin: d.t("onboarding.gun.donem", ["bas": d.tarih(donemBasi), "bit": d.tarih(donemSonu)]),
                             aciklama: d.t("onboarding.gun.donemAciklama", ["tarih": d.tarih(sonraki, uzun: true)]))
            }
        }
    }
}

// 31'lik serit: 48px daireler, secili coral + buyume, ortaya kayar; altinda
// surulebilen kaydirici rayi.
struct OBGunSecici: View {
    @ObservedObject var d: OBDurum

    func sec(_ gun: Int) {
        guard gun != d.maasGunu else { return }
        dokunusTitresimi()
        withAnimation(.easeOut(duration: 0.15)) { d.maasGunu = gun }
    }

    var body: some View {
        VStack(spacing: 14) {
            ScrollViewReader { kaydir in
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 6) {
                        ForEach(1...31, id: \.self) { gun in
                            let secili = d.maasGunu == gun
                            Button(action: { sec(gun) }) {
                                Text("\(gun)")
                                    .font(OBYazi.mono(16, 700))
                                    .foregroundColor(secili ? OBRenk.ink : OBRenk.metin)
                                    .frame(width: 48, height: 48)
                                    .background(Circle().fill(secili ? OBRenk.coral : Color.clear))
                                    .scaleEffect(secili ? 1.12 : 1)
                            }
                            .buttonStyle(.plain)
                            .id(gun)
                            .accessibilityLabel(d.t("onboarding.gun.gunAria", ["gun": "\(gun)"]))
                            .accessibilityAddTraits(secili ? .isSelected : [])
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 4)
                }
                .onAppear { kaydir.scrollTo(d.maasGunu, anchor: .center) }
                .onChange(of: d.maasGunu) { yeni in withAnimation(.easeOut(duration: 0.25)) { kaydir.scrollTo(yeni, anchor: .center) } }
            }
            GeometryReader { g in
                let genislik = g.size.width
                let dolgu = genislik * 0.28
                let x = (genislik - dolgu) * CGFloat(d.maasGunu - 1) / 30
                ZStack(alignment: .leading) {
                    Capsule().fill(OBRenk.yuzey3).frame(height: 4)
                    Capsule().fill(OBRenk.coral.opacity(0.55)).frame(width: dolgu, height: 4).offset(x: x)
                    RoundedRectangle(cornerRadius: 8).fill(OBRenk.coral).frame(width: 24, height: 24).offset(x: x + dolgu - 12)
                }
                .frame(height: 24)
                .contentShape(Rectangle())
                .gesture(DragGesture(minimumDistance: 0).onChanged { v in
                    let oran = min(max((v.location.x - dolgu / 2) / (genislik - dolgu), 0), 1)
                    sec(Int((oran * 30).rounded()) + 1)
                })
            }
            .frame(height: 24)
            .padding(.horizontal, 20)
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(d.t("onboarding.gun.gunEtiketi"))
            .accessibilityValue("\(d.maasGunu)")
            .accessibilityAdjustableAction { yon in
                switch yon {
                case .increment: sec(min(d.maasGunu + 1, 31))
                case .decrement: sec(max(d.maasGunu - 1, 1))
                @unknown default: break
                }
            }
        }
    }
}

// Haftanin gunleri (1 = pazartesi ... 7 = pazar), 7 esit sutun.
struct OBHaftaGunleri: View {
    @ObservedObject var d: OBDurum

    var body: some View {
        HStack(spacing: 4) {
            ForEach(1...7, id: \.self) { gun in
                let secili = d.haftaGunu == gun
                Button(action: { dokunusTitresimi(); withAnimation(.easeOut(duration: 0.15)) { d.haftaGunu = gun } }) {
                    Text(d.haftaGunuAdi(gun, kisa: true))
                        .font(OBYazi.mono(12.5, 700))
                        .foregroundColor(secili ? OBRenk.ink : OBRenk.metin)
                        .lineLimit(1).minimumScaleFactor(0.7)
                        .frame(maxWidth: .infinity)
                        .frame(height: 44)
                        .background(Capsule().fill(secili ? OBRenk.coral : OBRenk.yuzey2))
                        .scaleEffect(secili ? 1.06 : 1)
                }
                .buttonStyle(.plain)
                .accessibilityLabel(d.haftaGunuAdi(gun))
                .accessibilityAddTraits(secili ? .isSelected : [])
            }
        }
        .padding(.horizontal, 12)
    }
}

// Buyuk tutar: simge + sayi (ozet golgesi) + yanip sonen coral imlec.
struct OBTutarGosterimi: View {
    @ObservedObject var d: OBDurum
    let ham: String   // rakam dizisi
    @State private var imlecGorunur = true
    @Environment(\.accessibilityReduceMotion) private var hareketAz
    let zamanlayici = Timer.publish(every: 0.5, on: .main, in: .common).autoconnect()

    var body: some View {
        let bos = ham.isEmpty
        HStack(alignment: .firstTextBaseline, spacing: 6) {
            Text(d.sembol).font(OBYazi.baslik(32)).foregroundColor(OBRenk.metin2)
            if bos {
                Text("0").font(OBYazi.baslik(50)).foregroundColor(OBRenk.metin3)
            } else {
                Text(d.sayi(Double(ham) ?? 0))
                    .font(OBYazi.baslik(50))
                    .foregroundColor(OBRenk.ozetTutar)
                    .modifier(OBOzetGolge())
            }
            RoundedRectangle(cornerRadius: 1.5).fill(OBRenk.coral)
                .frame(width: 3, height: 44)
                .opacity(imlecGorunur || hareketAz ? 1 : 0)
                .alignmentGuide(.firstTextBaseline) { $0[.bottom] - 4 }
        }
        .lineLimit(1)
        .minimumScaleFactor(0.5)
        .onReceive(zamanlayici) { _ in imlecGorunur.toggle() }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(bos ? "0" : d.tutar(Double(ham) ?? 0))
    }
}

// 3x4 tus takimi: 1-9, 000, 0, sil. Her tusta hafif haptik.
struct OBTusTakimi: View {
    @ObservedObject var d: OBDurum
    @Binding var ham: String
    let tuslar = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0", "sil"]

    func bas(_ tus: String) {
        dokunusTitresimi()
        if tus == "sil" { ham = String(ham.dropLast()); return }
        guard ham.count < 12 else { return }
        var yeni = ham + tus
        while yeni.hasPrefix("0") { yeni.removeFirst() }
        ham = String(yeni.prefix(12))
    }

    var body: some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 6), count: 3), spacing: 6) {
            ForEach(tuslar, id: \.self) { tus in
                Button(action: { bas(tus) }) {
                    Group {
                        if tus == "sil" {
                            Image(systemName: "delete.left").font(.system(size: 22, weight: .medium))
                        } else {
                            Text(tus).font(OBYazi.mono(tus == "000" ? 20 : 24, 600))
                        }
                    }
                    .foregroundColor(OBRenk.metin)
                    .frame(maxWidth: .infinity)
                    .frame(height: 56)
                    .contentShape(Rectangle())
                }
                .buttonStyle(OBTusStili())
                .accessibilityLabel(tus == "sil" ? d.t("onboarding.tuslar.sil") : tus)
            }
        }
    }
}

struct OBTusStili: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .background(RoundedRectangle(cornerRadius: 14).fill(configuration.isPressed ? OBRenk.yuzey2 : Color.clear))
    }
}

struct OBGelir: View {
    @ObservedObject var d: OBDurum
    @State private var ham = ""

    var body: some View {
        OBKabuk(d: d, anahtar: "gelir", dugmeEtkin: d.gelir > 0, dikey: true) {
            OBTutarGosterimi(d: d, ham: ham)
            OBMonoEtiket(metin: d.t(d.siklik == "aylik" ? "onboarding.gelir.etiketKisa" : "onboarding.gelir.etiketKisaOrtalama"))
            if d.gelir > 0 {
                OBYankiMetni(parcalar: obParcala(d.t("onboarding.gelir.yanki"), ["tutar": d.tutar(d.gunluk)]))
                    .padding(.top, 10)
            }
            Spacer(minLength: 12)
            OBTusTakimi(d: d, ham: $ham)
        }
        .onChange(of: ham) { yeni in d.gelir = Double(yeni) ?? 0 }
        .onAppear { if d.gelir > 0 && ham.isEmpty { ham = String(Int(d.gelir)) } }
    }
}

struct OBTurler: View {
    @ObservedObject var d: OBDurum
    let turler = [("kart", "creditcard"), ("kredi", "building.2"), ("kmh", "wallet.pass"), ("kisi", "person.2")]

    var body: some View {
        let sayi = d.borcTurleri.count
        OBKabuk(d: d, anahtar: "turler",
                dugme: sayi > 0 ? d.t("onboarding.turler.dugme", ["n": "\(sayi)"]) : d.t("onboarding.devam"),
                dugmeEtkin: sayi > 0 || d.borcYok) {
            LazyVGrid(columns: [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)], spacing: 10) {
                ForEach(turler, id: \.0) { tur, simge in
                    OBSecimKarti(baslik: d.t("onboarding.turler.\(tur)"), simge: simge, secili: d.borcTurleri.contains(tur)) {
                        if let i = d.borcTurleri.firstIndex(of: tur) { d.borcTurleri.remove(at: i) } else { d.borcTurleri.append(tur) }
                        d.borcYok = false
                        d.borclar.removeAll { !d.borcTurleri.contains($0.tur) }
                    }
                }
            }
            OBEkSatir(baslik: d.t("onboarding.turler.yok"), alt: d.t("onboarding.turler.yokAlt"), secili: d.borcYok) {
                dokunusTitresimi()
                d.borcYok.toggle()
                d.borcTurleri = []
                d.borclar = []
            }
        }
    }
}

// Form alani: yuzey kutu, mono etiket, 18px girdi; odakta 2px lime ic halka.
struct OBAlan<Girdi: View>: View {
    let etiket: String
    let odakta: Bool
    @ViewBuilder let girdi: () -> Girdi

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            OBMonoEtiket(metin: etiket)
            girdi()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 16).fill(OBRenk.yuzey))
        .overlay(RoundedRectangle(cornerRadius: 16).strokeBorder(OBRenk.lime, lineWidth: odakta ? 2 : 0))
    }
}

struct OBMetinAlani: View {
    let etiket: String
    @Binding var metin: String
    var sayisal = false
    var yerTutucu = ""
    @FocusState private var odak: Bool

    var body: some View {
        OBAlan(etiket: etiket, odakta: odak) {
            TextField("", text: $metin, prompt: Text(yerTutucu).foregroundColor(OBRenk.metin3))
                .keyboardType(sayisal ? .numberPad : .default)
                .font(sayisal ? OBYazi.mono(18, 700) : OBYazi.govde(18, 700))
                .foregroundColor(OBRenk.metin)
                .focused($odak)
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
    @State private var odak = false

    var body: some View {
        OBAlan(etiket: etiket, odakta: odak) {
            HStack(spacing: 6) {
                Text(d.sembol).font(OBYazi.mono(14, 700)).foregroundColor(OBRenk.metin2)
                OBTutarGirdisi(metin: $metin, yerel: d.yerel, boyut: 18, odakDegisti: { odak = $0 })
                    .frame(height: 24)
            }
        }
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
    var odakDegisti: (Bool) -> Void = { _ in }

    func makeCoordinator() -> Koordinator { Koordinator(self) }

    func makeUIView(context: Context) -> UITextField {
        let alan = UITextField()
        alan.keyboardType = .decimalPad
        alan.font = UIFont(descriptor: UIFontDescriptor(fontAttributes: [.family: "JetBrains Mono"]), size: boyut)
        alan.textColor = UIColor { $0.userInterfaceStyle == .dark ? UIColor(red: 0.957, green: 0.937, blue: 0.878, alpha: 1) : UIColor(red: 0.078, green: 0.086, blue: 0.059, alpha: 1) }
        alan.attributedPlaceholder = NSAttributedString(string: "0", attributes: [.foregroundColor: UIColor(red: 0.541, green: 0.549, blue: 0.494, alpha: 1)])
        alan.delegate = context.coordinator
        alan.setContentHuggingPriority(.defaultLow, for: .horizontal)
        alan.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)
        alan.text = context.coordinator.bicimle(metin)
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

        func textFieldDidBeginEditing(_ alan: UITextField) { ust.odakDegisti(true) }
        func textFieldDidEndEditing(_ alan: UITextField) { ust.odakDegisti(false) }

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

struct OBBorcEkrani: View {
    @ObservedObject var d: OBDurum
    @State private var tur = "kart"
    @State private var ad = ""
    @State private var tutar = ""
    @State private var gun = ""
    @State private var taksit = ""
    @State private var kalanTaksit = ""
    @State private var hata = false

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

    var formDolu: Bool { [ad, tutar, gun, taksit, kalanTaksit].contains { !$0.trimmingCharacters(in: .whitespaces).isEmpty } }

    func kaydet() -> Bool {
        guard let b = taslak else { hata = true; return false }
        d.borclar.append(b)
        // Siradaki tur: secilip henuz eklenmemis ilk tur, yoksa ayni tur.
        let eklenenler = Set(d.borclar.map { $0.tur })
        tur = d.borcTurleri.first { !eklenenler.contains($0) } ?? tur
        ad = ""; tutar = ""; gun = ""; taksit = ""; kalanTaksit = ""
        hata = false
        return true
    }

    func altSatir(_ b: OBBorc) -> String {
        if b.tur == "kredi" { return d.t("onboarding.turler.kredi") + ", " + d.t("onboarding.karsilama.maketTaksit", ["n": "\(b.kalanTaksit ?? 0)"]) }
        return d.t("onboarding.turler.\(b.tur)")
    }

    var body: some View {
        let toplam = d.buAyOdemeler + (taslak?.buAyOdeme ?? 0)
        // Formda eksik borc varken ya da hic borc yokken "Bu kadar" pasif.
        let bitirilebilir = taslak != nil || (!formDolu && !d.borclar.isEmpty)
        // Atlanabilir: o ana kadar eklenen borclar kalir, yoksa borcsuz devam.
        OBKabuk(d: d, anahtar: "borc",
                dugme: d.t("onboarding.borc.dugme"),
                dugmeEtkin: bitirilebilir,
                atlanabilir: true,
                atlaEylemi: {
                    if d.borclar.isEmpty { d.borcYok = true; d.borcTurleri = [] }
                    d.ileri(atlandi: true)
                },
                dugmeEylemi: {
                    if formDolu, !kaydet() { return }
                    d.ileri()
                },
                baslikAnahtari: "onboarding.borc.baslik.\(tur)",
                aciklamaAnahtari: "onboarding.borc.aciklama.\(tur)") {
            if d.borcTurleri.count > 1 {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(d.borcTurleri, id: \.self) { t in
                            OBCip(baslik: d.t("onboarding.turler.\(t)"), secili: tur == t) { tur = t; hata = false }
                        }
                    }
                }
            }
            OBMetinAlani(etiket: d.t(tur == "kisi" ? "onboarding.borc.kime" : "onboarding.borc.banka"), metin: $ad,
                         yerTutucu: tur == "kisi" ? "" : d.t("onboarding.borc.ornek", ["deger": tur == "kredi" ? "QNB" : (tur == "kmh" ? "Enpara" : "Akbank")]))
            switch tur {
            case "kredi":
                OBTutarAlani(d: d, etiket: d.t("onboarding.borc.taksit"), metin: $taksit)
                OBMetinAlani(etiket: d.t("onboarding.borc.kalanTaksit"), metin: $kalanTaksit, sayisal: true, yerTutucu: d.t("onboarding.borc.ornek", ["deger": "18"]))
                OBMetinAlani(etiket: d.t("onboarding.borc.odemeGunu"), metin: $gun, sayisal: true, yerTutucu: d.t("onboarding.borc.ornek", ["deger": "15"]))
            case "kmh":
                OBTutarAlani(d: d, etiket: d.t("onboarding.borc.kullanilan"), metin: $tutar)
            case "kisi":
                OBTutarAlani(d: d, etiket: d.t("onboarding.borc.tutar"), metin: $tutar)
            default:
                OBTutarAlani(d: d, etiket: d.t("onboarding.borc.buAykiBorc"), metin: $tutar)
                OBMetinAlani(etiket: d.t("onboarding.borc.sonOdemeGunu"), metin: $gun, sayisal: true, yerTutucu: d.t("onboarding.borc.ornek", ["deger": "15"]))
            }
            if hata {
                Text(d.t("onboarding.borc.eksik")).font(OBYazi.govde(13, 700)).foregroundColor(OBRenk.ilerlemeSirada)
            }
            Button(action: { _ = kaydet() }) {
                HStack(spacing: 6) {
                    Image(systemName: "plus").font(.system(size: 13, weight: .bold))
                    Text(d.t("onboarding.borc.baskaEkle")).font(OBYazi.govde(14, 700))
                        .overlay(Rectangle().fill(OBRenk.metin).frame(height: 1).mask(
                            HStack(spacing: 3) { ForEach(0..<30, id: \.self) { _ in Rectangle().frame(width: 4) } }
                        ), alignment: .bottom)
                }
                .foregroundColor(OBRenk.metin)
                .padding(.horizontal, 8)
                .frame(height: 40)
            }
            .buttonStyle(.plain)
            ForEach(d.borclar) { b in
                HStack(spacing: 10) {
                    OBBankaLogosu(ad: b.ad, kisi: b.tur == "kisi", kisiEtiketi: d.t("onboarding.karsilama.kisiRozet"))
                    Text("\(b.ad) · \(altSatir(b))").font(OBYazi.govde(13.5, 700)).foregroundColor(OBRenk.metin).lineLimit(1)
                    Spacer(minLength: 6)
                    Text(d.tutar(b.tur == "kredi" ? (b.taksit ?? 0) : (b.tutar ?? 0)))
                        .font(OBYazi.mono(13, 700)).foregroundColor(OBRenk.metin)
                    Button(action: { d.borclar.removeAll { $0.id == b.id } }) {
                        Image(systemName: "xmark").font(.system(size: 13, weight: .bold)).foregroundColor(OBRenk.metin)
                            .frame(width: 32, height: 32)
                    }
                    .accessibilityLabel(d.t("onboarding.borc.kaldir", ["ad": b.ad]))
                }
                .padding(.leading, 14).padding(.trailing, 6).padding(.vertical, 10)
                .background(RoundedRectangle(cornerRadius: 16).fill(OBRenk.yuzey))
            }
            if toplam > 0 {
                OBYankiMetni(parcalar: obParcala(d.t("onboarding.borc.yanki"), ["tutar": d.tutar(toplam)]))
                    .padding(.top, 4)
            }
        }
        .onAppear { if let ilk = d.borcTurleri.first, !d.borcTurleri.contains(tur) { tur = ilk } }
    }
}

// Plan karti: her maasta odemelere giden tutar, yasam varsayimi satiri, iki
// dilimli serit (odemeler / gelirin kalani). Odemeler geliri asarsa serit
// tamamen coral.
struct OBPlanKarti: View {
    @ObservedObject var d: OBDurum

    var body: some View {
        let gelir = max(d.gelir, 1)
        let kalan = max(d.gelir - d.planOdemeleri, 0)
        let eksi = d.planOdemeleri > d.gelir
        let oranlar: [Double] = eksi ? [1, 0] : [d.planOdemeleri / gelir, kalan / gelir]
        VStack(alignment: .leading, spacing: 8) {
            OBMonoEtiket(metin: d.t("onboarding.plan.etiket"), renk: OBRenk.ozetMetin.opacity(0.75))
            Text(d.tutar(d.planOdemeleri))
                .font(OBYazi.baslik(40))
                .foregroundColor(OBRenk.ozetTutar)
                .modifier(OBOzetGolge())
                .lineLimit(1).minimumScaleFactor(0.6)
                .padding(.vertical, 2)
            Text(d.t("onboarding.plan.varsayim", ["gelir": d.tutar(d.gelir)]))
                .font(OBYazi.govde(12.5, 500))
                .foregroundColor(OBRenk.ozetMetin.opacity(0.8))
                .fixedSize(horizontal: false, vertical: true)
            GeometryReader { g in
                HStack(spacing: 3) {
                    let renkler = [OBRenk.coral, OBRenk.lime]
                    ForEach(oranlar.indices, id: \.self) { i in
                        if oranlar[i] > 0 {
                            Capsule().fill(renkler[i]).frame(width: max(6, (g.size.width - 3) * min(oranlar[i], 1)))
                        }
                    }
                }
            }
            .frame(height: 10)
            .padding(.top, 6)
            VStack(spacing: 6) {
                aciklama(OBRenk.coral, d.t("onboarding.plan.odemeler"), d.planOdemeleri)
                aciklama(OBRenk.lime, d.t("onboarding.plan.gelirinKalani"), kalan)
            }
            .padding(.top, 8)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(RoundedRectangle(cornerRadius: 22).fill(OBRenk.ozet))
    }

    private func aciklama(_ renk: Color, _ ad: String, _ tutar: Double) -> some View {
        HStack(spacing: 10) {
            RoundedRectangle(cornerRadius: 3).fill(renk).frame(width: 10, height: 10)
            Text(ad).font(OBYazi.govde(13, 500)).foregroundColor(OBRenk.ozetMetin)
            Spacer()
            Text(d.tutar(tutar)).font(OBYazi.mono(13, 700)).foregroundColor(OBRenk.ozetMetin)
        }
    }
}

struct OBPlan: View {
    @ObservedObject var d: OBDurum

    var body: some View {
        OBKabuk(d: d, anahtar: "plan", dugme: d.t("onboarding.plan.dugme")) {
            OBPlanKarti(d: d)
            if let ilk = d.ilkBitecek {
                let b = ilk.borc
                HStack(spacing: 10) {
                    Text("1")
                        .font(OBYazi.mono(12, 700))
                        .foregroundColor(OBRenk.ink)
                        .frame(width: 26, height: 26)
                        .background(Circle().fill(OBRenk.lime))
                    OBBankaLogosu(ad: b.ad, kisi: b.tur == "kisi", kisiEtiketi: d.t("onboarding.karsilama.kisiRozet"))
                    VStack(alignment: .leading, spacing: 2) {
                        Text(b.ad).font(OBYazi.govde(14, 700)).foregroundColor(OBRenk.metin)
                        if let gun = b.gun {
                            let aylik = b.tur == "kredi" || ilk.ay == nil ? b.buAyOdeme : (b.bakiye / Double(ilk.ay ?? 1)).rounded(.up)
                            Text(d.t("onboarding.plan.siradaki", ["tarih": d.tarih(d.sonrakiTarih(gun: gun)), "tutar": d.tutar(aylik)]))
                                .font(OBYazi.govde(12, 500)).foregroundColor(OBRenk.metin2)
                        }
                    }
                    Spacer(minLength: 6)
                    Text(d.tutar(b.bakiye))
                        .font(OBYazi.mono(12.5, 700))
                        .foregroundColor(OBRenk.ink)
                        .padding(.horizontal, 10).padding(.vertical, 6)
                        .background(RoundedRectangle(cornerRadius: 8).fill(OBRenk.coral))
                }
                .padding(14)
                .background(RoundedRectangle(cornerRadius: 18).fill(OBRenk.yuzey))
                let sure: [(String, Bool)] = {
                    if let ay = ilk.ay {
                        if ay == 1 { return [(d.t("onboarding.plan.buAyBiter", ["ad": b.ad]), false)] }
                        return obParcala(d.t("onboarding.plan.biterVurgu", ["ad": b.ad]), ["sure": d.t("onboarding.plan.ayda", ["ay": "\(ay)"])])
                    }
                    return [(d.t("onboarding.plan.yetmiyor"), false)]
                }()
                let odeme: [(String, Bool)] = d.ilkOdeme.map { [(" " + d.t("onboarding.plan.ilkOdeme", ["tarih": d.tarih($0.tarih)]), false)] } ?? []
                OBYankiMetni(parcalar: sure + odeme).padding(.top, 4)
            } else {
                OBYankiMetni(parcalar: [(d.t("onboarding.plan.borcsuz"), false)]).padding(.top, 4)
            }
        }
    }
}

// Kapanis: alttan buyuyen lime perde, Borcama logosu, "PLAN KURULDU.", baslik + coral
// golge, aciklama, ink CTA. Otomatik yonlendirme yok.
struct OBHazir: View {
    @ObservedObject var d: OBDurum
    @State private var perde = false
    @State private var asama = 0
    @Environment(\.accessibilityReduceMotion) private var hareketAz

    var ilkOdeme: Date? { d.ilkOdeme?.tarih }

    var body: some View {
        GeometryReader { g in
            ZStack {
                OBZemin()
                OBRenk.lime
                    .ignoresSafeArea()
                    .mask(
                        Circle()
                            .frame(width: g.size.height * 3, height: g.size.height * 3)
                            .scaleEffect(perde ? 1 : 0.001)
                            .position(x: g.size.width / 2, y: g.size.height * 1.2)
                    )
                VStack(spacing: 0) {
                    Spacer()
                    Group {
                        if let logo = UIImage(named: "BorcamaLogo") {
                            Image(uiImage: logo).resizable().scaledToFit().frame(width: 150)
                        } else {
                            Text("Borcama").font(OBYazi.baslik(30)).foregroundColor(OBRenk.ink)
                        }
                    }
                    .accessibilityLabel("Borcama")
                    .opacity(asama >= 1 ? 1 : 0).offset(y: asama >= 1 ? 0 : 10)
                    OBMonoEtiket(metin: d.t("onboarding.hazir.rozet"), renk: OBRenk.ink)
                        .padding(.top, 14)
                        .opacity(asama >= 2 ? 1 : 0).offset(y: asama >= 2 ? 0 : 10)
                    Text(d.ad.isEmpty ? d.t("onboarding.hazir.baslik") : d.t("onboarding.hazir.baslikAd", ["ad": d.ad.trimmingCharacters(in: .whitespaces)]))
                        .font(OBYazi.baslik(44))
                        .foregroundColor(OBRenk.ink)
                        .shadow(color: OBRenk.coral, radius: 0, x: 4, y: 4)
                        .multilineTextAlignment(.center)
                        .lineLimit(2).minimumScaleFactor(0.6)
                        .padding(.top, 10)
                        .accessibilityAddTraits(.isHeader)
                        .opacity(asama >= 3 ? 1 : 0).offset(y: asama >= 3 ? 0 : 10)
                    Text(ilkOdeme.map { d.t("onboarding.hazir.aciklama", ["tarih": d.tarih($0)]) } ?? d.t("onboarding.hazir.aciklamaBorcsuz"))
                        .font(OBYazi.govde(14.5, 500))
                        .foregroundColor(OBRenk.ink)
                        .multilineTextAlignment(.center)
                        .lineSpacing(3)
                        .frame(maxWidth: 300)
                        .padding(.top, 16)
                        .opacity(asama >= 4 ? 1 : 0).offset(y: asama >= 4 ? 0 : 10)
                    Spacer()
                    OBDugme(baslik: d.t("onboarding.hazir.dugme"), koyu: true) { d.bitir(cikis: d.misafir ? "misafir" : "tamam") }
                        .padding(.bottom, 24)
                        .opacity(asama >= 5 ? 1 : 0).offset(y: asama >= 5 ? 0 : 10)
                }
                .padding(.horizontal, 24)
            }
        }
        .onAppear {
            UINotificationFeedbackGenerator().notificationOccurred(.success)
            if hareketAz { perde = true; asama = 5; return }
            withAnimation(.timingCurve(0.2, 0.8, 0.2, 1, duration: 0.9).delay(0.15)) { perde = true }
            for (i, gecikme) in [0.7, 0.8, 0.95, 1.1, 1.3].enumerated() {
                DispatchQueue.main.asyncAfter(deadline: .now() + gecikme) {
                    withAnimation(.easeOut(duration: 0.4)) { asama = i + 1 }
                }
            }
        }
    }
}

// MARK: - Kok gorunum

struct OBAkis: View {
    @ObservedObject var d: OBDurum
    @Environment(\.accessibilityReduceMotion) private var hareketAz

    var body: some View {
        ZStack {
            if d.adim != .hazir { OBZemin() }
            Group {
                switch d.adim {
                case .acilis: OBAcilis(d: d)
                case .karsilama: OBKarsilama(d: d)
                case .dil: OBDil(d: d)
                case .gorunum: OBGorunum(d: d)
                case .ulke: OBUlkeEkrani(d: d)
                case .isim: OBIsim(d: d)
                case .hedef: OBHedef(d: d)
                case .siklik: OBSiklik(d: d)
                case .gun: OBMaasGunu(d: d)
                case .gelir: OBGelir(d: d)
                case .turler: OBTurler(d: d)
                case .borc: OBBorcEkrani(d: d)
                case .plan: OBPlan(d: d)
                case .hazir: OBHazir(d: d)
                }
            }
            .id(d.adim)
            // Adim girisi: 260 ms, asagidan 10px + solma (direktif §5).
            .transition(hareketAz ? .identity : .asymmetric(insertion: .opacity.combined(with: .offset(y: 10)), removal: .opacity))
        }
        .animation(hareketAz ? nil : .timingCurve(0.2, 0.8, 0.2, 1, duration: 0.26), value: d.adim)
        .environment(\.locale, d.yerel)
    }
}

final class OBDenetleyici: UIHostingController<OBAkis> {
    private let durum: OBDurum
    private var temaIzleyici: Any?
    private var adimIzleyici: Any?

    init(durum: OBDurum) {
        self.durum = durum
        OBYazi.kaydet()
        super.init(rootView: OBAkis(d: durum))
        // overFullScreen: altindaki webview pencereden cikarilmaz; giris
        // ekranina gecerken web onceden cizilmis olur ve yan yana kayarlar.
        modalPresentationStyle = .overFullScreen
        modalPresentationCapturesStatusBarAppearance = true
        // Akis kendi geri dugmesiyle gezinir; kaydirarak kapatma yok.
        isModalInPresentation = true
        #if DEBUG
        OBDenetleyici.ornekDurumuUygula(durum)
        #endif
        temayiUygula(durum.tema)
        temaIzleyici = durum.$tema.sink { [weak self] tema in self?.temayiUygula(tema) }
        // Kapanis perdesi iki temada da lime: durum cubugu orada hep koyu.
        adimIzleyici = durum.$adim.sink { [weak self] _ in DispatchQueue.main.async { self?.setNeedsStatusBarAppearanceUpdate() } }
    }

    #if DEBUG
    // Ekran goruntusu alirken: SIMCTL_CHILD_BORCAMA_OB_EKRAN=plan ve
    // BORCAMA_OB_TEMA=dark ile dogrudan o adim, ornek veriyle acilir.
    static func ornekDurumuUygula(_ d: OBDurum) {
        let ortam = ProcessInfo.processInfo.environment
        guard let ekran = ortam["BORCAMA_OB_EKRAN"], let adim = OBAdim(rawValue: ekran) else { return }
        if let tema = ortam["BORCAMA_OB_TEMA"], OBDurum.temalar.contains(tema) { d.tema = tema }
        d.ad = "Özer"
        d.ulke = d.ulke.isEmpty ? "TR" : d.ulke
        d.maasGunu = 15
        d.gelir = 32000
        d.borcTurleri = ["kart", "kredi"]
        d.borclar = [
            OBBorc(tur: "kart", ad: "Akbank", tutar: 6200, gun: 12),
            OBBorc(tur: "kredi", ad: "QNB", gun: 5, taksit: 4150, kalanTaksit: 8),
        ]
        d.gecmis = [.karsilama]
        d.adim = adim
    }
    #endif

    @MainActor required dynamic init?(coder: NSCoder) { nil }

    // "system" cihazi izler; "light"/"dark" secimi akisin tamamini aninda cevirir.
    private func temayiUygula(_ tema: String) {
        switch tema {
        case "dark": overrideUserInterfaceStyle = .dark
        case "light": overrideUserInterfaceStyle = .light
        default: overrideUserInterfaceStyle = .unspecified
        }
        view.backgroundColor = UIColor { $0.userInterfaceStyle == .dark
            ? UIColor(red: 0.059, green: 0.067, blue: 0.039, alpha: 1)
            : UIColor(red: 0.957, green: 0.937, blue: 0.878, alpha: 1) }
        setNeedsStatusBarAppearanceUpdate()
    }

    override func traitCollectionDidChange(_ previous: UITraitCollection?) {
        super.traitCollectionDidChange(previous)
        setNeedsStatusBarAppearanceUpdate()
    }

    override var preferredStatusBarStyle: UIStatusBarStyle {
        if durum.adim == .hazir { return .darkContent }
        return traitCollection.userInterfaceStyle == .dark ? .lightContent : .darkContent
    }
}
