/*
 *   This returns a Perlin noise object to grab values from.
 *   
 *   options: {
 *       dimensions:    Number of dimensions,
 *       min:           Minimum value to return,
 *       max:           Maximum value to return,
 *       wavelength:    Size of the first octave,
 *       octaves:       Number of octaves,
 *       octave_scale:  Scale of each successive octave,
 *       persistence:   Weight of each successive octave,
 *       interpolation: Interpolation function to use
 *   }
 *   
 *   returns: {
 *       get: function(x...) Returns the value at the location [x0, x1, ..., xn]. Accepts both
 *           arrays and var-args.
 *   }
 */

(function(Pillow) {
	"use strict";

	function defaults(options) {
		var defaults = {
			dimensions: 2,
			min: 0,
			max: 1,
			wavelength: 1,
			octaves: 8,
			octave_scale: 2,
			persistence: .5,
			interpolation: Pillow.interpolation.cosine
		};
		for (var prop in options)
			defaults[prop] = options[prop];

		// amp = sum_{i=1}^{oct} per^{i-1} = (per^oct-1)/(per-1)
		// val = (val/amp)*(max-min)+min = val*factor+min
		// factor = (max-min)*(per-1)/(per^oct-1)
		defaults.factor = (defaults.max-defaults.min)*(defaults.persistence-1)/(Math.pow(defaults.persistence, defaults.octaves)-1);

		return defaults;
	}

	Pillow.perlin = function(options) {

		if (!options || !options.dimensions || options.dimensions == 2)
			return Pillow.perlin2D(options);

		options = defaults(options);

		var data = [];
		var dim = options.dimensions,
		    dim2 = 1 << dim,
		    len = dim-1,
		    min = options.min,
		    lam = options.wavelength,
		    oct = options.octaves,
		    sca = options.octave_scale,
		    per = options.persistence,
		    int = options.interpolation,
		    fac = options.factor;

		// Get the [0, 1) value at coordinates x
		function _get(x) {

			// Calculate grid coordinates and dx values
			var _x = [], dx =[];
			for (var i = 0; i < dim; ++i) {
				_x.push(Math.floor(x[i]));
				dx.push(x[i]-_x[i]);
			}

			// Store hypercube-corner values in values
			var values = [], temp = [];
			for (var i = 0; i < dim2; ++i) {
				for (var j = 0; j < dim; ++j)
					temp[j] = _x[j]+(i >> j & 1);
				values.push(_data(temp));
			}

			// Repeatedly interpolate along axes
			for (var i = 0; i < dim; ++i)
				for (var j = 0; j < dim2 >> i; j += 2)
					values[j >> 1] = int(values[j], values[j+1], dx[i]);

			return values[0];

		}

		// Lazily get the grid value at coordinates x
		function _data(x) {
			var d = data;
			for (var i = 0; i < len; ++i)
				d = d[x[i]] || (d[x[i]] = []);
			return d[x[len]] || (d[x[len]] = Math.random());
		}

		return {
			get: function(x) {

				// Scale coordinates by wavelength
				var coord = x.constructor === Array ? x : arguments;
				for (var i = 0; i < dim; ++i)
					coord[i] /= lam;

				// Repeatedly add values from each octave
				var _coord = [], value = 0, _sca = 1, _per = 1;
				for (var i = 0; i < oct; ++i) {
					for (var j = 0; j < dim; ++j)
						_coord[j] = coord[j]*_sca;
					value += _get(_coord)*_per;
					_sca *= sca;
					_per *= per;
				}

				return value*fac+min;

			}
		};

	};

	Pillow.perlin2D = function(options) {

		options = defaults(options);

		var data = [];
		var min = options.min,
		    lam = options.wavelength,
		    oct = options.octaves,
		    sca = options.octave_scale,
		    per = options.persistence,
		    int = options.interpolation,
		    fac = options.factor;

		// Get the [0, 1) value at coordinates x
		function _get(x, y) {
			var _x = Math.floor(x), _y = Math.floor(y), dx = x-_x;
			return int(
				int(_data(_x, _y  ), _data(_x+1, _y  ), dx),
				int(_data(_x, _y+1), _data(_x+1, _y+1), dx),
				y-_y
			);
		}

		// Lazily get the grid value at coordinates x
		function _data(x, y) {
			x = data[x] || (data[x] = []);
			return x[y] || (x[y] = Math.random());
		}

		return {
			get: function(x, y) {

				// Scale coordinates by wavelength
				if (x.constructor === Array) {
					y = x[1] / lam;
					x = x[0] / lam;
				} else {
					x /= lam;
					y /= lam;
				}

				// Repeatedly add values from each octave
				var value = 0, _sca = 1, _per = 1;
				for (var i = 0; i < oct; ++i) {
					value += _get(x*_sca, y*_sca)*_per;
					_sca *= sca;
					_per *= per;
				}

				return value*fac+min;

			}
		};

	};

	// Some interpolation functions
	Pillow.interpolation = (Pillow.interpolation || {});
	Pillow.interpolation.none = function(a, b, t) {
		return a;
	};
	Pillow.interpolation.nearest = function(a, b, t) {
		return t < .5 ? a : b;
	};
	Pillow.interpolation.linear = function(a, b, t) {
		return t*(b-a)+a;
	};
	Pillow.interpolation.cosine = function(a, b, t) {
		return (1-Math.cos(Math.PI*t))*(b-a)/2+a;
	};

})(window.Pillow = window.Pillow || {});
