class Token {
  constructor(type) {
    /**
     * the expected type for the received token in the run method
     */
    this.type = type

    /**
     * defines whether the current object can be skipped in case
     * no matching result is found
     */
    this.isOption = false

    /**
     * Nom du scope utilisé lors du stockage de nouvelles variables
     * ou lors de la récupération d'une variable à partir du store
     */
    this.usedScope = null

    /**
     * 
     */
    this.retrievedVariables = {}

    this.storedVariableName = null

    /**
     * 
     */
    this.scopes = {}

    /**
     * a temporary variable which stores the reference during the run method
     * after each call of run, this.ref is set to null.
     */
    this.ref = null
  }

  /**
   * the logic that is executed when a variable is found in the input Result
   * @param {string} type the variable type
   * @param {string} value the variable value
   */
  onVariableFound(type, value, name) {
    if (this.ref !== null) {
      if (this.ref.shouldRetrieve(name)) {
        this.insertIntoScope(name, value)
      }
    }
  }

  /**
   * 
   */
  store(name = null) {
    this.storedVariableName = name

    return this
  }

  /**
   * 
   */
  shouldStore() {
    return this.storedVariableName !== null
  }

  /**
   * 
   */
  option(bool = false) {
    this.isOption = bool

    return this
  }

  /**
   * sets the the supplied scope name as the used scope
   * for extracted variables storage.
   * @param {string} name the scope name
   */

  useScope(name = null) {
    this.usedScope = name

    this.createScope(name)

    return this
  }

  getUsedScope() {
    if (this.usedScope === null) return null
    return this.scopes[this.usedScope] || null
  }

  createScope(name) {
    this.scopes[name] = {}

    return this
  }

  giveScope(scope, scopeName) {
    this.scopes[scopeName] = scope

    return this
  }

  insertIntoScope(value, scope = null) {
    if (scope === null) {
      if (this.getUsedScope() === null) {
        this.createScope()
      }

      scope = this.getUsedScope()
    }

    scope[this.storedVariableName] = value

    return this
  }

  /**
   * asks the reference to retrieve a variable (by his name) from
   * the variables extracted by the referenced element
   * @param {string} name variable name
   */
  retrieve(name) {
    this._shouldRetrieveMap[name] = true

    return this
  }

  option(bool = false) {
    return this
  }

  /**
   * get whether the reference will retrieve the variable with
   * the supplied name.
   * @param {string} name variable name
   * @return {bool} true if the variable with the supplied name would be extracted
   * @return {bool} false if the variable with the supplied name would not be extracted
   */
  shouldBeRetrieved() {
    return this.ref.shouldRetrieve(this.storedVariableName)
  }

  getRetrieved(value) {
    this.ref.retrieveVariable(this.storedVariableName, value)
  }

  retrieveVariable(name, value) {
    this.insertIntoScope(name, value)

    return this
  }

  /**
   * 
   */
  setRef(ref = null) {
    this.ref = ref

    return this
  }

  compare(compared) {
    if (!compared.type)
      return false

    return compared.type === this.type
  }

  run(token, scope) {
    if (token.constructor.name !== 'Token') {
      throw new Error(`expected Token, found ${token.constructor.name}`)
    }

    if (this.ref === null) {

      if (this.shouldStore()) {
        // this.insertIntoStore(token.value)
        this.insertIntoScope(token.value, scope)
      }
    } else {
      if (this.shouldBeRetrieved()) {
        this.getRetrieved(token.value)
      }

      if (this.shouldStore()) {
        this.insertIntoScope(token.value, scope)
      }
    }

    this.ref = null
  }
}

module.exports = Token
