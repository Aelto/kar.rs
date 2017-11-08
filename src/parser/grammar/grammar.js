const Elem = require('./elem.js')
const grammar = {}

const token = (name, type)  => new Elem(name).token(type ? type : name)
const ref = (name, refName) => new Elem(name).ref(refName ? refName : name, grammar)

grammar["type-declaration"] = new Elem("type-declaration").group([
  token("type-colon", "colon"),
  token("type-identifier", "identifier")
])

grammar['argument-declaration'] = new Elem('argument-declaration').group([
  token('identifier'),
  ref('type-declaration').option(true)
])

grammar['next-argument-declaration'] = new Elem('next-argument-declaration').group([
  token('comma'),
  ref('argument-declaration')
])

grammar['arguments-declaration'] = new Elem('arguments-declaration').group([
  ref('argument-declaration'),
  ref('next-argument-declaration').option(true).repeat(true)
])

grammar['function-declaration'] = new Elem('function-declaration').group([
  token('function'),
  token('name', 'identifier'),
  token('paren-left'),
  ref('arguments-declaration').option(true),
  token('paren-right'),
  ref('type-declaration').option(true),
  token('brace-left'),
  token('brace-right')
])

grammar["variable"] = new Elem("variable").group([
  token("let"),
  token("identifier"),
  ref("type-declaration").option(true),
  token("equal"),
  token("number")
    .or(token('string'))
    .or(token('number-float')),
  token('semicolon')
])

grammar['program'] = new Elem('program').group([
  ref('variable')
    .or(ref('function-declaration'))
    .repeat(true)
])

module.exports = grammar
