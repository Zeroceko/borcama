import UIKit
import SwiftUI
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = BorcamaBridgeViewController()
        window?.makeKeyAndVisible()
        if let window { AcilisPerdesi.ortu(window) }

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)

        // Uygulama kapaliyken bir baglantiyla acildiginda adres, sahne
        // baglanirken connectionOptions icinde geliyor ve calisma anindaki
        // openURLContexts yolu hic tetiklenmiyor; e-posta dogrulama baglantisi
        // uygulamaya ulasmiyordu. Ayni yoldan yeniden veriyoruz. Capacitor'un
        // App eklentisi olayi tuketilene kadar sakladigi icin web tarafi
        // dinleyiciyi sonra kaydetse de aliyor.
        // Yeniden gonderim koprunun ve eklentilerin kurulmasini bekler: sahne
        // baglanirken gonderilen bildirimi App eklentisi henuz dinlemiyor ve
        // adres kayboluyor. Eklenti olayi tuketilene kadar sakladigi icin web
        // tarafi dinleyiciyi sonra kaydetse de aliyor.
        let urlContexts = connectionOptions.urlContexts
        urlContexts.forEach { GelenDosya.koru($0.url) }
        GelenDosya.eskileriTemizle()
        let webActivities = connectionOptions.userActivities.filter {
            $0.activityType == NSUserActivityTypeBrowsingWeb
        }
        if !urlContexts.isEmpty || !webActivities.isEmpty {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                if !urlContexts.isEmpty {
                    SceneDelegateProxy.shared.scene(scene, openURLContexts: urlContexts)
                }
                for activity in webActivities {
                    SceneDelegateProxy.shared.scene(scene, continue: activity)
                }
            }
        }
    }

    // iPhone Duo katlanip acilinca, yarim katliyken, Split View'de ve
    // dondurmede pencere geometrisi degisir. Sekme cubugu pencereye bagli
    // kisitlarla zaten yeniden yerlesiyor; burada guvenli alana bagli
    // kaymanin ve web'e bildirilen yuksekligin de hemen guncellenmesi
    // saglaniyor. Cihaz yonelimine bakilmiyor; yalniz pencere olculeri.
    @available(iOS 26.0, *)
    func windowScene(_ windowScene: UIWindowScene,
                     didUpdateEffectiveGeometry previousEffectiveGeometry: UIWindowScene.Geometry) {
        (window?.rootViewController as? BorcamaBridgeViewController)?.pencereGeometrisiDegisti()
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        URLContexts.forEach { GelenDosya.koru($0.url) }
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}

// Paylas -> Borcama: PDF'i baska uygulamadan "Borcama" ile acinca iOS
// dosyayi Documents/Inbox'a kopyalar ve adresini (file://) verir; adres
// Capacitor'un appUrlOpen olayiyla web'e gider. Ekstre telefon kilitliyken
// okunamasin diye dosya korumasi "complete" yapilir. Web dosyayi isleyince
// borcamaTab kanalina { tip: "gelenDosyaSil", adres } gonderir; unutulan
// dosyalar bir gun sonra acilista silinir.
enum GelenDosya {
    static var gelenKutusu: URL? {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first?
            .appendingPathComponent("Inbox", isDirectory: true)
    }

    static func gelenKutusundaMi(_ url: URL) -> Bool {
        guard url.isFileURL, let kutu = gelenKutusu?.standardizedFileURL.resolvingSymlinksInPath().path else { return false }
        let yol = url.standardizedFileURL.resolvingSymlinksInPath().path
        return yol.hasPrefix(kutu + "/")
    }

    static func koru(_ url: URL) {
        guard gelenKutusundaMi(url) else { return }
        try? FileManager.default.setAttributes([.protectionKey: FileProtectionType.complete], ofItemAtPath: url.path)
    }

    static func sil(_ adres: String) {
        guard let url = URL(string: adres), gelenKutusundaMi(url) else { return }
        try? FileManager.default.removeItem(at: url)
    }

    static func eskileriTemizle(enEski: TimeInterval = 24 * 60 * 60) {
        guard let kutu = gelenKutusu,
              let dosyalar = try? FileManager.default.contentsOfDirectory(
                at: kutu, includingPropertiesForKeys: [.contentModificationDateKey])
        else { return }
        let sinir = Date().addingTimeInterval(-enEski)
        for dosya in dosyalar {
            let tarih = (try? dosya.resourceValues(forKeys: [.contentModificationDateKey]))?.contentModificationDate
            if let tarih, tarih < sinir { try? FileManager.default.removeItem(at: dosya) }
        }
    }
}

// Acilis perdesi: ilk karesi acilis ekraninin (Info.plist UILaunchScreen:
// AcilisZemini + ortada AcilisLogo) birebir aynisi; ardindan karsilama
// ekranindaki yesil parilti yumusakca belirir. Uygulama acilinca pencerenin
// en ustune konur; webview'in bos ekranini ve karsilamanin birden
// belirmesini gizler. Karsilama sunulunca, sekme cubugu kurulunca ya da
// giris ekrani cizilince (BorcamaBridgeViewController) solarak kalkar;
// hicbiri gelmezse 6 sn sonra.
enum AcilisPerdesi {
    private static weak var perde: UIView?
    private static var barindirici: UIViewController?

    // Perde ustteyken native karsilamanin kendi logo adimi (OBAcilis) atlanir;
    // ayni isi perde gorur, ikinci bir logo ekrani gorunmez.
    static var gorunuyor: Bool { perde != nil && perde?.tag == 0 }

    static func ortu(_ pencere: UIWindow) {
        let denetleyici = UIHostingController(rootView: AcilisPerdeGorunumu())
        let zemin: UIView = denetleyici.view
        zemin.frame = pencere.bounds
        zemin.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        zemin.backgroundColor = UIColor(named: "AcilisZemini")
        pencere.addSubview(zemin)
        perde = zemin
        barindirici = denetleyici
        DispatchQueue.main.asyncAfter(deadline: .now() + 6) { kaldir() }
    }

    static func kaldir() {
        guard let perde, perde.tag == 0 else { return }
        perde.tag = 1
        perde.superview?.bringSubviewToFront(perde)
        UIView.animate(withDuration: 0.3, delay: 0, options: [.curveEaseInOut], animations: {
            perde.alpha = 0
        }, completion: { _ in
            perde.removeFromSuperview()
            barindirici = nil
        })
    }
}

struct AcilisPerdeGorunumu: View {
    @State private var parilti = UIAccessibility.isReduceMotionEnabled

    var body: some View {
        GeometryReader { g in
            ZStack {
                OBRenk.zemin
                EllipticalGradient(colors: [OBRenk.parlama, .clear], center: UnitPoint(x: 0.2, y: 0),
                                   startRadiusFraction: 0, endRadiusFraction: 0.7)
                    .frame(height: g.size.height * 0.44)
                    .frame(maxHeight: .infinity, alignment: .top)
                    .opacity(parilti ? 1 : 0)
                Image("AcilisLogo")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 240, height: 59)
                    .scaleEffect(parilti ? 1 : 0.97)
                    .accessibilityLabel("Borcama")
            }
        }
        .ignoresSafeArea()
        .onAppear {
            guard !parilti else { return }
            withAnimation(.easeOut(duration: 0.9)) { parilti = true }
        }
    }
}
