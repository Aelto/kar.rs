class Token {
  constructor(type, value = null, pos = null) {
    if (!type) throw new Error("a token requires a type")

    this.type = type
    this.value = value
    this.pos = pos
  }

  compare(token) {
    return this.type === token.type
  }

  parse(source, position, result) {
    if (this.compare(source[position])) {
      result.push(source[position])

      return position + 1
    } else {
      return position
    }
  }

  search(source, position) {
    return this.compare(source[position])
  }
}

module.exports = Token