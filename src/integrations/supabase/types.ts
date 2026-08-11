export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      affiliate_campaigns: {
        Row: {
          commission_rate: number
          created_at: string
          economics_id: string | null
          ends_at: string | null
          id: string
          kind: string
          name: string
          starts_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          commission_rate?: number
          created_at?: string
          economics_id?: string | null
          ends_at?: string | null
          id?: string
          kind?: string
          name: string
          starts_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          commission_rate?: number
          created_at?: string
          economics_id?: string | null
          ends_at?: string | null
          id?: string
          kind?: string
          name?: string
          starts_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_campaigns_economics_id_fkey"
            columns: ["economics_id"]
            isOneToOne: false
            referencedRelation: "product_economics"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_clicks: {
        Row: {
          clicked_at: string
          country: string | null
          device: string | null
          id: number
          link_id: string
        }
        Insert: {
          clicked_at?: string
          country?: string | null
          device?: string | null
          id?: number
          link_id: string
        }
        Update: {
          clicked_at?: string
          country?: string | null
          device?: string | null
          id?: number
          link_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_links"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_links: {
        Row: {
          campaign_id: string | null
          clicks: number
          commission_rate: number | null
          created_at: string
          destination_handle: string
          destination_type: string
          destination_url: string
          discount_code: string | null
          expires_at: string | null
          id: string
          label: string | null
          last_click_at: string | null
          status: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          clicks?: number
          commission_rate?: number | null
          created_at?: string
          destination_handle: string
          destination_type: string
          destination_url: string
          discount_code?: string | null
          expires_at?: string | null
          id?: string
          label?: string | null
          last_click_at?: string | null
          status?: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          clicks?: number
          commission_rate?: number | null
          created_at?: string
          destination_handle?: string
          destination_type?: string
          destination_url?: string
          discount_code?: string | null
          expires_at?: string | null
          id?: string
          label?: string | null
          last_click_at?: string | null
          status?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      affiliate_policy: {
        Row: {
          default_commission_rate: number
          default_min_margin_pct: number
          id: boolean
          max_commission_rate: number
          min_commission_rate: number
          platform_allocation_rate: number
          promo_ends_at: string | null
          promo_label: string | null
          promo_max_commission_rate: number | null
          promo_starts_at: string | null
          updated_at: string
        }
        Insert: {
          default_commission_rate?: number
          default_min_margin_pct?: number
          id?: boolean
          max_commission_rate?: number
          min_commission_rate?: number
          platform_allocation_rate?: number
          promo_ends_at?: string | null
          promo_label?: string | null
          promo_max_commission_rate?: number | null
          promo_starts_at?: string | null
          updated_at?: string
        }
        Update: {
          default_commission_rate?: number
          default_min_margin_pct?: number
          id?: boolean
          max_commission_rate?: number
          min_commission_rate?: number
          platform_allocation_rate?: number
          promo_ends_at?: string | null
          promo_label?: string | null
          promo_max_commission_rate?: number | null
          promo_starts_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      affiliate_profiles: {
        Row: {
          created_at: string
          default_commission_rate: number
          display_name: string | null
          notes: string | null
          payout_destination_masked: string | null
          payout_method: string | null
          payout_status: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_commission_rate?: number
          display_name?: string | null
          notes?: string | null
          payout_destination_masked?: string | null
          payout_method?: string | null
          payout_status?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_commission_rate?: number
          display_name?: string | null
          notes?: string | null
          payout_destination_masked?: string | null
          payout_method?: string | null
          payout_status?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_credit_ledger: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          direction: string
          id: string
          label: string
          metadata: Json
          operation_key: string | null
          processing_ms: number | null
          project_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          direction: string
          id?: string
          label: string
          metadata?: Json
          operation_key?: string | null
          processing_ms?: number | null
          project_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          direction?: string
          id?: string
          label?: string
          metadata?: Json
          operation_key?: string | null
          processing_ms?: number | null
          project_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_credit_wallets: {
        Row: {
          balance: number
          created_at: string
          lifetime_earned: number
          lifetime_gifted: number
          lifetime_purchased: number
          lifetime_used: number
          monthly_allowance: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          lifetime_earned?: number
          lifetime_gifted?: number
          lifetime_purchased?: number
          lifetime_used?: number
          monthly_allowance?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          lifetime_earned?: number
          lifetime_gifted?: number
          lifetime_purchased?: number
          lifetime_used?: number
          monthly_allowance?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string | null
          body: string | null
          cover_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          published_at: string | null
          slug: string
          tag: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          body?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          tag?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          body?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          tag?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      builder_collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      builder_drops: {
        Row: {
          created_at: string
          description: string | null
          drop_date: string | null
          id: string
          name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          drop_date?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          drop_date?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      builder_finance_entries: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          currency: string
          entry_type: string
          id: string
          label: string
          occurred_on: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          category?: string | null
          created_at?: string
          currency?: string
          entry_type?: string
          id?: string
          label: string
          occurred_on?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          currency?: string
          entry_type?: string
          id?: string
          label?: string
          occurred_on?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      builder_journey_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          stage: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          stage: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          stage?: string
          user_id?: string
        }
        Relationships: []
      }
      builder_journeys: {
        Row: {
          completed_at: string | null
          created_at: string
          current_stage: string
          last_active_at: string
          stage_progress: Json
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_stage?: string
          last_active_at?: string
          stage_progress?: Json
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_stage?: string
          last_active_at?: string
          stage_progress?: Json
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      builder_learning_events: {
        Row: {
          artifact_url: string | null
          created_at: string
          detail: string | null
          id: string
          kind: string
          lesson_id: string | null
          path_id: string | null
          skills: string[]
          title: string
          user_id: string
        }
        Insert: {
          artifact_url?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          kind?: string
          lesson_id?: string | null
          path_id?: string | null
          skills?: string[]
          title: string
          user_id: string
        }
        Update: {
          artifact_url?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          kind?: string
          lesson_id?: string | null
          path_id?: string | null
          skills?: string[]
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      builder_memory: {
        Row: {
          category: string
          created_at: string
          id: string
          key: string
          source: string
          updated_at: string
          user_id: string
          value: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          key: string
          source?: string
          updated_at?: string
          user_id: string
          value: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          key?: string
          source?: string
          updated_at?: string
          user_id?: string
          value?: string
        }
        Relationships: []
      }
      builder_opportunities: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          effort: string
          id: string
          kind: string
          next_step: string | null
          notes: string | null
          potential_value: number | null
          stage: string
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          effort?: string
          id?: string
          kind?: string
          next_step?: string | null
          notes?: string | null
          potential_value?: number | null
          stage?: string
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          effort?: string
          id?: string
          kind?: string
          next_step?: string | null
          notes?: string | null
          potential_value?: number | null
          stage?: string
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      builder_path_progress: {
        Row: {
          completed_at: string | null
          completed_lessons: string[]
          created_at: string
          id: string
          is_primary: boolean
          lesson_notes: Json
          path_id: string
          reflection: string | null
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_lessons?: string[]
          created_at?: string
          id?: string
          is_primary?: boolean
          lesson_notes?: Json
          path_id: string
          reflection?: string | null
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_lessons?: string[]
          created_at?: string
          id?: string
          is_primary?: boolean
          lesson_notes?: Json
          path_id?: string
          reflection?: string | null
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      builder_products: {
        Row: {
          collection_id: string | null
          created_at: string
          currency: string
          description: string | null
          drop_id: string | null
          id: string
          image_url: string | null
          price: number | null
          status: string
          tags: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          collection_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          drop_id?: string | null
          id?: string
          image_url?: string | null
          price?: number | null
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          collection_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          drop_id?: string | null
          id?: string
          image_url?: string | null
          price?: number | null
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "builder_products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "builder_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "builder_products_drop_id_fkey"
            columns: ["drop_id"]
            isOneToOne: false
            referencedRelation: "builder_drops"
            referencedColumns: ["id"]
          },
        ]
      }
      business_card_events: {
        Row: {
          card_user_id: string
          created_at: string
          detail: string | null
          id: string
          kind: string
        }
        Insert: {
          card_user_id: string
          created_at?: string
          detail?: string | null
          id?: string
          kind: string
        }
        Update: {
          card_user_id?: string
          created_at?: string
          detail?: string | null
          id?: string
          kind?: string
        }
        Relationships: []
      }
      business_cards: {
        Row: {
          accent: string
          background_url: string | null
          booking_url: string | null
          business_hours: string | null
          calendar_url: string | null
          certifications: string[]
          commerce_enabled: boolean
          company: string | null
          created_at: string
          cta_label: string | null
          cta_url: string | null
          custom_links: Json
          headline: string | null
          hero_media_url: string | null
          is_published: boolean
          job_title: string | null
          languages: string[]
          location: string | null
          payout_display_name: string | null
          payout_provider: string | null
          payout_url: string | null
          section_order: string[]
          show_contact: boolean
          social_links: Json
          theme: string
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          accent?: string
          background_url?: string | null
          booking_url?: string | null
          business_hours?: string | null
          calendar_url?: string | null
          certifications?: string[]
          commerce_enabled?: boolean
          company?: string | null
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          custom_links?: Json
          headline?: string | null
          hero_media_url?: string | null
          is_published?: boolean
          job_title?: string | null
          languages?: string[]
          location?: string | null
          payout_display_name?: string | null
          payout_provider?: string | null
          payout_url?: string | null
          section_order?: string[]
          show_contact?: boolean
          social_links?: Json
          theme?: string
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          accent?: string
          background_url?: string | null
          booking_url?: string | null
          business_hours?: string | null
          calendar_url?: string | null
          certifications?: string[]
          commerce_enabled?: boolean
          company?: string | null
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          custom_links?: Json
          headline?: string | null
          hero_media_url?: string | null
          is_published?: boolean
          job_title?: string | null
          languages?: string[]
          location?: string | null
          payout_display_name?: string | null
          payout_provider?: string | null
          payout_url?: string | null
          section_order?: string[]
          show_contact?: boolean
          social_links?: Json
          theme?: string
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      capsule_items: {
        Row: {
          capsule_id: string
          id: string
          position: number
          product_id: string
          required: boolean
          slot: string
          variant_id: string | null
        }
        Insert: {
          capsule_id: string
          id?: string
          position?: number
          product_id: string
          required?: boolean
          slot: string
          variant_id?: string | null
        }
        Update: {
          capsule_id?: string
          id?: string
          position?: number
          product_id?: string
          required?: boolean
          slot?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "capsule_items_capsule_id_fkey"
            columns: ["capsule_id"]
            isOneToOne: false
            referencedRelation: "capsules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capsule_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capsule_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      capsules: {
        Row: {
          bundle_discount_pct: number
          collection: string | null
          created_at: string
          description: string | null
          gender: string | null
          handle: string
          hero_image: string | null
          id: string
          name: string
          occasion: string | null
          position: number
          published: boolean
          season: string | null
          style: string | null
          updated_at: string
        }
        Insert: {
          bundle_discount_pct?: number
          collection?: string | null
          created_at?: string
          description?: string | null
          gender?: string | null
          handle: string
          hero_image?: string | null
          id?: string
          name: string
          occasion?: string | null
          position?: number
          published?: boolean
          season?: string | null
          style?: string | null
          updated_at?: string
        }
        Update: {
          bundle_discount_pct?: number
          collection?: string | null
          created_at?: string
          description?: string | null
          gender?: string | null
          handle?: string
          hero_image?: string | null
          id?: string
          name?: string
          occasion?: string | null
          position?: number
          published?: boolean
          season?: string | null
          style?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      card_listings: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          id: string
          image_url: string | null
          is_quick_sell: boolean
          kind: string
          price: number
          quantity: number | null
          sold: number
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_quick_sell?: boolean
          kind?: string
          price?: number
          quantity?: number | null
          sold?: number
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_quick_sell?: boolean
          kind?: string
          price?: number
          quantity?: number | null
          sold?: number
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      card_orders: {
        Row: {
          buyer_email: string | null
          buyer_name: string | null
          created_at: string
          currency: string
          id: string
          listing_id: string | null
          net_to_seller: number
          payout_provider: string | null
          platform_fee: number
          processing_fee_estimate: number
          quantity: number
          reference: string | null
          seller_id: string
          status: string
          subtotal: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          buyer_email?: string | null
          buyer_name?: string | null
          created_at?: string
          currency?: string
          id?: string
          listing_id?: string | null
          net_to_seller?: number
          payout_provider?: string | null
          platform_fee?: number
          processing_fee_estimate?: number
          quantity?: number
          reference?: string | null
          seller_id: string
          status?: string
          subtotal?: number
          unit_price?: number
          updated_at?: string
        }
        Update: {
          buyer_email?: string | null
          buyer_name?: string | null
          created_at?: string
          currency?: string
          id?: string
          listing_id?: string | null
          net_to_seller?: number
          payout_provider?: string | null
          platform_fee?: number
          processing_fee_estimate?: number
          quantity?: number
          reference?: string | null
          seller_id?: string
          status?: string
          subtotal?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_orders_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "card_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      cj_import_queue: {
        Row: {
          brand: string | null
          category: string | null
          cj_data: Json
          cj_pid: string
          created_at: string
          decided_at: string | null
          decided_by: string | null
          gender: string | null
          id: string
          image_url: string | null
          notes: string | null
          source_price: number | null
          status: string
          subcategory: string | null
          suggested_price: number | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category?: string | null
          cj_data: Json
          cj_pid: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          gender?: string | null
          id?: string
          image_url?: string | null
          notes?: string | null
          source_price?: number | null
          status?: string
          subcategory?: string | null
          suggested_price?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category?: string | null
          cj_data?: Json
          cj_pid?: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          gender?: string | null
          id?: string
          image_url?: string | null
          notes?: string | null
          source_price?: number | null
          status?: string
          subcategory?: string | null
          suggested_price?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      collection_products: {
        Row: {
          collection_id: string
          position: number
          product_id: string
        }
        Insert: {
          collection_id: string
          position?: number
          product_id: string
        }
        Update: {
          collection_id?: string
          position?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          handle: string
          hero_image: string | null
          id: string
          parent_handle: string | null
          position: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          handle: string
          hero_image?: string | null
          id?: string
          parent_handle?: string | null
          position?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          handle?: string
          hero_image?: string | null
          id?: string
          parent_handle?: string | null
          position?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      commission_adjustments: {
        Row: {
          adjusted_by: string | null
          commission_id: string
          created_at: string
          delta_amount: number
          id: string
          reason: string
          reason_note: string | null
          user_id: string
        }
        Insert: {
          adjusted_by?: string | null
          commission_id: string
          created_at?: string
          delta_amount: number
          id?: string
          reason: string
          reason_note?: string | null
          user_id: string
        }
        Update: {
          adjusted_by?: string | null
          commission_id?: string
          created_at?: string
          delta_amount?: number
          id?: string
          reason?: string
          reason_note?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_adjustments_commission_id_fkey"
            columns: ["commission_id"]
            isOneToOne: false
            referencedRelation: "commissions"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          approved_at: string | null
          attribution_source: string
          commission_amount: number
          commission_rate: number
          commissionable_amount: number
          created_at: string
          currency: string
          id: string
          link_id: string | null
          order_created_at: string
          order_total: number
          paid_at: string | null
          shopify_line_item_id: string | null
          shopify_order_id: string
          shopify_order_name: string | null
          status: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          attribution_source: string
          commission_amount: number
          commission_rate: number
          commissionable_amount: number
          created_at?: string
          currency?: string
          id?: string
          link_id?: string | null
          order_created_at: string
          order_total: number
          paid_at?: string | null
          shopify_line_item_id?: string | null
          shopify_order_id: string
          shopify_order_name?: string | null
          status?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          attribution_source?: string
          commission_amount?: number
          commission_rate?: number
          commissionable_amount?: number
          created_at?: string
          currency?: string
          id?: string
          link_id?: string | null
          order_created_at?: string
          order_total?: number
          paid_at?: string | null
          shopify_line_item_id?: string | null
          shopify_order_id?: string
          shopify_order_name?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_links"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_photos: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_primary: boolean
          label: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_primary?: boolean
          label?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_primary?: boolean
          label?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_adjustments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          currency: string
          id: string
          plain_explanation: string | null
          reason: string
          receipt_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          plain_explanation?: string | null
          reason: string
          receipt_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          plain_explanation?: string | null
          reason?: string
          receipt_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_adjustments_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "financial_receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_receipts: {
        Row: {
          counterparty_id: string | null
          counterparty_name: string | null
          created_at: string
          currency: string
          description: string | null
          direction: string
          external_id: string | null
          gross: number
          id: string
          kind: string
          metadata: Json
          net: number
          occurred_at: string
          other_deductions: number
          platform_allocation: number
          processing_fee: number
          reference: string | null
          settled_at: string | null
          source: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          counterparty_id?: string | null
          counterparty_name?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          direction?: string
          external_id?: string | null
          gross?: number
          id?: string
          kind: string
          metadata?: Json
          net?: number
          occurred_at?: string
          other_deductions?: number
          platform_allocation?: number
          processing_fee?: number
          reference?: string | null
          settled_at?: string | null
          source?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          counterparty_id?: string | null
          counterparty_name?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          direction?: string
          external_id?: string | null
          gross?: number
          id?: string
          kind?: string
          metadata?: Json
          net?: number
          occurred_at?: string
          other_deductions?: number
          platform_allocation?: number
          processing_fee?: number
          reference?: string | null
          settled_at?: string | null
          source?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      for_us_stories: {
        Row: {
          approved_by: string | null
          audience: string
          body: string | null
          categories: string[]
          created_at: string
          cta_label: string | null
          cta_to: string | null
          id: string
          impact_note: string | null
          media_kind: string
          media_url: string | null
          occurred_at: string
          origin: string
          proposed_by: string | null
          published_at: string | null
          revenue_note: string | null
          section_id: string
          series: string | null
          source_label: string
          status: string
          summary: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          audience?: string
          body?: string | null
          categories?: string[]
          created_at?: string
          cta_label?: string | null
          cta_to?: string | null
          id?: string
          impact_note?: string | null
          media_kind?: string
          media_url?: string | null
          occurred_at?: string
          origin?: string
          proposed_by?: string | null
          published_at?: string | null
          revenue_note?: string | null
          section_id?: string
          series?: string | null
          source_label?: string
          status?: string
          summary: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          audience?: string
          body?: string | null
          categories?: string[]
          created_at?: string
          cta_label?: string | null
          cta_to?: string | null
          id?: string
          impact_note?: string | null
          media_kind?: string
          media_url?: string | null
          occurred_at?: string
          origin?: string
          proposed_by?: string | null
          published_at?: string | null
          revenue_note?: string | null
          section_id?: string
          series?: string | null
          source_label?: string
          status?: string
          summary?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      frassy_notes: {
        Row: {
          archived_at: string | null
          body: string
          created_at: string
          id: string
          pinned: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          body: string
          created_at?: string
          id?: string
          pinned?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          body?: string
          created_at?: string
          id?: string
          pinned?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fraud_reports: {
        Row: {
          created_at: string
          details: string
          id: string
          kind: string
          order_reference: string | null
          reporter_id: string
          resolution: string | null
          status: string
          subject_handle: string | null
          subject_user_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          details: string
          id?: string
          kind: string
          order_reference?: string | null
          reporter_id: string
          resolution?: string | null
          status?: string
          subject_handle?: string | null
          subject_user_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: string
          id?: string
          kind?: string
          order_reference?: string | null
          reporter_id?: string
          resolution?: string | null
          status?: string
          subject_handle?: string | null
          subject_user_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      launch_program_settings: {
        Row: {
          enabled: boolean
          id: string
          notice: string | null
          updated_at: string
        }
        Insert: {
          enabled?: boolean
          id: string
          notice?: string | null
          updated_at?: string
        }
        Update: {
          enabled?: boolean
          id?: string
          notice?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      learning_activities: {
        Row: {
          age_group: string
          audio_url: string | null
          badge: Json
          category: string | null
          coloring_pages: Json
          created_at: string
          created_by: string | null
          description: string | null
          difficulty: string
          discussion_questions: Json
          district: string
          downloads: Json
          duration_minutes: number
          extras: Json
          featured: boolean
          follow_up_slugs: string[]
          hero_image: string | null
          id: string
          instructions: Json
          learning_objective: string | null
          materials: Json
          parent_guide: string | null
          place_slug: string | null
          position: number
          published_at: string | null
          quiz: Json
          reflection_questions: Json
          related_slugs: string[]
          reviewed_at: string | null
          reviewed_by: string | null
          seasonal_tags: string[]
          skills: string[]
          slides: Json
          slug: string
          status: Database["public"]["Enums"]["activity_status"]
          story: string | null
          teacher_guide: string | null
          themes: string[]
          thumbnail: string | null
          title: string
          updated_at: string
          version: number
          video_url: string | null
          worksheets: Json
        }
        Insert: {
          age_group: string
          audio_url?: string | null
          badge?: Json
          category?: string | null
          coloring_pages?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string
          discussion_questions?: Json
          district?: string
          downloads?: Json
          duration_minutes?: number
          extras?: Json
          featured?: boolean
          follow_up_slugs?: string[]
          hero_image?: string | null
          id?: string
          instructions?: Json
          learning_objective?: string | null
          materials?: Json
          parent_guide?: string | null
          place_slug?: string | null
          position?: number
          published_at?: string | null
          quiz?: Json
          reflection_questions?: Json
          related_slugs?: string[]
          reviewed_at?: string | null
          reviewed_by?: string | null
          seasonal_tags?: string[]
          skills?: string[]
          slides?: Json
          slug: string
          status?: Database["public"]["Enums"]["activity_status"]
          story?: string | null
          teacher_guide?: string | null
          themes?: string[]
          thumbnail?: string | null
          title: string
          updated_at?: string
          version?: number
          video_url?: string | null
          worksheets?: Json
        }
        Update: {
          age_group?: string
          audio_url?: string | null
          badge?: Json
          category?: string | null
          coloring_pages?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string
          discussion_questions?: Json
          district?: string
          downloads?: Json
          duration_minutes?: number
          extras?: Json
          featured?: boolean
          follow_up_slugs?: string[]
          hero_image?: string | null
          id?: string
          instructions?: Json
          learning_objective?: string | null
          materials?: Json
          parent_guide?: string | null
          place_slug?: string | null
          position?: number
          published_at?: string | null
          quiz?: Json
          reflection_questions?: Json
          related_slugs?: string[]
          reviewed_at?: string | null
          reviewed_by?: string | null
          seasonal_tags?: string[]
          skills?: string[]
          slides?: Json
          slug?: string
          status?: Database["public"]["Enums"]["activity_status"]
          story?: string | null
          teacher_guide?: string | null
          themes?: string[]
          thumbnail?: string | null
          title?: string
          updated_at?: string
          version?: number
          video_url?: string | null
          worksheets?: Json
        }
        Relationships: []
      }
      learning_activity_versions: {
        Row: {
          activity_id: string
          changed_by: string | null
          created_at: string
          id: string
          note: string | null
          snapshot: Json
          version: number
        }
        Insert: {
          activity_id: string
          changed_by?: string | null
          created_at?: string
          id?: string
          note?: string | null
          snapshot: Json
          version: number
        }
        Update: {
          activity_id?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          note?: string | null
          snapshot?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "learning_activity_versions_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "learning_activities"
            referencedColumns: ["id"]
          },
        ]
      }
      link_referrals: {
        Row: {
          business_launched_at: string | null
          created_at: string
          id: string
          invited_user_id: string | null
          landing_path: string | null
          qualified_affiliate_at: string | null
          qualified_member_at: string | null
          qualified_partner_at: string | null
          referrer_id: string
          source: string
          stage: string
          updated_at: string
        }
        Insert: {
          business_launched_at?: string | null
          created_at?: string
          id?: string
          invited_user_id?: string | null
          landing_path?: string | null
          qualified_affiliate_at?: string | null
          qualified_member_at?: string | null
          qualified_partner_at?: string | null
          referrer_id: string
          source?: string
          stage?: string
          updated_at?: string
        }
        Update: {
          business_launched_at?: string | null
          created_at?: string
          id?: string
          invited_user_id?: string | null
          landing_path?: string | null
          qualified_affiliate_at?: string | null
          qualified_member_at?: string | null
          qualified_partner_at?: string | null
          referrer_id?: string
          source?: string
          stage?: string
          updated_at?: string
        }
        Relationships: []
      }
      live_broadcasts: {
        Row: {
          affiliate_url: string | null
          cover_url: string | null
          created_at: string
          destination: string
          ended_at: string | null
          host_handle: string | null
          host_id: string
          host_name: string
          id: string
          product_links: Json
          purpose: string
          replay_url: string | null
          repurposed_as: Json
          scheduled_for: string | null
          started_at: string
          status: string
          summary: string | null
          title: string
          updated_at: string
          viewer_count: number
        }
        Insert: {
          affiliate_url?: string | null
          cover_url?: string | null
          created_at?: string
          destination?: string
          ended_at?: string | null
          host_handle?: string | null
          host_id: string
          host_name?: string
          id?: string
          product_links?: Json
          purpose?: string
          replay_url?: string | null
          repurposed_as?: Json
          scheduled_for?: string | null
          started_at?: string
          status?: string
          summary?: string | null
          title: string
          updated_at?: string
          viewer_count?: number
        }
        Update: {
          affiliate_url?: string | null
          cover_url?: string | null
          created_at?: string
          destination?: string
          ended_at?: string | null
          host_handle?: string | null
          host_id?: string
          host_name?: string
          id?: string
          product_links?: Json
          purpose?: string
          replay_url?: string | null
          repurposed_as?: Json
          scheduled_for?: string | null
          started_at?: string
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
          viewer_count?: number
        }
        Relationships: []
      }
      live_comments: {
        Row: {
          author_handle: string | null
          author_id: string
          author_name: string
          body: string
          broadcast_id: string
          created_at: string
          id: string
        }
        Insert: {
          author_handle?: string | null
          author_id: string
          author_name?: string
          body: string
          broadcast_id: string
          created_at?: string
          id?: string
        }
        Update: {
          author_handle?: string | null
          author_id?: string
          author_name?: string
          body?: string
          broadcast_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_comments_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "live_broadcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      live_gifts: {
        Row: {
          amount: number
          broadcast_id: string
          created_at: string
          credits: number
          currency: string
          gift_key: string
          id: string
          note: string | null
          sender_handle: string | null
          sender_id: string
          sender_name: string
        }
        Insert: {
          amount?: number
          broadcast_id: string
          created_at?: string
          credits?: number
          currency?: string
          gift_key: string
          id?: string
          note?: string | null
          sender_handle?: string | null
          sender_id: string
          sender_name?: string
        }
        Update: {
          amount?: number
          broadcast_id?: string
          created_at?: string
          credits?: number
          currency?: string
          gift_key?: string
          id?: string
          note?: string | null
          sender_handle?: string | null
          sender_id?: string
          sender_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_gifts_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "live_broadcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      logo_treatments: {
        Row: {
          asset_url: string
          asset_variant: string | null
          color_treatment: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          placement: Database["public"]["Enums"]["logo_placement"]
          print_method: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          size_mm: number | null
          status: Database["public"]["Enums"]["slogan_status"]
          submitted_by: string | null
          updated_at: string
        }
        Insert: {
          asset_url: string
          asset_variant?: string | null
          color_treatment?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          placement: Database["public"]["Enums"]["logo_placement"]
          print_method?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          size_mm?: number | null
          status?: Database["public"]["Enums"]["slogan_status"]
          submitted_by?: string | null
          updated_at?: string
        }
        Update: {
          asset_url?: string
          asset_variant?: string | null
          color_treatment?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          placement?: Database["public"]["Enums"]["logo_placement"]
          print_method?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          size_mm?: number | null
          status?: Database["public"]["Enums"]["slogan_status"]
          submitted_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lookbook_story_images: {
        Row: {
          alt: string | null
          created_at: string
          id: string
          position: number
          story_slug: string
          url: string
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: string
          position?: number
          story_slug: string
          url: string
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: string
          position?: number
          story_slug?: string
          url?: string
        }
        Relationships: []
      }
      media_items: {
        Row: {
          created_at: string
          id: string
          kind: string
          length: string | null
          position: number
          poster_url: string | null
          source_url: string | null
          subtitle: string | null
          tag: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          length?: string | null
          position?: number
          poster_url?: string | null
          source_url?: string | null
          subtitle?: string | null
          tag?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          length?: string | null
          position?: number
          poster_url?: string | null
          source_url?: string | null
          subtitle?: string | null
          tag?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      merch_blanks: {
        Row: {
          base_cost: number | null
          category: string | null
          colors: string[]
          created_at: string
          currency: string | null
          description: string | null
          fabric: string | null
          id: string
          metadata: Json
          name: string
          provider_blank_id: string
          provider_id: string
          quality_score: number | null
          quality_tier: Database["public"]["Enums"]["merch_quality_tier"] | null
          sample_ordered_at: string | null
          sample_verdict: string | null
          sizes: string[]
          status: string
          updated_at: string
          weight_gsm: number | null
        }
        Insert: {
          base_cost?: number | null
          category?: string | null
          colors?: string[]
          created_at?: string
          currency?: string | null
          description?: string | null
          fabric?: string | null
          id?: string
          metadata?: Json
          name: string
          provider_blank_id: string
          provider_id: string
          quality_score?: number | null
          quality_tier?:
            | Database["public"]["Enums"]["merch_quality_tier"]
            | null
          sample_ordered_at?: string | null
          sample_verdict?: string | null
          sizes?: string[]
          status?: string
          updated_at?: string
          weight_gsm?: number | null
        }
        Update: {
          base_cost?: number | null
          category?: string | null
          colors?: string[]
          created_at?: string
          currency?: string | null
          description?: string | null
          fabric?: string | null
          id?: string
          metadata?: Json
          name?: string
          provider_blank_id?: string
          provider_id?: string
          quality_score?: number | null
          quality_tier?:
            | Database["public"]["Enums"]["merch_quality_tier"]
            | null
          sample_ordered_at?: string | null
          sample_verdict?: string | null
          sizes?: string[]
          status?: string
          updated_at?: string
          weight_gsm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "merch_blanks_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "pod_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      merch_proposals: {
        Row: {
          adjustments: Json
          artwork_notes: string | null
          blank_id: string | null
          concept: string | null
          created_at: string
          id: string
          logo_treatment_id: string | null
          mockup_urls: string[]
          proposed_by: string | null
          proposed_price: number | null
          provider_id: string | null
          quality_score: number | null
          quality_tier: Database["public"]["Enums"]["merch_quality_tier"]
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          season: string | null
          slogan_id: string | null
          status: Database["public"]["Enums"]["merch_proposal_status"]
          target_collection: string | null
          title: string
          updated_at: string
        }
        Insert: {
          adjustments?: Json
          artwork_notes?: string | null
          blank_id?: string | null
          concept?: string | null
          created_at?: string
          id?: string
          logo_treatment_id?: string | null
          mockup_urls?: string[]
          proposed_by?: string | null
          proposed_price?: number | null
          provider_id?: string | null
          quality_score?: number | null
          quality_tier?: Database["public"]["Enums"]["merch_quality_tier"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          season?: string | null
          slogan_id?: string | null
          status?: Database["public"]["Enums"]["merch_proposal_status"]
          target_collection?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          adjustments?: Json
          artwork_notes?: string | null
          blank_id?: string | null
          concept?: string | null
          created_at?: string
          id?: string
          logo_treatment_id?: string | null
          mockup_urls?: string[]
          proposed_by?: string | null
          proposed_price?: number | null
          provider_id?: string | null
          quality_score?: number | null
          quality_tier?: Database["public"]["Enums"]["merch_quality_tier"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          season?: string | null
          slogan_id?: string | null
          status?: Database["public"]["Enums"]["merch_proposal_status"]
          target_collection?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "merch_proposals_blank_id_fkey"
            columns: ["blank_id"]
            isOneToOne: false
            referencedRelation: "merch_blanks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merch_proposals_logo_treatment_id_fkey"
            columns: ["logo_treatment_id"]
            isOneToOne: false
            referencedRelation: "logo_treatments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merch_proposals_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "pod_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merch_proposals_slogan_id_fkey"
            columns: ["slogan_id"]
            isOneToOne: false
            referencedRelation: "slogans"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          meta: Json
          read_at: string | null
          title: string
          url: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          meta?: Json
          read_at?: string | null
          title: string
          url?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          meta?: Json
          read_at?: string | null
          title?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          image: string | null
          order_id: string
          price: number
          product_id: string | null
          quantity: number
          title: string
          variant_id: string | null
          variant_title: string | null
        }
        Insert: {
          id?: string
          image?: string | null
          order_id: string
          price: number
          product_id?: string | null
          quantity?: number
          title: string
          variant_id?: string | null
          variant_title?: string | null
        }
        Update: {
          id?: string
          image?: string | null
          order_id?: string
          price?: number
          product_id?: string | null
          quantity?: number
          title?: string
          variant_id?: string | null
          variant_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          contact_email: string | null
          created_at: string
          currency: string
          id: string
          notes: string | null
          shipping_address: Json | null
          status: string
          subtotal: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          shipping_address?: Json | null
          status?: string
          subtotal?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          currency?: string
          id?: string
          notes?: string | null
          shipping_address?: Json | null
          status?: string
          subtotal?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      page_feedback: {
        Row: {
          created_at: string
          helpful: boolean | null
          id: string
          issue_text: string | null
          page_path: string
          page_title: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          helpful?: boolean | null
          id?: string
          issue_text?: string | null
          page_path: string
          page_title?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          helpful?: boolean | null
          id?: string
          issue_text?: string | null
          page_path?: string
          page_title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      partner_invitations: {
        Row: {
          claimed_at: string | null
          claimed_by: string | null
          created_at: string
          designation: string
          display_name: string | null
          email: string
          id: string
          invited_by: string | null
          note: string | null
        }
        Insert: {
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          designation?: string
          display_name?: string | null
          email: string
          id?: string
          invited_by?: string | null
          note?: string | null
        }
        Update: {
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string
          designation?: string
          display_name?: string | null
          email?: string
          id?: string
          invited_by?: string | null
          note?: string | null
        }
        Relationships: []
      }
      partner_journal_entries: {
        Row: {
          body: string
          created_at: string
          entry_date: string
          id: string
          mood: string | null
          prompt: string
          shared: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          entry_date: string
          id?: string
          mood?: string | null
          prompt?: string
          shared?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          entry_date?: string
          id?: string
          mood?: string | null
          prompt?: string
          shared?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_launch_state: {
        Row: {
          created_at: string
          hours_per_day: number
          id: string
          income_goal: number
          mission: string | null
          state: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hours_per_day?: number
          id?: string
          income_goal?: number
          mission?: string | null
          state?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hours_per_day?: number
          id?: string
          income_goal?: number
          mission?: string | null
          state?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_vendors: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          revoked_at: string | null
          revoked_by: string | null
          status: string
          user_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          status?: string
          user_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          status?: string
          user_id?: string
          vendor_id?: string
        }
        Relationships: []
      }
      payment_requests: {
        Row: {
          amount: number
          attempts: number
          buyer_email: string | null
          buyer_name: string | null
          buyer_phone: string | null
          cancelled_at: string | null
          created_at: string
          currency: string
          declined_at: string | null
          delivery: string
          expired_at: string | null
          expires_at: string | null
          failure_reason: string | null
          first_viewed_at: string | null
          id: string
          idempotency_key: string | null
          kind: string
          listing_id: string | null
          note: string | null
          order_id: string | null
          paid_at: string | null
          processing_started_at: string | null
          quantity: number
          refunded_at: string | null
          seller_id: string
          status: string
          title: string
          token: string
          updated_at: string
        }
        Insert: {
          amount: number
          attempts?: number
          buyer_email?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          cancelled_at?: string | null
          created_at?: string
          currency?: string
          declined_at?: string | null
          delivery?: string
          expired_at?: string | null
          expires_at?: string | null
          failure_reason?: string | null
          first_viewed_at?: string | null
          id?: string
          idempotency_key?: string | null
          kind?: string
          listing_id?: string | null
          note?: string | null
          order_id?: string | null
          paid_at?: string | null
          processing_started_at?: string | null
          quantity?: number
          refunded_at?: string | null
          seller_id: string
          status?: string
          title: string
          token: string
          updated_at?: string
        }
        Update: {
          amount?: number
          attempts?: number
          buyer_email?: string | null
          buyer_name?: string | null
          buyer_phone?: string | null
          cancelled_at?: string | null
          created_at?: string
          currency?: string
          declined_at?: string | null
          delivery?: string
          expired_at?: string | null
          expires_at?: string | null
          failure_reason?: string | null
          first_viewed_at?: string | null
          id?: string
          idempotency_key?: string | null
          kind?: string
          listing_id?: string | null
          note?: string | null
          order_id?: string | null
          paid_at?: string | null
          processing_started_at?: string | null
          quantity?: number
          refunded_at?: string | null
          seller_id?: string
          status?: string
          title?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_requests_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "card_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "card_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_events: {
        Row: {
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: number
          payload: Json
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: number
          payload?: Json
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: number
          payload?: Json
        }
        Relationships: []
      }
      pod_providers: {
        Row: {
          config: Json
          connected_at: string | null
          created_at: string
          id: string
          is_default: boolean
          name: string
          notes: string | null
          slug: string
          status: Database["public"]["Enums"]["pod_provider_status"]
          updated_at: string
        }
        Insert: {
          config?: Json
          connected_at?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          notes?: string | null
          slug: string
          status?: Database["public"]["Enums"]["pod_provider_status"]
          updated_at?: string
        }
        Update: {
          config?: Json
          connected_at?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          notes?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["pod_provider_status"]
          updated_at?: string
        }
        Relationships: []
      }
      product_economics: {
        Row: {
          affiliate_enabled: boolean
          commission_rate: number | null
          cost_of_goods: number
          created_at: string
          currency: string
          discount_pct: number
          estimated_monthly_units: number
          id: string
          marketplace_fee_pct: number
          notes: string | null
          other_cost: number
          packaging_cost: number
          payment_fee_fixed: number
          payment_fee_pct: number
          product_ref: string
          selling_price: number
          shipping_cost: number
          target_margin_pct: number
          tax_pct: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          affiliate_enabled?: boolean
          commission_rate?: number | null
          cost_of_goods?: number
          created_at?: string
          currency?: string
          discount_pct?: number
          estimated_monthly_units?: number
          id?: string
          marketplace_fee_pct?: number
          notes?: string | null
          other_cost?: number
          packaging_cost?: number
          payment_fee_fixed?: number
          payment_fee_pct?: number
          product_ref: string
          selling_price?: number
          shipping_cost?: number
          target_margin_pct?: number
          tax_pct?: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          affiliate_enabled?: boolean
          commission_rate?: number | null
          cost_of_goods?: number
          created_at?: string
          currency?: string
          discount_pct?: number
          estimated_monthly_units?: number
          id?: string
          marketplace_fee_pct?: number
          notes?: string | null
          other_cost?: number
          packaging_cost?: number
          payment_fee_fixed?: number
          payment_fee_pct?: number
          product_ref?: string
          selling_price?: number
          shipping_cost?: number
          target_margin_pct?: number
          tax_pct?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_image_overrides: {
        Row: {
          alt: string | null
          created_at: string
          id: string
          position: number
          product_id: string
          url: string
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: string
          position?: number
          product_id: string
          url: string
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: string
          position?: number
          product_id?: string
          url?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt: string | null
          created_at: string
          id: string
          position: number
          product_id: string
          url: string
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: string
          position?: number
          product_id: string
          url: string
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: string
          position?: number
          product_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_options: {
        Row: {
          id: string
          name: string
          position: number
          product_id: string
          values: string[]
        }
        Insert: {
          id?: string
          name: string
          position?: number
          product_id: string
          values?: string[]
        }
        Update: {
          id?: string
          name?: string
          position?: number
          product_id?: string
          values?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "product_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          available: boolean
          compare_at_price: number | null
          created_at: string
          currency: string
          id: string
          position: number
          price: number
          product_id: string
          selected_options: Json
          sku: string | null
          title: string
          updated_at: string
        }
        Insert: {
          available?: boolean
          compare_at_price?: number | null
          created_at?: string
          currency?: string
          id?: string
          position?: number
          price?: number
          product_id: string
          selected_options?: Json
          sku?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          available?: boolean
          compare_at_price?: number | null
          created_at?: string
          currency?: string
          id?: string
          position?: number
          price?: number
          product_id?: string
          selected_options?: Json
          sku?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_visual_embeddings: {
        Row: {
          attributes: Json
          category_slug: string | null
          embedding: string
          handle: string | null
          id: string
          image_url: string
          indexed_at: string
          model_version: string
          price: number | null
          source_id: string
          source_type: string
          sub_slug: string | null
          title: string
        }
        Insert: {
          attributes?: Json
          category_slug?: string | null
          embedding: string
          handle?: string | null
          id?: string
          image_url: string
          indexed_at?: string
          model_version?: string
          price?: number | null
          source_id: string
          source_type: string
          sub_slug?: string | null
          title?: string
        }
        Update: {
          attributes?: Json
          category_slug?: string | null
          embedding?: string
          handle?: string | null
          id?: string
          image_url?: string
          indexed_at?: string
          model_version?: string
          price?: number | null
          source_id?: string
          source_type?: string
          sub_slug?: string | null
          title?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          currency: string
          description: string
          gender: string | null
          handle: string
          hero_image: string | null
          id: string
          min_price: number
          position: number
          product_type: string | null
          status: string
          tags: string[]
          title: string
          updated_at: string
          vendor: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string
          gender?: string | null
          handle: string
          hero_image?: string | null
          id?: string
          min_price?: number
          position?: number
          product_type?: string | null
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string
          gender?: string | null
          handle?: string
          hero_image?: string | null
          id?: string
          min_price?: number
          position?: number
          product_type?: string | null
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
          vendor?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          about: Json
          address_line1: string | null
          address_line2: string | null
          avatar_url: string | null
          bio: string | null
          birthday: string | null
          builder_stage: string
          city: string | null
          country: string | null
          created_at: string
          display_name: string | null
          email: string | null
          favorite_categories: string[] | null
          full_name: string | null
          gender: string | null
          handle: string | null
          id: string
          is_public: boolean
          last_seen_at: string | null
          newsletter_opt_in: boolean
          onboarding_completed_at: string | null
          phone: string | null
          postal_code: string | null
          preferences: Json
          primary_district: string | null
          referred_by: string | null
          referred_via: string | null
          region: string | null
          social_followed: boolean
          style_preferences: string[] | null
          updated_at: string
        }
        Insert: {
          about?: Json
          address_line1?: string | null
          address_line2?: string | null
          avatar_url?: string | null
          bio?: string | null
          birthday?: string | null
          builder_stage?: string
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          favorite_categories?: string[] | null
          full_name?: string | null
          gender?: string | null
          handle?: string | null
          id: string
          is_public?: boolean
          last_seen_at?: string | null
          newsletter_opt_in?: boolean
          onboarding_completed_at?: string | null
          phone?: string | null
          postal_code?: string | null
          preferences?: Json
          primary_district?: string | null
          referred_by?: string | null
          referred_via?: string | null
          region?: string | null
          social_followed?: boolean
          style_preferences?: string[] | null
          updated_at?: string
        }
        Update: {
          about?: Json
          address_line1?: string | null
          address_line2?: string | null
          avatar_url?: string | null
          bio?: string | null
          birthday?: string | null
          builder_stage?: string
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          favorite_categories?: string[] | null
          full_name?: string | null
          gender?: string | null
          handle?: string | null
          id?: string
          is_public?: boolean
          last_seen_at?: string | null
          newsletter_opt_in?: boolean
          onboarding_completed_at?: string | null
          phone?: string | null
          postal_code?: string | null
          preferences?: Json
          primary_district?: string | null
          referred_by?: string | null
          referred_via?: string | null
          region?: string | null
          social_followed?: boolean
          style_preferences?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      recruitment_bonuses: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          kind: string
          note: string | null
          referral_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          kind: string
          note?: string | null
          referral_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          kind?: string
          note?: string | null
          referral_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recruitment_bonuses_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "link_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_coupons: {
        Row: {
          code: string
          created_at: string
          email: string
          id: string
          order_id: string | null
          percent_off: number
          redeemed_at: string | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          id?: string
          order_id?: string | null
          percent_off?: number
          redeemed_at?: string | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          id?: string
          order_id?: string | null
          percent_off?: number
          redeemed_at?: string | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_images: {
        Row: {
          alt: string | null
          slot_key: string
          updated_at: string
          url: string
        }
        Insert: {
          alt?: string | null
          slot_key: string
          updated_at?: string
          url: string
        }
        Update: {
          alt?: string | null
          slot_key?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      site_text: {
        Row: {
          slot_key: string
          updated_at: string
          value: string
        }
        Insert: {
          slot_key: string
          updated_at?: string
          value: string
        }
        Update: {
          slot_key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      slogans: {
        Row: {
          brand_voice_notes: string | null
          created_at: string
          id: string
          normalized_text: string | null
          origin_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source: Database["public"]["Enums"]["slogan_source"]
          status: Database["public"]["Enums"]["slogan_status"]
          submitted_by: string | null
          tags: string[]
          text: string
          updated_at: string
        }
        Insert: {
          brand_voice_notes?: string | null
          created_at?: string
          id?: string
          normalized_text?: string | null
          origin_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source?: Database["public"]["Enums"]["slogan_source"]
          status?: Database["public"]["Enums"]["slogan_status"]
          submitted_by?: string | null
          tags?: string[]
          text: string
          updated_at?: string
        }
        Update: {
          brand_voice_notes?: string | null
          created_at?: string
          id?: string
          normalized_text?: string | null
          origin_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source?: Database["public"]["Enums"]["slogan_source"]
          status?: Database["public"]["Enums"]["slogan_status"]
          submitted_by?: string | null
          tags?: string[]
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      studio_operations: {
        Row: {
          actual_credits: number | null
          created_at: string
          estimated_credits: number
          id: string
          label: string
          operation_key: string
          output: Json
          processing_ms: number | null
          project_id: string | null
          request: string | null
          status: string
          user_id: string
        }
        Insert: {
          actual_credits?: number | null
          created_at?: string
          estimated_credits?: number
          id?: string
          label: string
          operation_key: string
          output?: Json
          processing_ms?: number | null
          project_id?: string | null
          request?: string | null
          status?: string
          user_id: string
        }
        Update: {
          actual_credits?: number | null
          created_at?: string
          estimated_credits?: number
          id?: string
          label?: string
          operation_key?: string
          output?: Json
          processing_ms?: number | null
          project_id?: string | null
          request?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_operations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "studio_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_projects: {
        Row: {
          brief: string | null
          created_at: string
          destination: string
          id: string
          status: string
          timeline: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brief?: string | null
          created_at?: string
          destination?: string
          id?: string
          status?: string
          timeline?: Json
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brief?: string | null
          created_at?: string
          destination?: string
          id?: string
          status?: string
          timeline?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trust_verifications: {
        Row: {
          badge: string
          created_at: string
          granted_by: string | null
          id: string
          note: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          badge: string
          created_at?: string
          granted_by?: string | null
          id?: string
          note?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          badge?: string
          created_at?: string
          granted_by?: string | null
          id?: string
          note?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tryon_looks: {
        Row: {
          cart_items: Json
          created_at: string
          error: string | null
          id: string
          prompt: string | null
          result_url: string | null
          source_photo_id: string | null
          source_photo_url: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cart_items?: Json
          created_at?: string
          error?: string | null
          id?: string
          prompt?: string | null
          result_url?: string | null
          source_photo_id?: string | null
          source_photo_url: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cart_items?: Json
          created_at?: string
          error?: string | null
          id?: string
          prompt?: string | null
          result_url?: string | null
          source_photo_id?: string | null
          source_photo_url?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tryon_looks_source_photo_id_fkey"
            columns: ["source_photo_id"]
            isOneToOne: false
            referencedRelation: "customer_photos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vault_items: {
        Row: {
          archived_at: string | null
          body: string | null
          collection: string | null
          created_at: string
          id: string
          kind: string
          pinned: boolean
          tags: string[]
          title: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          body?: string | null
          collection?: string | null
          created_at?: string
          id?: string
          kind?: string
          pinned?: boolean
          tags?: string[]
          title: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          archived_at?: string | null
          body?: string | null
          collection?: string | null
          created_at?: string
          id?: string
          kind?: string
          pinned?: boolean
          tags?: string[]
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      viral_products: {
        Row: {
          approved_for_promotion: boolean
          badge: string | null
          blurb: string
          category_slug: string
          commission_rate: number | null
          compare_at: number | null
          created_at: string
          id: string
          image: string
          price: number
          rating: number
          reviews: number
          slug: string
          sold: string
          sort_order: number
          sub_slug: string
          title: string
          updated_at: string
          visual_indexing_approved: boolean
        }
        Insert: {
          approved_for_promotion?: boolean
          badge?: string | null
          blurb?: string
          category_slug: string
          commission_rate?: number | null
          compare_at?: number | null
          created_at?: string
          id?: string
          image?: string
          price?: number
          rating?: number
          reviews?: number
          slug: string
          sold?: string
          sort_order?: number
          sub_slug: string
          title: string
          updated_at?: string
          visual_indexing_approved?: boolean
        }
        Update: {
          approved_for_promotion?: boolean
          badge?: string | null
          blurb?: string
          category_slug?: string
          commission_rate?: number | null
          compare_at?: number | null
          created_at?: string
          id?: string
          image?: string
          price?: number
          rating?: number
          reviews?: number
          slug?: string
          sold?: string
          sort_order?: number
          sub_slug?: string
          title?: string
          updated_at?: string
          visual_indexing_approved?: boolean
        }
        Relationships: []
      }
      visual_uploads: {
        Row: {
          attributes: Json
          board_id: string | null
          created_at: string
          embedding: string | null
          expires_at: string
          height: number | null
          id: string
          is_saved: boolean
          mime_type: string | null
          session_id: string | null
          storage_path: string
          user_id: string | null
          width: number | null
        }
        Insert: {
          attributes?: Json
          board_id?: string | null
          created_at?: string
          embedding?: string | null
          expires_at?: string
          height?: number | null
          id?: string
          is_saved?: boolean
          mime_type?: string | null
          session_id?: string | null
          storage_path: string
          user_id?: string | null
          width?: number | null
        }
        Update: {
          attributes?: Json
          board_id?: string | null
          created_at?: string
          embedding?: string | null
          expires_at?: string
          height?: number | null
          id?: string
          is_saved?: boolean
          mime_type?: string | null
          session_id?: string | null
          storage_path?: string
          user_id?: string | null
          width?: number | null
        }
        Relationships: []
      }
      voice_feedback: {
        Row: {
          attachments: Json
          audio_path: string | null
          category: string
          created_at: string
          duration_seconds: number | null
          founder_note: string | null
          id: string
          implemented_at: string | null
          sentiment: string | null
          source: string
          status: string
          summary: string | null
          themes: string[]
          transcript: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attachments?: Json
          audio_path?: string | null
          category?: string
          created_at?: string
          duration_seconds?: number | null
          founder_note?: string | null
          id?: string
          implemented_at?: string | null
          sentiment?: string | null
          source?: string
          status?: string
          summary?: string | null
          themes?: string[]
          transcript?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attachments?: Json
          audio_path?: string | null
          category?: string
          created_at?: string
          duration_seconds?: number | null
          founder_note?: string | null
          id?: string
          implemented_at?: string | null
          sentiment?: string | null
          source?: string
          status?: string
          summary?: string | null
          themes?: string[]
          transcript?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      expire_stale_payment_requests: { Args: never; Returns: number }
      get_active_partner_vendor_ids: {
        Args: { _user_id: string }
        Returns: string[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      match_product_visuals: {
        Args: {
          match_count?: number
          query_embedding: string
          source_filter?: string
        }
        Returns: {
          attributes: Json
          category_slug: string
          handle: string
          id: string
          image_url: string
          price: number
          similarity: number
          source_id: string
          source_type: string
          sub_slug: string
          title: string
        }[]
      }
      purge_expired_visual_uploads: { Args: never; Returns: number }
    }
    Enums: {
      activity_status:
        | "draft"
        | "founder_review"
        | "approved"
        | "published"
        | "archived"
        | "retired"
      app_role:
        | "admin"
        | "super_admin"
        | "staff"
        | "moderator"
        | "designer"
        | "affiliate"
        | "partner"
        | "ambassador"
        | "customer"
      logo_placement:
        | "chest_left"
        | "chest_center"
        | "back_center"
        | "sleeve"
        | "hem"
        | "pocket"
        | "all_over"
        | "embroidery_chest"
        | "embroidery_sleeve"
        | "other"
      merch_proposal_status:
        | "proposed"
        | "under_review"
        | "approved"
        | "adjusted"
        | "skipped"
        | "rejected"
        | "published"
        | "retired"
      merch_quality_tier: "signature" | "premium" | "standard" | "experimental"
      pod_provider_status: "available" | "connected" | "disabled"
      slogan_source:
        | "ai_generated"
        | "founder"
        | "site_import"
        | "partner_submitted"
      slogan_status:
        | "draft"
        | "under_review"
        | "approved"
        | "rejected"
        | "retired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_status: [
        "draft",
        "founder_review",
        "approved",
        "published",
        "archived",
        "retired",
      ],
      app_role: [
        "admin",
        "super_admin",
        "staff",
        "moderator",
        "designer",
        "affiliate",
        "partner",
        "ambassador",
        "customer",
      ],
      logo_placement: [
        "chest_left",
        "chest_center",
        "back_center",
        "sleeve",
        "hem",
        "pocket",
        "all_over",
        "embroidery_chest",
        "embroidery_sleeve",
        "other",
      ],
      merch_proposal_status: [
        "proposed",
        "under_review",
        "approved",
        "adjusted",
        "skipped",
        "rejected",
        "published",
        "retired",
      ],
      merch_quality_tier: ["signature", "premium", "standard", "experimental"],
      pod_provider_status: ["available", "connected", "disabled"],
      slogan_source: [
        "ai_generated",
        "founder",
        "site_import",
        "partner_submitted",
      ],
      slogan_status: [
        "draft",
        "under_review",
        "approved",
        "rejected",
        "retired",
      ],
    },
  },
} as const
