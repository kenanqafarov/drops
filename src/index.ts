import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { createDiscordClient } from './bot/client';
import { handleReadyEvent } from './bot/events/ready';
import { handleInteractionCreateEvent } from './bot/events/interactionCreate';
import { initializeScheduler } from './jobs/scheduler';
import prisma from './db/prisma';
import { Logger } from './utils/logger';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Health-check & Webhook endpoint for Docker / Railway monitoring
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'Dropshipping Research Discord Bot',
  });
});

async function main() {
  Logger.info('Starting Dropshipping Research Discord Bot Application...');

  // 1. Validate Database Connection via Prisma
  try {
    await prisma.$connect();
    Logger.info('✅ Database connected successfully via Prisma ORM.');
  } catch (dbErr) {
    Logger.error(`❌ Failed to connect to PostgreSQL database: ${(dbErr as Error).message}`);
    Logger.warn('Make sure DATABASE_URL is correct and PostgreSQL container is running.');
  }

  // 2. Start Express Web Server
  app.listen(PORT, () => {
    Logger.info(`🚀 Healthcheck Express server running on port ${PORT} (GET /health)`);
  });

  // 3. Initialize Discord Client & Events
  const discordToken = process.env.DISCORD_TOKEN;
  if (!discordToken || discordToken === 'your_discord_bot_token_here') {
    Logger.warn('⚠️ DISCORD_TOKEN is missing or default. Add your Discord Bot Token to .env to connect to Discord Gateway.');
    return;
  }

  const client = createDiscordClient();
  handleReadyEvent(client);
  handleInteractionCreateEvent(client);

  try {
    await client.login(discordToken);
    Logger.info('Discord Client login initiated.');

    // 4. Initialize Background Cron Scheduler
    initializeScheduler(client);
  } catch (loginErr) {
    Logger.error(`Failed to login Discord Client: ${(loginErr as Error).message}`);
  }
}

main().catch((err) => {
  Logger.error(`Fatal application startup error: ${(err as Error).message}`);
  process.exit(1);
});
