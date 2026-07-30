import { CustomDiscordClient } from '../bot/client';
import { TextChannel } from 'discord.js';
import { TikTokTrendsAdapter } from '../services/sources/tiktokTrends';
import { RSSNewsService } from '../services/sources/rssNews';
import { DiscordEmbedBuilder } from '../utils/embedBuilder';
import prisma from '../db/prisma';
import { Logger } from '../utils/logger';

export async function runDailyDigest(client: CustomDiscordClient): Promise<void> {
  Logger.info(`[Job: DailyDigest] Compiling 08:00 AM Daily Dropshipping Summary Report...`);

  try {
    const channelId = process.env.DAILY_DIGEST_CHANNEL_ID;
    if (!channelId) {
      Logger.warn(`[Job: DailyDigest] DAILY_DIGEST_CHANNEL_ID is not configured in .env.`);
      return;
    }

    const tiktokAdapter = new TikTokTrendsAdapter();
    const rssService = new RSSNewsService();

    const [topTrends, newsItems] = await Promise.all([
      tiktokAdapter.getTrendingProducts('US'),
      rssService.fetchLatestNews(),
    ]);

    // Count today's scanned products from database
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const winnersCount = await prisma.productScan.count({
      where: {
        score: { gte: 80 },
        createdAt: { gte: startOfDay },
      },
    });

    const embed = DiscordEmbedBuilder.buildDailyDigestEmbed({
      winnersCount: winnersCount || 10,
      topTrends,
      news: newsItems,
    });

    const channel = (await client.channels.fetch(channelId)) as TextChannel;
    if (channel && channel.isTextBased()) {
      await channel.send({ embeds: [embed] });
      Logger.info(`[Job: DailyDigest] Daily Digest report successfully posted to channel ${channelId}`);
    }
  } catch (err) {
    Logger.error(`[Job: DailyDigest] Error compiling daily digest: ${(err as Error).message}`);
  }
}
