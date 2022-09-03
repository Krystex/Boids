const PositionComponent = new Component("position", {pos: new Vec2(), dir: new Vec2(), rot: 0})
const RenderableComponent = new Component("renderable", {visible: true})
const LineDrawableComponent = new Component("line", {a: new Vec2(0,0), b: new Vec2(100,0)})

const ecs = new ECS()
class PhysicsSystem extends System {
  constructor() {
    super([PositionComponent])
    this.hookComponents = [PositionComponent]
  }
  beforeTick() {}
  onEntity(entity) {
    const {pos, dir, rot} = entity.components.position
    const trans = Mat3x3.translation(pos.x, pos.y)
    const rotat = Mat3x3.rotation(rot)
    if (entity.components.line) {
      const {a, b} = entity.components.line
      entity.components.world = {
        _a: trans.mulVec2(rotat.mulVec2(a)),
        _b: trans.mulVec2(rotat.mulVec2(b))
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
ExampleLine.components.position.dir = new Vec2(100, 0)
ExampleLine.components.position.rot = -90

ecs.addSystems([PhysicsSystem, CanvasRenderSystem])
ecs.addEntities([ExampleLine])

ecs.beforeTick = () => {
  ExampleLine.components.position.rot = (new Date().getTime() / 50)
}
ecs.init()
ecs.tick()
document.querySelector("#tickbutton").onclick = () => {
  ecs.beforeTick()
  ecs.tick()
}
// ecs.run()