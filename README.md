# LittleWebGameEngine

## Scene class
```javascript
// Example export of a scene object
export default {
  // GameLoop-level Methods
  init() {
  },
  update() {
  },
  render() {
  },
  
  // Input Reaction
  pressed: {
    /* each method has the name of the 'code' property of the event
     that will be binded to it, like 'KeyD, 'AltLeft', 'Space', etc */
     Space() {
     }
  },
  released: {
  },
  fired: {
  },
};
```
