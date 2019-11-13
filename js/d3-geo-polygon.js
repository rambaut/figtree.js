// https://github.com/d3/d3-geo-polygon v1.8.2 Copyright 2019 Mike Bostock
(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-array'), require('d3-geo')) :
typeof define === 'function' && define.amd ? define(['exports', 'd3-array', 'd3-geo'], factory) :
(factory((global.d3 = global.d3 || {}),global.d3,global.d3));
}(this, (function (exports,d3Array,d3Geo) { 'use strict';

function noop() {}

function clipBuffer() {
  var lines = [],
      line;
  return {
    point: function(x, y, i, t) {
      var point = [x, y];
      // when called by clipPolygon, store index and t
      if (arguments.length > 2) { point.index = i; point.t = t; }
      line.push(point);
    },
    lineStart: function() {
      lines.push(line = []);
    },
    lineEnd: noop,
    rejoin: function() {
      if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
    },
    result: function() {
      var result = lines;
      lines = [];
      line = null;
      return result;
    }
  };
}

var abs = Math.abs;
var atan = Math.atan;
var atan2 = Math.atan2;
var cos = Math.cos;
var exp = Math.exp;
var floor = Math.floor;
var log = Math.log;
var max = Math.max;
var min = Math.min;
var pow = Math.pow;
var sign = Math.sign || function(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; };
var sin = Math.sin;
var tan = Math.tan;

var epsilon = 1e-6;
var epsilon2 = 1e-12;
var pi = Math.PI;
var halfPi = pi / 2;
var quarterPi = pi / 4;
var sqrt1_2 = Math.SQRT1_2;
var sqrtPi = sqrt(pi);
var tau = pi * 2;
var degrees = 180 / pi;
var radians = pi / 180;

function asin(x) {
  return x > 1 ? halfPi : x < -1 ? -halfPi : Math.asin(x);
}

function acos(x) {
  return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
}

function sqrt(x) {
  return x > 0 ? Math.sqrt(x) : 0;
}

function pointEqual(a, b) {
  return abs(a[0] - b[0]) < epsilon && abs(a[1] - b[1]) < epsilon;
}

function Intersection(point, points, other, entry) {
  this.x = point;
  this.z = points;
  this.o = other; // another intersection
  this.e = entry; // is an entry?
  this.v = false; // visited
  this.n = this.p = null; // next & previous
}

// A generalized polygon clipping algorithm: given a polygon that has been cut
// into its visible line segments, and rejoins the segments by interpolating
// along the clip edge.
function clipRejoin(segments, compareIntersection, startInside, interpolate, stream) {
  var subject = [],
      clip = [],
      i,
      n;

  segments.forEach(function(segment) {
    if ((n = segment.length - 1) <= 0) return;
    var n, p0 = segment[0], p1 = segment[n], x;

    // If the first and last points of a segment are coincident, then treat as a
    // closed ring. TODO if all rings are closed, then the winding order of the
    // exterior ring should be checked.
    if (pointEqual(p0, p1)) {
      stream.lineStart();
      for (i = 0; i < n; ++i) stream.point((p0 = segment[i])[0], p0[1]);
      stream.lineEnd();
      return;
    }

    subject.push(x = new Intersection(p0, segment, null, true));
    clip.push(x.o = new Intersection(p0, null, x, false));
    subject.push(x = new Intersection(p1, segment, null, false));
    clip.push(x.o = new Intersection(p1, null, x, true));
  });

  if (!subject.length) return;

  clip.sort(compareIntersection);
  link(subject);
  link(clip);

  for (i = 0, n = clip.length; i < n; ++i) {
    clip[i].e = startInside = !startInside;
  }

  var start = subject[0],
      points,
      point;

  while (1) {
    // Find first unvisited intersection.
    var current = start,
        isSubject = true;
    while (current.v) if ((current = current.n) === start) return;
    points = current.z;
    stream.lineStart();
    do {
      current.v = current.o.v = true;
      if (current.e) {
        if (isSubject) {
          for (i = 0, n = points.length; i < n; ++i) stream.point((point = points[i])[0], point[1]);
        } else {
          interpolate(current.x, current.n.x, 1, stream);
        }
        current = current.n;
      } else {
        if (isSubject) {
          points = current.p.z;
          for (i = points.length - 1; i >= 0; --i) stream.point((point = points[i])[0], point[1]);
        } else {
          interpolate(current.x, current.p.x, -1, stream);
        }
        current = current.p;
      }
      current = current.o;
      points = current.z;
      isSubject = !isSubject;
    } while (!current.v);
    stream.lineEnd();
  }
}

function link(array) {
  if (!(n = array.length)) return;
  var n,
      i = 0,
      a = array[0],
      b;
  while (++i < n) {
    a.n = b = array[i];
    b.p = a;
    a = b;
  }
  a.n = b = array[0];
  b.p = a;
}

// Adds floating point numbers with twice the normal precision.
// Reference: J. R. Shewchuk, Adaptive Precision Floating-Point Arithmetic and
// Fast Robust Geometric Predicates, Discrete & Computational Geometry 18(3)
// 305–363 (1997).
// Code adapted from GeographicLib by Charles F. F. Karney,
// http://geographiclib.sourceforge.net/

function adder() {
  return new Adder;
}

function Adder() {
  this.reset();
}

Adder.prototype = {
  constructor: Adder,
  reset: function() {
    this.s = // rounded value
    this.t = 0; // exact error
  },
  add: function(y) {
    add(temp, y, this.t);
    add(this, temp.s, this.s);
    if (this.s) this.t += temp.t;
    else this.s = temp.t;
  },
  valueOf: function() {
    return this.s;
  }
};

var temp = new Adder;

function add(adder, a, b) {
  var x = adder.s = a + b,
      bv = x - a,
      av = x - bv;
  adder.t = (a - av) + (b - bv);
}

function spherical(cartesian) {
  return [atan2(cartesian[1], cartesian[0]), asin(cartesian[2])];
}

function sphericalDegrees(cartesian) {
  var c = spherical(cartesian);
  return [c[0] * degrees, c[1] * degrees];
}

function cartesian(spherical) {
  var lambda = spherical[0], phi = spherical[1], cosPhi = cos(phi);
  return [cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi)];
}

function cartesianDegrees(spherical) {
  return cartesian([spherical[0] * radians, spherical[1] * radians]);
}

function cartesianDot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cartesianCross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

// TODO return d
function cartesianNormalizeInPlace(d) {
  var l = sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
  d[0] /= l, d[1] /= l, d[2] /= l;
}

function cartesianEqual(a, b) {
  var dx = b[0] - a[0],
      dy = b[1] - a[1],
      dz = b[2] - a[2];
  return dx * dx + dy * dy + dz * dz < epsilon2 * epsilon2;
}

var sum = adder();

function polygonContains(polygon, point) {
  var lambda = point[0],
      phi = point[1],
      normal = [sin(lambda), -cos(lambda), 0],
      angle = 0,
      winding = 0;

  sum.reset();

  for (var i = 0, n = polygon.length; i < n; ++i) {
    if (!(m = (ring = polygon[i]).length)) continue;
    var ring,
        m,
        point0 = ring[m - 1],
        lambda0 = point0[0],
        phi0 = point0[1] / 2 + quarterPi,
        sinPhi0 = sin(phi0),
        cosPhi0 = cos(phi0);

    for (var j = 0; j < m; ++j, lambda0 = lambda1, sinPhi0 = sinPhi1, cosPhi0 = cosPhi1, point0 = point1) {
      var point1 = ring[j],
          lambda1 = point1[0],
          phi1 = point1[1] / 2 + quarterPi,
          sinPhi1 = sin(phi1),
          cosPhi1 = cos(phi1),
          delta = lambda1 - lambda0,
          sign$$1 = delta >= 0 ? 1 : -1,
          absDelta = sign$$1 * delta,
          antimeridian = absDelta > pi,
          k = sinPhi0 * sinPhi1;

      sum.add(atan2(k * sign$$1 * sin(absDelta), cosPhi0 * cosPhi1 + k * cos(absDelta)));
      angle += antimeridian ? delta + sign$$1 * tau : delta;

      // Are the longitudes either side of the point’s meridian (lambda),
      // and are the latitudes smaller than the parallel (phi)?
      if (antimeridian ^ lambda0 >= lambda ^ lambda1 >= lambda) {
        var arc = cartesianCross(cartesian(point0), cartesian(point1));
        cartesianNormalizeInPlace(arc);
        var intersection = cartesianCross(normal, arc);
        cartesianNormalizeInPlace(intersection);
        var phiArc = (antimeridian ^ delta >= 0 ? -1 : 1) * asin(intersection[2]);
        if (phi > phiArc || phi === phiArc && (arc[0] || arc[1])) {
          winding += antimeridian ^ delta >= 0 ? 1 : -1;
        }
      }
    }
  }

  // First, determine whether the South pole is inside or outside:
  //
  // It is inside if:
  // * the polygon winds around it in a clockwise direction.
  // * the polygon does not (cumulatively) wind around it, but has a negative
  //   (counter-clockwise) area.
  //
  // Second, count the (signed) number of times a segment crosses a lambda
  // from the point to the South pole.  If it is zero, then the point is the
  // same side as the South pole.

  return (angle < -epsilon || angle < epsilon && sum < -epsilon) ^ (winding & 1);
}

function clip(pointVisible, clipLine, interpolate, start, sort) {
  if (typeof sort === "undefined") sort = compareIntersection;

  return function(sink) {
    var line = clipLine(sink),
        ringBuffer = clipBuffer(),
        ringSink = clipLine(ringBuffer),
        polygonStarted = false,
        polygon,
        segments,
        ring;

    var clip = {
      point: point,
      lineStart: lineStart,
      lineEnd: lineEnd,
      polygonStart: function() {
        clip.point = pointRing;
        clip.lineStart = ringStart;
        clip.lineEnd = ringEnd;
        segments = [];
        polygon = [];
      },
      polygonEnd: function() {
        clip.point = point;
        clip.lineStart = lineStart;
        clip.lineEnd = lineEnd;
        segments = d3Array.merge(segments);
        var startInside = polygonContains(polygon, start);
        if (segments.length) {
          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
          clipRejoin(segments, sort, startInside, interpolate, sink);
        } else if (startInside) {
          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
          interpolate(null, null, 1, sink);
        }
        if (polygonStarted) sink.polygonEnd(), polygonStarted = false;
        segments = polygon = null;
      },
      sphere: function() {
        interpolate(null, null, 1, sink);
      }
    };

    function point(lambda, phi) {
      if (pointVisible(lambda, phi)) sink.point(lambda, phi);
    }

    function pointLine(lambda, phi) {
      line.point(lambda, phi);
    }

    function lineStart() {
      clip.point = pointLine;
      line.lineStart();
    }

    function lineEnd() {
      clip.point = point;
      line.lineEnd();
    }

    function pointRing(lambda, phi, close) {
      ring.push([lambda, phi]);
      ringSink.point(lambda, phi, close);
    }

    function ringStart() {
      ringSink.lineStart();
      ring = [];
    }

    function ringEnd() {
      pointRing(ring[0][0], ring[0][1], true);
      ringSink.lineEnd();

      var clean = ringSink.clean(),
          ringSegments = ringBuffer.result(),
          i, n = ringSegments.length, m,
          segment,
          point;

      ring.pop();
      polygon.push(ring);
      ring = null;

      if (!n) return;

      // No intersections.
      if (clean & 1) {
        segment = ringSegments[0];
        if ((m = segment.length - 1) > 0) {
          if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
          sink.lineStart();
          for (i = 0; i < m; ++i) sink.point((point = segment[i])[0], point[1]);
          sink.lineEnd();
        }
        return;
      }

      // Rejoin connected segments.
      // TODO reuse ringBuffer.rejoin()?
      if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));

      segments.push(ringSegments.filter(validSegment));
    }

    return clip;
  };
}

function validSegment(segment) {
  return segment.length > 1;
}

// Intersections are sorted along the clip edge. For both antimeridian cutting
// and circle clipping, the same comparison is used.
function compareIntersection(a, b) {
  return ((a = a.x)[0] < 0 ? a[1] - halfPi - epsilon : halfPi - a[1])
       - ((b = b.x)[0] < 0 ? b[1] - halfPi - epsilon : halfPi - b[1]);
}

