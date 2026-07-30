import { ProductData } from './sources/types';

export interface ScoringWeights {
  orderGrowthWeight: number; // Default 0.30
  socialEngagementWeight: number; // Default 0.25
  priceMarginWeight: number; // Default 0.20
  competitionWeight: number; // Default 0.15
  categoryMomentumWeight: number; // Default 0.10
}

export function calculateWinningScore(
  product: ProductData,
  customWeights?: Partial<ScoringWeights>,
): number {
  const weights: ScoringWeights = {
    orderGrowthWeight: parseFloat(process.env.WEIGHT_ORDER_GROWTH || '0.30'),
    socialEngagementWeight: parseFloat(process.env.WEIGHT_SOCIAL_ENGAGEMENT || '0.25'),
    priceMarginWeight: parseFloat(process.env.WEIGHT_PRICE_MARGIN || '0.20'),
    competitionWeight: parseFloat(process.env.WEIGHT_COMPETITION || '0.15'),
    categoryMomentumWeight: parseFloat(process.env.WEIGHT_CATEGORY_MOMENTUM || '0.10'),
    ...customWeights,
  };

  // 1. Order Growth Score (0 - 100): normalized against 500+ daily orders benchmark
  const normalizedOrderGrowth = Math.min(100, (product.ordersGrowthDay / 500) * 100);

  // 2. Social Engagement Score (0 - 100): normalized against 200k likes benchmark
  const likes = product.socialEngagement.likes || 0;
  const normalizedSocialEngagement = Math.min(100, (likes / 200000) * 100);

  // 3. Price / Margin Score (0 - 100): ideal impulse range $15 - $45 gives highest score
  let priceScore = 50;
  if (product.price >= 10 && product.price <= 40) {
    priceScore = 95;
  } else if (product.price > 40 && product.price <= 80) {
    priceScore = 75;
  } else if (product.price < 10) {
    priceScore = 80;
  } else {
    priceScore = 40;
  }

  // 4. Competition Score (0 - 100): fewer sellers = higher score
  let competitionScore = 100;
  if (product.sellerCount <= 2) {
    competitionScore = 95;
  } else if (product.sellerCount <= 5) {
    competitionScore = 80;
  } else if (product.sellerCount <= 10) {
    competitionScore = 60;
  } else if (product.sellerCount <= 20) {
    competitionScore = 40;
  } else {
    competitionScore = 20;
  }

  // 5. Category Trend Momentum (0 - 100)
  const momentumScore = Math.min(100, Math.max(0, product.trendMomentumScore));

  // Calculate Weighted Total Score
  const totalScore =
    normalizedOrderGrowth * weights.orderGrowthWeight +
    normalizedSocialEngagement * weights.socialEngagementWeight +
    priceScore * weights.priceMarginWeight +
    competitionScore * weights.competitionWeight +
    momentumScore * weights.categoryMomentumWeight;

  return Math.round(Math.min(100, Math.max(0, totalScore)));
}
