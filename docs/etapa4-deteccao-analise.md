# Etapa 4 — Detecção Automática e Análise

## Execução

```
npx eslint src/
```

Saída completa (usada como "print" do relatório) em [`etapa4-saida-eslint`](etapa4-saida-eslint):

```
/home/alvim/codes/bad-smells-js-refactoring/src/ReportGenerator.js
  11:3   error  Refactor this function to reduce its Cognitive Complexity from 27 to the 5 allowed  sonarjs/cognitive-complexity
  43:14  error  Merge this if statement with the nested one                                         sonarjs/no-collapsible-if

✖ 2 problems (2 errors, 0 warnings)
```

Foram reportados 2 problemas, ambos em `src/ReportGenerator.js`. A configuração usada é a do repositório (limite 5 de complexidade cognitiva, ver etapa 3). Com o limite 15 do enunciado (`--rule '{"sonarjs/cognitive-complexity":["error",15]}'`), a saída tem os mesmos dois problemas, porque 27 também excede 15.

## O que a ferramenta apontou

### 1. `sonarjs/cognitive-complexity` — linha 11 (`generateReport`)

Complexidade cognitiva **27** (limite 5). A métrica soma +1 por estrutura de controle e acrescenta uma penalidade crescente por nível de aninhamento. O `for` → `if role` → `if value` → `if reportType` pesa muito por isso. O ternário de `item.priority` e os três blocos `if/else if` sobre `reportType` (cabeçalho, corpo, rodapé) também entram na soma.

### 2. `sonarjs/no-collapsible-if` — linha 43 (`if (item.value <= 500)`)

```js
} else if (user.role === 'USER') {
  if (item.value <= 500) {
```

O `if` interno é a única instrução do `else if`, então as condições poderiam ser unidas (`else if (user.role === 'USER' && item.value <= 500)`). É um problema menor, mas confirma o aninhamento desnecessário.

## Comparação com a análise manual (etapa 2)

| # | Smell da análise manual | Detectado pelo ESLint? | Regra / observação |
|---|-------------------------|------------------------|--------------------|
| 1 | Método Longo | Não diretamente | Não há regra de tamanho de método nas regras ativas. Aparece indiretamente no 27 de complexidade cognitiva do mesmo método. |
| 2 | Muitos `if/else` / complexidade alta | **Sim** | `sonarjs/cognitive-complexity` (27 > 5) |
| 3 | Números e strings mágicos | Não | Nenhuma regra ativa cobre isso (`no-magic-numbers` do ESLint core não está habilitada). |
| 4 | Código Duplicado | Não | `sonarjs/no-identical-functions` e `sonarjs/no-duplicated-branches` não dispararam: a duplicação são linhas repetidas em ramos diferentes (ADMIN vs USER, CSV vs HTML), não funções ou ramos de `if` inteiros idênticos. |
| 5 | Atributo não usado (`db`) | Não | `no-unused-vars` só cobre variáveis e parâmetros, não propriedades de instância. |

Achado só da ferramenta: `no-collapsible-if` (linha 43). Na análise manual, o aninhamento foi apontado em geral (smell 2), mas não esse caso específico.

## Análise

- **A ferramenta confirmou o smell central.** O número exato (27) quantifica o que a leitura manual só indicava como "muitos `if/else`". Esse valor ajuda a verificar na etapa 6 se a refatoração reduziu a complexidade.
- **A análise manual cobriu mais smells.** O ESLint encontrou 1 dos 5 smells manuais (mais um problema extra). Magic numbers, duplicação por linha e atributo morto só foram vistos pela leitura, porque dependem de significado de negócio ou de duplicação "semântica" que as regras ativas não detectam.
- **Resultado da etapa:** as duas abordagens se complementam. A ferramenta é objetiva e repetível (dá para rodar em CI); a leitura manual pega o que as regras não modelam.
- **Para a etapa 6:** o alvo é zerar os dois erros em `ReportGenerator.refactored.js`, ou seja, manter cada método com complexidade ≤ 5 e eliminar o `if` colapsável.
