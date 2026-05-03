-- Translates seed recipe content into Czech.
-- Safe to re-run; only updates rows where text still matches the English seed.

-- =========================================================
-- RECIPE LABELS
-- =========================================================
update public.recipes set label = 'Biftek tatarák'                   where id = 'tartare'  and label = 'Steak Tartare';
update public.recipes set label = 'Krémové těstoviny se sušenými rajčaty' where id = 'pasta' and label = 'Creamy Sun-Dried Tomato Pasta';
update public.recipes set label = 'Kuřecí stehna s chorizo omáčkou'  where id = 'chorizo'  and label = 'Chicken Thighs & Chorizo Sauce';
update public.recipes set label = 'Česnekové máslové brambory'       where id = 'potatoes' and label = 'Garlic Butter Potatoes';
update public.recipes set label = 'Zapečené gnocchi v rajčatové omáčce' where id = 'gnocchi' and label = 'Baked Gnocchi in Tomato Sauce';

-- =========================================================
-- SECTION LABELS
-- =========================================================
update public.recipe_sections set label = 'marináda' where label = 'marinade';
update public.recipe_sections set label = 'hlavní'   where label = 'main';

-- =========================================================
-- INGREDIENT NAMES
-- =========================================================

-- tartare
update public.recipe_ingredients i set name = 'Hovězí (na tatarák)' where name = 'Beef (for tartare)' and section_id in (select id from public.recipe_sections where recipe_id = 'tartare');
update public.recipe_ingredients i set name = 'Žloutky'             where name = 'Egg yolks'            and section_id in (select id from public.recipe_sections where recipe_id = 'tartare');
update public.recipe_ingredients i set name = 'Dijonská hořčice'    where name = 'Dijon mustard'        and section_id in (select id from public.recipe_sections where recipe_id = 'tartare');
update public.recipe_ingredients i set name = 'Worcesterská omáčka' where name = 'Worcestershire sauce' and section_id in (select id from public.recipe_sections where recipe_id = 'tartare');
update public.recipe_ingredients i set name = 'Cibule'              where name = 'Onion'                and section_id in (select id from public.recipe_sections where recipe_id = 'tartare');
update public.recipe_ingredients i set name = 'Česnek'              where name = 'Garlic'               and section_id in (select id from public.recipe_sections where recipe_id = 'tartare');
update public.recipe_ingredients i set name = 'Okurčičky'           where name = 'Cornichons'           and section_id in (select id from public.recipe_sections where recipe_id = 'tartare');
update public.recipe_ingredients i set name = 'Čerstvá petržel'     where name = 'Fresh parsley'        and section_id in (select id from public.recipe_sections where recipe_id = 'tartare');

-- pasta
update public.recipe_ingredients set name = 'Kuřecí prsa'            where name = 'Chicken breast';
update public.recipe_ingredients set name = 'Uzená paprika'          where name = 'Smoked paprika';
update public.recipe_ingredients set name = 'Sušené oregano'         where name = 'Dried oregano';
update public.recipe_ingredients set name = 'Cibulový prášek'        where name = 'Onion powder';
update public.recipe_ingredients set name = 'Olej ze sušených rajčat' where name = 'Sun-dried tomato oil';
update public.recipe_ingredients set name = 'Linguine'               where name = 'Linguine';
update public.recipe_ingredients set name = 'Máslo'                  where name = 'Butter';
update public.recipe_ingredients set name = 'Stroužky česneku'       where name = 'Garlic cloves';
update public.recipe_ingredients set name = 'Rajčatový protlak'      where name = 'Tomato purée';
update public.recipe_ingredients set name = 'Kuřecí vývar'           where name = 'Chicken stock';
update public.recipe_ingredients set name = 'Smetana ke šlehání'     where name = 'Double cream';
update public.recipe_ingredients set name = 'Sušená rajčata'         where name = 'Sun-dried tomatoes';
update public.recipe_ingredients set name = 'Parmazán'               where name = 'Parmesan';
update public.recipe_ingredients set name = 'Čerstvá bazalka'        where name = 'Fresh basil';
update public.recipe_ingredients set name = 'Baby špenát'            where name = 'Baby spinach';

