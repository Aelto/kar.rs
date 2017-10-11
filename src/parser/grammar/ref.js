class Ref {
  constructor(refSource, name) {
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


  get setParent(parent) {
    return this.ref.setParent(parent)
  }

  get parse(source, position, result) {
    return this.ref.parse(source, position, result)
  }

  get search(source, position) {
    return this.ref.search(source, position)
  }

}