class TileMap {
  constructor(metadata) {
    this.scanline = metadata.layers[0].width;
    this.data = metadata.layers[0].data;
  }
}

export default TileMap;
