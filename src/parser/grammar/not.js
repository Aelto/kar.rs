class Not {
  constructor(name, composition) {
    this.name = name
    this.composition = composition
  }

  parse(source, position, result) {
    if (!this.composition.search(source, position)) {
      position = this.composition.parse(source, position, result)
    }

    return position
  }

  search(source, position) {
    if (!this.composition.search(source, position)) {
      return true
    }

    return false
  }
}
