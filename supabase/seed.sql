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
  pickup_location_notes
)
values
  (
    1,
    'brands',
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
    'Pickups available weekdays from 10AM to 6PM.'
  )
on conflict (id) do update set
  home_collection_mode = excluded.home_collection_mode,
  home_banner_manual_product_ids = excluded.home_banner_manual_product_ids,
  highlight_popular_hero = excluded.highlight_popular_hero,
  highlight_latest_hero = excluded.highlight_latest_hero,
  nav_collections_enabled = excluded.nav_collections_enabled,
  favicon_url = excluded.favicon_url,
  theme_config = excluded.theme_config,
  shipping_default_fee = excluded.shipping_default_fee,
  shipping_region_overrides = excluded.shipping_region_overrides,
  vat_enabled = excluded.vat_enabled,
  pickup_location_name = excluded.pickup_location_name,
  pickup_location_unit = excluded.pickup_location_unit,
  pickup_location_lot = excluded.pickup_location_lot,
  pickup_location_street = excluded.pickup_location_street,
  pickup_location_city = excluded.pickup_location_city,
  pickup_location_region = excluded.pickup_location_region,
  pickup_location_zip_code = excluded.pickup_location_zip_code,
  pickup_location_country = excluded.pickup_location_country,
  pickup_location_notes = excluded.pickup_location_notes,
  updated_at = timezone('utc'::text, now());

insert into public.brands (id, name)
values
  (1, 'Chirp Originals'),
  (2, 'Chirp Denim'),
  (3, 'Stride Co.'),
  (4, 'Heritage Goods')
on conflict (id) do update set
  name = excluded.name,
  updated_at = timezone('utc'::text, now());

insert into public.categories (id, name)
values
  (1, 'Tops'),
  (2, 'Bottoms'),
  (3, 'Footwear'),
  (4, 'Accessories')
on conflict (id) do update set
  name = excluded.name,
  updated_at = timezone('utc'::text, now());

insert into public.products (id, name, image_url, brand_id)
values
  (1, 'Premium Cotton T-Shirt', '/white-cotton-tshirt.jpg', 1),
  (2, 'Denim Jeans', '/blue-denim-jeans.png', 2),
  (3, 'Classic Sneakers', '/white-sneakers.png', 3),
  (4, 'Leather Wallet', '/brown-leather-wallet.png', 4)
on conflict (id) do update set
  name = excluded.name,
  image_url = excluded.image_url,
  brand_id = excluded.brand_id,
  updated_at = timezone('utc'::text, now());

insert into public.product_categories (product_id, category_id)
values
  (1, 1),
  (2, 2),
  (3, 3),
  (4, 4),
  (1, 4)
on conflict (product_id, category_id) do nothing;

insert into public.product_variants (
  id,
  product_id,
  sku,
  color,
  image_url,
  description,
  is_preorder
)
values
  (1, 1, 'TEE-WHT-S', 'White', '/white-cotton-tshirt.jpg', 'Soft breathable cotton tee with a relaxed silhouette.', false),
  (2, 1, 'TEE-WHT-L', 'White', '/white-cotton-tshirt.jpg', 'Soft breathable cotton tee with a relaxed silhouette.', false),
  (3, 1, 'TEE-BLK-L', 'Black', '/white-cotton-tshirt.jpg', 'Soft breathable cotton tee with a relaxed silhouette in deep hues.', false),
  (4, 1, 'TEE-NVY-XL', 'Navy', '/white-cotton-tshirt.jpg', 'Soft breathable cotton tee with a relaxed silhouette in deep hues.', false),
  (5, 2, 'JEAN-BLU-30', 'Blue', '/blue-denim-jeans.png', 'Classic straight-cut denim with stretch for everyday wear.', false),
  (6, 2, 'JEAN-BLU-32', 'Blue', '/blue-denim-jeans.png', 'Classic straight-cut denim with stretch for everyday wear.', false),
  (7, 2, 'JEAN-BLK-32', 'Black', '/blue-denim-jeans.png', 'Washed black denim with subtle fade and resilient stitching.', false),
  (8, 3, 'SNKR-WHT-9', 'White', '/white-sneakers.png', 'Lightweight sneakers with cushioned insole for all-day comfort.', false),
  (9, 3, 'SNKR-BLK-10', 'Black', '/white-sneakers.png', 'Lightweight sneakers with cushioned insole for all-day comfort.', false),
  (10, 3, 'SNKR-RED-8', 'Red', '/white-sneakers.png', 'Statement sneakers with cushioned insole and breathable mesh.', false),
  (11, 4, 'WLT-BRN-OS', 'Brown', '/brown-leather-wallet.png', 'Hand-stitched leather wallet with RFID lining and slim storage.', false),
  (12, 4, 'WLT-BLK-OS', 'Black', '/brown-leather-wallet.png', 'Hand-stitched leather wallet with RFID lining and slim storage.', false)
