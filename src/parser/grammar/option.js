class Option {
  constructor(name, construct) {
    this.name = name
    this.composition = construct

    this._repeatOneOrMore = false
  }

  repeatOneOrMore() {
    this._repeatOneOrMore = true

    return this
  }

  parse(source, position, result) {
    if (this._repeatOneOrMore) {
      while (this.search(source, position) && this._repeatOneOrMore) {
        position = this.composition.parse(source, position, result)
      }
    } else {
      if (this.search(source, position)) {
        position = this.composition.parse(source, position, result)
      }
    }

    return position
  }

  search(source, position) {
    const res = this.composition.search(source, position)

    return res
  }
}

module.exports = Option