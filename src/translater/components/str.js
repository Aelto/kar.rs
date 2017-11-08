class Str {
  constructor() {
    this.usedVariableName = null

    this.usedString = null

    this.usedOr = null
  }

  fromStore(name) {
    this.usedVariableName = name

    return this
  }

  or(option) {
    this.usedOr = option

    return this
  }

  string(str) {
    this.usedString = str

    return this
  }

  run(variableStore) {
    if (this.usedString !== null) {
      return this.usedString
    }

    if (this.usedVariableName !== null && variableStore[this.usedVariableName]) {
      return variableStore[this.usedVariableName]
    }

    if (this.usedOr !== null) {
      return this.usedOr.run(variableStore)
    }

    return ''
  }
}
module.exports = Str
