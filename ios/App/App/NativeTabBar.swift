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
        guard let cubuk else { return }
        cubuk.overrideUserInterfaceStyle = koyu ? .dark : .light
        cubuk.tintColor = koyu
            ? UIColor(red: 0.80, green: 0.98, blue: 0.35, alpha: 1)
            : UIColor(red: 0.04, green: 0.29, blue: 0.22, alpha: 1)
        cubuk.unselectedItemTintColor = koyu
            ? UIColor(red: 0.69, green: 0.71, blue: 0.66, alpha: 1)
            : UIColor(red: 0.36, green: 0.38, blue: 0.33, alpha: 1)
    }
    private var kanalKuruldu = false

    override func capacitorDidLoad() {
        guard !kanalKuruldu else { return }
        kanalKuruldu = true
        webView?.configuration.userContentController.add(self, name: "borcamaTab")
        // Uygulamalarda kaydirma cubugu gosterilmez; webview'in kendi
        // gostergesi kapatiliyor.
        webView?.scrollView.showsVerticalScrollIndicator = false
        webView?.scrollView.showsHorizontalScrollIndicator = false
    }

    // MARK: - Web'den gelen mesajlar

    func userContentController(_ userContentController: WKUserContentController,
                               didReceive message: WKScriptMessage) {
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
            case "sec":
                if let anahtar = govde["anahtar"] as? String { self.secileniAyarla(anahtar) }
            case "tema":
                self.temayiUygula(govde["koyu"] as? Bool ?? false)
            case "goster":
                self.webGosterilsin = govde["gorunsun"] as? Bool ?? true
                self.gorunurluguUygula()
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
        cubuk?.isHidden = !webGosterilsin || klavyeAcik
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
        let gorunur: CGFloat = cubuk.isHidden
            ? 0
            : max(0, (pencere.bounds.height - pencere.safeAreaInsets.bottom) - cubuk.frame.minY)
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
