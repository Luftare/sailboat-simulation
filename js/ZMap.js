class ZMap {
  constructor({ width = 7000, height = 7000 }) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
  }

  getZ(pos) {
    return (
      1 -
      Math.min(
        1,
        this.ctx.getImageData(
          pos.x + this.canvas.width / 2,
          pos.y + this.canvas.height / 2,
          1,
          1
        ).data[3] / 255
      )
    );
  }

  getDepth(pos) {
    return this.zToDepth(this.getZ(pos));
  }

  zToDepth(z) {
    return z * 500;
  }

  draw(state) {
    const ctx = this.ctx;
    state.islands.forEach(s => s.drawZ(ctx));
  }
}
