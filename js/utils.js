function wait(t) {
  return new Promise(res => setTimeout(res, t));
}

function drawImage(ctx, image, x, y, w, h, angle) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(angle);
  ctx.translate(-x - w / 2, -y - h / 2);
  ctx.drawImage(image, x, y, w, h);
  ctx.restore();
}

function sq(a) {
  return a ** a;
}

function sqrt(a) {
  return Math.sqrt(a);
}

function handleBallsCollision(a, b) {
  //expect that balls a and b intersect
  let vA = new Vector(); //post collision velocities
  let vB = new Vector();
  let pA = new Vector(); //post collision position
  let pB = new Vector();
  let dV = new Vector(); //substraction of velocities
  let dP = new Vector(); //substraction of positions

  let bounciness = 1; //Math.min(a.bounciness, b.bounciness);

  //pull Each ball apart from each other
  let depth = a.r + b.r - a.position.distance(b.position);
  pA.set(a.position)
    .substract(b.position)
    .toLength(depth / 2);
  pB.set(b.position)
    .substract(a.position)
    .toLength(depth / 2);
  a.position.add(pA);
  b.position.add(pB);

  //Ball a:
  dV.set(a.velocity).substract(b.velocity);
  dP.set(a.position).substract(b.position);
  let mFactor = (2 * b.mass) / (a.mass + b.mass);
  let cFactor = dV.dot(dP) / dP.length ** 2;
  let factor = mFactor * cFactor;
  vA.set(a.velocity).substract(dP.scale(factor));

  //Ball b:
  dV.set(b.velocity).substract(a.velocity);
  dP.set(b.position).substract(a.position);
  mFactor = (2 * a.mass) / (a.mass + b.mass);
  cFactor = dV.dot(dP) / dP.length ** 2;
  factor = mFactor * cFactor;
  vB.set(b.velocity).substract(dP.scale(factor));

  a.velocity.set(vA).scale(bounciness);
  b.velocity.set(vB).scale(bounciness);
}

function pushCircleFromSegment(c, a, b, depth) {
  const ABn = new Vector(b)
    .substract(a)
    .normalize()
    .rotate(Math.PI / 2);
  const AB = new Vector(b).substract(a).normalize();
  ABn.scale(depth);
  c.add(ABn);
}

function getCircleLineIntersections(C, R, A, B) {
  let m = (B.y - A.y) / (B.x - A.x);

  let r = R;
  let a = C.x;
  let b = C.y;
  let c = -m * B.x + B.y;
  let aprim = 1 + m ** 2;
  let bprim = 2 * m * (c - b) - 2 * a;
  let cprim = a ** 2 + (c - b) ** 2 - r ** 2;

  let delta = bprim ** 2 - 4 * aprim * cprim;
  // delta = Math.abs(delta)

  let x1_e_intersection = (-bprim + Math.sqrt(delta)) / (2 * aprim);
  let y1_e_intersection = m * x1_e_intersection + c;

  let x2_e_intersection = (-bprim - Math.sqrt(delta)) / (2 * aprim);
  let y2_e_intersection = m * x2_e_intersection + c;

  return [
    new Vector(x1_e_intersection, y1_e_intersection),
    new Vector(x2_e_intersection, y2_e_intersection),
  ];
}

function pointSegmentDistance(c, a, b) {
  //based on: https://stackoverflow.com/a/6853926
  let x = c.x;
  let y = c.y;

  let x1 = a.x;
  let y1 = a.y;

  let x2 = b.x;
  let y2 = b.y;

  let A = x - x1;
  let B = y - y1;
  let C = x2 - x1;
  let D = y2 - y1;

  let dot = A * C + B * D;
  let len_sq = C * C + D * D;
  let param = -1;
  if (len_sq != 0)
    //in case of 0 length line
    param = dot / len_sq;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  let dx = x - xx;
  let dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

function getLinesIntersection(a, b, c, d) {
  //based on: https://stackoverflow.com/a/38977789
  let x1 = a.x;
  let y1 = a.y;
  let x2 = b.x;
  let y2 = b.y;
  let x3 = c.x;
  let y3 = c.y;
  let x4 = d.x;
  let y4 = d.y;

  var ua,
    ub,
    denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denom == 0) {
    return null;
  }
  ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
  return new Vector(x1 + ua * (x2 - x1), y1 + ua * (y2 - y1));
}

function segmentsIntersecting(s1, e1, s2, e2) {
  let p0_x = s1.x;
  let p0_y = s1.y;
  let p1_x = e1.x;
  let p1_y = e1.y;
  let p2_x = s2.x;
  let p2_y = s2.y;
  let p3_x = e2.x;
  let p3_y = e2.y;

  let s1_x, s1_y, s2_x, s2_y;
  s1_x = p1_x - p0_x;
  s1_y = p1_y - p0_y;
  s2_x = p3_x - p2_x;
  s2_y = p3_y - p2_y;

  let s, t;
  s =
    (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) /
    (-s2_x * s1_y + s1_x * s2_y);
  t =
    (s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) /
    (-s2_x * s1_y + s1_x * s2_y);

  if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
    // Collision detected
    return true;
  }

  return false; // No collision
}

function getSegmentsIntersection(s1, e1, s2, e2) {
  //based on: http://jsfiddle.net/justin_c_rounds/Gd2S2/light/
  let line1StartX = s1.x;
  let line1StartY = s1.y;
  let line1EndX = e1.x;
  let line1EndY = e1.y;
  let line2StartX = s2.x;
  let line2StartY = s2.y;
  let line2EndX = e2.x;
  let line2EndY = e2.y;
  // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
  let denominator, a, b, numerator1, numerator2, result;
  denominator =
    (line2EndY - line2StartY) * (line1EndX - line1StartX) -
    (line2EndX - line2StartX) * (line1EndY - line1StartY);
  if (denominator == 0) {
    return result;
  }
  a = line1StartY - line2StartY;
  b = line1StartX - line2StartX;
  numerator1 = (line2EndX - line2StartX) * a - (line2EndY - line2StartY) * b;
  numerator2 = (line1EndX - line1StartX) * a - (line1EndY - line1StartY) * b;
  a = numerator1 / denominator;
  b = numerator2 / denominator;

  // if we cast these lines infinitely in both directions, they intersect here:
  result = new Vector(
    line1StartX + a * (line1EndX - line1StartX),
    line1StartY + a * (line1EndY - line1StartY)
  );
  /*
    // it is worth noting that this should be the same as:
    x = line2StartX + (b * (line2EndX - line2StartX));
    y = line2StartX + (b * (line2EndY - line2StartY));
    */
  // if line1 is a segment and line2 is infinite, they intersect if:
  if (a > 0 && a < 1) {
    result.onLine1 = true;
  }
  // if line2 is a segment and line1 is infinite, they intersect if:
  if (b > 0 && b < 1) {
    result.onLine2 = true;
  }
  // if line1 and line2 are segments, they intersect if both of the above are true
  return result.onLine1 && result.onLine2 ? result : null;
}
