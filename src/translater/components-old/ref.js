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
    return !!this.shouldRetrieveMap[name] || false
  }

  retrieveVariable(name, value) {
    console.log(name, value, this.scope)
    this.insertIntoScope(this.scope, this.shouldRetrieveMap[name], value)

    return this
  }

  storeOutput(name) {
    this.storeOutputName = name

    return this
  }

  /**
   * tells the reference to store the ouput returned by the referenced
   * under the supplied name and insert it into the scope
   */
  shouldStoreOutput(name) {
    return this.shouldStoreOutput !== null
  }

  storeOutputIntoScope(value) {
    this.insertIntoScope(this.scope, this.storeOutputName, value)

    return this
  }

  getCurrentStoreOutput() {
    return this.scope[this.storeOutputName] || ''
  }

  or(el) {
    this.orList.push(el)

    return this
  }

  compare(compared) {
    if (this.ref.compare(compared)) {
      return true
    } else {
      console.log('failed', this._refName, compared)
      return false
    }
    return this.ref.compare(compared)

    if (Array.isArray(compared) && compared.length === 1) {
      return this.ref.compare(compared[0])
    } else if (!Array.isArray) return this.ref.compare(compared)
    else if (Array.isArray(compared) && compared.length > 1) return this.ref.compare(compared)

    return false
  }

  run(result, scope) {
    if (this.ref === null) throw new Error(`ref pointing to unknown element: ${this._refName}`)

    this.scope = this.isScopePrivate
      ? Object.assign({}, scope)
      : scope

    let output = ''
    if (this.compare(result)) {
      output = this.ref.setRef(this).run(result, this.scope)
    } 
    
    else if (this.orList.length) {
      for (const orElement of this.orList) {
        if (elElement.compare(result)) {
          output = orElement.setRef(this).run(result, this.scope)
          break
        }
      }
    }
    
    else {}

    if (this.shouldStoreOutput()) {
      this.storeOutputIntoScope(this.getCurrentStoreOutput() + output)
    }

    this.scope = null
  }
}

module.exports = Ref
