import {
  Box,
  ConsolePosition,
  createCliRenderer,
  type KeyEvent,
  type PasteEvent,
  Text,
  TextareaRenderable,
} from '@opentui/core';
import clipboardy from 'clipboardy';
import { detectLanguage } from './detect.ts';
import { add, get, getHistoryLength } from './history.ts';
import type { Settings } from './setup.ts';

// settings.json is now managed by the entry point

interface ApiResponse {
  output?: Array<{
    content?: Array<{
      type: string;
      text?: string;
    }>;
  }>;
}

interface CursorChangeEvent {
  line: number;
  visualColumn: number;
}

export const runApp = async (
  settings: Settings,
  isDebug = false,
): Promise<void> => {
  const renderer = await createCliRenderer({
    consoleOptions: {
      position: ConsolePosition.BOTTOM,
      sizePercent: 30,
    },
    exitOnCtrlC: false,
  });

  if (isDebug) {
    renderer.console.show();
  }

  const textarea = new TextareaRenderable(renderer, {
    id: 'styled-textarea',
    width: '100%',
    flexGrow: 1,
    flexShrink: 1,
    wrapMode: 'word',
    keyBindings: [
      { name: 'return', action: 'submit' }, // Press Enter to send
    ],
  });

  let lastCtrlCTime: number | null = null;
  let historyIndex: number = -1;

  textarea.onKeyDown = (key: KeyEvent) => {
    if (key.ctrl && key.name === 'c') {
      const textToCopy = textarea.hasSelection()
        ? textarea.getSelectedText()
        : textarea.plainText;
      clipboardy.write(textToCopy);
      key.preventDefault();
      return;
    }

    if (key.name === 'escape') {
      renderer.destroy();
      process.exit(0);
    }

    // History navigation with arrow keys
    if (key.name === 'up') {
      if (getHistoryLength() > 0) {
        if (historyIndex === -1) {
          historyIndex = getHistoryLength() - 1;
        } else if (historyIndex > 0) {
          historyIndex--;
        }
        const msg = get(historyIndex);
        if (msg) {
          textarea.setText(msg.content);
        }
      }
      return;
    }

    if (key.name === 'down') {
      if (getHistoryLength() > 0 && historyIndex !== -1) {
        if (historyIndex < getHistoryLength() - 1) {
          historyIndex++;
          const msg = get(historyIndex);
          if (msg) {
            textarea.setText(msg.content);
          }
        } else if (historyIndex === getHistoryLength() - 1) {
          historyIndex = -1;
          textarea.setText('');
        }
      }
      return;
    }
  };

  textarea.onSubmit = async () => {
    const inputText = textarea.plainText;

    // Add user message to history
    add(inputText, 'user');

    // Detect language of input text
    const detectedLanguage = await detectLanguage(inputText, {
      apiBaseUrl: settings.apiBaseUrl,
      apiKey: settings.apiKey,
      modelName: settings.languageDetection.modelName,
      systemPrompt: settings.languageDetection.systemPrompt,
      languages: settings.translation.languages,
    });

    // Get system prompt for detected language
    const systemPrompt = settings.translation.systemPrompts[detectedLanguage];

    if (!systemPrompt) {
      console.error(`No system prompt found for language: ${detectedLanguage}`);
      return;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (settings.apiKey) {
      headers.Authorization = `Bearer ${settings.apiKey}`;
    }

    const body = {
      model: settings.translation.modelName,
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

    console.log('[LLM] Calling translation API');
    const response = await fetch(`${settings.apiBaseUrl}/v1/responses`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const data = (await response.json()) as ApiResponse;

    // Extract response text from the API response
    const outputText = data.output?.[0]?.content?.find(
      (c) => c.type === 'output_text',
    )?.text;
    const responseText = outputText ?? JSON.stringify(data);
    textarea.setText(responseText);

    // Add assistant message to history and update historyIndex
    add(responseText, 'assistant');
    historyIndex = getHistoryLength() - 1;
  };

  textarea.onCursorChange = (_event: CursorChangeEvent) => {};

  textarea.onContentChange = () => {};

  textarea.onPaste = (_event: PasteEvent) => {};

  textarea.focus();

  // Create main layout with shortcut guide at the top
  renderer.root.add(
    Box(
      {
        flexDirection: 'column',
        width: '100%',
        height: '100%',
      },
      textarea,
      Box(
        {
          height: 1,
          flexShrink: 0,
        },
        Text({
          content:
            'esc: Exit | enter: Translate | ctrl+j: Newline | ctrl+c: Copy | up,down: History',
          fg: '#888888',
        }),
      ),
    ),
  );
};
