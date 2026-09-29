#!/usr/bin/env node
// package.json surumunu Xcode projesine tasir.
//   CFBundleShortVersionString (MARKETING_VERSION)  = web surumu, or. 1.58.0
//   CFBundleVersion (CURRENT_PROJECT_VERSION)       = artan build numarasi
// Ayni surumden birden fazla build yuklenirse yalniz build numarasi artar.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const PBXPROJ = "ios/App/App.xcodeproj/project.pbxproj";
const buildArtir = process.argv.includes("--bump-build");

if (!existsSync(PBXPROJ)) {
  console.error(`iOS projesi bulunamadi: ${PBXPROJ}`);
  process.exit(1);
}

const surum = JSON.parse(readFileSync("package.json", "utf8")).version;
if (!/^\d+\.\d+\.\d+$/.test(surum)) {
  console.error(`package.json surumu beklenen bicimde degil: ${surum}`);
  process.exit(1);
}

let icerik = readFileSync(PBXPROJ, "utf8");

const oncekiSurum = icerik.match(/MARKETING_VERSION = ([^;]+);/)?.[1]?.trim();
icerik = icerik.replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${surum};`);

const mevcutBuild = Number(icerik.match(/CURRENT_PROJECT_VERSION = (\d+);/)?.[1] || 0);
const yeniBuild = buildArtir ? mevcutBuild + 1 : mevcutBuild;
if (buildArtir) {
  icerik = icerik.replace(/CURRENT_PROJECT_VERSION = \d+;/g, `CURRENT_PROJECT_VERSION = ${yeniBuild};`);
}

writeFileSync(PBXPROJ, icerik);

console.log(`iOS surumu: ${oncekiSurum ?? "?"} -> ${surum}`);
console.log(`iOS build:  ${mevcutBuild}${buildArtir ? ` -> ${yeniBuild}` : " (degismedi, --bump-build ile artir)"}`);
