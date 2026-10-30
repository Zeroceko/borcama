import Foundation
import UIKit
import WebKit
import Capacitor

// Uygulamanin alt gezinme cubugu artik HTML degil, iOS'un kendi UITabBar'i.
// Webview'in uzerine, guvenli alana oturacak sekilde ekleniyor.
//
// Web ile haberlesme Capacitor eklenti kaydina degil, dogrudan WebKit mesaj
// kanalina dayaniyor: uygulama hedefinde tanimlanan eklentiler bu Capacitor
// surumunde JS tarafina tanitilmiyor ve cagrilar yanitsiz kaliyordu.
// Web -> native: window.webkit.messageHandlers.borcamaTab.postMessage(...)
// Native -> web: borcamaSekmeSecildi olayi.
class BorcamaBridgeViewController: CAPBridgeViewController, WKScriptMessageHandler, UITabBarDelegate {

    // Web tarafindaki sekme anahtarlari ile cubuk sirasi ayni olmali.
    private static let anahtarlar = ["ozet", "borclar", "hareketler", "varliklar"]
    private static let varsayilanBasliklar = ["Bugün", "Borçlar", "Hareketler", "Varlıklar"]
    // Etiketler web tarafindan secili dilde gelir (hazirla mesajindaki
    // "basliklar"); gelmezse Turkce varsayilanlar kullanilir.
    private var basliklar = BorcamaBridgeViewController.varsayilanBasliklar
    private static let simgeler = [
        "chart.bar.fill",
        "creditcard.fill",
        "arrow.left.arrow.right",
        "banknote.fill",
    ]

    private var cubuk: UITabBar?
    private var koyuTema = false
    // Web "goster" mesajiyla cubugu gizleyebiliyor (giris ekrani, hukuki
    // sayfalar). Klavye kapaninca cubuk bu tercihe gore geri gelir; aksi
    // halde web'in gizledigi cubuk klavyeden sonra yeniden beliriyordu.
    private var webGosterilsin = true
    private var klavyeAcik = false
    // Web'e en son bildirilen gorunur cubuk yuksekligi (nokta).
    private var bildirilenYukseklik: CGFloat = -1

    // Cubuk uygulamanin kendi temasini izliyor; sistem temasini degil. Kullanici
    // uygulama icinden koyu temaya gecince cubuk da koyuya donuyor.
    private func temayiUygula(_ koyu: Bool) {
        koyuTema = koyu
        temaBelirli = true
        zeminiUygula()
        guard let cubuk else { return }
        cubuk.overrideUserInterfaceStyle = koyu ? .dark : .light
        cubuk.tintColor = koyu
            ? UIColor(red: 0.80, green: 0.98, blue: 0.35, alpha: 1)
            : UIColor(red: 0.078, green: 0.086, blue: 0.059, alpha: 1) // ink #14160f (mobil marka kilavuzu)
        cubuk.unselectedItemTintColor = koyu
            ? UIColor(red: 0.69, green: 0.71, blue: 0.66, alpha: 1)
            : UIColor(red: 0.36, green: 0.38, blue: 0.33, alpha: 1)
    }
    // Web uygulama temasini bildirene kadar (giris oncesi ekranlar) zemin
    // sistem temasini izler.
    private var temaBelirli = false

    // Klavye acilinca webview klavye kadar kisaliyor (Keyboard.resize =
    // native); klavyenin yuvarlak koselerinin ve gecis animasyonunun
    // arkasinda pencere gorunuyordu ve pencere siyahti. Pencere ve webview
    // zemini uygulamanin zeminine (--oa-zemin: #f4efe0 / #0f110a) boyanir.
    private func zeminiUygula() {
        let acik = UIColor(red: 0.957, green: 0.937, blue: 0.878, alpha: 1)
        let koyu = UIColor(red: 0.059, green: 0.067, blue: 0.039, alpha: 1)
        let renk: UIColor = temaBelirli
            ? (koyuTema ? koyu : acik)
            : UIColor { $0.userInterfaceStyle == .dark ? koyu : acik }
        view.window?.backgroundColor = renk
        view.backgroundColor = renk
        webView?.scrollView.backgroundColor = renk
    }

