import { nativeMi, platformAdi } from "./platform.js";

// RevenueCat public anahtarlari platform basinadir: web icin Web Billing
// anahtari, iOS icin Apple anahtari. Hepsi public'tir; yine de dogru hesaba
// baglanmak icin yalnizca ortam degiskeninden okunur. Kod icinde
// canli/sandbox fallback yoktur.
const webApiKey = String(import.meta.env.VITE_REVENUECAT_PUBLIC_API_KEY || "").trim();
const iosApiKey = String(import.meta.env.VITE_REVENUECAT_IOS_API_KEY || "").trim();
const androidApiKey = String(import.meta.env.VITE_REVENUECAT_ANDROID_API_KEY || "").trim();
const environment = String(import.meta.env.VITE_REVENUECAT_ENVIRONMENT || "").trim();
const validEnvironments = new Set(["production", "sandbox"]);

const nativeApiKey = platformAdi === "ios" ? iosApiKey : androidApiKey;
const apiKey = nativeMi ? nativeApiKey : webApiKey;

// Native'de sandbox/production ayrimini imzalama belirler; ortam degiskeni
// yalniz web tarafinda anlamlidir.
const configurationError = nativeMi
  ? !nativeApiKey
    ? `VITE_REVENUECAT_${platformAdi === "ios" ? "IOS" : "ANDROID"}_API_KEY tanımlı değil.`
    : ""
  : !webApiKey
    ? "VITE_REVENUECAT_PUBLIC_API_KEY tanımlı değil."
    : !validEnvironments.has(environment)
      ? "VITE_REVENUECAT_ENVIRONMENT production veya sandbox olmalı."
      : "";

const PRO_ENTITLEMENT = "pro";
const PRO_OFFERING = "pro";

let configuredUserId = null;
let sdkPromise = null;
let nativeSdkPromise = null;

export const revenueCatHazir = !configurationError;
export const revenueCatYapilandirmaHatasi = configurationError;

function revenueCatSdk() {
  if (!sdkPromise) sdkPromise = import("@revenuecat/purchases-js");
  return sdkPromise;
}

function revenueCatNativeSdk() {
  if (!nativeSdkPromise) nativeSdkPromise = import("@revenuecat/purchases-capacitor");
  return nativeSdkPromise;
}

// StoreKit tarafinda appUserId Supabase kullanici kimligidir; web ile ayni
// kimlik kullanildigi icin `pro` entitlement'i iki platform arasinda
// kendiliginden tasinir.
async function nativePurchasesForUser(userId) {
  if (configurationError) throw new Error(configurationError);
  if (!userId) return null;
  const { Purchases } = await revenueCatNativeSdk();
  const { isConfigured } = await Purchases.isConfigured();
  if (!isConfigured) {
    await Purchases.configure({ apiKey, appUserID: userId });
    configuredUserId = userId;
    return Purchases;
  }
  if (configuredUserId !== userId) {
    await Purchases.logIn({ appUserID: userId });
    configuredUserId = userId;
  }
  return Purchases;
}

async function purchasesForUser(userId) {
  if (configurationError) throw new Error(configurationError);
  if (!userId) return null;
  const { Purchases } = await revenueCatSdk();
  if (Purchases.isConfigured()) {
    const purchases = Purchases.getSharedInstance();
    if (configuredUserId !== userId) {
      await purchases.identifyUser(userId);
      configuredUserId = userId;
    }
    return purchases;
  }

  configuredUserId = userId;
  return Purchases.configure({ apiKey, appUserId: userId });
}

// Web SDK'si Date, Capacitor SDK'si ISO metin dondurur.
function isoTarih(deger) {
  if (!deger) return null;
  if (typeof deger === "string") return deger;
  return deger.toISOString?.() || null;
}

function proBilgisi(customerInfo) {
  const entitlement = customerInfo?.entitlements?.active?.[PRO_ENTITLEMENT];
  return {
    active: Boolean(entitlement?.isActive),
    expiresAt: isoTarih(entitlement?.expirationDate),
    willRenew: Boolean(entitlement?.willRenew),
    isSandbox: Boolean(entitlement?.isSandbox),
    managementURL: customerInfo?.managementURL || null,
  };
}

function proOffering(offerings) {
  return offerings.all?.[PRO_OFFERING] || offerings.current;
}

function planPackage(offering, plan) {
  const packageId = plan === "annual" ? "$rc_annual" : "$rc_monthly";
  return (
    offering?.packagesById?.[packageId] ||
    offering?.availablePackages?.find((p) => p.identifier === packageId) ||
    (plan === "annual" ? offering?.annual : offering?.monthly)
  );
}

function paketOzeti(rcPackage) {
  if (!rcPackage) return null;
  // Capacitor SDK'sinde fiyat dogrudan product uzerinde durur.
  const storeProduct = rcPackage.product;
  if (storeProduct) {
    return {
      packageId: rcPackage.identifier,
      priceId: storeProduct.identifier || null,
      formattedPrice: storeProduct.priceString || null,
      currency: storeProduct.currencyCode || null,
      value: Number.isFinite(storeProduct.price) ? storeProduct.price : null,
      title: storeProduct.title || null,
    };
  }
  const product = rcPackage.webBillingProduct || rcPackage.rcBillingProduct;
  const price = product?.currentPrice;
  return {
    packageId: rcPackage.identifier,
    priceId: product?.defaultPurchaseOption?.priceId || null,
    formattedPrice: price?.formattedPrice || null,
    currency: price?.currency || null,
    value: Number.isFinite(price?.amountMicros) ? price.amountMicros / 1_000_000 : null,
    title: product?.title || product?.displayName || null,
  };
}

