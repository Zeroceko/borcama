// CSP satır içi betiğe izin vermediği için ayrı dosyada (script-src 'self').
// Statik landing metni arama motorları ve JavaScript çalıştırmayan
// tarayıcılar içindir. Uygulama ekranlarında, oturumu açık kullanıcıda
// iOS kabuğunda ve CRM alanında React yüklenene kadar bile gösterilmez.
try {
  var oturumVar = Object.keys(localStorage).some(function (k) { return /^sb-.*-auth-token$/.test(k); });
  if (location.pathname !== "/" || location.hostname.indexOf("crm.") === 0 || oturumVar || window.Capacitor) document.documentElement.classList.add("borcama-statik-gizli");
} catch (e) {}
