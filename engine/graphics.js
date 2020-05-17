import Renderer from './renderer.js';

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
  }

  rescale() {
    throw new Error('Graphics::rescale() method called but not implemented');
  }

  adjustRenderingContext() {
    const { canvas, screen } = this;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.backgroundColor = '#120011';
    canvas.style.padding = canvas.style.margin = 0;
    document.body.style.overflow = 'hidden';
    document.body.style.padding = document.body.style.margin = 0;

    this.renderingContext2D = canvas.getContext('2d');

    // this.renderingContext2D.lineWidth = 2;
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;

    this.rescale();

    if (canvas.width % 2 !== 0) {
      this.renderingContext2D.translate(0.5, 0);
    }
    if (canvas.height % 2 !== 0) {
      this.renderingContext2D.translate(0, 0.5);
    }

    // this.renderingContext2D.translate(0.5, 0.5);

    screen.width = this.canvasWidth / this.scale;
    screen.height = this.canvasHeight / this.scale;

    this.renderingContext2D.imageSmoothingEnabled = false;
  }
}

export default Graphics;
