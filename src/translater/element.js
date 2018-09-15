class Element {
  constructor(name) {
    this.name = name

    this.isOption = false

    this.isRepeat = false

    this.translateFunction = null

    this.flagName = null
  }

  compare(element) {
    return this.isOption || this.name === element.type
  }

  option(bool = false) {
    this.isOption = bool

    return this
  }

  repeat(bool = false) {
    this.isRepeat = bool

    return this
  }

  translate(fn = null) {
    this.translateFunction = fn

    return this
  }

  flag(name = null) {
    this.flagName = name

    return this
  }
}

module.exports = Element