on conflict (id) do update set
  product_id = excluded.product_id,
  sku = excluded.sku,
  color = excluded.color,
  image_url = excluded.image_url,
  description = excluded.description,
  is_preorder = excluded.is_preorder,
  updated_at = timezone('utc'::text, now());

insert into public.variant_sizes (
  variant_id,
  size,
  price,
  stock_quantity
)
values
  (1, 'Small', 899.00, 12),
  (1, 'Medium', 899.00, 15),
  (2, 'Large', 899.00, 14),
  (2, 'XL', 899.00, 8),
  (3, 'Large', 899.00, 7),
  (4, 'XL', 899.00, 5),
  (5, '30', 1499.00, 10),
  (6, '32', 1499.00, 8),
  (7, '32', 1499.00, 6),
  (8, '9', 2499.00, 8),
  (8, '10', 2599.00, 6),
  (9, '10', 2499.00, 5),
  (10, '8', 2499.00, 3),
  (11, null, 799.00, 20),
  (12, null, 799.00, 14)
on conflict on constraint variant_sizes_unique_option_idx do update set
  price = excluded.price,
  stock_quantity = excluded.stock_quantity,
  updated_at = timezone('utc'::text, now());

insert into public.orders (
  id,
  payment_method,
  proof_of_payment_url,
  customer_first_name,
  customer_last_name,
  customer_phone,
  customer_email,
  instagram_handle,
  delivery_unit,
  delivery_lot,
  delivery_street,
  delivery_city,
  delivery_region,
  delivery_zip_code,
  delivery_country,
  fulfillment_method,
  pickup_location_name,
  pickup_location_unit,
  pickup_location_lot,
  pickup_location_street,
  pickup_location_city,
  pickup_location_region,
  pickup_location_zip_code,
  pickup_location_country,
  pickup_location_notes,
  pickup_scheduled_date,
  pickup_scheduled_time,
  order_items,
  subtotal,
  vat,
  shipping_fee,
  total,
  tracking_id,
  status,
  is_read,
  inventory_adjusted,
  created_at,
  updated_at
)
values
  (
    'ORD-20250101-ALPHA',
    'gcash',
    'https://example.com/proof/gcash-alpha.jpg',
    'Juan',
    'Dela Cruz',
    '+63 912 345 6789',
    'juan.delacruz@example.com',
    '@juanmatcha',
    'Unit 12A, Ayala Tower',
    'Block 5, Lot 10',
    'Bonifacio Street',
    'Makati',
    'National Capital Region (NCR)',
    '1200',
    'Philippines',
    'delivery',
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    jsonb_build_array(
      jsonb_build_object(
        'productId', 1,
        'variantId', 2,
        'name', 'Premium Cotton T-Shirt',
        'image', '/white-cotton-tshirt.jpg',
        'customizations', jsonb_build_object('Color', 'White', 'Size', 'Large'),
        'price', 899.00,
        'quantity', 2
      ),
      jsonb_build_object(
        'productId', 2,
        'variantId', 6,
        'name', 'Denim Jeans',
        'image', '/blue-denim-jeans.png',
        'customizations', jsonb_build_object('Color', 'Blue', 'Size', '32'),
        'price', 1499.00,
        'quantity', 1
      )
    ),
    3297.00,
    395.64,
    300.00,
    3992.64,
    'NCR-TRACK-001',
    'Confirmed',
    false,
    false,
    timezone('utc'::text, now()) - interval '2 day',
    timezone('utc'::text, now()) - interval '2 day'
  ),
  (
    'ORD-20250102-BRAVO',
    'bank_transfer',
    'https://example.com/proof/bank-bravo.jpg',
    'Maria',
    'Santos',
    '+63 917 555 1212',
    'maria.santos@example.com',
    '@matchamaria',
    'Ground Floor, Warehouse 5',
    null,
    '123 Matcha Lane',
    'Quezon City',
    'National Capital Region (NCR)',
    '1100',
    'Philippines',
    'pickup',
    'Kazumatcha Studio',
    'Ground Floor, Warehouse 5',
    null,
    '123 Matcha Lane',
    'Quezon City',
    'National Capital Region (NCR)',
    '1100',
    'Philippines',
    'Pickups available weekdays from 10AM to 6PM.',
    '2025-01-05',
    '15:00',
    jsonb_build_array(
      jsonb_build_object(
        'productId', 3,
        'variantId', 8,
        'name', 'Classic Sneakers',
        'image', '/white-sneakers.png',
        'customizations', jsonb_build_object('Color', 'White', 'Size', '9'),
        'price', 2499.00,
        'quantity', 1
      ),
      jsonb_build_object(
        'productId', 4,
        'variantId', 11,
        'name', 'Leather Wallet',
        'image', '/brown-leather-wallet.png',
        'customizations', jsonb_build_object('Color', 'Brown'),
        'price', 799.00,
        'quantity', 1
      )
    ),
    3298.00,
    395.76,
    520.00,
    4213.76,
    'VIS-TRACK-002',
    'For Delivery',
    true,
    true,
    timezone('utc'::text, now()) - interval '1 day',
    timezone('utc'::text, now()) - interval '1 day'
  )
