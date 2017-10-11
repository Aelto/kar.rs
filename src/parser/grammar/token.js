const chalk = require('chalk')

class Token {
  constructor(type, value = null, pos = null) {
    if (!type) throw new Error('a token requires a type')

    this.type = type
    this.value = value
    this.pos = pos
    this.parent = null
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

  setParent(parent) {
    this.parent = parent

    return this
  }

  search(source, position) {
    const result = { success: this.compare(source[position]), position: position + 1 }

    // if (!result.success) {
    //   let el = this.parent
    //   let failureMessage = `Unrecognized token, expected ${chalk.green(this.type)} found ${chalk.red(source[position].type)}`
    //   let shouldPrint = true // set to false if an Option is encountered
    //   while (el !== null) {
    //     failureMessage += `\n  in ${el.name}`

    //     if (el.constructor.name === 'Option') {
    //       shouldPrint = false
    //       break
    //     }

    //     el = el.parent
    //   }

    //   // if (shouldPrint) console.log(failureMessage)
    // }

    return result
  }
}

module.exports = Token
