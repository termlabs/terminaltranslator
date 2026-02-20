# terminaltranslator

[English](./README.md) | Japanese

シンプルなターミナル用翻訳ツールです。

## 特徴

- **TUI**: インタラクティブなターミナル UI でスムーズに操作できます。
- **履歴機能**: 矢印キーで過去の翻訳履歴に簡単にアクセスできます。
- **自動言語判定**: 入力言語を自動判別し、適切な翻訳コンテキストを適用します。

## インストール

このツールの実行には **Bun** が必要です。

```bash
bun install -g @termlabs/terminaltranslator
```

## 前提条件

このツールの使用には **Bun** のインストールが必要です。
また、以下のエンドポイントをサポートする **LM Studio** や **Ollama** などの LLM サーバーが動作していることを前提としています：
- `/v1/chat/completions` （言語判定用）
- `/v1/responses` （翻訳用）

### 推奨モデル (GGUF)
以下のモデルの使用を推奨しています。
- **翻訳用**: `tencent/HY-MT1.5-1.8B-GGUF:Q4_K_M`
- **言語判定用**: `unsloth/Qwen3-0.6B-GGUF:Q4_K_M`

> [!NOTE]
> これらのモデルをあらかじめダウンロードし、LM Studio や Ollama などのサーバーにロードしておく必要があります。

## 設定

初回起動時、または `settings.json` が存在しない場合、設定ウィザードが開始されます。

設定ファイルは OS ごとに以下の場所に保存されます：
- **macOS/Linux**: `~/.config/terminaltranslator/settings.json`
- **Windows**: `%LOCALAPPDATA%\terminaltranslator\Config\settings.json`

### 設定項目

- **API Base URL**: LLM サーバーのベース URL（例: `http://localhost:1234`）。
- **API Key**: サーバーで必要な場合の API キー（任意）。
- **Translation Model Name**: ローカルサーバーにロードした翻訳用モデルの識別子（例: `hy-mt1.5-1.8b`）。
- **Languages**: 翻訳対象とする言語のカンマ区切りリスト（例: `English, Japanese`）。
- **System Prompts**: 各言語から翻訳する際の LLM への指示事項。
- **Language Detection Model Name**: ローカルサーバーにロードした言語判定用モデルの識別子（例: `qwen3-0.6b`）。
- **Language Detection System Prompt**: 言語判定時にモデルに与えるシステムプロンプト。

## 使い方

ターミナルで以下のコマンドを実行します：

```bash
terminaltranslator
```

### ヒント: `tt` として使う
より短い `tt` コマンドで起動したい場合は、シェルの設定ファイルにエイリアスを追加してください：

- **macOS / Linux (zsh または bash)**:
  `~/.zshrc` や `~/.bashrc` に以下を追記します：
  ```bash
  alias tt='terminaltranslator'
  ```
- **Windows (PowerShell)**:
  `$PROFILE` に以下を追記します：
  ```powershell
  Set-Alias tt terminaltranslator
  ```

### パイプモード

標準入力（stdin）からテキストを渡して翻訳することが可能です。

実行例: ファイルの内容を翻訳する

```bash
cat README.md | terminaltranslator
```

実行例: クリップボードの内容を翻訳する (macOS)

```bash
pbpaste | terminaltranslator
```

### キーバインド

| キー | 動作 |
| :--- | :--- |
| **Enter** | 入力テキストを翻訳 |
| **Ctrl + J** | 改行を挿入 |
| **Up / Down** | 履歴のナビゲーション |
| **Ctrl + C** | 選択範囲または全文をクリップボードにコピー |
| **Ctrl + D** | 入力テキストを消去 |
| **Esc** | アプリを終了 |

## 開発

### ソースコードからビルド

```bash
bun run build
```

最適化されたバンドルと必要なアセットが `dist` ディレクトリに生成されます。

## ライセンス

MIT
