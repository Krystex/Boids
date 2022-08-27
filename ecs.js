function Component(name, initialState) {
  this.new = () => { return initialState }
  this.name = name
  return this
}
function Entity(initialComponents) {
  this.components = {}
  for (let component of initialComponents) {
    this.components[component.name] = component.new()
  }
  return this
}
function System(hookComponents, start) {
  this.hookComponents = hookComponents
  this.start = start
  this.step = start()
  return this
}
function ECS() {
  this.systems = []
  this.entities = []
  this.addSystems = (systems) => systems.forEach(s => this.systems.push(s))
  this.addEntities = (entities) => entities.forEach(e => this.entities.push(e))
  this.step = () => {
    for (var system of this.systems) {
      var systemComponentNames = system.hookComponents.map(comp => comp.name)
      for (var entity of this.entities) {
        var componentNames = Object.keys(entity.components)
        var match = systemComponentNames.every(name => componentNames.includes(name))
        if (match) {
          system.step(entity)
        }
      }
    }
  }
}
