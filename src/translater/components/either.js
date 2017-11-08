const Token = require('./token.js')

class Either extends Token {
  constructor(compositions) {
    super()

    this.type = compositions.reduce((str, comp) => `${str}${str.length ? '_or_' : ''}${comp.name || comp.type}`, '')

    this.compositions = compositions
  }

  run(tree, parentOutput) {
    let bestMatch = { success: false, str: '', scope: {}, forward: 0 }
    
    loopThroughCompositions: for (const compChild of this.compositions) {
      const compChildOutput = this.ref === null
        ? compChild.run(tree, parentOutput)
        : compChild.setRef(this.ref).run(tree, parentOutput)

      if (compChildOutput.success && compChildOutput.forward > bestMatch.forward) {
        bestMatch = compChildOutput
        bestMatch.forward = 1
      }
    }

    return bestMatch
  }
}

module.exports = Either
