import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("CRM son giriş etkinliğini erişim engelinden ayrı gösterir", async () => {
  const [backoffice, api] = await Promise.all([
    read("./Backoffice.jsx"),
    read("../supabase/functions/backoffice/index.ts"),
  ]);
  assert.match(api, /access_status: erisimEngelli \? "blocked" : "normal"/);
  assert.match(api, /banned_until: erisimEngelli \? yasakBitisi : null/);
  assert.match(backoffice, /Son giriş etkinliği/);
  assert.match(backoffice, /Erişim engelli/);
  assert.match(backoffice, /Son giriş etkinliği erişim yetkisi değildir/);
});
