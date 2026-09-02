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
});
