# Etapa 3 — Configuração da Ferramenta (ESLint + SonarJS)

## Dependências

Já declaradas em `devDependencies` no `package.json` e instaladas com `npm install` (etapa 1):

| Pacote | Versão instalada |
|--------|------------------|
| `eslint` | 8.57.1 |
| `eslint-plugin-sonarjs` | 0.21.0 |

O comando equivalente do enunciado seria `npm install --save-dev eslint eslint-plugin-sonarjs`; não foi preciso rodá-lo de novo.

## Arquivo `.eslintrc.json`

O arquivo já existe na raiz do repositório, com `sonarjs/recommended` ativado. Há duas diferenças em relação ao modelo do enunciado:

| Regra | Enunciado | Repositório |
|-------|-----------|-------------|
| `sonarjs/cognitive-complexity` | `["error", 15]` | `["error", 5]` |
| `sonarjs/no-duplicated-branches` | — | `"error"` |

O limite de 5 é mais rígido que o de 15, então a ferramenta aponta mais problemas. A configuração do repositório foi mantida.

## Verificação

`npx eslint src/` executa sem erro de configuração e o plugin é carregado, reportando:

- `sonarjs/cognitive-complexity`: complexidade 27 (limite 5) em `generateReport`.
- `sonarjs/no-collapsible-if`: `if` aninhado que poderia ser unido (`ReportGenerator.js:43`).

A análise detalhada e a comparação com a análise manual são o conteúdo da etapa 4.
