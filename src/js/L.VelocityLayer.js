L.VelocityLayer = (L.Layer ? L.Layer : L.Class).extend({

	options: {
		displayValues: true,
		displayOptions: {
			velocityType: 'Velocity',
			displayPosition: 'bottomleft',
			displayEmptyString: 'No velocity data'
		},
		maxVelocity: 10, // used to align color scale
		colorScale: null,
		data: null
	},

	_map: null,
	_canvasLayer: null,
	_windy: null,
	_context: null,
	_timer: 0,
	_mouseControl: null,

	initialize: function(options) {
		L.setOptions(this, options);
	},

	onAdd: function(map) {
		// create canvas, add overlay control
		this._canvasLayer = L.canvasLayer().delegate(this);
		this._canvasLayer.addTo(map);
		this._map = map;
	},

	onRemove: function(map) {
		this._destroyWind();
	},

	/*------------------------------------ PRIVATE ------------------------------------------*/

	onDrawLayer: function(overlay, params) {

		var self = this;

		if (!this._windy) {
			this._initWindy(this);
			return;
		}

		if (this._timer) clearTimeout(self._timer);

		this._timer = setTimeout(function () {

			var bounds = self._map.getBounds();
			var size = self._map.getSize();

			// bounds, width, height, extent
			self._windy.start(
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
		}, 750); // showing velocity is delayed
	},


	_initWindy: function(self) {

		// windy object
		this._windy = new Windy({
			canvas: self._canvasLayer._canvas,
			data: self.options.data,
			minVelocity: self.options.minVelocity || 0,
			maxVelocity: self.options.maxVelocity || 10,
			colorScale: self.options.colorScale || null
		});

		// prepare context global var, start drawing
		this._context = this._canvasLayer._canvas.getContext('2d');
		this._canvasLayer._canvas.classList.add("velocity-overlay");
		this.onDrawLayer();

		this._map.on('dragstart', self._windy.stop);
		this._map.on('dragend', self._clearAndRestart);
		this._map.on('zoomstart', self._windy.stop);
		this._map.on('zoomend', self._clearAndRestart);
		this._map.on('resize', self._clearWind);

		this._initMouseHandler();
	},

	_initMouseHandler: function() {
		if (!this._mouseControl && this.options.displayValues) {
			var options = this.options.displayOptions || {};
			options['leafletVelocity'] = this;
			this._mouseControl = L.control.velocity(options).addTo(this._map);
		}
	},

	_clearAndRestart: function(){
		if (this._context) this._context.clearRect(0, 0, 3000, 3000);
		if(this._windy) this._windy.start;
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
});

L.velocityLayer = function(options) {
	return new L.VelocityLayer(options);
};