# leaflet-velocity [![NPM version][npm-image]][npm-url]
A plugin for Leaflet (v1.0.3, and v0.7.7) to create a canvas visualisation layer for direction and intensity of arbitrary velocities (e.g. wind, ocean current).

- Uses a modified version of [WindJS](https://github.com/Esri/wind-js) for core functionality.
- Similar to [wind-js-leaflet](https://github.com/danwild/wind-js-leaflet), much much more versatile (provides a generic leaflet layer, and not restricted to wind).
- Data input format is the same as output by [grib2json](https://github.com/cambecc/grib2json).

![Screenshot](/screenshots/velocity.gif?raw=true)

## Example use:
```javascript
var velocityLayer = L.velocityLayer({
	displayValues: true,
	displayOptions: {
		displayPosition: 'bottomleft',
		displayEmptyString: 'No velocity data'
	},
	data: data, // see demo/velocity.json,
	maxVelocity: 10 // used to align color scale, i.e. ocean currents typically lower than wind velocity
});
```

## Reference
`leaflet-velocity` is possible because of things like:
- [L.CanvasOverlay.js](https://gist.github.com/Sumbera/11114288)
- [WindJS](https://github.com/Esri/wind-js)
- [earth](https://github.com/cambecc/earth)

## License
MIT License (MIT)

[npm-image]: https://badge.fury.io/js/leaflet-velocity.svg
[npm-url]: https://www.npmjs.com/package/leaflet-velocity