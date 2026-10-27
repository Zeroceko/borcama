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
    @Published var dil: String
    @Published var ulke: String
    @Published var paraBirimi: String
    @Published var ad = ""
    @Published var hedef = "borc"
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

    func t(_ anahtar: String, _ degerler: [String: String] = [:]) -> String {
        var metin = metinler[dil]?[anahtar] ?? metinler["en"]?[anahtar] ?? metinler["tr"]?[anahtar] ?? anahtar
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
        return bicim.string(from: d)
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

    func kalanGun(_ d: Date) -> Int {
        takvim.dateComponents([.day], from: takvim.startOfDay(for: bugun), to: d).day ?? 0
    }

    var gunluk: Double { gelir / 30 }
    var buAyOdemeler: Double { borclar.reduce(0) { $0 + $1.buAyOdeme } }
    var yasamTutari: Double { yasam ?? 0 }
    var kalan: Double { gelir - buAyOdemeler - yasamTutari }

    // Ilk bitecek borc (ilkBitecekBorc): kredi kalan taksitle biter; digerine
    // gidebilecek tutar = gelir - yasam - diger borclarin aylik odemesi.
    // Gelir yetmiyorsa ay nil.
    var ilkBitecek: (borc: OBBorc, ay: Int?)? {
        guard let ilk = borclar.first else { return nil }
        let sureler: [(OBBorc, Int?)] = borclar.map { b in
            if b.tur == "kredi" { return (b, b.kalanTaksit.flatMap { $0 > 0 ? $0 : nil }) }
            let digerleri = borclar.filter { $0.id != b.id }.reduce(0) { $0 + $1.buAyOdeme }
            let guc = gelir - yasamTutari - digerleri
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
            "ulke": ulke,
            "paraBirimi": paraBirimi,
            "ad": ad.trimmingCharacters(in: .whitespacesAndNewlines),
            "hedef": hedef,
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
                        RoundedRectangle(cornerRadius: 27).fill(OBRenk.coral).offset(x: 0, y: 4)
                        RoundedRectangle(cornerRadius: 27).fill(etkin ? OBRenk.lime : OBRenk.lime.opacity(0.45))
                        RoundedRectangle(cornerRadius: 27).stroke(OBRenk.murekkep, lineWidth: 1.5)
                    }
                )
        }
        .buttonStyle(.plain)
        .disabled(!etkin)
        .opacity(etkin ? 1 : 0.6)
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
                    RoundedRectangle(cornerRadius: 14).stroke(OBRenk.murekkep, lineWidth: secili ? 1.5 : 1)
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
                .padding(.horizontal, 14)
                .frame(height: 38)
                .background(Capsule().fill(secili ? OBRenk.coral : OBRenk.beyaz))
                .overlay(Capsule().stroke(OBRenk.murekkep, lineWidth: 1))
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
            toplam + (parca.1
                ? Text(parca.0).font(.system(size: 16, weight: .bold, design: .monospaced))
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
                    .overlay(Circle().stroke(OBRenk.murekkep, lineWidth: 1.2))
            }
            .accessibilityLabel(d.t("onboarding.geri"))
            HStack(spacing: 4) {
                ForEach(liste.indices, id: \.self) { i in
                    RoundedRectangle(cornerRadius: 3)
                        .fill(i < sira ? OBRenk.murekkep : (i == sira ? OBRenk.coral : OBRenk.beyaz))
                        .overlay(RoundedRectangle(cornerRadius: 3).stroke(OBRenk.murekkep, lineWidth: i < sira ? 0 : 1))
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
    var baslikAnahtari: String? = nil
    var aciklamaAnahtari: String? = nil
    @ViewBuilder let icerik: () -> Icerik

    var body: some View {
        let liste = d.numaralilar
        let sira = (liste.firstIndex(of: d.adim) ?? 0) + 1
        VStack(alignment: .leading, spacing: 0) {
            OBUstBar(d: d).padding(.top, 8)
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
                    OBBaslik(gri: d.t("onboarding.\(anahtar).baslikGri"), vurgu: d.t(baslikAnahtari ?? "onboarding.\(anahtar).baslik"))
                    Text(d.t(aciklamaAnahtari ?? "onboarding.\(anahtar).aciklama"))
                        .font(.system(size: 14))
                        .foregroundColor(OBRenk.gri)
                        .padding(.bottom, 16)
                    icerik()
                }
                .padding(.bottom, 24)
            }
            OBDugme(baslik: dugme ?? d.t("onboarding.devam"), etkin: dugmeEtkin) {
                if let dugmeEylemi { dugmeEylemi() } else { d.ileri() }
            }
            .padding(.bottom, 12)
        }
        .padding(.horizontal, 20)
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
                    .overlay(Circle().stroke(OBRenk.murekkep, lineWidth: 1))
                    .frame(width: g.size.width * 0.75)
                    .position(x: g.size.width * 0.95, y: g.size.height * 0.2)
                Circle().fill(OBRenk.mint)
                    .overlay(Circle().stroke(OBRenk.murekkep, lineWidth: 1))
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
                        .overlay(Capsule().stroke(OBRenk.murekkep, lineWidth: 1))
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
                Button(d.t("onboarding.karsilama.hesabimVar")) { d.bitir(cikis: "giris") }
                // Hesapsiz kullanim: ayni kurulum akisi, sonunda kayit yerine
                // veriler cihazda kalir.
                Button(d.t("onboarding.karar.misafir")) { d.misafir = true; d.ileri() }
            }
            .font(.system(size: 14, weight: .semibold))
            .foregroundColor(OBRenk.murekkep)
            .underline()
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
            GeometryReader { g in
                HStack(spacing: 3) {
                    let renkler = [OBRenk.murekkep, OBRenk.beyaz, OBRenk.lime]
                    ForEach(oranlar.indices, id: \.self) { i in
                        Capsule().fill(renkler[i % 3])
                            .overlay(Capsule().stroke(OBRenk.murekkep, lineWidth: 1))
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
                RoundedRectangle(cornerRadius: 16).stroke(OBRenk.murekkep, lineWidth: 1.5)
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
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(OBRenk.murekkep, lineWidth: 1))
    }
}

