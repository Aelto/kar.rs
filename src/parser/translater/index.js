const Result = require('../grammar/result.js')
const parserToken = require('../grammar/token.js')
const result = (name, composition) => new Result(name, composition)
const tok = (type, value) => new parserToken(type, value)

const translaterRef = require('./ref.js')
const translaterStr = require('./str.js')
const translaterToken = require('./token.js')
const translaterTranslate = require('./translate.js')
const translaterEither = require('./either.js')
const translations = {}
const ref = n => new translaterRef(translations, n)
const str = () => new translaterStr()
const token = n => new translaterToken(n)
const translate = (n, c) => new translaterTranslate(n, c)
const either = c => new translaterEither(c)


const input = `
let a: int = 15,
    b = "hello world";
`

const expected_output = `
int a = 15;
auto b = "hello world";
`

const results = result('variable-declaration', [
  tok('let', 'let'),
  tok('identifier', 'a'),
  result('type-declaration', [
    tok('colon', ':'),
    tok('identifier', 'string')
  ]),
  tok('equal', '='),
  result('number-or-string', [
    tok('string', '"hello world"')
  ]),
  tok('semicolon', ';')
])

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

const translateElement = el => {
  if (translations[el.name])
    return translations[el.name].run(el, true)

  else return ''
}
translateElement(results)

module.exports = translateElement