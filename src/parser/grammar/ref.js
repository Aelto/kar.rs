class Ref {
  constructor(refSource, name) {
    if (!name) {
      throw new error('Ref needs a name')
    }

    this.refSource = refSource
    this._name = name
  }

  get ref() {
    return this.refSource[this._name]
  }


  get compositions() {
    return this.ref.compositions
  }

  get composition() {
    return this.ref.composition
  }

  get name() {
    return this.ref.name
  }

  get parent() {
    return this.ref.parent
  }


  setParent(parent) {
    // return this.ref.setParent(parent)
  }

  parse(source, position, result) {
    return this.ref.parse(source, position, result)
  }

  search(source, position) {
    return this.ref.search(source, position)
  }

}

module.exports = Ref