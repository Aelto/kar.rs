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

    this.privateScope = options.privateScope || false

    this.scope = {}

    this.composition = options.composition

    this.output = options.output

    /**
     * 
     */
    this.ref = null
  }

  setRef(ref = null) {
    this.ref = ref

    return this
  }

  compare(result) {
    if (result.constructor.name !== 'Result') return false

    let resultCompositionIndex = 0
    let selfCompositionIndex = 0

    while (
      resultCompositionIndex < result.composition.length &&
      selfCompositionIndex < this.composition.length
    ) {
      const resultEl = result.composition[resultCompositionIndex]
      const selfEl = this.composition[selfCompositionIndex]

      if (!selfEl.compare(resultEl)) {
        if (resultEl.isOption) resultCompositionIndex -= 1
        else return false
      }

      resultCompositionIndex += 1
      selfCompositionIndex += 1
    }

    return true
  }

  run(result, first = false) {
    let resultCompositionIndex = 0
    let selfCompositionIndex = 0

    while (
      resultCompositionIndex < result.composition.length &&
      selfCompositionIndex < this.composition.length
    ) {
      const resultEl = result.composition[resultCompositionIndex]
      const selfEl = this.composition[selfCompositionIndex]

      if (resultEl.name === selfEl.name || resultEl.type === selfEl.name) {
        if (selfEl.constructor.name === 'Ref') {
          console.log('...')
          selfEl.run(resultEl, this.scope)
        } else {
          selfEl.setRef(this.ref).run(resultEl, this.scope)
        }
      } else {
        if (selfEl.isOption) {
          resultCompositionIndex -= 1
        } else {
          break
        }
      }

      resultCompositionIndex += 1
      selfCompositionIndex += 1
    }

    console.log(this.name, this.scope)

    if (!first) return

    let out = ''
    for (const outputElement of this.output) {
      out += outputElement.run(this.scope) + ' '
    }

    return out
  }
}

module.exports = Translate
