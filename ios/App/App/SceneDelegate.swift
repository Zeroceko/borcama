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

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
