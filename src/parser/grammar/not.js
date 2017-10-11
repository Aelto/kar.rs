const Result = require('./result.js')

class Not {
  constructor(name, composition) {
    this.name = name
    this.composition = composition

    this.parent = null
  }

  setParent(parent) {
    this.parent = parent

    return this
  }

  parse(source, position, result) {
    if (!this.composition.search(source, position)) {
      const newResult = new Result(this.name)
      position = this.composition.parse(source, position, newResult.composition)
    }
    
    return position
  }
  
  search(source, position) {
    const result = this.composition.search(source, position)
    if (!result.success) {
      return { success: true, position: result.position }
    }

    return { success: false, position }
  }
}

module.exports = Not