/**
 * 
 * @param {float} angle angle in degrees
 * @returns {float} angle in radians
 */
const deg2rad = (angle) => angle * 3.1415926 / 180
const rad2deg = (angle) => angle * 180 / 3.1415926

class Vec2 {
  /**
   * New 2d vector with x and y component
   * @param {float} x 
   * @param {float} y 
   */
  constructor(x=0, y=0) {
    this.x = x; this.y = y
  }

  toString() {
    return `[${this.x.toFixed(2)} ${this.y.toFixed(2)}]`
  }

  /**
   * Vector addition
   * @param {Vec2} other 
   * @returns {Vec2}
   */
  add(other) {
    return new Vec2(this.x + other.x, this.y + other.y)
  }

  /**
   * Vector subtraction
   * @param {Vec2} other 
   * @returns {Vec2}
   */
  sub(other) {
    return new Vec2(this.x - other.x, this.y - other.y)
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
   * Multiplication
   * @param {Number} other can be Scalar
   * @returns {Vec2}
   */
  mul(other) {
    if (!isNaN(other)) return this.mul_scalar(other)
  }

  /**
   * Division
   * @param {*} scalar scalar value
   * @returns {Vec2}
   */
  div(scalar) {
    return new Vec2(this.x / scalar, this.y / scalar)
  }

  /**
   * Magnitude of vector
   * @returns {number} magnitude
   */
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
  }

  /**
   * Calculate unit vector (norm)
   * @returns {Vec2}
   */
  unit() {
    const magnitude = this.magnitude()
    return new Vec2(this.x / magnitude, this.y / magnitude)
  }

