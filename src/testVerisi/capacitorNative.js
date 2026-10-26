// Test yardimcisi: @capacitor/core yerine gecer ve iOS kabugunu taklit eder
// (nativeMi = true). Yalniz webCokDilli.test.js'in vite sunucusunda kullanilir.
export const Capacitor = {
  getPlatform: () => "ios",
  isNativePlatform: () => true,
  isPluginAvailable: () => false,
  convertFileSrc: (yol) => yol,
};
export function registerPlugin() {
  return new Proxy({}, { get: () => async () => ({}) });
}
export class WebPlugin {}
export default { Capacitor, registerPlugin, WebPlugin };
