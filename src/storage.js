import { supabase, supabaseHazir } from "./supabaseClient.js";

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
    if (!supabaseHazir) {
      const value = localStorage.getItem(key);
      if (value === null) throw new Error("Kayıt bulunamadı: " + key);
      return { key, value };
    }
    const uid = await userId();
    const { data, error } = await supabase
      .from("kv_store")
      .select("value")
      .eq("user_id", uid)
      .eq("key", key)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Kayıt bulunamadı: " + key);
    return { key, value: data.value };
  },

  async set(key, value) {
    if (!supabaseHazir) {
      localStorage.setItem(key, value);
      return { key, value };
    }
    const uid = await userId();
    const { error } = await supabase
      .from("kv_store")
      .upsert({ user_id: uid, key, value, updated_at: new Date().toISOString() }, { onConflict: "user_id,key" });
    if (error) throw error;
    return { key, value };
  },

  async delete(key) {
    if (!supabaseHazir) {
      localStorage.removeItem(key);
      return { key, deleted: true };
    }
    const uid = await userId();
    const { error } = await supabase.from("kv_store").delete().eq("user_id", uid).eq("key", key);
    if (error) throw error;
    return { key, deleted: true };
  },

  async list(prefix = "") {
    if (!supabaseHazir) {
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
