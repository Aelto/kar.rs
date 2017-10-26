const chalk = require('chalk')

class Result {
  constructor(name, composition = []) {
    this.name = name
    this.composition = composition
  }

  push(el) {
    this.composition.push(el)
  }

  print(origin = this, deep = 0) {
    for (const child of origin.composition) {
      if (child.constructor.name === 'Token')
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

    for (const child of origin.composition) {
      if (child.constructor.name === 'Token') {
        out += `${' '.repeat(deep)}${chalk.grey(child.type.padEnd(15, ' '))} ${first
          ? chalk.magenta('|')
          : chalk.grey('|')} ${child.value}${first ? chalk.green(' < ') + origin.name : ''}\n`
        first = false
      } else if (child.composition) {
        const end = this.getPrint(child, deep + 1)

        out += end.slice(0, -1) + chalk.red(' > ') + child.name + '\n'
      }
    }

    return out
  }

  flatResult(origin = this, out = null) {
    const arr = out === null ? [] : out

    for (const child of origin.composition) {
      if (child.constructor.name === 'Token') arr.push(child.type)
      else {
        arr.push(`${child.name}[`)
        this.flatResult(child, arr)
        arr.push(`]${child.name}`)
      }
    }

    return arr
  }
}

module.exports = Result
