function Component(name, initialState) {
    return {
        new: () => {return initialState},
        name
    }
}
function Entity(initialComponents) {
    this.components = {}
    for (let component of initialComponents) {
        this.components[component.name] = component.new()
    }
    
    return this
}
function System(hookComponents, handler) {
    this.hookComponents = hookComponents
    this.handler = handler
    return this
}
function ECS() {
    this.systems = []
    this.entities = []
    this.addSystems = (systems) => systems.forEach(s => this.systems.push(s))
    this.addEntities = (entities) => entities.forEach(e => this.entities.push(e))
    this.step = () => {
        for (var system in this.systems) {
            for (var entity in this.entities) {
                var system_componentnames = system.hookComponents.map(comp => comp.name)
                var match = entity.components.every(comp => comp.name in system_componentnames)
                if (match) {
                    system.hander()
                }
            }
        }
    }
}

const PositionComponent = Component("position", {x: 0, y: 0})
const RenderableComponent = Component("renderable", {visible: true})

const Boid = new Entity([PositionComponent])
const RenderSystem = new System([PositionComponent], (entity) => {
    console.log(entity)
})

const ecs = new ECS()
ecs.addSystems([RenderSystem])
ecs.addEntities([Boid])

ecs.step()