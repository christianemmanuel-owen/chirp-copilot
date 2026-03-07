begin;

do $$
declare
  v_now timestamptz := timezone('utc', now());
  orders_target integer := 600;
  payment_methods text[] := array['GCash', 'BPI', 'BDO', 'Maya', 'Cash on Delivery', 'Credit Card'];
  catalog_skus text[] := array[
    'SR-MB21-WB','SR-MB21-EG','BB-3AF-WB','BB-3AF-CB','ONX-GEO-WB','ONX-GEO-FG',
    'ST-HB-WB','ST-HB-EG','IPP-SAY-TIN','IPP-SAY-REFILL','MB-HUS-ORIG','MB-HUS-LAV',
    'CCM-COCO-POW','HYD-WM-RAIN','HYD-WM-GUAVA','HYD-WM-STONE','STN-H2O-CREAM',
    'STN-H2O-ROSE','STN-H2O-BLACK','EMB-TM-BLK','EMB-TM-SAGE','OWA-BREW-SEA','OWA-BREW-BERRY'
  ];
  v_order_ts timestamptz;
  v_payment_method text;
  v_fulfillment_method text;
  v_status text;
  v_shipping_fee numeric(10,2);
  v_subtotal numeric(10,2);
  v_vat numeric(10,2);
  v_total numeric(10,2);
  v_items jsonb;
  v_item jsonb;
  v_item_count integer;
  v_item_qty integer;
  v_line_total numeric(10,2);
  v_order_id text;
  v_tracking_id text;
  v_proof_url text;
  v_pickup_date date;
  v_pickup_time text;
  v_is_read boolean;
  v_inventory_adjusted boolean;
  v_customer record;
  v_catalog_row record;
  v_total_days integer := 180;
  v_start timestamptz;
  v_day_index integer;
  v_day_orders integer;
  v_day_date date;
  v_order_sequence integer := 0;
  v_day_slot integer;
  v_item_idx integer;
  plan_record record;
  v_total_weight numeric := 0;
  v_weight numeric;
  v_remainder integer;
