import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { hoverKoru } from "./hoverKoru.js";

test("hoverKoru: yalniz :hover secicisi hover:hover icine alinir, yeri korunur", () => {
  assert.equal(
    hoverKoru(".a{color:red}.a:hover{color:blue}.b{color:green}"),
    ".a{color:red}@media (hover:hover){.a:hover{color:blue}}.b{color:green}",
  );
});

test("hoverKoru: ortak kuraldaki hover olmayan secici disarida kalir", () => {
  assert.equal(
    hoverKoru(".x:hover,.x.aktif{background:lime}"),
    ".x.aktif{background:lime}@media (hover:hover){.x:hover{background:lime}}",
  );
});

test("hoverKoru: @media icindeki kurallar islenir, @keyframes ve @import korunur", () => {
  const girdi =
    "@import url('https://f.example/css2?family=A&family=B:wght@400;500&display=swap');\n" +
    "@keyframes k{50%{opacity:.5}}@media(max-width:600px){.a:hover{top:1px}.b{top:2px}}";
  assert.equal(
    hoverKoru(girdi),
    "@import url('https://f.example/css2?family=A&family=B:wght@400;500&display=swap');\n" +
      "@keyframes k{50%{opacity:.5}}@media(max-width:600px){@media (hover:hover){.a:hover{top:1px}}.b{top:2px}}",
  );
});

test("hoverKoru: :not(...) icindeki virgul seciciyi bolmez", () => {
  assert.equal(
    hoverKoru(".a:not(.b,.c):hover{x:1}"),
    "@media (hover:hover){.a:not(.b,.c):hover{x:1}}",
  );
});

test("App.jsx stilinde korunmamis :hover kalmaz", () => {
  const kaynak = readFileSync(new URL("./App.jsx", import.meta.url), "utf8");
  assert.match(kaynak, /const CSS = hoverKoru\(`/);
});
