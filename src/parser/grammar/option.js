const chalk = require('chalk')
const Construct = require('./construct.js')

class Option {
  constructor(name, construct) {
    this.name = name
    this.composition = Array.isArray(construct)
      ? new Construct(this.name + '-construct', construct)
      : construct

    this._repeatOneOrMore = false
    this.parent = null

    this.composition.setParent(this)
  }

  setParent(parent) {
    this.parent = parent

    return this
  }

  get type() {
    return this.name
  }

  repeatOneOrMore() {
    this._repeatOneOrMore = true

    return this
  }

  parse(source, position, result) {
    if (this._repeatOneOrMore) {
      while (this.search(source, position).success && this._repeatOneOrMore) {
         position = this.composition.parse(source, position, result)
      }
    } else {
      if (this.search(source, position).success) {
        position = this.composition.parse(source, position, result)
      }
    }

    return position
  }

  search(source, position) {
    let result = this.composition.search(source, position)
    let lastResult = result

    while (result.success && this._repeatOneOrMore) {
      result = this.composition.search(source, result.position)

      if (!result.success/* || lastResult !== null && result.position === lastResult.position*/) {
        return lastResult
      }

      lastResult = result
    }

    return result
  }
}

module.exports = Option
