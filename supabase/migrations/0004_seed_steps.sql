-- Seed steps, step↔ingredient links and step timers for the 6 recipes.
-- Idempotent: skips if the recipe already has any step rows.
-- Run after 0003_steps_timers.sql.

-- Helper: insert a step for a recipe and return its id.
create or replace function public._seed_step(
  p_recipe_id text,
  p_phase     text,
  p_order     integer,
  p_text      text,
  p_ingredients text[] default array[]::text[],
  p_timer_labels text[] default array[]::text[],
  p_timer_minutes integer[] default array[]::integer[]
)
returns bigint
language plpgsql
as $$
declare
  v_step_id bigint;
  v_ing_name text;
  v_ing_id bigint;
  v_idx int;
begin
  insert into public.recipe_steps (recipe_id, phase, text, sort_order)
  values (p_recipe_id, p_phase, p_text, p_order)
  returning id into v_step_id;

  v_idx := 1;
  foreach v_ing_name in array p_ingredients loop
    select i.id into v_ing_id
    from public.recipe_ingredients i
    join public.recipe_sections s on s.id = i.section_id
    where s.recipe_id = p_recipe_id and lower(i.name) = lower(v_ing_name)
    limit 1;
    if v_ing_id is not null then
      insert into public.step_ingredients (step_id, ingredient_id, sort_order)
      values (v_step_id, v_ing_id, v_idx)
      on conflict do nothing;
    end if;
    v_idx := v_idx + 1;
  end loop;

  for v_idx in 1 .. coalesce(array_length(p_timer_labels, 1), 0) loop
    insert into public.step_timers (step_id, label, minutes, sort_order)
    values (v_step_id, p_timer_labels[v_idx], p_timer_minutes[v_idx], v_idx);
  end loop;

  return v_step_id;
end;
$$;

-- =========================================================
-- PASTA
-- =========================================================
do $$
begin
  if not exists (select 1 from public.recipe_steps where recipe_id = 'pasta') then
    perform public._seed_step('pasta', 'prep', 0,
      'Slice chicken breasts in half horizontally, pat dry, season with smoked paprika, oregano, onion powder, salt and pepper, then coat with the sun-dried tomato oil.',
      array['Chicken breast','Smoked paprika','Dried oregano','Onion powder','Sun-dried tomato oil']);
    perform public._seed_step('pasta', 'prep', 1,
      'Roughly chop sun-dried tomatoes, finely slice the basil, mince the garlic cloves.',
      array['Sun-dried tomatoes','Fresh basil','Garlic cloves']);
    perform public._seed_step('pasta', 'cook', 0,
      'Sear the chicken in a hot pan 3–4 minutes per side until golden. Rest, then slice.',
      array['Chicken breast'],
      array['Sear side A','Sear side B','Rest'],
      array[4, 3, 3]);
    perform public._seed_step('pasta', 'cook', 1,
      'Boil the linguine in well-salted water until al dente.',
      array['Linguine'],
      array['Boil'],
      array[9]);
    perform public._seed_step('pasta', 'cook', 2,
      'Melt butter in the chicken pan, add garlic and fry 30 s, stir in tomato purée and sun-dried tomatoes, cook 1 minute.',
      array['Butter','Garlic cloves','Tomato purée','Sun-dried tomatoes'],
      array['Sauté aromatics'],
      array[1]);
    perform public._seed_step('pasta', 'cook', 3,
      'Pour in chicken stock, bubble 30 s, then add double cream and simmer until slightly thickened.',
      array['Chicken stock','Double cream'],
      array['Simmer sauce'],
      array[3]);
    perform public._seed_step('pasta', 'cook', 4,
      'Stir in parmesan off the heat until smooth, then add baby spinach and basil, toss pasta and sliced chicken through the sauce. Serve immediately.',
      array['Parmesan','Baby spinach','Fresh basil','Linguine']);
  end if;
end $$;

