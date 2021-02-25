L.Control.Velocity = L.Control.extend({
  options: {
    position: "bottomleft",
    emptyString: "Unavailable",
    // Could be any combination of 'bearing' (angle toward which the flow goes) or 'meteo' (angle from which the flow comes)
    // and 'CW' (angle value increases clock-wise) or 'CCW' (angle value increases counter clock-wise)
    angleConvention: "bearingCCW",
    showCardinal: false,
    // Could be 'm/s' for meter per second, 'k/h' for kilometer per hour or 'kt' for knots
    speedUnit: "m/s",
    directionString: "Direction",
    speedString: "Speed",
    onAdd: null,
    onRemove: null
  },

  onAdd: function(map) {
    this._container = L.DomUtil.create("div", "leaflet-control-velocity");
    L.DomEvent.disableClickPropagation(this._container);
    map.on("mousemove", this._onMouseMove, this);
    this._container.innerHTML = this.options.emptyString;
    if (this.options.leafletVelocity.options.onAdd)
      this.options.leafletVelocity.options.onAdd();
    return this._container;
  },

  onRemove: function(map) {
    map.off("mousemove", this._onMouseMove, this);
    if (this.options.leafletVelocity.options.onRemove)
      this.options.leafletVelocity.options.onRemove();
  },

  vectorToSpeed: function(uMs, vMs, unit) {
    var velocityAbs = Math.sqrt(Math.pow(uMs, 2) + Math.pow(vMs, 2));
    // Default is m/s
    if (unit === "k/h") {
      return this.meterSec2kilometerHour(velocityAbs);
    } else if (unit === "kt") {
      return this.meterSec2Knots(velocityAbs);
    } else {
      return velocityAbs;
    }
  },

  vectorToDegrees: function(uMs, vMs, angleConvention) {
    // Default angle convention is CW
    if (angleConvention.endsWith("CCW")) {
      // vMs comes out upside-down..
      vMs = vMs > 0 ? (vMs = -vMs) : Math.abs(vMs);
    }
    var velocityAbs = Math.sqrt(Math.pow(uMs, 2) + Math.pow(vMs, 2));

    var velocityDir = Math.atan2(uMs / velocityAbs, vMs / velocityAbs);
    var velocityDirToDegrees = (velocityDir * 180) / Math.PI + 180;

    if (angleConvention === "bearingCW" || angleConvention === "meteoCCW") {
      velocityDirToDegrees += 180;
      if (velocityDirToDegrees >= 360) velocityDirToDegrees -= 360;
    }

    return velocityDirToDegrees;
  },

  degreesToCardinalDirection: function(deg) {
    
    let cardinalDirection = ''
    if (deg >= 0 && deg < 11.25 || deg >= 348.75) {
      cardinalDirection = 'N'
    }
    else if (deg >= 11.25 && deg < 33.75){
      cardinalDirection = 'NNW'
    }
    else if (deg >= 33.75 && deg < 56.25){
      cardinalDirection = 'NW'
    }
    else if (deg >= 56.25 && deg < 78.75){
      cardinalDirection = 'WNW'
    }
    else if (deg >= 78.25 && deg < 101.25){
      cardinalDirection = 'W'
    }
    else if (deg >= 101.25 && deg < 123.75){
      cardinalDirection = 'WSW'
    }
    else if (deg >= 123.75 && deg < 146.25){
      cardinalDirection = 'SW'
    }
    else if (deg >= 146.25 && deg < 168.75){
      cardinalDirection = 'SSW'
    }
    else if (deg >= 168.75 && deg < 191.25){
      cardinalDirection = 'S'
    }
    else if (deg >= 191.25 && deg < 213.75){
      cardinalDirection = 'SSE'
    }
    else if (deg >= 213.75 && deg < 236.25){
      cardinalDirection = 'SE'
    }
    else if (deg >= 236.25 && deg < 258.75){
      cardinalDirection = 'ESE'
    }
    else if (deg >= 258.75 && deg < 281.25){
      cardinalDirection = 'E'
    }
    else if (deg >= 281.25 && deg < 303.75){
      cardinalDirection = 'ENE'
    }
    else if (deg >= 303.75 && deg < 326.25){
      cardinalDirection = 'NE'
    }
    else if (deg >= 326.25 && deg < 348.75){
      cardinalDirection = 'NNE'
    }

    return cardinalDirection;
  },

  meterSec2Knots: function(meters) {
    return meters / 0.514;
  },

  meterSec2kilometerHour: function(meters) {
    return meters * 3.6;
  },

  _onMouseMove: function(e) {
    var self = this;
    var pos = this.options.leafletVelocity._map.containerPointToLatLng(
      L.point(e.containerPoint.x, e.containerPoint.y)
    );
    var gridValue = this.options.leafletVelocity._windy.interpolatePoint(
      pos.lng,
      pos.lat
    );
    var htmlOut = "";

    if (
      gridValue &&
      !isNaN(gridValue[0]) &&
      !isNaN(gridValue[1]) &&
      gridValue[2]
    ) {
    var deg = self.vectorToDegrees(gridValue[0], gridValue[1], this.options.angleConvention);
    var cardinal = this.options.showCardinal ? ` (${self.degreesToCardinalDirection(deg)}) ` : '';

		htmlOut = `<strong> ${this.options.velocityType} ${
			this.options.directionString
		}: </strong> ${deg.toFixed(2)}°${cardinal}, <strong> ${this.options.velocityType} ${
			this.options.speedString
		}: </strong> ${self
			.vectorToSpeed(gridValue[0], gridValue[1], this.options.speedUnit)
			.toFixed(2)} ${this.options.speedUnit}`;
    } else {
      htmlOut = this.options.emptyString;
    }

    self._container.innerHTML = htmlOut;
  }
});

L.Map.mergeOptions({
  positionControl: false
});

L.Map.addInitHook(function() {
  if (this.options.positionControl) {
    this.positionControl = new L.Control.MousePosition();
    this.addControl(this.positionControl);
  }
});

L.control.velocity = function(options) {
  return new L.Control.Velocity(options);
};