    private var kanalKuruldu = false
    private var onboardingAcik = false
    // "Zaten hesabim var": web giris ekranini cizince borcamaOnboarding
    // kanalina { tip: "girisHazir" } gonderir; karsilama ancak o zaman kayar,
    // aksi halde altta yukleniyor ekrani gorunup giris birden beliriyordu.
    fileprivate var girisHazir = false
    fileprivate var girisHazirBekleyen: (() -> Void)?

    override func capacitorDidLoad() {
        guard !kanalKuruldu else { return }
        kanalKuruldu = true
        webView?.configuration.userContentController.add(self, name: "borcamaTab")
        webView?.configuration.userContentController.add(self, name: "borcamaOnboarding")
        // Uygulamalarda kaydirma cubugu gosterilmez; webview'in kendi
        // gostergesi kapatiliyor.
        webView?.scrollView.showsVerticalScrollIndicator = false
        webView?.scrollView.showsHorizontalScrollIndicator = false
        NotificationCenter.default.addObserver(
            self, selector: #selector(panodanKodOku),
            name: UIApplication.didBecomeActiveNotification, object: nil)
        NotificationCenter.default.addObserver(
            self, selector: #selector(klavyeCercevesiDegisti(_:)),
            name: UIResponder.keyboardWillChangeFrameNotification, object: nil)
        NotificationCenter.default.addObserver(
            self, selector: #selector(klavyeCercevesiDegisti(_:)),
            name: UIResponder.keyboardWillHideNotification, object: nil)
    }

    // MARK: - Klavye

    // Keyboard.resize "none": webview kuculmez. Klavyenin pencerede kapladigi
    // yukseklik (nokta) ve animasyon suresi (sn) web'e "borcamaKlavye"
    // olayiyla gider; kapanista yukseklik 0. Web alt boslugu (--klavye) ayni
    // surede canlandirir, boylece dugme klavyeyle birlikte kayar.
    private var bildirilenKlavye: CGFloat = -1

    @objc private func klavyeCercevesiDegisti(_ bildirim: Notification) {
        let bilgi = bildirim.userInfo ?? [:]
        let sure = (bilgi[UIResponder.keyboardAnimationDurationUserInfoKey] as? Double) ?? 0.25
        var yukseklik: CGFloat = 0
        if bildirim.name != UIResponder.keyboardWillHideNotification,
           let son = (bilgi[UIResponder.keyboardFrameEndUserInfoKey] as? NSValue)?.cgRectValue,
           let pencere = view.window {
            let cerceve = pencere.convert(son, from: nil)
            yukseklik = max(0, pencere.bounds.maxY - cerceve.minY)
        }
        yukseklik = yukseklik.rounded()
        guard yukseklik != bildirilenKlavye else { return }
        bildirilenKlavye = yukseklik
        webOlayi("borcamaKlavye", ["yukseklik": Double(yukseklik), "sure": sure])
    }

    // MARK: - Panodan kod

    // iOS tek kullanimlik kodu yalniz Mesajlar ve Mail'den oneriyor; Gmail
    // gibi uygulamalardan kopyalanan kod icin kod ekrani acikken uygulamaya
    // donulunce pano kontrol edilir. Sayac kod ekrani acildigindaki pano
    // durumudur: o andan sonra kopyalanmamis icerik okunmaz. Icerik sayi
    // gibi gorunmuyorsa okunmaz, boylece yapistirma izni sorulmaz.
    private var kodPanoSayaci: Int?

