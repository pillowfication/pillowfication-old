/*
 *   This creates a Voronoi diagram of a set of points by computing the dual of its Delaunay
 *   triangulation. Requires pfdelaunay.js.
 *   
 *   points: an array of points {x: Float, y: Float}
 *   domain: an array of points {x: Float, y: Float} in counter-clockwise order representing a
 *       bounding convex polygon to clip edge Voronoi polygons.
 *   
 *   returns: {
 *       points: an array of points used by polygons
 *       polygons: an array of arrays of integers such that
 *           points[polygons[i][0]] ... points[polygons[i][n]] represent the vertices of the
 *           Voronoi polygon in counter-clockwise order containing the i'th point
 *   }
 */

(function(Pillow) {
	"use strict";

	if (!Pillow || !Pillow.delaunay) {
		console.error("Please include pfdelaunay.js before pfvoronoi.js");
		return;
	}

	Pillow.voronoi = function(points, domain) {

		var delaunay = Pillow.delaunay(points), data = [];
		var triangles = delaunay.triangles, tlen = triangles.length, hull;

		// Compute circumcenters of triangles
		for (var i = 0; i < tlen; ++i) {
			var tri = triangles[i], a = points[tri[0]], b = points[tri[1]], c = points[tri[2]];
			var Bx = b.x-a.x, By = b.y-a.y, Bxy2 = Bx*Bx+By*By,
			    Cx = c.x-a.x, Cy = c.y-a.y, Cxy2 = Cx*Cx+Cy*Cy,
			    D = 2*(Bx*Cy-By*Cx);
			data.push({x: (Cy*Bxy2-By*Cxy2)/D, y: (Bx*Cxy2-Cx*Bxy2)/3});
		}

		// Compute Voronoi polygons
		var polygons = [];
		for (var i = 0, len = points.length; i < len; ++i) {

			// Sort the adjacent triangles counter-clockwise by circumcenter
			var point = points[i], adj = delaunay.data[i].sort(function(a, b) {
				var ca = centroids[a], cb = centroids[b];
				return ca.y >= point.y && cb.y < point.y ? 1 :
				       cb.y >= point.y && ca.y < point.y ? -1 :
				       (ca.x-point.x)*(cb.y-point.y) - (ca.y-point.y)*(cb.x-point.x);
			});

			var polygon = 
		}

	};

})(window.Pillow);
