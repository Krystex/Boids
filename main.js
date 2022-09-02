const PositionComponent = new Component("position", {pos: new Vec2(), dir: new Vec2(), rot: 0})
const RenderableComponent = new Component("renderable", {visible: true})

const ecs = new ECS()
const CanvasRenderSystem = new System([PositionComponent], {
  onInit: (self) => {
    self.canvas = document.getElementById("canvas")
    self.ctx = canvas.getContext("2d")

    const dpr = window.devicePixelRatio
    if (dpr > 1) {
      let width = canvas.width
      let height = canvas.height

      self.canvas.width = width * dpr
      self.canvas.height = height * dpr
      self.canvas.style.width = width + "px"
      self.canvas.style.height = height + "px"
      
      self.ctx.scale(dpr, dpr)
    }
    console.log(self)
  },
  beforeTick: (self) => {
    self.ctx.clearRect(0, 0, self.ctx.canvas.width, self.ctx.canvas.height)
  },
  onEntity: (self, entity) => {
    if (entity.components.renderable) {
      const { pos, dir, rot } = entity.components.position
      let a = pos
      let b = pos.plus(dir.rotate_deg(rot))  // position + direction
      self.ctx.beginPath()
      self.ctx.moveTo(a.x, a.y)
      self.ctx.lineTo(b.x, b.y)
      self.ctx.stroke()
    }
  }
})

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
ecs.run()