// Dokunmatik ekranda (iOS) :hover, dokunduktan sonra "takili" kalir: kart
// havada, dugme renkli gorunur. Bu fonksiyon :hover iceren secicileri
// `@media (hover:hover)` icine alir; yerleri degismez, kaskad sirasi korunur.
// Ayni kuraldaki hover olmayan secici (ornegin `.x:hover,.x.aktif`) disarida
// kalir. @media icindeki kurallar da islenir; @keyframes'e dokunulmaz.

function blokSonu(css, acilis) {
  let derinlik = 0;
  let tirnak = null;
  for (let i = acilis; i < css.length; i += 1) {
    const c = css[i];
    if (tirnak) {
      if (c === "\\") i += 1;
      else if (c === tirnak) tirnak = null;
      continue;
    }
    if (c === '"' || c === "'") tirnak = c;
    else if (c === "{") derinlik += 1;
    else if (c === "}") {
      derinlik -= 1;
      if (derinlik === 0) return i;
    }
  }
  return css.length - 1;
}

function tirnakDisiAra(css, aranan, bas) {
  let tirnak = null;
  for (let i = bas; i < css.length; i += 1) {
    const c = css[i];
    if (tirnak) {
      if (c === "\\") i += 1;
      else if (c === tirnak) tirnak = null;
    } else if (c === '"' || c === "'") tirnak = c;
    else if (c === aranan) return i;
  }
  return -1;
}

function seciciBol(secici) {
  const parcalar = [];
  let derinlik = 0;
  let bas = 0;
  for (let i = 0; i < secici.length; i += 1) {
    const c = secici[i];
    if (c === "(") derinlik += 1;
    else if (c === ")") derinlik -= 1;
    else if (c === "," && derinlik === 0) {
      parcalar.push(secici.slice(bas, i));
      bas = i + 1;
    }
  }
  parcalar.push(secici.slice(bas));
  return parcalar;
}

function kuralKoru(secici, govde) {
  const parcalar = seciciBol(secici);
  const hover = parcalar.filter((p) => p.includes(":hover"));
  if (!hover.length) return `${secici}{${govde}}`;
  const diger = parcalar.filter((p) => !p.includes(":hover"));
  const korunan = `@media (hover:hover){${hover.join(",")}{${govde}}}`;
  return diger.length ? `${diger.join(",")}{${govde}}${korunan}` : korunan;
}

export function hoverKoru(css) {
  let cikti = "";
  let i = 0;
  while (i < css.length) {
    if (css.startsWith("/*", i)) {
      const son = css.indexOf("*/", i + 2);
      const bitis = son === -1 ? css.length : son + 2;
      cikti += css.slice(i, bitis);
      i = bitis;
      continue;
    }
    const acilis = tirnakDisiAra(css, "{", i);
    if (acilis === -1) {
      cikti += css.slice(i);
      break;
    }
    // Bloksuz at-kurali (@import url('...;...');): tirnak icindeki ; sayilmaz.
    const noktaliVirgul = tirnakDisiAra(css, ";", i);
    if (css.slice(i).trimStart().startsWith("@") && noktaliVirgul !== -1 && noktaliVirgul < acilis) {
      cikti += css.slice(i, noktaliVirgul + 1);
      i = noktaliVirgul + 1;
      continue;
    }
    const kapanis = blokSonu(css, acilis);
    const bas = css.slice(i, acilis);
    const govde = css.slice(acilis + 1, kapanis);
    const secici = bas.trim();
    const onBosluk = bas.slice(0, bas.length - bas.trimStart().length);
    if (/^@(media|supports|container|layer)\b/.test(secici)) {
      cikti += `${onBosluk}${secici}{${hoverKoru(govde)}}`;
    } else if (secici.startsWith("@")) {
      cikti += `${onBosluk}${secici}{${govde}}`;
    } else {
      cikti += onBosluk + kuralKoru(secici, govde);
    }
    i = kapanis + 1;
  }
  return cikti;
}
