import { nativeMi, nativeYoluMu } from "./platform.js";

const BORCAMA_ALANLARI = new Set(["borcama.com", "www.borcama.com"]);

export function nativeDerinBaglantiHedefi(hamUrl) {
  try {
    const url = new URL(hamUrl);
    if (url.protocol !== "https:" || !BORCAMA_ALANLARI.has(url.hostname)) return null;
    const yol = url.pathname.replace(/\/+$/, "") || "/";
    if (!nativeYoluMu(yol)) return null;
    return `${yol}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

function hedefeGit(hamUrl) {
  const hedef = nativeDerinBaglantiHedefi(hamUrl);
  if (!hedef) return false;
  const mevcut = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (mevcut !== hedef) window.location.assign(hedef);
  return true;
}

export async function nativeDerinBaglantilariBaslat() {
  if (!nativeMi) return () => {};
  const { App } = await import("@capacitor/app");
  const kayit = await App.addListener("appUrlOpen", ({ url }) => hedefeGit(url));
  const acilis = await App.getLaunchUrl();
  if (acilis?.url) hedefeGit(acilis.url);
  return () => kayit.remove();
}
