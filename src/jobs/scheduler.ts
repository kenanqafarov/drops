import cron from 'node-cron';
import { CustomDiscordClient } from '../bot/client';
import { runWinningProductScanner } from './winningProductScanner';
import { runCompetitorWatcher } from './competitorWatcher';
import { runDailyDigest } from './dailyDigest';
import { Logger } from '../utils/logger';

export function initializeScheduler(client: CustomDiscordClient): void {
  const scanMinutes = parseInt(process.env.SCAN_INTERVAL_MINUTES || '30', 10);
  const competitorMinutes = parseInt(process.env.COMPETITOR_CHECK_MINUTES || '15', 10);
  const dailyHour = parseInt(process.env.DAILY_DIGEST_HOUR || '8', 10);

  Logger.info(`[Scheduler] Initializing node-cron background tasks...`);

  // 1. Winning Product Scanner (Default: every 30 minutes)
  const scannerCron = `*/${scanMinutes} * * * *`;
  cron.schedule(scannerCron, () => {
    runWinningProductScanner(client);
  });
  Logger.info(`[Scheduler] Winning Product Scanner scheduled with cron pattern: "${scannerCron}"`);

  // 2. Competitor Watcher (Default: every 15 minutes)
  const watcherCron = `*/${competitorMinutes} * * * *`;
  cron.schedule(watcherCron, () => {
    runCompetitorWatcher(client);
  });
  Logger.info(`[Scheduler] Competitor Watcher scheduled with cron pattern: "${watcherCron}"`);

  // 3. Daily Digest (Default: every day at 08:00 AM)
  const dailyCron = `0 ${dailyHour} * * *`;
  cron.schedule(dailyCron, () => {
    runDailyDigest(client);
  });
  Logger.info(`[Scheduler] Daily Digest scheduled with cron pattern: "${dailyCron}"`);
}
