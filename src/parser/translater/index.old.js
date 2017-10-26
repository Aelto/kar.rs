// avec l'input `let a: int = 10;`

// D'abord traduire les éléments indéstructibles comme `a: int = 10`
// qui correspond au Construct('variable-assign')

// new Translater('variable-assign', [
//   null,
//   'var-name',
//   RefTranslater('type-decl', [null, 'var-type']),
//   null,
//   'var-value'
// ]).to(`$var-type||auto $var-name = $var-value`, {
//   auto: 'auto'
// })

const Token = require('../grammar/token.js')

class Translater {
  constructor(name, manager, schema, outputSchema) {
    this.name = name
    this.inputSchema = schema

    this.outputSchema = outputSchema
  }

  translate(result) {
    for (const res of result) {
    }
  }
}

const translaterCreator = (name, manager) => ({
  from: input => ({ to: ouput => new Translater(name, manager, input, output) })
})

class TranslaterManager {
  constructor() {
    this.translaterMap = {}
    this.translationMap = {}

    this.output = []
  }

  newUnit(name, from, to) {
    if (this.translaterMap[name]) console.log(`re-definition of the translater ${name}`)

    this.translaterMap[name] = new Translater(name, this, from, to)
    return this
  }

  translate(result, out = []) {
    const translater = this.translaterMap[result.name]

    if (!translater) {
      throw new Error(`could not find a translater for ${result.name}`)
    }

    // if (translater.inputSchema.length !== result.composition.length) {
    //   throw new Error(
    //     `the translater ${translater.name}'s input schema does not have the same length as the supplied result's composition`
    //   )
    // }

    let outputString = translater.outputSchema
    let schema = null
    let token = null

    let tokenIndex = -1
    let schemaIndex = -1

    while (true) {
      tokenIndex += 1
      schemaIndex += 1

      if (tokenIndex >= result.composition.length || schemaIndex >= translater.inputSchema.length)
        break 

      schema = translater.inputSchema[schemaIndex]
      token = result.composition[tokenIndex]

      if (token.constructor.name === 'Token') {
        // the current token does not need to be stored into the map
        if (schema === 'null' || schema === '_') continue

        // the current token matched with a schema that has already been declared
        // before, just warn the user so there is no surprise. May throw in the future
        if (this.translationMap[schema]) {
          console.log(
            `assigning a value to an already defined translation, ${schema} = ${token.value}`
          )
        }

        this.translationMap[schema] = token.value
      }

      if (token.constructor.name === 'Result' && schema.startsWith('[') && schema.match(/\[[^[|]*\]?/)[0].replace(/\?/g, '').slice(1, -1) === token.name) {
        outputString = outputString.replace(/\[[^ ]*\]/, this.translate(token, out))
      } else {
        if (schema.startsWith('[?')) {
          tokenIndex -= 1
        }
      }
    }


    // for (let i = 0; i < translater.inputSchema.length && i < result.composition.length; i++) {
    //   schema = translater.inputSchema[i]
    //   token = result.composition[i]

    //   if (token.constructor.name === 'Token') {
    //     // the current token does not need to be stored into the map
    //     if (schema === 'null' || schema === '_') continue

    //     // the current token matched with a schema that has already been declared
    //     // before, just warn the user so there is no surprise. May throw in the future
    //     if (this.translationMap[schema]) {
    //       console.log(
    //         `assigning a value to an already defined translation, ${schema} = ${token.value}`
    //       )
    //     }

    //     this.translationMap[schema] = token.value
    //   }

    //   console.log(schema, token)

    //   if (token.constructor.name === 'Result' && schema.startsWith('[') && schema.match(/\[?[^[|]*\]?/)[0].slice(1, -1) === token.name) {
    //     outputString = outputString.replace(/\[[^ ]*\]/, this.translate(token, out))
    //   }
    // }

    for (const key of Object.keys(this.translationMap)) {
      // TODO use regex

      // Here, we should find a way to get all the symboles with a default
      // value defined with a pipe (|), eg. $var-type|auto
      // we then should replace them either with their name or the default values provided after the pipes
      // BUT a built regex with the new RegExp constructor doesn't seem
      // to work with String.replace, so there is no easy way to create a 
      // regex like /$var-name(\|[^ ])*/ where `var-name` could be replaced
      // dynamically with ${key},
      // We'll have to do it manually, by first checking if the key is found 
      // in the outputSchema and in the translationMap. And then checking for 
      // any pipe to remove them one by one if a value was found in the 
      // translationMap or to use the value of one of the fallback provided 
      // after the pipes, (my goal is to be able to put multiple variables like
      // $var-type|$automatic-type)
      // This will require lots of iterations :(
      //
      // Conclusion: It's doesn't allow fallback values atm.
      outputString = outputString.split(`$${key}`).join(this.translationMap[key])
    }

    return outputString.replace(/\[\?[^ ]*\]/g, '')
  }
}

module.exports = TranslaterManager
