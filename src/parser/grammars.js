const tokenizer = require('./tokenizer.js')
const { Token, Construct, Option, Result, Either, Not, Ref } = require('./grammar')

const translaterRef = require('./translater/ref.js')
const translaterStr = require('./translater/str.js')
const translaterToken = require('./translater/token.js')
const translaterTranslate = require('./translater/translate.js')
const translaterEither = require('./translater/either.js')
const translations = {}
const ref = n => new translaterRef(translations, n)
const str = () => new translaterStr()
const token = n => new translaterToken(n)
const translate = (n, c) => new translaterTranslate(n, c)
const either = c => new translaterEither(c)

translations['type-decl-construct'] = translate('type-decl-construct', {
  composition: [token('colon'), token('identifier').store('variable-type')],
  output: []
}),

translations['number-or-string'] = translate('number-or-string', {
  composition: [either([token('number'), token('number-float'), token('string')]).store('value')],
  output: []
}),

translations['variable'] = translate('variable', {
  composition: [
    token('let'),
    token('identifier').store('variable-name'),
    ref('type-decl-construct').option(true).retrieve('variable-type'),
    token('equal'),
    ref('number-or-string').retrieve('value'),
    token('semicolon')
  ],
  privateScope: true,
  output: [
    str()
      .fromStore('variable-type')
      .or(str().string('auto')),
    str().fromStore('variable-name'),
    str().string('='),
    str().fromStore('value'),
    str().string(';')
  ]
})

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

const tokenifyString = str => tokenizer(str).map(t => new Token(t.type, t.value, t.pos))

const parseTokens = tokens =>  {
  const results = new Result(GRAMMAR.body.name)
  GRAMMAR.body.parse(tokens, 0, results.composition)

  return results
}

const parseString = str => parseTokens(tokenifyString(str))

const translateElement = el => {
  if (translations[el.name])
    return translations[el.name].run(el, true)

  else return ''
}

// exports.grammar = GRAMMAR
// exports.translations = translations
exports.parseString = parseString
exports.translateElement = translateElement
