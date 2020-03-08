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
  /* each method for pressed, released and fired has the name of the 'code' property of the event
     that will be binded to it, like 'KeyD, 'AltLeft', 'Space', etc */
  pressed: {
     Space() {
     }
  },
  released: {
  },
  fired: {
  },
};
```
