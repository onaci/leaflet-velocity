L.VelocityLayer = (L.Layer ? L.Layer : L.Class).extend({
  options: {
    displayValues: true,
    displayOptions: {
      velocityType: "Velocity",
      position: "bottomleft",
      emptyString: "No velocity data"
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
    // determine where to add the layer
    this._paneName = this.options.paneName || "overlayPane";

    // fall back to overlayPane for leaflet < 1
    let pane = map._panes.overlayPane;
    if (map.getPane) {
      // attempt to get pane first to preserve parent (createPane voids this)
      pane = map.getPane(this._paneName);
      if (!pane) {
        pane = map.createPane(this._paneName);
      }
    }
    // create canvas, add to map pane
    this._canvasLayer = L.canvasLayer({ pane: pane }).delegate(this);
    this._canvasLayer.addTo(map);

    this._map = map;
  },

  onRemove: function(map) {
    this._destroyWind();
  },

  setData: function(data) {
    this.options.data = data;
    if (this._windy) {
      this._windy.setData(data);
      this._clearAndRestart();
    }
    this.fire("load");
  },

  setOpacity: function(opacity) {
    console.log("this._canvasLayer", this._canvasLayer);
    this._canvasLayer.setOpacity(opacity);
  },

  setOptions: function(options) {
    this.options = Object.assign(this.options, options);
    if (options.hasOwnProperty("displayOptions")) {
      this.options.displayOptions = Object.assign(
        this.options.displayOptions,
        options.displayOptions
      );
      this._initMouseHandler(true);
    }
    if (options.hasOwnProperty("data")) this.options.data = options.data;
    if (this._windy) {
      this._windy.setOptions(options);
      if (options.hasOwnProperty("data")) this._windy.setData(options.data);
      this._clearAndRestart();
    }

    this.fire("load");
  },

  /*------------------------------------ PRIVATE ------------------------------------------*/

  onDrawLayer: function(overlay, params) {
    var self = this;

    if (!this._windy) {
      this._initWindy(this);
      return;
    }

    if (!this.options.data) {
      return;
    }

    if (this._timer) clearTimeout(self._timer);

    this._timer = setTimeout(function() {
      self._startWindy();
    }, 750); // showing velocity is delayed
  },

  _startWindy: function() {
    var bounds = this._map.getBounds();
    var size = this._map.getSize();

    // bounds, width, height, extent
    this._windy.start(
      [
        [0, 0],
        [size.x, size.y]
      ],
      size.x,
      size.y,
      [
        [bounds._southWest.lng, bounds._southWest.lat],
        [bounds._northEast.lng, bounds._northEast.lat]
      ]
    );
  },

  _initWindy: function(self) {
    // windy object, copy options
    const options = Object.assign(
      { canvas: self._canvasLayer._canvas, map: this._map },
      self.options
    );
    this._windy = new Windy(options);

    // prepare context global var, start drawing
    this._context = this._canvasLayer._canvas.getContext("2d");
    this._canvasLayer._canvas.classList.add("velocity-overlay");
    this.onDrawLayer();

    this._map.on("dragstart", self._windy.stop);
    this._map.on("dragend", self._clearAndRestart);
    this._map.on("zoomstart", self._windy.stop);
    this._map.on("zoomend", self._clearAndRestart);
    this._map.on("resize", self._clearWind);

    this._initMouseHandler(false);
  },

  _initMouseHandler: function(voidPrevious) {
    if (voidPrevious) {
      this._map.removeControl(this._mouseControl);
      this._mouseControl = false;
    }
    if (!this._mouseControl && this.options.displayValues) {
      var options = this.options.displayOptions || {};
      options["leafletVelocity"] = this;
      this._mouseControl = L.control.velocity(options).addTo(this._map);
    }
  },

  _clearAndRestart: function() {
    if (this._context) this._context.clearRect(0, 0, 3000, 3000);
    if (this._windy) this._startWindy();
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
