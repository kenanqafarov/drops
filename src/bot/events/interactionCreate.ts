import { Interaction } from 'discord.js';
import { CustomDiscordClient } from '../client';
import { Logger } from '../../utils/logger';

export function handleInteractionCreateEvent(client: CustomDiscordClient): void {
  client.on('interactionCreate', async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      Logger.warn(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      Logger.info(`Executing command /${interaction.commandName} triggered by ${interaction.user.tag}`);
      await command.execute(interaction);
    } catch (err) {
      Logger.error(`Error executing /${interaction.commandName}: ${(err as Error).message}`);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: '❌ There was an error while executing this command!',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: '❌ There was an error while executing this command!',
          ephemeral: true,
        });
      }
    }
  });
}
