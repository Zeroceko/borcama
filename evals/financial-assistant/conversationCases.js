import { ASISTAN_EVAL_VAKALARI } from "./cases.js";

const baglam = ASISTAN_EVAL_VAKALARI.find((vaka) => vaka.aile === "kart_kmh").baglam;
const history = [{
  question: "100.000 TL geldi, araba mı alsam?",
  answer: "Kısa cevap: Önce borçlarını ve aylık ödeme gücünü birlikte değerlendirmek gerekir.\n• Aracı hangi amaçla kullanacağını söyle.\n• Araç fiyatı, bakım ve sigorta giderlerini öğren.",
}];

export const ASISTAN_KONUSMA_EVAL_VAKALARI = [
  {
    id: "konusma-araba-devam", aile: "konusma", sentetik: true, baglam, history,
    soru: "İşe gidip gelmek için ikinci el düşünüyorum.",
    beklenen: {
      rotalar: ["plan", "ozet", "harcamalar", "none"], dahaFazlaBilgi: true,
      kavramlar: [["100.000", "100 bin"], ["araba", "araç"], ["bakım", "sigorta"], ["borç"]],
      yasakIfadeler: ["kesinlikle al", "borcun yok"],
    },
    referans: {
      title: "İhtiyaçsa toplam araç gideriyle karşılaştır",
      answer: "Kısa cevap: İşe ulaşım için düşünmen önemli; gelen 100.000 TL’yi yine de borçların ve araç giderleriyle birlikte değerlendirmelisin.\n• İkinci el araç fiyatını, bakım ve sigorta giderini öğren.\n• Borç ödemeleri ve acil ihtiyaçlar için ayıracağın parayı belirle.\n• Bu tutar hesabına kaydedilmedi; satın alma kararından önce bütçeye etkisini karşılaştır.",
      route: "plan", actionLabel: "Planı aç", needsMoreInfo: true, disclaimer: "Gelen para kullanıcı beyanıdır; araç giderleri henüz bilinmiyor.",
    },
  },
  {
    id: "konusma-tutar-duzeltme", aile: "konusma", sentetik: true, baglam, history,
    soru: "Yanlış söyledim, gelen para 80.000 TL. Buna göre tekrar değerlendir.",
    beklenen: {
      rotalar: ["plan", "ozet", "harcamalar", "none"], dahaFazlaBilgi: true,
      kavramlar: [["80.000", "80 bin"], ["araba", "araç"], ["borç"]],
      yasakIfadeler: ["100.000 TL kullanabilirsin", "kesinlikle al"],
    },
    referans: {
      title: "Düzelttiğin tutarla yeniden karşılaştır",
      answer: "Kısa cevap: Gelen parayı artık 80.000 TL olarak değerlendiriyorum. Araba için ayırabileceğin tutar borçların ve temel ihtiyaçların karşılandıktan sonra belirlenmeli.\n• Araç fiyatı, bakım ve sigorta giderlerini öğren.\n• Borç ödemelerine ayıracağın parayı önce belirle.\n• Gelen tutarı kayıtlı nakit bakiyenle karıştırmadan bütçeye etkisini karşılaştır.",
      route: "plan", actionLabel: "Planı aç", needsMoreInfo: true, disclaimer: "Araç teklifi ve ek giderler bilinmeden kesin karar verilemez.",
    },
  },
];
