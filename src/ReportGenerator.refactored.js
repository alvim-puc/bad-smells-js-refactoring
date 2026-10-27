const ROLES = Object.freeze({ ADMIN: 'ADMIN', USER: 'USER' });
const REPORT_TYPES = Object.freeze({ CSV: 'CSV', HTML: 'HTML' });

const PRIORITY_THRESHOLD = 1000;
const USER_MAX_VALUE = 500;

// Regra de visibilidade por perfil: quais itens cada um enxerga.
const VISIBILITY_RULES = Object.freeze({
  [ROLES.ADMIN]: () => true,
  [ROLES.USER]: (item) => item.value <= USER_MAX_VALUE,
});

class CsvFormatter {
  header() {
    return 'ID,NOME,VALOR,USUARIO\n';
  }

  row(item, user) {
    return `${item.id},${item.name},${item.value},${user.name}\n`;
  }

  footer(total) {
    return `\nTotal,,\n${total},,\n`;
  }
}

class HtmlFormatter {
  header(user) {
    return (
      '<html><body>\n' +
      '<h1>Relatório</h1>\n' +
      `<h2>Usuário: ${user.name}</h2>\n` +
      '<table>\n' +
      '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n'
    );
  }

  row(item, user, highlighted) {
    // O atributo carrega o próprio espaço separador: sem destaque gera "<tr>", não "<tr >".
    const attrs = highlighted ? ' style="font-weight:bold;"' : '';
    return `<tr${attrs}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
  }

  footer(total) {
    return `</table>\n<h3>Total: ${total}</h3>\n</body></html>\n`;
  }
}

const FORMATTERS = Object.freeze({
  [REPORT_TYPES.CSV]: new CsvFormatter(),
  [REPORT_TYPES.HTML]: new HtmlFormatter(),
});

export class ReportGenerator {
  /**
   * Gera um relatório de itens baseado no tipo e no usuário.
   * - Admins veem tudo.
   * - Users comuns só veem itens com valor <= 500.
   */
  generateReport(reportType, user, items) {
    const formatter = FORMATTERS[reportType];
    if (!formatter) {
      return '';
    }

    const visibleItems = this.filterVisibleItems(user, items);
    const total = this.calculateTotal(visibleItems);

    return [
      formatter.header(user),
      this.buildBody(formatter, user, visibleItems),
      formatter.footer(total),
    ]
      .join('')
      .trim();
  }

  filterVisibleItems(user, items) {
    const isVisible = VISIBILITY_RULES[user.role];
    return isVisible ? items.filter(isVisible) : [];
  }

  calculateTotal(items) {
    return items.reduce((sum, item) => sum + item.value, 0);
  }

  buildBody(formatter, user, items) {
    return items
      .map((item) => formatter.row(item, user, this.isPriority(user, item)))
      .join('');
  }

  // Só admins têm itens destacados; o objeto recebido não é mais alterado.
  isPriority(user, item) {
    return user.role === ROLES.ADMIN && (item.priority || item.value > PRIORITY_THRESHOLD);
  }
}
