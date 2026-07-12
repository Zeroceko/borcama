import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, RefreshCw, Search, ShieldCheck, Users } from "lucide-react";
import { supabase } from "./supabaseClient.js";

const CSS = `
.bo,.bo *{box-sizing:border-box}.bo{min-height:100vh;background:#f4efe0;color:#14160f;font-family:'Space Grotesk',system-ui,sans-serif}.bo-wrap{width:min(1180px,calc(100% - 32px));margin:auto;padding:42px 0 80px}.bo-head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;flex-wrap:wrap;margin-bottom:28px}.bo-back{display:inline-flex;align-items:center;gap:6px;color:#14160f;font-weight:700;font-size:13px;margin-bottom:18px}.bo h1{font-family:'Archivo Black',sans-serif;font-size:clamp(30px,5vw,48px);margin:0;text-shadow:3px 3px 0 #cdf564,5px 5px 0 #ff6f59}.bo-sub{color:#626458;margin-top:10px}.bo-btn{display:inline-flex;align-items:center;gap:7px;border:2px solid #14160f;border-radius:999px;background:#cdf564;padding:10px 15px;font-weight:800;cursor:pointer}.bo-btn:disabled{opacity:.55}.bo-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px}.bo-metric,.bo-panel{background:#fff;border:2px solid #14160f;border-radius:18px}.bo-metric{padding:20px}.bo-metric span{display:block;color:#6d7064;font-size:12px;margin-bottom:8px}.bo-metric b{font-family:'Archivo Black',sans-serif;font-size:28px}.bo-panel{overflow:hidden}.bo-toolbar{display:flex;justify-content:space-between;gap:14px;align-items:center;padding:16px;border-bottom:2px solid #14160f}.bo-search{position:relative;flex:1;max-width:420px}.bo-search svg{position:absolute;left:12px;top:12px}.bo-search input{width:100%;height:40px;border:2px solid #14160f;border-radius:999px;padding:0 14px 0 38px;font:inherit;background:#f4efe0}.bo-count{font-size:12px;color:#6d7064}.bo-table-wrap{overflow:auto}.bo-table{width:100%;border-collapse:collapse;min-width:820px}.bo-table th,.bo-table td{text-align:left;padding:14px 16px;border-bottom:1px solid #dedbcf;font-size:13px}.bo-table th{font-size:11px;text-transform:uppercase;letter-spacing:.06em;background:#f7f4ea}.bo-status{display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border-radius:999px;font-size:11px;font-weight:800;background:#eceee7}.bo-status.active{background:#cdf564}.bo-dot{width:7px;height:7px;border-radius:50%;background:#888}.bo-status.active .bo-dot{background:#315c43}.bo-empty,.bo-error{padding:42px;text-align:center;color:#6d7064}.bo-error{color:#a53a2a}.bo-secure{display:flex;align-items:center;gap:6px;margin-top:18px;color:#6d7064;font-size:11px}
@media(max-width:800px){.bo-metrics{grid-template-columns:repeat(2,1fr)}}@media(max-width:480px){.bo-metrics{grid-template-columns:1fr}.bo-wrap{width:min(100% - 20px,1180px)}}`;
const tarih = (v) => v ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(v)) : "—";

export default function Backoffice() {
  const [veri, setVeri] = useState(null); const [hata, setHata] = useState(""); const [yukleniyor, setYukleniyor] = useState(true); const [ara, setAra] = useState("");
  async function yukle() {
    setYukleniyor(true); setHata("");
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    try {
      const cevap = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/backoffice`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await cevap.json(); if (!cevap.ok) throw new Error(json.error); setVeri(json);
    } catch (e) { setHata(e.message === "FORBIDDEN" ? "Bu hesabın backoffice yetkisi yok." : "Backoffice verileri alınamadı."); }
    finally { setYukleniyor(false); }
  }
  useEffect(() => { yukle(); }, []);
  const kullanicilar = useMemo(() => (veri?.users || []).filter((x) => x.email.toLocaleLowerCase("tr-TR").includes(ara.toLocaleLowerCase("tr-TR"))), [veri, ara]);
  return <div className="bo"><style>{CSS}</style><div className="bo-wrap"><a className="bo-back" href="/summary"><ArrowLeft size={15}/> Uygulamaya dön</a><div className="bo-head"><div><h1>Borcama Backoffice</h1><div className="bo-sub">Kullanıcı girişleri ve hesap durumları</div></div><button className="bo-btn" onClick={yukle} disabled={yukleniyor}><RefreshCw size={15}/> Yenile</button></div>
  <div className="bo-metrics"><Metric ad="Toplam kullanıcı" deger={veri?.summary.total}/><Metric ad="Son 30 gün aktif" deger={veri?.summary.active_30d}/><Metric ad="Son 7 gün giriş" deger={veri?.summary.signed_in_7d}/><Metric ad="Son 7 gün yeni" deger={veri?.summary.new_7d}/></div>
  <div className="bo-panel"><div className="bo-toolbar"><div className="bo-search"><Search size={16}/><input value={ara} onChange={(e)=>setAra(e.target.value)} placeholder="E-posta ara"/></div><div className="bo-count"><Users size={13}/> {kullanicilar.length} kullanıcı</div></div>
  {yukleniyor?<div className="bo-empty">Yükleniyor…</div>:hata?<div className="bo-error">{hata}</div>:<div className="bo-table-wrap"><table className="bo-table"><thead><tr><th>Kullanıcı</th><th>Durum</th><th>Kayıt tarihi</th><th>Son giriş</th><th>Veri</th><th>Son veri güncellemesi</th></tr></thead><tbody>{kullanicilar.map((u)=><tr key={u.id}><td>{u.email}</td><td><span className={`bo-status ${u.status}`}><i className="bo-dot"/>{u.status==="active"?"Aktif":"Pasif"}</span></td><td>{tarih(u.created_at)}</td><td>{tarih(u.last_sign_in_at)}</td><td>{u.has_data?"Var":"Yok"}</td><td>{tarih(u.data_updated_at)}</td></tr>)}</tbody></table></div>}</div><div className="bo-secure"><ShieldCheck size={13}/> Finansal tutarlar bu ekranda gösterilmez. Erişim sunucu tarafında yönetici hesabıyla sınırlıdır.</div></div></div>;
}
function Metric({ad,deger}){return <div className="bo-metric"><span>{ad}</span><b>{deger ?? "—"}</b></div>}
