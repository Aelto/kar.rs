
const Element = require('./element.js')
const Container = require('./container.js')
const Reference = require('./reference.js')

const cont = (n, c) => new Container(n, c)
const el = n => new Element(n)
const ref = n => Reference(n)

cont('variable-assignment', [
  el('identifier').flag('var-identifier'),
  el('equal'),
  el('number').flag('var-value')
])

const program = cont('program', [
  cont('variable', [
    el('let'),
    ref('variable-assignment'),
    el('semicolon'),
  ]).option(true)
    .repeat(true)
    .translate((container, ast) => {
    const varName = container.getFirstFlagged(ast, 'var-identifier')
    const varValue = container.getFirstFlagged(ast, 'var-value')

    if (varName !== null && varValue !== null) {
      console.log(`auto ${varName.ast.value} = ${varValue.ast.value}`)
    }
  }),
  cont('function-declaration', [
    el('function'),
    el('identifier').flag('function-name'),
    el('paren-left'),
    cont('arguments-declaration', [
      cont('argument-declaration', [
        el('identifier').flag('arg-name'),
        cont('type-declaration', [
          el('colon'),  
          el('identifier').flag('type-identifier')
        ]).flag('arg-type')
      ]).flag('arg-declaration'),
      cont('next-argument-declaration', [
        el('comma'),
        ref('argument-declaration')
      ])
    ]),
    el('paren-right'),
    ref('type-declaration').flag('function-type-declaration'),
    el('brace-left'),
    el('brace-right')
  ]).translate((container, ast) => {
    const functionName = container.getFirstFlagged(ast, 'function-name')
    const functionReturnType = container
      .getFirstFlagged(ast, 'function-type-declaration')
      .map(type_declaration => type_declaration.grammar.getFirstFlagged(type_declaration.ast, 'type-identifier'))

    const args = container.getAllFlagged(ast, 'arg-declaration')
      .map(arg => {
        const arg_name = arg.grammar.getFirstFlagged(arg.ast, 'arg-name').ast.value
        const arg_type = arg.grammar.getFirstFlagged(arg.ast, 'type-identifier').ast.value || 'auto'

        return `${arg_type} ${arg_name}`
      })
      .join(', ')

    console.log(`${functionReturnType.ast.value || 'void'} ${functionName.ast.value} (${args}) {}`)
  })
])

module.exports = (AST) => {
  program.run(AST)
  return ''
}