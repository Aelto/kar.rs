const tokenizer = require('./tokenizer.js')
const { Token, Construct, Option, Result, Either, Not, Ref } = require('./grammar')

const t = str => new Token(str)

const GRAMMAR = {}

GRAMMAR.parameter = new Either('parameter', [
  t('identifier'),
  t('string'),
  t('number'),
  t('number-float')
])

GRAMMAR.functionCallConstruct = new Construct('function-call', [
  t('identifier'),
  t('left-paren'),
  new Option(
    'function-call-args',
    new Construct('function-call-args-construct', [
      GRAMMAR.parameter,
      new Option(
        'function-call-args-multiple-comma',
        new Construct('function-call-args-multiple-comma', [t('comma'), GRAMMAR.parameter])
      ).repeatOneOrMore()
    ])
  ),
  t('right-paren'),
  t('semicolon')
])

GRAMMAR.variableAssign = [
  t('identifier'),
  new Option(
    'type-declaration',
    new Construct('type-decl-construct', [t('colon'), t('identifier')])
  ),
  t('equal'),
  new Either('number-or-string', [t('number'), t('string'), GRAMMAR.functionCallConstruct])
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
  new Option('args', [
    GRAMMAR.parameter,
    new Option('args-multiple', [t('comma'), GRAMMAR.parameter]).repeatOneOrMore()
  ]),
  t('right-paren'),
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
  t('right-paren')
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
  test(
    `
    fn main() {
      let a = 10;

      log(a)
    }
  `,
    GRAMMAR.body
  )

  // test(`
  //   log("str");
  // `, functionCallConstruct)

  // test(
  //   `if (a == b && a != b || b == 1)`,
  //   new Construct('if', [
  //     t('if'),
  //     t('left-paren'),
  //     logic,
  //     new Option('', [
  //       new Either('', [t('ampersand-ampersand'), t('pipe-pipe')]),
  //       logic
  //     ]).repeatOneOrMore(),
  //     t('right-paren')
  //   ])
  // )

  // test(`
  //   if (a == b)
  // `, new Construct('if', ifStatement))

  // test(
  //   `
  //   fn main(5, "hello", 5.15) {
  //     let a: int = 5,
  //         b = "Hello world !";
  //   }
  // `,
  //   functionDeclarationConstruct
  // )

  // test(
  //   `
  // let a = "Hello";
  // `,
  //   con
  // )

  // test(
  //   `
  // let b = 10,
  //     c = 15,
  //     d = 20;
  //    `,
  //   con
  // )
}

function test(str, construct) {
  let tokens = []
  try {
    tokens = tokenizer(str).map(t => new Token(t.type, t.value, t.pos))
  } catch (err) {
    throw err
  }

  tokens.forEach(t => console.log(t))

  const results = new Result(construct.name)
  construct.parse(tokens, 0, results.composition)
  console.log(results)
  console.log(results.composition.reduce((acc, cur) => acc + cur.getPrint(), ''))
  console.log(results.flatResult().join(' '))
}
