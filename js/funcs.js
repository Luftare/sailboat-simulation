const dtUpdate = dt => e => e.update(dt);
const ctxDraw = ctx => e => e.draw(ctx);

const getProjectedPoint = (pos, h = 0) => {
  return pos
    .clone()
    .substract(game.view.camera.position)
    .scale(game.view.camera.height / (game.view.camera.height - h))
    .add(game.view.camera.position);
};

const isActive = e => !e._remove;

const generateGates = islands => {
  const first = new Vector().random(100 + Math.random() * 2000);
  const other = new Vector().random(100 + Math.random() * 50).add(first);

  let isValid = true;

  islands.forEach(s => {
    if (s.polygon.pointInside(first) || s.polygon.pointInside(other))
      isValid = false;
  });

  return isValid
    ? [new Seamark(first, 'red'), new Seamark(other, 'green')]
    : [];
};

const generateShape = maxR => {
  let nodes = [];
  const count = 15;
  let r = maxR / 2;
  let avgR = 0;
  const startV = new Vector(1, 0).random();
  let controlAngle = ((Math.PI * 2) / count) * 0.3;
  for (let i = 0; i < count; i++) {
    r += ((Math.random() - 0.45) * maxR) / 3;
    r = Math.min(maxR, Math.max(maxR / 6, r));
    avgR += r;
    let v = startV.clone();
    v.rotate((i * Math.PI * 2) / count);
    let n0 = v.clone().rotate(-controlAngle);
    let n1 = v.clone().rotate(controlAngle);
    v.scale(r);
    n0.scale(r);
    n1.scale(r);
    nodes.push(n0, v, n1);
  }
  avgR /= count;
  nodes.push(nodes.shift());
  nodes.r = maxR;
  nodes.avgR = avgR;
  return {
    nodes,
    maxR,
    avgR,
  };
};

const drawShape = (ctx, nodes, pos, scale, color) => {
  const s = nodes.map(e =>
    e
      .clone()
      .scale(scale)
      .add(pos)
  );
  ctx.beginPath();
  s.forEach((n, i) => {
    let n1 = s[(i + 1) % s.length];
    let n2 = s[(i + 2) % s.length];
    let n3 = s[(i + 3) % s.length];
    if (i % 3 === 0) {
      ctx.lineTo(n.x, n.y);
      ctx.bezierCurveTo(n1.x, n1.y, n2.x, n2.y, n3.x, n3.y);
    }
  });
  ctx.fillStyle = color;
  ctx.fill();
};

const createIsland = (pos = new Vector(), r = 250) => {
  const shape = generateShape(r);
  return {
    nodes: shape,
    maxR: r,
    avgR: shape.avgR,
    position: pos,
  };
};

const drawIslandGradient = (ctx, island) => {
  let grad = ctx.createRadialGradient(
    island.position.x,
    island.position.y,
    0,
    island.position.x,
    island.position.y,
    island.maxR
  );
  grad.addColorStop(0, 'rgba(255,0,0,1)');
  grad.addColorStop(0.8, 'rgba(255,0,0, 0.2)');
  grad.addColorStop(1, 'rgba(255,0,0,0)');
  drawShape(
    ctx,
    island.nodes,
    island.position,
    island.maxR / island.avgR,
    grad
  );
  drawShape(ctx, island.nodes, island.position, 1, 'rgb(255, 0, 0)');
};

const drawIslandShallow = (ctx, island) => {
  drawShape(
    ctx,
    island.nodes,
    island.position,
    island.maxR / island.avgR,
    'lightblue'
  );
};

const drawIslandGround = (ctx, island) => {
  drawShape(ctx, island.nodes, island.position, 1, 'khaki');
  drawShape(ctx, island.nodes, island.position, 0.9, 'green');
  //debug
  ctx.beginPath();
  ctx.arc(island.position.x, island.position.y, island.maxR, 0, Math.PI * 2);
  ctx.closePath();
  ctx.stroke();
};

const drawIslandShape = (ctx, island) => {
  drawShape(ctx, island.nodes, island.position, 1, 'rgb(255, 0, 0)');
};

const generatePath = (size, r) => {
  const count = 5;
  const first = {
    pos: new Vector(0, -game.zMap.canvas.width / 2),
    dir: new Vector(0, 1),
    r,
  };
  const res = [first];
  for (let i = 0; i < count; i++) {
    const last = res[res.length - 1];
    const dir = last.dir
      .clone()
      .rotate((Math.random() - 0.5) * 1)
      .normalize()
      .scale(r * 4 * (Math.random() + 1));
    res.push({
      pos: last.pos.clone().add(dir),
      dir: dir.clone().normalize(),
      r: r * Math.random() + r / 2,
    });
  }
  return res;
};

const generateEnvironment = () => {
  const minR = 500;
  const maxR = 1200;
  const gateR = 200;
  const center = new Vector();
  const path = generatePath(game.zMap.canvas.width / 2, gateR);

  const arr = new Array(9).fill(1).map(s => ({
    pos: new Vector().random(
      (Math.random() * game.zMap.canvas.width) / 2 - maxR
    ),
    r: minR + Math.random() * (maxR - minR),
  }));

  arr.push(...path);

  let overlapping = true;
  while (overlapping) {
    let overlap = false;
    arr.forEach(s => {
      if (s.dir) return;
      const closest = arr
        .filter(o => o !== s)
        .sort(
          (a, b) =>
            a.pos.distance(s.pos) -
            (a.r + s.r) -
            (b.pos.distance(s.pos) - (b.r + s.r))
        )[0];
      if (closest.pos.distance(s.pos) < closest.r + s.r) {
        overlap = true;
        const avoid = s.pos
          .clone()
          .substract(closest.pos)
          .normalize()
          .scale(10);
        s.pos.add(avoid);
      }
    });
    overlapping = overlap;
  }
  const islands = arr
    .filter(s => s.pos.distance(center) > s.r)
    .filter(s => !s.dir)
    .map(s => new Island(s.pos, s.r));
  const seamarks = [];
  arr
    .filter(s => s.dir)
    .forEach(s => {
      seamarks.push(
        new Seamark(
          s.dir
            .clone()
            .rotate(Math.PI / 2)
            .scale(gateR)
            .add(s.pos),
          'green'
        )
      );
      seamarks.push(
        new Seamark(
          s.dir
            .clone()
            .rotate(-Math.PI / 2)
            .scale(gateR)
            .add(s.pos),
          'red'
        )
      );
    });
  return { islands, seamarks };
};
