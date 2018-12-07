class Island {
  constructor(pos = new Vector(), r = 200) {
    const { nodes, maxR, avgR } = generateShape(r);
    this.position = pos;
    this.nodes = nodes;
    this.maxR = maxR;
    this.avgR = avgR;
  }

  draw(ctx) {
    drawShape(ctx, this.nodes, this.position, 1, 'khaki');
    drawShape(ctx, this.nodes, this.position, 0.9, 'green');
  }

  drawShallow(ctx) {
    drawShape(ctx, this.nodes, this.position, this.maxR / this.avgR, '#9DE');
  }

  drawZ(ctx) {
    let grad = ctx.createRadialGradient(
      this.position.x,
      this.position.y,
      0,
      this.position.x,
      this.position.y,
      this.maxR * 1.5
    );
    grad.addColorStop(0, 'rgba(255,0,0,1)');
    grad.addColorStop(0.5, 'rgba(255,0,0, 0.8)');
    grad.addColorStop(1, 'rgba(255,0,0,0)');

    ctx.fillStyle = grad;
    ctx.arc(this.position.x, this.position.y, this.maxR * 2, 0, Math.PI * 2);
    ctx.fill();
    //drawShape(ctx, this.nodes, this.position, this.maxR / this.avgR, grad);
    drawShape(ctx, this.nodes, this.position, 1, 'rgb(255, 0, 0)');
  }
}