    @objc private func panodanKodOku() {
        let pano = UIPasteboard.general
        guard let sayac = kodPanoSayaci, pano.changeCount != sayac else { return }
        kodPanoSayaci = pano.changeCount
        pano.detectPatterns(for: [.number]) { sonuc in
            guard case .success(let bulunan) = sonuc, bulunan.contains(.number) else { return }
            DispatchQueue.main.async {
                guard let metin = pano.string,
                      let aralik = metin.range(of: #"(?<!\d)\d{6}(?!\d)"#, options: .regularExpression)
                else { return }
                self.webOlayi("borcamaPanodanKod", ["kod": String(metin[aralik])])
            }
        }
    }

    // MARK: - Web'den gelen mesajlar

    func userContentController(_ userContentController: WKUserContentController,
                               didReceive message: WKScriptMessage) {
        if message.name == "borcamaOnboarding" {
            guard let govde = message.body as? [String: Any], let tip = govde["tip"] as? String else { return }
            DispatchQueue.main.async {
                if tip == "baslat" { self.onboardingiAc(govde) }
                if tip == "girisHazir" { self.girisHazirGeldi() }
            }
            return
        }
        guard message.name == "borcamaTab",
              let govde = message.body as? [String: Any],
              let tip = govde["tip"] as? String else { return }

        DispatchQueue.main.async {
            switch tip {
            case "hazirla":
                if let gelen = govde["basliklar"] as? [String],
                   gelen.count == Self.anahtarlar.count,
                   !gelen.contains(where: { $0.isEmpty }) {
                    self.basliklar = gelen
                }
                self.cubuguKur()
                AcilisPerdesi.kaldir()
            case "sec":
                if let anahtar = govde["anahtar"] as? String { self.secileniAyarla(anahtar) }
            case "tema":
                self.temayiUygula(govde["koyu"] as? Bool ?? false)
            case "goster":
                self.webGosterilsin = govde["gorunsun"] as? Bool ?? true
                self.gorunurluguUygula()
            case "gelenDosyaSil":
                if let adres = govde["adres"] as? String { GelenDosya.sil(adres) }
            case "kodBekle":
                self.kodPanoSayaci = govde["acik"] as? Bool == true ? UIPasteboard.general.changeCount : nil
            default:
                break
            }
        }
    }

    // MARK: - Cubuk

    private func cubuguKur() {
        guard cubuk == nil else { return }
        // Capacitor'da bu denetleyicinin view'i dogrudan WKWebView. Webview'in
        // alt gorunumu olarak eklenen cubuk ciziliyor ama dokunuslar webview'e
        // gidiyor; bu yuzden cubuk pencereye ekleniyor.
        guard let pencere = view.window else {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { self.cubuguKur() }
            return
        }

        let yeni = UITabBar()
        yeni.translatesAutoresizingMaskIntoConstraints = false
        yeni.delegate = self
        cubuk = yeni
        temayiUygula(koyuTema)

        yeni.items = Self.anahtarlar.indices.map { sira in
            let oge = UITabBarItem(
                title: self.basliklar[sira],
                image: UIImage(systemName: Self.simgeler[sira]),
                tag: sira
            )
            oge.accessibilityLabel = self.basliklar[sira]
            return oge
        }
        yeni.selectedItem = yeni.items?.first
        // Genislik sabitlenmiyor; cubuk pencereyle birlikte uzayip kisaliyor.
        // .automatic: dar pencerede (iPhone, Split View) ogeler genislige
        // yayilir, genis pencerede (iPad, iPhone Duo ic ekrani; yatay size
        // class regular) UIKit ogeleri sabit genislikte ortalar. Ozel bir
        // maksimum genislik yerine sistemin iPad davranisi kullaniliyor.
        yeni.itemPositioning = .automatic

        // Cubuk guvenli alanin ustune oturuyor. Altinda kalan serit webview'in
        // kendi arka planiyla doluyor; buraya ayri bir katman koyulursa sistem
        // koyu temadayken uygulamanin acik zemininin altinda koyu bir bant
        // olarak goruluyordu.
        pencere.addSubview(yeni)
        NSLayoutConstraint.activate([
            yeni.leadingAnchor.constraint(equalTo: pencere.leadingAnchor),
            yeni.trailingAnchor.constraint(equalTo: pencere.trailingAnchor),
            yeni.bottomAnchor.constraint(equalTo: pencere.safeAreaLayoutGuide.bottomAnchor),
        ])
        pencere.bringSubviewToFront(yeni)
        // Kisitlar etkinlesir etkinlesmez cerceve hala sifir; olcmeden once
        // yerlesim bitirilir. Aksi halde --sekme-cubugu pencerenin tamami
        // (iPhone 17 Pro Max simulatorunde 889px) olarak bildiriliyor ve asistan penceresi sifir yukseklige
        // iniyordu. Cubugun kendi yerlesimi bu denetleyicinin
        // viewDidLayoutSubviews'unu tetiklemedigi icin deger duzelmiyordu.
        pencere.layoutIfNeeded()
        yerlesimiGuncelle()

        // Klavye acilinca cubuk klavyenin uzerinde asili kalmasin.
        NotificationCenter.default.addObserver(
            self, selector: #selector(klavyeAcildi),
            name: UIResponder.keyboardWillShowNotification, object: nil)
        NotificationCenter.default.addObserver(
            self, selector: #selector(klavyeKapandi),
            name: UIResponder.keyboardWillHideNotification, object: nil)
    }

    private func secileniAyarla(_ anahtar: String) {
        guard let ogeler = cubuk?.items else { return }
        // Ayarlar gibi sekmelerden biri olmayan ekranlarda hicbiri secili
        // gorunmemeli; aksi halde onceki sekme yanik kaliyor.
        guard let sira = Self.anahtarlar.firstIndex(of: anahtar), sira < ogeler.count else {
            cubuk?.selectedItem = nil
            return
        }
        cubuk?.selectedItem = ogeler[sira]
    }

    @objc private func klavyeAcildi() {
        DispatchQueue.main.async {
            self.klavyeAcik = true
            self.gorunurluguUygula()
        }
    }

    @objc private func klavyeKapandi() {
        DispatchQueue.main.async {
            self.klavyeAcik = false
            self.gorunurluguUygula()
        }
    }

    private func gorunurluguUygula() {
        cubuk?.isHidden = !webGosterilsin || klavyeAcik || onboardingAcik
        yuksekligiBildir()
    }

    // MARK: - Pencere boyutu ve guvenli alan
    //
    // Pencere boyutu sabit degil: iPhone Duo katlanip acilinca, yarim
    // katlanmis durumda, Split View'de ve dondurmede degisir; guvenli alan
    // kenarlari da asimetrik olabilir. Bu yuzden hicbir olcu sabit yazilmiyor,
    // UIScreen.main ya da cihaz yonelimi okunmuyor. Her deger pencerenin o
    // anki guvenli alanindan hesaplaniyor ve asagidaki her degisiklikte
    // yeniden uygulaniyor.

    override func viewSafeAreaInsetsDidChange() {
        super.viewSafeAreaInsetsDidChange()
        yerlesimiGuncelle()
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        // Pencere ilk yerlesimde baglanir; zemin o zaman boyanabilir.
        if view.window?.backgroundColor != view.backgroundColor { zeminiUygula() }
        yerlesimiGuncelle()
    }

    override func viewWillTransition(to size: CGSize,
                                     with coordinator: UIViewControllerTransitionCoordinator) {
        super.viewWillTransition(to: size, with: coordinator)
        coordinator.animate(alongsideTransition: { _ in
            self.yerlesimiGuncelle()
        }, completion: { _ in
            self.yerlesimiGuncelle()
        })
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        if #available(iOS 17.0, *) {
            registerForTraitChanges([UITraitHorizontalSizeClass.self,
                                     UITraitVerticalSizeClass.self]) { (vc: BorcamaBridgeViewController, _: UITraitCollection) in
                vc.yerlesimiGuncelle()
            }
        }
    }

