class View {
  constructor({
    canvas = document.querySelector("canvas"), 
    imageNames = [],
    cameraAnchor = new Vector(0, 0),
    cameraPosition = new Vector(0, 0),
    cameraAngle = 0,
    cameraScale = 1,
    cameraHeight = 1000,
    cameraZoom = 1,
    imagesPath = "images/",
  }) {
    this.camera = {
      position: cameraPosition,
      anchor: cameraAnchor,
      angle: cameraAngle,
      scale: cameraScale,
      height: cameraHeight,
      zoom: cameraZoom,
    };
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.handleResize();
    this.fillScreen();
    this.imageNames = imageNames;
    this.imagesPath = imagesPath;
    this.images = this.loadImages();
    this.fx = {
      shakeCounter: 0,
      shakeDamp: 0.04,
      shakeAmplitude: 15,
      shakeFrq: 0.1,
    }
  }
  
  shake() {
    this.fx.shakeCounter = 1;
  }
  
  preDraw() {
    this.canvas.width = this.canvas.width;
    const now = Date.now();
    this.fx.shakeCounter = Math.max(0, this.fx.shakeCounter - this.fx.shakeDamp);
    this.ctx.setTransform(
      this.camera.zoom, 0, 0, this.camera.zoom, -(this.camera.zoom - 1) * this.canvas.width * this.camera.anchor.x,
      -(this.camera.zoom - 1) * this.canvas.height * this.camera.anchor.y
    );
    this.ctx.translate(Math.cos(now * this.fx.shakeFrq) * this.fx.shakeAmplitude * this.fx.shakeCounter, Math.sin(now * this.fx.shakeFrq) * this.fx.shakeAmplitude * this.fx.shakeCounter);
    this.ctx.translate(this.canvas.width * this.camera.anchor.x,this.canvas.height * this.camera.anchor.y);
    this.ctx.rotate(this.camera.angle);
    this.ctx.translate(- this.camera.position.x, - this.camera.position.y);
  }
  
  drawImage(img, x, y, angle = 0, scaleX = 1, scaleY = 1, shift = 0) {
    if(!img.width && !img.height) img = this.images[img];
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.translate(- x - scaleX * img.width / 2, - y - scaleY * img.height / 2);
    ctx.drawImage(img, x, y, img.width * scaleX, img.height * scaleY);
    ctx.restore();
  }
  
  loadImages() {
    const images = {};
    this.imageNames.forEach(n => {
      images[n] = new Image();
      images[n].src = `${this.imagesPath}${n}.png`;
    });
    return images;
  }

  fillScreen() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  handleResize() {
    window.onresize = this.fillScreen.bind(this);
  }
}