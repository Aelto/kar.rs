const chalk = require('chalk')

class Ref {
  constructor(store, refName) {
    this.store = store
    this._refName = refName
    this.shouldRetrieveMap = {}

    this.scope = null

    this.isOption
  }

  get ref() {
    if (!this.store[this._refName])
      console.log(`${chalk.red('warning')} reference to unknown grammar: ${chalk.magenta(this._refName)}`)

    return this.store[this._refName] || null
  }

  get name() {
    return this.ref.name
  }

  /**
   * sets the the supplied scope name as the used scope
   * for extracted variables storage.
   * @param {string} name the scope name
   */
  useScope(name) {
    this._usedScope = name

    this.createScope(name)

    return this
  }

  getUsedScope() {
    if (this._usedScope === null) return null
    return this._scopes[this._usedScope] || null
  }

  insertIntoScope(scope, name, value) {
    this.scope[name] = value

    return this
  }

  createScope(name) {
    if (!name) name = this._usedScope === null ? this._refName : this._usedScope

    this._scopes[name] = {}
  }

  giveScope(scope, scopeName) {
    this._scopes[scopeName] = scope

    return this
  }

  /**
   * asks the reference to retrieve a variable (by his name) from
   * the variables extracted by the referenced element
   * @param {string} name variable name
   */
  retrieve(name) {
    this.shouldRetrieveMap[name] = true

    return this
  }

  option(bool = false) {
    this.isOption = bool

    return this
  }

  /**
   * get whether the reference will retrieve the variable with
   * the supplied name.
   * @param {string} name variable name
   * @return {bool} true if the variable with the supplied name would be extracted
   * @return {bool} false if the variable with the supplied name would not be extracted
   */
  shouldRetrieve(name) {
    return this.shouldRetrieveMap[name] || false
  }

  retrieveVariable(name, value) {
    this.insertIntoScope(this.scope, name, value)

    return this
  }

  compare(compared) {
    if (Array.isArray(compared) && compared.length === 1) {
      return this.ref.compare(compared[0])
    } else if (!Array.isArray) return this.ref.compare(compared)
    else if (Array.isArray(compared) && compared.length > 1) return this.ref.compare(compared)

    return false
  }

  run(result, scope) {
    if (this.ref === null) throw new Error(`ref pointing to unknown element: ${this._refName}`)

    this.scope = scope
    this.ref.setRef(this).run(result, scope)
    this.scope = null
  }
}

module.exports = Ref
