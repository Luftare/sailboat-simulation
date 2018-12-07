class Seamark {
  constructor({ x, y }, color) {
    this.color = color;
    this.position = new Vector(x, y);
    this.height = 30;
    this.r = 2;
  }

  draw(ctx) {
    const end = getProjectedPoint(this.position, this.height);
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;

    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.lineWidth = this.r * 2;
    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(end.x, end.y);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = this.color === 'green' ? 'lightgreen' : 'orange';
    ctx.beginPath();
    ctx.arc(end.x, end.y, this.r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
}
