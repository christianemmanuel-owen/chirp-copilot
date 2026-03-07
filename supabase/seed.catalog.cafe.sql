begin;

do $seed$
declare
  v_now timestamptz := timezone('utc', now());
  brand_names text[] := array[
    'Starbucks Reserve',
    'Blue Bottle Coffee',
    'Onyx Coffee Lab',
    'Stumptown Coffee Roasters',
    'Ippodo Tea Co.',
    'MatchaBar',
    'Cha Cha Matcha',
    'Hydro Flask',
    'Stanley',
    'Ember',
    'Owala'
  ];
  category_names text[] := array['Drinkware', 'Coffee Beans', 'Matcha', 'Reusable Containers'];
  product_payload jsonb := $payload$[
    {
      "name": "Starbucks Reserve Microblend No. 21",
      "imageUrl": "/images/catalog/coffee/starbucks-mb21.jpg",
      "brand": "Starbucks Reserve",
      "categories": ["Coffee Beans"],
      "variants": [
        {
          "label": "Whole Bean",
          "sku": "SR-MB21-WB",
          "imageUrl": "/images/catalog/coffee/starbucks-mb21.jpg",
          "description": "Micro-lot blend with Valencia orange, cedar honey, and dark cocoa notes.",
          "sizes": [
            {"label": "250 g", "price": 1650, "stock": 48},
            {"label": "1 kg", "price": 5400, "stock": 14}
          ]
        },
        {
          "label": "Espresso Grind",
          "sku": "SR-MB21-EG",
          "imageUrl": "/images/catalog/coffee/starbucks-mb21-espresso.jpg",
          "description": "Barista-ground espresso profile with syrupy sweetness and burnt sugar finish.",
          "sizes": [
            {"label": "250 g", "price": 1720, "stock": 42},
            {"label": "1 kg", "price": 5580, "stock": 10}
          ]
        }
      ]
    },
    {
      "name": "Blue Bottle Three Africas Blend",
      "imageUrl": "/images/catalog/coffee/bluebottle-three-africas.jpg",
      "brand": "Blue Bottle Coffee",
      "categories": ["Coffee Beans"],
      "variants": [
        {
          "label": "Whole Bean",
          "sku": "BB-3AF-WB",
          "imageUrl": "/images/catalog/coffee/bluebottle-three-africas.jpg",
          "description": "Juicy Ethiopian and Ugandan blend with bergamot and dark berry sweetness.",
          "sizes": [
            {"label": "200 g", "price": 1250, "stock": 60},
            {"label": "600 g", "price": 3150, "stock": 25}
          ]
        },
        {
          "label": "Cold Brew Grind",
          "sku": "BB-3AF-CB",
          "imageUrl": "/images/catalog/coffee/bluebottle-three-africas-coldbrew.jpg",
          "description": "Coarse-ground bag optimized for slow immersion brews.",
          "sizes": [
            {"label": "200 g", "price": 1320, "stock": 52},
            {"label": "600 g", "price": 3250, "stock": 20}
          ]
        }
      ]
    },
    {
      "name": "Onyx Geometry Blend",
      "imageUrl": "/images/catalog/coffee/onyx-geometry.jpg",
      "brand": "Onyx Coffee Lab",
      "categories": ["Coffee Beans"],
      "variants": [
        {
          "label": "Whole Bean",
          "sku": "ONX-GEO-WB",
          "imageUrl": "/images/catalog/coffee/onyx-geometry.jpg",
          "description": "Signature washed blend layered with jasmine, stone fruit, and milk chocolate.",
          "sizes": [
            {"label": "284 g", "price": 1500, "stock": 58},
            {"label": "1 kg", "price": 5200, "stock": 18}
          ]
        },
        {
          "label": "Filter Grind",
          "sku": "ONX-GEO-FG",
          "imageUrl": "/images/catalog/coffee/onyx-geometry-filter.jpg",
          "description": "Brew bar grind dialed for pour-over clarity.",
          "sizes": [
            {"label": "284 g", "price": 1580, "stock": 44},
            {"label": "1 kg", "price": 5320, "stock": 15}
          ]
        }
      ]
    },
    {
      "name": "Stumptown Hair Bender",
      "imageUrl": "/images/catalog/coffee/stumptown-hairbender.jpg",
      "brand": "Stumptown Coffee Roasters",
      "categories": ["Coffee Beans"],
      "variants": [
        {
          "label": "Whole Bean",
          "sku": "ST-HB-WB",
          "imageUrl": "/images/catalog/coffee/stumptown-hairbender.jpg",
          "description": "Classic Portland roast with citrus zest, toffee, and dark fudge finish.",
          "sizes": [
            {"label": "340 g", "price": 1350, "stock": 65},
            {"label": "1 kg", "price": 4550, "stock": 20}
          ]
        },
        {
          "label": "Espresso Grind",
          "sku": "ST-HB-EG",
          "imageUrl": "/images/catalog/coffee/stumptown-hairbender-espresso.jpg",
          "description": "Cafe espresso grind with molasses sweetness and persistent crema.",
          "sizes": [
            {"label": "340 g", "price": 1420, "stock": 48},
            {"label": "1 kg", "price": 4680, "stock": 16}
          ]
        }
      ]
    },
    {
      "name": "Ippodo Sayaka-no-Mukashi Ceremonial Matcha",
      "imageUrl": "/images/catalog/matcha/ippodo-sayaka.jpg",
      "brand": "Ippodo Tea Co.",
      "categories": ["Matcha"],
      "variants": [
        {
          "label": "Tin",
          "sku": "IPP-SAY-TIN",
          "imageUrl": "/images/catalog/matcha/ippodo-sayaka-tin.jpg",
          "description": "Shade-grown Uji leaves with silky umami and melon sweetness in a giftable tin.",
          "sizes": [
            {"label": "40 g", "price": 1850, "stock": 70},
            {"label": "100 g", "price": 4000, "stock": 28}
          ]
        },
        {
          "label": "Refill Pouch",
          "sku": "IPP-SAY-REFILL",
          "imageUrl": "/images/catalog/matcha/ippodo-sayaka-refill.jpg",
          "description": "Foil-lined refill pouch to top up ceremonial tins.",
          "sizes": [
            {"label": "60 g", "price": 2520, "stock": 40},
            {"label": "120 g", "price": 4650, "stock": 18}
          ]
        }
      ]
    },
    {
      "name": "MatchaBar Hustle Energy Matcha",
      "imageUrl": "/images/catalog/matcha/matchabar-hustle.jpg",
      "brand": "MatchaBar",
      "categories": ["Matcha"],
      "variants": [
        {
          "label": "Original Boost",
          "sku": "MB-HUS-ORIG",
          "imageUrl": "/images/catalog/matcha/matchabar-hustle-original.jpg",
          "description": "Ceremonial grade matcha blended with coconut sugar and lion's mane.",
          "sizes": [
            {"label": "30 servings", "price": 1550, "stock": 85},
            {"label": "60 servings", "price": 2980, "stock": 40}
          ]
        },
        {
          "label": "Lavender Field",
          "sku": "MB-HUS-LAV",
          "imageUrl": "/images/catalog/matcha/matchabar-hustle-lavender.jpg",
          "description": "Floral lavender uplift with monk fruit sweetness and calm energy.",
          "sizes": [
            {"label": "30 servings", "price": 1650, "stock": 70},
            {"label": "60 servings", "price": 3150, "stock": 32}
          ]
        }
      ]
    },
    {
      "name": "Cha Cha Matcha Coconut Matcha Latte Mix",
      "imageUrl": "/images/catalog/matcha/chacha-coconut.jpg",
      "brand": "Cha Cha Matcha",
      "categories": ["Matcha"],
      "variants": [
        {
          "label": "Powder Mix",
          "sku": "CCM-COCO-POW",
          "imageUrl": "/images/catalog/matcha/chacha-coconut-powder.jpg",
          "description": "Ready-to-whisk coconut milk powder with ceremonial matcha and vanilla.",
          "sizes": [
            {"label": "60 g", "price": 1450, "stock": 90},
            {"label": "150 g", "price": 3250, "stock": 36}
          ]
        }
      ]
    },
    {
      "name": "Hydro Flask Wide Mouth Flex Sip Collection",
      "imageUrl": "/images/catalog/drinkware/hydroflask-flexsip.jpg",
      "brand": "Hydro Flask",
      "categories": ["Reusable Containers", "Drinkware"],
      "variants": [
        {
          "label": "Rain",
          "sku": "HYD-WM-RAIN",
          "imageUrl": "/images/catalog/drinkware/hydroflask-rain.jpg",
          "description": "Misty blue enamel with stainless steel Flex Sip lid.",
          "sizes": [
            {"label": "32 oz", "price": 2990, "stock": 44},
            {"label": "40 oz", "price": 3290, "stock": 28}
          ]
        },
        {
          "label": "Guava",
          "sku": "HYD-WM-GUAVA",
          "imageUrl": "/images/catalog/drinkware/hydroflask-guava.jpg",
          "description": "Vibrant guava pink with soft touch powder coat.",
          "sizes": [
            {"label": "32 oz", "price": 2990, "stock": 46},
            {"label": "40 oz", "price": 3290, "stock": 22}
          ]
        },
        {
          "label": "Stone",
          "sku": "HYD-WM-STONE",
          "imageUrl": "/images/catalog/drinkware/hydroflask-stone.jpg",
          "description": "Matte stone gray inspired by volcanic gravel.",
          "sizes": [
            {"label": "32 oz", "price": 2990, "stock": 38},
            {"label": "40 oz", "price": 3290, "stock": 20}
          ]
        }
      ]
    },
    {
      "name": "Stanley Quencher H2.0 Flowstate 40 oz",
      "imageUrl": "/images/catalog/drinkware/stanley-quencher.jpg",
      "brand": "Stanley",
      "categories": ["Reusable Containers", "Drinkware"],
      "variants": [
        {
          "label": "Cream Gloss",
          "sku": "STN-H2O-CREAM",
          "imageUrl": "/images/catalog/drinkware/stanley-cream.jpg",
          "description": "Gloss cream exterior with Flowstate lid and matching straw.",
          "sizes": [
            {"label": "40 oz", "price": 3200, "stock": 52}
          ]
        },
        {
          "label": "Rose Quartz Glow",
          "sku": "STN-H2O-ROSE",
          "imageUrl": "/images/catalog/drinkware/stanley-rose.jpg",
          "description": "Limited rose quartz hue with iridescent sheen.",
          "sizes": [
            {"label": "40 oz", "price": 3280, "stock": 40}
          ]
        },
        {
          "label": "Black Chrome",
          "sku": "STN-H2O-BLACK",
          "imageUrl": "/images/catalog/drinkware/stanley-black.jpg",
          "description": "Matte black chrome with tonal branding.",
          "sizes": [
            {"label": "40 oz", "price": 3200, "stock": 48}
          ]
        }
      ]
    },
    {
      "name": "Ember Travel Mug 2",
      "imageUrl": "/images/catalog/drinkware/ember-travel-mug.jpg",
      "brand": "Ember",
      "categories": ["Reusable Containers", "Drinkware"],
      "variants": [
        {
          "label": "Matte Black",
          "sku": "EMB-TM-BLK",
          "imageUrl": "/images/catalog/drinkware/ember-travel-mug-black.jpg",
          "description": "App-controlled mug keeps drinks between 50C and 62C for three hours.",
          "sizes": [
            {"label": "12 oz", "price": 9950, "stock": 22}
          ]
        },
        {
          "label": "Sage",
          "sku": "EMB-TM-SAGE",
          "imageUrl": "/images/catalog/drinkware/ember-travel-mug-sage.jpg",
          "description": "Limited sage colorway with copper charging coaster.",
          "sizes": [
            {"label": "12 oz", "price": 9950, "stock": 18}
          ]
        }
      ]
    },
    {
      "name": "Owala Brew Buddy Cold Cup",
      "imageUrl": "/images/catalog/drinkware/owala-brew-buddy.jpg",
      "brand": "Owala",
      "categories": ["Reusable Containers", "Drinkware"],
      "variants": [
        {
          "label": "Seafoam Press",
          "sku": "OWA-BREW-SEA",
          "imageUrl": "/images/catalog/drinkware/owala-brew-buddy-sea.jpg",
          "description": "Dual-sip straw and seal lid inspired by seaside matcha cafes.",
          "sizes": [
            {"label": "24 oz", "price": 2650, "stock": 54}
          ]
        },
        {
          "label": "Midnight Berry",
          "sku": "OWA-BREW-BERRY",
          "imageUrl": "/images/catalog/drinkware/owala-brew-buddy-berry.jpg",
          "description": "Deep berry ombre with iridescent straw accents.",
          "sizes": [
            {"label": "24 oz", "price": 2650, "stock": 48}
          ]
        }
      ]
    }
  ]$payload$::jsonb;
  v_brand_id bigint;
  v_category_id bigint;
  v_product_id bigint;
  v_variant_id bigint;
  v_variant_sku_list text[];
  brand_name text;
  base_category_name text;
  product_category_name text;
  product_record record;
  variant_record record;
  size_record record;