    // iOS 17 oncesi icin; iOS 17+ yukaridaki registerForTraitChanges'i kullanir.
    @available(iOS, deprecated: 17.0)
    override func traitCollectionDidChange(_ previous: UITraitCollection?) {
        super.traitCollectionDidChange(previous)
        if #unavailable(iOS 17.0) { yerlesimiGuncelle() }
    }

    // Sahne geometrisi degisince (SceneDelegate) cagrilir.
    func pencereGeometrisiDegisti() {
        view.setNeedsLayout()
        yerlesimiGuncelle()
    }

    private func yerlesimiGuncelle() {
        guard let cubuk, let pencere = cubuk.window else { return }
        // UITabBar kendi icinde ev cubugu icin bosluk birakiyor; guvenli alana
        // oturtuldugunda bu bosluk ustune binince cubuk ekranin cok
        // yukarisinda kaliyordu. Yukseklige dokunmadan alt guvenli alan
        // kadar (1 nokta eksik) asagi kaydiriliyor ki ic yerlesim bozulmasin.
        // Eskiden sabit 33'tu (dikey iPhone'da 34 - 1); artik pencerenin o
        // anki alt boslugundan hesaplaniyor: yatay iPhone'da 21, iPad ve Duo
        // ic ekraninda 20, ev cubugu olmayan pencerede 0.
        let kayma = max(0, pencere.safeAreaInsets.bottom - 1)
        if cubuk.transform.ty != kayma {
            cubuk.transform = CGAffineTransform(translationX: 0, y: kayma)
        }
        yuksekligiBildir()
    }

