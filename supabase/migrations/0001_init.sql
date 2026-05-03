-- Run this in Supabase Studio → SQL Editor.
-- No-login app: RLS is enabled but grants read+write to anon role.
-- If you later add auth, tighten these policies.

-- =========================================================
-- SCHEMA
-- =========================================================

create table if not exists public.recipes (
  id             text primary key,
  label          text not null,
  color          text not null,
  thumb          text,
  emoji          text,
  external_url   text,
  base_servings  integer not null default 2,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now()
);

create table if not exists public.recipe_sections (
  id           bigserial primary key,
  recipe_id    text not null references public.recipes(id) on delete cascade,
  label        text,
  sort_order   integer not null default 0
);

create table if not exists public.recipe_ingredients (
  id           bigserial primary key,
  section_id   bigint not null references public.recipe_sections(id) on delete cascade,
  name         text not null,
  qty          numeric,
  unit         text,
  raw          text,
  sort_order   integer not null default 0
);

create table if not exists public.recipe_steps (
  id           bigserial primary key,
  recipe_id    text not null references public.recipes(id) on delete cascade,
  text         text not null,
  sort_order   integer not null default 0
);

create table if not exists public.cook_entries (
  id          bigserial primary key,
  recipe_id   text not null references public.recipes(id) on delete cascade,
  cooked_at   timestamptz not null default now(),
  rating      integer not null check (rating between 0 and 5),
  note        text
);

create table if not exists public.ingredient_overrides (
  recipe_id       text not null references public.recipes(id) on delete cascade,
  ingredient_key  text not null,
  qty             numeric,
  unit            text,
  raw             text,
  updated_at      timestamptz not null default now(),
  primary key (recipe_id, ingredient_key)
);

create table if not exists public.ingredient_removed (
  recipe_id       text not null references public.recipes(id) on delete cascade,
  ingredient_key  text not null,
  created_at      timestamptz not null default now(),
  primary key (recipe_id, ingredient_key)
);

create table if not exists public.steps_overrides (
  recipe_id   text primary key references public.recipes(id) on delete cascade,
  steps       jsonb not null,
  updated_at  timestamptz not null default now()
);

create table if not exists public.serving_multipliers (
  recipe_id   text primary key references public.recipes(id) on delete cascade,
  multiplier  numeric not null default 1,
  updated_at  timestamptz not null default now()
);

-- Single-row table for shopping state (id = 1).
create table if not exists public.shopping_state (
  id                  integer primary key default 1,
  active_recipe_ids   text[] not null default '{}',
  checked_item_keys   text[] not null default '{}',
  updated_at          timestamptz not null default now(),
  constraint shopping_single_row check (id = 1)
);

insert into public.shopping_state (id) values (1) on conflict do nothing;

-- =========================================================
-- RLS
-- =========================================================

alter table public.recipes              enable row level security;
alter table public.recipe_sections      enable row level security;
alter table public.recipe_ingredients   enable row level security;
alter table public.recipe_steps         enable row level security;
alter table public.cook_entries         enable row level security;
alter table public.ingredient_overrides enable row level security;
alter table public.ingredient_removed   enable row level security;
alter table public.steps_overrides      enable row level security;
alter table public.serving_multipliers  enable row level security;
alter table public.shopping_state       enable row level security;

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'recipes','recipe_sections','recipe_ingredients','recipe_steps',
    'cook_entries','ingredient_overrides','ingredient_removed',
    'steps_overrides','serving_multipliers','shopping_state'
  ]) loop
    execute format(
      'drop policy if exists "anon all %1$s" on public.%1$s; '
      'create policy "anon all %1$s" on public.%1$s for all to anon using (true) with check (true);',
      t
    );
  end loop;
end $$;

-- =========================================================
-- SEED
-- =========================================================

