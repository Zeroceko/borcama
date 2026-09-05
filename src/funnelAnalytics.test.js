import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { edinimKaynaginiOlustur } from "./acquisition.js";

describe("edinim kaynağı", () => {
  it("Google Ads tıklamasını kaynak ve kanal olarak tanır", () => {
    assert.deepEqual(edinimKaynaginiOlustur({ search: "?gclid=abc&utm_campaign=borc" }), {
      source: "google", medium: "cpc", campaign: "borc", click_id: "abc",
      content: "", term: "", plan: "",
    });
  });

  it("oturum içindeki ilk teması sonraki kampanyayla ezmez", () => {
    const saved = { source: "instagram", medium: "social", campaign: "ilk", click_id: "" };
    assert.deepEqual(edinimKaynaginiOlustur({ search: "?utm_source=google&utm_medium=cpc", saved }), {
      ...saved, content: "", term: "", plan: "",
    });
  });

  it("plan tercihini kayıt sayfasında güncelleyebilir", () => {
    const saved = { source: "instagram", medium: "social", plan: "" };
    assert.equal(edinimKaynaginiOlustur({ search: "?plan=free", saved }).plan, "free");
  });

  it("UTM alanlarını güvenli karakterlere ve alan uzunluklarına sınırlar", () => {
    const sonuc = edinimKaynaginiOlustur({
      search: `?utm_source=GOOGLE%3Cscript%3E&utm_medium=CPC%0A&utm_campaign=${"a".repeat(140)}&utm_term=bor%C3%A7%20%F0%9F%92%B3&gclid=abc%3C%3E%23-_.`,
    });
    assert.equal(sonuc.source, "google script");
    assert.equal(sonuc.medium, "cpc");
    assert.equal(sonuc.campaign.length, 120);
    assert.equal(sonuc.term, "borç");
    assert.equal(sonuc.click_id, "abc-_.");
  });

  it("yalnız bilinen başlangıç planlarını kabul eder", () => {
    assert.equal(edinimKaynaginiOlustur({ search: "?plan=enterprise" }).plan, "");
    assert.equal(edinimKaynaginiOlustur({ search: "?plan=PRO" }).plan, "pro");
  });

  it("Google arama yönlendirmesini organik kanal olarak normalize eder", () => {
    const sonuc = edinimKaynaginiOlustur({ referrer: "www.google.com" });
    assert.equal(sonuc.source, "google");
    assert.equal(sonuc.medium, "organic");
  });
});
