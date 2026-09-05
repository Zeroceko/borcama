import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const statePath = resolve(".codex-state/sentry-issues.json");
const shouldCommit = process.argv.includes("--commit");
const token = execFileSync("security", ["find-generic-password", "-a", "borcama-monitoring", "-s", "borcama-sentry-token", "-w"], { encoding: "utf8" }).trim();

const url = new URL("https://sentry.io/api/0/organizations/borcama/issues/");
url.searchParams.set("project", "4512024142217296");
url.searchParams.set("query", "is:unresolved environment:production");
url.searchParams.set("statsPeriod", "24h");
url.searchParams.set("sort", "date");
url.searchParams.set("limit", "25");

const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
if (!response.ok) throw new Error(`Sentry issue read failed with HTTP ${response.status}`);
const issues = await response.json();

let previous = {};
try {
  previous = JSON.parse(await readFile(statePath, "utf8"));
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

const current = Object.fromEntries(issues.map((issue) => [issue.id, {
  count: Number(issue.count || 0), lastSeen: issue.lastSeen || null,
}]));
const changes = issues.flatMap((issue) => {
  const before = previous[issue.id];
  const count = Number(issue.count || 0);
  const delta = before ? count - Number(before.count || 0) : count;
  if (before && delta <= 0 && before.lastSeen === issue.lastSeen) return [];
  return [{
    id: issue.shortId || issue.id, title: issue.title, level: issue.level,
    count, delta, userCount: Number(issue.userCount || 0),
    firstSeen: issue.firstSeen, lastSeen: issue.lastSeen,
    permalink: issue.permalink, isNew: !before,
  }];
});

if (shouldCommit) {
  await mkdir(dirname(statePath), { recursive: true });
  await writeFile(statePath, `${JSON.stringify(current, null, 2)}\n`);
}
process.stdout.write(`${JSON.stringify({ checkedAt: new Date().toISOString(), unresolved24h: issues.length, changes }, null, 2)}\n`);
