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
  
  ## World API
   ```javascript
  FexEngine.World :: {
    zones :: [FexEngine.Zone],
    origin :: { x :: Double, y :: Double},
    size :: { x :: Double, y :: Double},
  }
  
  FexEngine.Zone :: {
    x :: Number,
    y :: Number,
    tileMap :: FexEngine.TileMap,
    tileSet :: [Image <- (Tile) | 0],
    width :: Number,
    height :: Number,
    tilesInX :: Number,
    tilesInY :: Number,
  }
  
  FexEngine.TileMap :: {
    scanline :: Number,
    data :: [Number <- (Tile-referring Number)] <- (RasterLayoutArray(scanline))
  }
  
  // No class needed, FexEngine.Bound is just an interface definition, any object fullfilling it qualifies as Bound
  FexEngine.Bound :: {
    x :: Number,
    y :: Number,
    width :: Number,
    height :: Number,
  }
  
  ```