insert into public.recipes (id, label, color, thumb, emoji, external_url, base_servings, sort_order)
values
  ('tartare',   'Steak Tartare',                    'mustard',    null,
   '🥩', null, 2, 10),
  ('pasta',     'Creamy Sun-Dried Tomato Pasta',    'terracotta',
   'https://www.dontgobaconmyheart.co.uk/wp-content/uploads/2025/06/creamy-tuscan-chicken-pasta.jpg',
   null,
   'https://www.dontgobaconmyheart.co.uk/creamy-tuscan-chicken-pasta/#wprm-recipe-container-30122',
   2, 20),
  ('chorizo',   'Chicken Thighs & Chorizo Sauce',   'burgundy',
   'https://www.dontgobaconmyheart.co.uk/wp-content/uploads/2024/05/creamy-chicken-and-chorizo-recipe.jpg',
   null,
   'https://www.dontgobaconmyheart.co.uk/one-pan-creamy-chicken-chorizo/#wprm-recipe-container-25078',
   2, 30),
  ('potatoes',  'Garlic Butter Potatoes',           'sage',
   'https://www.dontgobaconmyheart.co.uk/wp-content/uploads/2025/03/mini-garlic-butter-potatoes.jpg',
   null,
   'https://www.dontgobaconmyheart.co.uk/garlic-butter-potatoes/#wprm-recipe-container-28377',
   4, 40),
  ('gnocchi',   'Baked Gnocchi in Tomato Sauce',    'slate',
   'https://www.dontgobaconmyheart.co.uk/wp-content/uploads/2017/12/date-night-baked-gnocchi-with-bacon-4-1200x1148.jpg',
   null,
   'https://www.dontgobaconmyheart.co.uk/date-night-baked-gnocchi-with-bacon/#wprm-recipe-container-3990',
   2, 50),
  ('tasticky',  'Povidlové Taštičky',               'plum',       null,
   '🥟', null, 4, 60)
on conflict (id) do nothing;

