import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabaseHazir = Boolean(url && anonKey);
export const demoModu = import.meta.env.DEV && !supabaseHazir;

if (!supabaseHazir) {
  console.warn(
    demoModu
      ? "Supabase ayarları eksik; uygulama yerel demo modunda çalışıyor."
      : "Supabase ayarları eksik; production uygulama alanı devre dışı."
  );
}

const demoAuth = {
  getSession: async () => ({ data: { session: null } }),
  getUser: async () => ({ data: { user: null }, error: new Error("Demo modu") }),
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
  signInWithOtp: async () => ({ error: new Error("Demo modunda e-posta girişi kullanılamaz") }),
  signOut: async () => ({ error: null }),
};

export const supabase = supabaseHazir ? createClient(url, anonKey) : { auth: demoAuth };
