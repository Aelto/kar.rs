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

  console.log(results.composition[0].composition)

  let output = ''
  for (const el of results.composition[0].composition) {
    console.log(el)
    const content = el.composition[0].composition
    

    if (content.length) {
      output += translateElement(content[0]) + '\n'
      console.log(`\n${chalk.green('Output:')}\n${output}`)
    }
  }

  

  return `

  ${output}

  `
}
