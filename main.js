const PositionComponent = new Component("position", {pos: new Vec2(), vel: new Vec2(), rot: 0})
const RenderableComponent = new Component("renderable", {visible: true})
const LineDrawableComponent = new Component("line", {color: "#FFFFFF", width: 1})
const BoidComponent = new Component("boid", {predator: false})

const ecs = new ECS({
  // Bounds of field
  bound: new Vec2(400, 400)
})
class PhysicsSystem extends System {
  constructor(ecs) {
    super([PositionComponent])
    this.hookComponents = [PositionComponent]
    this.bounds = {minx: 0, miny: 0, maxx: ecs.globals.bound.x, maxy: ecs.globals.bound.y}
  }
  beforeTick(_) {}
  onEntity(ecs, entity) {
    let {pos, vel} = entity.components.position
    // Compute velocity dependend on elapsed time
    vel = vel.mul(ecs.deltaTime / 1000)
    // Respect bounds
    if (pos.x < this.bounds.minx) pos.x = this.bounds.minx + 1
    if (pos.x > this.bounds.maxx) pos.x = this.bounds.maxx - 1
    if (pos.y < this.bounds.miny) pos.y = this.bounds.miny + 1
    if (pos.y > this.bounds.maxy) pos.y = this.bounds.maxz - 1
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
      this.ctx.strokeStyle = entity.components.line.color
      this.ctx.lineWidth = entity.components.line.width
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
      ecs.pause()
      runbutton.innerHTML = ecs.running ? `Stop` : `Run` 
      ecs.run()
    }
    tickbutton.onclick = () => {
      if (!ecs.running) {
        // Simulate 30fps tick -> 33ms
        ecs.startTime = new Date().getTime() - 33
        ecs.tick()
      }
    }
  }
  beforeTick() {}
  onEntity(_) {}
}
class BoidSystem extends System {
  constructor(ecs) {
    super([PositionComponent, BoidComponent])
    this.distanceMap = {}
    this.predators = []

    for (let e of ecs.entities.filter(e => e.components.boid)) {
      if (e.components.boid.predator) {
        e.components.line.color = "red"
        e.components.line.width = 2
      }
    }
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
    this.predators = ecs.entities.filter(e => e.components.boid.predator)
  }
  onEntity(ecs, entity) {
    // Speed limit
    const speedLimit = 25.

    // Calculate near boids
    const calculateNearBoids = (maxDistance) => {
      let list = []
      for (const [oEntityId, distance] of Object.entries(this.distanceMap[entity.id])) {
        if (distance < maxDistance) {
          list.push(ecs.entities[oEntityId])
        }
      }
      return list
    }
    const nearBoidsSeparation = calculateNearBoids(20.)
    const nearBoidsMatchVelocity = calculateNearBoids(30.)
    const nearBoidsCentering = calculateNearBoids(40.)

    const isPredator = entity.components.boid.predator

    // 0. Avoid borders
    const margin = 50
    const nudgeFactor = 1.3
    const world = entity.components.position
    const bound = ecs.globals.bound
    if (world.pos.x < margin) {
      world.vel.x += nudgeFactor
    } else if (world.pos.x > (bound.x - margin)) {
      world.vel.x -= nudgeFactor
    } else if (world.pos.y < margin) {
      world.vel.y += nudgeFactor
    } else if (world.pos.y > (bound.y - margin)) {
      world.vel.y -= nudgeFactor
    }
    
    // As predator: try to attack (follow) next boid in your proximity
    if (isPredator) {
      const attackFactor = 0.1
      if (nearBoidsCentering.length > 0) {
        const nearBoid = nearBoidsCentering[0]
        const otherPos = nearBoid.components.position.pos
        const force = otherPos.sub(world.pos)
        world.vel = world.vel.add(force.mul(attackFactor))
      }

      world.vel = world.vel.unit().mul(speedLimit - 5)
      return  // don't do things normal boids do
    }
    
    // 1. Separation
    if (true) {
      /// Approach one: position
      const separationFactor = 0.1
      let force = new Vec2(0, 0)
      for (const nearBoid of nearBoidsSeparation) {
        // const dist = this.distanceMap[entity.id][nearBoid.id]
        // const inverseDistance = 1. / dist
        const otherPos = nearBoid.components.position.pos
        const away = world.pos.sub(otherPos) //.mul(inverseDistance)
        force = force.add(away)
      }
      world.vel = world.vel.add(force.mul(separationFactor))
    } else {
      /// Approach two: velocity (not used for now)
      const factor = 0.5
      const oldMagnitude = entity.components.position.vel.magnitude() // Save current magnitude, so we can restore it later
      let force = new Vec2(0, 0)
      for (const nearBoid of nearBoidsSeparation) {
        const dist = this.distanceMap[entity.id][nearBoid.id]
        const selfVel = entity.components.position.vel
        const otherVel = nearBoid.components.position.vel
        force = force.add(otherVel.sub(selfVel).mul(1 / dist))
      }
      force = force.mul(factor)
      entity.components.position.vel = entity.components.position.vel.add(force)
      entity.components.position.vel = entity.components.position.vel.unit().mul(oldMagnitude)
    }

    /// 2. Try to match velocity
    const velocityFactor = 0.1
    if (nearBoidsMatchVelocity.length > 1) {
      const sumVelocity = nearBoidsMatchVelocity
        .map(b => b.components.position.vel)
        .reduce((acc, vel) => acc.add(vel), new Vec2(0,0))
      const avgVelocity = sumVelocity.div(nearBoidsMatchVelocity.length).mul(velocityFactor) // sumVelocity / nearBoidsMatchVelocity.length * velocityFactor
      world.vel = world.vel.add(avgVelocity)
    }

    /// 3. Centering
    const centeringFactor = 0.0  // currently disabled
    if (nearBoidsCentering.length > 2) {
      const sumPosition = nearBoidsCentering
        .reduce((acc, e) => acc.add(e.components.position.pos), new Vec2(0,0))
      const avgPos = sumPosition.div(nearBoidsCentering.length)
      const direction = world.pos.sub(avgPos).mul(centeringFactor)
      world.vel = world.vel.sub(direction)
    }

    /// 4. Get away from predators
    const predatorDetectionRange = 20.
    const predatorFactor = .5
    let predatorForce = new Vec2()
    for (const pred of this.predators) {
      const dist = Vec2.dist(pred.components.position.pos, world.pos)
      if (dist < predatorDetectionRange) {
        predatorForce = predatorForce.add(world.pos.sub(pred.components.position.pos))
      }
    }
    world.vel = world.vel.add(predatorForce.mul(predatorFactor))

    /// Limit speed
    world.vel = world.vel.unit().mul(speedLimit)
  }
}

ecs.addSystems([PhysicsSystem, CanvasRenderSystem, BoidSystem, RunECSSystem])

for (let i=0; i<40; i++) {
  const bound = ecs.globals.bound
  let boid = new Entity([PositionComponent, RenderableComponent, LineDrawableComponent, BoidComponent])
  boid.components.position.pos = new Vec2(Math.random() * bound.x, Math.random() * bound.y)
  boid.components.position.vel = new Vec2(Math.random_between(-30, 30), Math.random_between(-30, 30)).unit().mul(3)
  ecs.addEntities([boid])
}
// Make two boid a predator
const numEntities = ecs.entities.length
ecs.entities[numEntities-1].components.boid.predator = true
ecs.entities[numEntities-2].components.boid.predator = true

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