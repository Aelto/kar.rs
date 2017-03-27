module.exports = {
  'function': { r:/(fn\s)/, s: 'fn' },
  'class': { r:/(class\s)/, s: 'class' },
  'if': { r:/(if\s)/, s: 'if' },
  'else': { r:/(else\s)/, s: 'else' },
  'true': { r:/(true\s)/, s: 'true' },
  'false': { r:/(false\s)/, s: 'false' },
  'null': { r:/(null\s)/, s: 'null' },
  'const': { r:/(const\s)/, s: 'const' },
  'let': { r:/(let\s)/, s: 'let' },
  'for': { r:/(for\s)/, s: 'for' },
  'while': { r:/(while\s)/, s: 'while' },
  'return': { r:/(return\s)/, s: 'return' },
}