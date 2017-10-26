const tokenizer = require('./tokenizer.js')
const { Token, Construct, Option, Result, Either, Not, Ref } = require('./grammar')
const translateElement = require('./translater/index.js')
const chalk = require('chalk')

const t = str => new Token(str)

const GRAMMAR = {}

GRAMMAR.typeDeclarationConstruct = new Construct('type-decl-construct', [
  t('colon'),
  t('identifier')
])

GRAMMAR.varOrPrimitive = new Either('variable-or-primitive', [
  t('identifier'),
  t('string'),
  t('number'),
  t('number-float')
])

GRAMMAR.parameter = [
  new Ref(GRAMMAR, 'varOrPrimitive'),
  new Option('type-decl-option', GRAMMAR.typeDeclarationConstruct)
]

GRAMMAR.functionCallConstruct = new Construct('function-call', [
  t('identifier'),
  t('left-paren'),
  new Option(
    'function-call-args',
    new Construct('function-call-args-construct', [
      ...GRAMMAR.parameter,
      new Option(
        'function-call-args-multiple-comma',
        new Construct('function-call-args-multiple-comma', [t('comma'), ...GRAMMAR.parameter])
      ).repeatOneOrMore()
    ])
  ),
  t('right-paren'),
  t('semicolon')
])

GRAMMAR.variableAssign = [
  t('identifier'),
  new Option('type-declaration', GRAMMAR.typeDeclarationConstruct),
  t('equal'),
  new Either('number-or-string', [t('number'), t('string'), t('number-float'), GRAMMAR.functionCallConstruct])
]

GRAMMAR.variableDeclaration = new Construct('variable', [
  t('let'),
  ...GRAMMAR.variableAssign,
  new Option(
    'multiple-variable-declaration',
    new Construct('multiple-variable-declaration-construct', [
      t('comma'),
      ...GRAMMAR.variableAssign
    ])
  ).repeatOneOrMore(),
  t('semicolon')
])

GRAMMAR.functionDeclarationConstruct = new Construct('function-declaration', [
  t('function'),
  t('identifier'),
  t('left-paren'),
  new Option('parameter', [
    ...GRAMMAR.parameter,
    new Option('parameter-multiple', [t('comma'), ...GRAMMAR.parameter]).repeatOneOrMore()
  ]),
  t('right-paren'),
  new Option('type-declaration-option', GRAMMAR.typeDeclarationConstruct),
  t('left-brace'),
  new Ref(GRAMMAR, 'body'),
  t('right-brace')
])

GRAMMAR.comparison = new Either('comparison', [
  t('greater'),
  t('greater-equal'),
  t('lesser'),
  t('lesser-equal'),
  t('equal-equal'),
  t('bang-equal')
])

GRAMMAR.compared = new Either('compared', [
  t('identifier'),
  t('true'),
  t('false'),
  t('string'),
  t('number'),
  t('number-float')
])

GRAMMAR.logic = new Either('if-logic', [
  GRAMMAR.compared,
  new Construct('complete-comparaison', [GRAMMAR.compared, GRAMMAR.comparison, GRAMMAR.compared])
])

GRAMMAR.ifStatementConstruct = new Construct('if-statement', [
  t('if'),
  t('left-paren'),
  GRAMMAR.logic,
  new Option('', [new Either('', [t('and'), t('or')]), GRAMMAR.logic]).repeatOneOrMore(),
  t('right-paren'),
  t('left-brace'),
  new Ref(GRAMMAR, 'body'),
  t('right-brace')
])

GRAMMAR.body = new Construct('body', [
  new Option('body', [
    new Either('body-either', [
      GRAMMAR.ifStatementConstruct,
      GRAMMAR.functionDeclarationConstruct,
      GRAMMAR.variableDeclaration,
      GRAMMAR.functionCallConstruct
    ])
  ]).repeatOneOrMore()
])

module.exports = input => {
  // test(
  //   `
  //   fn main() {
  //     let a: int = 10;

  //     if (a > 5) {
  //       log(a);
  //     }

  //   }
  // `,
  //   GRAMMAR.body
  // )

  // test(
  //   `
  //   fn main(argc: int) {
  //     let a: int = 10;
  //   }`,
  //   GRAMMAR.functionDeclarationConstruct
  // )

  test(
    `
    let a: float = 5.6;
    `,
    GRAMMAR.variableDeclaration
  )
}

function test(str, construct) {
  let tokens = []
  try {
    tokens = tokenizer(str).map(t => new Token(t.type, t.value, t.pos))
  } catch (err) {
    throw err
  }

  const results = new Result(construct.name)
  construct.parse(tokens, 0, results.composition)

  console.log(results.composition.reduce((acc, cur) => acc + cur.getPrint(), ''))
  console.log(results.flatResult().join(' '))

  if (results.composition.length) {
    console.log(`\n${chalk.green('Output:')}\n${translateElement(results.composition[0])}`)

  } else {

  }
}
