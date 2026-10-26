# Etapa 2 — Análise Manual (Caça aos Smells)

Arquivo analisado: `src/ReportGenerator.js`

O enunciado pede a identificação manual de **pelo menos 3 tipos diferentes** de Bad Smells. Foram identificados 5:

| # | Bad Smell | Linhas |
|---|-----------|--------|
| 1 | Método Longo | 11–68 |
| 2 | Muitos `if/else` (complexidade alta) | 16–65 |
| 3 | Números e strings mágicos | 16, 18, 28, 30, 43, 45, 58, 61 |
| 4 | Código Duplicado | 36–37, 40–41, 47–48, 50–51 |
| 5 | Atributo não usado (`db`) | 2–4 |

---

## 1. Método Longo

`generateReport` concentra cabeçalho, filtro por permissão, formatação das linhas, cálculo do total e rodapé em um único método de ~60 linhas.

```js
generateReport(reportType, user, items) {
  let report = '';
  let total = 0;

  // --- Seção do Cabeçalho ---
  ...
  // --- Seção do Corpo (Alta Complexidade) ---
  ...
  // --- Seção do Rodapé ---
  ...
  return report.trim();
}
```

**Por que é um problema:** faz coisas demais (viola o princípio de responsabilidade única), é difícil de ler e só dá para testá-lo inteiro. Os comentários `// --- Seção ... ---` já indicam onde estão os limites de métodos que deveriam existir.

**Como resolver (Extract Method):** extrair um método para cada seção, deixando `generateReport` só como orquestrador:

```js
generateReport(reportType, user, items) {
  const visibleItems = this.filterItemsByRole(user, items);
  const total = this.calculateTotal(visibleItems);

  return [
    this.buildHeader(reportType, user),
    this.buildBody(reportType, user, visibleItems),
    this.buildFooter(reportType, total),
  ].join('').trim();
}
```

---

## 2. Muitos `if/else` (complexidade ciclomática/cognitiva alta)

O corpo do `for` aninha até 4 níveis: `for` → `if role` → `if value` → `if reportType`. Além disso, `reportType === 'CSV'` / `'HTML'` é testado em três lugares (cabeçalho, corpo e rodapé).

```js
for (const item of items) {
  if (user.role === 'ADMIN') {
    if (item.value > 1000) { ... }
    if (reportType === 'CSV') { ... }
    else if (reportType === 'HTML') { ... }
  } else if (user.role === 'USER') {
    if (item.value <= 500) {
      if (reportType === 'CSV') { ... }
      else if (reportType === 'HTML') { ... }
    }
  }
}
```

**Por que é um problema:** a complexidade cognitiva é alta (o `sonarjs/cognitive-complexity` deve apontar isso). Cada novo formato ou perfil de usuário obriga a editar vários pontos e multiplica os caminhos a testar.

**Como resolver:**
- **Decompose Conditional / guard clauses:** separar a regra de visibilidade (quem vê o quê) do loop de formatação, por exemplo em `filterItemsByRole`.
- **Replace Conditional with Polymorphism (Strategy):** criar uma classe por formato (`CsvFormatter`, `HtmlFormatter`) com `header()`, `row()` e `footer()`, e escolher a implementação uma única vez, em um mapa `{ CSV: ..., HTML: ... }`, em vez de repetir `if (reportType === ...)`.

---

## 3. Números e strings mágicos

Valores com significado de negócio aparecem soltos no código:

```js
if (item.value > 1000)         // limite de prioridade do admin
if (item.value <= 500)         // limite de visibilidade do usuário comum
user.role === 'ADMIN'          // 'USER'
reportType === 'CSV'           // 'HTML'
```

**Por que é um problema:** quem lê não sabe o que `1000` e `500` representam. Uma string digitada errada (`'Admin'`, `'csv'`) falha silenciosamente, e mudar uma regra exige procurar o valor em vários pontos.

**Como resolver (Replace Magic Number with Symbolic Constant):** nomear os valores como constantes:

```js
const PRIORITY_THRESHOLD = 1000;
const USER_MAX_VALUE = 500;

const ROLES = Object.freeze({ ADMIN: 'ADMIN', USER: 'USER' });
const REPORT_TYPES = Object.freeze({ CSV: 'CSV', HTML: 'HTML' });
```

---

## 4. Código Duplicado

A mesma linha de CSV, a mesma linha de HTML e o `total += item.value` são repetidos nos ramos ADMIN e USER:

```js
// ADMIN
report += `${item.id},${item.name},${item.value},${user.name}\n`;
total += item.value;
...
// USER (idêntico)
report += `${item.id},${item.name},${item.value},${user.name}\n`;
total += item.value;
```

O mesmo ocorre com `<tr><td>...</td></tr>` e com o `total +=`, que aparece 4 vezes.

**Por que é um problema:** uma correção ou mudança de formato precisa ser feita em vários lugares, e é fácil esquecer um e deixar os ramos inconsistentes (violação do DRY).

**Como resolver (Extract Method + Pull Up):**
- Separar **filtragem** de **formatação**: primeiro decidir quais itens o usuário vê; depois formatar todos do mesmo jeito, sem repetir por perfil.
- Extrair `formatRow(item, user)` por formato.
- Calcular o total uma única vez: `visibleItems.reduce((sum, item) => sum + item.value, 0)`.

---

## 5. Atributo não usado (`db`)

```js
constructor(database) {
  this.db = database;
}
```

`this.db` nunca é lido em nenhum método da classe.

**Por que é um problema:** é código morto que sugere uma dependência que não existe. Isso confunde quem lê e obriga os chamadores a fornecer um `database` desnecessário.

**Como resolver (Remove Dead Code):** remover o atributo. Cuidado: os testes podem instanciar `new ReportGenerator(db)`, então confirmar isso antes. Se for o caso, manter o parâmetro do construtor sem armazená-lo ou ignorá-lo explicitamente, já que a regra do trabalho é não alterar os testes.

---

## Observações extras (fora do foco pedido)

- `item.priority = true` (linha 32) **altera o objeto recebido por parâmetro** (efeito colateral). A flag persiste entre chamadas.
- `reportType` ou `role` desconhecidos geram saída vazia ou parcial, sem erro.
- Nenhum valor é escapado no HTML (`user.name`, `item.name`).
