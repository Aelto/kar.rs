const { translateElement, parseString } = require('./grammars.js')
const chalk = require('chalk')

module.exports = input => {
  const results = parseString(input)

  if (process.DEBUG) {
    console.log(
      chalk.grey(input),
      '\n\n',
      results.composition.reduce((acc, cur) => acc + cur.getPrint(), ''),
      results.flatResult().join(' ')
    )
  }

  const content = results.composition[0].composition[0].composition[0].composition
  if (content.length) {
    console.log(`\n${chalk.green('Output:')}\n${translateElement(content[0])}`)
  }
}
