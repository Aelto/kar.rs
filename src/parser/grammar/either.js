const Result = require('./result.js')

class Either {
  constructor(name, constructs) {
    this.name = name
    this.compositions = constructs
    this.parent = null

    for (const child of this.compositions)
      child.setParent(this)
  }

  setParent(parent) {
    this.parent = parent

    return this
  }

  parse(source, position, result) {
    if (!this.search(source, position).success) return position

    const newResult = new Result(this.name)

    const bestResult = {
      result: null,
      composition: null
    }

    for (const composition of this.compositions) {
      const result = composition.search(source, position)

      if (result.success) {
        if (
          bestResult.result === null ||
          bestResult.result.position < result.position
        ) {
          bestResult.result = result
          bestResult.composition = composition
        }
      }
    }

    if (bestResult.composition !== null) {
      position = bestResult.composition.parse(
        source,
        position,
        newResult.composition
      )
      result.push(newResult)
    }

    return position
  }

  search(source, position) {
    const bestResult = {
      result: null,
      composition: null
    }

    for (const composition of this.compositions) {
      const result = composition.search(source, position)

      if (result.success) {
        if (
          bestResult.result === null ||
          bestResult.result.position < result.position
        ) {
          bestResult.result = result
          bestResult.composition = composition
        }
      }
    }

    if (bestResult.composition !== null) {
      return bestResult.result
    } else return { success: false, position, failure: '' }
  }
}

module.exports = Either
