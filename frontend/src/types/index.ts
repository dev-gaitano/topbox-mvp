export interface Company {
  id: number;
  name: string;
  industry: string;
  email: string;
  monthly_budget: number;
  description: string;
  target_audience: string;
  unique_value?: string;
  main_competitors?: string[];
  brand_personality: string[];
  brand_tone?: string;
  createdAt?: string | null;
}

export interface BrandGuideline {
  id?: number;
  companyId: number;
  file?: File;
  fileUrl?: string;
  generatedContent?: string;
}

export interface ContentPost {
  id?: number;
  companyId: number;
  topic: string;
  platform: string;
  referenceImages?: File[];
  referenceImageUrls?: string[];
  prompt?: string;
  caption?: string;
}

export type Platform = 'instagram' | 'twitter' | 'facebook' | 'linkedin' | 'tiktok';
