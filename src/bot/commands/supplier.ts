import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { SupplierCompareService } from '../../services/sources/supplierCompare';
import { DiscordEmbedBuilder } from '../../utils/embedBuilder';
import { Logger } from '../../utils/logger';

export const supplierCommand = {
  data: new SlashCommandBuilder()
    .setName('supplier')
    .setDescription('Compare prices and shipping times across AliExpress, CJ, 1688, Alibaba & Zendrop')
    .addStringOption((option) =>
      option.setName('product').setDescription('Product name or query to compare').setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const product = interaction.options.getString('product', true);
    await interaction.deferReply();

    try {
      const supplierService = new SupplierCompareService();
      const suppliers = await supplierService.compareSuppliers(product);

      const embed = DiscordEmbedBuilder.buildSupplierComparisonEmbed(product, suppliers);
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      Logger.error(`Error in /supplier command: ${(err as Error).message}`);
      await interaction.editReply({ content: '❌ An error occurred while retrieving supplier comparison data.' });
    }
  },
};
