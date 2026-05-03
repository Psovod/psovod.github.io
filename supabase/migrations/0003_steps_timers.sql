-- Adds step phases, ingredient ↔ step links, per-step timers, and the
-- recipe-images storage bucket (+ anon policies).
-- Run after 0001_init.sql and 0002_realtime.sql.

alter table public.recipe_steps
  add column if not exists phase text not null default 'cook'
    check (phase in ('prep', 'cook'));

create table if not exists public.step_ingredients (
  step_id        bigint not null references public.recipe_steps(id) on delete cascade,
  ingredient_id  bigint not null references public.recipe_ingredients(id) on delete cascade,
  sort_order     integer not null default 0,
  primary key (step_id, ingredient_id)
);

create table if not exists public.step_timers (
  id          bigserial primary key,
  step_id     bigint not null references public.recipe_steps(id) on delete cascade,
  label       text not null,
  minutes     integer not null check (minutes > 0),
  sort_order  integer not null default 0
);

alter table public.step_ingredients enable row level security;
alter table public.step_timers      enable row level security;

drop policy if exists "anon all step_ingredients" on public.step_ingredients;
drop policy if exists "anon all step_timers"      on public.step_timers;

create policy "anon all step_ingredients" on public.step_ingredients
  for all to anon using (true) with check (true);

create policy "anon all step_timers" on public.step_timers
  for all to anon using (true) with check (true);

-- Realtime
do $$
begin
  begin
    execute 'alter publication supabase_realtime add table public.step_ingredients';
  exception when duplicate_object then null;
  end;
  begin
    execute 'alter publication supabase_realtime add table public.step_timers';
  exception when duplicate_object then null;
  end;
end $$;

-- Storage bucket for recipe images
insert into storage.buckets (id, name, public)
  values ('recipe-images', 'recipe-images', true)
  on conflict (id) do nothing;

drop policy if exists "anon read recipe-images"   on storage.objects;
drop policy if exists "anon insert recipe-images" on storage.objects;
drop policy if exists "anon update recipe-images" on storage.objects;
drop policy if exists "anon delete recipe-images" on storage.objects;

create policy "anon read recipe-images"   on storage.objects for select to anon
  using (bucket_id = 'recipe-images');
create policy "anon insert recipe-images" on storage.objects for insert to anon
  with check (bucket_id = 'recipe-images');
create policy "anon update recipe-images" on storage.objects for update to anon
  using (bucket_id = 'recipe-images');
create policy "anon delete recipe-images" on storage.objects for delete to anon
  using (bucket_id = 'recipe-images');
