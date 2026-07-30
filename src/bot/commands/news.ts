import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { RSSNewsService } from '../../services/sources/rssNews';
import { DiscordEmbedBuilder } from '../../utils/embedBuilder';
import { Logger } from '../../utils/logger';

export const newsCommand = {
  data: new SlashCommandBuilder()
    .setName('news')
    .setDescription('Get latest e-commerce and dropshipping news updates'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const rssService = new RSSNewsService();
      const newsItems = await rssService.fetchLatestNews();

      const embed = DiscordEmbedBuilder.buildNewsEmbed(newsItems);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      Logger.error(`Error in /news command: ${(err as Error).message}`);
      await interaction.editReply({ content: '❌ An error occurred while fetching news.' });
    }
  },
};
