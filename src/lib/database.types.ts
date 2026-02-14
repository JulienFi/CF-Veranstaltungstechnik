export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          display_order: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          display_order?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          display_order?: number | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          slug: string;
          short_description: string | null;
          full_description: string | null;
          specs: Json | null;
          suitable_for: string | null;
          scope_of_delivery: string | null;
          tags: string[] | null;
          image_url: string | null;
          price_net: number | null;
          vat_rate: number | null;
          show_price: boolean | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          slug: string;
          short_description?: string | null;
          full_description?: string | null;
          specs?: Json | null;
          suitable_for?: string | null;
          scope_of_delivery?: string | null;
          tags?: string[] | null;
          image_url?: string | null;
          price_net?: number | null;
          vat_rate?: number | null;
          show_price?: boolean | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name?: string;
          slug?: string;
          short_description?: string | null;
          full_description?: string | null;
          specs?: Json | null;
          suitable_for?: string | null;
          scope_of_delivery?: string | null;
          tags?: string[] | null;
          image_url?: string | null;
          price_net?: number | null;
          vat_rate?: number | null;
          show_price?: boolean | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'products_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          }
        ];
      };
      projects: {
        Row: {
          id: string;
          title: string;
          slug: string | null;
          description: string | null;
          event_type: string | null;
          location: string | null;
          event_size: string | null;
          technical_highlights: string | null;
          tags: string[] | null;
          image_url: string | null;
          is_published: boolean | null;
          date: string | null;
          category: string | null;
          order_index: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug?: string | null;
          description?: string | null;
          event_type?: string | null;
          location?: string | null;
          event_size?: string | null;
          technical_highlights?: string | null;
          tags?: string[] | null;
          image_url?: string | null;
          is_published?: boolean | null;
          date?: string | null;
          category?: string | null;
          order_index?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string | null;
          description?: string | null;
          event_type?: string | null;
          location?: string | null;
          event_size?: string | null;
          technical_highlights?: string | null;
          tags?: string[] | null;
          image_url?: string | null;
          is_published?: boolean | null;
          date?: string | null;
          category?: string | null;
          order_index?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          id: string;
          name: string;
          role: string;
          bio: string | null;
          image_url: string | null;
          email: string | null;
          phone: string | null;
          display_order: number | null;
          order_index: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          role: string;
          bio?: string | null;
          image_url?: string | null;
          email?: string | null;
          phone?: string | null;
          display_order?: number | null;
          order_index?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          role?: string;
          bio?: string | null;
          image_url?: string | null;
          email?: string | null;
          phone?: string | null;
          display_order?: number | null;
          order_index?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      inquiries: {
        Row: {
          id: string;
          inquiry_type: string;
          name: string;
          company: string | null;
          email: string;
          phone: string | null;
          event_type: string | null;
          event_date: string | null;
          event_location: string | null;
          selected_products: Json | null;
          product_id: string | null;
          product_slug: string | null;
          product_name: string | null;
          source_url: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          message: string | null;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          inquiry_type: string;
          name: string;
          company?: string | null;
          email: string;
          phone?: string | null;
          event_type?: string | null;
          event_date?: string | null;
          event_location?: string | null;
          selected_products?: Json | null;
          product_id?: string | null;
          product_slug?: string | null;
          product_name?: string | null;
          source_url?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          message?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          inquiry_type?: string;
          name?: string;
          company?: string | null;
          email?: string;
          phone?: string | null;
          event_type?: string | null;
          event_date?: string | null;
          event_location?: string | null;
          selected_products?: Json | null;
          product_id?: string | null;
          product_slug?: string | null;
          product_name?: string | null;
          source_url?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          message?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
