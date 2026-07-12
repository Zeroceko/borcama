import { supabase, demoModu } from "./supabaseClient.js";

const AZAMI_VERI_BOYUTU = 2 * 1024 * 1024;
const surumler = new Map();
function anahtarKontrol(key) {
  if (typeof key !== "string" || !/^borctakip:v\d+$/.test(key)) throw new Error("Geçersiz veri anahtarı");
}

// App.jsx window.storage.get/set/delete/list arayüzünü kullanıyor.
// Burada aynı arayüzü Supabase'teki "kv_store" tablosuna bağlıyoruz.
// Tablo: kv_store (user_id uuid, key text, value text, updated_at timestamptz)
// Satır güvenliği (RLS) sayesinde her kullanıcı sadece kendi satırlarını görür/değiştirir.

async function userId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) throw new Error("Oturum bulunamadı");
  return data.user.id;
}

const storage = {
  async get(key) {
    anahtarKontrol(key);
    if (demoModu) {
      const value = localStorage.getItem(key);
      if (value === null) return { key, value: null };
      return { key, value };
    }
    const uid = await userId();
    const { data, error } = await supabase
      .from("kv_store")
      .select("value,updated_at")
      .eq("user_id", uid)
      .eq("key", key)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      surumler.delete(key);
      return { key, value: null };
    }
    surumler.set(key, data.updated_at);
    return { key, value: data.value };
  },

  async set(key, value) {
    anahtarKontrol(key);
    if (typeof value !== "string" || new Blob([value]).size > AZAMI_VERI_BOYUTU) throw new Error("Veri boyutu sınırı aşıldı");
    if (demoModu) {
      localStorage.setItem(key, value);
      return { key, value };
    }
    const uid = await userId();
    const updatedAt = new Date().toISOString();
    const oncekiSurum = surumler.get(key);
    if (oncekiSurum) {
      const { data, error } = await supabase.from("kv_store").update({ value, updated_at: updatedAt })
        .eq("user_id", uid).eq("key", key).eq("updated_at", oncekiSurum).select("updated_at").maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("VERI_CAKISMASI");
      surumler.set(key, data.updated_at);
    } else {
      const { data, error } = await supabase.from("kv_store").insert({ user_id: uid, key, value, updated_at: updatedAt }).select("updated_at").single();
      if (error?.code === "23505") throw new Error("VERI_CAKISMASI");
      if (error) throw error;
      surumler.set(key, data.updated_at);
    }
    return { key, value };
  },

  async delete(key) {
    anahtarKontrol(key);
    if (demoModu) {
      localStorage.removeItem(key);
      return { key, deleted: true };
    }
    const uid = await userId();
    const { error } = await supabase.from("kv_store").delete().eq("user_id", uid).eq("key", key);
    if (error) throw error;
    return { key, deleted: true };
  },

  async list(prefix = "") {
    if (prefix && !/^borctakip:v\d*$/.test(prefix)) throw new Error("Geçersiz veri anahtarı");
    if (demoModu) {
      const keys = Object.keys(localStorage).filter((key) => key.startsWith(prefix));
      return { keys, prefix };
    }
    const uid = await userId();
    let q = supabase.from("kv_store").select("key").eq("user_id", uid);
    if (prefix) q = q.like("key", prefix + "%");
    const { data, error } = await q;
    if (error) throw error;
    return { keys: (data || []).map((r) => r.key), prefix };
  },
};

if (typeof window !== "undefined") {
  window.storage = storage;
}

export default storage;
