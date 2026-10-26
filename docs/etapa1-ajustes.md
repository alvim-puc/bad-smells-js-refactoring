# Etapa 1 — Ajustes na Rede de Segurança

Objetivo da etapa 1: `npm install` + `npm test` com 100% dos testes passando.
Ao executar, apareceram dois problemas distintos.

## Problema 1 — Jest não executa (corrigido)

**Saída original:** `docs/etapa1-saida-testes`

```
SyntaxError: Cannot use import statement outside a module
Test Suites: 1 failed, 1 total
Tests:       0 total
```

**Causa:** o `package.json` declara `"type": "module"` e `"jest": { "transform": {} }`, ou seja, o projeto usa ES Modules nativos, sem Babel. Nesse modo o Jest só consegue carregar `import`/`export` se o Node rodar com `--experimental-vm-modules`. O script `"test": "jest"` não passava essa flag.

**Correção (`package.json`):**

```diff
- "test": "jest",
+ "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js",
```

Foi escolhido chamar o `node` diretamente, em vez de `NODE_OPTIONS=... jest`, porque a segunda forma não funciona no `cmd` do Windows. Os arquivos de teste não foram alterados.

## Problema 2 — Um teste falha no código original (não corrigido)

**Saída após o ajuste:** `docs/etapa1-saida-testes-apos-ajuste` (4 passam, 1 falha).

```
✕ deve gerar um relatório HTML completo para Admin (com prioridade)

Expected substring: "<tr><td>1</td><td>Produto A</td><td>300</td></tr>"
Received:           "<tr ><td>1</td><td>Produto A</td><td>300</td></tr>"
```

**Causa:** em `src/ReportGenerator.js:39-40` o código monta `<tr ${style}>`. Quando o item não tem prioridade, `style` é `''` e sobra um espaço: `<tr >`. O teste espera `<tr>`.

**Decisão:** o enunciado manda **não modificar o arquivo original** e fazer a refatoração em `src/ReportGenerator.refactored.js`. Por isso o bug foi mantido no original. Ele é um comportamento que o teste considera incorreto e deve ser corrigido na versão refatorada, por exemplo:

```js
const attrs = item.priority ? ' style="font-weight:bold;"' : '';
`<tr${attrs}><td>...`
```

Consequência: o `ReportGenerator.js` original continuará falhando nesse teste. Isso torna a validação da etapa 6 ("ambos os arquivos passam") inalcançável para o original, a menos que o professor aceite essa exceção ou o espaço seja corrigido também no original. Vale registrar isso no relatório.

## Resultado atual

| Item | Antes | Depois |
|------|-------|--------|
| Suíte executa | Não (erro de sintaxe) | Sim |
| Testes passando | 0 de 0 (suíte não rodou) | 4 de 5 |
| Falha restante | — | Espaço em `<tr >` (original) |
