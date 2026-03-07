BEGIN;

DO $$
DECLARE
  v_now timestamptz := timezone('utc', now());
  v_order record;
  v_order_id uuid;
BEGIN
  FOR v_order IN
    SELECT *
    FROM (
      VALUES
      (
        uuid_generate_v4()::uuid,
        v_now - interval '65 days',
        'Confirmed',
        jsonb_build_array(
          jsonb_build_object(
            'productId', 1,
            'variantId', 1,
            'name', 'Owala FreeSip Insulated Bottle - Rose Quartz',
            'image', '/images/owala/freesip/rose-quartz.jpg',
            'customizations', jsonb_build_object('Size', '24 oz'),
            'price', 3300,
            'quantity', 1
          ),
          jsonb_build_object(
            'productId', 2,
            'variantId', 20,
            'name', 'Owala FreeSip Limited Colors - Sandy Shores',
            'image', '/images/owala/freesip/sandy-shores.jpg',
            'customizations', jsonb_build_object('Size', '32 oz'),
            'price', 3500,
            'quantity', 1
          )
        ),
        jsonb_build_object(
          'firstName', 'Alyssa',
          'lastName', 'Tan',
          'phone', '+63 917 555 0134',
          'email', 'alyssa.tan@example.com'
        ),
        jsonb_build_object(
          'unit', '12F',
          'lot', NULL,
          'street', 'Jade Residences, 67 P. Guevarra St.',
          'city', 'San Juan',
          'region', 'NCR',
          'zipCode', '1500',
          'country', 'Philippines'
        ),
        'GCash',
        6800::numeric,
        816::numeric,
        120::numeric,
        'GCASH-REF-024588',
        true
      ),
      (
        uuid_generate_v4()::uuid,
        v_now - interval '54 days',
        'Completed',
        jsonb_build_array(
          jsonb_build_object(
            'productId', 3,
            'variantId', 30,
            'name', 'Starbucks x Owala FreeSip Series - Starbucks Blue',
            'image', '/images/owala/freesip/starbucks-blue.jpg',
            'customizations', jsonb_build_object('Size', '24 oz'),
            'price', 3650,
            'quantity', 2
          )
        ),
        jsonb_build_object(
          'firstName', 'Miguel',
          'lastName', 'Reyes',
          'phone', '+63 916 448 7712',
          'email', 'miguel.reyes@example.com'
        ),
        jsonb_build_object(
          'unit', '8B',
          'lot', NULL,
          'street', '15 Jade Tower, Emerald Ave.',
          'city', 'Pasig',
          'region', 'NCR',
          'zipCode', '1605',
          'country', 'Philippines'
        ),
        'BDO',
        7300::numeric,
        876::numeric,
        150::numeric,
        'BDO-DEP-883420',
        true
      ),
      (
        uuid_generate_v4()::uuid,
        v_now - interval '41 days',
        'For Delivery',
        jsonb_build_array(
          jsonb_build_object(
            'productId', 4,
            'variantId', 42,
            'name', 'Owala FreeSip 32oz Exclusives - Rosy Dreams',
            'image', '/images/owala/freesip/rosy-dreams.jpg',
            'customizations', jsonb_build_object('Size', '32 oz'),
            'price', 3480,
            'quantity', 1
          ),
          jsonb_build_object(
            'productId', 5,
            'variantId', 55,
            'name', 'Owala SmoothSip Slider - Day Break',
            'image', '/images/owala/smoothsip/day-break.jpg',
            'customizations', jsonb_build_object(),
            'price', 3150,
            'quantity', 1
          )
        ),
        jsonb_build_object(
          'firstName', 'Patricia',
          'lastName', 'Lim',
          'phone', '+63 918 112 9944',
          'email', 'patricia.lim@example.com'
        ),
        jsonb_build_object(
          'unit', '23',
          'lot', '5',
          'street', 'Laurel Street, Kapitolyo',
          'city', 'Pasig',
          'region', 'NCR',
          'zipCode', '1603',
          'country', 'Philippines'
        ),
        'UnionBank',
        6630::numeric,
        795.6::numeric,
        120::numeric,
        'UB-TRANS-552108',
        false
      ),
      (
        uuid_generate_v4()::uuid,
        v_now - interval '28 days',
        'Confirmed',
        jsonb_build_array(
          jsonb_build_object(
            'productId', 1,
            'variantId', 5,
            'name', 'Owala FreeSip Insulated Bottle - Very Very Dark',
            'image', '/images/owala/freesip/very-very-dark.jpg',
            'customizations', jsonb_build_object('Size', '24 oz'),
            'price', 3300,
            'quantity', 1
          ),
          jsonb_build_object(
            'productId', 6,
            'variantId', 72,
            'name', 'Owala FreeSip Sway 30oz - Periwinkle Twinkle',
            'image', '/images/owala/freesip-sway/periwinkle-twinkle.jpg',
            'customizations', jsonb_build_object('Size', '30 oz'),
            'price', 3600,
            'quantity', 1
          )
        ),
        jsonb_build_object(
          'firstName', 'Jerome',
          'lastName', 'Perez',
          'phone', '+63 915 777 4123',
          'email', 'jerome.perez@example.com'
        ),
        jsonb_build_object(
          'unit', NULL,
          'lot', '18',
          'street', 'Blk 4 Villa Mercedes, Brgy. Santo Niño',
          'city', 'Marikina',
          'region', 'NCR',
          'zipCode', '1810',
          'country', 'Philippines'
        ),
        'GCash',
        6900::numeric,
        828::numeric,
        120::numeric,
        'GCASH-REF-031245',
        false
      ),
      (
        uuid_generate_v4()::uuid,
        v_now - interval '16 days',
        'Out for Delivery',
        jsonb_build_array(
          jsonb_build_object(
            'productId', 3,
            'variantId', 31,
            'name', 'Starbucks x Owala FreeSip Series - Starbucks White',
            'image', '/images/owala/freesip/starbucks-white.jpg',
            'customizations', jsonb_build_object('Size', '24 oz'),
            'price', 3650,
            'quantity', 1
          ),
          jsonb_build_object(
            'productId', 4,
            'variantId', 41,
            'name', 'Owala FreeSip 32oz Exclusives - Peachy Rose',
            'image', '/images/owala/freesip/peachy-rose.jpg',
            'customizations', jsonb_build_object('Size', '32 oz'),
            'price', 3480,
            'quantity', 1
          ),
          jsonb_build_object(
            'productId', 5,
            'variantId', 52,
            'name', 'Owala SmoothSip Slider - Bubblegum',
            'image', '/images/owala/smoothsip/bubblegum.jpg',
            'customizations', jsonb_build_object(),
            'price', 3150,
            'quantity', 1
          )
        ),
        jsonb_build_object(
          'firstName', 'Cheska',
          'lastName', 'Delos Santos',
          'phone', '+63 927 889 4410',
          'email', 'cheska.ds@example.com'
        ),
        jsonb_build_object(
          'unit', '3',
          'lot', '9',
          'street', 'Greenfields Phase 2, Molino Blvd.',
          'city', 'Bacoor',
          'region', 'CALABARZON',
          'zipCode', '4102',
          'country', 'Philippines'
        ),
        'BPI',
        10280::numeric,
        1233.6::numeric,
        180::numeric,
        'BPI-ONLINE-991204',
        true
      ),
      (
        uuid_generate_v4()::uuid,
        v_now - interval '6 days',
        'For Evaluation',
        jsonb_build_array(
          jsonb_build_object(
            'productId', 6,
            'variantId', 70,
            'name', 'Owala FreeSip Sway 30oz - Very Very Dark',
            'image', '/images/owala/freesip-sway/very-very-dark.jpg',
            'customizations', jsonb_build_object('Size', '30 oz'),
            'price', 3600,
            'quantity', 2
          )
        ),
        jsonb_build_object(
          'firstName', 'Louise',
          'lastName', 'Fernando',
          'phone', '+63 926 444 1109',
          'email', 'louise.fernando@example.com'
        ),
        jsonb_build_object(
          'unit', NULL,
          'lot', '21',
          'street', 'Phase 7, Camella Dasmariñas',
          'city', 'Dasmariñas',
          'region', 'CALABARZON',
          'zipCode', '4114',
          'country', 'Philippines'
        ),
        'Cash on Delivery',
        7200::numeric,
        864::numeric,
        200::numeric,
        NULL,
        false
      )
    ) AS orders(
      id,
      order_date,
      status,
      items,
      customer,
      delivery,
      payment_method,
      subtotal,
      vat,
      shipping_fee,
      proof_of_payment,
      is_read
    )
  LOOP
    v_order_id := v_order.id;

    INSERT INTO public.orders (
      id,
      created_at,
      status,
      order_items,
      customer_first_name,
      customer_last_name,
      customer_phone,
      customer_email,
      delivery_unit,
      delivery_lot,
      delivery_street,
      delivery_city,
      delivery_region,
      delivery_zip_code,
      delivery_country,
      payment_method,
      proof_of_payment_url,
      subtotal,
      vat,
      shipping_fee,
      total,
      is_read,
      inventory_adjusted
    )
    VALUES (
      v_order_id,
      v_order.order_date,
      v_order.status,
      v_order.items,
      v_order.customer->>'firstName',
      v_order.customer->>'lastName',
      v_order.customer->>'phone',
      v_order.customer->>'email',
      NULLIF(v_order.delivery->>'unit',''),
      NULLIF(v_order.delivery->>'lot',''),
      v_order.delivery->>'street',
      v_order.delivery->>'city',
      v_order.delivery->>'region',
      v_order.delivery->>'zipCode',
      v_order.delivery->>'country',
      v_order.payment_method,
      v_order.proof_of_payment,
      v_order.subtotal,
      v_order.vat,
      v_order.shipping_fee,
      v_order.subtotal + v_order.vat + v_order.shipping_fee,
      v_order.is_read,
      FALSE
    )
    ON CONFLICT (id) DO UPDATE
      SET status = EXCLUDED.status,
          order_items = EXCLUDED.order_items,
          payment_method = EXCLUDED.payment_method,
          proof_of_payment_url = EXCLUDED.proof_of_payment_url,
          subtotal = EXCLUDED.subtotal,
          vat = EXCLUDED.vat,
          shipping_fee = EXCLUDED.shipping_fee,
          total = EXCLUDED.total,
          is_read = EXCLUDED.is_read,
          inventory_adjusted = EXCLUDED.inventory_adjusted,
          updated_at = EXCLUDED.created_at;
  END LOOP;
END $$;

COMMIT;