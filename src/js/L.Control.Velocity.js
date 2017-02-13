L.Control.Velocity = L.Control.extend({

    options: {
        position: 'bottomleft',
        emptyString: 'Unavailable'
    },

    onAdd: function (map) {
        this._container = L.DomUtil.create('div', 'leaflet-control-velocity');
        L.DomEvent.disableClickPropagation(this._container);
        map.on('mousemove', this._onMouseMove, this);
        this._container.innerHTML=this.options.emptyString;
        return this._container;
    },

    onRemove: function (map) {
        map.off('mousemove', this._onMouseMove, this)
    },

    vectorToSpeed: function(uMs, vMs){
        var velocityAbs = Math.sqrt( Math.pow(uMs, 2) + Math.pow(vMs, 2) );
        return velocityAbs;
    },

    vectorToDegrees: function(uMs, vMs){
        var velocityAbs = Math.sqrt( Math.pow(uMs, 2) + Math.pow(vMs, 2) );
        var velocityDirTrigTo = Math.atan2(uMs/velocityAbs, vMs/velocityAbs);
        var velocityDirTrigToDegrees = velocityDirTrigTo * 180/Math.PI;
        var velocityDirTrigFromDegrees = velocityDirTrigToDegrees + 180;
        return velocityDirTrigFromDegrees.toFixed(3);
    },

    _onMouseMove: function (e) {

        var self = this;
	    var pos = this.options.leafletVelocity._map.containerPointToLatLng(L.point(e.containerPoint.x, e.containerPoint.y));
	    var gridValue = this.options.leafletVelocity._windy.interpolatePoint(pos.lng, pos.lat);
	    var htmlOut = "";

	    if(gridValue && !isNaN(gridValue[0]) && !isNaN(gridValue[1]) && gridValue[2]){

		    // vMs comes out upside-down..
		    var vMs = gridValue[1];
		    vMs = (vMs > 0) ? vMs = vMs - (vMs * 2) : Math.abs(vMs);

		    htmlOut =
			    "<strong>Velocity Direction: </strong>"+  self.vectorToDegrees(gridValue[0], vMs) + "°" +
			    ", <strong>Velocity Speed: </strong>" + self.vectorToSpeed(gridValue[0],vMs).toFixed(1) + "m/s";
	    }
	    else {
		    htmlOut = "no velocity data";
	    }

	    self._container.innerHTML = htmlOut;

        // move control to bottom row
        if($('.leaflet-control-velocity').index() == 0){
            $('.leaflet-control-velocity').insertAfter('.leaflet-control-mouseposition');
        }

    }

});

L.Map.mergeOptions({
    positionControl: false
});

L.Map.addInitHook(function () {
    if (this.options.positionControl) {
        this.positionControl = new L.Control.MousePosition();
        this.addControl(this.positionControl);
    }
});

L.control.velocity = function (options) {
    return new L.Control.Velocity(options);
};
