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
  /* each method for the 'pressed', 'released' and 'fired' properties has the name of the
  'code' property of the event that will be binded to it, like 'KeyD, 'AltLeft', 'Space', etc
  keycode.info for keycodes. Additionally: 'ScreenTouch' name will serve for touchstart events */
  pressed: {
     Space() {
     }
  },
  released: {
    Digit5() {
    }
  },
  fired: {
    ScreenTouch() {
    }
  },
};
```
