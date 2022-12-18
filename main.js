const PositionComponent = new Component("position", {pos: new Vec2(), vel: new Vec2(), rot: 0})
const RenderableComponent = new Component("renderable", {visible: true})
const LineDrawableComponent = new Component("line", {})

const ecs = new ECS()
class PhysicsSystem extends System {
  constructor() {
    super([PositionComponent])
    this.hookComponents = [PositionComponent]
    this.startTime = new Date().getTime()
    this.deltaTime = 0
    this.bounds = {minx: 0, miny: 0, maxx: 400, maxy: 400}
  }
  beforeTick(_) {
    const newTime = new Date().getTime()
    this.deltaTime = newTime - this.startTime
    this.startTime = newTime
  }
  onEntity(_, entity) {
    let {pos, vel} = entity.components.position
    // Compute velocity dependend on elapsed time
    vel = vel.mul(this.deltaTime / 1000)
    // Respect bounds
    if (pos.x < this.bounds.minx) pos.x = this.bounds.maxx
    if (pos.x > this.bounds.maxx) pos.x = this.bounds.minx
    if (pos.y < this.bounds.miny) pos.y = this.bounds.maxy
    if (pos.y > this.bounds.maxy) pos.y = this.bounds.miny
    // Compute new position (add velocity to position)
    entity.components.position.pos = pos.add(vel)
    if (entity.components.line) {
      const trans = Mat3x3.translation(pos.x, pos.y)
      // const rot = Mat3x3.rotation(vel.angle())
      entity.components.world = {
        _a: trans.mul(new Vec2(0, 0)),
        _b: trans.mul(vel.unit().mul(10)),
      }
    }
  }
}
class CanvasRenderSystem extends System {
  constructor() {
    super([PositionComponent])
    this.canvas = document.getElementById("canvas")
    this.ctx = canvas.getContext("2d")

    const dpr = window.devicePixelRatio
    if (dpr > 1) {
      let width = this.canvas.width
      let height = this.canvas.height

      this.canvas.width = width * dpr
      this.canvas.height = height * dpr
      this.canvas.style.width = width + "px"
      this.canvas.style.height = height + "px"
      
      this.ctx.scale(dpr, dpr)
    }
  }
  beforeTick(_) {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
  }
  onEntity(_, entity) {
    if (entity.components.line) {
      const { _a, _b } = entity.components.world
      this.ctx.beginPath()
      this.ctx.moveTo(_a.x, _a.y)
      this.ctx.lineTo(_b.x, _b.y)
      this.ctx.stroke()
    }
  }
}
class RunECSSystem extends System {
  constructor(ecs) {
    super([])

    const runbutton = document.querySelector("#runbutton")
    const tickbutton = document.querySelector("#tickbutton")
    runbutton.onclick = () => {
      ecs.running = !ecs.running
      runbutton.innerHTML = ecs.running ? `Stop` : `Run` 
      ecs.run()
    }
    tickbutton.onclick = () => {
      ecs.tick()
    }
  }
  beforeTick() {}
  onEntity(_) {}
}
class BoidSystem extends System {
  constructor() {
    super([PositionComponent])
    this.distanceMap = {}
    this.ui = document.querySelector("#distance")
  }
  beforeTick(ecs) {
    // Create distance map: length from one point to every other point
    for (const a of ecs.entities) {
      this.distanceMap[a.id] = {}
      for (const b of ecs.entities) {
        if (a.id !== b.id) {
          this.distanceMap[a.id][b.id] = Vec2.dist(ecs.entities[a.id].components.position.pos, ecs.entities[b.id].components.position.pos)
        }
      }
    }
  }
  onEntity(_, entity) {
    // Calculate near boids
    const maxDistance = 20.
    let nearBoids = []
    for (const [oEntityId, distance] of Object.entries(this.distanceMap[entity.id])) {
      if (distance < maxDistance) {
        nearBoids.push(ecs.entities[oEntityId])
      }
    }
    
    // 1. Seperation
    if (true) {
      /// Approach one: position
      const factor = 0.5
      for (const nearBoid of nearBoids) {
        const dist = this.distanceMap[entity.id][nearBoid.id]
        const selfPos = entity.components.position.pos
        const otherPos = nearBoid.components.position.pos
        const inverseDistance = 1. / dist
        const away = otherPos.sub(selfPos).mul(inverseDistance).mul(factor)
        entity.components.position.vel = entity.components.position.vel.sub(away)
      }
    } else {
      /// Approach two: velocity
      const factor = 0.5
      const oldMagnitude = entity.components.position.vel.magnitude() // Save current magnitude, so we can restore it later
      let force = new Vec2(0, 0)
      for (const nearBoid of nearBoids) {
        const dist = this.distanceMap[entity.id][nearBoid.id]
        const selfVel = entity.components.position.vel
        const otherVel = nearBoid.components.position.vel
        force = force.add(otherVel.sub(selfVel).mul(1 / dist))
      }
      force = force.mul(factor)
      entity.components.position.vel = entity.components.position.vel.add(force)
      entity.components.position.vel = entity.components.position.vel.unit().mul(oldMagnitude)
    }
  }
}

ecs.addSystems([PhysicsSystem, CanvasRenderSystem, BoidSystem, RunECSSystem])

for (let i=0; i<30; i++) {
  let boid = new Entity([PositionComponent, RenderableComponent, LineDrawableComponent])
  boid.components.position.pos = new Vec2(Math.random() * 400, Math.random() * 400)
  boid.components.position.vel = new Vec2(Math.random_between(-30, 30), Math.random_between(-30, 30))
  ecs.addEntities([boid])
}

// a = new Entity([PositionComponent, RenderableComponent, LineDrawableComponent])
// a.components.position.pos = new Vec2(0, 0)
// a.components.position.vel = new Vec2(30, -15)
// b = new Entity([PositionComponent, RenderableComponent, LineDrawableComponent])
// b.components.position.pos = new Vec2(0, 200)
// b.components.position.vel = new Vec2(30, 0)
// ecs.addEntities([a, b])

ecs.init()
ecs.tick()

// ecs.run()