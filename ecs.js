function Component(name, initialState) {
    this.new = () => {return initialState}
    this.name = name
    return this
}
function Entity(initialComponents) {
    this.components = {}
    for (let component of initialComponents) {
        this.components[component.name] = component.new()
    }
    return this
}
function System(hookComponents, start) {
    this.hookComponents = hookComponents
    this.start = start
    this.step = start()
    return this
}
function ECS() {
    this.systems = []
    this.entities = []
    this.addSystems = (systems) => systems.forEach(s => this.systems.push(s))
    this.addEntities = (entities) => entities.forEach(e => this.entities.push(e))
    this.step = () => {
        for (var system of this.systems) {
            var system_componentnames = system.hookComponents.map(comp => comp.name)
            for (var entity of this.entities) {
                var match = Object.keys(entity.components).every(comp => system_componentnames.includes(comp))
                if (match) {
                    system.step(entity)
                }
            }
        }
    }
}

const PositionComponent = new Component("position", {x: 0, y: 0})
const RenderableComponent = new Component("renderable", {visible: true})

const Boid = new Entity([PositionComponent])
const RenderSystem = new System([PositionComponent], () => {
    console.log("Start")

    return (entity) => {
        console.log("Step", entity)
    }
})

const ecs = new ECS()
ecs.addSystems([RenderSystem])
ecs.addEntities([Boid])

ecs.step()
ecs.step()
