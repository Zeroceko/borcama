const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const dark of [false, true]) {
    const p = await (await b.newContext({viewport:{width:1280,height:900}})).newPage();
    await p.goto('file://'+process.cwd()+'/wrapweb.html'); await p.waitForTimeout(400);
    if (dark) { await p.click('#koyu-anahtar'); await p.waitForTimeout(300); }
    const out = await p.evaluate(() => {
      const parse = c => { const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/); return m ? [+m[1],+m[2],+m[3], m[4]===undefined?1:+m[4]] : null; };
      const lum = ([r,g,b]) => { const f = c => { c/=255; return c<=0.03928? c/12.92 : Math.pow((c+0.055)/1.055,2.4); }; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); };
      const cr = (a,b) => { const la=lum(a), lb=lum(b); return (Math.max(la,lb)+0.05)/(Math.min(la,lb)+0.05); };
      const blend = (fg, bg) => fg[3] >= 1 ? fg : [0,1,2].map(i => fg[i]*fg[3] + bg[i]*(1-fg[3])).concat([1]);
      const bgOf = el => { let bg=[255,255,255,0]; const chain=[]; for (let e=el; e; e=e.parentElement) { const c=parse(getComputedStyle(e).backgroundColor); if (c && c[3]>0) chain.push(c); if (c && c[3]>=1) break; } chain.reverse(); let acc=[244,239,224,1]; for (const c of chain) acc = blend(c, acc); return acc; };
      const res = [];
      for (const el of document.querySelectorAll('body *')) {
        const txt = [...el.childNodes].filter(n => n.nodeType===3 && n.textContent.trim()).map(n=>n.textContent.trim()).join(' ');
        if (!txt) continue;
        const cs = getComputedStyle(el); if (cs.visibility==='hidden' || cs.display==='none') continue;
        const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
        const fg = blend(parse(cs.color), bgOf(el)); const bg = bgOf(el);
        const ratio = cr(fg, bg); const size = parseFloat(cs.fontSize); const bold = parseInt(cs.fontWeight) >= 700;
        const need = (size >= 24 || (size >= 18.66 && bold)) ? 3 : 4.5;
        if (ratio < need) res.push({ t: txt.slice(0,40), ratio: +ratio.toFixed(2), need, cls: el.className && el.className.baseVal === undefined ? el.className : el.tagName, fg: cs.color, bg: bg.map(Math.round).join(',') });
      }
      return res;
    });
    console.log(dark ? 'KOYU' : 'AÇIK', out.length, JSON.stringify(out.slice(0,30), null, 0));
    await p.close();
  }
  await b.close();
})();
