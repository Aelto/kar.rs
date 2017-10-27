const tokenizer = require('./tokenizer.js')
const { Token, Construct, Option, Result, Either, Not, Ref } = require('./grammar')

const translaterRef = require('./translater/ref.js')
const translaterStr = require('./translater/str.js')
const translaterToken = require('./translater/token.js')
const translaterTranslate = require('./translater/translate.js')
const translaterEither = require('./translater/either.js')
const ref = n => new translaterRef(translations, n)
const str = () => new translaterStr()
const token = n => new translaterToken(n)
const translate = (n, c) => new translaterTranslate(n, c)
const either = c => new translaterEither(c)

const t = str => new Token(str)

const GRAMMAR = {}
const translations = {}

/**
 * 
 * TYPE DECLARATION
 * ex: `: int`
 */
{
  GRAMMAR.typeDeclarationConstruct = new Construct('type-decl-construct', [
    t('colon'),
    t('identifier')
  ])
  translations['type-decl-construct'] = translate('type-decl-construct', {
    composition: [token('colon'), token('identifier').store('variable-type')],
    output: []
  })
}

/**
 * NUMBER OR STRING
 */
{
  translations['number-or-string'] = translate('number-or-string', {
    composition: [either([token('number'), token('number-float'), token('string')]).store('value')],
    output: []
  })
}

/**
 * VARIABLE DECLARATION
 */
{
  const variableAssign = [
    t('identifier'),
    new Option('type-declaration', new Ref(GRAMMAR, 'typeDeclarationConstruct')),
    t('equal'),
    new Ref(GRAMMAR, 'varOrPrimitive')
  ]

  GRAMMAR.variableDeclaration = new Construct('variable', [
    t('let'),
    ...variableAssign,
    new Option(
      'multiple-variable-declaration',
      new Construct('multiple-variable-declaration-construct', [t('comma'), ...variableAssign])
    ).repeatOneOrMore(),
    t('semicolon')
  ])

  translations['variable'] = translate('variable', {
    composition: [
      token('let'),
      token('identifier').store('variable-name'),
      ref('type-decl-construct')
        .option(true)
        .retrieve('variable-type'),
      token('equal'),
      ref('variable-or-primitive').retrieve('varOrPrimitive'),
      token('semicolon')
    ],
    privateScope: true,
    output: [
      str()
        .fromStore('variable-type')
        .or(str().string('auto')),
      str().fromStore('variable-name'),
      str().string('='),
      str().fromStore('varOrPrimitive'),
      str().string(';')
    ]
  })
}

/**
 * PRIMITIVE
 */
{
  GRAMMAR.primitive = new Either('primitive', [t('string'), t('number'), t('number-float')])

  translations['primitive'] = translate('primitive', {
    composition: [
      either([token('number'), token('number-float'), token('string')]).store('primitive')
    ],
    output: []
  })
}

/**
 * VAR OR PRIMITIVE
 */
{
  GRAMMAR.varOrPrimitive = new Either('variable-or-primitive', [
    t('identifier'),
    new Ref(GRAMMAR, 'primitive')
  ])

  translations['variable-or-primitive'] = translate('variable-or-primitive', {
    composition: [
      either([
        token('identifier').store('varOrPrimitive'),
        ref('primitive').retrieve('primitive', 'varOrPrimitive')
      ]).store('varOrPrimitive')
    ],
    output: []
  })
}

GRAMMAR.parameter = [
  t('identifier'),
  new Option('type-decl-option', GRAMMAR.typeDeclarationConstruct)
]

/**
 * FUNCTION CALL CONSTRUCT
 */
{
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
}

{
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

  translations['parameter-construct'] = translate('parameter-construct', {
    composition: [
      token('identifier').store('parameter-name'),
      ref('type-decl-construct').option(true).retrieve('variable-type', 'parameter-type')
    ],
    output: [
      str().fromStore('parameter-type').or(str().string('auto')),
      str().fromStore('parameter-name')
    ]
  })

  translations['function-declaration'] = translate('function-declaration', {
    composition: [
      token('function'),
      token('identifier').store('function-name'),
      token('left-paren'),
      ref('parameter-construct').option(true),
      token('right-paren'),
      ref('type-decl-construct').option(true).retrieve('variable-type'),
      token('left-brace'),
      token('right-brace')
    ],
    output: [
      str().fromStore('variable-type').or(str().string('void')),
      str().fromStore('function-name'),
      str().string('('),
      str().string(')'),
      str().string('{'),
      str().string('}')
    ]
  })
}

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

const tokenifyString = str => tokenizer(str).map(t => new Token(t.type, t.value, t.pos))

const parseTokens = tokens => {
  const results = new Result(GRAMMAR.body.name)
  GRAMMAR.body.parse(tokens, 0, results.composition)

  return results
}

const parseString = str => parseTokens(tokenifyString(str))

const translateElement = el => {
  if (translations[el.name]) return translations[el.name].run(el, true)
  else return ''
}

// exports.grammar = GRAMMAR
// exports.translations = translations
exports.parseString = parseString
exports.translateElement = translateElement
