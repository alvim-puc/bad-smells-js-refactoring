# Etapa 6 — Validação Final

Saídas salvas em `docs/`:

| Arquivo | Comando | Código de saída |
|---------|---------|-----------------|
| `etapa6-saida-eslint-refatorado` | `npx eslint src/ReportGenerator.refactored.js` | 0 (sem saída: nenhum problema) |
| `etapa6-saida-eslint-src` | `npx eslint src/` | 1 (2 erros, ambos no arquivo original) |
| `etapa6-saida-testes` | `npm test` | 1 (1 falha, no teste do arquivo original) |

## ESLint

| Arquivo | Complexidade cognitiva | Erros |
|---------|------------------------|-------|
| `ReportGenerator.js` (original) | 27 (limite 5) | 2: `cognitive-complexity` e `no-collapsible-if` |
| `ReportGenerator.refactored.js` | todos os métodos dentro do limite 5 | **0** |

Os dois erros da etapa 4 foram eliminados, com o limite de 5 do repositório (mais rígido que o 15 do enunciado).

## Testes

```
PASS tests/ReportGenerator.refactored.test.js
FAIL tests/ReportGenerator.test.js
Tests: 1 failed, 9 passed, 10 total
```

- **Refatorado:** 5 de 5 passam, incluindo o teste HTML que esperava `<tr>` e antes recebia `<tr >`.
- **Original:** 4 de 5 passam. A falha é a do espaço em `<tr >` (etapa 1), mantida de propósito porque o enunciado proíbe alterar o arquivo original. Por isso o `npm test` completo termina com código 1.

O item 3 da etapa pede que "ambos os arquivos passem". Isso só é possível para o arquivo refatorado. Para o original passar também, bastaria corrigir o `<tr ${style}>` nele, o que contraria a regra de não modificá-lo. Convém registrar isso no relatório.

## Pendente

O push para o GitHub (item 4 da etapa) não foi feito.
