import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");

test("Borcama'ya Sor kampanyasi konu, guvenlik ve olcum bilgilerini birlikte tasir", () => {
  const preview = read("../public/borcama-asistan-email-preview.html");
  const marketing = read("./Marketing.jsx");
  const app = read("./App.jsx");
  const main = read("./main.jsx");
  const backoffice = read("../supabase/functions/backoffice/index.ts");
  const migration = read("../supabase/migrations/20260910233000_assistant_announcement_campaign.sql");

  assert.match(preview, /Siz istediniz, biz yaptık - 3 -/);
  assert.match(preview, /Borcama'ya sor/);
  assert.match(preview, /BETA/);
  assert.match(preview, /Ham ekstre, kart numarası ve işlem açıklamaları modele gönderilmez/);
  assert.match(preview, /utm_campaign=siz_istediniz_3/);
  assert.match(preview, /summary\?assistant=1&amp;utm_source=resend/);
  assert.match(app, /searchParams\.get\("assistant"\) !== "1"/);
  assert.match(app, /setAsistanPenceresi\(true\)/);
  assert.match(main, /sorgu\.get\("assistant"\) === "1"/);
  assert.match(marketing, /send_assistant_announcement/);
  assert.match(backoffice, /borcamaAsistaniHedefleri/);
  assert.match(migration, /Doğrulanmış uygun üyeler/);
});
