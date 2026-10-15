-- FF21 website: Find my home leads, saved step by step.
-- Safe to run in a shared project: it only creates new ff21_ objects and
-- stops with an error (changing nothing) if they already exist.

create table public.ff21_leads (
  id uuid primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'started' check (status in ('started', 'submitted')),
  last_step text,
  first_name text,
  last_name text,
  phone text,
  email text,
  source text,
  referral_code text,
  places text[],
  move_in text,
  stay text,
  budget text,
  room text,
  gender text,
  property text,
  attribution jsonb,
  page text,
  zoho_status text,
  zoho_detail text,
  submitted_at timestamptz
);

comment on table public.ff21_leads is 'FF21 website Find my home leads. One row per visit, updated at every step.';

create index ff21_leads_created_at_idx on public.ff21_leads (created_at desc);
create index ff21_leads_phone_idx on public.ff21_leads (phone);

-- Nobody reads or writes the table through the API directly.
alter table public.ff21_leads enable row level security;
revoke all on public.ff21_leads from anon, authenticated;

-- The website saves through this one function: it merges each save into the
-- row for that visit and never blanks an answer that was already given.
create function public.ff21_save_lead(p jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := (p->>'id')::uuid;
begin
  if v_id is null then
    raise exception 'id is required';
  end if;

  insert into public.ff21_leads as l (
    id, status, last_step, first_name, last_name, phone, email, source, referral_code,
    places, move_in, stay, budget, room, gender, property, attribution, page,
    zoho_status, zoho_detail, submitted_at
  ) values (
    v_id,
    coalesce(nullif(p->>'status', ''), 'started'),
    left(p->>'last_step', 20),
    left(p->>'first_name', 60),
    left(p->>'last_name', 60),
    left(p->>'phone', 20),
    left(p->>'email', 120),
    left(p->>'source', 40),
    left(p->>'referral_code', 40),
    case when jsonb_typeof(p->'places') = 'array'
      then (select array_agg(left(x, 60)) from (select jsonb_array_elements_text(p->'places') x limit 8) s)
    end,
    left(p->>'move_in', 60),
    left(p->>'stay', 40),
    left(p->>'budget', 60),
    left(p->>'room', 40),
    left(p->>'gender', 20),
    left(p->>'property', 60),
    case when jsonb_typeof(p->'attribution') = 'object' then p->'attribution' end,
    left(p->>'page', 300),
    left(p->>'zoho_status', 20),
    left(p->>'zoho_detail', 500),
    case when p->>'status' = 'submitted' then now() end
  )
  on conflict (id) do update set
    updated_at    = now(),
    status        = case when l.status = 'submitted' then 'submitted' else excluded.status end,
    last_step     = coalesce(excluded.last_step, l.last_step),
    first_name    = coalesce(excluded.first_name, l.first_name),
    last_name     = coalesce(excluded.last_name, l.last_name),
    phone         = coalesce(excluded.phone, l.phone),
    email         = coalesce(excluded.email, l.email),
    source        = coalesce(excluded.source, l.source),
    referral_code = coalesce(excluded.referral_code, l.referral_code),
    places        = coalesce(excluded.places, l.places),
    move_in       = coalesce(excluded.move_in, l.move_in),
    stay          = coalesce(excluded.stay, l.stay),
    budget        = coalesce(excluded.budget, l.budget),
    room          = coalesce(excluded.room, l.room),
    gender        = coalesce(excluded.gender, l.gender),
    property      = coalesce(excluded.property, l.property),
    attribution   = coalesce(excluded.attribution, l.attribution),
    page          = coalesce(excluded.page, l.page),
    zoho_status   = coalesce(excluded.zoho_status, l.zoho_status),
    zoho_detail   = coalesce(excluded.zoho_detail, l.zoho_detail),
    submitted_at  = coalesce(l.submitted_at, excluded.submitted_at);
end;
$$;

-- Supabase grants new functions to anon and authenticated by default; take
-- those back so only the website's key (anon) can call it.
revoke all on function public.ff21_save_lead(jsonb) from public, anon, authenticated;
grant execute on function public.ff21_save_lead(jsonb) to anon;
