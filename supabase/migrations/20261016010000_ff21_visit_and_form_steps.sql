-- Visit requests from Find my home, and where visitors leave the form.

alter table public.ff21_leads
  add column visit_day date,
  add column visit_window text check (visit_window in ('Morning', 'Afternoon', 'Evening')),
  add column visit_type text check (visit_type in ('Physical', 'Virtual'));

-- One row each time someone opens Find my home (no personal details), so the
-- chart can show how many leave before giving their contact details. The id
-- is the same one their lead gets if they carry on.
create table public.ff21_form_opens (
  id uuid primary key,
  opened_at timestamptz not null default now()
);
alter table public.ff21_form_opens enable row level security;
revoke all on public.ff21_form_opens from anon, authenticated;

create function public.ff21_form_opened(p_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.ff21_form_opens (id) values (p_id) on conflict (id) do nothing;
$$;
revoke all on function public.ff21_form_opened(uuid) from public, anon, authenticated;
grant execute on function public.ff21_form_opened(uuid) to anon;

-- Save function: now with the visit request, and last_step only moves forward.
create or replace function public.ff21_save_lead(p jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := (p->>'id')::uuid;
  v_steps text[] := array['you', 'where', 'movein', 'stay', 'budget', 'room', 'who', 'home', 'visit', 'heard', 'submitted'];
begin
  if v_id is null then
    raise exception 'id is required';
  end if;

  insert into public.ff21_leads as l (
    id, status, last_step, first_name, last_name, phone, email, source, referral_code,
    places, move_in, stay, budget, room, gender, property, attribution, page,
    zoho_status, zoho_detail, submitted_at, score, qualification,
    visit_day, visit_window, visit_type
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
    case when p->>'qualification' in ('Hot', 'Warm', 'Cold') then p->>'qualification' end,
    case when p->>'visit_day' ~ '^\d{4}-\d{2}-\d{2}$' then (p->>'visit_day')::date end,
    case when p->>'visit_window' in ('Morning', 'Afternoon', 'Evening') then p->>'visit_window' end,
    case when p->>'visit_type' in ('Physical', 'Virtual') then p->>'visit_type' end
  )
  on conflict (id) do update set
    updated_at    = now(),
    status        = case when l.status = 'submitted' then 'submitted' else excluded.status end,
    -- The furthest step reached, even if they went back to change an answer.
    last_step     = case
                      when coalesce(array_position(v_steps, excluded.last_step), 0) > coalesce(array_position(v_steps, l.last_step), 0)
                      then excluded.last_step else l.last_step
                    end,
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
    qualification = case when l.status = 'submitted' then l.qualification else coalesce(excluded.qualification, l.qualification) end,
    visit_day     = coalesce(excluded.visit_day, l.visit_day),
    visit_window  = coalesce(excluded.visit_window, l.visit_window),
    visit_type    = coalesce(excluded.visit_type, l.visit_type);
end;
$$;

-- How many people got past each step of Find my home, in the last 30 days and
-- all time. "Opened" only counts from 16 Oct 2026, when counting began.
create view public.ff21_form_steps with (security_invoker = true) as
with steps (step_no, step, question) as (
  values
    (0, 'opened', 'Opened Find my home'),
    (1, 'you', 'Gave contact details'),
    (2, 'where', 'Where they work or study'),
    (3, 'movein', 'Move-in date'),
    (4, 'stay', 'How long they''ll stay'),
    (5, 'budget', 'Budget'),
    (6, 'room', 'Room type'),
    (7, 'who', 'Who''s moving in'),
    (8, 'home', 'Picked a home'),
    (9, 'visit', 'Visit day and time'),
    (10, 'heard', 'How they heard of us'),
    (11, 'submitted', 'Sent the form')
),
sessions as (
  select
    coalesce(o.opened_at, l.created_at) as started_at,
    case when l.id is null then 0
         else coalesce(array_position(array['you', 'where', 'movein', 'stay', 'budget', 'room', 'who', 'home', 'visit', 'heard', 'submitted'], l.last_step), 1)
    end as furthest
  from public.ff21_form_opens o
  full join public.ff21_leads l on l.id = o.id
  where l.first_name is distinct from 'TEST'
),
counts as (
  select
    s.step_no,
    s.question,
    count(*) filter (where x.furthest >= s.step_no and x.started_at >= now() - interval '30 days') as last_30_days,
    count(*) filter (where x.furthest >= s.step_no) as all_time
  from steps s
  cross join sessions x
  group by s.step_no, s.question
)
select
  step_no,
  question,
  last_30_days,
  round(100.0 * last_30_days / nullif(max(last_30_days) over (), 0)) as pct_30_days,
  all_time,
  round(100.0 * all_time / nullif(max(all_time) over (), 0)) as pct_all_time
from counts
order by step_no;

revoke all on public.ff21_form_steps from anon, authenticated;
