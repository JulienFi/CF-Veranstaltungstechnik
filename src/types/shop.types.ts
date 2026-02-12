export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
  created_at: string;
}

export interface ProductWithCategory {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  short_description: string;
  full_description: string;
  specs: { label: string; value: string }[];
  suitable_for: string;
  scope_of_delivery: string;
  tags: string[];
  image_url?: string;
  price_net?: number | null;
  vat_rate?: number | null;
  show_price?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  categories: {
    id: string;
    name: string;
    slug: string;
  };
}
