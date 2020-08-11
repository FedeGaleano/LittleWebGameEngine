class TileMap {
  constructor(metadata) {
    this.scanline = metadata.layers[0].width;
    // this.data = metadata.layers[0].data;
    this.layers = metadata.layers.map(l => l.data);
    this.length = this.layers[0].length;
  }

  // eslint-disable-next-line class-methods-use-this
  get data() {
    throw new Error('TileMap::data is deprecated, use TileMap::layers instead');
  }
}

export default TileMap;
