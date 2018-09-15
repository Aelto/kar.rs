
const Container = require('./container')

function Reference(name) {
  const container = Container.getContainerFromStore(name)
  const copy = Object.assign(new Container(container.name, container.children), container)

  return copy
}

module.exports = Reference