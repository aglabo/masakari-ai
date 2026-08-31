# masakari-ai

A cross-platform CLI for unified LLM invocation across CLI and OpenAI-compatible backends.

`masakari` provides a small, consistent interface for invoking different LLM backends.
It does not expose backend-specific execution details to callers.

## Features

- Unified LLM invocation through a single `masakari` command
- Support for CLI-based and OpenAI-compatible HTTP backends
- Model selection using `<provider>/<model>` identifiers
- Prompt input from stdin or a file
- Machine-readable JSON output
- Configuration through global and project-local config files
- Environment-variable based secret management
- Cross-platform support for Windows, macOS, and Linux

## Usage

Pass a prompt through stdin:

```sh
echo "Explain this code." | masakari run -m local/llama
```

Or read the prompt from a file:

```sh
masakari run -m local/llama --file prompt.md
```

The command writes a JSON response to stdout:

```json
{
  "error": null,
  "reason": null,
  "content": "..."
}
```

Diagnostics and backend-specific errors are written to stderr.

## Model Specification

Models are identified using the following format:

```text
<provider>/<model>
```

Examples:

```text
local/llama
claude/sonnet
codex/gpt-5.3-codex
```

The logical model name is resolved through the masakari configuration.
This lets callers use stable model identifiers independent of backend-specific model names.

## Configuration

masakari uses YAML configuration files.

### Global Configuration

masakari follows XDG configuration conventions when available:

```text
$XDG_CONFIG_HOME/masakari/config.yaml
```

Default locations are:

```text
Linux/macOS: ~/.config/masakari/config.yaml
Windows: %APPDATA%/masakari/config.yaml
```

### Project Configuration

A project can provide its own configuration at:

```text
<git-root>/.config/masakari/config.yaml
```

Configuration precedence is:

```text
built-in defaults
< global config
< project config
< environment variables
< CLI options
```

### Example

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

Secrets should not be stored directly in the configuration.

Providers that require credentials should reference environment variables:

```yaml
providers:
  openai:
    type: openai
    endpoint: https://api.openai.com/v1
    api_key_env: OPENAI_API_KEY
```

masakari reads the referenced environment variable at runtime.

## Output

masakari is designed primarily for programmatic use.

stdout contains only the response object:

```json
{
  "error": null,
  "reason": null,
  "content": "..."
}
```

The fields are:

| Field     | Description                                           |
| --------- | ----------------------------------------------------- |
| `error`   | Stable error code, or `null` on success               |
| `reason`  | Backend-provided reasoning information when available |
| `content` | Generated response content                            |

Human-readable diagnostics are written to stderr.
This keeps stdout consumable directly by scripts and other applications.

## Scope

masakari is an LLM invocation layer, not an autonomous agent.

It is responsible for:

- resolving providers and models
- invoking configured backends
- normalizing backend responses
- returning a stable machine-readable result

It does not execute:

- filesystem operations requested by a model
- Git operations requested by a model
- shell commands requested by a model
- MCP tools requested by a model
- autonomous agent loops

Callers remain responsible for interpreting responses and executing external actions.

## Development

masakari is implemented in TypeScript and runs on Deno.

Development tooling includes:

| Tool        | Description                                      |
| ----------- | ------------------------------------------------ |
| Deno        | Runtime, type checking, testing, and compilation |
| dprint      | Source and configuration formatting              |
| lefthook    | Git hook management                              |
| commitlint  | Conventional Commit validation                   |
| BetterLeaks | Secret and credential detection                  |
| secretlint  | Static secret detection                          |
| cspell      | Spell checking for source code and documentation |

Development dependencies and supporting tools are managed separately.
They are not bundled into the compiled `masakari` executable.

## Building

masakari is intended to be distributed as a standalone executable using `deno compile`.

Target platforms include:

- Windows x86_64 / ARM64
- Linux x86_64 / ARM64
- macOS x86_64 / ARM64

Build and release commands will be documented as the release workflow is established.

## Status

masakari-ai is currently under initial development.

The command-line interface, configuration schema, and backend interfaces may change.
Breaking changes can occur during the `0.x` development series.

## License

This project is licensed under the MIT License.

For more details, see [LICENSE](./LICENSE).
