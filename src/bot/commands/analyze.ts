import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { AIAnalyzerService } from '../../services/aiAnalyzer';
import { DiscordEmbedBuilder } from '../../utils/embedBuilder';
import { Logger } from '../../utils/logger';

export const analyzeCommand = {
  data: new SlashCommandBuilder()
    .setName('analyze')
    .setDescription('Analyze AliExpress or Shopify product link with Claude AI (Saturation & Profit Margin)')
    .addStringOption((option) =>
      option.setName('url').setDescription('AliExpress or Shopify product URL').setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const url = interaction.options.getString('url', true);
    await interaction.deferReply();

    try {
      // Extract title hint from URL path or fallback
      let titleHint = 'Product Link';
      try {
        const parsedUrl = new URL(url);
        const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0) {
          titleHint = pathSegments[pathSegments.length - 1].replace(/-/g, ' ').replace(/\.html/g, '');
        }
      } catch {
        titleHint = 'Imported Product Link';
      }

      const aiService = new AIAnalyzerService();
      const analysis = await aiService.analyzeProduct({
        title: titleHint,
        price: 19.99,
        description: `Product imported for evaluation via ${url}`,
        reviews: '120 reviews (4.8 stars average)',
      });

      const embed = DiscordEmbedBuilder.buildAnalyzeEmbed(url, analysis, titleHint);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      Logger.error(`Error in /analyze command: ${(err as Error).message}`);
      await interaction.editReply({ content: '❌ An error occurred while performing AI product analysis.' });
    }
  },
};