export async function revenueCatProPaketleri(userId) {
  if (nativeMi) {
    const Purchases = await nativePurchasesForUser(userId);
    if (!Purchases) return { unavailable: true };
    const offerings = await Purchases.getOfferings();
    const offering = proOffering(offerings);
    if (!offering) throw new Error("Borcama Pro teklifi bulunamadı.");
    return {
      monthly: paketOzeti(planPackage(offering, "monthly")),
      annual: paketOzeti(planPackage(offering, "annual")),
    };
  }

  const purchases = await purchasesForUser(userId);
  if (!purchases) return { unavailable: true };

  // Para birimi göndermiyoruz. RevenueCat/Paddle ziyaretçinin konumuna göre
  // fiyatı belirler ve ekrana basılacak hazır metni döndürür.
  const offerings = await purchases.getOfferings();
  const offering = proOffering(offerings);
  if (!offering) throw new Error("Borcama Pro teklifi bulunamadı.");

  return {
    monthly: paketOzeti(planPackage(offering, "monthly")),
    annual: paketOzeti(planPackage(offering, "annual")),
  };
}

export async function revenueCatProKontrol(userId) {
  if (nativeMi) {
    const Purchases = await nativePurchasesForUser(userId);
    if (!Purchases) return { active: false, unavailable: true };
    const { customerInfo } = await Purchases.getCustomerInfo();
    return proBilgisi(customerInfo);
  }

  const purchases = await purchasesForUser(userId);
  if (!purchases) return { active: false, unavailable: true };
  const customerInfo = await purchases.getCustomerInfo();
  return proBilgisi(customerInfo);
}

// App Store Guideline 3.1.1: satin alimlari geri yukleme yolu zorunludur.
// Web tarafinda karsiligi yoktur; orada abonelik zaten hesaba baglidir.
export async function revenueCatSatinAlimlariGeriYukle(userId) {
  if (!nativeMi) return { unavailable: true };
  const Purchases = await nativePurchasesForUser(userId);
  if (!Purchases) return { active: false, unavailable: true };
  const { customerInfo } = await Purchases.restorePurchases();
  return { ...proBilgisi(customerInfo), restored: true };
}

export async function revenueCatProSatinAl({ userId, email, plan = "monthly" }) {
  if (nativeMi) {
    const Purchases = await nativePurchasesForUser(userId);
    if (!Purchases) return { unavailable: true };
    try {
      const offerings = await Purchases.getOfferings();
      const offering = proOffering(offerings);
      const selectedPackage = planPackage(offering, plan);
      if (!selectedPackage) throw new Error("Borcama Pro paketi bulunamadı.");

      const sonuc = await Purchases.purchasePackage({ aPackage: selectedPackage });
      const storeProduct = selectedPackage.product;
      return {
        ...proBilgisi(sonuc.customerInfo),
        purchased: true,
        transactionId: sonuc.transaction?.transactionIdentifier || null,
        productId: sonuc.productIdentifier || storeProduct?.identifier || selectedPackage.identifier,
        value: Number.isFinite(storeProduct?.price) ? storeProduct.price : 0,
        currency: storeProduct?.currencyCode || "TRY",
        plan,
      };
    } catch (error) {
      const { PURCHASES_ERROR_CODE } = await revenueCatNativeSdk();
      if (error?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        return { cancelled: true };
      }
      throw error;
    }
  }

  const purchases = await purchasesForUser(userId);
  if (!purchases) return { unavailable: true };

  try {
    const offerings = await purchases.getOfferings();
    const offering = proOffering(offerings);
    const selectedPackage = planPackage(offering, plan);

    if (!selectedPackage) throw new Error("Borcama Pro paketi bulunamadı.");

    const result = await purchases.purchase({
      rcPackage: selectedPackage,
      customerEmail: email || undefined,
      selectedLocale: "tr",
      defaultLocale: "tr",
      termsAndConditionsUrl: `${window.location.origin}/terms`,
      metadata: { plan: `borcama_pro_${plan}` },
    });
    const product = selectedPackage.webBillingProduct || selectedPackage.rcBillingProduct;
    const price = product?.currentPrice;
    return {
      ...proBilgisi(result.customerInfo),
      purchased: true,
      transactionId: result.storeTransaction?.storeTransactionId || result.operationSessionId,
      productId: result.storeTransaction?.productIdentifier || product?.identifier || selectedPackage.identifier,
      value: Number.isFinite(price?.amountMicros) ? price.amountMicros / 1_000_000 : 0,
      currency: price?.currency || "TRY",
      plan,
    };
  } catch (error) {
    const { ErrorCode, PurchasesError } = await revenueCatSdk();
    if (
      error instanceof PurchasesError &&
      error.errorCode === ErrorCode.UserCancelledError
    ) {
      return { cancelled: true };
    }
    throw error;
  }
}
