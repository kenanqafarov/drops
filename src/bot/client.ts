import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { findCommand } from './commands/find';
import { spyCommand } from './commands/spy';
import { analyzeCommand } from './commands/analyze';
import { supplierCommand } from './commands/supplier';
import { adsCommand } from './commands/ads';
import { trendsCommand } from './commands/trends';
import { newsCommand } from './commands/news';

export interface Command {
  data: {
    name: string;
    toJSON: () => unknown;
  };
  execute: (interaction: any) => Promise<void>;
}

export class CustomDiscordClient extends Client {
  public commands: Collection<string, Command> = new Collection();
}

export function createDiscordClient(): CustomDiscordClient {
  const client = new CustomDiscordClient({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
    ],
  });

  // Register slash command instances into Client collection
  const commandsList: Command[] = [
    findCommand,
    spyCommand,
    analyzeCommand,
    supplierCommand,
    adsCommand,
    trendsCommand,
    newsCommand,
  ];

  for (const cmd of commandsList) {
    client.commands.set(cmd.data.name, cmd);
  }

  return client;
}
