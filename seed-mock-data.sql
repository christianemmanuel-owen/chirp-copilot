-- Seed Mock Data for Chirp D1 Database

-- 1. Create a Sample Project
-- ID: 550e8400-e29b-41d4-a716-446655440000
-- Slug: sample-store
INSERT INTO projects (id, name, slug) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Chirp Sample Store', 'sample-store');

-- 2. Create a Sample User
-- ID: 660e8400-e29b-41d4-a716-446655440000
VALUES ('660e8400-e29b-41d4-a716-446655440000', 'admin@example.com', 'Sample Admin', '$2b$10$Tv8tR.yAewP7QAJEd6l67uD6mngpDFcg5ErBIRaZJHBxM5r2/HyDC');

-- 3. Link User to Project
INSERT INTO user_projects (user_id, project_id, role)
VALUES ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'owner');

-- 4. Create Brands
INSERT INTO brands (id, project_id, name) VALUES (1, '550e8400-e29b-41d4-a716-446655440000', 'Nike');
INSERT INTO brands (id, project_id, name) VALUES (2, '550e8400-e29b-41d4-a716-446655440000', 'Adidas');
INSERT INTO brands (id, project_id, name) VALUES (3, '550e8400-e29b-41d4-a716-446655440000', 'TechGear');

-- 5. Create Categories
INSERT INTO categories (id, project_id, name) VALUES (1, '550e8400-e29b-41d4-a716-446655440000', 'Footwear');
INSERT INTO categories (id, project_id, name) VALUES (2, '550e8400-e29b-41d4-a716-446655440000', 'Apparel');
INSERT INTO categories (id, project_id, name) VALUES (3, '550e8400-e29b-41d4-a716-446655440000', 'Electronics');

-- 6. Create Products
INSERT INTO products (id, project_id, name, brand_id, image_url) 
VALUES (1, '550e8400-e29b-41d4-a716-446655440000', 'Air Max 270', 1, 'https://images.unsplash.com/photo-1542291026-7eec264c274d');
INSERT INTO products (id, project_id, name, brand_id, image_url) 
VALUES (2, '550e8400-e29b-41d4-a716-446655440000', 'Ultra Boost', 2, 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb');
INSERT INTO products (id, project_id, name, brand_id, image_url) 
VALUES (3, '550e8400-e29b-41d4-a716-446655440000', 'Smart Watch X', 3, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30');

-- 7. Link Products to Categories
INSERT INTO product_categories (product_id, category_id) VALUES (1, 1);
INSERT INTO product_categories (product_id, category_id) VALUES (2, 1);
INSERT INTO product_categories (product_id, category_id) VALUES (3, 3);

-- 8. Create Product Variants & Sizes
INSERT INTO product_variants (id, product_id, sku, color, is_active) VALUES (1, 1, 'NIKE-AM270-RED', 'University Red', 1);
INSERT INTO variant_sizes (variant_id, size, price, stock_quantity) VALUES (1, 'US 10', 150.00, 50);
INSERT INTO variant_sizes (variant_id, size, price, stock_quantity) VALUES (1, 'US 11', 150.00, 30);

INSERT INTO product_variants (id, product_id, sku, color, is_active) VALUES (2, 2, 'ADI-UB-BLK', 'Core Black', 1);
INSERT INTO variant_sizes (variant_id, size, price, stock_quantity) VALUES (2, 'US 9', 180.00, 20);

-- 9. Initialize Storefront Settings
INSERT INTO storefront_settings (project_id, home_collection_mode, theme_config)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'brand', '{"primaryColor":"#000000","fontFamily":"Inter"}');

-- 10. Enable Features (Entitlements)
INSERT INTO project_features (project_id, feature_key, is_active)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'omnichannel', 1);
