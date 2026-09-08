import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.borcama.app",
  appName: "Borcama",
  // Vite ciktisi uygulamaya gomulur; native surum uzak bir siteyi
  // yuklemez. App Store 4.2 savunmasinin temeli budur.
  webDir: "dist",
  ios: {
    contentInset: "never",
  },
};

export default config;
