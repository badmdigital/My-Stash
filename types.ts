export enum StrainType {
  INDICA = 'Indica',
  SATIVA = 'Sativa',
  HYBRID = 'Hybrid',
  UNKNOWN = 'Unknown',
}

export enum ProductCategory {
  FLOWER = 'Flower',
  EDIBLE = 'Edible',
  VAPE = 'Vape',
  CONCENTRATE = 'Concentrate',
  PSYCHEDELIC_OTHER = 'Psychedelic (Other)',
}

export interface Terpene {
  name: string;
  percentage?: number;
  description?: string;
}

export interface Product {
  id: string;
  category: ProductCategory;
  brand_name: string;
  product_name: string;
  flavor_or_variant?: string;
  form_factor: string; // joint, gummy, etc.
  thc_mg_per_unit?: number;
  cbd_mg_per_unit?: number;
  dosage_description?: string;
  strain_type: StrainType;
  tags: string[];
  source?: string;
  terpenes: Terpene[];
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  product_id: string;
  date_time_used: string;
  dose_amount: string;
  setting: string;
  method: string;
  onset_minutes?: number;
  duration_minutes?: number;
  intensity_rating: number; // 1-10
  overall_rating: number; // 1-10
  mood_before: 'Low' | 'Neutral' | 'Good' | 'Great';
  mood_after: 'Low' | 'Neutral' | 'Good' | 'Great';
  notes?: string;
  created_at: string;
}

export interface UserProfile {
  name: string;
  email: string;
  preferences: {
    dosageUnit: 'mg' | 'g';
    dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY';
    privateProfile: boolean;
  };
}