function intersectSegment(from, to) {
  this.from = from, this.to = to;
  this.normal = cartesianCross(from, to);
  this.fromNormal = cartesianCross(this.normal, from);
  this.toNormal = cartesianCross(this.normal, to);
  this.l = acos(cartesianDot(from, to));
}

// >> here a and b are segments processed by intersectSegment
function intersect(a, b) {
  if (cartesianEqual(a.from, b.from) || cartesianEqual(a.from, b.to))
    return a.from;
  if (cartesianEqual(a.to, b.from) || cartesianEqual(a.to, b.to))
    return a.to;

  var lc = (a.l + b.l < pi) ? cos(a.l + b.l) - epsilon : -1;
  if (cartesianDot(a.from, b.from) < lc
  || cartesianDot(a.from, b.to) < lc
  || cartesianDot(a.to, b.from) < lc
  || cartesianDot(a.to, b.to) < lc)
    return;

  var axb = cartesianCross(a.normal, b.normal);
  cartesianNormalizeInPlace(axb);

  var a0 = cartesianDot(axb, a.fromNormal),
      a1 = cartesianDot(axb, a.toNormal),
      b0 = cartesianDot(axb, b.fromNormal),
      b1 = cartesianDot(axb, b.toNormal);

  // check if the candidate lies on both segments
  // or is almost equal to one of the four points
  if (
    (a0 > 0 && a1 < 0 && b0 > 0 && b1 < 0) ||
    (a0 >= 0 &&
      a1 <= 0 &&
      b0 >= 0 &&
      b1 <= 0 &&
      (cartesianEqual(axb, a.from) ||
        cartesianEqual(axb, a.to) ||
        cartesianEqual(axb, b.from) ||
        cartesianEqual(axb, b.to)))
  )
    return axb;

  // same test for the antipode
  axb[0] = -axb[0];
  axb[1] = -axb[1];
  axb[2] = -axb[2];
  a0 = -a0;
  a1 = -a1;
  b0 = -b0;
  b1 = -b1;

  if (
    (a0 > 0 && a1 < 0 && b0 > 0 && b1 < 0) ||
    (a0 >= 0 &&
      a1 <= 0 &&
      b0 >= 0 &&
      b1 <= 0 &&
      (cartesianEqual(axb, a.from) ||
        cartesianEqual(axb, a.to) ||
        cartesianEqual(axb, b.from) ||
        cartesianEqual(axb, b.to)))
  )
    return axb;
}

function intersectPointOnLine(p, a) {
  var a0 = cartesianDot(p, a.fromNormal),
      a1 = cartesianDot(p, a.toNormal);
  p = cartesianDot(p, a.normal);

  return abs(p) < epsilon2 && (a0 > -epsilon2 && a1 < epsilon2 || a0 < epsilon2 && a1 > -epsilon2);
}

var intersectCoincident = {};

function intersect$1(a, b) {
  var ca = a.map(p => cartesian(p.map(d => d * radians))),
      cb = b.map(p => cartesian(p.map(d => d * radians)));
  var i = intersect(
    new intersectSegment(ca[0], ca[1]),
    new intersectSegment(cb[0], cb[1])
  );
  return !i ? i : spherical(i).map(d => d * degrees);
}

var clipNone = function(stream) { return stream; };

// clipPolygon
function clipPolygon(geometry) {
  function clipGeometry(geometry) {
    var polygons;

    if (geometry.type === "MultiPolygon") {
      polygons = geometry.coordinates;
    } else if (geometry.type === "Polygon") {
      polygons = [geometry.coordinates];
    } else {
      return clipNone;
    }

    var clips = polygons.map(function(polygon) {
      polygon = polygon.map(ringRadians);
      var pointVisible = visible(polygon),
        segments = ringSegments(polygon[0]); // todo holes?
      return clip(
        pointVisible,
        clipLine(segments, pointVisible),
        interpolate(segments, polygon),
        polygon[0][0],
        clipPolygonSort
      );
    });

    var clipPolygon = function(stream) {
      var clipstream = clips.map(clip$$1 => clip$$1(stream));
      return {
        point: function(lambda, phi) {
          clipstream.forEach(clip$$1 => clip$$1.point(lambda, phi));
        },
        lineStart: function() {
          clipstream.forEach(clip$$1 => clip$$1.lineStart());
        },
        lineEnd: function() {
          clipstream.forEach(clip$$1 => clip$$1.lineEnd());
        },
        polygonStart: function() {
          clipstream.forEach(clip$$1 => clip$$1.polygonStart());
        },
        polygonEnd: function() {
          clipstream.forEach(clip$$1 => clip$$1.polygonEnd());
        },
        sphere: function() {
          clipstream.forEach(clip$$1 => clip$$1.sphere());
        }
      };
    };

    clipPolygon.polygon = function(_) {
      return _ ? ((geometry = _), clipGeometry(geometry)) : geometry;
    };
    return clipPolygon;
  }

  return clipGeometry(geometry);
}

function ringRadians(ring) {
  return ring.map(function(point) {
    return [point[0] * radians, point[1] * radians];
  });
}

function ringSegments(ring) {
  var c,
    c0,
    segments = [];
  ring.forEach(function(point, i) {
    c = cartesian(point);
    if (i) segments.push(new intersectSegment(c0, c));
    c0 = c;
    return point;
  });
  return segments;
}

function clipPolygonSort(a, b) {
  (a = a.x), (b = b.x);
  return a.index - b.index || a.t - b.t;
}

function interpolate(segments, polygon) {
  return function(from, to, direction, stream) {
    if (from == null) {
      stream.polygonStart();
      polygon.forEach(function(ring) {
        stream.lineStart();
        ring.forEach(function(point) {
          stream.point(point[0], point[1]);
        });
        stream.lineEnd();
      });
      stream.polygonEnd();
    } else if (
      from.index !== to.index &&
      from.index != null &&
      to.index != null
    ) {
      for (
        var i = from.index;
        i !== to.index;
        i = (i + direction + segments.length) % segments.length
      ) {
        var segment = segments[i],
          point = spherical(direction > 0 ? segment.to : segment.from);
        stream.point(point[0], point[1]);
      }
    } else if (
      from.index === to.index &&
      from.t > to.t &&
      from.index != null &&
      to.index != null
    ) {
      for (
        i = 0;
        i < segments.length;
        i++
      ) {
        segment = segments[(from.index + i * direction + segments.length)%segments.length],
          point = spherical(direction > 0 ? segment.to : segment.from);
        stream.point(point[0], point[1]);
      }
    }
  };
}

// Geodesic coordinates for two 3D points.
function clipPolygonDistance(a, b) {
  var axb = cartesianCross(a, b);
  return atan2(sqrt(cartesianDot(axb, axb)), cartesianDot(a, b));
}

function visible(polygon) {
  return function(lambda, phi) {
    return polygonContains(polygon, [lambda, phi]);
  };
}

function randsign(i, j) {
  return sign(sin(100 * i + j));
}

function clipLine(segments, pointVisible) {
  return function(stream) {
    var point0, lambda00, phi00, v00, v0, clean, line, lines = [];
    return {
      lineStart: function() {
        point0 = null;
        clean = 1;
        line = [];
      },
      lineEnd: function() {
        if (v0) lines.push(line);
        lines.forEach(function(line) {
          stream.lineStart();
          line.forEach(function(point) {
            stream.point(...point); // can have 4 dimensions
          });
          stream.lineEnd();
        });
        lines = [];
      },
      point: function(lambda, phi, close) {
        if (cos(lambda) == -1) lambda -= sign(sin(lambda)) * 1e-5; // move away from -180/180 https://github.com/d3/d3-geo/pull/108#issuecomment-323798937
        if (close) (lambda = lambda00), (phi = phi00);
        var point = cartesian([lambda, phi]),
          v = v0,
          intersection,
          i,
          j,
          s,
          t;
        if (point0) {
          var segment = new intersectSegment(point0, point),
            intersections = [];
          for (i = 0, j = 100; i < segments.length && j > 0; ++i) {
            s = segments[i];
            intersection = intersect(segment, s);
            if (intersection) {
              if (
                intersection === intersectCoincident ||
                cartesianEqual(intersection, point0) ||
                cartesianEqual(intersection, point) ||
                cartesianEqual(intersection, s.from) ||
                cartesianEqual(intersection, s.to)
              ) {
                t = 1e-4;
                lambda =
                  ((lambda + 3 * pi + randsign(i, j) * t) % (2 * pi)) - pi;
                phi = min(
                  pi / 2 - 1e-4,
                  max(1e-4 - pi / 2, phi + randsign(i, j) * t)
                );
                segment = new intersectSegment(
                  point0,
                  (point = cartesian([lambda, phi]))
                );
                (i = -1), --j;
                intersections.length = 0;
                continue;
              }
              var sph = spherical(intersection);
              intersection.distance = clipPolygonDistance(point0, intersection);
              intersection.index = i;
              intersection.t = clipPolygonDistance(s.from, intersection);
              (intersection[0] = sph[0]),
                (intersection[1] = sph[1]),
                intersection.pop();
              intersections.push(intersection);
            }
          }
          if (intersections.length) {
            clean = 0;
            intersections.sort(function(a, b) {
              return a.distance - b.distance;
            });
            for (i = 0; i < intersections.length; ++i) {
              intersection = intersections[i];
              v = !v;
              if (v) {
                line = [];
                line.push([
                  intersection[0],
                  intersection[1],
                  intersection.index,
                  intersection.t
                ]);
              } else {
                line.push([
                  intersection[0],
                  intersection[1],
                  intersection.index,
                  intersection.t
                ]);
                lines.push(line);
              }
            }
          }
          if (v) line.push([lambda, phi]);
        } else {
          for (i = 0, j = 100; i < segments.length && j > 0; ++i) {
            s = segments[i];
            if (intersectPointOnLine(point, s)) {
              t = 1e-4;
              lambda = ((lambda + 3 * pi + randsign(i, j) * t) % (2 * pi)) - pi;
              phi = min(
                pi / 2 - 1e-4,
                max(1e-4 - pi / 2, phi + randsign(i, j) * t)
              );
              point = cartesian([lambda, phi]);
              (i = -1), --j;
            }
          }
          v00 = v = pointVisible((lambda00 = lambda), (phi00 = phi));
          if (v) line = [], line.push([lambda, phi]);
        }
        (point0 = point), (v0 = v);
      },
      // Rejoin first and last segments if there were intersections and the first
      // and last points were visible.
      clean: function() {
        return clean | ((v00 && v0) << 1);
      }
    };
  };
}

// Note: 6-element arrays are used to denote the 3x3 affine transform matrix:
// [a, b, c,
//  d, e, f,
//  0, 0, 1] - this redundant row is left out.

// Transform matrix for [a0, a1] -> [b0, b1].
function matrix(a, b) {
  var u = subtract(a[1], a[0]),
      v = subtract(b[1], b[0]),
      phi = angle(u, v),
      s = length(u) / length(v);

  return multiply([
    1, 0, a[0][0],
    0, 1, a[0][1]
  ], multiply([
    s, 0, 0,
    0, s, 0
  ], multiply([
    cos(phi), sin(phi), 0,
    -sin(phi), cos(phi), 0
  ], [
    1, 0, -b[0][0],
    0, 1, -b[0][1]
  ])));
}

// Inverts a transform matrix.
function inverse(m) {
  var k = 1 / (m[0] * m[4] - m[1] * m[3]);
  return [
    k * m[4], -k * m[1], k * (m[1] * m[5] - m[2] * m[4]),
    -k * m[3], k * m[0], k * (m[2] * m[3] - m[0] * m[5])
  ];
}

// Multiplies two 3x2 matrices.
function multiply(a, b) {
  return [
    a[0] * b[0] + a[1] * b[3],
    a[0] * b[1] + a[1] * b[4],
    a[0] * b[2] + a[1] * b[5] + a[2],
    a[3] * b[0] + a[4] * b[3],
    a[3] * b[1] + a[4] * b[4],
    a[3] * b[2] + a[4] * b[5] + a[5]
  ];
}

// Subtracts 2D vectors.
function subtract(a, b) {
  return [a[0] - b[0], a[1] - b[1]];
}

// Magnitude of a 2D vector.
function length(v) {
  return sqrt(v[0] * v[0] + v[1] * v[1]);
}

