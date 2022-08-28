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
    if (entity.components.renderable) {
      const { pos, dir, rot } = entity.components.position
      let a = pos
      let b = pos.plus(dir.rotate_deg(rot))  // position + direction
      console.log(b)
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
    }
  }
})

const ExampleLine = new Entity([PositionComponent, RenderableComponent])
ExampleLine.components.position.pos = new Vec2(100, 100)
ExampleLine.components.position.dir = new Vec2(50, 0)
ExampleLine.components.position.rot = 0

ecs.addSystems([RenderSystem])
ecs.addEntities([ExampleLine])

ecs.step()
