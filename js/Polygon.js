class Polygon {
  constructor(nodes, color = "black") {
    this.nodes = nodes;
    this.color = color;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    this.nodes.forEach((n, i) => {
      const nextIndex = (i + 1) % this.nodes.length;
      const next = this.nodes[nextIndex];
      if(i === 0) {
        ctx.moveTo(n.x, n.y);
      } else {
        ctx.lineTo(n.x, n.y);
      }
    })
    ctx.closePath();
    ctx.fill();
  }
  
  scale(s) {
    this.nodes.forEach(n => n.scale(s))
  }
  
  translate(s) {
    this.nodes.forEach(n => n.add(s))
  }

  getSegmentIntersections(a, b) {
    let res = [];
    this.nodes.forEach((n, i) => {
      const nextIndex = (i + 1) % this.nodes.length;
      const next = this.nodes[nextIndex];
      //let point = getSegmentsIntersection(n, next, a, b);
      if(point) res.push(point);
    })
    return res;
  }

  circleIntersects(c, r) {
    let res = null;

    this.nodes.forEach(n => {
      if(res) return;
      if(n.withinRange(c, r)) {
        res = {
          node: n,
          depth: r - n.distance(c),
        }
      }
    });
    
    if(res) return res;
    
    this.nodes.forEach((n, i) => {
      if(res) return;
      const nextIndex = (i + 1) % this.nodes.length;
      const next = this.nodes[nextIndex];
      //const dist = pointSegmentDistance(c, n, next);
      const depth = dist - r;
      if(depth < 0) {
        res = {
          a: n,
          b: next,
          depth
        };
      }
    });
    return res;
  }

  pointInside(p) {
    let intersections = 0;
    let cast = new Vector(999999999, 999999999);
    this.nodes.forEach((n, i) => {
      const nextIndex = (i + 1) % this.nodes.length;
      const next = this.nodes[nextIndex];
      if(segmentsIntersecting(n, next, p, cast)) intersections++;
    })
    return (intersections % 2) === 1;
  }

  handleCircleIntersection(c, r) {
    const intersection = this.circleIntersects(c, r);
    if(intersection) {
      //pushCircleFromSegment(c, intersection.a, intersection.b, intersection.depth)
    }
  }
}