struct OBDil: View {
    @ObservedObject var d: OBDurum
    let diller: [(String, String, String)] = [
        ("tr", "Türkçe", "🇹🇷"), ("en", "English", "🇬🇧"), ("de", "Deutsch", "🇩🇪"),
        ("fr", "Français", "🇫🇷"), ("es", "Español", "🇪🇸"), ("it", "Italiano", "🇮🇹"),
    ]

    var body: some View {
        OBKabuk(d: d, anahtar: "dil") {
            VStack(spacing: 10) {
                ForEach(diller, id: \.0) { kod, ad, bayrak in
                    OBSecenek(baslik: ad, sag: kod.uppercased(), solSimge: bayrak, secili: d.dil == kod) {
                        d.dil = kod
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

    // Tespit edilen ulke ustte; ardindan sik kullanilanlar.
    var oneCikanlar: [OBUlke] {
        var liste = d.ulkeler.filter { $0.kod == d.ulke }
        for u in d.ulkeler where u.sik && u.kod != d.ulke { liste.append(u) }
        return Array(liste.prefix(4))
    }

    // Tam liste secili dilde alfabetik.
    var tumu: [OBUlke] {
        d.ulkeler.sorted { $0.ad(d.dil).compare($1.ad(d.dil), locale: d.yerel) == .orderedAscending }
    }

    var body: some View {
        OBKabuk(d: d, anahtar: "ulke", dugmeEtkin: !d.ulke.isEmpty) {
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
                .textContentType(.givenName)
                .submitLabel(.next)
                .focused($odak)
                .padding(16)
                .background(RoundedRectangle(cornerRadius: 14).fill(OBRenk.beyaz))
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(OBRenk.murekkep, lineWidth: 1.2))
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
        let sonraki = d.sonrakiTarih(gun: d.maasGunu)
        let kalan = d.kalanGun(sonraki)
        OBKabuk(d: d, anahtar: "gun") {
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
                                    .overlay(Circle().stroke(OBRenk.murekkep, lineWidth: 1))
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
    @FocusState private var odak: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            if !etiket.isEmpty {
                Text(etiket.uppercased())
                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                    .foregroundColor(OBRenk.gri)
            }
            HStack(spacing: 4) {
                Text(d.sembol)
                TextField("0", text: $metin)
                    .keyboardType(.decimalPad)
                    .focused($odak)
                    .onChange(of: metin) { yeni in metin = bicimle(yeni) }
            }
            .font(.system(size: buyuk ? 44 : 20, weight: .bold, design: .monospaced))
            .foregroundColor(OBRenk.murekkep)
        }
        .padding(buyuk ? 0 : 12)
        .background(buyuk ? nil : RoundedRectangle(cornerRadius: 14).fill(OBRenk.beyaz))
        .overlay(buyuk ? nil : RoundedRectangle(cornerRadius: 14).stroke(OBRenk.murekkep, lineWidth: 1.2))
        .onAppear { if odakla { DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { odak = true } } }
    }

    // Yazarken binlik ayrac eklenir (70000 → 70.000).
    func bicimle(_ ham: String) -> String {
        let n = obSayi(ham, d.yerel)
        guard n > 0 else { return ham.filter { $0.isNumber }.isEmpty ? "" : ham }
        let ayrac = d.yerel.decimalSeparator ?? ","
        if ham.hasSuffix(ayrac) { return ham }
        let bicim = NumberFormatter()
        bicim.numberStyle = .decimal
        bicim.locale = d.yerel
        bicim.maximumFractionDigits = 2
        let sonuc = bicim.string(from: NSNumber(value: n)) ?? ham
        return sonuc == ham ? ham : sonuc
    }
}

struct OBGelir: View {
    @ObservedObject var d: OBDurum
    @State private var metin = ""

    var body: some View {
        OBKabuk(d: d, anahtar: "gelir", dugme: d.t("onboarding.gelir.dugme"), dugmeEtkin: d.gelir > 0) {
            OBTutarAlani(d: d, etiket: "", metin: $metin, buyuk: true, odakla: true)
                .onChange(of: metin) { yeni in d.gelir = obSayi(yeni, d.yerel) }
            Text(d.t("onboarding.gelir.herAy")).font(.system(size: 13)).foregroundColor(OBRenk.gri)
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
        OBKabuk(d: d, anahtar: "borc",
                dugme: d.t("onboarding.borc.dugme"),
                dugmeEtkin: taslak != nil || !d.borclar.isEmpty,
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
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(OBRenk.murekkep, lineWidth: 1))
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
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(OBRenk.murekkep, lineWidth: 1.2))
    }
}

struct OBYasam: View {
    @ObservedObject var d: OBDurum
    @State private var kendim = false
    @State private var metin = ""

    var body: some View {
        OBKabuk(d: d, anahtar: "yasam", atlanabilir: true) {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 100), spacing: 8)], alignment: .leading, spacing: 8) {
                ForEach([0.30, 0.45, 0.60], id: \.self) { oran in
                    let deger = (d.gelir * oran).rounded()
                    OBCip(baslik: d.tutar(deger), secili: !kendim && d.yasam == deger) {
                        kendim = false
                        d.yasam = deger
                    }
                }
                OBCip(baslik: d.t("onboarding.yasam.kendim"), secili: kendim) { kendim = true }
            }
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
        let oranlar = [d.buAyOdemeler / gider, d.yasamTutari / gider, max(0, d.kalan) / gider]
        OBKabuk(d: d, anahtar: "plan", dugme: d.t("onboarding.plan.dugme")) {
            OBPlanKarti(d: d,
                        etiket: d.t("onboarding.plan.etiket"),
                        tutar: d.tutar(d.kalan),
                        alt: d.t("onboarding.plan.formul", [
                            "gelir": d.tutar(d.gelir),
                            "odemeler": d.tutar(d.buAyOdemeler),
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
                        .overlay(Circle().stroke(OBRenk.murekkep, lineWidth: 1))
                    VStack(alignment: .leading, spacing: 2) {
                        Text(b.ad).font(.system(size: 14, weight: .semibold))
                        if let gun = b.gun {
                            Text(d.tarih(d.sonrakiTarih(gun: gun))).font(.system(size: 12)).foregroundColor(OBRenk.gri)
                        }
                    }
                    Spacer()
                    Text(d.tutar(b.buAyOdeme > 0 ? b.buAyOdeme : b.bakiye))
                        .font(.system(size: 13, weight: .bold, design: .monospaced))
                        .padding(.horizontal, 8).padding(.vertical, 4)
                        .background(Capsule().fill(OBRenk.coral))
                        .overlay(Capsule().stroke(OBRenk.murekkep, lineWidth: 1))
                }
                .foregroundColor(OBRenk.murekkep)
                .padding(12)
                .background(RoundedRectangle(cornerRadius: 14).fill(OBRenk.beyaz))
                .overlay(RoundedRectangle(cornerRadius: 14).stroke(OBRenk.murekkep, lineWidth: 1.2))
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
                        RoundedRectangle(cornerRadius: 16).stroke(OBRenk.murekkep, lineWidth: 1.5)
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
                case .hedef:
                    OBTekSecim(d: d, anahtar: "hedef", secenekler: ["borc", "aySonu", "kontrol"], secili: d.hedef) { d.hedef = $0 }
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
            .transition(.asymmetric(insertion: .move(edge: .trailing).combined(with: .opacity),
                                    removal: .opacity))
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
        // Akis kendi geri dugmesiyle gezinir; kaydirarak kapatma yok.
        isModalInPresentation = true
    }

    @MainActor required dynamic init?(coder: NSCoder) { nil }

    override var preferredStatusBarStyle: UIStatusBarStyle { .darkContent }
}
