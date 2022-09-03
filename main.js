const PositionComponent = new Component("position", {pos: new Vec2(), vel: new Vec2(), rot: 0})
const RenderableComponent = new Component("renderable", {visible: true})
const LineDrawableComponent = new Component("line", {a: new Vec2(0,0), b: new Vec2(20,0)})

const ecs = new ECS()
class PhysicsSystem extends System {
  constructor() {
    super([PositionComponent])
    this.hookComponents = [PositionComponent]
    this.startTime = new Date().getTime()
    this.deltaTime = 0
    this.bounds = {minx: 0, miny: 0, maxx: 800, maxy: 800}
  }
  beforeTick() {
    const newTime = new Date().getTime()
    this.deltaTime = newTime - this.startTime
    this.startTime = newTime
  }
  onEntity(entity) {
    let {pos, vel} = entity.components.position
    // Compute velocity dependend on elapsed time
    vel = vel.mulScalar(this.deltaTime / 1000)
    // Respect bounds
    if (pos.x < this.bounds.minx) pos.x = this.bounds.maxx
    if (pos.x > this.bounds.maxx) pos.x = this.bounds.minx
    if (pos.y < this.bounds.miny) pos.y = this.bounds.maxy
    if (pos.y > this.bounds.maxy) pos.y = this.bounds.miny
    // Compute new position (add velocity to position)
    entity.components.position.pos = pos.plus(vel)
    if (entity.components.line) {
      const {a, b} = entity.components.line
      entity.components.world = {
        _a: a.plus(pos).plus(vel),
        _b: b.plus(pos).plus(vel)
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
  beforeTick() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
  }
  onEntity(entity) {
    if (entity.components.line) {
      const { _a, _b } = entity.components.world
      this.ctx.beginPath()
      this.ctx.moveTo(_a.x, _a.y)
      this.ctx.lineTo(_b.x, _b.y)
      this.ctx.stroke()
    }
  }
}

const ExampleLine = new Entity([PositionComponent, RenderableComponent, LineDrawableComponent])
ExampleLine.components.position.pos = new Vec2(100, 100)
ExampleLine.components.position.vel = new Vec2(10, 0)

ecs.addSystems([PhysicsSystem, CanvasRenderSystem])
ecs.addEntities([ExampleLine])

ecs.beforeTick = () => {
  // here goes animation stuff
}
ecs.init()
ecs.tick()
document.querySelector("#tickbutton").onclick = () => {
  ecs.beforeTick()
  ecs.tick()
}
const runbutton = document.querySelector("#runbutton")
runbutton.onclick = () => {
  ecs.running = !ecs.running
  runbutton.innerHTML = ecs.running ? `Stop` : `Run` 
  ecs.run()
}
// ecs.run()