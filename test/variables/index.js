const test = require('ava')
const {
  Token,
  Construct,
  Option,
  Result,
  Either,
  Not
} = require('../../src/parser/grammar')
const tokenizer = require('../../src/parser/tokenizer')

module.exports = () => {
  let grammar = null

  test('create variable declaration grammar', t => {
    const variableDeclBase = [
      new Token('identifier'),
      new Option(
        'type-declaration',
        new Construct('type-decl-construct', [
          new Token('colon'),
          new Token('identifier')
        ])
      ),
      new Token('equal'),
      new Either('number-or-string', [new Token('number'), new Token('string')])
    ]

    grammar = new Construct('variable', [
      new Token('let'),
      ...variableDeclBase,
      new Option(
        'multiple-variable-declaration',
        new Construct('multiple-variable-declaration-construct', [
          new Token('comma'),
          ...variableDeclBase
        ])
      ).repeatOneOrMore(),
      new Token('semicolon')
    ])

    t.is(grammar.constructor.name, 'Construct')
  })

  test('tokens: variable declaration, single, without type', t => {
    t.plan(2)

    const input = `
      let a = 10;
    `

    const tokens = tokenizer(input).map(t => new Token(t.type, t.value, t.pos))

    t.is(
      tokens.map(t => t.type).join(' '),
      ['let', 'identifier', 'equal', 'number', 'semicolon'].join(' ')
    )

    const results = new Result(grammar.name)
    grammar.parse(tokens, 0, results.composition)

    t.is(
      results.flatResult().join(' '),
      [
        'variable[',
        'let',
        'identifier',
        'equal',
        'number-or-string[',
        'number',
        ']number-or-string',
        'semicolon',
        ']variable'
      ].join(' ')
    )
  })

  test('tokens: variable declaration, single, with type', t => {
    t.plan(2)

    const input = `
      let a: int = 10;
    `

    const tokens = tokenizer(input).map(t => new Token(t.type, t.value, t.pos))

    t.is(
      tokens.map(t => t.type).join(' '),
      [
        'let',
        'identifier',
        'colon',
        'identifier',
        'equal',
        'number',
        'semicolon'
      ].join(' ')
    )

    const results = new Result(grammar.name)
    grammar.parse(tokens, 0, results.composition)

    t.is(
      results.flatResult().join(' '),
      [
        'variable[',
        'let',
        'identifier',
        'type-decl-construct[',
        'colon',
        'identifier',
        ']type-decl-construct',
        'equal',
        'number-or-string[',
        'number',
        ']number-or-string',
        'semicolon',
        ']variable'
      ].join(' ')
    )
  })

  test('tokens: variable declaration, single, without type, string', t => {
    t.plan(2)

    const input = `
      let a = "Hello";
    `

    const tokens = tokenizer(input).map(t => new Token(t.type, t.value, t.pos))

    t.is(
      tokens.map(t => t.type).join(' '),
      ['let', 'identifier', 'equal', 'string', 'semicolon'].join(' ')
    )

    const results = new Result(grammar.name)
    grammar.parse(tokens, 0, results.composition)

    t.is(
      results.flatResult().join(' '),
      [
        'variable[',
        'let',
        'identifier',
        'equal',
        'number-or-string[',
        'string',
        ']number-or-string',
        'semicolon',
        ']variable'
      ].join(' ')
    )
  })

  test('tokens: variable declaration, single, with type, string', t => {
    t.plan(2)

    const input = `
      let a: string = "Hello";
    `

    const tokens = tokenizer(input).map(t => new Token(t.type, t.value, t.pos))

    t.is(
      tokens.map(t => t.type).join(' '),
      [
        'let',
        'identifier',
        'colon',
        'identifier',
        'equal',
        'string',
        'semicolon'
      ].join(' ')
    )

    const results = new Result(grammar.name)
    grammar.parse(tokens, 0, results.composition)

    t.is(
      results.flatResult().join(' '),
      [
        'variable[',
        'let',
        'identifier',
        'type-decl-construct[',
        'colon',
        'identifier',
        ']type-decl-construct',
        'equal',
        'number-or-string[',
        'string',
        ']number-or-string',
        'semicolon',
        ']variable'
      ].join(' ')
    )
  })

  test('tokens: variable declaration, multiple, without type', t => {
    t.plan(2)

    const input = `
      let b = 10,
          c = 15,
          d = 20;
    `

    const tokens = tokenizer(input).map(t => new Token(t.type, t.value, t.pos))

    t.is(
      tokens.map(t => t.type).join(' '),
      [
        'let',
        'identifier',
        'equal',
        'number',
        'comma',
        'identifier',
        'equal',
        'number',
        'comma',
        'identifier',
        'equal',
        'number',
        'semicolon'
      ].join(' ')
    )

    const results = new Result(grammar.name)
    grammar.parse(tokens, 0, results.composition)

    t.is(
      results.flatResult().join(' '),
      [
        'variable[',
        'let',
        'identifier',
        'equal',
        'number-or-string[',
        'number',
        ']number-or-string',
        'multiple-variable-declaration-construct[',
        'comma',
        'identifier',
        'equal',
        'number-or-string[',
        'number',
        ']number-or-string',
        ']multiple-variable-declaration-construct',
        'multiple-variable-declaration-construct[',
        'comma',
        'identifier',
        'equal',
        'number-or-string[',
        'number',
        ']number-or-string',
        ']multiple-variable-declaration-construct',
        'semicolon',
        ']variable'
      ].join(' ')
    )
  })

  test('tokens: variable declaration, multiple, with types', t => {
    t.plan(2)

    const input = `
      let b: string = "Hello",
          c: int = 10,
          d = "yes",
          e = 0;
    `

    const tokens = tokenizer(input).map(t => new Token(t.type, t.value, t.pos))

    t.is(
      tokens.map(t => t.type).join(' '),
      [
        'let',
        'identifier',
        'colon',
        'identifier',
        'equal',
        'string',
        'comma',
        'identifier',
        'colon',
        'identifier',
        'equal',
        'number',
        'comma',
        'identifier',
        'equal',
        'string',
        'comma',
        'identifier',
        'equal',
        'number',
        'semicolon'
      ].join(' ')
    )

    const results = new Result(grammar.name)
    grammar.parse(tokens, 0, results.composition)

    t.is(
      results.flatResult().join(' '),
      [
        'variable[',
        'let',
        'identifier',
        'type-decl-construct[',
        'colon',
        'identifier',
        ']type-decl-construct',
        'equal',
        'number-or-string[',
        'string',
        ']number-or-string',
        'multiple-variable-declaration-construct[',
        'comma',
        'identifier',
        'type-decl-construct[',
        'colon',
        'identifier',
        ']type-decl-construct',
        'equal',
        'number-or-string[',
        'number',
        ']number-or-string',
        ']multiple-variable-declaration-construct',
        'multiple-variable-declaration-construct[',
        'comma',
        'identifier',
        'equal',
        'number-or-string[',
        'string',
        ']number-or-string',
        ']multiple-variable-declaration-construct',
        'multiple-variable-declaration-construct[',
        'comma',
        'identifier',
        'equal',
        'number-or-string[',
        'number',
        ']number-or-string',
        ']multiple-variable-declaration-construct',
        'semicolon',
        ']variable'
      ].join(' ')
    )
  })
}
