// Hand-written row types for the tables created by supabase/migrations.
//
// They are kept in step with the SQL by hand rather than generated, because
// the project has no Supabase CLI step yet. If a migration changes a column,
// change it here in the same commit.

export type FoodItemRow = {
  id: string;
  slug: string;
  name: string;
  local_names: string[];
  description: string;
  categories: string[];
  image_key: string;
  ingredients: string[];
  caution_terms: string[];
  dietary_notes: string[];
  often_uncooked: boolean;
  is_published: boolean;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
};

export type FoodNutritionRow = {
  id: string;
  food_id: string;
  serving_basis: string;
  serving_grams: number | string | null;
  energy_kcal: number | string | null;
  protein_g: number | string | null;
  carbohydrate_g: number | string | null;
  fat_g: number | string | null;
  fibre_g: number | string | null;
  source_label: string;
  verification_status: 'illustrative-demo' | 'institution-reviewed';
  assumptions: string;
};

export type ProfileRow = {
  id: string;
  display_name: string;
  consent_health: boolean;
  created_at: string;
  updated_at: string;
};

export type UserPreferencesRow = {
  user_id: string;
  age: number | null;
  gender: string | null;
  activity: string | null;
  life_stage: string | null;
  preferences: string[];
  allergies: string;
  health_context: string[];
  goal: string | null;
  energy_reference_kcal: number | null;
};

export type DiaryEntryRow = {
  id: string;
  user_id: string;
  food_id: string | null;
  food_name: string;
  portion: number | string;
  serving_basis: string;
  energy_kcal: number | string | null;
  protein_g: number | string | null;
  carbohydrate_g: number | string | null;
  fat_g: number | string | null;
  fibre_g: number | string | null;
  image_key: string;
  source_label: string;
  eaten_at: string;
  created_at: string;
};

/** A diary row selected together with the slug of the food it points at. */
export type DiaryEntryWithFood = DiaryEntryRow & {
  food_items?: { slug: string } | { slug: string }[] | null;
};

export type MenuItemInsert = {
  provider_id: string;
  food_id: string | null;
  name: string;
  description: string;
  price_etb: number | null;
  ingredients: string[];
  is_published: boolean;
};

export type ProviderRow = {
  id: string;
  slug: string;
  name: string;
  kind: 'Hotel' | 'Café' | 'Restaurant';
  city: string;
  summary: string;
  is_demo: boolean;
  is_published: boolean;
  moderation_status: 'pending' | 'verified-demo' | 'needs-changes';
  owner_id: string | null;
};

export type ProviderMenuItemRow = {
  id: string;
  provider_id: string;
  food_id: string | null;
  name: string;
  description: string;
  price_etb: number | string | null;
  currency: string;
  ingredients: string[];
  is_published: boolean;
  sort_order: number;
};

export type FoodSubmissionRow = {
  id: string;
  submitted_by: string;
  food_id: string | null;
  proposed_name: string;
  proposed_local_names: string[];
  proposed_description: string;
  proposed_nutrition: Record<string, unknown> | null;
  note: string;
  image_path: string | null;
  status: 'pending' | 'approved' | 'changes' | 'rejected';
  created_at: string;
};

export type FoodReviewRow = {
  id: string;
  submission_id: string;
  reviewer_id: string;
  status: 'approved' | 'changes' | 'rejected';
  note: string;
  created_at: string;
};

export type UserRoleRow = {
  user_id: string;
  role: 'user' | 'provider' | 'institution' | 'admin';
};

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow>;
      user_roles: Table<UserRoleRow>;
      user_preferences: Table<UserPreferencesRow>;
      food_items: Table<FoodItemRow>;
      food_nutrition: Table<FoodNutritionRow>;
      diary_entries: Table<DiaryEntryRow>;
      providers: Table<ProviderRow>;
      provider_members: Table<{ provider_id: string; user_id: string; member_role: 'owner' | 'manager' }>;
      provider_menu_items: Table<ProviderMenuItemRow>;
      food_submissions: Table<FoodSubmissionRow>;
      review_assignments: Table<{ submission_id: string; reviewer_id: string; assigned_at: string }>;
      food_reviews: Table<FoodReviewRow>;
      audit_events: Table<{
        id: string;
        actor_id: string | null;
        action: string;
        entity_type: string;
        entity_id: string | null;
        detail: Record<string, unknown>;
        created_at: string;
      }>;
      ai_recognition_requests: Table<{
        id: string;
        user_id: string;
        model: string;
        outcome: 'matched' | 'no_match' | 'unavailable';
        created_at: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
