const Ref = require('../components/ref.js')
const Str = require('../components/str.js')
const Token = require('../components/token.js')
const Translate = require('../components/translate.js')
const Either = require('../components/either.js')
const ref = n => new Ref(translations, n)
const str = () => new Str()
const token = n => new Token(n)
const translate = (n, c) => new Translate(n, c)
const either = c => new Either(c)

const translations = {}

translations['program'] = translate('program', {
  composition: [
    either([
      ref('variable'),
      ref('function-declaration')
    ]).repeat(true)
  ],
  output: [
  ]
})

translations['variable'] = translate('variable', {
  composition: [
    token('let'),
    token('identifier').store('variable-name'),
    ref('type-declaration')
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

translations['type-declaration'] = translate('type-declaration', {
  composition: [token('colon'), token('identifier').store('variable-type')],
  output: []
})

translations['primitive'] = either([
  token('number').store('primitive'),
  token('number-float').store('primitive'),
  token('string').store('primitive')
])

translations['variable-or-primitive'] = either([
  token('identifier').store('varOrPrimitive'),
  ref('primitive').retrieve('primitive', 'varOrPrimitive')
])

translations['function-declaration'] = translate('function-declaration', {
  composition: [
    token('function'),
    token('identifier').store('function-name'),
    token('paren-left'),
    ref('arguments-declaration'),
    token('paren-right'),
    ref('type-declaration').option(true),
    token('brace-left'),
    token('brace-right')
  ],
  output: [
    
  ]
})

translations['arguments-declaration'] = translate('arguments-declaration', {
  composition: [
    ref('argument-declaration'),
    ref('next-argument-declaration')
      .option(true)
      .repeat(true)
  ],
  output: [

  ]
})

translations['argument-declaration'] = translate('argument-declaration', {
  composition: [
    token('identifier').store('argument-name'),
    ref('type-declaration').option(true),
  ],
  output: [
    str()
      .fromStore('variable-type')
      .or(str().string('auto')),
    str()
      .fromStore('argument-name')
  ]
})

translations['next-argument-declaration'] = translate('next-argument-declaration', {
  composition: [
    token('comma'),
    ref('argument-declaration')
  ],
  output: []
})

module.exports = translations