on conflict (id) do update set
  payment_method = excluded.payment_method,
  proof_of_payment_url = excluded.proof_of_payment_url,
  customer_first_name = excluded.customer_first_name,
  customer_last_name = excluded.customer_last_name,
  customer_phone = excluded.customer_phone,
  customer_email = excluded.customer_email,
  instagram_handle = excluded.instagram_handle,
  delivery_unit = excluded.delivery_unit,
  delivery_lot = excluded.delivery_lot,
  delivery_street = excluded.delivery_street,
  delivery_city = excluded.delivery_city,
  delivery_region = excluded.delivery_region,
  delivery_zip_code = excluded.delivery_zip_code,
  delivery_country = excluded.delivery_country,
  fulfillment_method = excluded.fulfillment_method,
  pickup_location_name = excluded.pickup_location_name,
  pickup_location_unit = excluded.pickup_location_unit,
  pickup_location_lot = excluded.pickup_location_lot,
  pickup_location_street = excluded.pickup_location_street,
  pickup_location_city = excluded.pickup_location_city,
  pickup_location_region = excluded.pickup_location_region,
  pickup_location_zip_code = excluded.pickup_location_zip_code,
  pickup_location_country = excluded.pickup_location_country,
  pickup_location_notes = excluded.pickup_location_notes,
  pickup_scheduled_date = excluded.pickup_scheduled_date,
  pickup_scheduled_time = excluded.pickup_scheduled_time,
  order_items = excluded.order_items,
  subtotal = excluded.subtotal,
  vat = excluded.vat,
  shipping_fee = excluded.shipping_fee,
  total = excluded.total,
  tracking_id = excluded.tracking_id,
  status = excluded.status,
  is_read = excluded.is_read,
  inventory_adjusted = excluded.inventory_adjusted,
  updated_at = timezone('utc'::text, now());

select
  setval(
    pg_get_serial_sequence('public.products', 'id'),
    coalesce((select max(id) from public.products), 1),
    true
  );

select
  setval(
    pg_get_serial_sequence('public.product_variants', 'id'),
    coalesce((select max(id) from public.product_variants), 1),
    true
  );

select
  setval(
    pg_get_serial_sequence('public.categories', 'id'),
    coalesce((select max(id) from public.categories), 1),
    true
  );

select
  setval(
    pg_get_serial_sequence('public.brands', 'id'),
    coalesce((select max(id) from public.brands), 1),
    true
  );
