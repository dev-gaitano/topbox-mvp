export interface Company {
  id: number;
  name: string;
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
