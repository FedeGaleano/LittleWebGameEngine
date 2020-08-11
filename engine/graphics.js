import Renderer from './renderer.js';
import FexDebug from './debug.js';

class Graphics {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.renderingContext2D = null;
    this.canvasWidth = null;
    this.canvasHeight = null;
    this.screen = { width: 0, height: 0 };
    this.scale = null;
    this.tileSize = { w: 16, h: 16 };
    this.renderer = new Renderer(this);
    this.offScreenCanvas = document.createElement('canvas');
    this.offScreenRenderingContext2D = null;
    this.presentationCanvas = document.createElement('canvas');
    this.presentationRenderingContext2D = null;
  }

  rescale() {
    throw new Error('Graphics::rescale() method called but not implemented');
  }

  noBlur() {
    this.renderingContext2D.imageSmoothingEnabled = this.offScreenRenderingContext2D.imageSmoothingEnabled = this.presentationRenderingContext2D.imageSmoothingEnabled = false;
  }

  adjustRenderingContext() {
    const {
      canvas, screen, offScreenCanvas, presentationCanvas,
    } = this;
    canvas.width = offScreenCanvas.width = presentationCanvas.width = window.innerWidth;
    canvas.height = offScreenCanvas.height = presentationCanvas.height = window.innerHeight;
    canvas.style.backgroundColor = '#111111';
    canvas.style.padding = canvas.style.margin = offScreenCanvas.style.padding = offScreenCanvas.style.margin = presentationCanvas.style.margin = presentationCanvas.style.padding = 0;
    document.body.style.overflow = 'hidden';
    document.body.style.padding = document.body.style.margin = 0;

    this.renderingContext2D = canvas.getContext('2d');
    this.offScreenRenderingContext2D = offScreenCanvas.getContext('2d');
    this.presentationRenderingContext2D = presentationCanvas.getContext('2d');

    // this.renderingContext2D.lineWidth = 2;
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;

    this.rescale();

    if (canvas.width % 2 !== 0) {
      this.renderingContext2D.translate(0.5, 0);
      this.offScreenRenderingContext2D.translate(0.5, 0);
      this.presentationRenderingContext2D.translate(0.5, 0);
    }
    if (canvas.height % 2 !== 0) {
      this.renderingContext2D.translate(0, 0.5);
      this.offScreenRenderingContext2D.translate(0, 0.5);
      this.presentationRenderingContext2D.translate(0, 0.5);
    }

    // this.renderingContext2D.translate(0.5, 0.5);

    screen.width = this.canvasWidth / this.scale;
    screen.height = this.canvasHeight / this.scale;

    this.noBlur();
  }

  presentFrameToScreen() {
    this.presentationRenderingContext2D.drawImage(this.canvas, 0, 0, this.canvasWidth, this.canvasHeight);
  }
}

export default Graphics;
