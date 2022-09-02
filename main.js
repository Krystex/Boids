const PositionComponent = new Component("position", {pos: new Vec2(), dir: new Vec2(), rot: 0})
const RenderableComponent = new Component("renderable", {visible: true})

const ecs = new ECS()
const RenderSystem = new System([PositionComponent], () => {
  let canvas = document.getElementById("canvas")
  let ctx = canvas.getContext("2d")

  const dpr = window.devicePixelRatio
  if (dpr > 1) {
    let width = canvas.width
    let height = canvas.height

    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = width + "px"
    canvas.style.height = height + "px"
    
    ctx.scale(dpr, dpr)
  }

  return (entity) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    if (entity.components.renderable) {
      const { pos, dir, rot } = entity.components.position
      let a = pos
      let b = pos.plus(dir.rotate_deg(rot))  // position + direction
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
    }
  }
})

const ExampleLine = new Entity([PositionComponent, RenderableComponent])
ExampleLine.components.position.pos = new Vec2(100, 100)
ExampleLine.components.position.dir = new Vec2(100, 0)
ExampleLine.components.position.rot = -90

ecs.addSystems([RenderSystem])
ecs.addEntities([ExampleLine])

const animate = () => {
  ExampleLine.components.position.rot = (new Date().getTime() / 50)
  ecs.step()
  window.requestAnimationFrame(animate)
}

window.requestAnimationFrame(animate)