    // Cubugun alt guvenli alanin ustunde kapladigi yukseklik web'e CSS
    // degiskeni olarak bildirilir (--sekme-cubugu). Web, pencerelerin alt
    // boslugunu buna gore birakir; boylece katlanabilir ekranda veya iPad
    // duzeninde cubuk yuksekligi degisse de icerik altinda kalmaz.
    private func yuksekligiBildir() {
        guard let cubuk, let pencere = cubuk.window else { return }
        // Henuz yerlesmemis cubuk (yukseklik 0) olculmez; gorunen kisim
        // cubugun kendi yuksekligini asamaz.
        guard cubuk.isHidden || cubuk.bounds.height > 0 else { return }
        let gorunur: CGFloat = cubuk.isHidden
            ? 0
            : min(cubuk.bounds.height,
                  max(0, (pencere.bounds.height - pencere.safeAreaInsets.bottom) - cubuk.frame.minY))
        let yuvarlak = gorunur.rounded(.up)
        guard yuvarlak != bildirilenYukseklik else { return }
        bildirilenYukseklik = yuvarlak
        let js = "document.documentElement.style.setProperty('--sekme-cubugu','\(Int(yuvarlak))px')"
        webView?.evaluateJavaScript(js, completionHandler: nil)
    }

    // MARK: - UITabBarDelegate

    func tabBar(_ tabBar: UITabBar, didSelect item: UITabBarItem) {
        let sira = item.tag
        guard sira >= 0, sira < Self.anahtarlar.count else { return }
        let anahtar = Self.anahtarlar[sira]
        let js = "window.dispatchEvent(new CustomEvent('borcamaSekmeSecildi',"
            + "{detail:{anahtar:'\(anahtar)'}}))"
        webView?.evaluateJavaScript(js, completionHandler: nil)
    }
}

// MARK: - Native onboarding (NativeOnboarding.swift)
//
// Web -> native: borcamaOnboarding kanalina { tip: "baslat", ... }
// Native -> web: borcamaOnboardingDil { dil }, borcamaOnboardingOlay
// { ad, adim, sure_ms }, borcamaOnboardingBitti { sonuc } olaylari.
extension BorcamaBridgeViewController {