-- =========================================================
-- CHORIZO
-- =========================================================
do $$
begin
  if not exists (select 1 from public.recipe_steps where recipe_id = 'chorizo') then
    perform public._seed_step('chorizo', 'prep', 0,
      'Bash the thighs to even thickness between paper, then coat with paprika, oregano, garlic powder, onion powder, cayenne, salt, pepper and olive oil.',
      array['Chicken thighs','Smoked paprika','Dried oregano','Garlic powder','Onion powder','Cayenne pepper','Olive oil']);
    perform public._seed_step('chorizo', 'prep', 1,
      'Finely dice the white onion, slice the chorizo, mince the garlic, halve the baby plum tomatoes, tear the basil.',
      array['White onion','Spanish chorizo','Garlic cloves','Baby plum tomatoes','Fresh basil']);
    perform public._seed_step('chorizo', 'cook', 0,
      'Sear the thighs skin-side down in a hot pan until deep golden, 4–5 minutes, flip and cook 2–3 minutes. Remove.',
      array['Chicken thighs'],
      array['Skin side','Flip'],
      array[5, 3]);
    perform public._seed_step('chorizo', 'cook', 1,
      'Drop chorizo into the pan and fry to release its oil, then add onion and soften.',
      array['Spanish chorizo','White onion'],
      array['Chorizo','Soften onion'],
      array[2, 5]);
    perform public._seed_step('chorizo', 'cook', 2,
      'Stir in garlic and tomatoes, pour wine in and reduce by half.',
      array['Garlic cloves','Baby plum tomatoes','Dry white wine'],
      array['Reduce wine'],
      array[2]);
    perform public._seed_step('chorizo', 'cook', 3,
      'Pour in chicken stock and double cream, return the thighs with their juices, cover and simmer gently.',
      array['Chicken stock','Double cream','Chicken thighs'],
      array['Simmer'],
      array[15]);
    perform public._seed_step('chorizo', 'cook', 4,
      'Stir through parmesan and basil, rest 2 minutes and serve.',
      array['Parmesan','Fresh basil'],
      array['Rest'],
      array[2]);
  end if;
end $$;

-- =========================================================
-- POTATOES
-- =========================================================
do $$
begin
  if not exists (select 1 from public.recipe_steps where recipe_id = 'potatoes') then
    perform public._seed_step('potatoes', 'prep', 0,
      'Halve the garlic bulbs horizontally to expose the cloves.',
      array['Garlic bulbs']);
    perform public._seed_step('potatoes', 'prep', 1,
      'Wash the potatoes and halve any that are larger than a walnut. Chop the parsley.',
      array['Small potatoes','Fresh parsley']);
    perform public._seed_step('potatoes', 'cook', 0,
      'Boil the potatoes in well-salted water until just tender.',
      array['Small potatoes','Salt'],
      array['Boil'],
      array[15]);
    perform public._seed_step('potatoes', 'cook', 1,
      'Preheat the oven to 200 °C (180 °C fan).',
      array[]::text[]);
    perform public._seed_step('potatoes', 'cook', 2,
      'Tip the drained potatoes onto a tray, smash lightly with a masher, drizzle olive oil, salt and pepper, and roast with the halved garlic bulbs cut-side down.',
      array['Small potatoes','Olive oil','Salt','Black pepper','Garlic bulbs'],
      array['Roast'],
      array[28]);
    perform public._seed_step('potatoes', 'cook', 3,
      'Squeeze the soft roasted garlic into melted butter in a pan, toss the potatoes through, scatter parsley and serve.',
      array['Garlic bulbs','Butter','Fresh parsley'],
      array['Butter melt'],
      array[2]);
  end if;
end $$;

