
class Element {
  constructor(name) {
    this.name = name

    this.isOption = false

    this.isRepeat = false

    this.translateFunction = null

    this.flagName = null
  }

  compare(element) {
    return this.isOption || this.name === element.type
  }

  option(bool = false) {
    this.isOption = bool

    return this
  }

  repeat(bool = false) {
    this.isRepeat = bool

    return this
  }

  translate(fn = null) {
    this.translateFunction = fn

    return this
  }

  flag(name = null) {
    this.flagName = name

    return this
  }
}

class Container extends Element {
  constructor(name, children = []) {
    super(name)

    this.children = children
  }

  compare(ast, actionOnCompareTrue = null) {
    // console.log(`comparing ${ast.name} & ${this.name}`)
    if (!ast.group
     || !ast.group.length
     && ast.group.length !== this.children.length) {
      return false
    }

    if (this.name !== ast.name) {
      return false
    }

    let this_index = 0
    let ast_index = 0

    while (true) {
      const this_child = this.children[this_index]
      const ast_child = ast.group[ast_index]

      if (!this_child) {
        break
      }

      // no more items in the incoming ast,
      // while this ast expected some more
      if (!ast_child && !this_child.isOption) {
        return false
      }

      // this ast's child compare function returned
      // false, which means the two asts do not match
      const comparison = this_child.compare(ast_child)
      if (!comparison) {
        return false
      }

      if (actionOnCompareTrue !== null) {
        actionOnCompareTrue.bind(this)(this_child, ast_child)
      }

      while (ast_child.isRepeat) {
        const ast_child_repeat = ast.group[ast_index + 1]

        if (!ast_child_repeat) {
          break
        }

        const comparison = this_child.compare(this_child, ast_child_repeat)
        if (!comparison) {
          break
        }

        if (actionOnCompareTrue !== null) {
          actionOnCompareTrue.bind(this)(this_child, ast_child)
        }

        ast_index += 1
      }

      this_index += 1
      ast_index += 1
    }

    return true
  }

  run(ast) {
    const comparison = this.compare(ast, (this_child, ast_child) => {
      if (this_child.run) this_child.run(ast_child)
    })

    if (comparison && this.translateFunction !== null) {
      this.translateFunction(this, ast)
    }
  }

  getFirstFlagged(ast, flag) {
    let out = null

    const comparison = this.compare(ast, (this_child, ast_child) => {
      if (this_child.flagName === flag) {
        return out = { grammar: this_child, ast: ast_child }
      }

      if (this_child.getFirstFlagged && out === null) {
        out = this_child.getFirstFlagged(ast_child, flag)
      }
    })

    return out
  }

  getAllFlagged(ast, flag, out = []) {
    const comparison = this.compare(ast, (this_child, ast_child) => {
      if (this_child.flagName === flag) {
        out.push({ grammar: this_child, ast: ast_child })
      }

      if (this_child.getAllFlagged) {
        this_child.getAllFlagged(ast_child, flag, out)
      }
    })

    return out
  }
}


const cont = (n, c) => new Container(n, c)
const el = n => new Element(n)

const grammar = cont('program', [
  cont('variable', [
    el('let'),
    el('identifier').flag('var-name'),
    el('equal'),
    el('number').flag('var-value'),
    el('semicolon'),
  ]).option(true)
    .repeat(true)
    .translate((container, ast) => {
    const varName = container.getFirstFlagged(ast, 'var-name')
    const varValue = container.getFirstFlagged(ast, 'var-value')

    if (varName !== null && varValue !== null) {
      console.log(`auto ${varName.ast.value} = ${varValue.ast.value}`)
    }
  }),
  cont('function-declaration', [
    el('function'),
    el('identifier').flag('function-name'),
    el('paren-left'),
    cont('arguments-declaration', [
      cont('argument-declaration', [
        el('identifier').flag('arg-name'),
        cont('type-declaration', [
          el('colon'),
          el('identifier').flag('arg-type-name')
        ]).flag('arg-type')
      ]).flag('arg-declaration'),
      cont('next-argument-declaration', [
        el('comma'),
        cont('argument-declaration', [
          el('identifier').flag('arg-name'),
          cont('type-declaration', [
            el('colon'),
            el('identifier').flag('arg-type-name')
          ]).flag('arg-type')
        ]).flag('arg-declaration')
      ])
    ]),
    el('paren-right'),
    cont('type-declaration', [
      el('colon'),
      el('identifier').flag('function-return-type')
    ]),
    el('brace-left'),
    el('brace-right')
  ]).translate((container, ast) => {
    const functionName = container.getFirstFlagged(ast, 'function-name')
    const functionReturnType = container.getFirstFlagged(ast, 'function-return-type')
    const firstArg = container.getFirstFlagged(ast, 'arg-name')
    const args = container.getAllFlagged(ast, 'arg-declaration')
      .map(arg => {
        const arg_name = arg.grammar.getFirstFlagged(arg.ast, 'arg-name').ast.value
        const arg_type = arg.grammar.getFirstFlagged(arg.ast, 'arg-type-name').ast.value || 'auto'

        return `${arg_type} ${arg_name}`
      })
      .join(', ')

    console.log(`${functionReturnType.ast.value || 'void'} ${functionName.ast.value} (${args}) {}`)
  })
])

const run = (ast, depth = 1) => {
  console.log(`${' '.repeat(depth)}${ast.name || ast.type}`)
  if (ast.group && ast.group.length) {
    for (const child of ast.group) {
      run(child, depth + 1)
    }
  }
}

module.exports = (AST) => {
  // console.log(run(AST))
  grammar.run(AST)
  return ''
}