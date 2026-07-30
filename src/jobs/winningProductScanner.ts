import { CustomDiscordClient } from '../bot/client';
import { TextChannel } from 'discord.js';
import { TikTokTrendsAdapter } from '../services/sources/tiktokTrends';
import { AliExpressTrendsAdapter } from '../services/sources/aliexpressTrends';
import { AmazonMoversAdapter } from '../services/sources/amazonMovers';
import { ShopifyViralAdapter } from '../services/sources/shopifyViral';
import { calculateWinningScore } from '../services/scoring';
import { DiscordEmbedBuilder } from '../utils/embedBuilder';
import prisma from '../db/prisma';
import { Logger } from '../utils/logger';

export async function runWinningProductScanner(client: CustomDiscordClient): Promise<void> {
  Logger.info(`[Job: WinningProductScanner] Starting 30-minute scanner cycle...`);

  try {
    const tiktokAdapter = new TikTokTrendsAdapter();
    const aliAdapter = new AliExpressTrendsAdapter();
    const amazonAdapter = new AmazonMoversAdapter();
    const shopifyAdapter = new ShopifyViralAdapter();

    const [ttTrends, aliTrends, amzTrends, shpTrends] = await Promise.all([
      tiktokAdapter.getTrendingProducts(),
      aliAdapter.getTrendingProducts(),
      amazonAdapter.getTrendingProducts(),
      shopifyAdapter.getTrendingProducts(),
    ]);

    const allProducts = [...ttTrends, ...aliTrends, ...amzTrends, ...shpTrends];
    const channelId = process.env.WINNING_PRODUCT_CHANNEL_ID;

    let winnersFound = 0;

    for (const product of allProducts) {
      const score = calculateWinningScore(product);

      // Persist scan result to PostgreSQL database via Prisma
      try {
        await prisma.productScan.create({
          data: {
            source: product.source,
            title: product.title,
            price: product.price,
            score: score,
            raw: JSON.parse(JSON.stringify(product)),
          },
        });
      } catch (dbErr) {
        Logger.warn(`[Job: WinningProductScanner] Failed to save scan to DB: ${(dbErr as Error).message}`);
      }

      // Check if product passes winner threshold (Score >= 80)
      if (score >= 80) {
        winnersFound++;
        Logger.info(`[Job: WinningProductScanner] 🔥 Winner found: "${product.title}" (Score: ${score}/100)`);

        if (channelId) {
          try {
            const channel = (await client.channels.fetch(channelId)) as TextChannel;
            if (channel && channel.isTextBased()) {
              const embed = DiscordEmbedBuilder.buildWinnerAlertEmbed(product, score);
              await channel.send({ embeds: [embed] });
            }
          } catch (discordErr) {
            Logger.error(`[Job: WinningProductScanner] Error sending embed to channel ${channelId}: ${(discordErr as Error).message}`);
          }
        }
      }
    }

    Logger.info(`[Job: WinningProductScanner] Completed scanner cycle. Winners found: ${winnersFound}`);
  } catch (err) {
    Logger.error(`[Job: WinningProductScanner] Cycle error: ${(err as Error).message}`);
  }
}
