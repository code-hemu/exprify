# Expression Trees

The parser produces an Abstract Syntax Tree (AST) where each node has a `type` property.

## Node Types

| Type | Description | Properties |
|---|---|---|
| `Literal` | Number, string, boolean, bigint | `value` |
| `Identifier` | Variable or function name | `name` |
| `UnaryExpression` | `-x`, `!x` | `operator`, `argument` |
| `BinaryExpression` | `a + b`, `a * b` | `operator`, `left`, `right` |
| `LogicalExpression` | `a && b`, `a \|\| b` | `operator`, `left`, `right` |
| `CallExpression` | `f(a, b)` | `callee`, `arguments` |
| `ArrayExpression` | `[1, 2; 3, 4]` | `elements`, `rows` |
| `ObjectExpression` | `{k: v}` | `properties` |
| `ConditionalExpression` | `a ? b : c` | `test`, `consequent`, `alternate` |
| `AssignmentExpression` | `x = 5`, `x += 3` | `operator`, `left`, `right` |
| `ArrowFunctionExpression` | `x -> x^2` | `params`, `body` |
| `RangeExpression` | `1:5` | `start`, `end` |
| `PipelineExpression` | `a \|> fn` | `left`, `right` |
| `IndexExpression` | `a[i]`, `a[i, j]` | `object`, `index` |
| `MemberExpression` | `obj.prop` | `object`, `property`, `optional` |
| `UnitLiteral` | `5cm` | `value`, `unit` |
| `UnitConversion` | `2 inch to cm` | `value`, `from`, `to` |

## Example

```json
{
  "type": "BinaryExpression",
  "operator": "+",
  "left": { "type": "Literal", "value": 2 },
  "right": {
    "type": "BinaryExpression",
    "operator": "*",
    "left": { "type": "Literal", "value": 3 },
    "right": { "type": "Identifier", "name": "x" }
  }
}
```