// Angle between two 2D vectors.
function angle(a, b) {
  return atan2(a[0] * b[1] - a[1] * b[0], a[0] * b[0] + a[1] * b[1]);
}

// Creates a polyhedral projection.
//  * tree: a spanning tree of polygon faces.  Nodes are automatically
//    augmented with a transform matrix.
//  * face: a function that returns the appropriate node for a given {lambda, phi}
//    point (radians).
function polyhedral(tree, face) {

  recurse(tree, {transform: null});

  function recurse(node, parent) {
    node.edges = faceEdges(node.face);
    // Find shared edge.
    if (parent.face) {
      var shared = node.shared = sharedEdge(node.face, parent.face),
          m = matrix(shared.map(parent.project), shared.map(node.project));
      node.transform = parent.transform ? multiply(parent.transform, m) : m;
      // Replace shared edge in parent edges array.
      var edges = parent.edges;
      for (var i = 0, n = edges.length; i < n; ++i) {
        if (pointEqual$1(shared[0], edges[i][1]) && pointEqual$1(shared[1], edges[i][0])) edges[i] = node;
        if (pointEqual$1(shared[0], edges[i][0]) && pointEqual$1(shared[1], edges[i][1])) edges[i] = node;
      }
      edges = node.edges;
      for (i = 0, n = edges.length; i < n; ++i) {
        if (pointEqual$1(shared[0], edges[i][0]) && pointEqual$1(shared[1], edges[i][1])) edges[i] = parent;
        if (pointEqual$1(shared[0], edges[i][1]) && pointEqual$1(shared[1], edges[i][0])) edges[i] = parent;
      }
    } else {
      node.transform = parent.transform;
    }
    if (node.children) {
      node.children.forEach(function(child) {
        recurse(child, node);
      });
    }
    return node;
  }

  function forward(lambda, phi) {
    var node = face(lambda, phi),
        point = node.project([lambda * degrees, phi * degrees]),
        t;
    if (t = node.transform) {
      return [
        t[0] * point[0] + t[1] * point[1] + t[2],
        -(t[3] * point[0] + t[4] * point[1] + t[5])
      ];
    }
    point[1] = -point[1];
    return point;
  }

  // Naive inverse!  A faster solution would use bounding boxes, or even a
  // polygonal quadtree.
  if (hasInverse(tree)) forward.invert = function(x, y) {
    var coordinates = faceInvert(tree, [x, -y]);
    return coordinates && (coordinates[0] *= radians, coordinates[1] *= radians, coordinates);
  };

  function faceInvert(node, coordinates) {
    var invert = node.project.invert,
        t = node.transform,
        point = coordinates;
    if (t) {
      t = inverse(t);
      point = [
        t[0] * point[0] + t[1] * point[1] + t[2],
        (t[3] * point[0] + t[4] * point[1] + t[5])
      ];
    }
    if (invert && node === faceDegrees(p = invert(point))) return p;
    var p,
        children = node.children;
    for (var i = 0, n = children && children.length; i < n; ++i) {
      if (p = faceInvert(children[i], coordinates)) return p;
    }
  }

  function faceDegrees(coordinates) {
    return face(coordinates[0] * radians, coordinates[1] * radians);
  }

  var proj = d3Geo.geoProjection(forward);

  // run around the mesh of faces and stream all vertices to create the clipping polygon
  var polygon = [];
  outline({point: function(lambda, phi) { polygon.push([lambda, phi]); }}, tree);
  polygon.push(polygon[0]);
  proj.preclip(clipPolygon({ type: "Polygon", coordinates: [ polygon ] }));
  proj.tree = function() { return tree; };
  
  return proj;
}

function outline(stream, node, parent) {
  var point,
      edges = node.edges,
      n = edges.length,
      edge,
      multiPoint = {type: "MultiPoint", coordinates: node.face},
      notPoles = node.face.filter(function(d) { return abs(d[1]) !== 90; }),
      b = d3Geo.geoBounds({type: "MultiPoint", coordinates: notPoles}),
      inside = false,
      j = -1,
      dx = b[1][0] - b[0][0];
  // TODO
  node.centroid = dx === 180 || dx === 360
      ? [(b[0][0] + b[1][0]) / 2, (b[0][1] + b[1][1]) / 2]
      : d3Geo.geoCentroid(multiPoint);
  // First find the shared edge…
  if (parent) while (++j < n) {
    if (edges[j] === parent) break;
  }
  ++j;
  for (var i = 0; i < n; ++i) {
    edge = edges[(i + j) % n];
    if (Array.isArray(edge)) {
      if (!inside) {
        stream.point((point = d3Geo.geoInterpolate(edge[0], node.centroid)(epsilon))[0], point[1]);
        inside = true;
      }
      stream.point((point = d3Geo.geoInterpolate(edge[1], node.centroid)(epsilon))[0], point[1]);
    } else {
      inside = false;
      if (edge !== parent) outline(stream, edge, node);
    }
  }
}

// Tests equality of two spherical points.
function pointEqual$1(a, b) {
  return a && b && a[0] === b[0] && a[1] === b[1];
}

// Finds a shared edge given two clockwise polygons.
function sharedEdge(a, b) {
  var x, y, n = a.length, found = null;
  for (var i = 0; i < n; ++i) {
    x = a[i];
    for (var j = b.length; --j >= 0;) {
      y = b[j];
      if (x[0] === y[0] && x[1] === y[1]) {
        if (found) return [found, x];
        found = x;
      }
    }
  }
}

// Converts an array of n face vertices to an array of n + 1 edges.
function faceEdges(face) {
  var n = face.length,
      edges = [];
  for (var a = face[n - 1], i = 0; i < n; ++i) edges.push([a, a = face[i]]);
  return edges;
}

function hasInverse(node) {
  return node.project.invert || node.children && node.children.some(hasInverse);
}

// TODO generate on-the-fly to avoid external modification.
var octahedron = [
  [0, 90],
  [-90, 0], [0, 0], [90, 0], [180, 0],
  [0, -90]
];

var octahedron$1 = [
  [0, 2, 1],
  [0, 3, 2],
  [5, 1, 2],
  [5, 2, 3],
  [0, 1, 4],
  [0, 4, 3],
  [5, 4, 1],
  [5, 3, 4]
].map(function(face) {
  return face.map(function(i) {
    return octahedron[i];
  });
});

function butterfly(faceProjection) {

  faceProjection = faceProjection || function(face) {
    var c = d3Geo.geoCentroid({type: "MultiPoint", coordinates: face});
    return d3Geo.geoGnomonic().scale(1).translate([0, 0]).rotate([-c[0], -c[1]]);
  };

  var faces = octahedron$1.map(function(face) {
    return {face: face, project: faceProjection(face)};
  });

  [-1, 0, 0, 1, 0, 1, 4, 5].forEach(function(d, i) {
    var node = faces[d];
    node && (node.children || (node.children = [])).push(faces[i]);
  });

  return polyhedral(faces[0], function(lambda, phi) {
        return faces[lambda < -pi / 2 ? phi < 0 ? 6 : 4
            : lambda < 0 ? phi < 0 ? 2 : 0
            : lambda < pi / 2 ? phi < 0 ? 3 : 1
            : phi < 0 ? 7 : 5];
      })
    .angle(-30)
    .scale(101.858)
    .center([0, 45]);
}

// code duplicated from d3-geo-projection

function collignonRaw(lambda, phi) {
  var alpha = sqrt(1 - sin(phi));
  return [(2 / sqrtPi) * lambda * alpha, sqrtPi * (1 - alpha)];
}

collignonRaw.invert = function(x, y) {
  var lambda = (lambda = y / sqrtPi - 1) * lambda;
  return [lambda > 0 ? x * sqrt(pi / lambda) / 2 : 0, asin(1 - lambda)];
};

var kx = 2 / sqrt(3);

function collignonK(a, b) {
  var p = collignonRaw(a, b);
  return [p[0] * kx, p[1]];
}

collignonK.invert = function(x,y) {
  return collignonRaw.invert(x / kx, y);
};

function collignon(faceProjection) {

  faceProjection = faceProjection || function(face) {
    var c = d3Geo.geoCentroid({type: "MultiPoint", coordinates: face});
    return d3Geo.geoProjection(collignonK).translate([0, 0]).scale(1).rotate(c[1] > 0 ? [-c[0], 0] : [180 - c[0], 180]);
  };

  var faces = octahedron$1.map(function(face) {
    return {face: face, project: faceProjection(face)};
  });

  [-1, 0, 0, 1, 0, 1, 4, 5].forEach(function(d, i) {
    var node = faces[d];
    node && (node.children || (node.children = [])).push(faces[i]);
  });

  return polyhedral(faces[0], function(lambda, phi) {
        return faces[lambda < -pi / 2 ? phi < 0 ? 6 : 4
            : lambda < 0 ? phi < 0 ? 2 : 0
            : lambda < pi / 2 ? phi < 0 ? 3 : 1
            : phi < 0 ? 7 : 5];
      })
    .angle(-30)
    .scale(121.906)
    .center([0, 48.5904]);
}

function waterman(faceProjection) {

  faceProjection = faceProjection || function(face) {
    var c = face.length === 6 ? d3Geo.geoCentroid({type: "MultiPoint", coordinates: face}) : face[0];
    return d3Geo.geoGnomonic().scale(1).translate([0, 0]).rotate([-c[0], -c[1]]);
  };

  var w5 = octahedron$1.map(function(face) {
    var xyz = face.map(cartesian$1),
        n = xyz.length,
        a = xyz[n - 1],
        b,
        hexagon = [];
    for (var i = 0; i < n; ++i) {
      b = xyz[i];
      hexagon.push(spherical$1([
        a[0] * 0.9486832980505138 + b[0] * 0.31622776601683794,
        a[1] * 0.9486832980505138 + b[1] * 0.31622776601683794,
        a[2] * 0.9486832980505138 + b[2] * 0.31622776601683794
      ]), spherical$1([
        b[0] * 0.9486832980505138 + a[0] * 0.31622776601683794,
        b[1] * 0.9486832980505138 + a[1] * 0.31622776601683794,
        b[2] * 0.9486832980505138 + a[2] * 0.31622776601683794
      ]));
      a = b;
    }
    return hexagon;
  });

  var cornerNormals = [];

  var parents = [-1, 0, 0, 1, 0, 1, 4, 5];

  w5.forEach(function(hexagon, j) {
    var face = octahedron$1[j],
        n = face.length,
        normals = cornerNormals[j] = [];
    for (var i = 0; i < n; ++i) {
      w5.push([
        face[i],
        hexagon[(i * 2 + 2) % (2 * n)],
        hexagon[(i * 2 + 1) % (2 * n)]
      ]);
      parents.push(j);
      normals.push(cross(
        cartesian$1(hexagon[(i * 2 + 2) % (2 * n)]),
        cartesian$1(hexagon[(i * 2 + 1) % (2 * n)])
      ));
    }
  });

  var faces = w5.map(function(face) {
    return {
      project: faceProjection(face),
      face: face
    };
  });

  parents.forEach(function(d, i) {
    var parent = faces[d];
    parent && (parent.children || (parent.children = [])).push(faces[i]);
  });

  function face(lambda, phi) {
    var cosphi = cos(phi),
        p = [cosphi * cos(lambda), cosphi * sin(lambda), sin(phi)];

    var hexagon = lambda < -pi / 2 ? phi < 0 ? 6 : 4
        : lambda < 0 ? phi < 0 ? 2 : 0
        : lambda < pi / 2 ? phi < 0 ? 3 : 1
        : phi < 0 ? 7 : 5;

    var n = cornerNormals[hexagon];

    return faces[dot(n[0], p) < 0 ? 8 + 3 * hexagon
        : dot(n[1], p) < 0 ? 8 + 3 * hexagon + 1
        : dot(n[2], p) < 0 ? 8 + 3 * hexagon + 2
        : hexagon];
  }

  return polyhedral(faces[0], face)
    .angle(-30)
    .scale(110.625)
    .center([0, 45]);
}

