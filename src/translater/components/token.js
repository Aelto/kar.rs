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

    this.shouldRepeat = false

    /**
     * a temporary variable which stores the reference during the run method
     * after each call of run, this.ref is set to null.
     */
    this.ref = null
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

  repeat(bool = false) {
    this.shouldRepeat = bool

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

  run(tree, parentOutput) {
    if (tree.constructor.name === 'Token' && this.compare(tree)) {
      
      // todo store into scope
      if (this.ref === null && this.shouldStore()) {
        parentOutput.scope[this.storedVariableName] = tree.value
      }

      if (this.ref !== null && this.ref.shouldRetrieve(this.storedVariableName)) {
        this.ref.retrieveVariable(parentOutput.scope, this.storedVariableName, tree.value)
      }

      return { success: true, str: '', scope: {}, forward: 1 }
    }

    else return { success: false, str: '', scope: {}, forward: 0 }
  }
}

module.exports = Token