    fileprivate func onboardingiAc(_ govde: [String: Any]) {
        guard !onboardingAcik, presentedViewController == nil else { return }
        let durum = OBDurum(govde: govde)
        if AcilisPerdesi.gorunuyor && durum.adim == .acilis { durum.adim = .karsilama }
        durum.olay = { [weak self] ad, veri in
            if ad == "dil" {
                self?.webOlayi("borcamaOnboardingDil", veri)
            } else {
                var detay = veri
                detay["ad"] = ad
                self?.webOlayi("borcamaOnboardingOlay", detay)
            }
        }
        durum.bitti = { [weak self] sonuc in
            guard let self else { return }
            self.webOlayi("borcamaOnboardingBitti", ["sonuc": sonuc])
            // "Zaten hesabim var": web giris ekranini sayfa yenilemeden cizer;
            // karsilama sola kayar, giris sagdan gelir (gezinme yigini gibi).
            // Diger cikislarda web yeni sayfa yukler; kisa bir an bekleyip
            // kapatiyoruz, aksi halde altta acilis zemini bir an gorunuyor.
            let giris = sonuc["cikis"] as? String == "giris"
            let bitti = {
                self.onboardingAcik = false
                self.gorunurluguUygula()
            }
            guard giris else {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) {
                    self.dismiss(animated: true, completion: bitti)
                }
                return
            }
            // Giris ekrani hazirsa hemen, degilse sinyal gelince kayar; web
            // sinyal gondermezse en fazla 0,6 sn beklenir.
            var kaydi = false
            let kay = {
                guard !kaydi else { return }
                kaydi = true
                self.girisHazirBekleyen = nil
                self.girisEkraninaKay(bitti: bitti)
            }
            if self.girisHazir { return kay() }
            self.girisHazirBekleyen = kay
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) { kay() }
        }
        onboardingAcik = true
        girisHazir = false
        girisHazirBekleyen = nil
        gorunurluguUygula()
        let karsilama = OBDenetleyici(durum: durum)
        // Giris ekranindan geri: karsilama soldan, giris saga kayar.
        guard govde["geri"] as? Bool == true, !UIAccessibility.isReduceMotionEnabled else {
            // Ilk acilis: karsilama acilis perdesinin altinda sunulur, perde
            // yumusakca kalkar (logo zemini karsilamaya karisir).
            return present(karsilama, animated: false) { AcilisPerdesi.kaldir() }
        }
        // Kaydirma sunumdan sonra verilir: UIKit sunarken donusumu sifirliyor.
        // Tamamlama ayni cizim turunda calistigi icin arada kare gorunmez.
        let genislik = view.bounds.width
        present(karsilama, animated: false) {
            karsilama.view.transform = CGAffineTransform(translationX: -genislik, y: 0)
            UIView.animate(withDuration: 0.34, delay: 0, options: [.curveEaseInOut], animations: {
                karsilama.view.transform = .identity
                self.view.transform = CGAffineTransform(translationX: genislik, y: 0)
            }, completion: { _ in
                self.view.transform = .identity
            })
        }
    }

    fileprivate func girisHazirGeldi() {
        girisHazir = true
        AcilisPerdesi.kaldir()
        girisHazirBekleyen?()
    }

    // Karsilama sola cikar, giris ekrani (web) sagdan gelir; ikisi yan
    // yana kayar (gezinme yigini gibi). Karsilama overFullScreen sunuldugu
    // icin webview pencerede kalir ve giris ekrani altta cizilmis olur.
    fileprivate func girisEkraninaKay(bitti: @escaping () -> Void) {
        guard !UIAccessibility.isReduceMotionEnabled,
              let ust = presentedViewController?.view
        else { return dismiss(animated: false, completion: bitti) }
        let alt = view!
        let genislik = alt.bounds.width
        alt.transform = CGAffineTransform(translationX: genislik, y: 0)
        UIView.animate(withDuration: 0.34, delay: 0, options: [.curveEaseInOut], animations: {
            ust.transform = CGAffineTransform(translationX: -genislik, y: 0)
            alt.transform = .identity
        }, completion: { _ in
            self.dismiss(animated: false) {
                ust.transform = .identity
                bitti()
            }
        })
    }

    fileprivate func webOlayi(_ ad: String, _ detay: [String: Any]) {
        guard JSONSerialization.isValidJSONObject(detay),
              let veri = try? JSONSerialization.data(withJSONObject: detay),
              let json = String(data: veri, encoding: .utf8) else { return }
        let js = "window.dispatchEvent(new CustomEvent('\(ad)',{detail:\(json)}))"
        webView?.evaluateJavaScript(js, completionHandler: nil)
    }
}
