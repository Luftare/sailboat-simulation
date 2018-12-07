class Particle {
  constructor(pos, speed, life = 1, dir = new Vector(), color = "#DEF") {
    const dA = (Math.random() - 0.5);
    this.r = speed * 3 + 3 + Math.random() * 2;
    this.position = pos.clone();
    this.velocity = (new Vector()).random(speed * 2);
    this.life = life;
    this.color = color;
  }
  
  update(dt) {
    this.life -= dt * 0.5;
    this.position.scaledAdd(dt, this.velocity);
    if(this.life <= 0) this._remove = true;
  }
  
  draw(ctx) {
    ctx.globalAlpha = this.life * 0.5;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}