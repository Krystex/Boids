# 🐦 Boids 🐦

Experimental boid simulation with a custom Entity Component System, see on the [Online Demo](https://krystex.github.io/Boids/).

https://user-images.githubusercontent.com/5840423/208698278-3c944ab0-d516-487c-8c22-016e5839dc9f.mov

Implemented to study the Entity Component System pattern.
Everything is implemented in vanilla JS, including a tiny linear algebra library.

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
- it's pretty cool to decouple objects from the actual logic
- however, data interaction between different systems can be messy (`BoidSystem` modifies velocity vector, `PhysicsSystem` applies velocity too)
- therefore, processing order is important
- sometimes it's hard to decide to choose where the code is gonna go
- shared mutable state can be a problem. what are my entities doing?
- this has nothing to do with the ECS, but linear algebra in JS is not great to work. no operator overloading is not nice


## Resources
[1] https://www.cs.toronto.edu/~dt/siggraph97-course/cwr87/

[2] https://github.com/beneater/boids