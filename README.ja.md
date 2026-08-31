# masakari-ai

CLI 系バックエンドと OpenAI 互換バックエンドを、統一的な方法で呼び出すためのクロスプラットフォーム CLI。

`masakari` は、さまざまな LLM バックエンドを呼び出すための小さく一貫したインターフェースを提供する。
バックエンド固有の実行方法は、呼び出し側に公開しない。

## 特徴

- 単一の `masakari` コマンドによる統一的な LLM 呼び出し
- CLI 系バックエンドと OpenAI 互換 HTTP バックエンドのサポート
- `<provider>/<model>` 形式の識別子によるモデル選択
- stdin またはファイルからのプロンプト入力
- 機械可読な JSON 出力
- グローバル設定ファイルとプロジェクトローカル設定ファイルによる構成
- 環境変数ベースのシークレット管理
- Windows、macOS、Linux のクロスプラットフォーム対応

## 使い方

stdin からプロンプトを渡す:

```sh
echo "Explain this code." | masakari run -m local/llama
```

または、ファイルからプロンプトを読み込む:

```sh
masakari run -m local/llama --file prompt.md
```

コマンドは JSON レスポンスを stdout に出力する:

```json
{
  "error": null,
  "reason": null,
  "content": "..."
}
```

診断情報およびバックエンド固有のエラーは stderr に出力される。

## モデル指定

モデルは次の形式で識別する:

```text
<provider>/<model>
```

例:

```text
local/llama
claude/sonnet
codex/gpt-5.3-codex
```

論理モデル名は masakari の設定によって解決される。
これにより、呼び出し側はバックエンド固有のモデル名に依存しない、安定したモデル識別子を使用できる。

## 設定

masakari は YAML 設定ファイルを使用する。

### グローバル設定

masakari は、利用可能な場合は XDG の設定規約に従う:

```text
$XDG_CONFIG_HOME/masakari/config.yaml
```

デフォルトの配置場所は次のとおり:

```text
Linux/macOS: ~/.config/masakari/config.yaml
Windows: %APPDATA%/masakari/config.yaml
```

### プロジェクト設定

プロジェクトは、次の場所に独自の設定を配置できる:

```text
<git-root>/.config/masakari/config.yaml
```

設定の優先順位は次のとおり:

```text
組み込みデフォルト
< グローバル設定
< プロジェクト設定
< 環境変数
< CLI オプション
```

### 設定例

```yaml
providers:
  local:
    type: openai
    endpoint: http://avalon:8080/v1

models:
  local/llama:
    provider: local
    model: lmstudio-community/Qwen3.5-35B-A3B-GGUF:Q4_K_M
```

シークレットを設定ファイルに直接記述してはならない。

認証情報を必要とするプロバイダーは、環境変数を参照する:

```yaml
providers:
  openai:
    type: openai
    endpoint: https://api.openai.com/v1
    api_key_env: OPENAI_API_KEY
```

masakari は、参照された環境変数を実行時に読み取る。

## 出力

masakari は、主にプログラムからの利用を想定して設計されている。

stdout にはレスポンスオブジェクトのみが出力される:

```json
{
  "error": null,
  "reason": null,
  "content": "..."
}
```

各フィールドの意味は次のとおり:

| フィールド | 説明                                             |
| ---------- | ------------------------------------------------ |
| `error`    | 安定したエラーコード。成功時は `null`            |
| `reason`   | バックエンドが提供する推論情報（利用可能な場合） |
| `content`  | 生成されたレスポンス本文                         |

人間向けの診断情報は stderr に出力される。
これにより、stdout はスクリプトや他のアプリケーションからそのまま利用できる。

## スコープ

masakari は LLM 呼び出しレイヤーであり、自律エージェントではない。

masakari が担うのは次の処理:

- プロバイダーとモデルの解決
- 設定されたバックエンドの呼び出し
- バックエンドレスポンスの正規化
- 安定した機械可読な結果の返却

次の処理は実行しない:

- モデルが要求したファイルシステム操作
- モデルが要求した Git 操作
- モデルが要求したシェルコマンド
- モデルが要求した MCP ツール
- 自律的なエージェントループ

レスポンスの解釈と外部アクションの実行は、引き続き呼び出し側の責務とする。

## 開発

masakari は TypeScript で実装され、Deno 上で動作する。

開発用ツールは次のとおり:

| ツール      | 説明                                       |
| ----------- | ------------------------------------------ |
| Deno        | ランタイム、型チェック、テスト、コンパイル |
| dprint      | ソースコードと設定ファイルのフォーマット   |
| lefthook    | Git フックの管理                           |
| commitlint  | Conventional Commits 形式の検証            |
| BetterLeaks | シークレット・認証情報の検出               |
| secretlint  | シークレットの静的検出                     |
| cspell      | ソースコードとドキュメントのスペルチェック |

開発用の依存関係および補助ツールは、本体とは別に管理される。
これらはコンパイル済みの `masakari` 実行ファイルには同梱されない。

## ビルド

masakari は、`deno compile` によるスタンドアロン実行ファイルとしての配布を想定している。

対象プラットフォームは次のとおり:

- Windows x86_64 / ARM64
- Linux x86_64 / ARM64
- macOS x86_64 / ARM64

ビルドコマンドとリリースコマンドは、リリースワークフローの整備にあわせて文書化する。

## ステータス

masakari-ai は現在、初期開発中である。

コマンドラインインターフェース、設定スキーマ、バックエンドインターフェースは変更される可能性がある。
`0.x` 開発シリーズの期間中は、破壊的変更が発生しうる。

## ライセンス

このプロジェクトは MIT ライセンスのもとで提供されている。

詳細は [LICENSE.ja](./LICENSE.ja)（原文: [LICENSE](./LICENSE)）を参照。
