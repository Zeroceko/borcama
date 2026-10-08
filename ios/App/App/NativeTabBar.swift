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
    private static let basliklar = ["Bugün", "Borçlar", "Hareketler", "Varlıklar"]
    private static let simgeler = [
        "chart.bar.fill",
        "creditcard.fill",
        "arrow.left.arrow.right",
        "banknote.fill",
    ]

    private var cubuk: UITabBar?
    private var altSerit: UIVisualEffectView?
    private var kanalKuruldu = false

    override func capacitorDidLoad() {
        guard !kanalKuruldu else { return }
        kanalKuruldu = true
        webView?.configuration.userContentController.add(self, name: "borcamaTab")
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
                self.cubuguKur()
            case "sec":
                if let anahtar = govde["anahtar"] as? String { self.secileniAyarla(anahtar) }
            case "goster":
                let gorunsun = govde["gorunsun"] as? Bool ?? true
                self.cubuk?.isHidden = !gorunsun
                self.altSerit?.isHidden = !gorunsun
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
        yeni.tintColor = UIColor(red: 0.04, green: 0.29, blue: 0.22, alpha: 1)
        yeni.unselectedItemTintColor = UIColor(red: 0.36, green: 0.38, blue: 0.33, alpha: 1)

        yeni.items = Self.anahtarlar.indices.map { sira in
            let oge = UITabBarItem(
                title: Self.basliklar[sira],
                image: UIImage(systemName: Self.simgeler[sira]),
                tag: sira
            )
            oge.accessibilityLabel = Self.basliklar[sira]
            return oge
        }
        yeni.selectedItem = yeni.items?.first

        // Cubuk guvenli alanin ustune oturuyor; altinda kalan ev cubugu
        // seridi ayni malzemeyle dolduruluyor ki bosluk gorunmesin.
        let serit = UIVisualEffectView(effect: UIBlurEffect(style: .systemChromeMaterial))
        serit.translatesAutoresizingMaskIntoConstraints = false
        pencere.addSubview(serit)
        pencere.addSubview(yeni)
        NSLayoutConstraint.activate([
            yeni.leadingAnchor.constraint(equalTo: pencere.leadingAnchor),
            yeni.trailingAnchor.constraint(equalTo: pencere.trailingAnchor),
            yeni.bottomAnchor.constraint(equalTo: pencere.safeAreaLayoutGuide.bottomAnchor),
            serit.leadingAnchor.constraint(equalTo: pencere.leadingAnchor),
            serit.trailingAnchor.constraint(equalTo: pencere.trailingAnchor),
            serit.topAnchor.constraint(equalTo: yeni.bottomAnchor),
            serit.bottomAnchor.constraint(equalTo: pencere.bottomAnchor),
        ])
        pencere.bringSubviewToFront(serit)
        pencere.bringSubviewToFront(yeni)
        cubuk = yeni
        altSerit = serit

        // Klavye acilinca cubuk klavyenin uzerinde asili kalmasin.
        NotificationCenter.default.addObserver(
            self, selector: #selector(klavyeAcildi),
            name: UIResponder.keyboardWillShowNotification, object: nil)
        NotificationCenter.default.addObserver(
            self, selector: #selector(klavyeKapandi),
            name: UIResponder.keyboardWillHideNotification, object: nil)
    }

    private func secileniAyarla(_ anahtar: String) {
        guard let sira = Self.anahtarlar.firstIndex(of: anahtar),
              let ogeler = cubuk?.items, sira < ogeler.count else { return }
        cubuk?.selectedItem = ogeler[sira]
    }

    @objc private func klavyeAcildi() {
        DispatchQueue.main.async {
            self.cubuk?.isHidden = true
            self.altSerit?.isHidden = true
        }
    }

    @objc private func klavyeKapandi() {
        DispatchQueue.main.async {
            self.cubuk?.isHidden = false
            self.altSerit?.isHidden = false
        }
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
