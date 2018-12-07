class Input {
  constructor(el = document) {
    this.keys = [];
    this.mouse = [];
    this.mousemoveHandlers = [];
    this.mousedownHandlers = [];
    this.mouseupHandlers = [];
    this.touches = [];

    el.addEventListener('touchstart', e => {
      e.preventDefault();
      this.touches.push(e);
    });

    el.addEventListener('touchend', e => {
      this.touches = this.touches.filter(e => e.identifier !== e.identifier);
    });

    document.addEventListener('keydown', e => {
      this.keys[e.key] = true;
    });

    document.addEventListener('keyup', e => {
      this.keys[e.key] = false;
    });

    el.addEventListener('mousedown', e => {
      e.preventDefault();
      this.mouse[e.which] = true;
      this.mousedownHandlers.forEach(h => h(e));
    });

    el.addEventListener('mouseup', e => {
      this.mouse[e.which] = false;
      this.mouseupHandlers.forEach(h => h(e));
    });

    el.addEventListener('mouseleave', e => {
      this.mouse = [];
    });

    el.addEventListener('mousemove', e => {
      this.mousemoveHandlers.forEach(h => h(e));
    });
  }
}