-- chorizo
update public.recipe_ingredients set name = 'Kuřecí stehna'          where name = 'Chicken thighs';
update public.recipe_ingredients set name = 'Česnekový prášek'       where name = 'Garlic powder';
update public.recipe_ingredients set name = 'Kajenský pepř'          where name = 'Cayenne pepper';
update public.recipe_ingredients set name = 'Olivový olej'           where name = 'Olive oil';
update public.recipe_ingredients set name = 'Bílá cibule'            where name = 'White onion';
update public.recipe_ingredients set name = 'Španělské chorizo'      where name = 'Spanish chorizo';
update public.recipe_ingredients set name = 'Suché bílé víno'        where name = 'Dry white wine';
update public.recipe_ingredients set name = 'Rajčátka koktejlová'    where name = 'Baby plum tomatoes';

-- potatoes
update public.recipe_ingredients set name = 'Česnekové palice'       where name = 'Garlic bulbs';
update public.recipe_ingredients set name = 'Malé brambory'          where name = 'Small potatoes';
update public.recipe_ingredients set name = 'Sůl'                    where name = 'Salt';
update public.recipe_ingredients set name = 'Černý pepř'             where name = 'Black pepper';

-- gnocchi
update public.recipe_ingredients set name = 'Čerstvé gnocchi'        where name = 'Fresh gnocchi';
update public.recipe_ingredients set name = 'Rajčatové passata'      where name = 'Tomato passata';
update public.recipe_ingredients set name = 'Mozzarella'             where name = 'Mozzarella';
update public.recipe_ingredients set name = 'Čedar'                  where name = 'Cheddar cheese';
update public.recipe_ingredients set name = 'Uzená prorostlá slanina' where name = 'Smoked streaky bacon';
update public.recipe_ingredients set name = 'Cukr'                   where name = 'Sugar';
update public.recipe_ingredients set name = 'Sůl a černý pepř'       where name = 'Salt & black pepper';

-- raw fragments
update public.recipe_ingredients set raw = 'dle chuti'   where raw = 'to taste';
update public.recipe_ingredients set raw = 'hrst'        where raw = 'handful';
update public.recipe_ingredients set raw = 'malý svazek' where raw = 'small bunch';
update public.recipe_ingredients set raw = '½ svazku'    where raw = '½ bunch';
update public.recipe_ingredients set raw = '4–5 plátků'  where raw = '4–5 rashers';

-- =========================================================
-- STEP TEXT
-- =========================================================

-- pasta
update public.recipe_steps set text = 'Kuřecí prsa rozkrojte napůl, osušte, ochuťte uzenou paprikou, oreganem, cibulovým práškem, solí a pepřem a potřete olejem ze sušených rajčat.'
  where recipe_id = 'pasta' and phase = 'prep' and sort_order = 0;
update public.recipe_steps set text = 'Nahrubo nakrájejte sušená rajčata, nasekejte bazalku najemno a prolisujte stroužky česneku.'
  where recipe_id = 'pasta' and phase = 'prep' and sort_order = 1;
update public.recipe_steps set text = 'Kuřecí prsa prudce opečte na rozpálené pánvi 3–4 minuty z každé strany do zlatova. Nechte odpočinout a nakrájejte.'
  where recipe_id = 'pasta' and phase = 'cook' and sort_order = 0;
update public.recipe_steps set text = 'V osolené vodě uvařte linguine al dente.'
  where recipe_id = 'pasta' and phase = 'cook' and sort_order = 1;
update public.recipe_steps set text = 'Na pánvi po kuřeti rozpusťte máslo, přidejte česnek a 30 s orestujte, vmíchejte rajčatový protlak a sušená rajčata a vařte 1 minutu.'
  where recipe_id = 'pasta' and phase = 'cook' and sort_order = 2;
