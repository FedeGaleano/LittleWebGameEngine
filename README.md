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

  ## Rendering
  ### Methods
  #### renderSprite(image, x, y)
