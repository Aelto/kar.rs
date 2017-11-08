const chalk = require('chalk')

class Ref {
  constructor(store, refName) {
    this.store = store
    this._refName = refName
    this.shouldRetrieveMap = {}

    this.storeOutputName = null

    this.scope = null

    this.isOption = false

    this.isScopePrivate = false

    this.shouldRepeat = false

    this.orList = []

    this.overrideRef = null
  }

  get ref() {
    if (!this.store[this._refName])
      console.log(`${chalk.red('warning')} reference to unknown grammar: ${chalk.magenta(this._refName)}`)

    return this.store[this._refName] || null
  }

  get name() {
    if (this.ref === null)
      return this._refName
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
  retrieve(name, alias = null) {
    this.shouldRetrieveMap[name] = alias === null
      ? name
      : alias

    return this
  }

  option(bool = false) {
    this.isOption = bool

    return this
  }

  repeat(bool = false) {
    this.shouldRepeat = bool

    return this
  }

  privateScope(bool = false) {
    this.isScopePrivate = bool

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
    if (this.overrideRef === null) {
      return !!this.shouldRetrieveMap[name] || false

    }

    else {
      return !!this.overrideRef.shouldRetrieveMap[this.shouldRetrieveMap[name]]
    }

  }

  retrieveVariable(scope, name, value) {
    if (this.overrideRef === null) {
      scope[this.shouldRetrieveMap[name]] = value

    }

    else {
      scope[this.overrideRef.shouldRetrieveMap[this.shouldRetrieveMap[name]]] = value
    }

    return this
  }

  setRef(ref = null) {
    this.overrideRef = ref

    return this
  }

  run(tree, parentOutput) {

    if (this.ref !== null) {
      console.log(this.name)
      return this.ref.setRef(this).run(
        tree, 
        this.isScopePrivate
          ? Object.assign({ scope: {} }, parentOutput)
          : parentOutput
      )
    }

    return { success: false, str: '', scope: {}, forward: 0 }
  }
}

module.exports = Ref
