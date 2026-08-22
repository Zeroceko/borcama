import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BarChart3, CheckCircle2, Eye, RefreshCw, UserPlus, Users } from "lucide-react";
import { supabase } from "./supabaseClient.js";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;600;700&display=swap');
.an,.an *{box-sizing:border-box}.an{min-height:100vh;background:#f4efe0;color:#14160f;font-family:'Space Grotesk',sans-serif}.an-wrap{width:min(1120px,calc(100% - 32px));margin:auto;padding:42px 0 80px}.an-top,.an-actions,.an-range{display:flex;align-items:center;gap:9px;flex-wrap:wrap}.an-top{justify-content:space-between;margin-bottom:38px}.an-back,.an-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:40px;padding:0 14px;border:1px solid #d6d1c4;border-radius:999px;background:#fff;color:#14160f;text-decoration:none;font:700 12px inherit;cursor:pointer}.an-btn.primary{background:#cdf564}.an h1{margin:0;font:clamp(38px,6vw,64px)/.98 'Archivo Black';letter-spacing:-.05em}.an-lead{max-width:680px;margin:12px 0 28px;color:#5f6257;line-height:1.6}.an-toolbar{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:18px}.an-range button{min-height:36px;padding:0 13px;border:1px solid #d6d1c4;border-radius:999px;background:#fff;font:700 11px inherit;cursor:pointer}.an-range button.active{background:#cdf564}.an-panel{padding:28px;border:1px solid #d9d5c9;border-radius:24px;background:#fff;box-shadow:0 16px 45px rgba(20,22,15,.05)}.an-funnel{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));align-items:center;gap:10px}.an-step{grid-column:span 1;min-height:150px;padding:20px;border-radius:18px;background:#eef4e7}.an-step:nth-of-type(2){background:#e0ece6}.an-step:nth-of-type(3){background:#fff0eb}.an-step:nth-of-type(4){background:#e8fac0}.an-step-icon{width:38px;height:38px;display:grid;place-items:center;border-radius:12px;background:#fff}.an-step>span:not(.an-step-icon){display:block;margin:18px 0 7px;color:#66695d;font-size:11px;font-weight:700}.an-step strong{display:block;font:30px 'Archivo Black'}.an-step small{display:block;margin-top:8px;color:#76796d;font-size:10px}.an-arrow{display:grid;place-items:center;color:#7d8175}.an-grid{display:grid;grid-template-columns:1.35fr .65fr;gap:18px;margin-top:18px}.an-card{padding:24px;border:1px solid #d9d5c9;border-radius:22px;background:#fff}.an-card h2{margin:0 0 5px;font-size:20px}.an-card>p{margin:0 0 20px;color:#727568;font-size:12px}.an-chart{height:220px;display:flex;align-items:end;gap:5px;padding-top:20px}.an-day{flex:1;display:grid;grid-template-columns:1fr 1fr;align-items:end;gap:2px;height:100%}.an-bar{min-height:2px;border-radius:5px 5px 0 0;background:#a9c2b5}.an-bar.register{background:#cdf564}.an-legend{display:flex;gap:16px;margin-top:12px;color:#686b60;font-size:11px}.an-legend span{display:inline-flex;align-items:center;gap:6px}.an-legend i{width:9px;height:9px;border-radius:3px;background:#a9c2b5}.an-legend span:last-child i{background:#cdf564}.an-sources{display:grid;gap:12px}.an-source-head{display:flex;justify-content:space-between;gap:12px;font-size:12px}.an-track{height:8px;margin-top:5px;border-radius:99px;background:#ece9df;overflow:hidden}.an-track i{display:block;height:100%;border-radius:inherit;background:#ff6f59}.an-note{margin-top:18px;padding:16px 18px;border-radius:16px;background:#e0ece6;color:#48544c;font-size:12px;line-height:1.55}.an-empty{padding:54px;text-align:center;color:#6e7165}.an-error{padding:16px;border-radius:15px;background:#ffe8e3;color:#9b3325}
@media(max-width:850px){.an-funnel{grid-template-columns:1fr}.an-step{min-height:0}.an-arrow{transform:rotate(90deg)}.an-grid{grid-template-columns:1fr}.an-toolbar{align-items:flex-start;flex-direction:column}}@media(max-width:520px){.an-wrap{width:min(100% - 20px,1120px);padding-top:24px}.an-panel,.an-card{padding:18px}.an-top{align-items:flex-start}.an-actions{width:100%}.an-actions .an-btn{flex:1}.an-chart{height:160px}}
`;

async function api() {
  const { data } = await supabase.auth.getSession();
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/backoffice`, {
    headers: { Authorization: `Bearer ${data.session?.access_token}` },
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "ANALYTICS_UNAVAILABLE");
  return json.analytics;
}

