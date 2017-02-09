/*
 *   This creates a Delaunay triangulation of a set of points by using a sweepline approach.
 *   
 *   points: an array of points {x: Float, y: Float}
 *   
 *   returns: {
 *       triangles: an array of arrays [a, b, c] representing a triangle whose vertices are at
 *           points[a], points[b], points[c] in counter-clockwise order
 *       edges: 
 *       data: an array of arrays such that data[i] represents all triangles which include
 *           points[i]
 *       hull: an array of integers such that points[hull[0]] ... points[hull[n]] represent
 *           the convex hull of points in counter-clockwise order
 *   }
 */

(function(Pillow) {
	"use strict";

	Pillow.delaunay = function(points) {

		// SETUP
		var pindex = [], data = [], triangles = [], len = points.length;

		// Points are sorted in lexicographical order by y then x
		for (var i = 0; i < len; ++i)
			pindex.push(i);
		pindex.sort(function(a, b) {
			return points[a].y == points[b].y ? points[a].x-points[b].x : points[a].y-points[b].y;
		});

		// INITIALIZATION
		var front, lhull, limit = Math.PI*3/4;

		// Find the first point p2 that isn't collinear with p0 and p1
		var i0 = pindex[0], i1 = pindex[1], i01 = [i0, i1];
		var i2t, orient;
		for (i2t = 2; i2t < len; ++i2t)
			if ((orient = ccw(i0, i1, pindex[i2t])) == 0)
				i01.push(pindex[i2t]);
			else break;
		i1 = pindex[i2t-1];

		// Determine case (8 possible http://i.imgur.com/Yp6X9Lq.jpg)
		var p0 = points[i0], p1 = points[i1];
		var i2 = pindex[i2t], p2 = points[i2];
		if (p0.x < p1.x && p0.x < p2.x)
			if (orient > 0)
				if (p1.x <= p2.x)
					front = [i0, i2], lhull = i01.concat(i2); // 1
				else
					front = [i0, i2, i1], lhull = i01; // 2
			else
				front = i01.concat(i2), lhull = [i0, i2]; // 3
		else if (p0.x > p1.x && p0.x > p2.x)
			if ((orient *= -1) > 0)
				if (p1.x >= p2.x)
					front = [i2, i0], lhull = [i2].concat(i01.reverse()); // 4
				else
					front = [i1, i2, i0], lhull = i01.reverse(); // 5
			else
				front = [i2].concat(i01.reverse()), lhull = [i2, i0]; // 6
		else if (p1.x < p2.x)
			front = [i1, i2], lhull = i01.reverse().concat(i2), orient *= -1; // 7
		else
			front = [i2, i1], lhull = [i2].concat(i01); // 8

		// Initialize data and triangles
		data[i0] = [0], data[i1] = [i2t-2], data[i2] = [0];
		if (orient > 0) {
			for (var i = 1; i < i2t-1; ++i) {
				data[i01[i]] = [i-1, i];
				data[i2].push(i);
				triangles.push([i2, i01[i-1], i01[i]]);
			}
			triangles.push([i2, i01[i2t-2], i01[i2t-1]]);
		} else {
			for (var i = 1; i < i2t-1; ++i) {
				data[i01[i]] = [i-1, i];
				data[i2].push(i);
				triangles.push([i2, i01[i], i01[i-1]]);
			}
			triangles.push([i2, i01[i2t-1], i01[i2t-2]]);
		}

		// SWEEPLINE
		for (var p = i2t+1; p < len; ++p) {
			var i = pindex[p], point = points[i];
			data[i] = [];

			// find index of front with x leq to point.x
			var index = -1, max = front.length, mid;
			while (max-index > 1) {
				mid = max+index+1 >> 1;
				if (points[front[mid]].x <= point.x)
					index = mid;
				else
					max = mid;
			}

			// Left of front
			if (index == -1) {
				if (ccw(i, front[0], front[1]) > 0) {
					add(i, front[0], front[1]);
					validate(front[0], front[1]);
					front.splice(0, 1, i);
				}
				else
					front.unshift(i);
				// Add below
				lhull.unshift(i);
				for (var j = 1; j < lhull.length-1; ++j)
					if (ccw(i, lhull[j], lhull[j+1]) < 0) {
						add(i, lhull[j+1], lhull[j]);
						validate(i, lhull[j]);
						validate(i, lhull[j+1]);
						lhull.splice(j, 1);
					}
					else break;
			}

			// Right of front
			else if (index == front.length-1) {
				if (ccw(i, front[index], front[index-1]) < 0) {
					add(i, front[index-1], front[index]);
					validate(front[index-1], front[index]);
					front.splice(index, 1, i);
				}
				else
					front.push(i);
				// Add below
				lhull.push(i);
				for (var j = lhull.length-2; j > 0; --j)
					if (ccw(i, lhull[j], lhull[j-1]) > 0) {
						add(i, lhull[j], lhull[j-1]);
						validate(i, lhull[j]);
						validate(i, lhull[j-1]);
						lhull.splice(j++, 1);
					}
					else break;
			}

			// Hits front
			else {
				add(i, front[index], front[index+1]);
				validate(front[index], front[index+1]);
				front.splice(index+1, 0, i);
			}

			// Add to the right
			for (var j = index+2; j > 0 && j < front.length-1; ++j) {
				var theta = angle(front[j-1], front[j], front[j+1]);
				if (theta > 0 && theta < limit) {
					add(front[j-1], front[j], front[j+1]);
					validate(front[j-1], front[j]);
					validate(front[j], front[j+1]);
					front.splice(j--, 1);
				}
				else break;
			}

			// Add to the left
			for (var j = index; j > 0 && j < front.length-1; --j) {
				var theta = angle(front[j-1], front[j], front[j+1]);
				if (theta > 0 && theta < limit) {
					add(front[j-1], front[j], front[j+1]);
					validate(front[j-1], front[j]);
					validate(front[j], front[j+1]);
					front.splice(j, 1);
				}
				else break;
			}
		}

		// FINALIZATION
		for (var i = 0; i < front.length-1; ++i) {
			if (i == 0 || ccw(front[i-1], front[i], front[i+1]) <= 0)
				continue;
			add(front[i-1], front[i], front[i+1]);
			validate(front[i-1], front[i]);
			validate(front[i], front[i+1]);
			front.splice(i, 1);
			i -= 2;
		}

		lhull.pop();
		front.reverse();
		return {
			triangles: triangles,
			data: data,
			hull: lhull.concat(front)
		};

		// Tests if an edge needs to be flipped, and recursively tests newly made edges
		function validate(a, b) {
			var t = intersect(data[a], data[b]);
			if (t.length != 2)
				return;
			var t0 = triangles[t[0]], t1 = triangles[t[1]], d = opposite(t1, a, b),
			    A = points[t0[0]], B = points[t0[1]], C = points[t0[2]],
			    D = points[d], Dxy = D.x*D.x+D.y*D.y;
			var m11 = A.x-D.x, m12 = A.y-D.y, m13 = A.x*A.x+A.y*A.y-Dxy,
			    m21 = B.x-D.x, m22 = B.y-D.y, m23 = B.x*B.x+B.y*B.y-Dxy,
			    m31 = C.x-D.x, m32 = C.y-D.y, m33 = C.x*C.x+C.y*C.y-Dxy;
			if (m11*m22*m33 + m12*m23*m31 + m13*m21*m32 -
				m11*m23*m32 - m12*m21*m33 - m13*m22*m31 > 0) {
				var e = opposite(t0, a, b);
				data[a].splice(find(data[a], t[1]), 1);
				data[b].splice(find(data[b], t[0]), 1);
				data[d].splice(find(data[d], t[0]), 0, t[0]);
				data[e].splice(find(data[e], t[1]), 0, t[1]);
				t0.splice(find2(t0, b), 1, d);
				t1.splice(find2(t1, a), 1, e);
				validate(a, e);
				validate(a, d);
				validate(b, e);
				validate(b, d);
			}
		}
		// Returns the point in t that is not a or b
		function opposite(t, a, b) {
			return t[0] != a && t[0] != b ? t[0] : t[1] != a && t[1] != b ? t[1] : t[2];
		}
		// Adds the triangle abc
		function add(a, b, c) {
			var t = triangles.length;
			data[a].push(t);
			data[b].push(t);
			data[c].push(t);
			triangles.push([a, b, c]);
		}
		// Returns (twice) the signed area of triangle abc
		function ccw(a, b, c) {
			return (points[b].x-points[a].x)*(points[c].y-points[a].y) -
			       (points[b].y-points[a].y)*(points[c].x-points[a].x);
		}
		// Returns the angle abc
		function angle(a, b, c) {
			var x1 = points[a].x-points[b].x, y1 = points[a].y-points[b].y,
			    x2 = points[c].x-points[b].x, y2 = points[c].y-points[b].y;
			return -Math.atan2(x1*y2-y1*x2, x1*x2+y1*y2);
		}
		// Binary searches for o in a
		function find(a, o) {
			var min = -1, max = a.length, mid;
			while (max > min+1) {
				mid = max+min+1 >> 1;
				if (a[mid] <= o)
					min = mid;
				else
					max = mid;
			}
			return min != -1 && a[min] == o ? min : min+1;
		}
		// Returns the index of o in triangle a
		function find2(a, o) {
			return a[0] == o ? 0 : a[1] == o ? 1 : 2;
		}
		// Returns the intersection of two sorted arrays a and b
		function intersect(a, b) {
			var i = 0, j = 0, result = [];
			while (i < a.length && j < b.length)
				if (a[i] < b[j])
					++i;
				else if (b[j] < a[i])
					++j;
				else {
					result.push(a[i]);
					++i;
					++j;
				}
			return result;
		}

	};

})(window.Pillow = window.Pillow || {});
