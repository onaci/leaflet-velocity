# leaflet-velocity [![NPM version][npm-image]][npm-url]
A plugin for Leaflet (v1.0.3, and v0.7.7) to add visualisation overlay for direction and intensity of arbitrary velocities (e.g. wind, ocean current).

- Uses a modified version of [WindJS](https://github.com/Esri/wind-js) for core functionality.
- Very similar to [wind-js-leaflet](https://github.com/danwild/wind-js-leaflet), however not restricted to wind.
- Data input format is the same as output by [grib2json](https://github.com/cambecc/grib2json).

![Screenshot](/screenshots/velocity.gif?raw=true)

## Example use:
```javascript
LeafletVelocity.init({
	map: map, // ref to your leaflet map
	layerControl: layerControl, // ref to your leaflet layer control
	displayValues: true, // show values on hover
	displayOptions: {
		displayPosition: 'bottomleft',
		displayEmptyString: 'No velocity data'
	},
	overlayName: 'velocity', // label for overlay control
	data: data // see demo/velocity.json
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