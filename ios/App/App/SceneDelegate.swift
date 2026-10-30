import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = BorcamaBridgeViewController()
        window?.makeKeyAndVisible()

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
        urlContexts.forEach { pdfDenemesiniGunlukle($0.url) }
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
        URLContexts.forEach { pdfDenemesiniGunlukle($0.url) }
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    // DENEME (Paylas -> Borcama, Yol A): main'e girmez. Gelen dosyanin
    // adini, boyutunu ve okunabilirligini konsola yazar.
    private func pdfDenemesiniGunlukle(_ url: URL) {
        guard url.isFileURL else { return }
        let boyut = (try? url.resourceValues(forKeys: [.fileSizeKey]).fileSize) ?? -1
        let okunur = FileManager.default.isReadableFile(atPath: url.path)
        NSLog("[PaylasDeneme] adres=%@ boyut=%d okunur=%d", url.absoluteString, boyut, okunur ? 1 : 0)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
