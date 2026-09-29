import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.borcama.app",
  appName: "Borcama",
  // Vite ciktisi uygulamaya gomulur; native surum uzak bir siteyi
  // yuklemez. App Store 4.2 savunmasinin temeli budur.
  webDir: "dist",
  // Webview yerel dosyalari servis etmeye devam eder, ancak sayfanin
  // kaynagi capacitor://localhost yerine https://borcama.com olur.
  // Cloudflare Turnstile site anahtari bu alan adina kayitli oldugu icin
  // captcha ancak boyle yukleniyor.
  server: {
    hostname: "borcama.com",
    iosScheme: "https",
    androidScheme: "https",
  },
  ios: {
    contentInset: "never",
  },
};

export default config;
