class Boat {
  constructor({ x = 0, y = -game.zMap.canvas.width / 2 }) {
    this.position = new Vector(x, y);
    this.velocity = new Vector(0, 100);
    this.direction = new Vector(0, 1);
    this.forces = [];
    this.crashed = false;
    this.mass = 20;
    this.swimDepth = 20;
    this.keelDepth = 100;
    this.keelMass = 3000;
    this.mastHeight = 80;
    this.tiltAngle = 0;
    this.sailAngle = 0;
    this.sailSlack = 0;
    this.sailSlackThreshold = 0.3;
    this.sailMaxAngle = 0;
    this.length = 100;
    this.sailLength = 40;
    this.windFactor = 0.00001; //control speed here
    this.keelFactor = 10;
    this.dragFactor = 0.01;
    this.bodyDragFactor = 0.3;
    this.torqueFactor = 0.0001;
    this.rudderAngle = 0;
    this.rudderMaxAngle = Math.PI / 3;
    this.fx = {
      particleTime: 2,
      particleCounter: 0,
    };
  }

  update(dt) {
    this.handleInput(dt);
    this.updateTilt(dt);
    if (!this.crashed) {
      this.updateDirection(dt);

      this.updateSailAngle(dt);
      this.applyWind(dt);
      this.applyWaterResistance(dt);
      this.applyForces(dt);

      this.move(dt);
    }
    this.handleCollisions(dt);
    this.applyFX(dt);
  }

  handleCollisions(dt) {
    if (this.crashed) return;
    const depth = game.zMap.getDepth(this.position);
    const nose = this.direction
      .clone()
      .toLength(this.length / 2)
      .add(this.position);
    const tail = this.direction
      .clone()
      .toLength(this.length / 2)
      .mirror()
      .add(this.position);
    const noseDepth = game.zMap.getDepth(nose);
    const tailDepth = game.zMap.getDepth(tail);
    const keelDepth = Math.cos(this.tiltAngle) * this.keelDepth;
    if (
      depth < keelDepth ||
      noseDepth < this.swimDepth ||
      tailDepth < this.swimDepth
    )
      this.crash();
  }

  crash() {
    this.crashed = true;
    this.velocity.zero();
    game.view.shake();
  }

  applyFX(dt) {
    this.fx.particleCounter -= dt * this.velocity.length;
    if (this.fx.particleCounter <= 0) {
      this.fx.particleCounter = this.fx.particleTime;
      const head = this.direction
        .clone()
        .toLength(this.length / 2)
        .add(this.position);
      const toTail = this.direction
        .clone()
        .mirror()
        .toLength(this.length / 2);
      const s = Math.random();
      const pos = head.scaledAdd(s, toTail);
      game.state.particles.push(
        new Particle(pos, s, this.velocity.length / 50)
      );
    }
  }

  getSailWindProjectedArea() {
    const windFactor = this.direction
      .clone()
      .rotate(this.sailAngle + Math.PI / 2)
      .dot(game.state.wind.clone().normalize());
    return (
      Math.abs(windFactor) *
      Math.cos(this.tiltAngle) *
      this.mastHeight *
      this.sailLength *
      0.5
    ); //triangle-shaped sail :)
  }

  updateDirection(dt) {
    const heading = this.direction.dot(this.velocity) > 0 ? 1 : -1;
    const velocityFactor = Math.min(
      1,
      Math.max(0.05, this.velocity.length / 50)
    );
    this.direction.rotate(1 * this.rudderAngle * heading * velocityFactor * dt);
  }

