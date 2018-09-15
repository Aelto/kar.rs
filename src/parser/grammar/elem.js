const Result = require('./result.js')

class Token {
  constructor(type, value, pos) {
    this.type = type
    this.value = value
    this.pos = pos
  }
}

class Elem {
  constructor(name) {
    this.name = name

    /**
     * tells if this elem can be skipped if no match is found
     */
    this.isOption = false

    /**
     * tells if this elem can be found multiple times in a row
     * note: does only work with ref
     */
    this.doesRepeat = false

    /**
     * tells to search another Elem from the grammarStore when
     * parser
     */
    this.refName = ""

    /**
     * 
     */
    this.tokenType = ""

    /**
     * 
     */
    this.orList = []

    /**
     * 
     */
    this._group = []

    /**
     * 
     */
    this.grammarStore = {}
  }

  //region setters

  /**
   * set this Elem as a Token
   * @param {string} type token type 
   */
  token(type) {
    this.tokenType = type

    return this
  }

  /**
   * set this Elem as a reference
   * @param {string} name the reference's name
   * @param {any} grammarStore
   */
  ref(name, grammarStore) {
    if (!grammarStore) {
      throw new Error('no grammarStore was supplied')
    }

    this.refName = name
    this.grammarStore = grammarStore

    return this
  }

  /**
   * set this Elem as an option, this means the Elem is skipped if no match
   * is found
   * @param {boolean} bool whether or not this Elem is an option and can be skipped
   */
  option(bool = false) {
    this.isOption = bool

    return this
  }

  group(list = []) {
    this._group = list.map(el => {
      el.name = this.name + '-' + el.name

      return el
    })

    return this
  }

  /**
   * 
   * @param {Elem} elem 
   */
  or(elem) {
    this.orList.push(elem)

    return this
  }

  repeat(bool = false) {
    this.doesRepeat = bool

    return this
  }

  //endregion

  //region getters
  isRef() {
    return this.refName !== ""
  }

  isToken() {
    return this.tokenType !== ""
  }

  get type() {
    return this.tokenType
  }
  //endregion

  //region helpers
  nestedLength(tree) {
    let total = 0

    if (Array.isArray(tree.group)) {
      for (const child of tree.group)
        total += this.nestedLength(child)
      return total
    } else {
      return 1
    }
  }

  nestedElemLength(entry) {
    let total = 0

    if (entry.isRef() && !entry.isOption) {
      total = this.nestedElemLength(entry.grammarStore[entry.refName])
    }

    if (entry._group.length) {
      for (const child of entry._group)
        total += this.nestedElemLength(child)
    }

    if (entry.isToken() && !entry.isOption) {
      total = 1
    }

    return total
  }
  //endregion

  /**
   * 
   * @param {*} source 
   * @param {Number} position 
   * @param {*} result 
   */
  parse(source, position = 0, result = new Result(this.name)) {
    if (this._group.length) {
      return this.parseGroup(source, position, result)
    } 
    
    else if (this.isRef()) {
      const r = this.grammarStore[this.refName].parse(source, position, result)

      return r
    }
    
    else if (this.isToken()) {
      const token = source[position]

      return token.type === this.type
    }
  }

  //region parses
  parseGroup(source, position, result) {
    const group = new Result(this.name)

    let tokensIndex = 0
    let groupIndex = 0

    // loops through all the tokens in this Elem group
    mainLoop: while (tokensIndex < source.length && groupIndex < this._group.length) {
      const token = source[position + tokensIndex]
      const elem = this._group[groupIndex]

      // for each token in this Elem group, parse the main token then if no match is found
      // search in the orList for other tokens
      orListLoop: for (let groupListPosition = -1; groupListPosition < elem.orList.length; groupListPosition += 1) {
        const currentElem = groupListPosition === -1
          ? elem
          : elem.orList[groupListPosition]

        if (currentElem.isRef()) {
          let subGroup = new Result()
  
          // loop until no match is found if the current token is set to repeat = true
          tokenRepeatLoop: do {
            subGroup = currentElem.parse(source, position + tokensIndex, result)
            
            const length = subGroup.nestedLength && subGroup.nestedLength()
            if (length && length >= this.nestedElemLength(currentElem))  {
              group.group.push(subGroup)
              
              // minus one because we automatically add 1 at the end of the loop
              tokensIndex += subGroup.nestedLength() - (currentElem.doesRepeat ? 0 : 1)
            }
            else {
    
              if (elem.orList.length && groupListPosition < elem.orList.length - 1) {
                continue orListLoop
              }

              else if (currentElem.isOption) {
                // tokensIndex += 1
                groupIndex += 1
                continue mainLoop
              } else break mainLoop
    
            }
          } while (currentElem.doesRepeat && subGroup.group.length)
            
        } 
        else if (currentElem.isToken()) {
          
          let result = false
          if (position + tokensIndex < source.length) {
            result = currentElem.parse(source, position + tokensIndex, group)
          }
          
          if (result) {
            group.group.push(new Token(token.type, token.value, token.pos))
            break orListLoop
          }
          else {

            if (elem.orList.length && groupListPosition < elem.orList.length - 1) {
              continue orListLoop
            }
  
            else if (currentElem.isOption) {
              tokensIndex -= 1
            } else break mainLoop
  
          }
  
        }
      }

      tokensIndex += 1
      groupIndex += 1
    }

    return group
  }
  //endregion
}

module.exports = Elem