class Radar {
  constructor(el) {
    this.canvas = el;
    this.ctx = this.canvas.getContext("2d");
    this.canvas.classList = "radar";
    this.samples = [];
    this.sampleCount = 50;
    this.samplingCount = 0;
    this.samplingRate = 10;
  }
  
  update(dt) {
    this.samplingCount++;
    if(this.samplingCount < this.samplingRate) return;
    this.samplingCount = 0;
    const z = game.zMap.getZ(game.state.self.position) - Math.random() * 0.03 * Math.min(1, game.state.self.velocity.length * 0.1);
    this.samples.push(z);
    if(this.samples.length > this.sampleCount) this.samples.shift();
    this.draw();
  }
  
  draw() {
    this.canvas.width = this.canvas.width;
    this.samples.forEach((s, i) => {
      const x = this.canvas.width * (i / this.sampleCount);
      const y = s * this.canvas.height;
      const width = this.canvas.width / this.sampleCount;
      this.ctx.fillRect(x, y, width, this.canvas.height * 2);
    });
    const scale = game.zMap.zToDepth(1);
    const keelY = Math.cos(game.state.self.tiltAngle) * game.state.self.keelDepth / scale;
    this.ctx.fillRect(0, keelY * this.canvas.height, this.canvas.width, 1);
  }
}