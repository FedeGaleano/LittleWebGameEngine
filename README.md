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
  ### Sprite class
  ```javascript
  const sprite = new Sprite(spriteSheetImage, numberOfFrames, frameRepetitions, graphics)
  const mySceneObject = {
    update() {
      sprite.update()
    }
    render() {
      sprite.render()
    }
  }
   ```
  
  ### GameplayGraphics.renderer methods
  #### renderBitmap(bitmap, x, y)
  Will interpret the bitmap as pixel art and render its data according to the current pixel scale
