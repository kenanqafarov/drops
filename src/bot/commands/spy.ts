import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import prisma from '../../db/prisma';
import { DiscordEmbedBuilder } from '../../utils/embedBuilder';
import { Logger } from '../../utils/logger';

export const spyCommand = {
  data: new SlashCommandBuilder()
    .setName('spy')
    .setDescription('Track a competitor Shopify store for new products, price changes & restocks')
    .addStringOption((option) =>
      option.setName('url').setDescription('Brand domain or store URL (e.g. https://brand.com)').setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const rawUrl = interaction.options.getString('url', true);
    let storeUrl = rawUrl.trim();
    if (!storeUrl.startsWith('http://') && !storeUrl.startsWith('https://')) {
      storeUrl = `https://${storeUrl}`;
    }

    await interaction.deferReply();

    try {
      let isNew = false;
      let store = await prisma.watchedStore.findUnique({
        where: { url: storeUrl },
        include: { products: true },
      });

      if (!store) {
        store = await prisma.watchedStore.create({
          data: {
            url: storeUrl,
          },
          include: { products: true },
        });
        isNew = true;
      }

      const embed = DiscordEmbedBuilder.buildSpyEmbed(storeUrl, isNew, store.products.length);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      Logger.error(`Error in /spy command: ${(err as Error).message}`);
      await interaction.editReply({ content: '❌ An error occurred while adding the store to watchlist database.' });
    }
  },
};
