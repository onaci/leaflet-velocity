(function (root, factory) {
	if (typeof exports === 'object') {

		// CommonJS
		module.exports = factory(require('leaflet-velocity'));

	} else if (typeof define === 'function' && define.amd) {
		// AMD
		define(['leaflet-velocity'], function (LeafletVelocity) {
			return (root.returnExportsGlobal = factory(window));
		});
	} else {
		// Global Variables
		window.LeafletVelocity = factory(window);
	}
}(this, function (window) {

	'use strict';

	var LeafletVelocity = {

		_map: null,
		_data: null,
		_options: null,
		_canvasLayer: null,
		_windy: null,
		_context: null,
		_timer: 0,
		_mouseControl: null,
		
		init: function (options) {
			
			// don't bother setting up if the service is unavailable
			LeafletVelocity._checkWind(options).then(function() {

				// set properties
				LeafletVelocity._map = options.map;
				LeafletVelocity._options = options;

				// create canvas, add overlay control
				LeafletVelocity._canvasLayer = L.canvasLayer().delegate(LeafletVelocity);
				LeafletVelocity._options.layerControl.addOverlay(LeafletVelocity._canvasLayer, 'wind');

				// ensure clean up on deselect overlay
				LeafletVelocity._map.on('overlayremove', function (e) {
					if (e.layer == LeafletVelocity._canvasLayer) {
						LeafletVelocity._destroyWind();
					}
				});

			}).catch(function(err) {
				console.log('err');
				LeafletVelocity._options.errorCallback(err);
			});

		},

		setTime: function (timeIso) {
			LeafletVelocity._options.timeISO = timeIso;
		},

		/*------------------------------------ PRIVATE ------------------------------------------*/

		/**
		 * Ping the test endpoint to check if wind server is available
		 *
		 * @param options
		 * @returns {Promise}
		 */
		_checkWind: function (options) {

			return new Promise(function (resolve, reject) {

				if (options.localMode) resolve(true);

				$.ajax({
					type: 'GET',
					url: options.pingUrl,
					error: function error(err) {
						reject(err);
					},
					success: function success(data) {
						resolve(data);
					}
				});
			});
		},

		_getRequestUrl: function() {

			if(!this._options.useNearest) {
				return this._options.latestUrl;
			}

			var params = {
				"timeIso": this._options.timeISO || new Date().toISOString(),
				"searchLimit": this._options.nearestDaysLimit || 7 // don't show data out by more than limit
			};

			return this._options.nearestUrl + '?' + $.param(params);
		},

		_loadLocalData: function() {

			console.log('using local data..');

			$.getJSON('velocity.json', function (data) {
				LeafletVelocity._data = data;
				LeafletVelocity._initWindy(data);
			});
		},

		_loadWindData: function() {

			if(this._options.localMode) {
				this._loadLocalData();
				return;
			}

			var request = this._getRequestUrl();
			console.log(request);

			$.ajax({
				type: 'GET',
				url: request,
				error: function error(err) {
					console.log('error loading data');
					LeafletVelocity._options.errorCallback(err) || console.log(err);
					LeafletVelocity._loadLocalData();
				},
				success: function success(data) {
					LeafletVelocity._data = data;
					LeafletVelocity._initWindy(data);
				}
			});
		},

		onDrawLayer: function(overlay, params) {

			if (!LeafletVelocity._windy) {
				LeafletVelocity._loadWindData();
				return;
			}

			if (this._timer) clearTimeout(LeafletVelocity._timer);

			this._timer = setTimeout(function () {

				var bounds = LeafletVelocity._map.getBounds();
				var size = LeafletVelocity._map.getSize();

				// bounds, width, height, extent
				LeafletVelocity._windy.start(
					[
						[0, 0],
						[size.x, size.y]
					],
					size.x,
					size.y,
					[
						[bounds._southWest.lng, bounds._southWest.lat],
						[bounds._northEast.lng, bounds._northEast.lat]
					]);
			}, 750); // showing wind is delayed
		},


		_initWindy: function(data) {

			// windy object
			this._windy = new Windy({ canvas: LeafletVelocity._canvasLayer._canvas, data: data });

			// prepare context global var, start drawing
			this._context = this._canvasLayer._canvas.getContext('2d');
			this._canvasLayer._canvas.classList.add("velocity-overlay");
			this.onDrawLayer();

			this._map.on('dragstart', LeafletVelocity._windy.stop);
			this._map.on('zoomstart', LeafletVelocity._clearWind);
			this._map.on('resize', LeafletVelocity._clearWind);

			this._initMouseHandler();
		},

		_initMouseHandler: function() {
			if (!this._mouseControl && this._options.displayValues) {
				var options = this._options.displayOptions || {};
				options['leafletVelocity'] = LeafletVelocity;
				this._mouseControl = L.control.velocityPosition(options).addTo(this._map);
			}
		},

		_clearWind: function() {
			if (this._windy) this._windy.stop();
			if (this._context) this._context.clearRect(0, 0, 3000, 3000);
		},

		_destroyWind: function() {
			if (this._timer) clearTimeout(this._timer);
			if (this._windy) this._windy.stop();
			if (this._context) this._context.clearRect(0, 0, 3000, 3000);
			if (this._mouseControl) this._map.removeControl(this._mouseControl);
			this._mouseControl = null;
			this._windy = null;
			this._map.removeLayer(this._canvasLayer);
		}
		
	};

	return LeafletVelocity;

}));