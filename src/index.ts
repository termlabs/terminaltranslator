#!/usr/bin/env bun
import { homedir } from 'node:os';
import { join } from 'node:path';
import { runApp } from './app.ts';
import { type Settings, setupSettings } from './setup.ts';
import { createTranslateOptions, translate } from './translate.ts';

const readStdin = async (): Promise<string> => {
  return (await Bun.stdin.text()).trim();
};

const getSettingsPath = async (isDebug: boolean): Promise<string> => {
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
};

const main = async (): Promise<void> => {
  const isDebug = Bun.env.NODE_ENV === 'development';
  const settingsPath = await getSettingsPath(isDebug);

  let settings: Settings;

  if (await Bun.file(settingsPath).exists()) {
    try {
      settings = (await Bun.file(settingsPath).json()) as Settings;
    } catch (error) {
      console.error(`Failed to load settings from ${settingsPath}:`, error);
      if (!process.stdin.isTTY) {
        console.error("Run 'ttt' in interactive mode to re-configure.");
        process.exit(1);
      }
      console.log("Let's re-configure your app.");
      settings = await setupSettings(settingsPath);
    }
  } else {
    if (!process.stdin.isTTY) {
      console.error(`Settings not found at ${settingsPath}`);
      console.error("Run 'ttt' in interactive mode first to configure.");
      process.exit(1);
    }
    console.log(`Settings file not found at ${settingsPath}.`);
    console.log("Let's configure your app.");
    settings = await setupSettings(settingsPath);
  }

  // Check if stdin has data (pipe mode)
  if (!process.stdin.isTTY) {
    const inputText = await readStdin();
    if (inputText) {
      const translateOptions = createTranslateOptions(settings);
      const result = await translate(inputText, translateOptions);
      console.log(result);
    }
    process.exit(0);
  }

  // Interactive mode
  await runApp(settings, isDebug);
};

main().catch((err) => {
  console.error('Application error:', err);
  process.exit(1);
});
