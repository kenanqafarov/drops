import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { MetaAdsLibraryService } from '../../services/sources/metaAdsLibrary';
import { TikTokAdsLibraryService } from '../../services/sources/tiktokAdsLibrary';
import { DiscordEmbedBuilder } from '../../utils/embedBuilder';
import { Logger } from '../../utils/logger';

export const adsCommand = {
  data: new SlashCommandBuilder()
    .setName('ads')
    .setDescription('Find scaling ad creatives on Meta Ad Library & TikTok Creative Center')
    .addStringOption((option) =>
      option.setName('query').setDescription('Product query or keyword').setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const query = interaction.options.getString('query', true);
    await interaction.deferReply();

    try {
      const metaService = new MetaAdsLibraryService();
      const tiktokService = new TikTokAdsLibraryService();

      const [metaAds, tiktokAds] = await Promise.all([
        metaService.searchAds(query),
        tiktokService.searchAds(query),
      ]);

      const allCreatives = [...metaAds, ...tiktokAds];
      const embed = DiscordEmbedBuilder.buildAdsEmbed(query, allCreatives);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      Logger.error(`Error in /ads command: ${(err as Error).message}`);
      await interaction.editReply({ content: '❌ An error occurred while searching Ad Libraries.' });
    }
  },
};