-- Sections + ingredients helper
with
s_tartare as (
  insert into public.recipe_sections (recipe_id, label, sort_order)
  values ('tartare', null, 0)
  on conflict do nothing returning id
),
s_pasta_m as (
  insert into public.recipe_sections (recipe_id, label, sort_order)
  values ('pasta', 'marinade', 0)
  on conflict do nothing returning id
),
s_pasta_main as (
  insert into public.recipe_sections (recipe_id, label, sort_order)
  values ('pasta', 'main', 1)
  on conflict do nothing returning id
),
s_chorizo_m as (
  insert into public.recipe_sections (recipe_id, label, sort_order)
  values ('chorizo', 'marinade', 0)
  on conflict do nothing returning id
),
s_chorizo_main as (
  insert into public.recipe_sections (recipe_id, label, sort_order)
  values ('chorizo', 'main', 1)
  on conflict do nothing returning id
),
s_potatoes as (
  insert into public.recipe_sections (recipe_id, label, sort_order)
  values ('potatoes', null, 0)
  on conflict do nothing returning id
),
s_gnocchi as (
  insert into public.recipe_sections (recipe_id, label, sort_order)
  values ('gnocchi', null, 0)
  on conflict do nothing returning id
),
s_tasticky as (
  insert into public.recipe_sections (recipe_id, label, sort_order)
  values ('tasticky', null, 0)
  on conflict do nothing returning id
)
insert into public.recipe_ingredients (section_id, name, qty, unit, raw, sort_order)
select id, n, q, u, r, ord from (
  -- tartare
  select (select id from s_tartare) as id, 'Beef (for tartare)' as n,   null::numeric as q, null::text as u, 'to taste' as r, 0 as ord
  union all select (select id from s_tartare), 'Egg yolks',               2,     'pcs', null,            1
  union all select (select id from s_tartare), 'Dijon mustard',           null,  null,  'to taste',      2
  union all select (select id from s_tartare), 'Worcestershire sauce',    null,  null,  'to taste',      3
  union all select (select id from s_tartare), 'Onion',                   1,     'pcs', null,            4
  union all select (select id from s_tartare), 'Garlic',                  null,  null,  'to taste',      5
  union all select (select id from s_tartare), 'Cornichons',              null,  null,  'handful',       6
  union all select (select id from s_tartare), 'Fresh parsley',           null,  null,  'small bunch',   7
  -- pasta marinade
  union all select (select id from s_pasta_m),  'Chicken breast',         250,   'g',    null,           0
  union all select (select id from s_pasta_m),  'Smoked paprika',         0.5,   'tsp',  null,           1
  union all select (select id from s_pasta_m),  'Dried oregano',          0.5,   'tsp',  null,           2
  union all select (select id from s_pasta_m),  'Onion powder',           0.25,  'tsp',  null,           3
  union all select (select id from s_pasta_m),  'Sun-dried tomato oil',   1,     'tbsp', null,           4
  -- pasta main
  union all select (select id from s_pasta_main), 'Linguine',             200,   'g',    null,           0
  union all select (select id from s_pasta_main), 'Butter',               15,    'g',    null,           1
  union all select (select id from s_pasta_main), 'Garlic cloves',        3,     'pcs',  null,           2
  union all select (select id from s_pasta_main), 'Tomato purée',         1,     'tbsp', null,           3
  union all select (select id from s_pasta_main), 'Chicken stock',        80,    'ml',   null,           4
  union all select (select id from s_pasta_main), 'Double cream',         160,   'ml',   null,           5
  union all select (select id from s_pasta_main), 'Sun-dried tomatoes',   90,    'g',    null,           6
  union all select (select id from s_pasta_main), 'Parmesan',             30,    'g',    null,           7
  union all select (select id from s_pasta_main), 'Fresh basil',          null,  null,   '½ bunch',      8
  union all select (select id from s_pasta_main), 'Baby spinach',         60,    'g',    null,           9
  -- chorizo marinade
  union all select (select id from s_chorizo_m), 'Chicken thighs',        600,   'g',    null,           0
  union all select (select id from s_chorizo_m), 'Smoked paprika',        1.5,   'tsp',  null,           1
  union all select (select id from s_chorizo_m), 'Dried oregano',         1,     'tsp',  null,           2
  union all select (select id from s_chorizo_m), 'Garlic powder',         0.5,   'tsp',  null,           3
  union all select (select id from s_chorizo_m), 'Onion powder',          0.25,  'tsp',  null,           4
  union all select (select id from s_chorizo_m), 'Cayenne pepper',        0.25,  'tsp',  null,           5
  union all select (select id from s_chorizo_m), 'Olive oil',             1,     'tbsp', null,           6
  -- chorizo main
  union all select (select id from s_chorizo_main), 'White onion',        1,     'pcs',  null,           0
  union all select (select id from s_chorizo_main), 'Spanish chorizo',    100,   'g',    null,           1
  union all select (select id from s_chorizo_main), 'Garlic cloves',      2,     'pcs',  null,           2
  union all select (select id from s_chorizo_main), 'Dry white wine',     60,    'ml',   null,           3
  union all select (select id from s_chorizo_main), 'Chicken stock',      180,   'ml',   null,           4
  union all select (select id from s_chorizo_main), 'Double cream',       180,   'ml',   null,           5
  union all select (select id from s_chorizo_main), 'Parmesan',           20,    'g',    null,           6
  union all select (select id from s_chorizo_main), 'Fresh basil',        15,    'g',    null,           7
  union all select (select id from s_chorizo_main), 'Baby plum tomatoes', 175,   'g',    null,           8
  -- potatoes
  union all select (select id from s_potatoes), 'Garlic bulbs',           2,     'pcs',  null,           0
  union all select (select id from s_potatoes), 'Small potatoes',         1000,  'g',    null,           1
  union all select (select id from s_potatoes), 'Olive oil',              3,     'tbsp', null,           2
  union all select (select id from s_potatoes), 'Salt',                   0.5,   'tsp',  null,           3
  union all select (select id from s_potatoes), 'Black pepper',           0.25,  'tsp',  null,           4
  union all select (select id from s_potatoes), 'Butter',                 90,    'g',    null,           5
  union all select (select id from s_potatoes), 'Fresh parsley',          2,     'tbsp', null,           6
  -- gnocchi
  union all select (select id from s_gnocchi), 'Fresh gnocchi',           500,   'g',    null,           0
  union all select (select id from s_gnocchi), 'Tomato passata',          500,   'ml',   null,           1
  union all select (select id from s_gnocchi), 'Double cream',            60,    'ml',   null,           2
  union all select (select id from s_gnocchi), 'Mozzarella',              75,    'g',    null,           3
  union all select (select id from s_gnocchi), 'Cheddar cheese',          75,    'g',    null,           4
  union all select (select id from s_gnocchi), 'Smoked streaky bacon',    null,  null,   '4–5 rashers',  5
  union all select (select id from s_gnocchi), 'White onion',             1,     'pcs',  null,           6
  union all select (select id from s_gnocchi), 'Garlic cloves',           2,     'pcs',  null,           7
  union all select (select id from s_gnocchi), 'Fresh parsley',           1,     'tbsp', null,           8
  union all select (select id from s_gnocchi), 'Fresh basil',             1,     'tbsp', null,           9
  union all select (select id from s_gnocchi), 'Smoked paprika',          0.5,   'tsp',  null,          10
  union all select (select id from s_gnocchi), 'Sugar',                   0.5,   'tsp',  null,          11
  union all select (select id from s_gnocchi), 'Salt & black pepper',     null,  null,   'to taste',    12
  -- tasticky
  union all select (select id from s_tasticky), 'Bramborové těsto v prášku', null, null, '1 bal.',        0
  union all select (select id from s_tasticky), 'Povidla',                 null,  null,  'podle chuti',  1
  union all select (select id from s_tasticky), 'Šlehačka (musí se udělat)', null, null, 'domácí',       2
  union all select (select id from s_tasticky), 'Mák',                     null,  null,  'na posypání',  3
  union all select (select id from s_tasticky), 'Moučkový cukr',           null,  null,  'na posypání',  4
) t
where id is not null;
