# terminaltranslator

English | [Japanese](./README_ja.md)

A simple terminal translation tool.

## Features

- **TUI**: Interactive Terminal User Interface for seamless operation.
- **History Navigation**: Easily access previous translations using arrow keys.
- **Auto Language Detection**: Automatically detects input language and applies the appropriate translation context.

## Installation

This tool requires **Bun** to be installed on your system.

```bash
bun install -g @termlabs/terminaltranslator
```

## Prerequisites

This tool requires **Bun** to be installed on your system.
It also assumes you are using an LLM server like **LM Studio** or **Ollama** that supports the following endpoints:
- `/v1/chat/completions` (for language detection)
- `/v1/responses` (for translation)

### Recommended Models (GGUF)
These are the specific models recommended for use with this tool:
- **Translation**: `tencent/HY-MT1.5-1.8B-GGUF:Q4_K_M`
- **Language Detection**: `unsloth/Qwen3-0.6B-GGUF:Q4_K_M`

> [!NOTE]
> You should download and load these models into your LLM server (LM Studio, Ollama, etc.) before running the tool.

## Setup

Upon the first run or if `settings.json` is missing, a setup wizard will guide you through the configuration.

Configuration files are stored at:
- **macOS/Linux**: `~/.config/terminaltranslator/settings.json`
- **Windows**: `%LOCALAPPDATA%\terminaltranslator\Config\settings.json`

### Configuration Items

- **API Base URL**: The base URL of your LLM server (e.g., `http://localhost:1234`).
- **API Key**: Optional API key if required by your server.
- **Translation Model Name**: The identifier of the loaded translation model in your local server (e.g., `hy-mt1.5-1.8b`).
- **Languages**: Comma-separated list of languages you want to translate between (e.g., `English, Japanese`).
- **System Prompts**: Specific instructions for the LLM when translating from each language.
- **Language Detection Model Name**: The identifier of the loaded detection model in your local server (e.g., `qwen3-0.6b`).
- **Language Detection System Prompt**: Instructions for the model to classify the input language.

## Usage

Run the following command in your terminal:

```bash
terminaltranslator
```

### Tip: Use as `tt`
If you want to use a shorter command like `tt`, add an alias to your shell configuration:

- **macOS / Linux (zsh or bash)**:
  Add this to your `~/.zshrc` or `~/.bashrc`:
  ```bash
  alias tt='terminaltranslator'
  ```
- **Windows (PowerShell)**:
  Add this to your `$PROFILE`:
  ```powershell
  Set-Alias tt terminaltranslator
  ```

### Key Bindings

| Key | Action |
| :--- | :--- |
| **Enter** | Translate input text |
| **Ctrl + J** | Insert newline |
| **Up / Down** | Navigate through translation history |
| **Ctrl + C** | Copy selection or full text to clipboard |
| **Ctrl + D** | Clear input text |
| **Esc** | Exit application |

## Development

### Build from source

```bash
bun run build
```

The optimized bundle and necessary assets will be generated in the `dist` directory.

## License

MIT