  applyWind(dt) {
    const board = this.direction.cross(game.state.wind) < 0 ? -1 : 1;
    const sailNormal = this.direction
      .clone()
      .rotate(this.sailAngle + Math.PI / 2);
    const area = this.getSailWindProjectedArea();
    const relativeWind = game.state.wind.clone().substract(this.velocity);
    const perpRelativeWindSpeed = relativeWind.dot(sailNormal);
    const force = new Vector();
    const angleOfAttack = Math.acos(
      this.direction.dot(game.state.wind.clone().normalize())
    );

    force
      .set(sailNormal)
      .scale(
        perpRelativeWindSpeed ** 2 *
          area *
          this.windFactor *
          board *
          (1 - this.sailSlack)
      );

    const drag = game.state.wind
      .clone()
      .normalize()
      .scale(this.bodyDragFactor);

    if (this.sailSlack + this.sailSlackThreshold > 0) {
      const slackDrag = game.state.wind
        .clone()
        .normalize()
        .scale((this.sailSlack + this.sailSlackThreshold) * 3);
      this.forces.push(slackDrag);
    }
    this.forces.push(force, drag);
  }

  updateTilt(dt) {
    const area = this.getSailWindProjectedArea();
    const windSideComponent = game.state.wind.dot(
      this.direction.clone().rotate(Math.PI / 2)
    );
    const windTorque = area * windSideComponent;
    const keelTorque =
      this.keelMass * this.keelDepth * Math.sin(this.tiltAngle);
    const torque = windTorque - keelTorque;

    this.tiltAngle += (dt * torque * this.torqueFactor) / this.mass;
  }

  updateSailAngle(dt) {
    const board = this.direction.cross(game.state.wind) < 0 ? 1 : -1;
    const sailDir = this.direction.clone().rotate(this.sailMaxAngle * board);
    this.sailSlack = sailDir.cross(game.state.wind.clone().normalize()) * board;

    if (this.sailSlack > 0) {
      this.sailAngle =
        Math.PI -
        Math.acos(
          this.direction
            .clone()
            .normalize()
            .dot(game.state.wind.clone().normalize())
        ) *
          board;
    } else {
      const targetAngle = this.sailMaxAngle * board;
      const dA =
        targetAngle -
        this.sailAngle +
        (Math.abs(targetAngle - this.sailAngle) > Math.PI ? Math.PI * 2 : 0);
      this.sailAngle = dA * 0.04 + this.sailAngle;
      this.sailAngle = this.sailAngle % (Math.PI * 2);
    }
  }

  applyWaterResistance(dt) {
    const keelForce = new Vector();
    const dragForce = new Vector();
    const driftVelocity = this.velocity
      .clone()
      .rotate(Math.PI / 2)
      .dot(this.direction);
    const dragVelocity = this.velocity.clone().dot(this.direction);
    const board = this.velocity.cross(this.direction) < 0 ? -1 : 1;
    const heading = this.velocity.dot(this.direction) < 0 ? -1 : 1;

    keelForce
      .set(this.direction)
      .rotate(Math.PI / 2)
      .normalize()
      .scale(driftVelocity ** 2 * this.keelFactor * board);
    dragForce
      .set(this.direction)
      .mirror()
      .scale(dragVelocity ** 2 * this.dragFactor * heading);

    this.forces.push(keelForce, dragForce);
  }

  applyForces(dt) {
    const totalForce = new Vector();
    this.forces.forEach(f => totalForce.add(f));
    this.velocity.scaledAdd(dt / this.mass, totalForce);
    this.forces = [];
  }

