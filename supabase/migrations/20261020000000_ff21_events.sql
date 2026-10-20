-- The website's own visit and click log, for the FF21 dashboard's Website tab.
-- First-party and anonymous: a random id the browser keeps (no cookie), the
-- page, what was tapped, where the visit came from, the device and the city
-- Vercel reads from the connection. Never a name, phone, email or IP.
--
-- Rows arrive only through ff21_track(), which the site's /api/t route calls
-- with the publishable key (server-side). The table has RLS on and no
-- policies, so nobody reads it through the API; the dashboard reads counts
-- through its own locked function (dash_web).

create table public.ff21_events (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  visitor text not null,
  session text not null,
  kind text not null check (kind in ('view', 'click', 'event')),
  path text not null,
  name text,      -- what was tapped, or the event's name
  target text,    -- where a tap goes (a page, "WhatsApp", "Call", a site)
  section text,   -- the part of the page it was in
  channel text,   -- views only: where the visit came from
  ref text,       -- views only: the site that linked here
  source text,    -- views only: utm_source / utm_medium / utm_campaign
  medium text,
  campaign text,
  device text,
  city text,
  region text,
  country text
);

create index ff21_events_at on public.ff21_events (at);
create index ff21_events_session on public.ff21_events (session, at);

alter table public.ff21_events enable row level security;

create function public.ff21_track(p jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_visitor text := p ->> 'visitor';
  v_session text := p ->> 'session';
  e jsonb;
  n int := 0;
begin
  if v_visitor is null or v_visitor !~ '^[A-Za-z0-9-]{8,40}$' or v_session is null or v_session !~ '^[A-Za-z0-9-]{8,40}$' then
    return;
  end if;
  for e in select * from jsonb_array_elements(coalesce(p -> 'events', '[]'::jsonb)) loop
    n := n + 1;
    exit when n > 40;
    if e ->> 'kind' not in ('view', 'click', 'event') or coalesce(e ->> 'path', '') !~ '^/' then
      continue;
    end if;
    insert into public.ff21_events (at, visitor, session, kind, path, name, target, section, channel, ref, source, medium, campaign, device, city, region, country)
    values (
      -- the browser's own time for the event, kept within the last hour
      greatest(least(coalesce((e ->> 'at')::timestamptz, now()), now()), now() - interval '1 hour'),
      v_visitor, v_session, e ->> 'kind',
      left(e ->> 'path', 200), left(e ->> 'name', 80), left(e ->> 'target', 200), left(e ->> 'section', 60),
      left(e ->> 'channel', 40), left(e ->> 'ref', 100), left(e ->> 'source', 100), left(e ->> 'medium', 100), left(e ->> 'campaign', 150),
      left(p ->> 'device', 10), left(p ->> 'city', 60), left(p ->> 'region', 10), left(p ->> 'country', 2)
    );
  end loop;
exception when others then
  -- A bad batch is dropped; analytics must never break the site.
  return;
end;
$$;

revoke all on function public.ff21_track(jsonb) from public, anon, authenticated;
grant execute on function public.ff21_track(jsonb) to anon;
