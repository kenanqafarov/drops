import { CustomDiscordClient } from '../bot/client';
import { TextChannel, EmbedBuilder } from 'discord.js';
import prisma from '../db/prisma';
import { Logger } from '../utils/logger';

export async function runCompetitorWatcher(client: CustomDiscordClient): Promise<void> {
  Logger.info(`[Job: CompetitorWatcher] Checking watched stores for updates...`);

  try {
    const stores = await prisma.watchedStore.findMany({
      include: { products: true },
    });

    if (stores.length === 0) {
      Logger.info(`[Job: CompetitorWatcher] Watch list database is empty.`);
      return;
    }

    const channelId = process.env.COMPETITOR_ALERT_CHANNEL_ID;

    for (const store of stores) {
      Logger.info(`[Job: CompetitorWatcher] Inspecting store: ${store.url}`);

      // Update last check timestamp
      await prisma.watchedStore.update({
        where: { id: store.id },
        data: { lastCheck: new Date() },
      });

      // Sample change check simulation / monitoring logic
      // In production, fetch store.url + '/products.json' and compare against stored products
      if (channelId && process.env.NODE_ENV === 'development') {
        try {
          const channel = (await client.channels.fetch(channelId)) as TextChannel;
          if (channel && channel.isTextBased()) {
            const embed = new EmbedBuilder()
              .setColor(0x34495e)
              .setTitle(`👀 Store Activity Checked: ${store.url}`)
              .setDescription(`Store status verified clean. Currently tracking **${store.products.length}** products.`)
              .setTimestamp();
            // Optional: uncomment if alert is desired on routine checks
            // await channel.send({ embeds: [embed] });
          }
        } catch (err) {
          Logger.warn(`[Job: CompetitorWatcher] Channel alert error: ${(err as Error).message}`);
        }
      }
    }
  } catch (err) {
    Logger.error(`[Job: CompetitorWatcher] Error executing watcher: ${(err as Error).message}`);
  }
}
