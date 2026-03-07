interface DetectLanguageResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface DetectedLanguage {
  language: string;
}

interface LanguageDetectionConfig {
  apiBaseUrl: string;
  apiKey?: string;
  modelName: string;
  systemPrompt: string;
  languages: string[];
}

const extractDetectionText = (text: string, threshold = 500): string => {
  const lines = text.split(/\r?\n/);
  const result: string[] = [];
  let currentLength = 0;

  for (const line of lines) {
    result.push(line);
    currentLength += line.length;
    if (currentLength > threshold) {
      break;
    }
  }

  return result.join('\n');
};

export const detectLanguage = async (
  text: string,
  config: LanguageDetectionConfig,
): Promise<string> => {
  const filteredText = extractDetectionText(text);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (config.apiKey) {
    headers.Authorization = `Bearer ${config.apiKey}`;
  }

  const body = {
    model: config.modelName,
    messages: [
      {
        role: 'system',
        content: config.systemPrompt,
      },
      { role: 'user', content: filteredText },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'language_detection',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            language: {
              type: 'string',
              enum: config.languages,
            },
          },
          required: ['language'],
          additionalProperties: false,
        },
      },
    },
  };

  const response = await fetch(`${config.apiBaseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as DetectLanguageResponse;
  console.log(
    '[LLM] Language detection response:',
    JSON.stringify(data, null, 2),
  );

  if (!data.choices?.[0]?.message?.content) {
    throw new Error('Invalid response from language detection API');
  }

  const result = JSON.parse(
    data.choices[0].message.content,
  ) as DetectedLanguage;
  return result.language;
};
