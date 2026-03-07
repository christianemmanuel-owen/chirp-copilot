begin;

do $$
declare
  v_brand_id bigint;
  v_cat_drinkware_id bigint;
  v_cat_limited_id bigint;
  v_cat_smooth_id bigint;
  v_cat_sway_id bigint;
  v_product_id bigint;
  v_variant_id bigint;
  v_now timestamptz := timezone('utc', now());
  variant_record record;
begin
  -- Ensure storefront settings exist
  perform 1 from public.storefront_settings where id = 1;
  if not found then
    insert into public.storefront_settings (
      id,
      home_collection_mode,
      home_banner_manual_product_ids,
      highlight_popular_hero,
      highlight_latest_hero,
      nav_collections_enabled,
      favicon_url,
      theme_config,
      shipping_default_fee,
      shipping_region_overrides,
      vat_enabled,
      pickup_location_name,
      pickup_location_unit,
      pickup_location_lot,
      pickup_location_street,
      pickup_location_city,
      pickup_location_region,
      pickup_location_zip_code,
      pickup_location_country,
      pickup_location_notes,
      created_at,
      updated_at
    )
    values (
      1,
      'brand',
      '{}',
      true,
      true,
      true,
      '/icon.png',
      '{
        "fontFamily": "geist-sans",
        "colors": {
          "background": "#f7f8f5",
          "card": "#ffffff",
          "cardForeground": "#1d1a2b",
          "foreground": "#1d1a2b",
        "mutedForeground": "#5f6275",
        "accent": "#6355ff",
        "accentForeground": "#ffffff",
        "border": "#dfe3ec",
        "buttonColor": "#6355ff",
        "buttonText": "#ffffff"
      }
    }'::jsonb,
      300,
      '{}'::jsonb,
      true,
      'Kazumatcha Studio',
      'Ground Floor, Warehouse 5',
      null,
      '123 Matcha Lane',
      'Quezon City',
      'National Capital Region (NCR)',
      '1100',
      'Philippines',
      'Pickups available weekdays from 10AM to 6PM.',
      v_now,
      v_now
    );
  else
    update public.storefront_settings
      set home_collection_mode = case
            when home_collection_mode in ('brands', 'brand') then 'brand'
            when home_collection_mode in ('categories', 'category') then 'category'
            else home_collection_mode
          end,
          home_banner_manual_product_ids = coalesce(home_banner_manual_product_ids, '{}'::integer[]),
          highlight_popular_hero = coalesce(highlight_popular_hero, true),
          highlight_latest_hero = coalesce(highlight_latest_hero, true),
          nav_collections_enabled = coalesce(nav_collections_enabled, true),
          favicon_url = coalesce(favicon_url, '/icon.png'),
          theme_config = coalesce(
            nullif(theme_config, '{}'::jsonb),
            '{
              "fontFamily": "geist-sans",
              "colors": {
                "background": "#f7f8f5",
                "card": "#ffffff",
                "cardForeground": "#1d1a2b",
                "foreground": "#1d1a2b",
                "mutedForeground": "#5f6275",
                "accent": "#6355ff",
                "accentForeground": "#ffffff",
                "border": "#dfe3ec",
                "buttonColor": "#6355ff",
                "buttonText": "#ffffff"
              }
            }'::jsonb
          ),
          shipping_default_fee = coalesce(shipping_default_fee, 300),
          shipping_region_overrides = coalesce(shipping_region_overrides, '{}'::jsonb),
          vat_enabled = coalesce(vat_enabled, true),
          pickup_location_name = coalesce(pickup_location_name, 'Kazumatcha Studio'),
          pickup_location_unit = coalesce(pickup_location_unit, 'Ground Floor, Warehouse 5'),
          pickup_location_lot = coalesce(pickup_location_lot, null),
          pickup_location_street = coalesce(pickup_location_street, '123 Matcha Lane'),
          pickup_location_city = coalesce(pickup_location_city, 'Quezon City'),
          pickup_location_region = coalesce(pickup_location_region, 'National Capital Region (NCR)'),
          pickup_location_zip_code = coalesce(pickup_location_zip_code, '1100'),
          pickup_location_country = coalesce(pickup_location_country, 'Philippines'),
          pickup_location_notes = coalesce(pickup_location_notes, 'Pickups available weekdays from 10AM to 6PM.'),
          updated_at = v_now
      where id = 1;
  end if;

  -- Ensure brand exists
  select id into v_brand_id from public.brands where name = 'Owala' limit 1;
  if v_brand_id is null then
    insert into public.brands (name, created_at, updated_at)
    values ('Owala', v_now, v_now)
    returning id into v_brand_id;
  end if;

  -- Ensure categories exist
  select id into v_cat_drinkware_id from public.categories where name = 'Drinkware' limit 1;
  if v_cat_drinkware_id is null then
    insert into public.categories (name, created_at, updated_at)
    values ('Drinkware', v_now, v_now)
    returning id into v_cat_drinkware_id;
  end if;

  select id into v_cat_limited_id from public.categories where name = 'Limited Edition' limit 1;
  if v_cat_limited_id is null then
    insert into public.categories (name, created_at, updated_at)
    values ('Limited Edition', v_now, v_now)
    returning id into v_cat_limited_id;
  end if;

  select id into v_cat_smooth_id from public.categories where name = 'SmoothSip Series' limit 1;
  if v_cat_smooth_id is null then
    insert into public.categories (name, created_at, updated_at)
    values ('SmoothSip Series', v_now, v_now)
    returning id into v_cat_smooth_id;
  end if;

  select id into v_cat_sway_id from public.categories where name = 'Sway Collection' limit 1;
  if v_cat_sway_id is null then
    insert into public.categories (name, created_at, updated_at)
    values ('Sway Collection', v_now, v_now)
    returning id into v_cat_sway_id;
  end if;

  ---------------------------------------------------------------------------
  -- Owala FreeSip Insulated Bottle
  ---------------------------------------------------------------------------
  select id into v_product_id from public.products where name = 'Owala FreeSip Insulated Bottle' limit 1;
  if v_product_id is null then
    insert into public.products (name, image_url, brand_id, created_at, updated_at)
    values ('Owala FreeSip Insulated Bottle', '/images/owala/freesip/freesip-core.jpg', v_brand_id, v_now, v_now)
    returning id into v_product_id;
  else
    update public.products
      set image_url = '/images/owala/freesip/freesip-core.jpg',
          brand_id = v_brand_id,
          updated_at = v_now
      where id = v_product_id;
  end if;

  insert into public.product_categories (product_id, category_id, created_at)
  values (v_product_id, v_cat_drinkware_id, v_now)
  on conflict do nothing;

  delete from public.variant_sizes
  where variant_id in (
    select id from public.product_variants where product_id = v_product_id
      and color in (
        'Rose Quartz','Open Air','Calm Waters','Iced Breeze','Very Very Dark',
        'Dreamy Fields','Shy Marshmallow','Beach House','Candy Coated',
        'Candy Store','Rock On','Down to Earth','Coastal Cottage'
      )
  );

  delete from public.product_variants
  where product_id = v_product_id
    and color in (
      'Rose Quartz','Open Air','Calm Waters','Iced Breeze','Very Very Dark',
      'Dreamy Fields','Shy Marshmallow','Beach House','Candy Coated',
      'Candy Store','Rock On','Down to Earth','Coastal Cottage'
    );

  delete from public.variant_sizes
  where variant_id in (
    select id from public.product_variants where product_id = v_product_id
  );

  delete from public.product_variants
  where product_id = v_product_id;

  for variant_record in
    select *
    from (values
      ('Rose Quartz','OW-FS-RQ','/images/owala/freesip/rose-quartz.jpg','Flagship FreeSip in rose quartz gradients with brushed metallic sheen.', true),
      ('Open Air','OW-FS-OA','/images/owala/freesip/open-air.jpg','Flagship FreeSip inspired by alpine air with teal and silver highlights.', true),
      ('Calm Waters','OW-FS-CW','/images/owala/freesip/calm-waters.jpg','Flagship FreeSip awash in tranquil lagoon blues and soft waves.', true),
      ('Iced Breeze','OW-FS-IB','/images/owala/freesip/iced-breeze.jpg','Flagship FreeSip featuring frosted aqua layers and a cool-touch finish.', true),
      ('Very Very Dark','OW-FS-VVD','/images/owala/freesip/very-very-dark.jpg','Flagship FreeSip wrapped in jet-black midnight tones with matte texture.', true),
      ('Dreamy Fields','OW-FS-DF','/images/owala/freesip/dreamy-fields.jpg','Flagship FreeSip painted in wildflower pastels with a satin glow.', true),
      ('Shy Marshmallow','OW-FS-SM','/images/owala/freesip/shy-marshmallow.jpg','Flagship FreeSip blending toasted marshmallow pinks and creamy whites.', true),
      ('Beach House','OW-FS-BH','/images/owala/freesip/beach-house.jpg','Flagship FreeSip echoing boardwalk sunsets and sandy coastal beige.', true),
      ('Candy Coated','OW-FS-CC','/images/owala/freesip/candy-coated.jpg','Flagship FreeSip swirling neon candy shell tones and glossy accents.', true),
      ('Candy Store','OW-FS-CS','/images/owala/freesip/candy-store.jpg','Flagship FreeSip mixing retro confection stripes with high-gloss sheen.', true),
      ('Rock On','OW-FS-RO','/images/owala/freesip/rock-on.jpg','Flagship FreeSip amped with electric magenta and spotlight gradients.', true),
      ('Down to Earth','OW-FS-DTE','/images/owala/freesip/down-to-earth.jpg','Flagship FreeSip rooted in terracotta clay and warm earthen neutrals.', true),
      ('Coastal Cottage','OW-FS-CCOTT','/images/owala/freesip/coastal-cottage.jpg','Flagship FreeSip blending powder blues with weathered cottage whites.', true)
    ) as data(color, sku, image_url, description, is_preorder)
  loop
    insert into public.product_variants (product_id, sku, color, image_url, description, is_preorder, created_at, updated_at)
    values (v_product_id, variant_record.sku, variant_record.color, variant_record.image_url, variant_record.description, variant_record.is_preorder, v_now, v_now)
    on conflict (product_id, coalesce(color, '')) do update
      set sku = excluded.sku,
          image_url = excluded.image_url,
          description = excluded.description,
          is_preorder = excluded.is_preorder,
          updated_at = excluded.updated_at
    returning id into v_variant_id;

    insert into public.variant_sizes (variant_id, size, price, stock_quantity, created_at, updated_at)
    values
      (v_variant_id, '24 oz', 3300, 42, v_now, v_now),
      (v_variant_id, '32 oz', 3500, 28, v_now, v_now),
      (v_variant_id, '40 oz', 3800, 0, v_now, v_now);
  end loop;

  ---------------------------------------------------------------------------
  -- Owala FreeSip Limited Colors
  ---------------------------------------------------------------------------
  select id into v_product_id from public.products where name = 'Owala FreeSip Limited Colors' limit 1;
  if v_product_id is null then
    insert into public.products (name, image_url, brand_id, created_at, updated_at)
    values ('Owala FreeSip Limited Colors', '/images/owala/freesip/freesip-limited.jpg', v_brand_id, v_now, v_now)
    returning id into v_product_id;
  else
    update public.products
      set image_url = '/images/owala/freesip/freesip-limited.jpg',
          brand_id = v_brand_id,
          updated_at = v_now
      where id = v_product_id;
  end if;

  insert into public.product_categories (product_id, category_id, created_at)
  values (v_product_id, v_cat_drinkware_id, v_now),
         (v_product_id, v_cat_limited_id, v_now)
  on conflict do nothing;

  delete from public.product_variants
  where product_id = v_product_id
    and color in ('Sandy Shores','Snowflake','Tangled');

  for variant_record in
    select *
    from (values
      ('Sandy Shores','OW-FS-SS','/images/owala/freesip/sandy-shores.jpg','Limited palette awash in dune beige and sun-faded coral accents.', ARRAY[24,32]::int[]),
      ('Snowflake','OW-FS-SNOW','/images/owala/freesip/snowflake.jpg','Limited palette layered with frosted pearl panels and mint piping.', ARRAY[24]::int[]),
      ('Tangled','OW-FS-TGL','/images/owala/freesip/tangled.jpg','Limited palette tangled with festival tie-dye swirls and neon trim.', ARRAY[24]::int[])
    ) as data(color, sku, image_url, description, sizes)
  loop
    insert into public.product_variants (product_id, sku, color, image_url, description, is_preorder, created_at, updated_at)
    values (v_product_id, variant_record.sku, variant_record.color, variant_record.image_url, variant_record.description, false, v_now, v_now)
    on conflict (product_id, coalesce(color, '')) do update
      set sku = excluded.sku,
          image_url = excluded.image_url,
          description = excluded.description,
          updated_at = excluded.updated_at,
          is_preorder = excluded.is_preorder
    returning id into v_variant_id;

    delete from public.variant_sizes where variant_id = v_variant_id;

    if 24 = any(variant_record.sizes) then
      insert into public.variant_sizes (variant_id, size, price, stock_quantity, created_at, updated_at)
      values (v_variant_id, '24 oz', 3300, 34, v_now, v_now);
    end if;

    if 32 = any(variant_record.sizes) then
      insert into public.variant_sizes (variant_id, size, price, stock_quantity, created_at, updated_at)
      values (v_variant_id, '32 oz', 3500, 22, v_now, v_now);
    end if;
  end loop;

  ---------------------------------------------------------------------------
  -- Starbucks x Owala Collaboration
  ---------------------------------------------------------------------------
  select id into v_product_id from public.products where name = 'Starbucks x Owala FreeSip Series' limit 1;
  if v_product_id is null then
    insert into public.products (name, image_url, brand_id, created_at, updated_at)
    values ('Starbucks x Owala FreeSip Series', '/images/owala/freesip/starbucks-collab.jpg', v_brand_id, v_now, v_now)
    returning id into v_product_id;
  else
    update public.products
      set image_url = '/images/owala/freesip/starbucks-collab.jpg',
          brand_id = v_brand_id,
          updated_at = v_now
      where id = v_product_id;
  end if;

  insert into public.product_categories (product_id, category_id, created_at)
  values (v_product_id, v_cat_drinkware_id, v_now),
         (v_product_id, v_cat_limited_id, v_now)
  on conflict do nothing;

  delete from public.variant_sizes
  where variant_id in (
    select id from public.product_variants
    where product_id = v_product_id
      and color in ('Starbucks Blue','Starbucks White')
  );

  delete from public.product_variants
  where product_id = v_product_id
    and color in ('Starbucks Blue','Starbucks White');

  for variant_record in
    select *
    from (values
      ('Starbucks Blue','OW-FS-SB-BLU','/images/owala/freesip/starbucks-blue.jpg','Starbucks collab steeped in emerald-blue ombre with venti green accents.'),
      ('Starbucks White','OW-FS-SB-WHT','/images/owala/freesip/starbucks-white.jpg','Starbucks collab glazed in snow-white porcelain with signature siren green.')
    ) as data(color, sku, image_url, description)
  loop
    insert into public.product_variants (product_id, sku, color, image_url, description, is_preorder, created_at, updated_at)
    values (v_product_id, variant_record.sku, variant_record.color, variant_record.image_url, variant_record.description, false, v_now, v_now)
    returning id into v_variant_id;

    insert into public.variant_sizes (variant_id, size, price, stock_quantity, created_at, updated_at)
    values (v_variant_id, '24 oz', 3650, 28, v_now, v_now);
  end loop;

  ---------------------------------------------------------------------------
  -- Owala FreeSip 32 oz Exclusives
  ---------------------------------------------------------------------------
  select id into v_product_id from public.products where name = 'Owala FreeSip 32oz Exclusives' limit 1;
  if v_product_id is null then
    insert into public.products (name, image_url, brand_id, created_at, updated_at)
    values ('Owala FreeSip 32oz Exclusives', '/images/owala/freesip/freesip-32oz.jpg', v_brand_id, v_now, v_now)
    returning id into v_product_id;
  else
    update public.products
      set image_url = '/images/owala/freesip/freesip-32oz.jpg',
          brand_id = v_brand_id,
          updated_at = v_now
      where id = v_product_id;
  end if;

  insert into public.product_categories (product_id, category_id, created_at)
  values (v_product_id, v_cat_drinkware_id, v_now)
  on conflict do nothing;

  delete from public.variant_sizes
  where variant_id in (
    select id from public.product_variants
    where product_id = v_product_id
      and color in ('Boo-ya','Cat Collage','Picnic Prep','Tulip Bouquet','Ribbon Toile','Peachy Rose','Rosy Dreams')
  );

  delete from public.product_variants
  where product_id = v_product_id
    and color in ('Boo-ya','Cat Collage','Picnic Prep','Tulip Bouquet','Ribbon Toile','Peachy Rose','Rosy Dreams');

  for variant_record in
    select *
    from (values
      ('Boo-ya','OW-FS-BOO','/images/owala/freesip/boo-ya.jpg','32 oz exclusive decked in glow-in-the-dark ghost icons and midnight navy.'),
      ('Cat Collage','OW-FS-CAT','/images/owala/freesip/cat-collage.jpg','32 oz exclusive splashed with illustrated cats and Polaroid-style doodles.'),
      ('Picnic Prep','OW-FS-PIC','/images/owala/freesip/picnic-prep.jpg','32 oz exclusive patterned with gingham checks and picnic basket hues.'),
      ('Tulip Bouquet','OW-FS-TUL','/images/owala/freesip/tulip-bouquet.jpg','32 oz exclusive blooming with layered tulip petals and spring pastels.'),
      ('Ribbon Toile','OW-FS-RTO','/images/owala/freesip/ribbon-toile.jpg','32 oz exclusive etched with ribbon toile linework over soft cream.'),
      ('Peachy Rose','OW-FS-PRO','/images/owala/freesip/peachy-rose.jpg','32 oz exclusive kissed with peach gradients and rose-gold shimmer.'),
      ('Rosy Dreams','OW-FS-RDR','/images/owala/freesip/rosy-dreams.jpg','32 oz exclusive floating through blush clouds and stardust speckles.')
    ) as data(color, sku, image_url, description)
  loop
    insert into public.product_variants (product_id, sku, color, image_url, description, is_preorder, created_at, updated_at)
    values (v_product_id, variant_record.sku, variant_record.color, variant_record.image_url, variant_record.description, false, v_now, v_now)
    returning id into v_variant_id;

    insert into public.variant_sizes (variant_id, size, price, stock_quantity, created_at, updated_at)
    values (v_variant_id, '32 oz', 3480, 24, v_now, v_now);
  end loop;

  ---------------------------------------------------------------------------
  -- Owala SmoothSip Slider
  ---------------------------------------------------------------------------
  select id into v_product_id from public.products where name = 'Owala SmoothSip Slider' limit 1;
  if v_product_id is null then
    insert into public.products (name, image_url, brand_id, created_at, updated_at)
    values ('Owala SmoothSip Slider', '/images/owala/smoothsip/smoothsip-slider.jpg', v_brand_id, v_now, v_now)
    returning id into v_product_id;
  else
    update public.products
      set image_url = '/images/owala/smoothsip/smoothsip-slider.jpg',
          brand_id = v_brand_id,
          updated_at = v_now
      where id = v_product_id;
  end if;

  insert into public.product_categories (product_id, category_id, created_at)
  values (v_product_id, v_cat_drinkware_id, v_now),
         (v_product_id, v_cat_smooth_id, v_now)
  on conflict do nothing;

  delete from public.variant_sizes
  where variant_id in (
    select id from public.product_variants
    where product_id = v_product_id
      and color in ('Vanilla Bean','Cozy Cocoa','Bubblegum','Day Break','Pucker Up','Candy Coated','Very Very Dark')
  );

  delete from public.product_variants
  where product_id = v_product_id
    and color in ('Vanilla Bean','Cozy Cocoa','Bubblegum','Day Break','Pucker Up','Candy Coated','Very Very Dark');

  for variant_record in
    select *
    from (values
      ('Vanilla Bean','OW-SS-VB','/images/owala/smoothsip/vanilla-bean.jpg','SmoothSip slider coated in velvety vanilla gloss with bronze lid trim.'),
      ('Cozy Cocoa','OW-SS-CC','/images/owala/smoothsip/cozy-cocoa.jpg','SmoothSip slider steeped in cocoa browns with sweater-knit striping.'),
      ('Bubblegum','OW-SS-BB','/images/owala/smoothsip/bubblegum.jpg','SmoothSip slider popping with bubblegum pink and arcade neon specks.'),
      ('Day Break','OW-SS-DB','/images/owala/smoothsip/day-break.jpg','SmoothSip slider glowing with sunrise amber and rosy horizon fade.'),
      ('Pucker Up','OW-SS-PU','/images/owala/smoothsip/pucker-up.jpg','SmoothSip slider zinging with lemonade pinks and citrus yellow pops.'),
      ('Candy Coated','OW-SS-CCOAT','/images/owala/smoothsip/candy-coated.jpg','SmoothSip slider draped in glossy candy stripes and sugar sparkle.'),
      ('Very Very Dark','OW-SS-VVD','/images/owala/smoothsip/very-very-dark.jpg','SmoothSip slider shadowed in charcoal black with stealth matte trim.')
    ) as data(color, sku, image_url, description)
  loop
    insert into public.product_variants (product_id, sku, color, image_url, description, is_preorder, created_at, updated_at)
    values (v_product_id, variant_record.sku, variant_record.color, variant_record.image_url, variant_record.description, false, v_now, v_now)
    returning id into v_variant_id;

    insert into public.variant_sizes (variant_id, size, price, stock_quantity, created_at, updated_at)
    values (v_variant_id, null, 3150, 40, v_now, v_now);
  end loop;

  ---------------------------------------------------------------------------
  -- Owala FreeSip Sway 30 oz
  ---------------------------------------------------------------------------
  select id into v_product_id from public.products where name = 'Owala FreeSip Sway 30oz' limit 1;
  if v_product_id is null then
    insert into public.products (name, image_url, brand_id, created_at, updated_at)
    values ('Owala FreeSip Sway 30oz', '/images/owala/freesip-sway/freesip-sway.jpg', v_brand_id, v_now, v_now)
    returning id into v_product_id;
  else
    update public.products
      set image_url = '/images/owala/freesip-sway/freesip-sway.jpg',
          brand_id = v_brand_id,
          updated_at = v_now
      where id = v_product_id;
  end if;

  insert into public.product_categories (product_id, category_id, created_at)
  values (v_product_id, v_cat_drinkware_id, v_now),
         (v_product_id, v_cat_sway_id, v_now)
  on conflict do nothing;

  delete from public.variant_sizes
  where variant_id in (
    select id from public.product_variants
    where product_id = v_product_id
      and color in ('Very Very Dark','Eucalyptus','Daybreak','Iced Breeze','Sandy Shores','Periwinkle Twinkle','Sleek','Sparkling Sherbet')
  );

  delete from public.product_variants
  where product_id = v_product_id
    and color in ('Very Very Dark','Eucalyptus','Daybreak','Iced Breeze','Sandy Shores','Periwinkle Twinkle','Sleek','Sparkling Sherbet');

  for variant_record in
    select *
    from (values
      ('Very Very Dark','OW-FS-SWAY-VVD','/images/owala/freesip-sway/very-very-dark.jpg','Sway 30 oz silhouette in blackout charcoal with reflective accents.'),
      ('Eucalyptus','OW-FS-SWAY-EUC','/images/owala/freesip-sway/eucalyptus.jpg','Sway 30 oz palette of eucalyptus green cascading into soft sage.'),
      ('Daybreak','OW-FS-SWAY-DB','/images/owala/freesip-sway/daybreak.jpg','Sway 30 oz gradient shifting from rosy dawn peach to amber gold.'),
      ('Iced Breeze','OW-FS-SWAY-IB','/images/owala/freesip-sway/iced-breeze.jpg','Sway 30 oz swept with glacial blues and crisp mist highlights.'),
      ('Sandy Shores','OW-FS-SWAY-SS','/images/owala/freesip-sway/sandy-shores.jpg','Sway 30 oz finished in sunlit sand with driftwood neutral accents.'),
      ('Periwinkle Twinkle','OW-FS-SWAY-PT','/images/owala/freesip-sway/periwinkle-twinkle.jpg','Sway 30 oz sparkled with periwinkle shimmer and starlit flecks.'),
      ('Sleek','OW-FS-SWAY-SLEEK','/images/owala/freesip-sway/sleek.jpg','Sway 30 oz minimalist graphite with tone-on-tone contour lines.'),
      ('Sparkling Sherbet','OW-FS-SWAY-SSHB','/images/owala/freesip-sway/sparkling-sherbet.jpg','Sway 30 oz swirling sherbet orange, raspberry, and fizz highlights.')
    ) as data(color, sku, image_url, description)
  loop
    insert into public.product_variants (product_id, sku, color, image_url, description, is_preorder, created_at, updated_at)
    values (v_product_id, variant_record.sku, variant_record.color, variant_record.image_url, variant_record.description, false, v_now, v_now)
    returning id into v_variant_id;

    insert into public.variant_sizes (variant_id, size, price, stock_quantity, created_at, updated_at)
    values (v_variant_id, '30 oz', 3600, 30, v_now, v_now);
  end loop;

end $$;

commit;
