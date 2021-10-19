const PositionComponent = new Component("position", {x: 0, y: 0, rot: 0})
const RenderableComponent = new Component("renderable", {visible: true})

const deg2rad = (angle) => angle * 3.1415926 / 180
const rotate = (point) => {
  return {
    x: Math.cos(deg2rad(point.rot)) - Math.sin(deg2rad(point.rot)) + point.x,
    y: Math.sin(deg2rad(point.rot)) + Math.cos(deg2rad(point.rot)) + point.y
  }
}

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
      console.log(pos)
      let a = rotate(pos)
      let b = rotate({x: a.x, y: a.y + 40, rot: pos.rot})
      console.log(b)
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
    }
  }
})

const ExampleLine = new Entity([PositionComponent, RenderableComponent])
ExampleLine.components.position.x = 10
ExampleLine.components.position.y = 10
ExampleLine.components.position.rot = 45

ecs.addSystems([RenderSystem])
ecs.addEntities([ExampleLine])

ecs.step()
