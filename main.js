const PositionComponent = new Component("position", {pos: new Vec2(), dir: new Vec2(), rot: 0})
const RenderableComponent = new Component("renderable", {visible: true})

const ecs = new ECS()
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
    if (entity.components.renderable) {
      const { pos, dir, rot } = entity.components.position
      let a = pos
      let b = pos.plus(dir.rotate_deg(rot))  // position + direction
      this.ctx.beginPath()
      this.ctx.moveTo(a.x, a.y)
      this.ctx.lineTo(b.x, b.y)
      this.ctx.stroke()
    }
  }
}

const ExampleLine = new Entity([PositionComponent, RenderableComponent])
ExampleLine.components.position.pos = new Vec2(100, 100)
ExampleLine.components.position.dir = new Vec2(100, 0)
ExampleLine.components.position.rot = -90

ecs.addSystems([CanvasRenderSystem])
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