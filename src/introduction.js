import { GameplayGraphics } from '../engine/rendering.js';
import { resources } from '../engine/resources.js';

let fade = 0;
const fadeSpeed = 0.005;

export default {
  // GameLoop-level Methods
  init() {
    GameplayGraphics.renderer.fillStyle = 'black';
    fade = 0;
  },
  update() {
    fade += fadeSpeed;
    if (fade >= 1) {

    }
  },
  render() {
    const { screen } = GameplayGraphics;
    const prevOpacity = GameplayGraphics.renderingContext2D.globalAlpha;
    GameplayGraphics.renderer.renderFullRectangle(0, 0, screen.width, screen.height);

    GameplayGraphics.renderingContext2D.globalAlpha = fade;
    GameplayGraphics.renderer.renderBitmapCentered(resources.fexLogo, resources.fexLogo.width * 2, resources.fexLogo.height * 2);
    GameplayGraphics.renderingContext2D.globalAlpha = prevOpacity;
  },
};