function dot(a, b) {
  for (var i = 0, n = a.length, s = 0; i < n; ++i) s += a[i] * b[i];
  return s;
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

// Converts 3D Cartesian to spherical coordinates (degrees).
function spherical$1(cartesian) {
  return [
    atan2(cartesian[1], cartesian[0]) * degrees,
    asin(max(-1, min(1, cartesian[2]))) * degrees
  ];
}

// Converts spherical coordinates (degrees) to 3D Cartesian.
function cartesian$1(coordinates) {
  var lambda = coordinates[0] * radians,
      phi = coordinates[1] * radians,
      cosphi = cos(phi);
  return [
    cosphi * cos(lambda),
    cosphi * sin(lambda),
    sin(phi)
  ];
}

function voronoi(parents, polygons, faceProjection, find) {
  parents = parents || [];
  polygons = polygons || { features: [] };
  find = find || find0;

  // it is possible to pass a specific projection on each face
  // by default is is a gnomonic projection centered on the face's centroid
  // scale 1 by convention
  faceProjection =
    faceProjection ||
    function(face) {
      return d3Geo.geoGnomonic()
        .scale(1)
        .translate([0, 0])
        .rotate([-face.site[0], -face.site[1]]);
    };

  var faces = [];
  function build_tree() {
    // the faces from the polyhedron each yield
    // - face: its vertices
    // - site: its voronoi site (default: centroid)
    // - project: local projection on this face
    faces = polygons.features.map(function(feature, i) {
      var polygon = feature.geometry.coordinates[0];
      var face = polygon.slice(0, -1);
      face.site =
        feature.properties && feature.properties.sitecoordinates
          ? feature.properties.sitecoordinates
          : d3Geo.geoCentroid(feature.geometry);
      return {
        face: face,
        site: face.site,
        id: i,
        project: faceProjection(face)
      };
    });

    // Build a tree of the faces, starting with face 0 (North Pole)
    // which has no parent (-1)
    parents.forEach(function(d, i) {
      var node = faces[d];
      node && (node.children || (node.children = [])).push(faces[i]);
    });
  }

  // a basic function to find the polygon that contains the point
  function find0(lambda, phi) {
    var d0 = Infinity;
    var found = -1;
    for (var i = 0; i < faces.length; i++) {
      var d = d3Geo.geoDistance(faces[i].site, [lambda, phi]);
      if (d < d0) {
        d0 = d;
        found = i;
      }
    }
    return found;
  }
  
  function faceFind(lambda, phi) {
    return faces[find(lambda * degrees, phi * degrees)];
  }

  var p = d3Geo.geoGnomonic();

  function reset() {
    var rotate = p.rotate(),
      translate = p.translate(),
      center = p.center(),
      scale = p.scale(),
      angle = p.angle();

    if (faces.length) {
      p = polyhedral(faces[0], faceFind);
    }

    p.parents = function(_) {
      if (!arguments.length) return parents;
      parents = _;
      build_tree();
      return reset();
    };

    p.polygons = function(_) {
      if (!arguments.length) return polygons;
      polygons = _;
      build_tree();
      return reset();
    };

    p.faceProjection = function(_) {
      if (!arguments.length) return faceProjection;
      faceProjection = _;
      build_tree();
      return reset();
    };

    p.faceFind = function(_) {
      if (!arguments.length) return find;
      find = _;
      return reset();
    };

    return p
      .rotate(rotate)
      .translate(translate)
      .center(center)
      .scale(scale)
      .angle(angle);
  }

  build_tree();
  return reset();
}

function dodecahedral() {
  var A0 = asin(1/sqrt(3)) * degrees,
        A1 = acos((sqrt(5) - 1) / sqrt(3) / 2) * degrees,
        A2 = 90 - A1,
        A3 = acos(-(1 + sqrt(5)) / sqrt(3) / 2) * degrees;

  var dodecahedron = [
  [[45,A0],[0,A1],[180,A1],[135,A0],[90,A2]],
  [[45,A0],[A2,0],[-A2,0],[-45,A0],[0,A1]],
  [[45,A0],[90,A2],[90,-A2],[45,-A0],[A2,0]],
  [[0,A1],[-45,A0],[-90,A2],[-135,A0],[180,A1]],
  [[A2,0],[45,-A0],[0,-A1],[-45,-A0],[-A2,0]],
  [[90,A2],[135,A0],[A3,0],[135,-A0],[90,-A2]],
  [[45,-A0],[90,-A2],[135,-A0],[180,-A1],[0,-A1]],
  [[135,A0],[180,A1],[-135,A0],[-A3,0],[A3,0]],
  [[-45,A0],[-A2,0],[-45,-A0],[-90,-A2],[-90,A2]],
  [[-45,-A0],[0,-A1],[180,-A1],[-135,-A0],[-90,-A2]],
  [[135,-A0],[A3,0],[-A3,0],[-135,-A0],[180,-A1]],
  [[-135,A0],[-90,A2],[-90,-A2],[-135,-A0],[-A3,0]]
  ];


  var polygons = {
    type: "FeatureCollection",
    features: dodecahedron.map(function(face) {
      face.push(face[0]);
      return {
        geometry: {
          type: "Polygon",
          coordinates: [ face ]
        }
      };
    })
  };

  return voronoi()
   .parents([-1,0,4,8,1,2,2,3,1,8,6,3])
   .angle(72 * 1.5)
   .polygons(polygons)
   .scale(99.8)
   .rotate([-8,0,-32]);
}

// code duplicated from d3-geo-projection

function lagrangeRaw(n) {

  function forward(lambda, phi) {
    if (abs(abs(phi) - halfPi) < epsilon) return [0, phi < 0 ? -2 : 2];
    var sinPhi = sin(phi),
        v = pow((1 + sinPhi) / (1 - sinPhi), n / 2),
        c = 0.5 * (v + 1 / v) + cos(lambda *= n);
    return [
      2 * sin(lambda) / c,
      (v - 1 / v) / c
    ];
  }

  forward.invert = function(x, y) {
    var y0 = abs(y);
    if (abs(y0 - 2) < epsilon) return x ? null : [0, sign(y) * halfPi];
    if (y0 > 2) return null;

    x /= 2, y /= 2;
    var x2 = x * x,
        y2 = y * y,
        t = 2 * y / (1 + x2 + y2); // tanh(nPhi)
    t = pow((1 + t) / (1 - t), 1 / n);
    return [
      atan2(2 * x, 1 - x2 - y2) / n,
      asin((t - 1) / (t + 1))
    ];
  };

  return forward;
}

function complexMul(a, b) {
  return [a[0] * b[0] - a[1] * b[1], a[1] * b[0] + a[0] * b[1]];
}

function complexAdd(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

function complexSub(a, b) {
  return [a[0] - b[0], a[1] - b[1]];
}

function complexNorm2(a) {
  return a[0] * a[0] + a[1] * a[1];
}

function complexNorm(a) {
  return sqrt(complexNorm2(a));
}

function complexLogHypot(a, b) {
  var _a = abs(a),
    _b = abs(b);
  if (a === 0) return log(_b);
  if (b === 0) return log(_a);
  if (_a < 3000 && _b < 3000) return log(a * a + b * b) * 0.5;
  return log(a / cos(atan2(b, a)));
}

// adapted from https://github.com/infusion/Complex.js
function complexPow(a, n) {
  var b = a[1],
    arg,
    loh;
  a = a[0];
  if (a === 0 && b === 0) return [0, 0];

  if (typeof n === "number") n = [n, 0];

  if (!n[1]) {
    if (b === 0 && a >= 0) {
      return [pow(a, n[0]), 0];
    } else if (a === 0) {
      switch ((n[1] % 4 + 4) % 4) {
        case 0:
          return [pow(b, n[0]), 0];
        case 1:
          return [0, pow(b, n[0])];
        case 2:
          return [-pow(b, n[0]), 0];
        case 3:
          return [0, -pow(b, n[0])];
      }
    }
  }

  arg = atan2(b, a);
  loh = complexLogHypot(a, b);
  a = exp(n[0] * loh - n[1] * arg);
  b = n[1] * loh + n[0] * arg;
  return [a * cos(b), a * sin(b)];
}

// w1 = gamma(1/n) * gamma(1 - 2/n) / n / gamma(1 - 1/n)
// https://bl.ocks.org/Fil/852557838117687bbd985e4b38ff77d4
var w = [-1 / 2, sqrt(3) / 2],
  w1 = [1.7666387502854533, 0],
  m = 0.3 * 0.3;

// Approximate \int _0 ^sm(z)  dt / (1 - t^3)^(2/3)
// sm maps a triangle to a disc, sm^-1 does the opposite
function sm_1(z) {
  var k = [0, 0];

  // rotate to have s ~= 1
  var rot = complexPow(
    w,
    d3Array.scan(
      [0, 1, 2].map(function(i) {
        return -complexMul(z, complexPow(w, [i, 0]))[0];
      })
    )
  );

  var y = complexMul(rot, z);
  y = [1 - y[0], -y[1]];

  // McIlroy formula 5 p6 and table for F3 page 16
  var F0 = [
    1.44224957030741,
    0.240374928384568,
    0.0686785509670194,
    0.0178055502507087,
    0.00228276285265497,
    -1.48379585422573e-3,
    -1.64287728109203e-3,
    -1.02583417082273e-3,
    -4.83607537673571e-4,
    -1.67030822094781e-4,
    -2.45024395166263e-5,
    2.14092375450951e-5,
    2.55897270486771e-5,
    1.73086854400834e-5,
    8.72756299984649e-6,
    3.18304486798473e-6,
    4.79323894565283e-7,
    -4.58968389565456e-7,
    -5.62970586787826e-7,
    -3.92135372833465e-7
  ];

  var F = [0, 0];
  for (var i = F0.length; i--; ) F = complexAdd([F0[i], 0], complexMul(F, y));

  k = complexMul(
    complexAdd(w1, complexMul([-F[0], -F[1]], complexPow(y, 1 - 2 / 3))),
    complexMul(rot, rot)
  );

  // when we are close to [0,0] we switch to another approximation:
  // https://www.wolframalpha.com/input/?i=(-2%2F3+choose+k)++*+(-1)%5Ek++%2F+(k%2B1)+with+k%3D0,1,2,3,4
  // the difference is _very_ tiny but necessary
  // if we want projection(0,0) === [0,0]
  var n = complexNorm2(z);
  if (n < m) {
    var H0 = [
      1,
      1 / 3,
      5 / 27,
      10 / 81,
      22 / 243 //…
    ];
    var z3 = complexPow(z, [3, 0]);
    var h = [0, 0];
    for (i = H0.length; i--; ) h = complexAdd([H0[i], 0], complexMul(h, z3));
    h = complexMul(h, z);
    k = complexAdd(complexMul(k, [n / m, 0]), complexMul(h, [1 - n / m, 0]));
  }

  return k;
}

var lagrange1_2 = lagrangeRaw ? lagrangeRaw(0.5) : null;
function coxRaw(lambda, phi) {
  var s = lagrange1_2(lambda, phi);
  var t = sm_1([s[1] / 2, s[0] / 2]);
  return [t[1], t[0]];
}

// the Sphere should go *exactly* to the vertices of the triangles
// because they are singular points
function sphere() {
  var c = 2 * asin(1 / sqrt(5)) * degrees;
  return {
    type: "Polygon",
    coordinates: [
      [[0, 90], [-180, -c + epsilon], [0, -90], [180, -c + epsilon], [0, 90]]
    ]
  };
}

function cox() {
  var p = d3Geo.geoProjection(coxRaw);

  var stream_ = p.stream;
  p.stream = function(stream) {
    var rotate = p.rotate(),
      rotateStream = stream_(stream),
      sphereStream = (p.rotate([0, 0]), stream_(stream));
    p.rotate(rotate);
    rotateStream.sphere = function() {
      d3Geo.geoStream(sphere(), sphereStream);
    };
    return rotateStream;
  };

  return p
    .scale(188.305)
    .translate([480, 333.167]);
}

function leeRaw(lambda, phi) {
  // return d3.geoGnomonicRaw(...arguments);
  var w = [-1 / 2, sqrt(3) / 2],
    k = [0, 0],
    h = [0, 0],
    i,
    z = complexMul(d3Geo.geoStereographicRaw(lambda, phi), [sqrt(2), 0]);

  // rotate to have s ~= 1
  var sector = d3Array.scan(
    [0, 1, 2].map(function(i) {
      return -complexMul(z, complexPow(w, [i, 0]))[0];
    })
  );
  var rot = complexPow(w, [sector, 0]);

  var n = complexNorm(z);

  if (n > 0.3) {
    // if |z| > 0.5, use the approx based on y = (1-z)
    // McIlroy formula 6 p6 and table for G page 16
    var y = complexSub([1, 0], complexMul(rot, z));

    // w1 = gamma(1/3) * gamma(1/2) / 3 / gamma(5/6);
    // https://bl.ocks.org/Fil/1aeff1cfda7188e9fbf037d8e466c95c
    var w1 = 1.4021821053254548;

    var G0 = [
      1.15470053837925,
      0.192450089729875,
      0.0481125224324687,
      0.010309826235529,
      3.34114739114366e-4,
      -1.50351632601465e-3,
      -1.2304417796231e-3,
      -6.75190201960282e-4,
      -2.84084537293856e-4,
      -8.21205120500051e-5,
      -1.59257630018706e-6,
      1.91691805888369e-5,
      1.73095888028726e-5,
      1.03865580818367e-5,
      4.70614523937179e-6,
      1.4413500104181e-6,
      1.92757960170179e-8,
      -3.82869799649063e-7,
      -3.57526015225576e-7,
      -2.2175964844211e-7
    ];

    var G = [0, 0];
    for (i = G0.length; i--; ) {
      G = complexAdd([G0[i], 0], complexMul(G, y));
    }

    k = complexSub([w1, 0], complexMul(complexPow(y, 1 / 2), G));
    k = complexMul(k, rot);
    k = complexMul(k, rot);
  }

  if (n < 0.5) {
    // if |z| < 0.3
    // https://www.wolframalpha.com/input/?i=series+of+((1-z%5E3))+%5E+(-1%2F2)+at+z%3D0 (and ask for "more terms")
    // 1 + z^3/2 + (3 z^6)/8 + (5 z^9)/16 + (35 z^12)/128 + (63 z^15)/256 + (231 z^18)/1024 + O(z^21)
    // https://www.wolframalpha.com/input/?i=integral+of+1+%2B+z%5E3%2F2+%2B+(3+z%5E6)%2F8+%2B+(5+z%5E9)%2F16+%2B+(35+z%5E12)%2F128+%2B+(63+z%5E15)%2F256+%2B+(231+z%5E18)%2F1024
    // (231 z^19)/19456 + (63 z^16)/4096 + (35 z^13)/1664 + z^10/32 + (3 z^7)/56 + z^4/8 + z + constant
    var H0 = [1, 1 / 8, 3 / 56, 1 / 32, 35 / 1664, 63 / 4096, 231 / 19456];
    var z3 = complexPow(z, [3, 0]);
    for (i = H0.length; i--; ) {
      h = complexAdd([H0[i], 0], complexMul(h, z3));
    }
    h = complexMul(h, z);
  }

  if (n < 0.3) return h;
  if (n > 0.5) return k;

  // in between 0.3 and 0.5, interpolate
  var t = (n - 0.3) / (0.5 - 0.3);
  return complexAdd(complexMul(k, [t, 0]), complexMul(h, [1 - t, 0]));
}

var asin1_3 = asin(1 / 3);
var centers = [
  [0, 90],
  [-180, -asin1_3 * degrees],
  [-60, -asin1_3 * degrees],
  [60, -asin1_3 * degrees]
];
var tetrahedron = [[1, 2, 3], [0, 2, 1], [0, 3, 2], [0, 1, 3]].map(function(
  face
) {
  return face.map(function(i) {
    return centers[i];
  });
});

function tetrahedralLee() {
  var faceProjection = function(face) {
    var c = d3Geo.geoCentroid({ type: "MultiPoint", coordinates: face }),
      rotate = [-c[0], -c[1], 30];
    if (abs(c[1]) == 90) {
      rotate = [0, -c[1], -30];
    }
    return d3Geo.geoProjection(leeRaw)
      .scale(1)
      .translate([0, 0])
      .rotate(rotate);
  };

  var faces = tetrahedron.map(function(face) {
    return { face: face, project: faceProjection(face) };
  });

  [-1, 0, 0, 0].forEach(function(d, i) {
    var node = faces[d];
    node && (node.children || (node.children = [])).push(faces[i]);
  });

  var p = polyhedral(
    faces[0],
    function(lambda, phi) {
      lambda *= degrees;
      phi *= degrees;
      for (var i = 0; i < faces.length; i++) {
        if (
          d3Geo.geoContains(
            {
              type: "Polygon",
              coordinates: [
                [
                  tetrahedron[i][0],
                  tetrahedron[i][1],
                  tetrahedron[i][2],
                  tetrahedron[i][0]
                ]
              ]
            },
            [lambda, phi]
          )
        ) {
          return faces[i];
        }
      }
    }
  );

  return p
    .rotate([30, 180]) // North Pole aspect, needs clipPolygon
    // .rotate([-30, 0]) // South Pole aspect
    .angle(30)
    .scale(118.662)
    .translate([480, 195.47]);
}

/*
 * Buckminster Fuller’s spherical triangle transformation procedure
 *
 * Based on Robert W. Gray’s formulae published in “Exact Transformation Equations
 * For Fuller's World Map,” _Cartographica_, 32(3): 17-25 (1995).
 *
 * Implemented for D3.js by Philippe Rivière, 2018 (https://visionscarto.net/)
 *
 * To the extent possible under law, Philippe Rivière has waived all copyright
 * and related or neighboring rights to this implementation. (Public Domain.)
 */

function GrayFullerRaw() {
  var SQRT_3 = sqrt(3);

  // Gray’s constants
  var Z = sqrt(5 + 2 * sqrt(5)) / sqrt(15),
    el = sqrt(8) / sqrt(5 + sqrt(5)),
    dve = sqrt(3 + sqrt(5)) / sqrt(5 + sqrt(5));

  var grayfuller = function(lambda, phi) {
    var cosPhi = cos(phi),
      s = Z / (cosPhi * cos(lambda)),
      x = cosPhi * sin(lambda) * s,
      y = sin(phi) * s,
      a1p = atan2(2 * y / SQRT_3 + el / 3 - el / 2, dve),
      a2p = atan2(x - y / SQRT_3 + el / 3 - el / 2, dve),
      a3p = atan2(el / 3 - x - y / SQRT_3 - el / 2, dve);

    return [SQRT_3 * (a2p - a3p), 2 * a1p - a2p - a3p];
  };

  // Inverse approximation
  grayfuller.invert = function(x, y) {
    // if the point is out of the triangle, return
    // something meaningless (but far away enough)
    if (x * x + y * y > 5) return [0, 3];

    var R = 2.9309936378128416,
      p = d3Geo.geoGnomonicRaw.invert(x / R, y / R);

    var j = 0;
    do {
      var f = grayfuller(p[0], p[1]),
        dx = x - f[0],
        dy = y - f[1];
      p[0] += 0.2 * dx;
      p[1] += 0.2 * dy;
    } while (j++ < 30 && abs(dx) + abs(dy) > epsilon);

    return p;
  };

  return grayfuller;
}

/*
 * Buckminster Fuller’s AirOcean arrangement of the icosahedron
 *
 * Implemented for D3.js by Jason Davies (2013),
 * Enrico Spinielli (2017) and Philippe Rivière (2017, 2018)
 *
 */

function airoceanRaw(faceProjection) {
  var theta = atan(0.5) * degrees;

  // construction inspired by
  // https://en.wikipedia.org/wiki/Regular_icosahedron#Spherical_coordinates
  var vertices = [[0, 90], [0, -90]].concat(
    d3Array.range(10).map(function(i) {
      var phi = (i * 36 + 180) % 360 - 180;
      return [phi, i & 1 ? theta : -theta];
    })
  );

  // icosahedron
  var polyhedron = [
    [0, 3, 11],
    [0, 5, 3],
    [0, 7, 5],
    [0, 9, 7],
    [0, 11, 9], // North
    [2, 11, 3],
    [3, 4, 2],
    [4, 3, 5],
    [5, 6, 4],
    [6, 5, 7],
    [7, 8, 6],
    [8, 7, 9],
    [9, 10, 8],
    [10, 9, 11],
    [11, 2, 10], // Equator
    [1, 2, 4],
    [1, 4, 6],
    [1, 6, 8],
    [1, 8, 10],
    [1, 10, 2] // South
  ].map(function(face) {
    return face.map(function(i) {
      return vertices[i];
    });
  });

  // add centroid
  polyhedron.forEach(function(face) {
    face.centroid = d3Geo.geoCentroid({ type: "MultiPoint", coordinates: face });
  });

  // split the relevant faces:
  // * face[15] in the centroid: this will become face[15], face[20] and face[21]
  // * face[14] in the middle of the side: this will become face[14] and face[22]
  (function() {
    var face, tmp, mid, centroid;

    // Split face[15] in 3 faces at centroid.
    face = polyhedron[15];
    centroid = face.centroid;
    tmp = face.slice();
    face[0] = centroid; // (new) face[15]

    face = [tmp[0], centroid, tmp[2]];
    face.centroid = centroid;
    polyhedron.push(face); // face[20]

    face = [tmp[0], tmp[1], centroid];
    face.centroid = centroid;
    polyhedron.push(face); // face[21]

    // Split face 14 at the edge.
    face = polyhedron[14];
    centroid = face.centroid;
    tmp = face.slice();

    // compute planar midpoint
    var proj = d3Geo.geoGnomonic()
      .scale(1)
      .translate([0, 0])
      .rotate([-centroid[0], -centroid[1]]);
    var a = proj(face[1]),
      b = proj(face[2]);
    mid = proj.invert([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
    face[1] = mid; // (new) face[14]

    // build the new half face
    face = [tmp[0], tmp[1], mid];
    face.centroid = centroid; // use original face[14] centroid
    polyhedron.push(face); // face[22]

    // cut face 19 to connect to 22
    face = polyhedron[19];
    centroid = face.centroid;
    tmp = face.slice();
    face[1] = mid;

    // build the new half face
    face = [mid, tmp[0], tmp[1]];
    face.centroid = centroid;
    polyhedron.push(face); // face[23]
  })();

  var airocean = function(faceProjection) {
    faceProjection =
      faceProjection ||
      function(face) {
        // for half-triangles this is definitely not centroid({type: "MultiPoint", coordinates: face});
        var c = face.centroid;
        return d3Geo.geoGnomonic()
          .scale(1)
          .translate([0, 0])
          .rotate([-c[0], -c[1]]);
      };

    var faces = polyhedron.map(function(face, i) {
      var polygon = face.slice();
      polygon.push(polygon[0]);

      return {
        face: face,
        site: face.centroid,
        id: i,
        contains: function(lambda, phi) {
          return d3Geo.geoContains({ type: "Polygon", coordinates: [polygon] }, [
            lambda * degrees,
            phi * degrees
          ]);
        },
        project: faceProjection(face)
      };
    });

    // Connect each face to a parent face.
    var parents = [
      // N
      -1, // 0
      0, // 1
      1, // 2
      11, // 3
      13, // 4

      // Eq
      6, // 5
      7, // 6
      1, // 7
      7, // 8
      8, // 9

      9, // 10
      10, // 11
      11, // 12
      12, // 13
      13, // 14

      // S
      6, // 15
      8, // 16
      10, // 17
      17, // 18
      21, // 19
      16, // 20
      15, // 21
      19, // 22
      19 // 23
    ];

    parents.forEach(function(d, i) {
      var node = faces[d];
      node && (node.children || (node.children = [])).push(faces[i]);
    });

    function face(lambda, phi) {
      for (var i = 0; i < faces.length; i++) {
        if (faces[i].contains(lambda, phi)) return faces[i];
      }
    }

    // Polyhedral projection
    var proj = polyhedral(
      faces[0], // the root face
      face // a function that returns a face given coords
    );

    proj.faces = faces;
    return proj;
  };

  return airocean(faceProjection);
}

function airocean () {
  var p = airoceanRaw(function(face) {
    var c = face.centroid;

    face.direction =
      Math.abs(c[1] - 52.62) < 1 || Math.abs(c[1] + 10.81) < 1 ? 0 : 60;
    return d3Geo.geoProjection(GrayFullerRaw())
      .scale(1)
      .translate([0, 0])
      .rotate([-c[0], -c[1], face.direction || 0]);
  });

  return p
    .rotate([-83.65929, 25.44458, -87.45184])
    .angle(-60)
    .scale(45.4631)
    .center([126, 0]);
}

/*
 * Icosahedral map
 *
 * Implemented for D3.js by Jason Davies (2013),
 * Enrico Spinielli (2017) and Philippe Rivière (2017, 2018)
 *
 */


function icosahedral() {
  var theta = atan(0.5) * degrees;

  // construction inspired by
  // https://en.wikipedia.org/wiki/Regular_icosahedron#Spherical_coordinates
  var vertices = [[0, 90], [0, -90]].concat(
    [0,1,2,3,4,5,6,7,8,9].map(function(i) {
      var phi = (i * 36 + 180) % 360 - 180;
      return [phi, i & 1 ? theta : -theta];
    })
  );

  // icosahedron
  var polyhedron = [
    [0, 3, 11],
    [0, 5, 3],
    [0, 7, 5],
    [0, 9, 7],
    [0, 11, 9], // North
    [2, 11, 3],
    [3, 4, 2],
    [4, 3, 5],
    [5, 6, 4],
    [6, 5, 7],
    [7, 8, 6],
    [8, 7, 9],
    [9, 10, 8],
    [10, 9, 11],
    [11, 2, 10], // Equator
    [1, 2, 4],
    [1, 4, 6],
    [1, 6, 8],
    [1, 8, 10],
    [1, 10, 2] // South
  ].map(function(face) {
    return face.map(function(i) {
      return vertices[i];
    });
  });

  var polygons = {
    type: "FeatureCollection",
    features: polyhedron.map(function(face) {
      face.push(face[0]);
      return {
        geometry: {
          type: "Polygon",
          coordinates: [ face ]
        }
      };
    })
  };

var parents = [
      // N
      -1, // 0
      7, // 1
      9, // 2
      11, // 3
      13, // 4

      // Eq
      0, // 5
      5, // 6
      6, // 7
      7, // 8
      8, // 9

      9, // 10
      10, // 11
      11, // 12
      12, // 13
      13, // 14

      // S
      6, // 15
      8, // 16
      10, // 17
      12, // 18
      14, // 19
    ];

  return voronoi()
   .parents(parents)
   .angle(0)
   .polygons(polygons)
   .rotate([108,0])
   .scale(131.777)
    .center([162, 0]);
    }


/*
    // Jarke J. van Wijk, "Unfolding the Earth: Myriahedral Projections",
    // The Cartographic Journal Vol. 45 No. 1 pp. 32–42 February 2008, fig. 8
    // https://bl.ocks.org/espinielli/475f5fde42a5513ab7eba3f53033ea9e
    d3.geoIcosahedral().parents([-1,0,1,11,3,0,7,1,7,8,9,10,11,12,13,6,8,10,19,15])
   .angle(-60)
   .rotate([-83.65929, 25.44458, -87.45184])
*/

// Newton-Raphson
// Solve f(x) = y, start from x
function solve(f, y, x) {
  var steps = 100, delta, f0, f1;
  x = x === undefined ? 0 : +x;
  y = +y;
  do {
    f0 = f(x);
    f1 = f(x + epsilon);
    if (f0 === f1) f1 = f0 + epsilon;
    x -= delta = (-1 * epsilon * (f0 - y)) / (f0 - f1);
  } while (steps-- > 0 && abs(delta) > epsilon);
  return steps < 0 ? NaN : x;
}

/*
 * Imago projection, by Justin Kunimune
 *
 * Inspired by Hajime Narukawa’s AuthaGraph
 *
 */

var hypot = Math.hypot;

var ASIN_ONE_THD = asin(1 / 3),
  centrums = [
    [halfPi, 0, 0, -halfPi, 0, sqrt(3)],
    [-ASIN_ONE_THD, 0, pi, halfPi, 0, -sqrt(3)],
    [-ASIN_ONE_THD, (2 * pi) / 3, pi, (5 * pi) / 6, 3, 0],
    [-ASIN_ONE_THD, (-2 * pi) / 3, pi, pi / 6, -3, 0]
  ],
  TETRAHEDRON_WIDE_VERTEX = {
    sphereSym: 3,
    planarSym: 6,
    width: 6,
    height: 2 * sqrt(3),
    centrums,
    rotateOOB: function(x, y, xCen, yCen) {
      if (abs(x) > this.width / 2) return [2 * xCen - x, -y];
      else return [-x, this.height * sign(y) - y];
    },
    inBounds: () => true
  },
  configuration = TETRAHEDRON_WIDE_VERTEX;

function imagoRaw(k) {
  function faceProject(lon, lat) {
    const tht = atan(((lon - asin(sin(lon) / sqrt(3))) / pi) * sqrt(12)),
      p = (halfPi - lat) / atan(sqrt(2) / cos(lon));

    return [(pow(p, k) * sqrt(3)) / cos(tht), tht];
  }

  function faceInverse(r, th) {
    const l = solve(
        l => atan(((l - asin(sin(l) / sqrt(3))) / pi) * sqrt(12)),
        th,
        th / 2
      ),
      R = r / (sqrt(3) / cos(th));
    return [halfPi - pow(R, 1 / k) * atan(sqrt(2) / cos(l)), l];
  }

  function obliquifySphc(latF, lonF, pole) {
    if (pole == null)
      // null pole indicates that this procedure should be bypassed
      return [latF, lonF];

    const lat0 = pole[0],
      lon0 = pole[1],
      tht0 = pole[2];

    let lat1, lon1;
    if (lat0 == halfPi) lat1 = latF;
    else
      lat1 = asin(
        sin(lat0) * sin(latF) + cos(lat0) * cos(latF) * cos(lon0 - lonF)
      ); // relative latitude

    if (lat0 == halfPi)
      // accounts for all the 0/0 errors at the poles
      lon1 = lonF - lon0;
    else if (lat0 == -halfPi) lon1 = lon0 - lonF - pi;
    else {
      lon1 =
        acos(
          (cos(lat0) * sin(latF) - sin(lat0) * cos(latF) * cos(lon0 - lonF)) /
            cos(lat1)
        ) - pi; // relative longitude
      if (isNaN(lon1)) {
        if (
          (cos(lon0 - lonF) >= 0 && latF < lat0) ||
          (cos(lon0 - lonF) < 0 && latF < -lat0)
        )
          lon1 = 0;
        else lon1 = -pi;
      } else if (sin(lonF - lon0) > 0)
        // it's a plus-or-minus arccos.
        lon1 = -lon1;
    }
    lon1 = lon1 - tht0;

    return [lat1, lon1];
  }

  function obliquifyPlnr(coords, pole) {
    if (pole == null)
      //this indicates that you just shouldn't do this calculation
      return coords;

    let lat1 = coords[0],
      lon1 = coords[1];
    const lat0 = pole[0],
      lon0 = pole[1],
      tht0 = pole[2];

    lon1 += tht0;
    let latf = asin(sin(lat0) * sin(lat1) - cos(lat0) * cos(lon1) * cos(lat1)),
      lonf,
      innerFunc = sin(lat1) / cos(lat0) / cos(latf) - tan(lat0) * tan(latf);
    if (lat0 == halfPi)
      // accounts for special case when lat0 = pi/2
      lonf = lon1 + lon0;
    else if (lat0 == -halfPi)
      // accounts for special case when lat0 = -pi/2
      lonf = -lon1 + lon0 + pi;
    else if (abs(innerFunc) > 1) {
      // accounts for special case when cos(lat1) -> 0
      if ((lon1 == 0 && lat1 < -lat0) || (lon1 != 0 && lat1 < lat0))
        lonf = lon0 + pi;
      else lonf = lon0;
    } else if (sin(lon1) > 0) lonf = lon0 + acos(innerFunc);
    else lonf = lon0 - acos(innerFunc);

    let thtf = pole[2];

    return [latf, lonf, thtf];
  }

  function forward(lon, lat) {
    const width = configuration.width,
      height = configuration.height;
    const numSym = configuration.sphereSym; //we're about to be using this variable a lot
    let latR = -Infinity;
    let lonR = -Infinity;
    let centrum = null;
    for (const testCentrum of centrums) {
      //iterate through the centrums to see which goes here
      const relCoords = obliquifySphc(lat, lon, testCentrum);
      if (relCoords[0] > latR) {
        latR = relCoords[0];
        lonR = relCoords[1];
        centrum = testCentrum;
      }
    }

    const lonR0 =
      floor((lonR + pi / numSym) / ((2 * pi) / numSym)) * ((2 * pi) / numSym);

    const rth = faceProject(lonR - lonR0, latR);
    const r = rth[0];
    const th = rth[1] + centrum[3] + (lonR0 * numSym) / configuration.planarSym;
    const x0 = centrum[4];
    const y0 = centrum[5];

    let output = [r * cos(th) + x0, r * sin(th) + y0];
    if (abs(output[0]) > width / 2 || abs(output[1]) > height / 2) {
      output = configuration.rotateOOB(output[0], output[1], x0, y0);
    }
    return output;
  }

  function invert(x, y) {
    if (isNaN(x) || isNaN(y)) return null;

    const numSym = configuration.planarSym;

    let rM = +Infinity;
    let centrum = null; //iterate to see which centrum we get
    for (const testCentrum of centrums) {
      const rR = hypot(x - testCentrum[4], y - testCentrum[5]);
      if (rR < rM) {
        //pick the centrum that minimises r
        rM = rR;
        centrum = testCentrum;
      }
    }
    const th0 = centrum[3],
      x0 = centrum[4],
      y0 = centrum[5],
      r = hypot(x - x0, y - y0),
      th = atan2(y - y0, x - x0) - th0,
      thBase =
        floor((th + pi / numSym) / ((2 * pi) / numSym)) * ((2 * pi) / numSym);

    let relCoords = faceInverse(r, th - thBase);

    if (relCoords == null) return null;

    relCoords[1] = (thBase * numSym) / configuration.sphereSym + relCoords[1];
    let absCoords = obliquifyPlnr(relCoords, centrum);
    return [absCoords[1], absCoords[0]];
  }

  forward.invert = invert;

  return forward;
}

function imagoBlock() {
  var k = 0.68,
    m = d3Geo.geoProjectionMutator(imagoRaw),
    p = m(k);

  p.k = function(_) {
    return arguments.length ? m((k = +_)) : k;
  };

  var a = -atan(1 / sqrt(2)) * degrees,
    border = [
      [-180 + epsilon, a + epsilon],
      [0, 90],
      [180 - epsilon, a + epsilon],
      [180 - epsilon, a - epsilon],
      [-180 + epsilon, a - epsilon],
      [-180 + epsilon, a + epsilon]
    ];

  return p
    .preclip(clipPolygon({
      type: "Polygon",
      coordinates: [border]
      }))
    .scale(144.04)
    .rotate([18, -12.5, 3.5])
    .center([0, 35.2644]);
}

function imagoWideRaw(k, shift) {
  var imago = imagoRaw(k);
  const height = configuration.height;

  function forward(lon, lat) {
    const p = imago(lon, lat),
      q = [p[1], -p[0]];

    if (q[1] > 0) {
      q[0] = height - q[0];
      q[1] *= -1;
    }

    q[0] += shift;
    if (q[0] < 0) q[0] += height * 2;

    return q;
  }

  function invert(x, y) {
    x = (x - shift) / height;

    if (x > 1.5) {
      x -= 2;
    }

    if (x > 0.5) {
      x = 1 - x;
      y *= -1;
    }

    return imago.invert(-y, x * height);
  }

  forward.invert = invert;
  return forward;
}

function imago() {
  var k = 0.59,
    shift = 1.16,
    m = d3Geo.geoProjectionMutator(imagoWideRaw),
    p = m(k, shift);

  p.shift = function(_) {
    return arguments.length ? clipped(m(k, (shift = +_))) : shift;
  };
  p.k = function(_) {
    return arguments.length ? clipped(m((k = +_), shift)) : k;
  };

  function clipped(p) {
    const N = 100 + 2 * epsilon,
      border = [],
      e = 3e-3;

    const scale = p.scale(),
      center = p.center(),
      translate = p.translate(),
      rotate = p.rotate();
    p.scale(1)
      .center([0, 90])
      .rotate([0, 0])
      .translate([shift, 0]);
    for (let i = N - epsilon; i > 0; i--) {
      border.unshift(
        p.invert([
          1.5 * configuration.height - e,
          ((configuration.width / 2) * i) / N
        ])
      );
      border.push(
        p.invert([
          -0.5 * configuration.height + e,
          ((configuration.width / 2) * i) / N
        ])
      );
    }
    border.push(border[0]);

    return p
      .scale(scale)
      .center(center)
      .translate(translate)
      .rotate(rotate)
      .preclip(
        clipPolygon({
          type: "Polygon",
          coordinates: [border]
        })
      );
  }

  return clipped(p)
    .rotate([18, -12.5, 3.5])
    .scale(138.42)
    .translate([480, 250])
    .center([-139.405, 40.5844]);
}

var phi1 = atan(sqrt1_2) * degrees;

var cube = [
  [0, phi1], [90, phi1], [180, phi1], [-90, phi1],
  [0, -phi1], [90, -phi1], [180, -phi1], [-90, -phi1]
];

var cube$1 = [
  [0, 3, 2, 1], // N
  [0, 1, 5, 4],
  [1, 2, 6, 5],
  [2, 3, 7, 6],
  [3, 0, 4, 7],
  [4, 5, 6, 7] // S
].map(function(face) {
  return face.map(function(i) {
    return cube[i];
  });
});

/*
 * Cubic map
 *
 * Implemented for D3.js by Enrico Spinielli (2017) and Philippe Rivière (2017, 2018)
 *
 */

function cubic() {
  var polygons = {
    type: "FeatureCollection",
    features: cube$1.map(function(face) {
      face = face.slice();
      face.push(face[0]);
      return {
        geometry: {
          type: "Polygon",
          coordinates: [face]
        }
      };
    })
  };

  var parents = [-1, 0, 1, 5, 3, 2];

  return voronoi()
    .polygons(polygons)
    .parents(parents)
    .angle(0)
    .scale(96.8737)
    .center([135, -45])
    .rotate([120,0]);
}

/*
 * Cahill-Keyes projection
 *
 * Implemented in Perl by Mary Jo Graça (2011)
 *
 * Ported to D3.js by Enrico Spinielli (2013)
 *
 */

function cahillKeyes(faceProjection) {
  faceProjection =
    faceProjection ||
    function() {
      return cahillKeyesProjection().scale(1);
    };

  var octahedron = [[0, 90], [-90, 0], [0, 0], [90, 0], [180, 0], [0, -90]];

  octahedron = [
    [0, 2, 1],
    [0, 3, 2],
    [5, 1, 2],
    [5, 2, 3],
    [0, 1, 4],
    [0, 4, 3],
    [5, 4, 1],
    [5, 3, 4]
  ].map(function(face) {
    return face.map(function(i) {
      return octahedron[i];
    });
  });

  var ck = octahedron.map(function(face) {
    var xyz = face.map(cartesianDegrees),
      n = xyz.length,
      a = xyz[n - 1],
      b,
      theta = 17 * radians,
      cosTheta = cos(theta),
      sinTheta = sin(theta),
      hexagon = [];
    for (var i = 0; i < n; ++i) {
      b = xyz[i];
      hexagon.push(
        sphericalDegrees([
          a[0] * cosTheta + b[0] * sinTheta,
          a[1] * cosTheta + b[1] * sinTheta,
          a[2] * cosTheta + b[2] * sinTheta
        ]),
        sphericalDegrees([
          b[0] * cosTheta + a[0] * sinTheta,
          b[1] * cosTheta + a[1] * sinTheta,
          b[2] * cosTheta + a[2] * sinTheta
        ])
      );
      a = b;
    }
    return hexagon;
  });

  var cornerNormals = [];

  var parents = [-1, 3, 0, 2, 0, 1, 4, 5];

  ck.forEach(function(hexagon, j) {
    var face = octahedron[j],
      n = face.length,
      normals = (cornerNormals[j] = []);
    for (var i = 0; i < n; ++i) {
      ck.push([
        face[i],
        hexagon[(i * 2 + 2) % (2 * n)],
        hexagon[(i * 2 + 1) % (2 * n)]
      ]);
      parents.push(j);
      normals.push(
        cartesianCross(
          cartesianDegrees(hexagon[(i * 2 + 2) % (2 * n)]),
          cartesianDegrees(hexagon[(i * 2 + 1) % (2 * n)])
        )
      );
    }
  });

  var faces = ck.map(function(face) {
    return {
      project: faceProjection(face),
      face: face
    };
  });

  parents.forEach(function(d, i) {
    var parent = faces[d];
    parent && (parent.children || (parent.children = [])).push(faces[i]);
  });
  return polyhedral(faces[0], face, 0, true)
    .scale(0.023975)
    .rotate([20, 0])
    .center([0,-17]);

  function face(lambda, phi) {
    var cosPhi = cos(phi),
      p = [cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi)];

    var hexagon =
      lambda < -pi / 2
        ? phi < 0 ? 6 : 4
        : lambda < 0
          ? phi < 0 ? 2 : 0
          : lambda < pi / 2 ? (phi < 0 ? 3 : 1) : phi < 0 ? 7 : 5;

    var n = cornerNormals[hexagon];

    return faces[
      cartesianDot(n[0], p) < 0
        ? 8 + 3 * hexagon
        : cartesianDot(n[1], p) < 0
          ? 8 + 3 * hexagon + 1
          : cartesianDot(n[2], p) < 0 ? 8 + 3 * hexagon + 2 : hexagon
    ];
  }
}

// all names of reference points, A, B, D, ... , G, P75
// or zones, A-L, are detailed fully in Gene Keyes'
// web site http://www.genekeyes.com/CKOG-OOo/7-CKOG-illus-&-coastline.html

function cahillKeyesRaw(mg) {
  var CK = {
    lengthMG: mg // magic scaling length
  };

  preliminaries();

  function preliminaries() {
    var pointN, lengthMB, lengthMN, lengthNG, pointU;
    var m = 29, // meridian
      p = 15, // parallel
      p73a,
      lF,
      lT,
      lM,
      l,
      pointV,
      k = sqrt(3);

    CK.lengthMA = 940 / 10000 * CK.lengthMG;
    CK.lengthParallel0to73At0 = CK.lengthMG / 100;
    CK.lengthParallel73to90At0 =
      (CK.lengthMG - CK.lengthMA - CK.lengthParallel0to73At0 * 73) / (90 - 73);
    CK.sin60 = k / 2; // √3/2 
    CK.cos60 = 0.5;
    CK.pointM = [0, 0];
    CK.pointG = [CK.lengthMG, 0];
    pointN = [CK.lengthMG, CK.lengthMG * tan(30 * radians)];
    CK.pointA = [CK.lengthMA, 0];
    CK.pointB = lineIntersection(CK.pointM, 30, CK.pointA, 45);
    CK.lengthAG = distance(CK.pointA, CK.pointG);
    CK.lengthAB = distance(CK.pointA, CK.pointB);
    lengthMB = distance(CK.pointM, CK.pointB);
    lengthMN = distance(CK.pointM, pointN);
    lengthNG = distance(pointN, CK.pointG);
    CK.pointD = interpolate(lengthMB, lengthMN, pointN, CK.pointM);
    CK.pointF = [CK.lengthMG, lengthNG - lengthMB];
    CK.pointE = [
      pointN[0] - CK.lengthMA * sin(30 * radians),
      pointN[1] - CK.lengthMA * cos(30 * radians)
    ];
    CK.lengthGF = distance(CK.pointG, CK.pointF);
    CK.lengthBD = distance(CK.pointB, CK.pointD);
    CK.lengthBDE = CK.lengthBD + CK.lengthAB; // lengthAB = lengthDE 
    CK.lengthGFE = CK.lengthGF + CK.lengthAB; // lengthAB = lengthFE 
    CK.deltaMEq = CK.lengthGFE / 45;
    CK.lengthAP75 = (90 - 75) * CK.lengthParallel73to90At0;
    CK.lengthAP73 = CK.lengthMG - CK.lengthMA - CK.lengthParallel0to73At0 * 73;
    pointU = [
      CK.pointA[0] + CK.lengthAP73 * cos(30 * radians),
      CK.pointA[1] + CK.lengthAP73 * sin(30 * radians)
    ];
    CK.pointT = lineIntersection(pointU, -60, CK.pointB, 30);

    p73a = parallel73(m);
    lF = p73a.lengthParallel73;
    lT = lengthTorridSegment(m);
    lM = lengthMiddleSegment(m);
    l = p * (lT + lM + lF) / 73;
    pointV = [0, 0];
    CK.pointC = [0, 0];
    CK.radius = 0;

    l = l - lT;
    pointV = interpolate(l, lM, jointT(m), jointF(m));
    CK.pointC[1] =
      (pointV[0] * pointV[0] +
        pointV[1] * pointV[1] -
        CK.pointD[0] * CK.pointD[0] -
        CK.pointD[1] * CK.pointD[1]) /
      (2 * (k * pointV[0] + pointV[1] - k * CK.pointD[0] - CK.pointD[1]));
    CK.pointC[0] = k * CK.pointC[1];
    CK.radius = distance(CK.pointC, CK.pointD);

    return CK;
  }

  //**** helper functions ****//

  // distance between two 2D coordinates

  function distance(p1, p2) {
    var deltaX = p1[0] - p2[0],
      deltaY = p1[1] - p2[1];
    return sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  // return 2D point at position length/totallength of the line
  // defined by two 2D points, start and end.

  function interpolate(length, totalLength, start, end) {
    var xy = [
      start[0] + (end[0] - start[0]) * length / totalLength,
      start[1] + (end[1] - start[1]) * length / totalLength
    ];
    return xy;
  }

  // return the 2D point intersection between two lines defined
  // by one 2D point and a slope each.

  function lineIntersection(point1, slope1, point2, slope2) {
    // s1/s2 = slope in degrees
    var m1 = tan(slope1 * radians),
      m2 = tan(slope2 * radians),
      p = [0, 0];
    p[0] =
      (m1 * point1[0] - m2 * point2[0] - point1[1] + point2[1]) / (m1 - m2);
    p[1] = m1 * (p[0] - point1[0]) + point1[1];
    return p;
  }

  // return the 2D point intercepting a circumference centered
  // at cc and of radius rn and a line defined by 2 points, p1 and p2:
  // First element of the returned array is a flag to state whether there is
  // an intersection, a value of zero (0) means NO INTERSECTION.
  // The following array is the 2D point of the intersection.
  // Equations from "Intersection of a Line and a Sphere (or circle)/Line Segment"
  // at http://paulbourke.net/geometry/circlesphere/
  function circleLineIntersection(cc, r, p1, p2) {
    var x1 = p1[0],
      y1 = p1[1],
      x2 = p2[0],
      y2 = p2[1],
      xc = cc[0],
      yc = cc[1],
      a = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1),
      b = 2 * ((x2 - x1) * (x1 - xc) + (y2 - y1) * (y1 - yc)),
      c =
        xc * xc + yc * yc + x1 * x1 + y1 * y1 - 2 * (xc * x1 + yc * y1) - r * r,
      d = b * b - 4 * a * c,
      u1 = 0,
      u2 = 0,
      x = 0,
      y = 0;
    if (a === 0) {
      return [0, [0, 0]];
    } else if (d < 0) {
      return [0, [0, 0]];
    }
    u1 = (-b + sqrt(d)) / (2 * a);
    u2 = (-b - sqrt(d)) / (2 * a);
    if (0 <= u1 && u1 <= 1) {
      x = x1 + u1 * (x2 - x1);
      y = y1 + u1 * (y2 - y1);
      return [1, [x, y]];
    } else if (0 <= u2 && u2 <= 1) {
      x = x1 + u2 * (x2 - x1);
      y = y1 + u2 * (y2 - y1);
      return [1, [x, y]];
    } else {
      return [0, [0, 0]];
    }
  }

  // counterclockwise rotate 2D vector, xy, by angle (in degrees)
  // [original CKOG uses clockwise rotation]

  function rotate(xy, angle) {
    var xynew = [0, 0];

    if (angle === -60) {
      xynew[0] = xy[0] * CK.cos60 + xy[1] * CK.sin60;
      xynew[1] = -xy[0] * CK.sin60 + xy[1] * CK.cos60;
    } else if (angle === -120) {
      xynew[0] = -xy[0] * CK.cos60 + xy[1] * CK.sin60;
      xynew[1] = -xy[0] * CK.sin60 - xy[1] * CK.cos60;
    } else {
      // !!!!! This should not happen for this projection!!!!
      // the general algorith: cos(angle) * xy + sin(angle) * perpendicular(xy)
      // return cos(angle * radians) * xy + sin(angle * radians) * perpendicular(xy);
      //console.log("rotate: angle " + angle + " different than -60 or -120!");
      // counterclockwise
      xynew[0] = xy[0] * cos(angle * radians) - xy[1] * sin(angle * radians);
      xynew[1] = xy[0] * sin(angle * radians) + xy[1] * cos(angle * radians);
    }

    return xynew;
  }

  // truncate towards zero like int() in Perl
  function truncate(n) {
    return Math[n > 0 ? "floor" : "ceil"](n);
  }

  function equator(m) {
    var l = CK.deltaMEq * m,
      jointE = [0, 0];
    if (l <= CK.lengthGF) {
      jointE = [CK.pointG[0], l];
    } else {
      l = l - CK.lengthGF;
      jointE = interpolate(l, CK.lengthAB, CK.pointF, CK.pointE);
    }
    return jointE;
  }

  function jointE(m) {
    return equator(m);
  }

  function jointT(m) {
    return lineIntersection(CK.pointM, 2 * m / 3, jointE(m), m / 3);
  }

  function jointF(m) {
    if (m === 0) {
      return [CK.pointA + CK.lengthAB, 0];
    }
    var xy = lineIntersection(CK.pointA, m, CK.pointM, 2 * m / 3);
    return xy;
  }

  function lengthTorridSegment(m) {
    return distance(jointE(m), jointT(m));
  }

  function lengthMiddleSegment(m) {
    return distance(jointT(m), jointF(m));
  }

  function parallel73(m) {
    var p73 = [0, 0],
      jF = jointF(m),
      lF = 0,
      xy = [0, 0];
    if (m <= 30) {
      p73[0] = CK.pointA[0] + CK.lengthAP73 * cos(m * radians);
      p73[1] = CK.pointA[1] + CK.lengthAP73 * sin(m * radians);
      lF = distance(jF, p73);
    } else {
      p73 = lineIntersection(CK.pointT, -60, jF, m);
      lF = distance(jF, p73);
      if (m > 44) {
        xy = lineIntersection(CK.pointT, -60, jF, 2 / 3 * m);
        if (xy[0] > p73[0]) {
          p73 = xy;
          lF = -distance(jF, p73);
        }
      }
    }
    return {
      parallel73: p73,
      lengthParallel73: lF
    };
  }

  function parallel75(m) {
    return [
      CK.pointA[0] + CK.lengthAP75 * cos(m * radians),
      CK.pointA[1] + CK.lengthAP75 * sin(m * radians)
    ];
  }

  // special functions to transform lon/lat to x/y
  function ll2mp(lon, lat) {
    var south = [0, 6, 7, 8, 5],
      o = truncate((lon + 180) / 90 + 1),
      p, // parallel
      m = (lon + 720) % 90 - 45, // meridian
      s = sign(m);

    m = abs(m);
    if (o === 5) o = 1;
    if (lat < 0) o = south[o];
    p = abs(lat);
    return [m, p, s, o];
  }

  function zoneA(m, p) {
    return [CK.pointA[0] + (90 - p) * 104, 0];
  }

  function zoneB(m, p) {
    return [CK.pointG[0] - p * 100, 0];
  }

  function zoneC(m, p) {
    var l = 104 * (90 - p);
    return [
      CK.pointA[0] + l * cos(m * radians),
      CK.pointA[1] + l * sin(m * radians)
    ];
  }

  function zoneD(m /*, p */) {
    // p = p; // just keep it for symmetry in signature
    return equator(m);
  }

  function zoneE(m, p) {
    var l = 1560 + (75 - p) * 100;
    return [
      CK.pointA[0] + l * cos(m * radians),
      CK.pointA[1] + l * sin(m * radians)
    ];
  }

  function zoneF(m, p) {
    return interpolate(p, 15, CK.pointE, CK.pointD);
  }

  function zoneG(m, p) {
    var l = p - 15;
    return interpolate(l, 58, CK.pointD, CK.pointT);
  }

  function zoneH(m, p) {
    var p75 = parallel75(45),
      p73a = parallel73(m),
      p73 = p73a.parallel73,
      lF = distance(CK.pointT, CK.pointB),
      lF75 = distance(CK.pointB, p75),
      l = (75 - p) * (lF75 + lF) / 2,
      xy = [0, 0];
    if (l <= lF75) {
      xy = interpolate(l, lF75, p75, CK.pointB);
    } else {
      l = l - lF75;
      xy = interpolate(l, lF, CK.pointB, p73);
    }
    return xy;
  }

  function zoneI(m, p) {
    var p73a = parallel73(m),
      lT = lengthTorridSegment(m),
      lM = lengthMiddleSegment(m),
      l = p * (lT + lM + p73a.lengthParallel73) / 73,
      xy;
    if (l <= lT) {
      xy = interpolate(l, lT, jointE(m), jointT(m));
    } else if (l <= lT + lM) {
      l = l - lT;
      xy = interpolate(l, lM, jointT(m), jointF(m));
    } else {
      l = l - lT - lM;
      xy = interpolate(l, p73a.lengthParallel73, jointF(m), p73a.parallel73);
    }
    return xy;
  }

  function zoneJ(m, p) {
    var p75 = parallel75(m),
      lF75 = distance(jointF(m), p75),
      p73a = parallel73(m),
      p73 = p73a.parallel73,
      lF = p73a.lengthParallel73,
      l = (75 - p) * (lF75 - lF) / 2,
      xy = [0, 0];

    if (l <= lF75) {
      xy = interpolate(l, lF75, p75, jointF(m));
    } else {
      l = l - lF75;
      xy = interpolate(l, -lF, jointF(m), p73);
    }
    return xy;
  }

  function zoneK(m, p, l15) {
    var l = p * l15 / 15,
      lT = lengthTorridSegment(m),
      lM = lengthMiddleSegment(m),
      xy = [0, 0];
    if (l <= lT) {
      // point is in torrid segment
      xy = interpolate(l, lT, jointE(m), jointT(m));
    } else {
      // point is in middle segment
      l = l - lT;
      xy = interpolate(l, lM, jointT(m), jointF(m));
    }
    return xy;
  }

  function zoneL(m, p, l15) {
    var p73a = parallel73(m),
      p73 = p73a.parallel73,
      lT = lengthTorridSegment(m),
      lM = lengthMiddleSegment(m),
      xy,
      lF = p73a.lengthParallel73,
      l = l15 + (p - 15) * (lT + lM + lF - l15) / 58;
    if (l <= lT) {
      //on torrid segment
      xy = interpolate(l, lT, jointE(m), jointF(m));
    } else if (l <= lT + lM) {
      //on middle segment
      l = l - lT;
      xy = interpolate(l, lM, jointT(m), jointF(m));
    } else {
      //on frigid segment
      l = l - lT - lM;
      xy = interpolate(l, lF, jointF(m), p73);
    }
    return xy;
  }

  // convert half-octant meridian,parallel to x,y coordinates.
  // arguments are meridian, parallel

  function mp2xy(m, p) {
    var xy = [0, 0],
      lT,
      p15a,
      p15,
      flag15,
      l15;

    if (m === 0) {
      // zones (a) and (b)
      if (p >= 75) {
        xy = zoneA(m, p);
      } else {
        xy = zoneB(m, p);
      }
    } else if (p >= 75) {
      xy = zoneC(m, p);
    } else if (p === 0) {
      xy = zoneD(m, p);
    } else if (p >= 73 && m <= 30) {
      xy = zoneE(m, p);
    } else if (m === 45) {
      if (p <= 15) {
        xy = zoneF(m, p);
      } else if (p <= 73) {
        xy = zoneG(m, p);
      } else {
        xy = zoneH(m, p);
      }
    } else {
      if (m <= 29) {
        xy = zoneI(m, p);
      } else {
        // supple zones (j), (k) and (l)
        if (p >= 73) {
          xy = zoneJ(m, p);
        } else {
          //zones (k) and (l)
          p15a = circleLineIntersection(
            CK.pointC,
            CK.radius,
            jointT(m),
            jointF(m)
          );
          flag15 = p15a[0];
          p15 = p15a[1];
          lT = lengthTorridSegment(m);
          if (flag15 === 1) {
            // intersection is in middle segment
            l15 = lT + distance(jointT(m), p15);
          } else {
            // intersection is in torrid segment
            p15a = circleLineIntersection(
              CK.pointC,
              CK.radius,
              jointE(m),
              jointT(m)
            );
            flag15 = p15a[0];
            p15 = p15a[1];
            l15 = lT - distance(jointT(m), p15);
          }
          if (p <= 15) {
            xy = zoneK(m, p, l15);
          } else {
            //zone (l)
            xy = zoneL(m, p, l15);
          }
        }
      }
    }
    return xy;
  }

  // from half-octant to megamap (single rotated octant)

  function mj2g(xy, octant) {
    var xynew = [0, 0];

    if (octant === 0) {
      xynew = rotate(xy, -60);
    } else if (octant === 1) {
      xynew = rotate(xy, -120);
      xynew[0] -= CK.lengthMG;
    } else if (octant === 2) {
      xynew = rotate(xy, -60);
      xynew[0] -= CK.lengthMG;
    } else if (octant === 3) {
      xynew = rotate(xy, -120);
      xynew[0] += CK.lengthMG;
    } else if (octant === 4) {
      xynew = rotate(xy, -60);
      xynew[0] += CK.lengthMG;
    } else if (octant === 5) {
      xynew = rotate([2 * CK.lengthMG - xy[0], xy[1]], -60);
      xynew[0] += CK.lengthMG;
    } else if (octant === 6) {
      xynew = rotate([2 * CK.lengthMG - xy[0], xy[1]], -120);
      xynew[0] -= CK.lengthMG;
    } else if (octant === 7) {
      xynew = rotate([2 * CK.lengthMG - xy[0], xy[1]], -60);
      xynew[0] -= CK.lengthMG;
    } else if (octant === 8) {
      xynew = rotate([2 * CK.lengthMG - xy[0], xy[1]], -120);
      xynew[0] += CK.lengthMG;
    } else {
      // TODO trap this some way.
      // ERROR!
      // print "Error converting to M-map coordinates; there is no Octant octant!\n";
      //console.log("mj2g: something weird happened!");
      return xynew;
    }

    return xynew;
  }

  // general CK map projection

  function forward(lambda, phi) {
    // lambda, phi are in radians.
    var lon = lambda * degrees,
      lat = phi * degrees,
      res = ll2mp(lon, lat),
      m = res[0],  // 0 ≤ m ≤ 45
      p = res[1],  // 0 ≤ p ≤ 90
      s = res[2],  // -1 / 1 = side of m
      o = res[3],  // octant
      xy = mp2xy(m, p),
      mm = mj2g([xy[0], s * xy[1]], o);

    return mm;
  }

  return forward;
}

function cahillKeyesProjection() {
  var mg = 10000,
    m = d3Geo.geoProjectionMutator(cahillKeyesRaw);
  return m(mg);
}

exports.geoClipPolygon = clipPolygon;
exports.geoIntersectArc = intersect$1;
exports.geoPolyhedral = polyhedral;
exports.geoPolyhedralButterfly = butterfly;
exports.geoPolyhedralCollignon = collignon;
exports.geoPolyhedralWaterman = waterman;
exports.geoPolyhedralVoronoi = voronoi;
exports.geoDodecahedral = dodecahedral;
exports.geoCox = cox;
exports.geoCoxRaw = coxRaw;
exports.geoTetrahedralLee = tetrahedralLee;
exports.geoLeeRaw = leeRaw;
exports.geoGrayFullerRaw = GrayFullerRaw;
exports.geoAirocean = airocean;
exports.geoIcosahedral = icosahedral;
exports.geoImago = imago;
exports.geoImagoBlock = imagoBlock;
exports.geoImagoRaw = imagoRaw;
exports.geoCubic = cubic;
exports.geoCahillKeyes = cahillKeyes;
exports.geoCahillKeyesRaw = cahillKeyesRaw;

Object.defineProperty(exports, '__esModule', { value: true });

})));
