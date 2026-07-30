/**
 * DATA SOURCE ADAPTER: AliExpress Order Growth
 *
 * NOTE / REALITY CHECK:
 * - AliExpress Open Platform API requires seller app registration and provides limited growth metrics.
 * - Alternative: AliExpress Dropshipping Center (requires active AliExpress store account).
 * - Third-Party Options: Sell The Trend / Niche Scraper integrations.
 * - ToS Notice: Web scraping AliExpress product pages requires strict throttling to prevent IP blocking.
 */

import { ISourceAdapter, ProductData } from './types';
import { Logger } from '../../utils/logger';

export class AliExpressTrendsAdapter implements ISourceAdapter {
  name = 'AliExpress Trends';

  async searchProducts(query: string): Promise<ProductData[]> {
    Logger.info(`[AliExpressTrends] Searching products for query: ${query}`);

    return [
      {
        id: 'ali-001',
        title: `Automatic ${query} Dispenser 3-in-1`,
        price: 7.20,
        url: `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(query)}`,
        source: 'AliExpress',
        ordersGrowthDay: 280,
        socialEngagement: { likes: 15000, shares: 1200, views: 300000 },
        sellerCount: 12,
        category: 'Kitchen & Smart Home',
        trendMomentumScore: 84,
        imageUrl: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=500',
        description: 'High daily order volume growth on AliExpress Dropshipping Center',
      },
      {
        id: 'ali-002',
        title: `Ultra Quiet ${query} Mini Kit`,
        price: 4.80,
        url: `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(query)}`,
        source: 'AliExpress',
        ordersGrowthDay: 150,
        socialEngagement: { likes: 8000, shares: 600, views: 120000 },
        sellerCount: 20,
        category: 'Personal Care',
        trendMomentumScore: 75,
        imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500',
        description: 'Consistent sales volume with fast 7-12 day ePacket shipping',
      },
    ];
  }

  async getTrendingProducts(_country = 'US'): Promise<ProductData[]> {
    Logger.info(`[AliExpressTrends] Fetching trending AliExpress products`);

    return [
      {
        id: 'ali-trend-201',
        title: 'Mini Portable Neck Fan Rechargeable',
        price: 6.45,
        url: 'https://www.aliexpress.com/item/100500123456.html',
        source: 'AliExpress',
        ordersGrowthDay: 530,
        socialEngagement: { likes: 45000, shares: 3200, views: 800000 },
        sellerCount: 9,
        category: 'Summer Essentials',
        trendMomentumScore: 91,
        imageUrl: 'https://images.unsplash.com/photo-1618941721653-9652a2468ac6?w=500',
        description: 'Top grossing item on AliExpress Dropshipping Center this week',
      },
    ];
  }
}
