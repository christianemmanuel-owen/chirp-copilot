import { sqliteTable, text, integer, real, primaryKey, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

// --- Multitenancy: Projects Table ---
export const projects = sqliteTable("projects", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(), // e.g. "my-store" for subdomain or path
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

// --- Brands ---
export const brands = sqliteTable("brands", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
    nameUnique: uniqueIndex("brands_name_project_unique").on(table.projectId, table.name),
}));

// --- Categories ---
export const categories = sqliteTable("categories", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
    nameUnique: uniqueIndex("categories_name_project_unique").on(table.projectId, table.name),
}));

// --- Products ---
export const products = sqliteTable("products", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    imageUrl: text("image_url"),
    brandId: integer("brand_id").references(() => brands.id, { onDelete: "set null" }),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

// --- Product Categories (Join Table) ---
export const productCategories = sqliteTable("product_categories", {
    productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    categoryId: integer("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
}, (table) => ({
    pk: primaryKey({ columns: [table.productId, table.categoryId] }),
}));

// --- Product Variants ---
export const productVariants = sqliteTable("product_variants", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    sku: text("sku"),
    color: text("color"),
    imageUrl: text("image_url"),
    description: text("description"),
    isPreorder: integer("is_preorder", { mode: "boolean" }).notNull().default(false),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    preorderDownPaymentType: text("preorder_down_payment_type").notNull().default("none"),
    preorderDownPaymentValue: real("preorder_down_payment_value"),
    preorderMessage: text("preorder_message"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

// --- Variant Sizes ---
export const variantSizes = sqliteTable("variant_sizes", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    variantId: integer("variant_id").notNull().references(() => productVariants.id, { onDelete: "cascade" }),
    size: text("size"),
    price: real("price").notNull(),
    stockQuantity: integer("stock_quantity").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

// --- Orders ---
export const orders = sqliteTable("orders", {
    id: text("id").primaryKey(),
    projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    paymentMethod: text("payment_method").notNull(),
    proofOfPaymentUrl: text("proof_of_payment_url"),
    customerFirstName: text("customer_first_name").notNull(),
    customerLastName: text("customer_last_name").notNull(),
    customerPhone: text("customer_phone").notNull(),
    customerEmail: text("customer_email").notNull(),
    instagramHandle: text("instagram_handle"),
    deliveryUnit: text("delivery_unit"),
    deliveryLot: text("delivery_lot"),
    deliveryStreet: text("delivery_street").notNull(),
    deliveryCity: text("delivery_city").notNull(),
    deliveryRegion: text("delivery_region").notNull(),
    deliveryZipCode: text("delivery_zip_code").notNull(),
    deliveryCountry: text("delivery_country").notNull(),
    fulfillmentMethod: text("fulfillment_method").notNull().default("delivery"),
    pickupLocationName: text("pickup_location_name"),
    pickupLocationUnit: text("pickup_location_unit"),
    pickupLocationLot: text("pickup_location_lot"),
    pickupLocationStreet: text("pickup_location_street"),
    pickupLocationCity: text("pickup_location_city"),
    pickupLocationRegion: text("pickup_location_region"),
    pickupLocationZipCode: text("pickup_location_zip_code"),
    pickupLocationCountry: text("pickup_location_country").default("Philippines"),
    pickupLocationNotes: text("pickup_location_notes"),
    pickupScheduledDate: text("pickup_scheduled_date"),
    pickupScheduledTime: text("pickup_scheduled_time"),
    orderItems: text("order_items", { mode: "json" }).notNull().default("[]"),
    subtotal: real("subtotal").notNull().default(0),
    vat: real("vat").notNull().default(0),
    shippingFee: real("shipping_fee").notNull().default(0),
    total: real("total").notNull().default(0),
    trackingId: text("tracking_id"),
    status: text("status").notNull().default("For Evaluation"),
    isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
    inventoryAdjusted: integer("inventory_adjusted", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

// --- Storefront Settings ---
export const storefrontSettings = sqliteTable("storefront_settings", {
    projectId: text("project_id").primaryKey().references(() => projects.id, { onDelete: "cascade" }),
    homeCollectionMode: text("home_collection_mode").notNull().default("brand"),
    homeBannerManualProductIds: text("home_banner_manual_product_ids", { mode: "json" }).notNull().default("[]"),
    highlightPopularHero: integer("highlight_popular_hero", { mode: "boolean" }).notNull().default(true),
    highlightLatestHero: integer("highlight_latest_hero", { mode: "boolean" }).notNull().default(true),
    navCollectionsEnabled: integer("nav_collections_enabled", { mode: "boolean" }).notNull().default(true),
    faviconUrl: text("favicon_url"),
    themeConfig: text("theme_config", { mode: "json" }).notNull().default("{}"),
    shippingDefaultFee: real("shipping_default_fee").notNull().default(0),
    shippingRegionOverrides: text("shipping_region_overrides", { mode: "json" }).notNull().default("{}"),
    vatEnabled: integer("vat_enabled", { mode: "boolean" }).notNull().default(true),
    pickupEnabled: integer("pickup_enabled", { mode: "boolean" }).notNull().default(false),
    pickupLocationName: text("pickup_location_name"),
    pickupLocationUnit: text("pickup_location_unit"),
    pickupLocationLot: text("pickup_location_lot"),
    pickupLocationStreet: text("pickup_location_street"),
    pickupLocationCity: text("pickup_location_city"),
    pickupLocationRegion: text("pickup_location_region"),
    pickupLocationZipCode: text("pickup_location_zip_code"),
    pickupLocationCountry: text("pickup_location_country").default("Philippines"),
    pickupLocationNotes: text("pickup_location_notes"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

// --- Payment Methods ---
export const paymentMethods = sqliteTable("payment_methods", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    accountName: text("account_name"),
    instructions: text("instructions"),
    qrCodeUrl: text("qr_code_url").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
    providerUnique: uniqueIndex("payment_methods_provider_project_unique").on(table.projectId, table.provider),
}));

// --- Auth: Users & Membership ---
export const users = sqliteTable("users", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: text("email").notNull().unique(),
    name: text("name"),
    hashedPassword: text("hashed_password"), // If not using OAuth
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const userProjects = sqliteTable("user_projects", {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("member"), // "owner", "admin", "member"
}, (table) => ({
    pk: primaryKey({ columns: [table.userId, table.projectId] }),
}));

// --- Instagram Integrations ---
export const instagramConnections = sqliteTable("instagram_connections", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    pageId: text("page_id").notNull().unique(),
    pageName: text("page_name"),
    pageAccessToken: text("page_access_token").notNull(),
    instagramBusinessAccountId: text("instagram_business_account_id").notNull().unique(),
    instagramUsername: text("instagram_username"),
    userAccessToken: text("user_access_token").notNull(),
    userAccessTokenExpiresAt: integer("user_access_token_expires_at", { mode: "timestamp" }),
    scopes: text("scopes", { mode: "json" }).notNull().default("[]"), // Array of strings
    status: text("status").notNull().default("connected"),
    metadata: text("metadata", { mode: "json" }).notNull().default("{}"),
    connectedAt: integer("connected_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const instagramOAuthSessions = sqliteTable("instagram_oauth_sessions", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    state: text("state").notNull().unique(),
    longLivedUserToken: text("long_lived_user_token").notNull(),
    longLivedUserTokenExpiresAt: integer("long_lived_user_token_expires_at", { mode: "timestamp" }),
    pages: text("pages", { mode: "json" }).notNull(),
    metadata: text("metadata", { mode: "json" }).notNull().default("{}"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    consumedAt: integer("consumed_at", { mode: "timestamp" }),
});

export const chatbotConversations = sqliteTable("chatbot_conversations", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    connectionId: text("connection_id").notNull().references(() => instagramConnections.id, { onDelete: "cascade" }),
    instagramUserId: text("instagram_user_id").notNull(),
    instagramUsername: text("instagram_username"),
    stage: text("stage").notNull().default("initial"),
    context: text("context", { mode: "json" }).notNull().default("{}"),
    cart: text("cart", { mode: "json" }).notNull().default("[]"),
    lastUserMessage: text("last_user_message"),
    lastBotMessage: text("last_bot_message"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const instagramMessages = sqliteTable("instagram_messages", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    connectionId: text("connection_id").notNull().references(() => instagramConnections.id, { onDelete: "cascade" }),
    conversationId: text("conversation_id").notNull(),
    instagramMessageId: text("instagram_message_id").notNull(),
    senderId: text("sender_id").notNull(),
    senderName: text("sender_name"),
    senderUsername: text("sender_username"),
    isFromPage: integer("is_from_page", { mode: "boolean" }).notNull().default(false),
    messageText: text("message_text"),
    attachments: text("attachments", { mode: "json" }).notNull().default("[]"),
    sentAt: integer("sent_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
    uniqueMsg: uniqueIndex("instagram_messages_unique_msg").on(table.connectionId, table.instagramMessageId),
    conversationIdx: index("instagram_messages_conversation_idx").on(table.connectionId, table.conversationId),
    sentAtIdx: index("instagram_messages_sent_at_idx").on(table.sentAt),
}));

// --- Discount Campaigns ---
export const discountCampaigns = sqliteTable("discount_campaigns", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    bannerImageUrl: text("banner_image_url"),
    startDate: integer("start_date", { mode: "timestamp" }).notNull(),
    endDate: integer("end_date", { mode: "timestamp" }).notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const discountCampaignVariants = sqliteTable("discount_campaign_variants", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    campaignId: text("campaign_id").notNull().references(() => discountCampaigns.id, { onDelete: "cascade" }),
    variantId: integer("variant_id").notNull().references(() => productVariants.id, { onDelete: "cascade" }),
    discountPercent: real("discount_percent").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
    uniqueVariant: uniqueIndex("dc_variant_unique").on(table.campaignId, table.variantId),
}));

// --- Feature Entitlements & Maintenance ---

/**
 * Entitlements for specific projects.
 * Used to enable/disable features like "omnichannel" or "analytics" on a per-project basis.
 */
export const projectFeatures = sqliteTable("project_features", {
    projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    featureKey: text("feature_key").notNull(), // e.g. "omnichannel", "advanced-analytics"
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(false),
    expiresAt: integer("expires_at", { mode: "timestamp" }),
    metadata: text("metadata", { mode: "json" }).notNull().default("{}"),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
    pk: primaryKey({ columns: [table.projectId, table.featureKey] }),
}));

/**
 * Global maintenance toggles for features.
 * Used by developers to disable features for fixes without affecting user subscriptions.
 */
export const maintenanceOverrides = sqliteTable("maintenance_overrides", {
    featureKey: text("feature_key").primaryKey(), // e.g. "omnichannel", "all"
    isDisabled: integer("is_disabled", { mode: "boolean" }).notNull().default(false),
    message: text("message"), // Optional message to show users (e.g. "Currently down for maintenance")
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

// --- Relations ---

export const projectsRelations = relations(projects, ({ many, one }) => ({
    brands: many(brands),
    categories: many(categories),
    products: many(products),
    orders: many(orders),
    storefrontSettings: one(storefrontSettings, {
        fields: [projects.id],
        references: [storefrontSettings.projectId],
    }),
    paymentMethods: many(paymentMethods),
    instagramConnections: many(instagramConnections),
    instagramMessages: many(instagramMessages),
    discountCampaigns: many(discountCampaigns),
    projectFeatures: many(projectFeatures),
}));

export const projectFeaturesRelations = relations(projectFeatures, ({ one }) => ({
    project: one(projects, {
        fields: [projectFeatures.projectId],
        references: [projects.id],
    }),
}));

export const brandsRelations = relations(brands, ({ one, many }) => ({
    project: one(projects, {
        fields: [brands.projectId],
        references: [projects.id],
    }),
    products: many(products),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
    project: one(projects, {
        fields: [categories.projectId],
        references: [projects.id],
    }),
    productCategories: many(productCategories),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
    project: one(projects, {
        fields: [products.projectId],
        references: [projects.id],
    }),
    brand: one(brands, {
        fields: [products.brandId],
        references: [brands.id],
    }),
    productCategories: many(productCategories),
    variants: many(productVariants),
}));

export const productCategoriesRelations = relations(productCategories, ({ one }) => ({
    product: one(products, {
        fields: [productCategories.productId],
        references: [products.id],
    }),
    category: one(categories, {
        fields: [productCategories.categoryId],
        references: [categories.id],
    }),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
    product: one(products, {
        fields: [productVariants.productId],
        references: [products.id],
    }),
    sizes: many(variantSizes),
    discountCampaignVariants: many(discountCampaignVariants),
}));

export const variantSizesRelations = relations(variantSizes, ({ one }) => ({
    variant: one(productVariants, {
        fields: [variantSizes.variantId],
        references: [productVariants.id],
    }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
    project: one(projects, {
        fields: [orders.projectId],
        references: [projects.id],
    }),
}));

export const storefrontSettingsRelations = relations(storefrontSettings, ({ one }) => ({
    project: one(projects, {
        fields: [storefrontSettings.projectId],
        references: [projects.id],
    }),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
    project: one(projects, {
        fields: [paymentMethods.projectId],
        references: [projects.id],
    }),
}));

export const instagramConnectionsRelations = relations(instagramConnections, ({ one, many }) => ({
    project: one(projects, {
        fields: [instagramConnections.projectId],
        references: [projects.id],
    }),
    chatbotConversations: many(chatbotConversations),
    messages: many(instagramMessages),
}));

export const instagramMessagesRelations = relations(instagramMessages, ({ one }) => ({
    project: one(projects, {
        fields: [instagramMessages.projectId],
        references: [projects.id],
    }),
    connection: one(instagramConnections, {
        fields: [instagramMessages.connectionId],
        references: [instagramConnections.id],
    }),
}));

export const instagramOAuthSessionsRelations = relations(instagramOAuthSessions, ({ one }) => ({
    project: one(projects, {
        fields: [instagramOAuthSessions.projectId],
        references: [projects.id],
    }),
}));

export const chatbotConversationsRelations = relations(chatbotConversations, ({ one }) => ({
    project: one(projects, {
        fields: [chatbotConversations.projectId],
        references: [projects.id],
    }),
    connection: one(instagramConnections, {
        fields: [chatbotConversations.connectionId],
        references: [instagramConnections.id],
    }),
}));

export const discountCampaignsRelations = relations(discountCampaigns, ({ one, many }) => ({
    project: one(projects, {
        fields: [discountCampaigns.projectId],
        references: [projects.id],
    }),
    variants: many(discountCampaignVariants),
}));

export const discountCampaignVariantsRelations = relations(discountCampaignVariants, ({ one }) => ({
    campaign: one(discountCampaigns, {
        fields: [discountCampaignVariants.campaignId],
        references: [discountCampaigns.id],
    }),
    variant: one(productVariants, {
        fields: [discountCampaignVariants.variantId],
        references: [productVariants.id],
    }),
}));
