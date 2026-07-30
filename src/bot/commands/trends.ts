import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { TikTokTrendsAdapter } from '../../services/sources/tiktokTrends';
import { ShopifyViralAdapter } from '../../services/sources/shopifyViral';
import { DiscordEmbedBuilder } from '../../utils/embedBuilder';
import { Logger } from '../../utils/logger';

export const trendsCommand = {
  data: new SlashCommandBuilder()
    .setName('trends')
    .setDescription('Get top trending TikTok and Shopify products by country')
    .addStringOption((option) =>
      option
        .setName('country')
        .setDescription('Target country code (e.g. US, UK, CA, DE)')
        .setRequired(false),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const country = interaction.options.getString('country') || 'US';
    await interaction.deferReply();

    try {
      const tiktokAdapter = new TikTokTrendsAdapter();
      const shopifyAdapter = new ShopifyViralAdapter();

      const [ttTrends, shpTrends] = await Promise.all([
        tiktokAdapter.getTrendingProducts(country),
        shopifyAdapter.getTrendingProducts(country),
      ]);

      const allTrends = [...ttTrends, ...shpTrends];
      const embed = DiscordEmbedBuilder.buildTrendsEmbed(country, allTrends);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      Logger.error(`Error in /trends command: ${(err as Error).message}`);
      await interaction.editReply({ content: '❌ An error occurred while fetching country trends.' });
    }
  },
};
