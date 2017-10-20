# leaflet-velocity [![NPM version][npm-image]][npm-url] [![NPM Downloads][npm-downloads-image]][npm-url]
A plugin for Leaflet (v1.0.3, and v0.7.7) to create a canvas visualisation layer for direction and intensity of arbitrary velocities (e.g. wind, ocean current).

Live Demo: https://danwild.github.io/leaflet-velocity/

- Uses a modified version of [WindJS](https://github.com/Esri/wind-js) for core functionality.
- Similar to [wind-js-leaflet](https://github.com/danwild/wind-js-leaflet), however much more versatile (provides a generic leaflet layer, and not restricted to wind).
- Data input format is the same as output by [wind-js-server](https://github.com/danwild/wind-js-server), using [grib2json](https://github.com/cambecc/grib2json).

![Screenshot](/screenshots/velocity.gif?raw=true)

## Example use:
```javascript
var velocityLayer = L.velocityLayer({
	
	displayValues: true,
	displayOptions: {
		velocityType: 'Global Wind',
		position: 'bottomleft',
		emptyString: 'No velocity data',
		angleConvention: 'bearingCW',
		displayPosition: 'bottomleft',
		displayEmptyString: 'No velocity data',
		speedUnit: 'kt'
	},
	data: data,             // see demo/*.json, or wind-js-server for example data service
	
	// OPTIONAL
	minVelocity: 0,          // used to align color scale
	maxVelocity: 10,         // used to align color scale
	velocityScale: 0.005,    // modifier for particle animations, arbitrarily defaults to 0.005
	colorScale: []          // define your own array of hex/rgb colors
});
```
The angle convention option refers to the convention used to express the wind direction as an angle from north direction in the control.
It can be any combination of `bearing` (angle toward which the flow goes) or `meteo` (angle from which the flow comes),
and `CW` (angle value increases clock-wise) or `CCW` (angle value increases counter clock-wise). If not given defaults to `bearingCCW`.

The speed unit option refers to the unit used to express the wind speed in the control.
It can be `m/s` for meter per second, `k/h` for kilometer per hour or `kt` for knots. If not given defaults to `m/s`.

## Reference
`leaflet-velocity` is possible because of things like:
- [L.CanvasOverlay.js](https://gist.github.com/Sumbera/11114288)
- [WindJS](https://github.com/Esri/wind-js)
- [earth](https://github.com/cambecc/earth)

## Example data
Data shown for the Great Barrier Reef has been derived from [CSIRO's eReefs products](https://research.csiro.au/ereefs/)

## License
MIT License (MIT)

[npm-image]: https://badge.fury.io/js/leaflet-velocity.svg
[npm-url]: https://www.npmjs.com/package/leaflet-velocity
[npm-downloads-image]: https://img.shields.io/npm/dt/leaflet-velocity.svg