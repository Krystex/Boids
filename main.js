const WorldComponent = new Component("world", {pos: new Vec2(), vel: new Vec2()})
const RenderableComponent = new Component("renderable", {visible: true})
const LineDrawableComponent = new Component("line", {color: "#FFFFFF", width: 1})
const BoidComponent = new Component("boid", {predator: false})

const ecs = new ECS({
  // Bounds of field
  bound: new Vec2(400, 400)
})
class PhysicsSystem extends System {
  constructor(ecs) {
    super([WorldComponent])
    this.hookComponents = [WorldComponent]
    this.bounds = {minx: 0, miny: 0, maxx: ecs.globals.bound.x, maxy: ecs.globals.bound.y}
  }
  beforeTick(_) {}
  onEntity(ecs, entity) {
    let {pos, vel} = entity.components.world
    // Compute velocity dependend on elapsed time
    vel = vel.mul(ecs.deltaTime / 1000)
    // Respect bounds
    if (pos.x < this.bounds.minx) pos.x = this.bounds.minx + 1
    if (pos.x > this.bounds.maxx) pos.x = this.bounds.maxx - 1
    if (pos.y < this.bounds.miny) pos.y = this.bounds.miny + 1
    if (pos.y > this.bounds.maxy) pos.y = this.bounds.maxz - 1
    // Compute new position (add velocity to position)
    entity.components.world.pos = pos.add(vel)
    if (entity.components.line) {
      const trans = Mat3x3.translation(pos.x, pos.y)
      // const rot = Mat3x3.rotation(vel.angle())
      entity.components._world = {
        _a: trans.mul(new Vec2(0, 0)),
        _b: trans.mul(vel.unit().mul(10)),
      }
    }
  }
}
class CanvasRenderSystem extends System {
  constructor() {
    super([WorldComponent])
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
      const { _a, _b } = entity.components._world
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
    const numBoidsInput = document.querySelector("#numboidsinput")
    const numPredatorsInput = document.querySelector("#numpredatorsinput")
    numBoidsInput.onfocusout = () => {
      const numBoids = parseInt(numBoidsInput.value)
      ecs.entities = ecs.entities.filter(e => e.components.boid.predator !== false)
      generateBoids(numBoids, false)
      ecs.tick()
    }
    numBoidsInput.addEventListener("keypress", e => {
      if (e.key == "Enter") { numBoidsInput.onfocusout() }
    })
    numPredatorsInput.onfocusout = () => {
      const numPredators = parseInt(numPredatorsInput.value)
      ecs.entities = ecs.entities.filter(e => e.components.boid.predator !== true)
      generateBoids(numPredators, true)
      ecs.tick()
    }
    numPredatorsInput.addEventListener("keypress", e => {
      if (e.key == "Enter") { numPredatorsInput.onfocusout() }
    })
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
    runbutton.innerHTML = ecs.running ? `Stop` : `Run`
  }
  beforeTick() {}
  onEntity(_) {}
}
class BoidSystem extends System {
  constructor(ecs) {
    super([WorldComponent, BoidComponent])
    this.distanceMap = {}
    this.predators = []
  }
  beforeTick(ecs) {
    // In case new entities got added: set color for predators
    for (const e of this.entities.filter(e => e.components.boid.predator)) {
      e.components.line.color = "red"
      e.components.line.width = 2
    }
    // Create distance map: distance from one point to every other point
    this.distanceMap = {}
    for (const a of ecs.entities) {
      this.distanceMap[a.id] = {}
      for (const b of ecs.entities) {
        this.distanceMap[a.id][b.id] = Vec2.dist(a.components.world.pos, b.components.world.pos)
      }
    }
    this.predators = this.entities.filter(e => e.components.boid.predator)
  }
  getDist(a, b) {
    return a > b ? this.distanceMap[a][b] : this.distanceMap[b][a]
  }
  onEntity(ecs, entity) {
    // Speed limit
    const speedLimit = 25.

    // Calculate near boids
    const calculateNearBoids = (maxDistance) => {
      return this.entities.filter(e => (entity.id !== e.id && this.getDist(entity.id, e.id) < maxDistance))
    }
    const nearBoidsSeparation = calculateNearBoids(20.)
    const nearBoidsMatchVelocity = calculateNearBoids(30.)
    const nearBoidsCentering = calculateNearBoids(40.)

    const isPredator = entity.components.boid.predator

    // 0. Avoid borders
    const margin = 50
    const nudgeFactor = 1.3
    const world = entity.components.world
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
        const otherPos = nearBoid.components.world.pos
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
        const otherPos = nearBoid.components.world.pos
        const away = world.pos.sub(otherPos) //.mul(inverseDistance)
        force = force.add(away)
      }
      world.vel = world.vel.add(force.mul(separationFactor))
    } else {
      /// Approach two: velocity (not used for now)
      const factor = 0.5
      const oldMagnitude = entity.components.world.vel.magnitude() // Save current magnitude, so we can restore it later
      let force = new Vec2(0, 0)
      for (const nearBoid of nearBoidsSeparation) {
        const dist = this.distanceMap[entity.id][nearBoid.id]
        const selfVel = entity.components.world.vel
        const otherVel = nearBoid.components.world.vel
        force = force.add(otherVel.sub(selfVel).mul(1 / dist))
      }
      force = force.mul(factor)
      entity.components.world.vel = entity.components.world.vel.add(force)
      entity.components.world.vel = entity.components.world.vel.unit().mul(oldMagnitude)
    }

    /// 2. Try to match velocity
    const velocityFactor = 0.1
    if (nearBoidsMatchVelocity.length > 1) {
      const sumVelocity = nearBoidsMatchVelocity
        .map(b => b.components.world.vel)
        .reduce((acc, vel) => acc.add(vel), new Vec2(0,0))
      const avgVelocity = sumVelocity.div(nearBoidsMatchVelocity.length).mul(velocityFactor) // sumVelocity / nearBoidsMatchVelocity.length * velocityFactor
      world.vel = world.vel.add(avgVelocity)
    }

    /// 3. Centering
    const centeringFactor = 0.0  // currently disabled
    if (nearBoidsCentering.length > 2) {
      const sumPosition = nearBoidsCentering
        .reduce((acc, e) => acc.add(e.components.world.pos), new Vec2(0,0))
      const avgPos = sumPosition.div(nearBoidsCentering.length)
      const direction = world.pos.sub(avgPos).mul(centeringFactor)
      world.vel = world.vel.sub(direction)
    }

    /// 4. Get away from predators
    const predatorDetectionRange = 20.
    const predatorFactor = .5
    let predatorForce = new Vec2()
    for (const pred of this.predators) {
      const dist = Vec2.dist(pred.components.world.pos, world.pos)
      if (dist < predatorDetectionRange) {
        predatorForce = predatorForce.add(world.pos.sub(pred.components.world.pos))
      }
    }
    world.vel = world.vel.add(predatorForce.mul(predatorFactor))

    /// Limit speed
    world.vel = world.vel.unit().mul(speedLimit)
  }
}

ecs.addSystems([PhysicsSystem, BoidSystem, RunECSSystem, CanvasRenderSystem])

const generateBoids = (num, predator=false) => {
  for (let i=0; i<num; i++) {
    const bound = ecs.globals.bound
    let boid = new Entity([WorldComponent, RenderableComponent, LineDrawableComponent, BoidComponent])
    boid.components.boid.predator = predator
    boid.components.world.pos = new Vec2(Math.random() * bound.x, Math.random() * bound.y)
    boid.components.world.vel = new Vec2(Math.random_between(-30, 30), Math.random_between(-30, 30)).unit().mul(3)
    ecs.addEntities([boid])
  }
}

generateBoids(40, false)
generateBoids(2, true)

ecs.init()
ecs.tick()

ecs.run()