update public.recipe_steps set text = 'Přilijte kuřecí vývar, 30 s povařte, pak přidejte smetanu a nechte mírně zhoustnout.'
  where recipe_id = 'pasta' and phase = 'cook' and sort_order = 3;
update public.recipe_steps set text = 'Mimo sporák zamíchejte parmazán do hladka, přidejte baby špenát a bazalku, vmíchejte těstoviny a plátky kuřete. Ihned podávejte.'
  where recipe_id = 'pasta' and phase = 'cook' and sort_order = 4;

-- chorizo
update public.recipe_steps set text = 'Stehna mezi dvěma papíry naklepejte do stejné tloušťky a potřete paprikou, oreganem, česnekovým a cibulovým práškem, kajenou, solí, pepřem a olivovým olejem.'
  where recipe_id = 'chorizo' and phase = 'prep' and sort_order = 0;
update public.recipe_steps set text = 'Nakrájejte cibuli nadrobno, nakrájejte chorizo, prolisujte česnek, rajčata překrojte napůl a natrhejte bazalku.'
  where recipe_id = 'chorizo' and phase = 'prep' and sort_order = 1;
update public.recipe_steps set text = 'Stehna položte kůží dolů na rozpálenou pánev a opékejte 4–5 minut do zlatova, otočte a dopékejte 2–3 minuty. Vyjměte.'
  where recipe_id = 'chorizo' and phase = 'cook' and sort_order = 0;
update public.recipe_steps set text = 'Na pánev hoďte chorizo a nechte pustit olej, pak přidejte cibuli a zesklovatějte ji.'
  where recipe_id = 'chorizo' and phase = 'cook' and sort_order = 1;
update public.recipe_steps set text = 'Vmíchejte česnek a rajčata, podlijte vínem a nechte z poloviny odpařit.'
  where recipe_id = 'chorizo' and phase = 'cook' and sort_order = 2;
update public.recipe_steps set text = 'Přilijte kuřecí vývar a smetanu, vraťte stehna i s jejich šťávou, přiklopte a mírně duste.'
  where recipe_id = 'chorizo' and phase = 'cook' and sort_order = 3;
update public.recipe_steps set text = 'Vmíchejte parmazán a bazalku, nechte 2 minuty odpočinout a podávejte.'
  where recipe_id = 'chorizo' and phase = 'cook' and sort_order = 4;

-- potatoes
update public.recipe_steps set text = 'Česnekové palice podélně překrojte, aby byly viditelné stroužky.'
  where recipe_id = 'potatoes' and phase = 'prep' and sort_order = 0;
update public.recipe_steps set text = 'Brambory omyjte, větší než vlašský ořech překrojte napůl. Nasekejte petržel.'
  where recipe_id = 'potatoes' and phase = 'prep' and sort_order = 1;
update public.recipe_steps set text = 'Brambory uvařte v osolené vodě doměkka.'
  where recipe_id = 'potatoes' and phase = 'cook' and sort_order = 0;
update public.recipe_steps set text = 'Rozehřejte troubu na 200 °C (180 °C horký vzduch).'
  where recipe_id = 'potatoes' and phase = 'cook' and sort_order = 1;
update public.recipe_steps set text = 'Slité brambory rozložte na plech, lehce je rozmačkejte, pokapejte olivovým olejem, osolte a opepřete. Na plech přidejte překrojené česneky řezem dolů a pečte.'
  where recipe_id = 'potatoes' and phase = 'cook' and sort_order = 2;
update public.recipe_steps set text = 'Měkký pečený česnek vytlačte do rozpuštěného másla na pánvi, promíchejte s bramborami, posypte petrželí a podávejte.'
  where recipe_id = 'potatoes' and phase = 'cook' and sort_order = 3;

-- gnocchi
update public.recipe_steps set text = 'Nakrájejte cibuli nadrobno, prolisujte česnek, natrhejte bazalku a nasekejte petržel.'
  where recipe_id = 'gnocchi' and phase = 'prep' and sort_order = 0;
