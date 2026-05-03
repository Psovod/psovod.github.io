-- Enable Supabase Realtime for recipe tables.
-- Run in Supabase Studio → SQL Editor after 0001_init.sql.

alter publication supabase_realtime add table public.recipes;
alter publication supabase_realtime add table public.recipe_sections;
alter publication supabase_realtime add table public.recipe_ingredients;
alter publication supabase_realtime add table public.recipe_steps;
alter publication supabase_realtime add table public.cook_entries;
alter publication supabase_realtime add table public.ingredient_overrides;
alter publication supabase_realtime add table public.ingredient_removed;
alter publication supabase_realtime add table public.steps_overrides;
alter publication supabase_realtime add table public.serving_multipliers;
alter publication supabase_realtime add table public.shopping_state;