const toplam = (rows, key) => rows.reduce((sum, row) => sum + Number(row[key] || 0), 0);
const yuzde = (value, base) => base > 0 ? `%${Math.round((value / base) * 100)}` : "—";

export default function Analytics() {
  const [veri, setVeri] = useState(null);
  const [gun, setGun] = useState(30);
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(true);
  async function yukle() {
    setYukleniyor(true); setHata("");
    try { setVeri(await api()); } catch { setHata("Analytics verileri alınamadı."); }
    finally { setYukleniyor(false); }
  }
  useEffect(() => { yukle(); }, []);
  const rows = useMemo(() => (veri?.daily || []).slice(-gun), [veri, gun]);
  const funnel = useMemo(() => {
    const visitors = toplam(rows, "visitors");
    const registerViews = toplam(rows, "register_views");
    const accounts = toplam(rows, "accounts_created");
    const verified = toplam(rows, "accounts_verified");
    return { visitors, registerViews, accounts, verified };
  }, [rows]);
  const max = Math.max(1, ...rows.map(x => Math.max(Number(x.visitors || 0), Number(x.register_views || 0))));
  const maxSource = Math.max(1, ...(veri?.sources || []).map(x => Number(x.visitors || 0)));
  return <div className="an"><style>{CSS}</style><main className="an-wrap">
    <div className="an-top"><a className="an-back" href="/backoffice"><ArrowLeft size={15}/> Backoffice'e dön</a><div className="an-actions"><a className="an-btn" href="/marketing">Marketing</a><button className="an-btn primary" onClick={yukle} disabled={yukleniyor}><RefreshCw size={14}/> Yenile</button></div></div>
    <div className="an-toolbar"><div><h1>Kayıt funnel'ı</h1><p className="an-lead">Borcama'yı ziyaret edenlerin kayıt ve e-posta doğrulama adımlarında nasıl ilerlediğini gör.</p></div><div className="an-range">{[7,30,90].map(x=><button key={x} className={gun===x?"active":""} onClick={()=>setGun(x)}>Son {x} gün</button>)}</div></div>
    {hata?<div className="an-error">{hata}</div>:yukleniyor?<div className="an-panel an-empty">Veriler hazırlanıyor…</div>:!veri?.available?<div className="an-panel an-empty">Ölçüm altyapısı henüz veri toplamaya başlamadı.</div>:<>
      <section className="an-panel"><div className="an-funnel">
        <Step icon={<Eye/>} label="Site ziyaretçisi" value={funnel.visitors} detail="Tarayıcı oturumu"/>
        <ArrowRight className="an-arrow"/><Step icon={<Users/>} label="Kayıt ekranını açtı" value={funnel.registerViews} detail={yuzde(funnel.registerViews,funnel.visitors)}/>
        <ArrowRight className="an-arrow"/><Step icon={<UserPlus/>} label="Hesap oluşturdu" value={funnel.accounts} detail={yuzde(funnel.accounts,funnel.registerViews)}/>
        <ArrowRight className="an-arrow"/><Step icon={<CheckCircle2/>} label="E-postasını doğruladı" value={funnel.verified} detail={yuzde(funnel.verified,funnel.accounts)}/>
      </div></section>
      <div className="an-grid"><section className="an-card"><h2>Günlük hareket</h2><p>Ziyaret ve kayıt ekranına geçiş eğilimi</p><div className="an-chart">{rows.map(row=><div className="an-day" key={row.day} title={`${row.day}: ${row.visitors} ziyaret, ${row.register_views} kayıt ekranı`}><i className="an-bar" style={{height:`${Math.max(2,Number(row.visitors||0)/max*100)}%`}}/><i className="an-bar register" style={{height:`${Math.max(2,Number(row.register_views||0)/max*100)}%`}}/></div>)}</div><div className="an-legend"><span><i/> Ziyaret</span><span><i/> Kayıt ekranı</span></div></section>
      <section className="an-card"><h2>Ziyaret kaynakları</h2><p>Son 90 gündeki ilk temas</p><div className="an-sources">{(veri.sources||[]).map(x=><div key={x.source}><div className="an-source-head"><span>{x.source}</span><b>{x.visitors}</b></div><div className="an-track"><i style={{width:`${Number(x.visitors||0)/maxSource*100}%`}}/></div></div>)}</div></section></div>
      <div className="an-note">Ziyaretçi ölçümü çerez, IP adresi veya e-posta saklamaz; yalnızca açık tarayıcı oturumunu sayar. Hesap oluşturma ve doğrulama rakamları Supabase kayıtlarından gelir.</div>
    </>}
  </main></div>;
}

function Step({ icon, label, value, detail }) { return <div className="an-step"><span className="an-step-icon">{React.cloneElement(icon,{size:19})}</span><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>; }
