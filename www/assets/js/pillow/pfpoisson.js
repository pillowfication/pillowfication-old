/*
 *   Generate a maximal poisson disk within the domain
 *   As of now, it is only near maximal because I was too lazy to create a perfect polygonal
 *   representation of the voids which would allow the probability of dart throwing success to
 *   actually increase with time. Right now it kinda just hits a wall, particularly when two
 *   disks' intersection is completely inside the void.
 *   
 *   domain: an array of points {x, y} representing vertices of a polygon ordered counter-clockwise
 *   radius: minimum distance between any two points
 *   initial: (optional) an array of points {x, y} that will be thrown (and tested because each cell can only allow 1 point) before the dart throwing
 *   
 *   returns: an array of points {x, y}
 */

/*
 *   TODO:
 *    - For some reason, a void will refuse to cut with horizontal lines. (bug seems to have mysteriously disappeared)
 *    - Better polygonal void approximations
 */

function poisson(domain, radius, initial) {
	"use strict";
	var start = new Date(), points = [];
	
	// INITIALIZATION
	var rad2 = radius*radius, size = radius/Math.sqrt(2), xMin = domain[0].x, yMin = domain[0].y, xMax = xMin, yMax = yMin;
	for (var i = 1; i < domain.length; ++i) {
		var vert = domain[i];
		if (vert.x < xMin)
			xMin = vert.x;
		else if (vert.x > xMax)
			xMax = vert.x;
		if (vert.y < yMin)
			yMin = vert.y;
		else if (vert.y > yMax)
			yMax = vert.y;
	}
	var rows = ((yMax-yMin)/size|0)+1, cols = ((xMax-xMin)/size|0)+1;
	// Find valid and boundary cells
	var valid = [], cellGrid = [];
	for (var r = 0; r < rows; ++r)
		for (var c = 0; c < cols; ++c) {
			var x0 = xMin+c*size, x1 = x0+size, y0 = yMin+r*size, y1 = y0+size;
			var edges = [], prev = domain[domain.length-1], vert;
			for (var i = 0; vert = domain[i], i < domain.length; prev = vert, ++i)
				// Check if edge intersects cell
				if (prev.x > x0 && prev.x < x1 && prev.y > y0 && prev.y < y1 || vert.x > x0 && vert.x < x1 && vert.y > y0 && vert.y < y1)
					edges.push([prev, vert]);
				else {
					var box = [{x: x0, y: y0}, {x: x1, y: y0}, {x: x1, y: y1}, {x: x0, y: y1}, {x: x0, y: y0}];
					for (var j = 0; j < 4; ++j)
						if (cross(prev, box[j], box[j+1]) != cross(vert, box[j], box[j+1]) && cross(box[j], prev, vert) != cross(box[j+1], prev, vert)) {
							edges.push([prev, vert]);
							break;
						}
				}
			if (edges.length > 0 || inside({x: x0+size/2, y: y0+size/2})) {
				var index = r*cols+c;
				valid.push(index);
				cellGrid[index] = {x: c, y: r, edges: edges, point: null, poly: null};
			}
		}
	
	// PHASE 1
	// Throw initial darts
	if (initial)
		for (var i = 0; i < initial.length; ++i) {
			var dart = initial[i], cindex = ((dart.y-yMin)/size|0)*cols+((dart.x-xMin)/size|0), index = search(valid, cindex), cell = cellGrid[cindex];
			if (index != -1 && check(dart, cell)) {
				cell.point = dart;
				points.push(dart);
				valid.splice(index, 1);
			}
		}
	// Throw darts into valid cells
	var min = 1/16*valid.length, max = 5*valid.length, miss = 0;
	for (var i = 0; valid.length > 0 && i < max; ++i) {
		var index = Math.random()*valid.length|0, cell = cellGrid[valid[index]];
		var dart = {x: xMin+size*(cell.x+Math.random()), y: yMin+size*(cell.y+Math.random())};
		if (check(dart, cell)) {
			cell.point = dart;
			points.push(dart);
			valid.splice(index, 1);
			misses = 0;
		}
		else if (++misses >= 400 && i > min)
			break;
	}
	
	// PHASE 2
	var pl = valid.length, stop = 0;
	while (valid.length > 0) {
		if (pl == valid.length && ++stop > 10)
			break; // {{ TEMPORARY TERMINATOR }}
		pl = valid.length;
		var areas = [0];
		// Calculate polygonal voids
		p2v: for (var i = 0; i < valid.length; ++i) {
			var cell = cellGrid[valid[i]];
			if (cell.point != null) {
				valid.splice(i--, 1);
				continue;
			}
			var x0 = xMin+cell.x*size, x1 = x0+size, y0 = yMin+cell.y*size, y1 = y0+size;
			var poly = [{x: x0, y: y0}, {x: x1, y: y0}, {x: x1, y: y1}, {x: x0, y: y1}];
			// Intersect void with edges
			for (var e = 0; e < cell.edges.length; ++e) {
				var edge = cell.edges[e], sx = edge[1].x-edge[0].x, sy = edge[1].y-edge[0].y, state = [cross(poly[0], edge[0], edge[1])];
				for (var j = 1; j < poly.length; ++j)
					state.push(cross(poly[j], edge[0], edge[1]));
				var index = 0, pj = state.length-1, prev = poly[pj], curr;
				for (var j = 0; curr = poly[index], j < state.length; pj = j, prev = curr, ++j, ++index) {
					if (state[pj]*state[j] == -1) {
						var rx = curr.x-prev.x, ry = curr.y-prev.y, t = ((edge[0].x-prev.x)*sy-(edge[0].y-prev.y)*sx)/(rx*sy-ry*sx);
						poly.splice(index++, 0, {x: prev.x+t*rx, y: prev.y+t*ry});
					}
					if (state[j] == -1)
						poly.splice(index--, 1);
				}
			}
			// Intersect void with discs (plz update this)
			for (var j = -2; j < 3; ++j)
				for (var k = -2; k < 3; ++k) {
					if (j == 0 && k == 0)
						continue;
					var disc = cellGrid[(cell.y+j)*cols+cell.x+k];
					if (typeof disc == "undefined" || disc.point == null)
						continue;
					var state = [close(poly[0], disc.point)], pass = false;
					for (var l = 1; l < poly.length; ++l) {
						state.push(close(poly[l], disc.point));
						if (state[l] != state[l-1])
							pass = true;
					}
					if (!pass) {
						if (!state[0]) {
							valid.splice(i--, 1);
							continue p2v;
						}
						continue;
					}
					var index = 0, pj = state.length-1, prev = poly[pj], curr;
					for (var l = 0; curr = poly[index], l < state.length; pj = l, prev = curr, ++l, ++index) {
						if (state[pj] != state[l])
							poly.splice(index++, 0, state[l] ? diskSegment(prev, curr, disc.point) : diskSegment(curr, prev, disc.point));
						if (!state[l])
							poly.splice(index--, 1);
					}
				}
			if (poly.length < 3) {
				valid.splice(i--, 1);
				continue;
			}
			cell.poly = poly;
			areas.push(areas[areas.length-1]+area(poly));
		}
		// Throw darts into voids
		var min = 1/16*valid.length, max = 3*valid.length, hit = [], misses = 0;
		for (var i = 0; i < max; ++i) {
			// Get random void's triangle
			var index = rand(areas);
			if (hit[index]) {
				if (++misses > 100 && i > min)
					break;
				continue;
			}
			var cell = cellGrid[valid[index]], poly = cell.poly, dt = poly[0], vax, vay, vbx, vby;
			if (poly.length == 3)
				vax = poly[1].x-dt.x, vay = poly[1].y-dt.y, vbx = poly[2].x-dt.x, vby = poly[2].y-dt.y;
			else {
				for (var j = 1; j < poly.length; ++j) {
					dt.x += poly[j].x;
					dt.y += poly[j].y;
				}
				dt.x /= poly.length;
				dt.y /= poly.length;
				var tarea = [0], prev = poly[poly.length-1];
				for (var j = 0; j < poly.length; prev = poly[j], ++j)
					tarea.push(tarea[tarea.length-1]+area([dt, prev, poly[j]]));
				var tindex = rand(tarea);
				vax = poly[tindex].x-dt.x, vay = poly[tindex].y-dt.y;
				tindex = tindex == 0 ? poly.length-1 : tindex-1;
				vbx = poly[tindex].x-dt.x, vby = poly[tindex].y-dt.y;
			}
			var u = Math.random(), v = Math.random();
			if (u+v > 1) {
				u = 1-u;
				v = 1-v;
			}
			// Add the dart if valid
			var dart = {x: dt.x+u*vax+v*vbx, y: dt.y+u*vay+v*vby};
			if (check(dart, cell, true)) {
				cell.point = dart;
				points.push(dart);
				hit[index] = true;
				misses = 0;
			}
			else if (++misses > 100 && i > min)
				break;
		}
	}
	
	console.log("Poisson Disk: "+points.length+" points in "+(new Date()-start)/1000+"s");
	return points;
	
	// d: {x, y} center of a circle of radius radius
	// c: cell object (with c.point == null)
	// b: (optional) boolean if set to true, then d is known to be inside the domain (avoids checking)
	// returns: if d is in the domain and isn't too close to any points in the neighboring 24 cells (although 4 of the cells do not need to be checked)
	function check(d, c, b) {
		if (!b && c.edges.length > 0 && !inside(d))
			return false;
		var i, j, t;
		for (i = -2; i < 3; ++i)
			for (j = -2; j < 3; ++j) {
				if (i == 0 && j == 0)
					continue;
				t = cellGrid[(c.y+i)*cols+c.x+j];
				if (typeof t == "undefined" || !(t = t.point))
					continue;
				if (!close(d, t))
					return false;
			}
		return true;
	}
	// d: {x, y}
	// return: whether d is in the domain, or lies on an edge
	// uses the even/odd rule to check domain interior, then uses cross products to check edges
	function inside(d) {
		var o = false, l = domain.length, p = domain[l-1], v, i;
		for (i = 0; v = domain[i], i < l; p = v, ++i)
			if ((d.y > v.y && d.y <= p.y || d.y > p.y && d.y <= v.y) && (d.y-p.y)*(v.x-p.x)/(v.y-p.y)+p.x > d.x)
				o = !o;
		if (o)
			return true;
		p = domain[l-1];
		for (i = 0; v = domain[i], i < l; p = v, ++i)
			if (cross(d, p, v) == 0 && (d.x >= p.x && d.x <= v.x || d.x >= v.x && d.x <= p.x) && (d.y >= p.y && d.y <= v.y || d.y >= v.y && d.y <= p.y))
				return true;
		return false;
	}
	// d: array of {x, y}
	// returns: signed area of d
	// uses the shoelace method
	function area(d) {
		var a = 0, l = d.length, p = d[l-1], v, i;
		for (i = 0, v = d[i]; i < l; p = v, ++i)
			a += p.x*v.y-p.y*v.x;
		return a;
	}
	// returns the sign of PE cross PF
	function cross(p, e, f) {
		var c = (e.x-p.x)*(f.y-p.y)-(e.y-p.y)*(f.x-p.x);
		return c > 0 ? 1 : c < 0 ? -1 : 0;
	}
	// returns if the distance from p to d is > radius
	function close(p, d) {
		var x = d.x-p.x, y = d.y-p.y;
		return Math.sqrt(x*x+y*y) > radius;
	}
	// a: {x, y} should be inside d
	// b: {x, y} should be outside d
	// d: {x, y} center of a circle of radius radius
	// returns {x, y} intersection of AB with the circle D
	// let f(t) = a + t*(b - a) for 0 < t < 1. Then |f(t) - d|^2 = r^2 and solve for t. The equation for t is a quadratic where A, B, C are calculated below,
	// then put it into the quadratic equation. Disregard the (-b-sqrt(b^2-4ac))/2a.
	function diskSegment(a, b, d) {
		var x = b.x-a.x, y = b.y-a.y, A = x*x+y*y, B = 2*(-a.x*a.x+a.x*b.x+a.x*d.x-b.x*d.x-a.y*a.y+a.y*b.y+a.y*d.y-b.y*d.y), t = (-B+Math.sqrt(B*B-4*A*((a.x-d.x)*(a.x-d.x)+(a.y-d.y)*(a.y-d.y)-rad2)))/2/A;
		return {x: a.x+t*x, y: a.y+t*y};
	}
	// a: sorted array
	// returns: random index where the probability of being chosen is proportional to a[i]-a[i-1]
	// uses a binary search
	function rand(a) {
		var l = a.length-1, o = Math.random()*a[l], n = 0, m = l, d;
		while (m-n > 1) {
			d = m+n>>1;
			if (o < a[d])
				m = d;
			else
				n = d;
		}
		return n;
	}
	// a: sorted array
	// o: object to look for
	// returns: index of o in a, -1 if not found
	// uses a binary search
	function search(a, o) {
		var n = 0, m = a.length-1, d, e;
		while (n <= m) {
			d = n+m>>1, e = a[d];
			if (e < o)
				n = d+1;
			else if (e > o)
				m = d-1;
			else
				return d;
		}
		return -1;
	}
}