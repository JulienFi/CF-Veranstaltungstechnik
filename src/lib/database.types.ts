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
          description: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          display_order?: number;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          slug: string;
          short_description: string;
          full_description: string;
          specs: Json;
          suitable_for: string;
          scope_of_delivery: string;
          tags: string[];
          image_url: string;
          price_net: number | null;
          vat_rate: number | null;
          show_price: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          slug: string;
          short_description?: string;
          full_description?: string;
          specs?: Json;
          suitable_for?: string;
          scope_of_delivery?: string;
          tags?: string[];
          image_url?: string;
          price_net?: number | null;
          vat_rate?: number | null;
          show_price?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          slug?: string;
          short_description?: string;
          full_description?: string;
          specs?: Json;
          suitable_for?: string;
          scope_of_delivery?: string;
          tags?: string[];
          image_url?: string;
          price_net?: number | null;
          vat_rate?: number | null;
          show_price?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          event_type: string;
          location: string;
          event_size: string;
          technical_highlights: string;
          tags: string[];
          image_url: string;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string;
          event_type?: string;
          location?: string;
          event_size?: string;
          technical_highlights?: string;
          tags?: string[];
          image_url?: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string;
          event_type?: string;
          location?: string;
          event_size?: string;
          technical_highlights?: string;
          tags?: string[];
          image_url?: string;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          name: string;
          role: string;
          bio: string;
          image_url: string;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          role: string;
          bio?: string;
          image_url?: string;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: string;
          bio?: string;
          image_url?: string;
          display_order?: number;
          created_at?: string;
        };
      };
      inquiries: {
        Row: {
          id: string;
          inquiry_type: string;
          name: string;
          company: string;
          email: string;
          phone: string;
          event_type: string;
          event_date: string | null;
          event_location: string;
          selected_products: Json;
          message: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          inquiry_type: string;
          name: string;
          company?: string;
          email: string;
          phone?: string;
          event_type?: string;
          event_date?: string | null;
          event_location?: string;
          selected_products?: Json;
          message?: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          inquiry_type?: string;
          name?: string;
          company?: string;
          email?: string;
          phone?: string;
          event_type?: string;
          event_date?: string | null;
          event_location?: string;
          selected_products?: Json;
          message?: string;
          status?: string;
          created_at?: string;
        };
      };
    };
  };
}
