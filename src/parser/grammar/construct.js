const Result = require('./result.js')

class Construct {
  constructor(name, composition) {
    this.name = name
    this.composition = composition
  }

  parse(source, position = 0, result = []) {
    const newResult = new Result(this.name)

    for (let i = 0; i < this.composition.length; i++) {
      if (this.composition[i].constructor.name === "Token")
        position = source[position].parse(source, position, newResult.list)

      if (this.composition[i].constructor.name === "Construct") {
        position = source[position].parse(source, position, newResult.list)
      }

      if (this.composition[i].constructor.name === "Option") {
        position = this.composition[i].parse(source, position, newResult.list)
      }

      if (position >= source.length) {
        break
      }
    }

    result.push(newResult)
    return position
  }

  search(source, position) {
    for (let i = 0; i < this.composition.length; i++) {
      if (!this.composition[i].search(source, position)) {
        if (this.composition[i].constructor.name === 'Option') {
          continue;
        } else {
          return false
        }
      }

      position += 1
    }
    return true
  }
}

module.exports = Construct