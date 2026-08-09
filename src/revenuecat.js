// RevenueCat web anahtarı public'tir; yine de doğru hesaba bağlanmak için
// yalnızca ortam değişkeninden okunur. Kod içinde canlı/sandbox fallback yoktur.
const apiKey = String(import.meta.env.VITE_REVENUECAT_PUBLIC_API_KEY || "").trim();
const environment = String(import.meta.env.VITE_REVENUECAT_ENVIRONMENT || "").trim();
const validEnvironments = new Set(["production", "sandbox"]);
const configurationError = !apiKey
  ? "VITE_REVENUECAT_PUBLIC_API_KEY tanımlı değil."
  : !validEnvironments.has(environment)
    ? "VITE_REVENUECAT_ENVIRONMENT production veya sandbox olmalı."
    : "";
const PRO_ENTITLEMENT = "pro";
const PRO_OFFERING = "pro";

let configuredUserId = null;
let sdkPromise = null;

export const revenueCatHazir = !configurationError;
export const revenueCatYapilandirmaHatasi = configurationError;

function revenueCatSdk() {
  if (!sdkPromise) sdkPromise = import("@revenuecat/purchases-js");
  return sdkPromise;
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

function proBilgisi(customerInfo) {
  const entitlement = customerInfo?.entitlements?.active?.[PRO_ENTITLEMENT];
  return {
    active: Boolean(entitlement?.isActive),
    expiresAt: entitlement?.expirationDate?.toISOString?.() || null,
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
    (plan === "annual" ? offering?.annual : offering?.monthly)
  );
}

function paketOzeti(rcPackage) {
  if (!rcPackage) return null;
  const product = rcPackage.webBillingProduct || rcPackage.rcBillingProduct;
  return {
    packageId: rcPackage.identifier,
    priceId: product?.defaultPurchaseOption?.priceId || null,
    formattedPrice: product?.currentPrice?.formattedPrice || null,
    currency: product?.currentPrice?.currency || null,
    title: product?.title || product?.displayName || null,
  };
}

export async function revenueCatProPaketleri(userId) {
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
  const purchases = await purchasesForUser(userId);
  if (!purchases) return { active: false, unavailable: true };
  const customerInfo = await purchases.getCustomerInfo();
  return proBilgisi(customerInfo);
}

export async function revenueCatProSatinAl({ userId, email, plan = "monthly" }) {
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
    return { ...proBilgisi(result.customerInfo), purchased: true };
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
