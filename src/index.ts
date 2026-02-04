import { existsSync } from 'node:fs';
import { runApp } from './app.ts';
import { setupSettings } from './setup.ts';

const SETTINGS_FILE = 'settings.json';

async function main(): Promise<void> {
  if (!existsSync(SETTINGS_FILE)) {
    console.log("Settings file not found. Let's configure your app.");
    await setupSettings();
  }

  runApp();
}

main();
