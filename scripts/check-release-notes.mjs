import { readFile } from "node:fs/promises";

const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const changelog = await readFile(new URL("../CHANGELOG.md", import.meta.url), "utf8");

const versionHeading = new RegExp(`^## \\[${packageJson.version.replaceAll(".", "\\.")}\\] - \\d{4}-\\d{2}-\\d{2}$`, "m");

if (!versionHeading.test(changelog)) {
  console.error(`CHANGELOG.md içinde ${packageJson.version} için tarihli bir sürüm başlığı bulunamadı.`);
  process.exit(1);
}

if (!changelog.includes("## Unreleased")) {
  console.error("CHANGELOG.md içinde Unreleased bölümü bulunamadı.");
  process.exit(1);
}

console.log(`Sürüm kaydı doğrulandı: ${packageJson.version}`);

