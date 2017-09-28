class Either {
  constructor(name, constructs) {
    this.name = name
    this.compositions = constructs
  }

  parse(source, position, result) {
    for (const composition of this.compositions) {

      if (composition.search(source, position)) {
        position = composition.parse(source, position, result)
        break;
      }

    }

    return position;
  }

  search(source, position) {
    for (const composition of this.compositions) {

      if (composition.search(source, position)) {
        return true;
      }
    }

    return false;
  }
}

module.exports = Either