  handleInput(dt) {
    if (game.input.keys.ArrowUp)
      this.sailMaxAngle = Math.max(this.sailMaxAngle - dt, 0);
    if (game.input.keys.ArrowDown)
      this.sailMaxAngle = Math.min(this.sailMaxAngle + dt, Math.PI / 2);
    if (game.input.keys.ArrowLeft)
      this.rudderAngle = Math.max(
        -this.rudderMaxAngle,
        this.rudderAngle - dt * 2
      );
    if (game.input.keys.ArrowRight)
      this.rudderAngle = Math.min(
        this.rudderMaxAngle,
        this.rudderAngle + dt * 2
      );
    if (!game.input.keys.ArrowRight && !game.input.keys.ArrowLeft)
      this.rudderAngle *= 0.9;

    const zoomSpeed = 0.95;

    if (game.input.keys.z && game.view.camera.zoom > 0.07) {
      game.view.camera.zoom *= zoomSpeed;
      game.view.camera.height *= 1 / zoomSpeed;
    }

    if (game.input.keys.x && game.view.camera.zoom < 3) {
      game.view.camera.zoom *= 1 / zoomSpeed;
      game.view.camera.height *= zoomSpeed;
    }

    if (game.input.touches.length) {
      const touch = game.input.touches[0].changedTouches[0];
      const { pageX: x, pageY: y } = touch;
      if (y > game.view.canvas.height / 2) {
        //change tail
        if (x < game.view.canvas.width / 2) {
          this.rudderAngle = Math.max(
            -this.rudderMaxAngle,
            this.rudderAngle - dt * 2
          );
        } else {
          this.rudderAngle = Math.min(
            this.rudderMaxAngle,
            this.rudderAngle + dt * 2
          );
        }
      } else {
        //change sail
        if (x > game.view.canvas.width / 2) {
          this.sailMaxAngle = Math.max(this.sailMaxAngle - dt, 0);
        } else {
          this.sailMaxAngle = Math.min(this.sailMaxAngle + dt, Math.PI / 2);
        }
      }
    }
  }

  move(dt) {
    this.position.scaledAdd(dt, this.velocity);
  }

  draw(ctx) {
    const head = this.direction
      .clone()
      .toLength(this.length / 2)
      .add(this.position);
    const tail = this.direction
      .clone()
      .mirror()
      .toLength(this.length / 2)
      .add(this.position);
    const slackRotation =
      0.2 *
      Math.cos(Date.now() * 0.03) *
      Math.min(1, Math.max(0, this.sailSlackThreshold + this.sailSlack));
    const sailEnd = this.direction
      .clone()
      .mirror()
      .rotate(this.sailAngle + slackRotation)
      .toLength(this.sailLength)
      .add(this.position);
    const rudderEnd = this.direction
      .clone()
      .mirror()
      .rotate(-this.rudderAngle)
      .scale(10)
      .add(tail);
    const tipXY = this.direction
      .clone()
      .rotate(Math.PI / 2)
      .scale(this.mastHeight * Math.sin(this.tiltAngle))
      .add(this.position);
    const tipH = Math.cos(this.tiltAngle) * this.mastHeight;
    const tip = getProjectedPoint(tipXY, tipH);

    //rudder
    ctx.beginPath();
    ctx.moveTo(tail.x, tail.y);
    ctx.lineTo(rudderEnd.x, rudderEnd.y);
    ctx.closePath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#DDD';
    ctx.stroke();

    game.view.drawImage(
      this.tiltAngle > 0 ? 'boatLeft' : 'boatRight',
      this.position.x,
      this.position.y,
      this.direction.angle + Math.PI / 2,
      1,
      1
    );
    game.view.drawImage(
      'boat',
      this.position.x,
      this.position.y,
      this.direction.angle + Math.PI / 2,
      Math.cos(this.tiltAngle),
      1,
      this.tiltAngle
    );

    //sail
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(sailEnd.x, sailEnd.y);
    ctx.closePath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'white';
    ctx.stroke();

    //sail
    ctx.beginPath();
    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(sailEnd.x, sailEnd.y);
    ctx.lineTo(tip.x, tip.y);
    ctx.closePath();
    ctx.fillStyle = 'orange';
    ctx.fill();

    //mast
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.moveTo(this.position.x, this.position.y);
    ctx.lineTo(tip.x, tip.y);
    ctx.closePath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'white';
    ctx.stroke();

    const wTail = game.state.wind
      .clone()
      .substract(this.velocity)
      .normalize()
      .scale(10)
      .add(tip);
    const wHead = game.state.wind
      .clone()
      .substract(this.velocity)
      .normalize()
      .scale(-10)
      .add(tip);

    //windex
    ctx.beginPath();
    ctx.moveTo(wTail.x, wTail.y);
    ctx.lineTo(wHead.x, wHead.y);
    ctx.closePath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#555';
    ctx.stroke();

    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(wTail.x, wTail.y, 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.arc(wHead.x, wHead.y, 1, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
}

class MyBoat extends Boat {
  constructor(props) {
    super(props);
  }
}
