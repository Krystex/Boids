const PositionComponent = new Component("position", {x: 0, y: 0})
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
      let pos = entity.components.position
      ctx.moveTo(pos.x, pos.y)
      ctx.lineTo(400, 400)
      ctx.stroke()
    }
  }
})

const ExampleLine = new Entity([PositionComponent, RenderableComponent])
ExampleLine.components.position.x = 10
ExampleLine.components.position.y = 10

ecs.addSystems([RenderSystem])
ecs.addEntities([ExampleLine])

ecs.step()
