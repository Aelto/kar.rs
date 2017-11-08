const grammar = require('./grammar/grammar.js')

module.exports = treeRoot => {
  if (grammar[treeRoot.name]) {
    return grammar[treeRoot.name].run(treeRoot)

  } else {
    console.log('no translation found')
    return ''
  }
}