import React from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;600;700&display=swap');
.legal,.legal *{box-sizing:border-box}.legal{min-height:100vh;background:#f4efe0;color:#14160f;font-family:'Space Grotesk',sans-serif;padding:28px 18px 70px}.legal-shell{width:min(900px,100%);margin:auto}.legal-nav{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:36px}.legal-logo{width:160px}.legal-logo img{display:block;width:100%}.legal-back{display:inline-flex;align-items:center;gap:7px;padding:10px 15px;border:2px solid #14160f;border-radius:999px;background:#fff;color:#14160f;text-decoration:none;font-size:13px;font-weight:700;box-shadow:3px 3px 0 #14160f}.legal-card{background:#fff;border:3px solid #14160f;border-radius:26px;padding:clamp(26px,5vw,58px);box-shadow:10px 10px 0 #cdf564}.legal-kicker{display:inline-flex;align-items:center;gap:7px;padding:6px 10px;border:2px solid #14160f;border-radius:999px;background:#cdf564;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em}.legal h1{font-family:'Archivo Black',sans-serif;font-size:clamp(34px,6vw,58px);line-height:1.02;letter-spacing:-.035em;margin:20px 0 10px}.legal-date{color:#6d7064;font-size:13px;margin-bottom:34px}.legal h2{font-size:20px;margin:32px 0 10px}.legal h3{font-size:16px;margin:22px 0 8px}.legal p,.legal li{font-size:14px;line-height:1.75;color:#4f5248}.legal ul{padding-left:22px}.legal a{color:#315c47;font-weight:700}.legal-callout{margin-top:34px;padding:18px 20px;background:#f4efe0;border:2px solid #14160f;border-radius:16px}.legal-callout p{margin:0}.legal-links{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}.legal-links a{padding:10px 14px;border:2px solid #14160f;border-radius:999px;background:#fff;text-decoration:none;color:#14160f;font-size:12px}.legal-links a.active{background:#14160f;color:#fff}@media(max-width:560px){.legal-nav{align-items:flex-start}.legal-logo{width:135px}.legal-back{padding:8px 11px;font-size:12px}.legal-card{box-shadow:6px 6px 0 #cdf564}}
`;

function LegalLayout({ tur, title, children }) {
  return (
    <div className="legal">
      <style>{CSS}</style>
      <div className="legal-shell">
        <nav className="legal-nav">
          <a className="legal-logo" href="/">
            <img src="/borcama-logo.png" alt="Borcama" />
          </a>
          <a className="legal-back" href="/">
            <ArrowLeft size={15} /> Ana sayfaya dön
          </a>
        </nav>
        <article className="legal-card">
          <div className="legal-kicker">
            <ShieldCheck size={14} /> Yasal metin
          </div>
          <h1>{title}</h1>
          <div className="legal-date">
            Yürürlük tarihi: 13 Temmuz 2026 · Sürüm 1.0
          </div>
          {children}
          <div className="legal-links">
            <a className={tur === "terms" ? "active" : ""} href="/terms">
              Kullanıcı Sözleşmesi
            </a>
            <a className={tur === "privacy" ? "active" : ""} href="/privacy">
              Gizlilik ve KVKK
            </a>
          </div>
        </article>
      </div>
    </div>
  );
}

export function KullaniciSozlesmesi() {
  return (
    <LegalLayout tur="terms" title="Kullanıcı Sözleşmesi">
      <p>
        Bu sözleşme, Borcama internet uygulamasını kullanan kişi ile Borcama
        hizmeti arasındaki kullanım koşullarını düzenler. Hesap oluşturarak bu
        koşulları kabul etmiş olursunuz.
      </p>
      <h2>1. Hizmetin kapsamı</h2>
      <p>
        Borcama; kullanıcıların kendi girdikleri kredi kartı, kredi, ek hesap,
        gelir, harcama ve ödeme bilgilerini tek yerde takip etmelerine yardımcı
        olan kişisel bir finans takip aracıdır.
      </p>
      <ul>
        <li>
          Borcama bir banka, ödeme kuruluşu, kredi sağlayıcısı veya yatırım
          danışmanı değildir.
        </li>
        <li>
          Gösterilen faiz, ödeme ve planlama sonuçları yaklaşık hesaplamalardır;
          bankanızın resmî kayıtları ve sözleşmeleri esas alınır.
        </li>
        <li>
          Uygulama üzerinden ödeme, para transferi veya kredi başvurusu
          yapılmaz.
        </li>
      </ul>
      <h2>2. Hesap ve güvenlik</h2>
      <p>
        Doğru bir e-posta adresi kullanmak, parolanızı ve giriş bağlantılarınızı
        korumak sizin sorumluluğunuzdadır. Hesabınızda yetkisiz bir işlem fark
        ederseniz gecikmeden{" "}
        <a href="mailto:chef@tiramisup.app">chef@tiramisup.app</a> adresine
        bildirmelisiniz.
      </p>
      <h2>3. Kullanıcı verileri ve doğruluk</h2>
      <p>
        Uygulamaya eklediğiniz bilgilerin doğruluğundan siz sorumlusunuz. Yanlış
        veya eksik girişler hesaplamaları etkileyebilir. Banka ekstresi, kredi
        sözleşmesi ve resmî ödeme kayıtlarınızı ayrıca kontrol etmelisiniz.
      </p>
      <h2>4. Uygun kullanım</h2>
      <p>
        Hizmeti hukuka aykırı amaçlarla kullanamaz; güvenliği aşmaya, başka
        kullanıcıların verilerine erişmeye, sistemi bozacak otomatik istekler
        göndermeye veya uygulamayı izinsiz çoğaltmaya çalışamazsınız.
      </p>
      <h2>5. Fikrî mülkiyet</h2>
      <p>
        Borcama markası, arayüzü, yazılımı ve özgün içerikleri üzerindeki haklar
        saklıdır. Kullanıcıların uygulamaya girdikleri finansal verilerin
        mülkiyeti kullanıcıya aittir.
      </p>
      <h2>6. Hizmet sürekliliği ve sorumluluk</h2>
      <p>
        Hizmetin güvenli ve kesintisiz çalışması için makul çaba gösterilir;
        ancak bakım, teknik arıza veya üçüncü taraf altyapı sorunları nedeniyle
        geçici kesintiler olabilir. Borcama, tek başına uygulamadaki tahminlere
        dayanılarak verilen finansal kararlardan doğan kayıplardan sorumlu
        tutulamaz.
      </p>
      <h2>7. Hesabın kapatılması</h2>
      <p>
        Hesabınızın ve ilişkili verilerinizin silinmesini destek kanalı
        üzerinden talep edebilirsiniz. Hukuka aykırı kullanım veya güvenlik
        riski halinde erişim geçici olarak durdurulabilir ya da hesap
        kapatılabilir.
      </p>
      <h2>8. Değişiklikler ve uyuşmazlıklar</h2>
      <p>
        Önemli değişiklikler yürürlüğe girmeden önce uygulama içinde veya
        e-posta yoluyla bildirilir. Türkiye Cumhuriyeti hukuku uygulanır;
        tüketicilerin kanundan doğan hakları saklıdır.
      </p>
      <div className="legal-callout">
        <p>
          Sorularınız için:{" "}
          <a href="mailto:chef@tiramisup.app">chef@tiramisup.app</a>
        </p>
      </div>
    </LegalLayout>
  );
}

export function GizlilikMetni() {
  return (
    <LegalLayout tur="privacy" title="Gizlilik ve KVKK Aydınlatma Metni">
      <p>
        Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”)
        kapsamında Borcama kullanılırken kişisel verilerin nasıl işlendiğini
        açıklar. Veri sorumlusu Borcama hizmetidir; iletişim adresi{" "}
        <a href="mailto:chef@tiramisup.app">chef@tiramisup.app</a> şeklindedir.
      </p>
      <h2>1. İşlenen veri kategorileri</h2>
      <ul>
        <li>
          <b>Hesap bilgileri:</b> e-posta adresi, hesap kimliği, kayıt ve son
          giriş zamanları.
        </li>
        <li>
          <b>Kullanıcı tarafından girilen finansal kayıtlar:</b> banka ve kart
          adları, borç, limit, ekstre, ödeme, gelir ve harcama bilgileri.
        </li>
        <li>
          <b>Teknik ve güvenlik kayıtları:</b> oturum, cihaz/tarayıcı ve kötüye
          kullanımın önlenmesi için gerekli sınırlı log bilgileri.
        </li>
        <li>
          <b>İletişim kayıtları:</b> geri bildirimler ve destek talepleri.
        </li>
      </ul>
      <p>
        Borcama banka hesabı parolası, kart numarasının tamamı, CVV, T.C. kimlik
        numarası veya biyometrik veri istemez. Bu tür bilgileri serbest metin
        alanlarına yazmamalısınız.
      </p>
      <h2>2. İşleme amaçları</h2>
      <ul>
        <li>
          Hesabın oluşturulması, doğrulanması ve güvenli girişin sağlanması,
        </li>
        <li>Borç, ödeme, gelir ve harcama takibi özelliklerinin sunulması,</li>
        <li>
          Ekstre karşılaştırması, faiz tahmini ve borç planı hesaplamalarının
          yapılması,
        </li>
        <li>
          Güvenliğin sağlanması, hataların giderilmesi ve hizmetin
          geliştirilmesi,
        </li>
        <li>
          Destek taleplerinin cevaplanması ve yasal yükümlülüklerin yerine
          getirilmesi.
        </li>
      </ul>
      <h2>3. Hukuki sebepler</h2>
      <p>
        Veriler; kullanıcı sözleşmesinin kurulması ve ifası, hukuki
        yükümlülüklerin yerine getirilmesi, bir hakkın tesisi veya korunması ve
        temel haklarınıza zarar vermemek kaydıyla hizmetin güvenliği ile
        geliştirilmesine yönelik meşru menfaatler kapsamında işlenir. Açık rıza
        gerektiren yeni bir işlem yapılırsa ayrıca ve isteğe bağlı onay alınır.
      </p>
      <h2>4. Aktarım ve altyapı sağlayıcıları</h2>
      <p>
        Veriler satılmaz. Hizmetin çalışması için gerekli olduğu ölçüde kimlik
        doğrulama ve veritabanı altyapısı (Supabase), barındırma (Vercel),
        güvenlik doğrulaması (Cloudflare) ve yetkili kamu kurumlarıyla paylaşım
        yapılabilir. Bu sağlayıcıların yurt dışındaki altyapılarının
        kullanılması halinde aktarım, KVKK’daki yurt dışı aktarım hükümlerine ve
        uygun güvencelere tabi olarak gerçekleştirilir.
      </p>
      <h2>5. Saklama süresi ve güvenlik</h2>
      <p>
        Hesap verileri, hesap aktif olduğu veya hizmetin sunulması için gerekli
        olduğu sürece; güvenlik ve yasal kayıtlar ilgili amaç için gereken
        sınırlı süre boyunca tutulur. Süre sona erdiğinde veriler silinir, yok
        edilir veya anonimleştirilir. Erişim kontrolü, satır seviyesinde
        yetkilendirme, şifreli bağlantı ve kötüye kullanım önleme tedbirleri
        uygulanır.
      </p>
      <h2>6. Haklarınız</h2>
      <p>
        KVKK’nın 11. maddesi kapsamında verilerinizin işlenip işlenmediğini
        öğrenme; bilgi, düzeltme veya silme isteme; aktarılan üçüncü kişileri
        öğrenme; otomatik analiz sonucuna itiraz etme ve hukuka aykırı işleme
        nedeniyle zararın giderilmesini talep etme haklarına sahipsiniz.
      </p>
      <p>
        Taleplerinizi kimliğinizi doğrulamaya elverişli bilgilerle{" "}
        <a href="mailto:chef@tiramisup.app">chef@tiramisup.app</a> adresine
        iletebilirsiniz. Başvurular yasal süre içinde sonuçlandırılır.
      </p>
      <h2>7. Değişiklikler</h2>
      <p>
        Metin güncellendiğinde yeni sürüm ve yürürlük tarihi bu sayfada
        yayımlanır. İşleme amacını veya hukuki sebebi önemli ölçüde değiştiren
        durumlarda ayrıca bilgilendirme yapılır.
      </p>
    </LegalLayout>
  );
}
