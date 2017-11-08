const Token = require('./token.js')

class Either extends Token {
  constructor(compositions) {
    super()

    this.compositions = compositions
  }

  compare(result) {
    for (const composition of this.compositions) {
      if (this.compareComposition(composition, result)) return true
    }

    return false
  }

  compareComposition(composition, result) {
    if (result.constructor.name === 'Token') {
      if (composition.compare(result)) return true
    } else {
      if (composition.compare(result)) return true
    }

    return false
  }

  getMatchingComposition(result) {
    for (const composition of this.compositions) {
      if (this.compareComposition(composition, result)) return composition
    }

    return null
  }

  run(result, scope) {
    const match = this.getMatchingComposition(result)

    if (match !== null) {
      if (this.ref === null) {
        if (this.shouldStore()) {
          // this.insertIntoStore(token.value)
          this.insertIntoScope(match.value, scope)
        }
      } else {
        if (match.constructor.name === 'Token') {
          if (this.shouldBeRetrieved()) {
            this.getRetrieved(result.value || result.composition[0].value)
          }
        } else {
          return match.run(result, scope)
        }
      }

    } else {
      console.log('no matching result found in Either ')
    }
  }
}

module.exports = Either
