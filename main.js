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

ctx.moveTo(0, 0)
ctx.lineTo(400, 400)
ctx.stroke()

