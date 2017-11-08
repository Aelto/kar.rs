const Ref = require('./ref.js')

class Translate {
  /**
   * 
   * @param {string} name
   * @param {Object} options should contain keys: composition and output. Can contain `privateScope: bool`
   */
  constructor(name, options) {
    if (!options.composition)
      throw new Error('the supplied object must contain a `composition` key')

    if (!options.output) throw new Error('the supplied object must contain a `output` key')

    this.name = name

    this.isScopePrivate = options.privateScope || false

    this.scope = {}

    this.composition = options.composition

    this.output = options.output

    this.shouldRepeat = false

    /**
     * 
     */
    this.ref = null
  }

  setRef(ref = null) {
    this.ref = ref

    return this
  }

  repeat(bool = false) {
    this.shouldRepeat = bool

    return this
  }

  run(tree, parentOutput = { success: true, str: '', scope: {}, forward: 0 }) {
    console.log('> ', this.name)
    if (!tree.group)
      return { success: false, str: '', scope: {}, forward: 0 }

    let usedOutput = this.isScopePrivate
      ? Object.assign({ scope: {} }, parentOutput)
      : parentOutput

    const output = { success: true, str: '', scope: {}, forward: 0 }
    let treeIndex = 0
    let compIndex = 0

    loopThroughComposition: while (treeIndex < tree.group.length
        && compIndex < this.composition.length) {

      let compChildOutput = { success: false, str: '', scope: {}, forward: 0 }
      let compChild = null

      loopRepeat: do {
        const treeChild = tree.group[treeIndex]
        compChild = this.composition[compIndex]

        // console.log('>> ', this.name, compChild)

        this.name === 'program' && console.log(this.name, compChild.shouldRepeat)
  
        compChildOutput = compChild.run(treeChild, usedOutput)
  
        if (compChildOutput.success) {
          output.forward += compChildOutput.forward
          treeIndex += compChildOutput.forward
          // compIndex += 1
  
          if (compChildOutput.str.length) {
            output.str += compChildOutput.str
          }
        }
  
        else {
          console.log('!!!!!', compChild.name, compChild.isOption)
          if (compChild.isOption) {
            // compIndex += 1
            break loopRepeat
          }
  
          else {
            output.success = false
  
            break loopRepeat
            // return output
          }
        }

      } while (compChild.shouldRepeat 
            && compChildOutput.success 
            && treeIndex < tree.group.length
            && compIndex < this.composition.length)

      compIndex += 1
    }

    if (this.output.length) {
      for (const outputElement of this.output) {
        output.str += outputElement.run(usedOutput.scope) + ' '
      }
      
    }

    console.log('#', this.name, output.str, usedOutput.scope)

    return output
  }
}

module.exports = Translate
