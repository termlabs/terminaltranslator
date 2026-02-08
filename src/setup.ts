import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { input } from '@inquirer/prompts';

export interface Settings {
  apiBaseUrl: string;
  apiKey: string;
  translation: {
    modelName: string;
    languages: string[];
    systemPrompts: Record<string, string>;
  };
  languageDetection: {
    modelName: string;
    systemPrompt: string;
  };
}

const collectSettings = async (
  existingSettings: Partial<Settings> = {},
): Promise<Settings> => {
  const apiBaseUrl = await input({
    message: 'API Base URL:',
    default: existingSettings.apiBaseUrl ?? 'http://localhost:1234',
  });

  const apiKeyInput = await input({
    message: 'API Key:',
    default: existingSettings.apiKey ?? '',
  });

  const translationModelName = await input({
    message: 'Translation Model Name:',
    default: existingSettings.translation?.modelName ?? 'hy-mt1.5-1.8b',
  });

  const languagesInput = await input({
    message: 'Languages (comma-separated, at least 2):',
    validate: (value: string) => {
      const languages = value
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== '');
      if (languages.length < 2) {
        return 'Please specify at least 2 languages';
      }
      if (value.split(',').some((s) => s.trim() === '')) {
        return 'Language name cannot be empty';
      }
      return true;
    },
  });
  const languages = languagesInput.split(',').map((s) => s.trim());

  const existingPrompts = existingSettings.translation?.systemPrompts ?? {};
  const systemPrompts: Record<string, string> = {};
  for (const lang of languages) {
    systemPrompts[lang] = await input({
      message: `System prompt when input is "${lang}":`,
      default: existingPrompts[lang] ?? '',
    });
  }

  const languageDetectionModelName = await input({
    message: 'Language Detection Model Name:',
    default: existingSettings.languageDetection?.modelName ?? 'qwen3-0.6b',
  });

  const languageDetectionPrompt = await input({
    message: 'Language Detection System Prompt:',
    default:
      existingSettings.languageDetection?.systemPrompt ??
      'Classify the language of the input text.',
  });

  const settings: Settings = {
    apiBaseUrl,
    apiKey: apiKeyInput || existingSettings.apiKey || '',
    translation: {
      modelName: translationModelName,
      languages,
      systemPrompts,
    },
    languageDetection: {
      modelName: languageDetectionModelName,
      systemPrompt: languageDetectionPrompt,
    },
  };

  return settings;
};

export const setupSettings = async (
  settingsPath: string,
): Promise<Settings> => {
  const settings = await collectSettings();
  await mkdir(dirname(settingsPath), { recursive: true });
  await Bun.write(settingsPath, JSON.stringify(settings, null, 2));
  return settings;
};