begin
  -- Upsert brands
  foreach brand_name in array brand_names loop
    insert into public.brands (name, created_at, updated_at)
    values (brand_name, v_now, v_now)
    on conflict (name) do update
      set updated_at = excluded.updated_at;
  end loop;

  -- Upsert base categories
  foreach base_category_name in array category_names loop
    insert into public.categories (name, created_at, updated_at)
    values (base_category_name, v_now, v_now)
    on conflict (name) do update
      set updated_at = excluded.updated_at;
  end loop;

  -- Seed products and variants from payload
  for product_record in
    select *
    from jsonb_to_recordset(product_payload)
      as payload(name text, image_url text, brand text, categories text[], variants jsonb)
  loop
    select id into v_brand_id from public.brands where name = product_record.brand limit 1;

    select id into v_product_id from public.products where name = product_record.name limit 1;
    if v_product_id is null then
      insert into public.products (name, image_url, brand_id, created_at, updated_at)
      values (product_record.name, product_record.image_url, v_brand_id, v_now, v_now)
      returning id into v_product_id;
    else
      update public.products
        set image_url = product_record.image_url,
            brand_id = v_brand_id,
            updated_at = v_now
        where id = v_product_id;
    end if;

    -- Associate categories
    for product_category_name in
      select trim(value) as name
      from unnest(product_record.categories) as value
    loop
      select id into v_category_id from public.categories where name = product_category_name limit 1;
      if v_category_id is not null then
        insert into public.product_categories (product_id, category_id, created_at)
        values (v_product_id, v_category_id, v_now)
        on conflict do nothing;
      end if;
    end loop;

    -- Clean up variants for this product
    select coalesce(array_agg(variant_elem->>'sku'), array[]::text[])
    into v_variant_sku_list
    from jsonb_array_elements(product_record.variants) as variant_elem(elem);

    delete from public.variant_sizes
    where variant_id in (
      select id from public.product_variants
      where product_id = v_product_id
        and sku = any(v_variant_sku_list)
    );

    delete from public.product_variants
    where product_id = v_product_id
      and sku = any(v_variant_sku_list);

    -- Insert variants and sizes
    for variant_record in
      select
        variant_elem.elem->>'label' as label,
        variant_elem.elem->>'sku' as sku,
        variant_elem.elem->>'imageUrl' as image_url,
        variant_elem.elem->>'description' as description,
        variant_elem.elem->'sizes' as sizes
      from jsonb_array_elements(product_record.variants) as variant_elem(elem)
    loop
      insert into public.product_variants (product_id, sku, color, image_url, description, is_preorder, created_at, updated_at)
      values (v_product_id, variant_record.sku, variant_record.label, variant_record.image_url, variant_record.description, false, v_now, v_now)
      returning id into v_variant_id;

      for size_record in
        select
          size_elem.elem->>'label' as size_label,
          (size_elem.elem->>'price')::numeric as size_price,
          (size_elem.elem->>'stock')::integer as size_stock
        from jsonb_array_elements(coalesce(variant_record.sizes, '[]'::jsonb)) as size_elem(elem)
      loop
        insert into public.variant_sizes (variant_id, size, price, stock_quantity, created_at, updated_at)
        values (v_variant_id, size_record.size_label, size_record.size_price, size_record.size_stock, v_now, v_now);
      end loop;
    end loop;
  end loop;
end $seed$;

commit;

