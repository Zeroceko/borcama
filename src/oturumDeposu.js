import { nativeMi } from "./platform.js";

// Native'de Supabase oturum belirteci WebKit localStorage yerine iOS
// Keychain'inde tutulur. Tarayicida hicbir sey degismez: web tarafi
// Supabase'in kendi varsayilan deposunu kullanmaya devam eder.
//
// Her islemde hata yakalanip localStorage'a dusulur. Keychain erisimi
// herhangi bir sebeple basarisiz olursa kullanici oturumdan dusmemeli;
// guvenlik iyilestirmesi girisi kirmamali.
let sdkPromise = null;
function guvenliDepo() {
  if (!sdkPromise) {
    sdkPromise = import("@aparajita/capacitor-secure-storage").then(
      (m) => m.SecureStorage,
    );
  }
  return sdkPromise;
}

function yerelOku(anahtar) {
  try {
    return localStorage.getItem(anahtar);
  } catch {
    return null;
  }
}

function yerelYaz(anahtar, deger) {
  try {
    localStorage.setItem(anahtar, deger);
  } catch {
    /* depolama kapaliysa sessizce gec */
  }
}

function yerelSil(anahtar) {
  try {
    localStorage.removeItem(anahtar);
  } catch {
    /* depolama kapaliysa sessizce gec */
  }
}

const keychainDeposu = {
  async getItem(anahtar) {
    try {
      const depo = await guvenliDepo();
      const deger = await depo.getItem(anahtar);
      if (deger !== null && deger !== undefined) return String(deger);
      // Keychain'de yoksa eski localStorage kaydina bak ve tasi. Boylece
      // mevcut oturumlar surum yukseltmede dusmez.
      const eski = yerelOku(anahtar);
      if (eski !== null) {
        try {
          await depo.setItem(anahtar, eski);
          yerelSil(anahtar);
        } catch {
          /* tasima basarisizsa eski deger yine de dondurulur */
        }
        return eski;
      }
      return null;
    } catch {
      return yerelOku(anahtar);
    }
  },

  async setItem(anahtar, deger) {
    try {
      const depo = await guvenliDepo();
      await depo.setItem(anahtar, String(deger));
    } catch {
      yerelYaz(anahtar, String(deger));
    }
  },

  async removeItem(anahtar) {
    try {
      const depo = await guvenliDepo();
      await depo.removeItem(anahtar);
    } catch {
      /* Keychain silinemezse en azindan yerel kopyayi birak */
    }
    // Her durumda eski yerel kopyayi da temizle.
    yerelSil(anahtar);
  },
};

export const oturumDeposu = nativeMi ? keychainDeposu : undefined;