  /**
   * Calculate angle of vector, with other vector being (0,1)
   * @returns {Number} angle in degrees
   */
  angle() {
    return rad2deg(Math.atan2(this.x, this.y))
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

  /**
   * Distance between two vectors
   * @param {Vec2} a Vector one
   * @param {Vec2} b Vector two
   * @returns {Number} distance
   */
  static dist(a, b) {
    return new Vec2(b.x - a.x, b.y - a.y).magnitude()
  }

  /**
   * Calculates the dot product between two vectors
   * @param {Vec2} a Vector one
   * @param {Vec2} b Vector two
   * @returns {Number} dot product
   */
  static dot(a, b) {
    return a.x * b.x + a.y * b.y 
  }

  /**
   * Calculates the cosine between two vectors
   * @param {Vec2} a Vector one
   * @param {Vec2} b Vector two
   * @returns {Number} cosine
   */
  static cos(a, b) {
    return Vec2.dot(a, b) / (a.magnitude() * b.magnitude())
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
  /**
   * Matrix-matrix product
   * @param {Mat3x3} mat other matrix
   * @returns {Mat3x3} result
   */
  mul_mat3x3(mat) {
    return new Mat3x3([
      // Cheat sheet: https://commons.wikimedia.org/wiki/File:3x3-Matrix-Multiplication.png
      // Col 0                                                                                           Col 1                                                                                             Col 2
      [this.mat[0][0] * mat.mat[0][0] + this.mat[0][1] * mat.mat[1][0] + this.mat[0][2] * mat.mat[2][0], this.mat[0][0] * mat.mat[0][1] + this.mat[0][1] * mat.mat[1][1] + this.mat[0][2] * mat.mat[2][1], this.mat[0][0] * mat.mat[0][2] + this.mat[0][1] * mat.mat[1][2] + this.mat[0][2] * mat.mat[2][2]],
      [this.mat[1][0] * mat.mat[0][0] + this.mat[1][1] * mat.mat[1][0] + this.mat[1][2] * mat.mat[2][0], this.mat[1][0] * mat.mat[0][1] + this.mat[1][1] * mat.mat[1][1] + this.mat[1][2] * mat.mat[2][1], this.mat[1][0] * mat.mat[0][2] + this.mat[1][1] * mat.mat[1][2] + this.mat[1][2] * mat.mat[2][2]],
      [this.mat[2][0] * mat.mat[0][0] + this.mat[2][1] * mat.mat[1][0] + this.mat[2][2] * mat.mat[2][0], this.mat[2][0] * mat.mat[0][1] + this.mat[2][1] * mat.mat[1][1] + this.mat[2][2] * mat.mat[2][1], this.mat[2][0] * mat.mat[0][2] + this.mat[2][1] * mat.mat[1][2] + this.mat[2][2] * mat.mat[2][2]]
    ])
  }

  /**
   * General multiplication
   * @param {Vec2 | Mat3x3} other 
   * @returns {Vec2 | Mat3x3}
   */
  mul(other) {
    if (other instanceof Vec2) return this.mul_vec2(other)
    else if (other instanceof Mat3x3) return this.mul_mat3x3(other)
  }
}

class Component {
  /**
   * Construct component type
   * @param {string} name Name of component
   * @param {object} initialState Initial State, which gets used for creation of every new entity
   */
  constructor(name, initialState) {
    this.new = () => { return Object.assign({}, initialState) }
    this.name = name
  }
}
class Entity {
  /**
   * Construct entity
   * @param {Array<Component>} initialComponents Components which the entity will hold. They will be constructed by calling the `.new()` method
   */
  constructor(initialComponents) {
    this.components = {}
    for (let component of initialComponents) {
      this.components[component.name] = component.new()
    }
  }
}
class System {
  /**
   * @param {Array<Component>} hookComponents Components which system gets hooked in. 
   */
  constructor(hookComponents) {
    this.hookComponents = hookComponents
  }
  onEntity() {
    alert("you need to implement the System.onEntity method!")
  }
}
class ECS {
  /**
   * Construct ECS which holds and manages systems, entities
   * @param {Object} globals Potential global settings every system can access
   */
  constructor(globals) {
    this.systems = []
    this.entities = []
    this.running = true
    this.lastEntityId = 0
    this.startTime = new Date().getTime()
    this.deltaTime = 0
    this.globals = globals
  }
  /**
   * Add and initialize systems
   * @param {Array<System>} systems 
   */
  addSystems(systems) {
    // initialize systems
    this.systems = [...this.systems, ...systems.map(s => new s(this))]
  }
  /**
   * @param {Array<Entity>} entities 
   */
  addEntities(entities) {
    for (const e of entities) {
      e.id = this.lastEntityId++
      this.entities.push(e)
    }
    this._assembleEntities()
  }

  /**
   * Assemble all entities for systems in array, so system can access all entites with `this.entities`
   */
  _assembleEntities() {
    for (const system of this.systems) {
      const componentRequirements = system.hookComponents.map(comp => comp.name)
      system.entities = this.entities.filter(e => componentRequirements.every(name => Object.keys(e.components).includes(name)))
    }
  }

  /**
   * Executes one tick. This consists of
   * - loop through all systems, execute `beforeTick` function
   *   - loop through all entities, see if system is hooked to current entity
   *   - if entity is hooked, execute `onEntity` function
   */
  tick() {
    const newTime = new Date().getTime()
    this.deltaTime = newTime - this.startTime
    this.startTime = newTime
    // Iterate through all systems
    for (const system of this.systems) {
      system.beforeTick(this, system)
      const systemComponentNames = system.hookComponents.map(comp => comp.name)
      // Iterate through all entities
      for (const entity of this.entities) {
        const componentNames = Object.keys(entity.components)
        const match = systemComponentNames.every(name => componentNames.includes(name))
        if (match) {
          system.onEntity(this, entity)
        }
      }
    }
  }
  /**
   * Continuous running loop
   */
  run() {
    const loopFunc = () => {
      this.tick()
      if (this.running) window.requestAnimationFrame(loopFunc)
    }
    if (this.running) window.requestAnimationFrame(loopFunc)
  }

  /**
   * Stop running loop
   */
  pause() {
    if (this.running) {
      this.running = false
    } else {
      const newTime = new Date().getTime()
      this.deltaTime = newTime - this.startTime
      this.startTime = newTime
      this.running = true
    }
  }
}

Math.random_between = (min, max) => {
  return Math.random() * (max - min) + min;
}