-- =========================================================
-- GNOCCHI
-- =========================================================
do $$
begin
  if not exists (select 1 from public.recipe_steps where recipe_id = 'gnocchi') then
    perform public._seed_step('gnocchi', 'prep', 0,
      'Dice the onion, mince the garlic, tear the basil, chop the parsley.',
      array['White onion','Garlic cloves','Fresh basil','Fresh parsley']);
    perform public._seed_step('gnocchi', 'prep', 1,
      'Tear mozzarella into bite-size pieces and grate the cheddar.',
      array['Mozzarella','Cheddar cheese']);
    perform public._seed_step('gnocchi', 'prep', 2,
      'Cut the streaky bacon into small lardons.',
      array['Smoked streaky bacon']);
    perform public._seed_step('gnocchi', 'cook', 0,
      'Fry the bacon in a large oven-proof pan until crisp.',
      array['Smoked streaky bacon'],
      array['Crisp bacon'],
      array[5]);
    perform public._seed_step('gnocchi', 'cook', 1,
      'Add onion, soften, then stir in garlic for 30 seconds.',
      array['White onion','Garlic cloves'],
      array['Soften onion'],
      array[4]);
    perform public._seed_step('gnocchi', 'cook', 2,
      'Pour in tomato passata, sugar, smoked paprika and double cream; season and simmer.',
      array['Tomato passata','Sugar','Smoked paprika','Double cream','Salt & black pepper'],
      array['Simmer sauce'],
      array[5]);
    perform public._seed_step('gnocchi', 'cook', 3,
      'Stir in gnocchi and basil so every piece is coated in sauce.',
      array['Fresh gnocchi','Fresh basil']);
    perform public._seed_step('gnocchi', 'cook', 4,
      'Top with mozzarella and cheddar, bake at 200 °C until bubbling and golden.',
      array['Mozzarella','Cheddar cheese'],
      array['Bake'],
      array[15]);
    perform public._seed_step('gnocchi', 'cook', 5,
      'Scatter parsley and rest briefly before serving.',
      array['Fresh parsley'],
      array['Rest'],
      array[2]);
  end if;
end $$;

-- =========================================================
-- TARTARE (placeholder)
-- =========================================================
do $$
begin
  if not exists (select 1 from public.recipe_steps where recipe_id = 'tartare') then
    perform public._seed_step('tartare', 'prep', 0,
      'Trim and very finely chop the beef with a sharp knife. Keep cold.',
      array['Beef (for tartare)']);
    perform public._seed_step('tartare', 'prep', 1,
      'Finely dice the onion, mince the garlic, and finely chop cornichons and parsley.',
      array['Onion','Garlic','Cornichons','Fresh parsley']);
    perform public._seed_step('tartare', 'cook', 0,
      'Mix the beef with Dijon, Worcestershire, salt and pepper to taste.',
      array['Beef (for tartare)','Dijon mustard','Worcestershire sauce']);
    perform public._seed_step('tartare', 'cook', 1,
      'Fold in the chopped aromatics, shape into two rounds on cold plates, press a well in the centre and drop an egg yolk into each.',
      array['Onion','Garlic','Cornichons','Fresh parsley','Egg yolks']);
  end if;
end $$;

-- =========================================================
-- TASTICKY (placeholder)
-- =========================================================
do $$
begin
  if not exists (select 1 from public.recipe_steps where recipe_id = 'tasticky') then
    perform public._seed_step('tasticky', 'prep', 0,
      'Připravte bramborové těsto podle návodu na obalu.',
      array['Bramborové těsto v prášku']);
    perform public._seed_step('tasticky', 'prep', 1,
      'Povidla mírně zahřejte, aby byla vláčná a lépe se s nimi pracovalo.',
      array['Povidla']);
    perform public._seed_step('tasticky', 'cook', 0,
      'Vyválejte těsto na pomoučeném vále, nakrájejte na čtverce, do středu dejte lžíci povidel a taštičky pevně uzavřete.',
      array['Bramborové těsto v prášku','Povidla']);
    perform public._seed_step('tasticky', 'cook', 1,
      'Vařte taštičky v osolené vodě, dokud nevyplavou na hladinu.',
      array['Bramborové těsto v prášku'],
      array['Vaření'],
      array[5]);
    perform public._seed_step('tasticky', 'cook', 2,
      'Taštičky posypte mákem a moučkovým cukrem, podávejte se šlehačkou.',
      array['Mák','Moučkový cukr','Šlehačka (musí se udělat)']);
  end if;
end $$;
