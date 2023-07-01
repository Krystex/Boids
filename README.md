# 🐦 Boids 🐦

Experimental boid simulation with custom ECS (Entity Component System).



https://user-images.githubusercontent.com/5840423/208698278-3c944ab0-d516-487c-8c22-016e5839dc9f.mov

Implemented to study the Entity Component System pattern.
Everything is implemented in vanilla JS, including a small basic linear algebra library.

To run the project, simply clone the repository and open `index.html`.

---

The **entity component system** has three essential primitives:
- **Entity**: basic object in scene, e.g. a `Boid`
  
  *One entity has multiple components*
- **Component**: data which describes behaviour, e.g. `LineRenderable` with attributes color and width

  *One component only has data, no actual code*
- **System**: actually implemented behaviour, e.g. `PhysicsSystem`
  
  *In main game loop, every system is executed. Method `onEntity` is executed for every available entity*
  


## Lessons learned
Findings for ECS:
- it's pretty cool to decouple objects from the actual logic
- however, data interaction between different systems can be messy (`BoidSystem` modifies velocity vector, `PhysicsSystem` applies velocity too)
- therefore, processing order is important
- this has nothing to do with the ECS, but linear algebra in JS is not great to work. no operator overloading is not nice


## Resources
[1] https://www.cs.toronto.edu/~dt/siggraph97-course/cwr87/

[2] https://github.com/beneater/boids