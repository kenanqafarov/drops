import { CustomDiscordClient } from '../client';
import { Logger } from '../../utils/logger';

export function handleReadyEvent(client: CustomDiscordClient): void {
  client.once('ready', () => {
    Logger.info(`==================================================`);
    Logger.info(`🤖 Discord Bot logged in as ${client.user?.tag}`);
    Logger.info(`Connected to ${client.guilds.cache.size} guild(s)`);
    Logger.info(`==================================================`);
  });
}
