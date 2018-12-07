class Loop {
  constructor({dt = 1000 / 60, animationFrame = false, onTick = function(){}, autoStart = false}){
    this.then = 0;
    this.running = false;
    this.targetDt = dt;
    this.onTick = onTick;
    this.lastDt = 0;
    this.loopId = 0;
    this.animationFrame = animationFrame;
    if(autoStart) this.start();
  }

  get dt() {
    return this.targetDt;
  }

  get FPS() {
    return 1000 / this.targetDt;
  }

  set dt(val) {
    this.targetDt = val;
  }

  set FPS(val) {
    this.targetDt = 1000/val;
  }

  tick() {
    const now = Date.now();
    this.lastDt = now - this.then;
    this.then = now;

    this.onTick(this.lastDt);

    if(this.running){
      if(this.animationFrame){
        this.loopId = requestAnimationFrame(this.tick.bind(this));
      } else {
        this.loopId = setTimeout(this.tick.bind(this), this.targetDt)
      }
    }
  }

  start() {
    if(this.running) return;
    this.running = true;
    this.then = Date.now() - this.targetDt;
    this.tick();
    return this;
  }

  stop() {
    this.running = false;
    if(this.animationFrame){
      cancelAnimationFrame(this.loopId);
    } else {
      clearTimeout(this.loopId);
    }
    return this;
  }
}
