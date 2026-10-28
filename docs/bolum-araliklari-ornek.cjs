const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:1280,height:900}})).newPage();
await p.goto('file://'+process.cwd()+'/wrapweb.html'); await p.waitForTimeout(500);
const r = await p.evaluate(() => {
  // görünür içerik kutuları: her ana bölümün ilk ve son görünür çocuğu
  const secs = [...document.querySelectorAll('header.ust, main > section, footer.alt')];
  const box = el => { const r = el.getBoundingClientRect(); return [r.top + scrollY, r.bottom + scrollY]; };
  const content = sec => { const kids = [...sec.querySelectorAll('*')].filter(e => { const r=e.getBoundingClientRect(); const cs=getComputedStyle(e); return r.height>0 && r.width>0 && cs.visibility!=='hidden' && (e.children.length===0 || cs.backgroundColor!=='rgba(0, 0, 0, 0)' || e.tagName==='IMG'); }); let top=Infinity, bot=-Infinity; for (const k of kids) { const [t,bt]=box(k); top=Math.min(top,t); bot=Math.max(bot,bt);} return [Math.round(top), Math.round(bot)]; };
  const out=[]; let prev=null;
  for (const s of secs) { const c = content(s); const name = (s.id || s.className || s.tagName).toString().slice(0,20); if (prev) out.push({from: prev.name, to: name, gap: c[0]-prev.bot}); prev={name, bot:c[1]}; }
  return out; });
console.log(r); await b.close(); })();
