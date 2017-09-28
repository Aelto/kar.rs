class Result {
  constructor(name) {
    this.name = name
    this.list = []
  }

  push(el) {
    this.list.push(el)
  }

  print() {
    console.log(`--- ${this.name} ---`)
    for (const el of this.list) console.log(el)
  }
}

module.exports = Result