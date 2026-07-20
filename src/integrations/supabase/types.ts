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
          birthday: string | null
          created_at: string
          email: string | null
          favorite_categories: string[] | null
          full_name: string | null
          gender: string | null
          id: string
          newsletter_opt_in: boolean
          social_followed: boolean
          style_preferences: string[] | null
          updated_at: string
        }
        Insert: {
          birthday?: string | null
          created_at?: string
          email?: string | null
          favorite_categories?: string[] | null
          full_name?: string | null
          gender?: string | null
          id: string
          newsletter_opt_in?: boolean
          social_followed?: boolean
          style_preferences?: string[] | null
          updated_at?: string
        }
        Update: {
          birthday?: string | null
          created_at?: string
          email?: string | null
          favorite_categories?: string[] | null
          full_name?: string | null
          gender?: string | null
          id?: string
          newsletter_opt_in?: boolean
          social_followed?: boolean
          style_preferences?: string[] | null
          updated_at?: string
        }
        Relationships: []
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
      viral_products: {
        Row: {
          badge: string | null
          blurb: string
          category_slug: string
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
        }
        Insert: {
          badge?: string | null
          blurb?: string
          category_slug: string
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
        }
        Update: {
          badge?: string | null
          blurb?: string
          category_slug?: string
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
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
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
      app_role: ["admin"],
    },
  },
} as const
