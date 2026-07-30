import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { findCommand } from './commands/find';
import { spyCommand } from './commands/spy';
import { analyzeCommand } from './commands/analyze';
import { supplierCommand } from './commands/supplier';
import { adsCommand } from './commands/ads';
import { trendsCommand } from './commands/trends';
import { newsCommand } from './commands/news';
import { Logger } from '../utils/logger';

dotenv.config();

const commands = [
  findCommand.data.toJSON(),
  spyCommand.data.toJSON(),
  analyzeCommand.data.toJSON(),
  supplierCommand.data.toJSON(),
  adsCommand.data.toJSON(),
  trendsCommand.data.toJSON(),
  newsCommand.data.toJSON(),
];

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId) {
  Logger.error('Missing DISCORD_TOKEN or DISCORD_CLIENT_ID in environment variables.');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    Logger.info(`Started refreshing ${commands.length} application (/) commands.`);

    if (guildId) {
      // Fast testing deploy to specific Guild
      Logger.info(`Deploying commands to test Guild ID: ${guildId}`);
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: commands,
      });
      Logger.info('Successfully reloaded application (/) commands for specified Guild.');
    } else {
      // Global deployment
      Logger.info('No DISCORD_GUILD_ID specified. Deploying commands globally...');
      await rest.put(Routes.applicationCommands(clientId), {
        body: commands,
      });
      Logger.info('Successfully reloaded global application (/) commands.');
    }
  } catch (error) {
    Logger.error(`Failed to deploy commands: ${(error as Error).message}`);
  }
})();
