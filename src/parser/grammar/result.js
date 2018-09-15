const chalk = require('chalk')

class Result {
  constructor(name, composition = []) {
    this.name = name
    this.group = composition
  }

  push(el) {
    this.group.push(el)
  }

  print(origin = this, deep = 0) {
    for (const child of origin.group) {
      if (child.constructor.name !== 'Result')
        console.log(
          `${' '.repeat(deep)}${chalk.grey(
            child.type.padEnd(15, ' ') + ' | '
          )} ${child.value.padEnd(5, ' ')}`
        )
      else if (child.composition) this.print(child, deep + 1)
    }
  }

  getPrint(origin = this, deep = 0, out = '') {
    let first = true

    for (const child of origin.group) {
      if (child.constructor.name !== 'Result') {
        out += `${' '.repeat(deep)}${chalk.white(child.type.padEnd(15, ' '))} ${first
          ? chalk.magenta('|')
          : chalk.white('|')} ${child.value}${first ? chalk.green(' < ') + origin.name : ''}\n`
        first = false
      } else if (child.group) {
        const end = this.getPrint(child, deep + 1)

        out += end.slice(0, -1) + chalk.red(' > ') + child.name + '\n'
      }
    }

    return out
  }

  flatResult(origin = this, out = null) {
    const arr = out === null ? [] : out

    for (const child of origin.group) {
      if (child.constructor.name !== 'Result') arr.push(child.type)
      else {
        arr.push(`${child.name}[`)
        this.flatResult(child, arr)
        arr.push(`]${child.name}`)
      }
    }

    return arr
  }

  nestedLength(layer = this.group) {
    let layer_length = 0

    for (const child of layer) {
      if (child instanceof Result) {
        layer_length += this.nestedLength(child.group)
      }

      else {
        layer_length += 1
      }
    }

    return layer_length
  }
}

module.exports = Result