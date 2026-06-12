/** @param {string | any[]} tokens */
export function buildAST(tokens) {
  let current = 0;

  const peek = () => tokens[current];
  const consume = () => tokens[current++];
  const match = (/** @type {string} */ type, /** @type {string | undefined} */ value) => {
    const t = peek();
    if (!t) {
      return false;
    }

    if (t.type !== type) {
      return false;
    }

    if (value !== undefined && t.value !== value) {
      return false;
    }

    current++;
    return true;
  };

  const parseSliceOrIndex = () => {
    let start = null;

    if (!(peek()?.type === 'Colon' || peek()?.type === 'Comma' || peek()?.type === 'ArrayEnd')) {
      start = parseExpression();
    }

    if (match('Colon', undefined)) {
      let end = null;

      if (!(peek()?.type === 'Comma' || peek()?.type === 'ArrayEnd')) {
        end = parseExpression();
      }

      return {
        type: 'SliceExpression',
        start,
        end,
      };
    }

    return start;
  };

  function parsePrimary() {
    const token = consume();
    if (!token) {
      throw new Error('Unexpected end of input');
    }

    switch (token.type) {
      case 'Number':
      case 'BigInt':
      case 'Boolean':
      case 'String':
        return { type: 'Literal', value: token.value };

      case 'ImaginaryLiteral':
        return { type: 'ImaginaryLiteral', value: token.value };

      case 'NumberWithUnit':
        return {
          type: 'UnitLiteral',
          value: token.value,
          unit: token.unit,
        };

      case 'Identifier':
        return { type: 'Identifier', name: token.name };

      case 'Function':
        return {
          type: 'Identifier',
          name: token.name,
        };

      case 'Parenthesis':
        if (token.value === '(') {
          const expr = parseExpression();

          if (!match('Parenthesis', ')')) {
            throw new Error(`Expected ')'`);
          }

          return expr;
        }

      // falls through

      case 'ArrayStart': {
        const rows = [];
        let currentRow = [];

        if (!match('ArrayEnd', undefined)) {
          while (true) {
            currentRow.push(parseExpression());

            if (match('Comma', undefined)) {
              continue;
            }

            if (match('Semicolon', undefined)) {
              rows.push(currentRow);
              currentRow = [];
              continue;
            }

            if (match('ArrayEnd', undefined)) {
              rows.push(currentRow);
              break;
            }

            throw new Error(`Expected ',', ';', or ']' at ${current}`);
          }
        }

        if (!rows.length) {
          return { type: 'ArrayExpression', elements: [] };
        }

        if (rows.length === 1) {
          return { type: 'ArrayExpression', elements: rows[0] };
        }

        return {
          type: 'ArrayExpression',
          elements: rows.map((elements) => ({
            type: 'ArrayExpression',
            elements,
          })),
        };
      }

      case 'BlockStart': {
        const properties = [];

        if (!match('BlockEnd', undefined)) {
          do {
            const keyToken = consume();

            if (keyToken.type !== 'Identifier' && keyToken.type !== 'String') {
              throw new Error('Invalid object key');
            }

            if (!match('Colon', undefined)) {
              throw new Error("Expected ':' after key");
            }

            const value = parseExpression();

            properties.push({
              key: keyToken.value,
              value,
            });
          } while (match('Comma', undefined));

          if (!match('BlockEnd', undefined)) {
            throw new Error(`Expected '}' at ${current}`);
          }
        }

        return { type: 'ObjectExpression', properties };
      }
    }

    throw new Error(`Unexpected token: ${JSON.stringify(token)}`);
  }

  function parseMember() {
    let object = parsePrimary();

    while (true) {
      if (match('ArrayStart', undefined)) {
        const selectors = [];

        if (!match('ArrayEnd', undefined)) {
          do {
            selectors.push(parseSliceOrIndex());
          } while (match('Comma', undefined));

          if (!match('ArrayEnd', undefined)) {
            throw new Error(`Expected ']' at ${current}`);
          }
        }

        object = {
          type: 'IndexExpression',
          object,
          selectors,
        };
        continue;
      }

      if (match('Dot', undefined)) {
        const property = consume();

        if (property.type !== 'Identifier') {
          throw new Error("Expected property after '.'");
        }

        object = {
          type: 'MemberExpression',
          object,
          property: { type: 'Identifier', name: property.value },
          optional: false,
        };
        continue;
      }

      if (match('Operator', '?.')) {
        const property = consume();

        object = {
          type: 'MemberExpression',
          object,
          property: { type: 'Identifier', name: property.value },
          optional: true,
        };
        continue;
      }

      break;
    }

    return object;
  }

  function parseCallChain() {
    let expr = parseMember();

    while (peek()?.type === 'Parenthesis' && peek()?.value === '(') {
      consume();

      const args = [];

      if (!(peek()?.type === 'Parenthesis' && peek()?.value === ')')) {
        do {
          if (match('Spread', undefined)) {
            const arg = parseExpression();
            args.push({ type: 'SpreadElement', argument: arg });
          } else {
            args.push(parseExpression());
          }
        } while (match('Comma', undefined));
      }

      if (!match('Parenthesis', ')')) {
        throw new Error(`Expected ')' at ${current}`);
      }

      expr = {
        type: 'CallExpression',
        callee: expr,
        arguments: args,
      };
    }

    return expr;
  }

  function parseUnary() {
    if (match('UnaryOperator', undefined)) {
      const operator = tokens[current - 1].value;

      return {
        type: 'UnaryExpression',
        operator,
        argument: parseUnary(),
      };
    }

    return parseCallChain();
  }

  function parsePower() {
    const left = parseUnary();

    if (match('Operator', '^')) {
      const right = parsePower();
      return {
        type: 'BinaryExpression',
        operator: '^',
        left,
        right,
      };
    }

    return left;
  }

  function parseMultiplication() {
    let left = parsePower();

    while (match('Operator', '*') || match('Operator', '/') || match('Operator', '%')) {
      const operator = tokens[current - 1].value;
      const right = parsePower();

      left = {
        type: 'BinaryExpression',
        operator,
        left,
        right,
      };
    }

    return left;
  }

  function parseAddition() {
    let left = parseMultiplication();

    while (match('Operator', '+') || match('Operator', '-')) {
      const operator = tokens[current - 1].value;
      const right = parseMultiplication();

      left = {
        type: 'BinaryExpression',
        operator,
        left,
        right,
      };
    }

    return left;
  }

  function parseUnitConversion() {
    const left = parseAddition();

    const nextKeyword = peek();
    if (nextKeyword?.type === 'Keyword' && ['to', 'in'].includes(nextKeyword.value)) {
      consume();
      const next = consume();

      if (!next || next.type !== 'Unit') {
        throw new Error(`Expected unit after '${nextKeyword.value}'`);
      }

      return {
        type: 'UnitConversion',
        from: left,
        to: next.value,
      };
    }

    return left;
  }

  function parseComparison() {
    let left = parseUnitConversion();

    while (
      match('Operator', '>') ||
      match('Operator', '<') ||
      match('Operator', '>=') ||
      match('Operator', '<=') ||
      match('Operator', '==')
    ) {
      const operator = tokens[current - 1].value;
      const right = parseUnitConversion();

      left = {
        type: 'BinaryExpression',
        operator,
        left,
        right,
      };
    }

    return left;
  }

  function parseLogical() {
    let left = parseComparison();

    while (match('Operator', '&&') || match('Operator', '||')) {
      const operator = tokens[current - 1].value;
      const right = parseComparison();

      left = {
        type: 'LogicalExpression',
        operator,
        left,
        right,
      };
    }

    return left;
  }

  function parseNullish() {
    let left = parseLogical();

    while (match('Operator', '??')) {
      const right = parseLogical();

      left = {
        type: 'LogicalExpression',
        operator: '??',
        left,
        right,
      };
    }

    return left;
  }

  function parseTernary() {
    const test = parseNullish();

    if (match('Ternary', '?')) {
      const consequent = parseExpression();

      if (!match('Ternary', ':')) {
        throw new Error("Expected ':' in ternary");
      }

      const alternate = parseExpression();

      return {
        type: 'ConditionalExpression',
        test,
        consequent,
        alternate,
      };
    }

    if (match('Colon', undefined)) {
      const end = parseNullish();

      return {
        type: 'RangeExpression',
        start: test,
        end,
      };
    }

    return test;
  }

  function parseLambda() {
    const left = parsePipeline();

    if (match('Operator', '->')) {
      let params;
      if (left.type === 'Identifier') {
        params = [left.name];
      } else if (left.type === 'ArrayExpression') {
        params = left.elements.map((/** @type {{ type: string; name: any; }} */ el) => {
          if (el.type !== 'Identifier') {
            throw new Error('Lambda parameter must be an identifier');
          }
          return el.name;
        });
      } else {
        throw new Error('Invalid lambda parameter');
      }

      const body = parseLambda();

      return {
        type: 'ArrowFunctionExpression',
        params,
        body,
      };
    }

    return left;
  }

  function parsePipeline() {
    let left = parseTernary();

    while (match('Operator', '|>')) {
      const right = parseTernary();

      left = {
        type: 'PipelineExpression',
        left,
        right,
      };
    }

    return left;
  }

  function parseAssignment() {
    const left = parseLambda();

    if (
      match('Operator', '=') ||
      match('Operator', '+=') ||
      match('Operator', '-=') ||
      match('Operator', '*=') ||
      match('Operator', '/=')
    ) {
      const operator = tokens[current - 1].value;

      // f(a,b) = expr: treat as function definition, not assignment
      if (left.type === 'CallExpression') {
        const isFunctionTarget =
          left.callee?.type === 'Identifier' &&
          left.arguments.every((/** @type {{ type: string; }} */ arg) => arg.type === 'Identifier');

        if (!isFunctionTarget) {
          throw new Error('Invalid function definition');
        }

        const right = parseAssignment();

        return {
          type: 'FunctionAssignmentExpression',
          operator,
          left: {
            type: 'Identifier',
            name: left.callee.name,
          },
          params: left.arguments.map((/** @type {{ name: any; }} */ arg) => arg.name),
          right,
        };
      }

      if (
        left.type !== 'Identifier' &&
        left.type !== 'MemberExpression' &&
        left.type !== 'IndexExpression'
      ) {
        throw new Error('Invalid assignment target');
      }

      const right = parseAssignment();

      return {
        type: 'AssignmentExpression',
        operator,
        left,
        right,
      };
    }

    return left;
  }

  function parseExpression() {
    return parseAssignment();
  }

  const ast = parseExpression();

  if (current < tokens.length) {
    throw new Error(`Unexpected token at end: ${JSON.stringify(peek())}`);
  }

  return ast;
}
