import { detectLanguage } from './detect.ts';
import type { Settings } from './setup.ts';

interface ApiResponse {
  output?: Array<{
    content?: Array<{
      type: string;
      text?: string;
    }>;
  }>;
}

export interface TranslateOptions {
  apiBaseUrl: string;
  apiKey: string;
  translationModelName: string;
  languageDetectionModelName: string;
  languageDetectionSystemPrompt: string;
  systemPrompts: Record<string, string>;
  languages: string[];
}

export const createTranslateOptions = (
  settings: Settings,
): TranslateOptions => ({
  apiBaseUrl: settings.apiBaseUrl,
  apiKey: settings.apiKey,
  translationModelName: settings.translation.modelName,
  languageDetectionModelName: settings.languageDetection.modelName,
  languageDetectionSystemPrompt: settings.languageDetection.systemPrompt,
  systemPrompts: settings.translation.systemPrompts,
  languages: settings.translation.languages,
});

export const translate = async (
  inputText: string,
  options: TranslateOptions,
): Promise<string> => {
  const detectedLanguage = await detectLanguage(inputText, {
    apiBaseUrl: options.apiBaseUrl,
    apiKey: options.apiKey,
    modelName: options.languageDetectionModelName,
    systemPrompt: options.languageDetectionSystemPrompt,
    languages: options.languages,
  });

  const systemPrompt = options.systemPrompts[detectedLanguage];

  if (!systemPrompt) {
    throw new Error(`No system prompt found for language: ${detectedLanguage}`);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.apiKey) {
    headers.Authorization = `Bearer ${options.apiKey}`;
  }

  const body = {
    model: options.translationModelName,
    input: [
      {
        type: 'message',
        role: 'system',
        content: [
          {
            type: 'input_text',
            text: systemPrompt,
          },
        ],
      },
      {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: inputText,
          },
        ],
      },
    ],
  };

  const response = await fetch(`${options.apiBaseUrl}/v1/responses`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`API request failed with status: ${response.status}`);
  }

  const data = (await response.json()) as ApiResponse;

  const outputText = data.output?.[0]?.content?.find(
    (c) => c.type === 'output_text',
  )?.text;

  return outputText ?? JSON.stringify(data);
};