update public.recipe_steps set text = 'Mozzarellu natrhejte na kousky a čedar nastrouhejte.'
  where recipe_id = 'gnocchi' and phase = 'prep' and sort_order = 1;
update public.recipe_steps set text = 'Slaninu nakrájejte na drobné kostičky.'
  where recipe_id = 'gnocchi' and phase = 'prep' and sort_order = 2;
update public.recipe_steps set text = 'Na velké pánvi pro troubu opečte slaninu dokřupava.'
  where recipe_id = 'gnocchi' and phase = 'cook' and sort_order = 0;
update public.recipe_steps set text = 'Přidejte cibuli, zesklovatějte, pak vmíchejte česnek a krátce restujte.'
  where recipe_id = 'gnocchi' and phase = 'cook' and sort_order = 1;
update public.recipe_steps set text = 'Přilijte passata, přidejte cukr, uzenou papriku a smetanu, osolte, opepřete a nechte probublat.'
  where recipe_id = 'gnocchi' and phase = 'cook' and sort_order = 2;
update public.recipe_steps set text = 'Vmíchejte gnocchi a bazalku, aby byly pokryté omáčkou.'
  where recipe_id = 'gnocchi' and phase = 'cook' and sort_order = 3;
update public.recipe_steps set text = 'Posypte mozzarellou a čedarem a zapečte při 200 °C do zlatova a bublání.'
  where recipe_id = 'gnocchi' and phase = 'cook' and sort_order = 4;
update public.recipe_steps set text = 'Posypte petrželí a chvíli nechte odstát před podáváním.'
  where recipe_id = 'gnocchi' and phase = 'cook' and sort_order = 5;

-- tartare
update public.recipe_steps set text = 'Očistěte hovězí maso a velmi jemně ho nasekejte ostrým nožem. Držte v chladu.'
  where recipe_id = 'tartare' and phase = 'prep' and sort_order = 0;
update public.recipe_steps set text = 'Cibuli nakrájejte nadrobno, česnek prolisujte, okurčičky a petržel jemně nasekejte.'
  where recipe_id = 'tartare' and phase = 'prep' and sort_order = 1;
update public.recipe_steps set text = 'Smíchejte maso s dijonskou hořčicí, worcesterskou omáčkou, solí a pepřem dle chuti.'
  where recipe_id = 'tartare' and phase = 'cook' and sort_order = 0;
update public.recipe_steps set text = 'Vmíchejte nasekané ingredience, na studených talířích vytvarujte dva kopečky, do středu udělejte důlek a vložte do něj žloutek.'
  where recipe_id = 'tartare' and phase = 'cook' and sort_order = 1;

-- =========================================================
-- TIMER LABELS
-- =========================================================
update public.step_timers set label = 'Opékání strana A' where label = 'Sear side A';
update public.step_timers set label = 'Opékání strana B' where label = 'Sear side B';
update public.step_timers set label = 'Odpočinek'        where label = 'Rest';
update public.step_timers set label = 'Vaření'           where label = 'Boil';
update public.step_timers set label = 'Restování'        where label = 'Sauté aromatics';
update public.step_timers set label = 'Redukce omáčky'   where label = 'Simmer sauce';
update public.step_timers set label = 'Dušení'           where label = 'Simmer';
update public.step_timers set label = 'Strana s kůží'    where label = 'Skin side';
update public.step_timers set label = 'Otočit'           where label = 'Flip';
update public.step_timers set label = 'Chorizo'          where label = 'Chorizo';
update public.step_timers set label = 'Cibule do sklovité' where label = 'Soften onion';
update public.step_timers set label = 'Redukce vína'     where label = 'Reduce wine';
update public.step_timers set label = 'Rozpuštění másla' where label = 'Butter melt';
update public.step_timers set label = 'Pečení'           where label = 'Roast';
update public.step_timers set label = 'Opékání slaniny'  where label = 'Crisp bacon';
update public.step_timers set label = 'Zapékání'         where label = 'Bake';
