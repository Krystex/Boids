/**
 * 
 * @param {float} angle angle in degrees
 * @returns {float} angle in radians
 */
const deg2rad = (angle) => angle * 3.1415926 / 180

class Vec2 {
  /**
   * New 2d vector with x and y component
   * @param {float} x 
   * @param {float} y 
   */
  constructor(x=0, y=0) {
    this.x = x; this.y = y
  }
  /**
   * Vector addition
   * @param {Vec2} other 
   * @returns {Vec2}
   */
  plus(other) {
    return new Vec2(this.x + other.x, this.y + other.y)
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  rotate_deg(angle) {
    const magnitude = this.magnitude()
    return new Vec2(
      // Math.cos(deg2rad(angle)) - Math.sin(deg2rad(angle)) * magnitude,
      // Math.sin(deg2rad(angle)) + Math.cos(deg2rad(angle)) * magnitude
      Math.cos(deg2rad(angle)) * magnitude,
      Math.sin(deg2rad(angle)) * magnitude
    )
  }
}

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
class System {
  constructor() {
    this.startTime = new Date().getTime()
  }
}
function ECS() {
  this.systems = []
  this.entities = []
  this.addSystems = (systems) => systems.forEach(s => this.systems.push(s))
  this.addEntities = (entities) => entities.forEach(e => this.entities.push(e))
  this.beforeTick = undefined
  this.init = () => {
    this.systems = this.systems.map(system => new system())
  }
  this.tick = () => {
    for (var system of this.systems) {
      system.beforeTick(system)
      var systemComponentNames = system.hookComponents.map(comp => comp.name)
      for (var entity of this.entities) {
        var componentNames = Object.keys(entity.components)
        var match = systemComponentNames.every(name => componentNames.includes(name))
        if (match) {
          system.onEntity(entity)
        }
      }
    }
  }
  // Constant running loop
  this.run = () => {
    const loopFunc = () => {
      this.beforeTick()
      this.tick()
      window.requestAnimationFrame(loopFunc)
    }
    window.requestAnimationFrame(loopFunc)
  }
}
