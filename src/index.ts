import { homedir } from 'node:os';
import { join } from 'node:path';
import { runApp } from './app.ts';
import { type Settings, setupSettings } from './setup.ts';

/**
 * Resolves the configuration path based on the OS and debug mode.
 */
async function getSettingsPath(isDebug: boolean): Promise<string> {
  const localPath = join(process.cwd(), 'settings.json');

  // Prioritize local settings in debug mode if it exists
  if (isDebug && (await Bun.file(localPath).exists())) {
    return localPath;
  }

  // Windows
  if (process.platform === 'win32') {
    return join(
      Bun.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local'),
      'terminaltranslator',
      'Config',
      'settings.json',
    );
  }

  // Linux/macOS (XDG)
  const configHome = Bun.env.XDG_CONFIG_HOME || join(homedir(), '.config');
  return join(configHome, 'terminaltranslator', 'settings.json');
}

async function main(): Promise<void> {
  const isDebug = Bun.env.NODE_ENV === 'development';
  const settingsPath = await getSettingsPath(isDebug);

  let settings: Settings;

  if (await Bun.file(settingsPath).exists()) {
    try {
      settings = (await Bun.file(settingsPath).json()) as Settings;
    } catch (error) {
      console.error(`Failed to load settings from ${settingsPath}:`, error);
      console.log("Let's re-configure your app.");
      settings = await setupSettings(settingsPath);
    }
  } else {
    console.log(`Settings file not found at ${settingsPath}.`);
    console.log("Let's configure your app.");
    settings = await setupSettings(settingsPath);
  }

  await runApp(settings, isDebug);
}

main().catch((err) => {
  console.error('Application error:', err);
  process.exit(1);
});
