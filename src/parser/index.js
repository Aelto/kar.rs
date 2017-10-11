const tokenizer = require('./tokenizer.js')
const { Token, Construct, Option, Result, Either, Not } = require('./grammar')

const t = str => new Token(str)

const parameter = new Either('parameter', [
  t('identifier'),
  t('string'),
  t('number'),
  t('number-float')
])

const functionCall = [
  t('identifier'),
  t('left-paren'),
  new Option(
    'function-call-args',
    new Construct('function-call-args-construct', [
      parameter,
      new Option(
        'function-call-args-multiple-comma',
        new Construct('function-call-args-multiple-comma', [
          t('comma'),
          parameter
        ])
      ).repeatOneOrMore()
    ])
  ),
  t('right-paren'),
  t('semicolon')
]
const functionCallConstruct = new Construct('function-call', functionCall)

const variableAssign = [
  t('identifier'),
  new Option(
    'type-declaration',
    new Construct('type-decl-construct', [
      t('colon'),
      t('identifier')
    ])
  ),
  t('equal'),
  new Either('number-or-string', [
    t('number'),
    t('string'),
    functionCallConstruct
  ])
]

const variableDeclaration = new Construct('variable', [
  t('let'),
  ...variableAssign,
  new Option(
    'multiple-variable-declaration',
    new Construct('multiple-variable-declaration-construct', [
      t('comma'),
      ...variableAssign
    ])
  ).repeatOneOrMore(),
  t('semicolon')
])



const functionDeclaration = [
  t('function'),
  t('identifier'),
  t('left-paren'),
  new Option('args', [
    parameter,
    new Option('args-multiple', [
      t('comma'),
      parameter
    ]).repeatOneOrMore()
  ]),
  t('right-paren'),
  t('left-brace'),
  new Option('', variableDeclaration),
  t('right-brace')
]
const functionDeclarationConstruct = new Construct(
  'function-declaration',
  functionDeclaration
)

const comparison = new Either('comparison', [
  t('greater'),
  t('greater-equal'),
  t('lesser'),
  t('lesser-equal'),
  t('equal-equal'),
  t('bang-equal')
])

const compared = new Either('compared', [
  t('identifier'),
  t('true'),
  t('false'),
  t('string'),
  t('number'),
  t('number-float')
])

const logic = new Either('if-logic', [
  compared,
  new Construct('complete-comparaison', [compared, comparison, compared])
])

const ifStatement = [
  t('if'),
  t('left-paren'),
  logic,
  new Option('', [
    new Either('', [t('and'), t('or')]),
    logic
  ]).repeatOneOrMore(),
  t('right-paren')
]
const ifStatementConstruct = new Construct('if-statement', ifStatement)

const body = new Construct('body', [
  new Option('body', [
    new Either('body-either', [
      ifStatementConstruct,
      functionDeclarationConstruct,
      variableDeclaration,
      functionCallConstruct
    ])
  ]).repeatOneOrMore()
])



module.exports = input => {
  test(
    `
    fn main() {
      let a = 10;

      log();
    }
  `,
    body
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
  console.log(
    results.composition.reduce((acc, cur) => acc + cur.getPrint(), '')
  )
  console.log(results.flatResult().join(' '))
}
