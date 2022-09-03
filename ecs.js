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

  /**
   * Vector-scalar product
   * @param {number} scalar 
   * @returns Vec2
   */
  mul_scalar(scalar) {
    return new Vec2(scalar * this.x, scalar * this.y)
  }

  /**
   * Magnitude of vector
   * @returns {number} magnitude
   */
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  /**
   * Rotate a vector
   * @param {number} angle in degrees
   * @returns 
   */
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
class Mat3x3 {
  constructor(mat) {
    this.mat = mat
  }
  /**
   * Create a translation matrix
   * @param {number} x x-displacement
   * @param {number} y y-displacement
   * @returns {Mat3x3}
   */
  static translation(x, y) {
    return new Mat3x3([
      [1, 0, x],
      [0, 1, y],
      [0, 0, 1]
    ])
  }
  /**
   * Create a rotation matrix
   * @param {number} angle angle in degrees
   * @returns {Mat3x3}
   */
  static rotation(angle) {
    angle = deg2rad(angle)
    return new Mat3x3([
      [Math.cos(angle), -Math.sin(angle), 0],
      [Math.sin(angle),  Math.cos(angle), 0],
      [              0,                0, 1]
    ])
  }
  /**
   * Matrix-Vector product (for homogenous coordinate system)
   * @param {*} vec 
   * @returns 
   */
  mul_vec2(vec) {
    return new Vec2(
      this.mat[0][0] * vec.x + this.mat[0][1] * vec.y + this.mat[0][2], 
      this.mat[1][0] * vec.x + this.mat[1][1] * vec.y + this.mat[1][2])
  }
}

class Component {
  /**
   * Construct component type
   * @param {string} name Name of component
   * @param {object} initialState Initial State, which gets used for creation of every new entity
   */
  constructor(name, initialState) {
    this.new = () => { return initialState }
    this.name = name
  }
}
class Entity {
  constructor(initialComponents) {
    this.components = {}
    for (let component of initialComponents) {
      this.components[component.name] = component.new()
    }
  }
}
class System {
  /**
   * @param {Array<Component>} hookComponents 
   */
  constructor(hookComponents) {
    this.hookComponents = hookComponents
  }
}
class ECS {
  constructor() {
    this.systems = []
    this.entities = []
    this.running = false
  }
  /**
   * @param {Array<System>} systems 
   */
  addSystems(systems) {
    systems.forEach(s => this.systems.push(s))
  }
  /**
   * @param {Array<Entity>} entities 
   */
  addEntities(entities) {
    entities.forEach(e => this.entities.push(e))
  }
  init() {
    this.systems = this.systems.map(system => new system())
  }
  tick() {
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
  run() {
    const loopFunc = () => {
      this.beforeTick()
      this.tick()
      if (this.running) window.requestAnimationFrame(loopFunc)
    }
    window.requestAnimationFrame(loopFunc)
  }
}
