// RevenueCat web anahtarları istemci tarafında kullanılmak üzere public'tir.
const SANDBOX_API_KEY = "pdl_IzneRUmlvMCVxWTtNvEiXkkPMbCx";
const LIVE_API_KEY = "pdl_aYYuTHjzPJusEZPQvKkHFnKonDpj";
const apiKey =
  import.meta.env.VITE_REVENUECAT_PUBLIC_API_KEY ||
  (import.meta.env.DEV ? SANDBOX_API_KEY : LIVE_API_KEY);
const PRO_ENTITLEMENT = "pro";
const PRO_OFFERING = "pro";

let configuredUserId = null;
let sdkPromise = null;

export const revenueCatHazir = Boolean(apiKey);

function revenueCatSdk() {
  if (!sdkPromise) sdkPromise = import("@revenuecat/purchases-js");
  return sdkPromise;
}

async function purchasesForUser(userId) {
  if (!apiKey || !userId) return null;
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
    const offerings = await purchases.getOfferings({ currency: "TRY" });
    const offering = offerings.all?.[PRO_OFFERING] || offerings.current;
    const packageId = plan === "annual" ? "$rc_annual" : "$rc_monthly";
    const selectedPackage =
      offering?.packagesById?.[packageId] ||
      (plan === "annual" ? offering?.annual : offering?.monthly);

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
