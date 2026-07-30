export interface SocialEngagement {
  likes: number;
  shares?: number;
  views?: number;
}

export interface ProductData {
  id: string;
  title: string;
  price: number;
  url: string;
  source: string;
  ordersGrowthDay: number;
  socialEngagement: SocialEngagement;
  sellerCount: number;
  category: string;
  trendMomentumScore: number; // 0-100
  imageUrl?: string;
  description?: string;
  reviewsCount?: number;
  rating?: number;
}

export interface SupplierPrice {
  supplier: 'AliExpress' | 'CJ Dropshipping' | '1688' | 'Alibaba' | 'Zendrop';
  productTitle: string;
  price: number;
  shippingCost: number;
  shippingTime: string;
  minOrderQty: number;
  productUrl: string;
}

export interface AdCreative {
  id: string;
  title: string;
  platform: 'Meta' | 'TikTok';
  creativeUrl: string;
  activeDays: number;
  storeName: string;
  thumbnailUrl?: string;
}

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  snippet: string;
}

export interface AIAnalysisResult {
  saturation: number; // 1-10
  profitMargin: string; // e.g. "65%"
  impulseBuy: 'Low' | 'Medium' | 'High';
  tiktokPotential: 'Low' | 'Medium' | 'High';
  recommendedCountry: string;
  reasoning: string;
}

export interface ISourceAdapter {
  name: string;
  searchProducts(query: string): Promise<ProductData[]>;
  getTrendingProducts(country?: string): Promise<ProductData[]>;
}
