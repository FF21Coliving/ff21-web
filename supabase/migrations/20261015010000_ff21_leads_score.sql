-- The website's first guess at how warm each lead is (src/lib/lead-score.ts),
-- the same value it writes to Zoho's Lead Qualification.

alter table public.ff21_leads
  add column score smallint check (score between 0 and 10),
  add column qualification text check (qualification in ('Hot', 'Warm', 'Cold'));

-- Same function, now also saving the score. Replacing it keeps its grants.
create or replace function public.ff21_save_lead(p jsonb)
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
    zoho_status, zoho_detail, submitted_at, score, qualification
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
    case when p->>'status' = 'submitted' then now() end,
    case when p->>'score' ~ '^\d{1,2}$' then (p->>'score')::smallint end,
    case when p->>'qualification' in ('Hot', 'Warm', 'Cold') then p->>'qualification' end
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
    submitted_at  = coalesce(l.submitted_at, excluded.submitted_at),
    -- Settles once the form is sent, like Zoho's Lead Qualification.
    score         = case when l.status = 'submitted' then l.score else coalesce(excluded.score, l.score) end,
    qualification = case when l.status = 'submitted' then l.qualification else coalesce(excluded.qualification, l.qualification) end;
end;
$$;
