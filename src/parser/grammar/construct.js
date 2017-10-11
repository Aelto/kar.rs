const chalk = require("chalk")
const Result = require("./result.js")

class Construct {
  constructor(name, composition) {
    if (!Array.isArray(composition)) {
      throw new Error('composition must be of type array, found ', composition)
    }
    this.name = name
    this.composition = composition

    for (const child of this.composition)
      child.setParent(this)

    this.parent = null
  }

  setParent(parent) {
    this.parent = parent

    return this
  }

  parse(source, position = 0, result = []) {
    const newResult = new Result(this.name)

    const search = this.search(source, position)
    if (!search.success) {
      return position
    }

    for (let i = 0; i < this.composition.length; i++) {
      position = this.composition[i].parse(
        source,
        position,
        newResult.composition
      )

      if (position >= source.length) {
        break
      }
    }

    result.push(newResult)
    return position
  }

  search(source, position) {

    for (let i = 0; i < this.composition.length; i++) {
      if (position >= source.length - 1)
        return { success: false, position: source.length - 1 }

      const result = this.composition[i].search(source, position)

      if (!result.success) {

        if (this.composition[i].constructor.name !== 'Option')
          return result
      }


      // if (this.composition[i].constructor.name === 'Option' && result.success && result.position === position) {
      //   return { success: false, position }
      // }

      if (result.success) position = result.position

      if (position >= source.length - 1) break
    }

    return { success: true, position }
  }
}

module.exports = Construct
