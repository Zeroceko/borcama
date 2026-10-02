import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = CAPBridgeViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)

        // Uygulama kapaliyken bir baglantiyla acildiginda adres, sahne
        // baglanirken connectionOptions icinde geliyor ve calisma anindaki
        // openURLContexts yolu hic tetiklenmiyor; e-posta dogrulama baglantisi
        // uygulamaya ulasmiyordu. Ayni yoldan yeniden veriyoruz. Capacitor'un
        // App eklentisi olayi tuketilene kadar sakladigi icin web tarafi
        // dinleyiciyi sonra kaydetse de aliyor.
        if !connectionOptions.urlContexts.isEmpty {
            SceneDelegateProxy.shared.scene(scene, openURLContexts: connectionOptions.urlContexts)
        }

        // Universal link ile acildiginda adres userActivities icinde gelir;
        // soguk acilista bu da yeniden verilmelidir.
        for activity in connectionOptions.userActivities
        where activity.activityType == NSUserActivityTypeBrowsingWeb {
            SceneDelegateProxy.shared.scene(scene, continue: activity)
        }
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
