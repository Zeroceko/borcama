-- iOS "Kullanım istatistikleri": açık rızalı, varsayılan kapalı birinci taraf
-- sayaçlar. İzin hesapla birlikte (hangi metin sürümüne, ne zaman) tutulur;
-- olaylar hiçbir hesaba, cihaza veya oturuma bağlanmaz, zaman saate yuvarlanır.
-- Tutar, banka, kart, dosya adı ve serbest metin şema gereği yazılamaz.

create table if not exists public.kullanim_istatistigi_izinleri (
  user_id uuid primary key references auth.users(id) on delete cascade,
  izin boolean not null,
  metin_surumu text not null check (metin_surumu ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'),
  guncellendi timestamptz not null default now()
);

alter table public.kullanim_istatistigi_izinleri enable row level security;

drop policy if exists "kullanim izni kendi kaydi" on public.kullanim_istatistigi_izinleri;
create policy "kullanim izni kendi kaydi" on public.kullanim_istatistigi_izinleri
  for select to authenticated using (user_id = auth.uid());

create table if not exists public.kullanim_olaylari (
  id bigint generated always as identity primary key,
  olay text not null check (olay in (
    'ekstre_okundu',
    'ekstre_okunamadi',
    'ekstre_kaydedildi',
    'odeme_kaydedildi',
    'harcama_kaydedildi',
    'borc_eklendi',
    'bildirimden_acildi'
  )),
  ayrinti text check (ayrinti is null or ayrinti ~ '^[a-z0-9_]{1,32}$'),
  surum text check (surum is null or surum ~ '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$'),
  saat timestamptz not null default date_trunc('hour', now())
);

-- Yalnız servis rolü okur; istemci tabloya doğrudan erişemez.
alter table public.kullanim_olaylari enable row level security;
create index if not exists kullanim_olaylari_saat_olay on public.kullanim_olaylari (saat, olay);

create or replace function public.kullanim_izni_oku()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select k.izin from public.kullanim_istatistigi_izinleri k where k.user_id = auth.uid()
  ), false);
$$;

create or replace function public.kullanim_izni_ayarla(p_izin boolean, p_metin_surumu text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'oturum gerekli';
  end if;
  insert into public.kullanim_istatistigi_izinleri (user_id, izin, metin_surumu, guncellendi)
  values (auth.uid(), coalesce(p_izin, false), p_metin_surumu, now())
  on conflict (user_id) do update
    set izin = excluded.izin,
        metin_surumu = excluded.metin_surumu,
        guncellendi = excluded.guncellendi;
  return coalesce(p_izin, false);
end;
$$;

-- İzin sunucuda yeniden doğrulanır; izin yoksa hiçbir şey yazılmaz.
create or replace function public.kullanim_olayi_kaydet(p_olay text, p_ayrinti text, p_surum text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.kullanim_istatistigi_izinleri k
    where k.user_id = auth.uid() and k.izin
  ) then
    return false;
  end if;
  insert into public.kullanim_olaylari (olay, ayrinti, surum)
  values (p_olay, p_ayrinti, p_surum);
  -- Saklama süresi (açık rıza metni): 24 aydan eski sayaçlar silinir.
  delete from public.kullanim_olaylari where saat < now() - interval '24 months';
  return true;
end;
$$;

revoke all on function public.kullanim_izni_oku() from public, anon;
revoke all on function public.kullanim_izni_ayarla(boolean, text) from public, anon;
revoke all on function public.kullanim_olayi_kaydet(text, text, text) from public, anon;
grant execute on function public.kullanim_izni_oku() to authenticated;
grant execute on function public.kullanim_izni_ayarla(boolean, text) to authenticated;
grant execute on function public.kullanim_olayi_kaydet(text, text, text) to authenticated;
