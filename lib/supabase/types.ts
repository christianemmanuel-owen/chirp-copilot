export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      instagram_connections: {
        Row: {
          id: string
          page_id: string
          page_name: string | null
          page_access_token: string
          instagram_business_account_id: string
          instagram_username: string | null
          user_access_token: string
          user_access_token_expires_at: string | null
          scopes: string[]
          status: string
          metadata: any
          connected_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          page_id: string
          page_name?: string | null
          page_access_token: string
          instagram_business_account_id: string
          instagram_username?: string | null
          user_access_token: string
          user_access_token_expires_at?: string | null
          scopes?: string[]
          status?: string
          metadata?: any
          connected_at?: string
          updated_at?: string
        }
        Update: {
          page_id?: string
          page_name?: string | null
          page_access_token?: string
          instagram_business_account_id?: string
          instagram_username?: string | null
          user_access_token?: string
          user_access_token_expires_at?: string | null
          scopes?: string[]
          status?: string
          metadata?: any
          connected_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      instagram_oauth_sessions: {
        Row: {
          id: string
          state: string
          long_lived_user_token: string
          long_lived_user_token_expires_at: string | null
          pages: any
          metadata: any
          created_at: string
          updated_at: string
          expires_at: string
          consumed_at: string | null
        }
        Insert: {
          id?: string
          state: string
          long_lived_user_token: string
          long_lived_user_token_expires_at?: string | null
          pages: any
          metadata?: any
          created_at?: string
          updated_at?: string
          expires_at?: string
          consumed_at?: string | null
        }
        Update: {
          state?: string
          long_lived_user_token?: string
          long_lived_user_token_expires_at?: string | null
          pages?: any
          metadata?: any
          created_at?: string
          updated_at?: string
          expires_at?: string
          consumed_at?: string | null
        }
        Relationships: []
      }
      chatbot_conversations: {
        Row: {
          id: string
          connection_id: string
          instagram_user_id: string
          instagram_username: string | null
          stage: string
          context: any
          cart: any
          last_user_message: string | null
          last_bot_message: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          connection_id: string
          instagram_user_id: string
          instagram_username?: string | null
          stage?: string
          context?: any
          cart?: any
          last_user_message?: string | null
          last_bot_message?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          connection_id?: string
          instagram_user_id?: string
          instagram_username?: string | null
          stage?: string
          context?: any
          cart?: any
          last_user_message?: string | null
          last_bot_message?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_conversations_connection_id_fkey"
            columns: ["connection_id"]
            referencedRelation: "instagram_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_messages: {
        Row: {
          id: string
          connection_id: string
          conversation_id: string
          instagram_message_id: string
          sender_id: string
          sender_name: string | null
          sender_username: string | null
          is_from_page: boolean
          message_text: string | null
          attachments: any
          sent_at: string
          created_at: string
        }
        Insert: {
          id?: string
          connection_id: string
          conversation_id: string
          instagram_message_id: string
          sender_id: string
          sender_name?: string | null
          sender_username?: string | null
          is_from_page?: boolean
          message_text?: string | null
          attachments?: any
          sent_at: string
          created_at?: string
        }
        Update: {
          connection_id?: string
          conversation_id?: string
          instagram_message_id?: string
          sender_id?: string
          sender_name?: string | null
          sender_username?: string | null
          is_from_page?: boolean
          message_text?: string | null
          attachments?: any
          sent_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "instagram_messages_connection_id_fkey"
            columns: ["connection_id"]
            referencedRelation: "instagram_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          id: number
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: number
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: number
          name: string
          image_url: string | null
          brand_id: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          image_url?: string | null
          brand_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          image_url?: string | null
          brand_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          product_id: number
          category_id: number
          created_at: string
        }
        Insert: {
          product_id: number
          category_id: number
          created_at?: string
        }
        Update: {
          product_id?: number
          category_id?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          id: number
          product_id: number
          sku: string | null
          color: string | null
          image_url: string | null
          description: string | null
          is_preorder: boolean
          is_active: boolean
          preorder_down_payment_type: string
          preorder_down_payment_value: number | null
          preorder_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          product_id: number
          sku?: string | null
          color?: string | null
          image_url?: string | null
          description?: string | null
          is_preorder?: boolean
          is_active?: boolean
          preorder_down_payment_type?: string
          preorder_down_payment_value?: number | null
          preorder_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          product_id?: number
          sku?: string | null
          color?: string | null
          image_url?: string | null
          description?: string | null
          is_preorder?: boolean
          is_active?: boolean
          preorder_down_payment_type?: string
          preorder_down_payment_value?: number | null
          preorder_message?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      variant_sizes: {
        Row: {
          id: number
          variant_id: number
          size: string | null
          price: number
          stock_quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          variant_id: number
          size?: string | null
          price: number
          stock_quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          variant_id?: number
          size?: string | null
          price?: number
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "variant_sizes_variant_id_fkey"
            columns: ["variant_id"]
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_campaigns: {
        Row: {
          id: string
          name: string
          description: string | null
          banner_image_url: string | null
          start_date: string
          end_date: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          banner_image_url?: string | null
          start_date: string
          end_date: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          banner_image_url?: string | null
          start_date?: string
          end_date?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      discount_campaign_variants: {
        Row: {
          id: number
          campaign_id: string
          variant_id: number
          discount_percent: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          campaign_id: string
          variant_id: number
          discount_percent: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          variant_id?: number
          discount_percent?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discount_campaign_variants_campaign_id_fkey"
            columns: ["campaign_id"]
            referencedRelation: "discount_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_campaign_variants_variant_id_fkey"
            columns: ["variant_id"]
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          id: string
          provider: string
          account_name: string | null
          instructions: string | null
          qr_code_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider: string
          account_name?: string | null
          instructions?: string | null
          qr_code_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          provider?: string
          account_name?: string | null
          instructions?: string | null
          qr_code_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      storefront_settings: {
        Row: {
          id: number
          home_collection_mode: string
          home_banner_manual_product_ids: number[]
          highlight_popular_hero: boolean
          highlight_latest_hero: boolean
          nav_collections_enabled: boolean
          favicon_url: string | null
          theme_config: Json
          shipping_default_fee: number
          shipping_region_overrides: Json
          vat_enabled: boolean
          pickup_enabled: boolean
          pickup_location_name: string | null
          pickup_location_unit: string | null
          pickup_location_lot: string | null
          pickup_location_street: string | null
          pickup_location_city: string | null
          pickup_location_region: string | null
          pickup_location_zip_code: string | null
          pickup_location_country: string | null
          pickup_location_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          home_collection_mode?: string
          home_banner_manual_product_ids?: number[]
          highlight_popular_hero?: boolean
          highlight_latest_hero?: boolean
          nav_collections_enabled?: boolean
          favicon_url?: string | null
          theme_config?: Json
          shipping_default_fee?: number
          shipping_region_overrides?: Json
          vat_enabled?: boolean
          pickup_enabled?: boolean
          pickup_location_name?: string | null
          pickup_location_unit?: string | null
          pickup_location_lot?: string | null
          pickup_location_street?: string | null
          pickup_location_city?: string | null
          pickup_location_region?: string | null
          pickup_location_zip_code?: string | null
          pickup_location_country?: string | null
          pickup_location_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          home_collection_mode?: string
          home_banner_manual_product_ids?: number[]
          highlight_popular_hero?: boolean
          highlight_latest_hero?: boolean
          nav_collections_enabled?: boolean
          favicon_url?: string | null
          theme_config?: Json
          shipping_default_fee?: number
          shipping_region_overrides?: Json
          vat_enabled?: boolean
          pickup_enabled?: boolean
          pickup_location_name?: string | null
          pickup_location_unit?: string | null
          pickup_location_lot?: string | null
          pickup_location_street?: string | null
          pickup_location_city?: string | null
          pickup_location_region?: string | null
          pickup_location_zip_code?: string | null
          pickup_location_country?: string | null
          pickup_location_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          payment_method: string
          proof_of_payment_url: string | null
          customer_first_name: string
          customer_last_name: string
          customer_phone: string
          customer_email: string
          instagram_handle: string | null
          delivery_unit: string | null
          delivery_lot: string | null
          delivery_street: string
          delivery_city: string
          delivery_region: string
          delivery_zip_code: string
          delivery_country: string
          fulfillment_method: string
          pickup_location_name: string | null
          pickup_location_unit: string | null
          pickup_location_lot: string | null
          pickup_location_street: string | null
          pickup_location_city: string | null
          pickup_location_region: string | null
          pickup_location_zip_code: string | null
          pickup_location_country: string | null
          pickup_location_notes: string | null
          pickup_scheduled_date: string | null
          pickup_scheduled_time: string | null
          order_items: any
          subtotal: number
          vat: number
          shipping_fee: number
          total: number
          tracking_id: string | null
          status: string
          is_read: boolean
          inventory_adjusted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          payment_method: string
          proof_of_payment_url?: string | null
          customer_first_name: string
          customer_last_name: string
          customer_phone: string
          customer_email: string
          instagram_handle?: string | null
          delivery_unit?: string | null
          delivery_lot?: string | null
          delivery_street: string
          delivery_city: string
          delivery_region: string
          delivery_zip_code: string
          delivery_country: string
          fulfillment_method?: string
          pickup_location_name?: string | null
          pickup_location_unit?: string | null
          pickup_location_lot?: string | null
          pickup_location_street?: string | null
          pickup_location_city?: string | null
          pickup_location_region?: string | null
          pickup_location_zip_code?: string | null
          pickup_location_country?: string | null
          pickup_location_notes?: string | null
          pickup_scheduled_date?: string | null
          pickup_scheduled_time?: string | null
          order_items: any
          subtotal: number
          vat: number
          shipping_fee: number
          total: number
          tracking_id?: string | null
          status?: string
          is_read?: boolean
          inventory_adjusted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          payment_method?: string
          proof_of_payment_url?: string | null
          customer_first_name?: string
          customer_last_name?: string
          customer_phone?: string
          customer_email?: string
          instagram_handle?: string | null
          delivery_unit?: string | null
          delivery_lot?: string | null
          delivery_street?: string
          delivery_city?: string
          delivery_region?: string
          delivery_zip_code?: string
          delivery_country?: string
          fulfillment_method?: string
          pickup_location_name?: string | null
          pickup_location_unit?: string | null
          pickup_location_lot?: string | null
          pickup_location_street?: string | null
          pickup_location_city?: string | null
          pickup_location_region?: string | null
          pickup_location_zip_code?: string | null
          pickup_location_country?: string | null
          pickup_location_notes?: string | null
          pickup_scheduled_date?: string | null
          pickup_scheduled_time?: string | null
          order_items?: any
          subtotal?: number
          vat?: number
          shipping_fee?: number
          total?: number
          tracking_id?: string | null
          status?: string
          is_read?: boolean
          inventory_adjusted?: boolean
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
