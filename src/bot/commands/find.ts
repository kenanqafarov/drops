import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { TikTokTrendsAdapter } from '../../services/sources/tiktokTrends';
import { AliExpressTrendsAdapter } from '../../services/sources/aliexpressTrends';
import { AmazonMoversAdapter } from '../../services/sources/amazonMovers';
import { ShopifyViralAdapter } from '../../services/sources/shopifyViral';
import { calculateWinningScore } from '../../services/scoring';
import { DiscordEmbedBuilder } from '../../utils/embedBuilder';
import { Logger } from '../../utils/logger';

export const findCommand = {
  data: new SlashCommandBuilder()
    .setName('find')
    .setDescription('Search for winning products across TikTok, AliExpress, Amazon, and Shopify')
    .addStringOption((option) =>
      option.setName('query').setDescription('Product query or niche name').setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const query = interaction.options.getString('query', true);
    await interaction.deferReply();

    try {
      const tiktokAdapter = new TikTokTrendsAdapter();
      const aliAdapter = new AliExpressTrendsAdapter();
      const amazonAdapter = new AmazonMoversAdapter();
      const shopifyAdapter = new ShopifyViralAdapter();

      const [ttProducts, aliProducts, amzProducts, shpProducts] = await Promise.all([
        tiktokAdapter.searchProducts(query),
        aliAdapter.searchProducts(query),
        amazonAdapter.searchProducts(query),
        shopifyAdapter.searchProducts(query),
      ]);

      const allProducts = [...ttProducts, ...aliProducts, ...amzProducts, ...shpProducts];

      const scoredProducts = allProducts
        .map((product) => ({
          product,
          score: calculateWinningScore(product),
        }))
        .sort((a, b) => b.score - a.score);

      const embed = DiscordEmbedBuilder.buildFindResultsEmbed(query, scoredProducts);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      Logger.error(`Error in /find command: ${(err as Error).message}`);
      await interaction.editReply({ content: '❌ An error occurred while searching for products.' });
    }
  },
};