begin
  v_start := date_trunc('day', v_now) - make_interval(days => v_total_days);
  create temporary table temp_catalog (
    product_id bigint,
    variant_id bigint,
    product_name text,
    variant_label text,
    sku text,
    image_url text,
    size text,
    price numeric(10,2)
  ) on commit drop;

  insert into temp_catalog
  select
    p.id as product_id,
    pv.id as variant_id,
    p.name as product_name,
    coalesce(pv.color, 'Standard') as variant_label,
    pv.sku,
    coalesce(pv.image_url, p.image_url) as image_url,
    vs.size,
    vs.price
  from public.product_variants pv
  join public.products p on p.id = pv.product_id
  join public.variant_sizes vs on vs.variant_id = pv.id
  where pv.sku = any(catalog_skus);

  if not exists (select 1 from temp_catalog) then
    raise exception 'Catalog variants could not be loaded. Ensure product seed script has run.';
  end if;

  create temporary table temp_customers (
    id serial primary key,
    first_name text,
    last_name text,
    phone text,
    email text,
    instagram text,
    unit text,
    lot text,
    street text not null,
    city text not null,
    region text not null,
    zip_code text not null,
    country text not null
  ) on commit drop;

  insert into temp_customers (first_name, last_name, phone, email, instagram, unit, lot, street, city, region, zip_code, country)
  values
    ('Alyssa','Tan','+63 917 555 0134','alyssa.tan@example.com','@brewtan','12F',null,'Jade Residences, 67 P. Guevarra St.','San Juan','NCR','1500','Philippines'),
    ('Miguel','Reyes','+63 916 448 7712','miguel.reyes@example.com','@mr.espresso','8B',null,'15 Jade Tower, Emerald Ave.','Pasig','NCR','1605','Philippines'),
    ('Patricia','Lim','+63 918 112 9944','patricia.lim@example.com','@lim.lattes',null,'5','San Antonio Village, Perea St.','Makati','NCR','1227','Philippines'),
    ('Kenji','Soriano','+63 927 221 4430','kenji.soriano@example.com','@kenjidrinks',null,null,'11th Ave., High Street South','Taguig','NCR','1634','Philippines'),
    ('Bea','Valdez','+63 917 889 0011','bea.valdez@example.com','@beafrappe','27C',null,'Park Tower, Escario Extension','Cebu City','Central Visayas','6000','Philippines'),
    ('Carlo','Dizon','+63 920 555 1188','carlo.dizon@example.com','@brewbycarlo',null,'21','Lanang Business Park, J.P. Laurel Ave.','Davao City','Davao Region','8000','Philippines'),
    ('Hannah','Cruz','+63 915 770 0974','hannah.cruz@example.com','@matchahannah','5A',null,'Lacson St., Mandalagan','Bacolod','Western Visayas','6100','Philippines'),
    ('Jerome','Go','+63 919 554 2211','jerome.go@example.com','@jeromegoes',null,null,'Leonard Wood Rd., Outlook Ridge','Baguio','Cordillera','2600','Philippines'),
    ('Liza','Navarro','+63 917 880 5511','liza.navarro@example.com','@lizacups','18F',null,'Aurora Milestone, Katipunan Ave.','Quezon City','NCR','1108','Philippines'),
    ('Nina','Serrano','+63 918 666 0912','nina.serrano@example.com','@ninamatcha',null,'7','Megaworld Blvd., Iloilo Business Park','Iloilo City','Western Visayas','5000','Philippines'),
    ('Paolo','Santos','+63 917 112 6677','paolo.santos@example.com','@paolobrews','3F',null,'Nuvali Blvd., Don Jose','Santa Rosa','CALABARZON','4026','Philippines'),
    ('Sofia','Roces','+63 922 333 1185','sofia.roces@example.com','@sofiadrinks',null,'19','Phase 8, Vermosa Blvd.','Imus','CALABARZON','4103','Philippines');

  if not exists (select 1 from temp_customers) then
    raise exception 'Customer fixture table is empty.';
  end if;

  create temporary table temp_daily_plan (
    day_index integer primary key,
    plan_date date not null,
    planned_orders integer not null default 0,
    weight numeric not null
  ) on commit drop;

  for v_day_index in 0..v_total_days loop
    v_day_date := (v_start + (v_day_index || ' days')::interval)::date;
    v_weight :=
      0.6
      + power((v_day_index::numeric + 1) / (v_total_days + 1), 2.3) * 4
      + (random() * 0.8)
      + case when extract(isodow from v_day_date) in (2,3,4,5) then 0.3 when extract(isodow from v_day_date) = 1 then 0.2 else -0.2 end
      + case
          when v_day_index >= v_total_days - 20 then 2.8
          when v_day_index >= v_total_days - 45 then 1.8
          when v_day_index >= v_total_days - 75 then 0.9
          else 0
        end;

    insert into temp_daily_plan (day_index, plan_date, weight)
    values (v_day_index, v_day_date, v_weight);

    v_total_weight := v_total_weight + v_weight;
  end loop;

  update temp_daily_plan
    set planned_orders = greatest(0, floor(weight / v_total_weight * orders_target));

  v_remainder := orders_target - (
    select coalesce(sum(planned_orders), 0) from temp_daily_plan
  );

  while v_remainder > 0 loop
    update temp_daily_plan
      set planned_orders = planned_orders + 1
      where day_index = (
        select day_index
        from temp_daily_plan
        order by weight desc, random()
        limit 1
      );
    exit when not found;
    v_remainder := v_remainder - 1;
  end loop;

  for plan_record in
    select day_index
    from temp_daily_plan
    where day_index >= v_total_days - 30 and planned_orders = 0
  loop
    update temp_daily_plan
      set planned_orders = 1
      where day_index = plan_record.day_index;
    v_remainder := v_remainder - 1;
  end loop;

  while v_remainder < 0 loop
    update temp_daily_plan
      set planned_orders = planned_orders - 1
      where day_index = (
        select day_index
        from temp_daily_plan
        where day_index < v_total_days - 30
          and planned_orders > 1
        order by weight asc, random()
        limit 1
      );
    exit when not found;
    v_remainder := v_remainder + 1;
  end loop;

  for plan_record in
    select day_index, plan_date, planned_orders
    from temp_daily_plan
    order by day_index
  loop
    v_day_orders := plan_record.planned_orders;
    v_day_date := plan_record.plan_date;

    if plan_record.day_index >= v_total_days - 20 and v_day_orders < 1 then
      v_day_orders := 1;
    end if;

    for v_day_slot in 1..v_day_orders loop
      v_order_sequence := v_order_sequence + 1;

      select * into v_customer
      from temp_customers
      order by random()
      limit 1;

      v_fulfillment_method := case when v_order_sequence % 5 = 0 then 'pickup' else 'delivery' end;
      v_payment_method := payment_methods[1 + floor(random() * array_length(payment_methods, 1))::int];

      v_order_ts := v_day_date::timestamptz
        + interval '6 hours'
        + (interval '1 hour') * floor(random() * 12)::int
        + (interval '1 minute') * floor(random() * 60)::int;

      v_item_count := greatest(1, 1 + floor(random() * 3)::int);

      v_items := '[]'::jsonb;
      v_subtotal := 0;

      for v_item_idx in 1..v_item_count loop
        select * into v_catalog_row
        from temp_catalog
        order by random()
        limit 1;

        v_item_qty := greatest(1, 1 + floor(random() * 3)::int);
        v_line_total := v_catalog_row.price * v_item_qty;

        v_item := jsonb_build_object(
          'productId', v_catalog_row.product_id,
          'variantId', v_catalog_row.variant_id,
          'name', trim(both from format('%s - %s', v_catalog_row.product_name, v_catalog_row.variant_label)),
          'image', v_catalog_row.image_url,
          'customizations', jsonb_build_object('Size', v_catalog_row.size),
          'price', v_catalog_row.price,
          'quantity', v_item_qty
        );

        v_items := v_items || jsonb_build_array(v_item);
        v_subtotal := v_subtotal + v_line_total;
      end loop;

      v_vat := round(v_subtotal * 0.12, 2);

      v_shipping_fee := case
        when v_fulfillment_method = 'pickup' then 0
        when v_customer.region = 'NCR' then 150
        else 260
      end;

      v_total := v_subtotal + v_vat + v_shipping_fee;

      if v_order_ts <= v_now - interval '120 days' then
        v_status := 'Completed';
      elsif v_order_ts <= v_now - interval '45 days' then
        v_status := 'Confirmed';
      elsif v_fulfillment_method = 'pickup' then
        v_status := 'For Evaluation';
      else
        v_status := 'For Delivery';
      end if;

      if v_order_ts > v_now - interval '14 days' and random() < 0.4 then
        v_status := 'For Evaluation';
      end if;

      v_is_read := (v_status in ('Completed','Confirmed')) or v_order_ts < v_now - interval '30 days';
      v_inventory_adjusted := v_status in ('Completed','Confirmed');

      v_tracking_id := case
        when v_fulfillment_method = 'delivery' and v_status in ('For Delivery','Confirmed','Completed') then
          format('KZTRACK-%04s', (v_order_sequence * 7) % 10000)
        else null
      end;

      v_proof_url := case
        when v_payment_method in ('GCash','BPI','BDO','Maya','Credit Card') then
          format('https://cdn.kazumatcha.com/proofs/%s.jpg', replace(uuid_generate_v4()::text, '-', ''))
        else null
      end;

      if v_fulfillment_method = 'pickup' then
        v_pickup_date := (v_order_ts + interval '3 days')::date;
        v_pickup_time := to_char(time '10:00' + ((v_order_sequence % 6) * interval '00:30'), 'HH24:MI');
      else
        v_pickup_date := null;
        v_pickup_time := null;
      end if;

      v_order_id := format('ORD-KZ-%s-%s', to_char(v_order_ts, 'YYYYMMDD'), lpad(v_order_sequence::text, 4, '0'));

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
    values (
      v_order_id,
      v_payment_method,
      v_proof_url,
      v_customer.first_name,
      v_customer.last_name,
      v_customer.phone,
      v_customer.email,
      v_customer.instagram,
      nullif(v_customer.unit, ''),
      nullif(v_customer.lot, ''),
      v_customer.street,
      v_customer.city,
      v_customer.region,
      v_customer.zip_code,
      v_customer.country,
      v_fulfillment_method,
      case when v_fulfillment_method = 'pickup' then 'Kazumatcha Studio' else null end,
      case when v_fulfillment_method = 'pickup' then 'Ground Floor, Warehouse 5' else null end,
      null,
      case when v_fulfillment_method = 'pickup' then '123 Matcha Lane' else null end,
      case when v_fulfillment_method = 'pickup' then 'Quezon City' else null end,
      case when v_fulfillment_method = 'pickup' then 'National Capital Region (NCR)' else null end,
      case when v_fulfillment_method = 'pickup' then '1100' else null end,
      case when v_fulfillment_method = 'pickup' then 'Philippines' else null end,
      case when v_fulfillment_method = 'pickup' then 'Pickups available weekdays from 10AM to 6PM.' else null end,
      v_pickup_date,
      v_pickup_time,
      v_items,
      v_subtotal,
      v_vat,
      v_shipping_fee,
      v_total,
      v_tracking_id,
      v_status,
      v_is_read,
      v_inventory_adjusted,
      v_order_ts,
      v_order_ts
    )
    on conflict (id) do update
      set payment_method = excluded.payment_method,
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
          updated_at = excluded.created_at;
    end loop;
  end loop;
end $$;

commit;
