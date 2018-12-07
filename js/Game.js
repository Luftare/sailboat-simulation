class Game {
  constructor() {
    this.windMeterElement = document.getElementById('wind-meter');
    this.input = new Input(document.getElementById('canvas'));
    this.view = new View({
      cameraAnchor: new Vector(0.5, 0.7),
      imageNames: ['boat', 'boatLeft', 'boatRight'],
    });
    this.zMap = new ZMap({});
    this.loop = new Loop({
      onTick: dt => {
        this.update(dt / 1000);
        this.render();
      },
      animationFrame: true,
    });
    this.radar = new Radar(document.getElementById('radar'));
    this.state = null;
    this.r = 1500;
  }

  getInitState() {
    const self = new MyBoat({});
    const players = [self];
    const { islands, seamarks } = generateEnvironment();
    const particles = [];
    const wind = new Vector(0, 200).rotate(Math.random() * Math.PI * 2);
    return {
      self,
      players,
      wind,
      seamarks,
      islands,
      particles,
    };
  }

  update(dt) {
    const update = dtUpdate(dt);
    const windChange = new Vector().random(Math.random() * 1);
    this.state.wind.add(windChange).limit(300);
    this.state.players.forEach(update);
    this.state.particles.forEach(update);
    this.state.particles = this.state.particles.filter(isActive);
    this.radar.update(dt);

    this.view.camera.position.set(this.state.self.position);
    this.view.camera.angle = -Math.PI / 2 - this.state.self.direction.angle;
    document.getElementById('speed').innerHTML =
      Math.floor(this.state.self.velocity.length / 1.5) / 10;
  }

  render() {
    const ctx = this.view.ctx;
    const draw = ctxDraw(ctx);
    this.view.preDraw();

    this.state.islands.forEach(s => s.drawShallow(ctx));
    this.state.particles.forEach(draw);
    this.state.islands.forEach(draw);
    this.state.seamarks.forEach(draw);
    this.state.players.forEach(draw);

    this.windMeterElement.style.transform = `rotate(${this.state.wind.angle -
      this.state.self.direction.angle}rad)`;
  }

  loadState() {
    this.state = this.getInitState();
    this.zMap.draw(this.state);
  }

  start() {
    this.loadState();
    this.loop.start();
  }

  stop() {}
}
