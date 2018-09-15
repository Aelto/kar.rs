
const newFlagSearchResult = result =>
  new Proxy(result, {
    get(obj, prop) {
      if (prop === 'map') {

        return fn => fn(obj)
      }

      else {
        return obj[prop]
      }
    }
  })

class Container extends Element {

  static storeContainer(name, container) {
    if (name in Container.containerStorage) {
      // throw new Error(`key "${name}" already exists in containerStorage, use a Ref instead or rename the Container.`)
    }

    Container.containerStorage[name] = container
  }

  static getContainerFromStore(name) {
    if (!Container.containerStorage[name]) {
      throw new Error(`key "${name}" does not exist in containerStorage`)
    }

    return Container.containerStorage[name]
  }

  constructor(name, children = []) {
    super(name)

    this.children = children

    Container.storeContainer(name, this)
  }

  compare(ast, actionOnCompareTrue = null) {
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

    this.compare(ast, (this_child, ast_child) => {
      if (this_child.flagName === flag) {
        return out = newFlagSearchResult({ grammar: this_child, ast: ast_child })
      }

      if (this_child.getFirstFlagged && out === null) {
        out = this_child.getFirstFlagged(ast_child, flag)
      }
    })

    return out
  }

  getAllFlagged(ast, flag, out = []) {
    this.compare(ast, (this_child, ast_child) => {
      if (this_child.flagName === flag) {
        out.push(newFlagSearchResult({ grammar: this_child, ast: ast_child }))
      }

      if (this_child.getAllFlagged) {
        this_child.getAllFlagged(ast_child, flag, out)
      }
    })

    return out
  }
}

Container.containerStorage = {}

module.exports = Container