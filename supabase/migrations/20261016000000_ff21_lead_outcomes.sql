-- What happened after the form, filled in daily by /api/cron/lead-outcomes
-- from Zoho (read only): the lead's status, and a matching deal if they booked.

alter table public.ff21_leads
  add column stage text check (stage in ('new', 'contacted', 'visit_scheduled', 'visited', 'application', 'booked', 'checked_in', 'checked_out', 'cancelled', 'lost')),
  add column zoho_lead_status text,
  add column visit_done boolean,
  add column lost_reason text,
  add column deal_id text,
  add column deal_stage text,
  add column deal_room text,
  add column booked_on date,
  add column checked_in_on date,
  add column checked_out_on date,
  add column matched_by text check (matched_by in ('phone', 'email')),
  add column outcome_checked_at timestamptz;

create index ff21_leads_outcome_checked_idx on public.ff21_leads (outcome_checked_at nulls first);

-- The funnel: website leads by first-guess score and source, and how far
-- each got. "Reached" counts include everyone who went further.
create view public.ff21_funnel with (security_invoker = true) as
with ranked as (
  select
    l.*,
    case l.stage
      when 'contacted' then 1 when 'visit_scheduled' then 2 when 'visited' then 3
      when 'application' then 4 when 'booked' then 5 when 'cancelled' then 5
      when 'checked_in' then 6 when 'checked_out' then 6 else 0
    end as reach
  from public.ff21_leads l
  where l.first_name is distinct from 'TEST'
)
select
  date_trunc('month', created_at at time zone 'Asia/Kolkata')::date as month,
  coalesce(qualification, 'Unscored') as qualification,
  coalesce(source, 'Not given') as source,
  count(*) as leads,
  count(*) filter (where reach >= 1) as contacted,
  count(*) filter (where reach >= 3) as visited,
  count(*) filter (where reach >= 5) as booked,
  count(*) filter (where reach >= 6) as checked_in,
  count(*) filter (where stage = 'cancelled') as cancelled,
  count(*) filter (where stage = 'lost') as lost
from ranked
group by 1, 2, 3;

revoke all on public.ff21_funnel from anon, authenticated;
