
export interface ProductInput {
  name: string;
  features: string;
  targetAudience: string;
  tone: string;
}

export interface GeneratedDescription {
  id: string;
  product_name: string;
  description: string;
  created_at: string;
}

export type View = 'auth' | 'dashboard' | 'history';
