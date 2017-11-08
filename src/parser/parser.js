const grammar = require('./grammar/grammar.js')

module.exports = tokens => grammar['program'].parse(tokens)